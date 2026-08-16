// Pre-build data pipeline for the AI Intelligence Radar site.
// Reads the knowledge base (events/, daily/, trends/, index/, state.json)
// and writes flattened JSON into src/data/generated/ for Astro pages.
// The knowledge base itself is never modified — the site is a read-only projection.

import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = path.resolve(ROOT, 'site/src/data/generated');

marked.setOptions({ gfm: true, breaks: false });

function renderMarkdown(md) {
  const html = marked.parse(md);
  // External links open in a new tab; keep internal anchors untouched.
  return html.replace(/<a href="https?:/g, '<a target="_blank" rel="noopener" href="');
}

async function readJson(file) {
  return JSON.parse(await readFile(file, 'utf8'));
}

async function readDirJson(dir) {
  const names = (await readdir(dir)).filter((n) => n.endsWith('.json')).sort();
  const out = [];
  for (const name of names) {
    out.push({ name, data: await readJson(path.join(dir, name)) });
  }
  return out;
}

/* ---------- events ---------- */

function publishedDate(e) {
  const raw = String(e.published_at || '');
  return /^\d{4}-\d{2}-\d{2}/.test(raw) ? raw.slice(0, 10) : e._fileDate;
}

async function loadEvents() {
  const files = await readDirJson(path.join(ROOT, 'events'));
  const events = [];
  for (const { data } of files) {
    for (const e of data.events || []) {
      events.push({
        ...e,
        date: e.date || data.date,
        published_date: publishedDate(e),
      });
    }
  }
  events.sort((a, b) =>
    String(b.published_date).localeCompare(String(a.published_date)) ||
    String(b.published_at || '').localeCompare(String(a.published_at || ''))
  );
  return events;
}

function buildAggregates(events) {
  const byCategory = {};
  const byOrg = {};
  const byTag = {};
  const byDay = {};
  const byRecommendation = {};
  for (const e of events) {
    byCategory[e.category] = (byCategory[e.category] || 0) + 1;
    for (const org of e.organization || []) byOrg[org] = (byOrg[org] || 0) + 1;
    for (const t of e.tags || []) byTag[t] = (byTag[t] || 0) + 1;
    byDay[e.published_date] = (byDay[e.published_date] || 0) + 1;
    if (e.recommendation) byRecommendation[e.recommendation] = (byRecommendation[e.recommendation] || 0) + 1;
  }
  const orgs = Object.entries(byOrg).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  const days = Object.keys(byDay).sort();
  return {
    byCategory,
    byOrg: orgs,
    byTag: Object.fromEntries(Object.entries(byTag).sort((a, b) => b[1] - a[1])),
    byDay,
    byRecommendation,
    totals: {
      events: events.length,
      orgs: orgs.length,
      tags: Object.keys(byTag).length,
      days: days.length,
      firstDay: days[0] || null,
      lastDay: days[days.length - 1] || null,
    },
  };
}

/* ---------- daily reports ---------- */

function extractExcerpt(md) {
  const m = md.match(/## Daily Executive Summary\n([\s\S]*?)(?=\n## |\n$|$)/);
  if (!m) return '';
  const bullets = m[1]
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.startsWith('-'))
    .map((l) => l.replace(/^-\s*/, '').replace(/\*\*/g, '').replace(/\[(.*?)\]\(.*?\)/g, '$1'));
  const text = bullets.join(' ');
  return text.length > 220 ? text.slice(0, 217) + '…' : text;
}

async function loadDaily() {
  const dir = path.join(ROOT, 'daily');
  const names = (await readdir(dir)).filter((n) => n.endsWith('.md')).sort();
  const out = [];
  for (const name of names) {
    const date = name.replace(/\.md$/, '');
    const md = await readFile(path.join(dir, name), 'utf8');
    out.push({ date, html: renderMarkdown(md), excerpt: extractExcerpt(md) });
  }
  return out.reverse(); // newest first
}

/* ---------- trends ---------- */

const STATUS_WORDS = ['candidate', 'emerging', 'strengthening', 'established', 'weakening', 'invalidated', 'retired'];

function parseCurrentTrends(md) {
  const asOfMatch = md.match(/^#\s+.*?(\d{4}-\d{2}-\d{2}[T ][\d:]+Z?)/m);
  const asOf = asOfMatch ? asOfMatch[1] : '';
  const trends = [];
  let section = '';
  for (const block of md.split(/\n(?=##\s)/)) {
    const secMatch = block.match(/^##\s+(.*)$/m);
    if (secMatch) section = secMatch[1].trim();
    const retired = /invalidated|retired/i.test(section);
    for (const tBlock of block.split(/\n(?=###\s)/).slice(1)) {
      const head = tBlock.match(/^###\s+(.*)$/m);
      if (!head) continue;
      const hm = head[1].match(/^(candidate|emerging|strengthening|established|weakening|invalidated|retired)\s*:?\s*(.*)$/i);
      const name = hm ? hm[2].trim() : head[1].trim();
      const level = hm ? hm[1].toLowerCase() : '';
      const fields = [];
      let current = null;
      for (const line of tBlock.split('\n').slice(1)) {
        const fm = line.match(/^\s*-\s+\*\*(.+?)\s*:?\*\*\s*:?\s*(.*)$/);
        if (fm) {
          current = { label: fm[1].replace(/:$/, ''), value: fm[2] };
          fields.push(current);
        } else if (current && /^\s+\d+\.\s|^\s{2,}\S/.test(line) && line.trim() && !/^###|^##/.test(line)) {
          current.value += `\n${line.trim()}`;
        } else if (line.trim() && !/^###|^##/.test(line)) {
          current = null;
        }
      }
      const get = (re) => fields.find((f) => re.test(f.label))?.value || '';
      const statusRaw = get(/^status$/i);
      const statusWord = STATUS_WORDS.find((w) => statusRaw.toLowerCase().startsWith(w)) || level;
      trends.push({
        name,
        level,
        section,
        retired,
        status: statusWord || 'candidate',
        statusRaw,
        confidence: get(/^confidence$/i).replace(/^([A-Za-z]+).*$/, '$1') || 'Low',
        firstObserved: get(/^first observed$/i),
        lastUpdated: get(/^last updated$/i),
        evidence: get(/^evidence/i),
        confirm: get(/^what would confirm/i),
        fields,
      });
    }
  }
  return { asOf, trends };
}

async function loadTrends() {
  const currentMd = await readFile(path.join(ROOT, 'trends/current.md'), 'utf8');
  const parsed = parseCurrentTrends(currentMd);
  const dir = path.join(ROOT, 'trends');
  const snapshots = [];
  for (const name of (await readdir(dir)).sort().reverse()) {
    if (!/^\d{4}-\d{2}-\d{2}\.md$/.test(name)) continue;
    const date = name.replace(/\.md$/, '');
    snapshots.push({ date, html: renderMarkdown(await readFile(path.join(dir, name), 'utf8')) });
  }
  return { ...parsed, html: renderMarkdown(currentMd), snapshots };
}

/* ---------- main ---------- */

async function main() {
  const [events, daily, trends] = await Promise.all([loadEvents(), loadDaily(), loadTrends()]);
  const stateFile = path.join(ROOT, 'state.json');
  const state = existsSync(stateFile) ? await readJson(stateFile) : {};

  const siteState = {
    last_successful_run_at: state.last_successful_run_at || null,
    total_runs: state.total_runs ?? 0,
    next_scan_focus: state.next_scan_focus || [],
  };

  const aggregates = buildAggregates(events);

  await mkdir(OUT, { recursive: true });
  const write = (name, data) => writeFile(path.join(OUT, name), JSON.stringify(data));
  await Promise.all([
    write('events.json', events),
    write('aggregates.json', aggregates),
    write('daily.json', daily),
    write('trends.json', trends),
    write('state.json', siteState),
  ]);

  console.log(
    `[prepare-data] ${events.length} events, ${daily.length} daily reports, ` +
      `${trends.trends.length} trends, ${trends.snapshots.length} trend snapshots -> ${path.relative(ROOT, OUT)}`
  );
}

main().catch((err) => {
  console.error('[prepare-data] FAILED:', err);
  process.exit(1);
});
