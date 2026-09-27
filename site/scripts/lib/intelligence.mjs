import { createHash } from 'node:crypto';

export const idFor = (prefix, value) => `${prefix}-${createHash('sha256').update(value).digest('hex').slice(0, 16)}`;
export function canonicalUrl(value) {
  const url = new URL(value);
  if (!['https:', 'http:'].includes(url.protocol)) throw new Error(`Unsafe source URL: ${value}`);
  url.hash = '';
  for (const key of [...url.searchParams.keys()]) if (/^(utm_|fbclid|gclid)/.test(key)) url.searchParams.delete(key);
  url.searchParams.sort();
  return url.href.replace(/\/$/, '');
}
export function reportDate(value) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const date=new Date(`${value}T00:00:00Z`);
    if(!Number.isFinite(date.getTime())||date.toISOString().slice(0,10)!==value)throw new Error(`Invalid calendar date: ${value}`);
    return value;
  }
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) throw new Error(`Invalid timestamp: ${value}`);
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}
export function utcDate(value) {
  return value.length === 10 ? value : new Date(value).toISOString().slice(0, 10);
}
export function addDays(value, count) {
  const date = new Date(value.length === 10 ? `${value}T00:00:00Z` : value);
  date.setUTCDate(date.getUTCDate() + count);
  return date.toISOString().slice(0, 10);
}
export function extractEventIds(text, known) {
  return [...new Set((text.match(/ev-\d{8}-\d{2}/g) || []).filter(id => known.has(id)))];
}
export const SCENARIOS = [
  { id: 'agents', name_zh: '构建 Agent', name_en: 'Building agents', description_zh: '可靠执行、工具调用、状态与评估', description_en: 'Reliable execution, tools, state and evaluation', categories: ['ai-agent', 'developer-tools'], tags: ['agent', 'mcp', 'runtime', 'tool'] },
  { id: 'models', name_zh: '模型选型', name_en: 'Choosing models', description_zh: '能力、可用性、成本与许可证', description_en: 'Capabilities, availability, cost and licensing', categories: ['foundation-model'], tags: ['model', 'pricing', 'benchmark'] },
  { id: 'local', name_zh: '本地部署', name_en: 'Local deployment', description_zh: '开放权重、量化、推理与硬件', description_en: 'Open weights, quantization, inference and hardware', categories: ['infrastructure'], tags: ['quantization', 'serving', 'open-weight', 'inference', 'local'] },
  { id: 'research', name_zh: '前沿研究', name_en: 'Frontier research', description_zh: '公开论文、实验与尚待验证的方向', description_en: 'Public papers, experiments and open questions', categories: ['research'], tags: ['research', 'arxiv', 'benchmark', 'evaluation'] },
];
export function scenarioIds(event) {
  return SCENARIOS.filter(s => s.categories.includes(event.category) || (event.tags || []).some(t => s.tags.some(k => t.toLowerCase().includes(k)))).map(s => s.id);
}
export function sourceKind(url) {
  const u = new URL(url);
  if (u.hostname === 'arxiv.org') return 'paper';
  if (u.hostname === 'github.com') return /\/releases/.test(u.pathname) ? 'release' : /\/(issues|discussions|pull)\//.test(u.pathname) ? 'community' : 'code';
  if (u.hostname === 'huggingface.co') return /\/(discussions|community)/.test(u.pathname) ? 'community' : u.pathname.startsWith('/blog/') ? 'announcement' : 'weights';
  if (/docs\.|\/docs\/|\/documentation\//.test(url)) return 'documentation';
  if (/artificialanalysis.ai/.test(u.hostname)) return 'evaluation';
  return 'reference';
}
export function sourceTitle(url) {
  const u = new URL(url);
  const path = decodeURIComponent(u.pathname).split('/').filter(Boolean);
  if (u.hostname === 'github.com') return `${path.slice(0, 2).join('/')} · ${path.slice(2).join(' / ') || 'GitHub'}`;
  if (u.hostname === 'arxiv.org') return `arXiv ${path.at(-1)}`;
  return `${u.hostname.replace(/^www\./, '')} · ${(path.at(-1) || 'Overview').replace(/[-_]/g, ' ')}`;
}
export function materialChanges(events, trends, topics=[], projects=[]) {
  return [[events,'event'],[trends,'trend'],[topics,'topic'],[projects,'project']].flatMap(([items,type])=>items.flatMap(item=>(item.changes||[]).map(c=>({...c,object_type:type,object_id:item.event_id||item.id}))));
}
export function validateKnowledge({ events, projects, sources, trends, topics, briefings, reviews }) {
  const errors = [];
  const unique = (items, key, type) => {
    const ids = new Set();
    for (const item of items) { if (!item[key] || ids.has(item[key])) errors.push(`${type}: missing/duplicate ${item[key]}`); ids.add(item[key]); }
    return ids;
  };
  const eids = unique(events, 'event_id', 'event');
  unique(events, 'event_fingerprint', 'fingerprint');
  const pids = unique(projects, 'id', 'project');
  const sids = unique(sources, 'id', 'source');
  const tids = unique(trends, 'id', 'trend');
  unique(topics, 'id', 'topic');
  unique(briefings, 'id', 'briefing');
  unique(reviews, 'id', 'review');
  const evidence = [...events.flatMap(e => e.evidence || []), ...trends.flatMap(t => t.evidence || [])];
  const evids = unique(evidence, 'id', 'evidence');
  const changes = materialChanges(events, trends, topics, projects);
  const cids = unique(changes, 'id', 'change');
  const refs = (ids, known, label) => { for (const id of ids || []) if (!known.has(id)) errors.push(`${label}: unknown ${id}`); };
  const bilingual = (obj, keys, label) => { for (const key of keys) for (const lang of ['zh', 'en']) if (typeof obj[`${key}_${lang}`] !== 'string' || !obj[`${key}_${lang}`].trim()) errors.push(`${label}: missing ${key}_${lang}`); };
  const urls=new Set();
  for (const s of sources) {
    try { const url=canonicalUrl(s.url);if(urls.has(url))errors.push(`source ${s.id}: duplicate canonical URL`);urls.add(url); } catch { errors.push(`source ${s.id}: unsafe URL`); }
    if (!s.kind || !s.verification) errors.push(`source ${s.id}: missing classification`);
    if(![true,false,null].includes(s.official))errors.push(`source ${s.id}: official relationship must be explicit or unknown`);
    for(const check of s.checks||[])if(!['success','changed','unchanged','failed','not_checked'].includes(check.status))errors.push(`source ${s.id}: invalid check status`);
  }
  for (const e of events) {
    bilingual(e, ['summary', 'why_it_matters'], e.event_id);
    if (!e.title_zh || !e.title || !e.technical_details_zh) errors.push(`event ${e.event_id}: bilingual fields`);
    if (e.summary !== e.summary_en || e.why_it_matters !== e.why_it_matters_en) errors.push(`event ${e.event_id}: English aliases differ`);
    refs(e.project_ids, pids, e.event_id); refs(e.source_ids, sids, e.event_id);
    if (!['verified', 'frontier', 'legacy'].includes(e.evidence_stage)) errors.push(`event ${e.event_id}: evidence_stage`);
  }
  for (const ev of evidence) { bilingual(ev, ['claim'], ev.id); refs(ev.source_ids, sids, ev.id); refs(ev.event_ids, eids, ev.id); if (!ev.source_ids?.length && !ev.event_ids?.length) errors.push(`evidence ${ev.id}: no references`); }
  for (const c of changes) {
    bilingual(c, ['summary'], c.id); refs(c.evidence_ids, evids, c.id);
    if (!['new', 'update', 'correction', 'recommendation', 'trend'].includes(c.kind)) errors.push(`change ${c.id}: non-material kind`);
    try { reportDate(c.occurred_at); reportDate(c.discovered_at); } catch { errors.push(`change ${c.id}: invalid dates`); }
    if (['recommendation', 'correction'].includes(c.kind) && (!c.before || !c.after)) errors.push(`change ${c.id}: missing before/after`);
  }
  for (const p of projects) { bilingual(p, ['name'], p.id); refs(p.event_ids, eids, p.id); refs(p.source_ids, sids, p.id); refs(p.official_source_ids,sids,p.id); if(p.current_judgment_event_id)refs([p.current_judgment_event_id],new Set(p.event_ids),p.id); }
  for(const t of trends){bilingual(t,['name','why_it_matters','what_would_confirm'],t.id);if(!['candidate','emerging','strengthening','established','weakening','invalidated'].includes(t.status))errors.push(`trend ${t.id}: invalid lifecycle`);}
  for (const t of topics) { bilingual(t, ['question', 'answer', 'boundary'], t.id); refs(t.trend_ids, tids, t.id); refs(t.evidence_ids, evids, t.id); }
  for (const b of briefings) { refs(b.change_ids, cids, b.id); if (b.highlights.length > 5) errors.push(`briefing ${b.id}: more than five highlights`); for (const h of b.highlights) { refs([h.change_id], new Set(b.change_ids), b.id); bilingual(h, ['reason'], b.id); } }
  for (const r of reviews) { if (!eids.has(r.event_id)) errors.push(`review ${r.id}: unknown event`); }
  return errors;
}
