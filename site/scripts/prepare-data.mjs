// Pre-build data pipeline for the AI Intelligence Radar site.
// Reads the knowledge base (events/, daily/, trends/, index/, state.json)
// and writes flattened JSON into src/data/generated/ for Astro pages.
// The knowledge base itself is never modified — the site is a read-only projection.
//
// Bilingual contract (AGENTS.md §6/§7/§10):
// - events carry title_zh (title stays the English canonical form),
//   summary_zh/summary_en, why_it_matters_zh/why_it_matters_en
//   (legacy summary/why_it_matters remain as English fallback);
// - daily reports pair YYYY-MM-DD.md (zh) with YYYY-MM-DD.en.md (en);
// - trends ship a structured trends/current.json (bilingual); when it is
//   missing we fall back to regex-parsing trends/current.md (legacy).

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

async function readIfExists(file) {
  return existsSync(file) ? await readFile(file, 'utf8') : null;
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

/* ---------- daily reports (bilingual file pairs) ---------- */

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

// Collect dates that have at least one of YYYY-MM-DD.md / YYYY-MM-DD.en.md.
async function collectDatePairs(dir) {
  const dates = new Set();
  for (const name of await readdir(dir)) {
    const m = name.match(/^(\d{4}-\d{2}-\d{2})(\.en)?\.md$/);
    if (m) dates.add(m[1]);
  }
  return [...dates].sort();
}

async function loadDaily() {
  const dir = path.join(ROOT, 'daily');
  const out = [];
  for (const date of await collectDatePairs(dir)) {
    // Missing one language falls back to the other so pages never render empty.
    const zh = (await readIfExists(path.join(dir, `${date}.md`))) ?? null;
    const en = (await readIfExists(path.join(dir, `${date}.en.md`))) ?? null;
    const zhMd = zh ?? en ?? '';
    const enMd = en ?? zh ?? '';
    out.push({
      date,
      html_zh: renderMarkdown(zhMd),
      html_en: renderMarkdown(enMd),
      excerpt_zh: extractExcerpt(zhMd),
      excerpt_en: extractExcerpt(enMd),
    });
  }
  return out.reverse(); // newest first
}

/* ---------- trends ---------- */

const STATUS_WORDS = ['candidate', 'emerging', 'strengthening', 'established', 'weakening', 'invalidated', 'retired'];

// Unified trend shape consumed by the templates. Both the structured
// current.json and the legacy markdown parse are normalized into this.
function normalizeTrend(t) {
  const toList = (v) => (Array.isArray(v) ? v : v ? [v] : []);
  return {
    id: t.id || '',
    status: STATUS_WORDS.find((w) => String(t.status || '').toLowerCase().startsWith(w)) || 'candidate',
    retired: !!t.retired,
    confidence: String(t.confidence || 'Low').replace(/^([A-Za-z]+).*$/, '$1'),
    firstObserved: t.first_observed || t.firstObserved || '',
    lastUpdated: t.last_updated || t.lastUpdated || '',
    name_zh: t.name_zh || t.name_en || '',
    name_en: t.name_en || t.name_zh || '',
    statusNote_zh: t.status_note_zh ?? t.status_note_en ?? '',
    statusNote_en: t.status_note_en ?? t.status_note_zh ?? '',
    evidence_zh: toList(t.evidence_zh ?? t.evidence_en),
    evidence_en: toList(t.evidence_en ?? t.evidence_zh),
    why_zh: t.why_it_matters_zh ?? t.why_it_matters_en ?? '',
    why_en: t.why_it_matters_en ?? t.why_it_matters_zh ?? '',
    confirm_zh: t.what_would_confirm_zh ?? t.what_would_confirm_en ?? '',
    confirm_en: t.what_would_confirm_en ?? t.what_would_confirm_zh ?? '',
    updates: (t.updates || []).map((u) => ({
      date: u.date || '',
      note_zh: u.note_zh ?? u.note_en ?? '',
      note_en: u.note_en ?? u.note_zh ?? '',
    })),
  };
}

async function loadCurrentTrends(dir) {
  const jsonPath = path.join(dir, 'current.json');
  if (existsSync(jsonPath)) {
    const data = await readJson(jsonPath);
    return {
      asOf: data.as_of || '',
      structured: true,
      trends: (data.trends || []).map(normalizeTrend),
    };
  }
  // Legacy fallback: regex-parse the human-readable current.md.
  const currentMd = await readFile(path.join(dir, 'current.md'), 'utf8');
  const parsed = parseCurrentTrends(currentMd);
  return {
    asOf: parsed.asOf,
    structured: false,
    trends: parsed.trends.map((t) =>
      normalizeTrend({
        id: '',
        status: t.status,
        retired: t.retired,
        confidence: t.confidence,
        first_observed: t.firstObserved,
        last_updated: t.lastUpdated,
        name_en: t.name,
        status_note_en: t.statusRaw,
        evidence_en: t.evidence
          .split('\n')
          .map((l) => l.replace(/^\s*\d+\.\s*/, '').trim())
          .filter(Boolean),
        what_would_confirm_en: t.confirm,
      })
    ),
  };
}

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
  const dir = path.join(ROOT, 'trends');
  const current = await loadCurrentTrends(dir);
  const snapshots = [];
  for (const date of (await collectDatePairs(dir)).reverse()) {
    const zh = await readIfExists(path.join(dir, `${date}.md`));
    const en = await readIfExists(path.join(dir, `${date}.en.md`));
    snapshots.push({
      date,
      html_zh: renderMarkdown(zh ?? en ?? ''),
      html_en: renderMarkdown(en ?? zh ?? ''),
    });
  }
  return { ...current, snapshots };
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
      `${trends.trends.length} trends (structured=${trends.structured}), ${trends.snapshots.length} trend snapshots -> ${path.relative(ROOT, OUT)}`
  );
}

main().catch((err) => {
  console.error('[prepare-data] FAILED:', err);
  process.exit(1);
});
