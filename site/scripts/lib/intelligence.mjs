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
// Candidate and recall dispositions (AGENTS.md §20). Detail belongs in reason_code, not new values.
export const RUN_DECISIONS = ['new-event', 'update-existing', 'duplicate', 'correction', 'filtered', 'out-of-scope', 'deferred', 'reviewed-no-change'];
export const DECISIONS_CITING_EVENT = ['new-event', 'update-existing', 'duplicate', 'correction'];
export const RECOMMENDATIONS = ['ADOPT', 'TRIAL', 'WATCH', 'IGNORE'];
export const SHORT_LABEL_MAX = 24;
// Reader-facing length limits (characters). Summaries say what the thing is; history goes to changes[].
export const LIMITS = { summary_zh: 320, summary_en: 800, next_action_zh: 80, next_action_en: 200, judgment_zh: 200, judgment_en: 500 };
const chars = value => [...String(value ?? '')].length;
const after = (value, threshold) => Number.isFinite(Date.parse(value)) && Date.parse(value) >= Date.parse(threshold);
function textErrors(obj, key, id, required) {
  const errors = [];
  for (const lang of ['zh', 'en']) {
    const value = obj?.[`${key}_${lang}`], limit = LIMITS[`${key}_${lang}`];
    if (typeof value !== 'string' || !value.trim()) { if (required) errors.push(`${id}: missing ${key}_${lang}`); }
    else if (chars(value) > limit) errors.push(`${id}: ${key}_${lang} has ${chars(value)} characters (limit ${limit})`);
  }
  return errors;
}
function shortLabelErrors(e, id) {
  const errors = [];
  for (const lang of ['zh', 'en']) {
    const label = e[`short_label_${lang}`];
    if (typeof label !== 'string' || !label.trim()) errors.push(`${id}: missing short_label_${lang}`);
    else if (chars(label) > SHORT_LABEL_MAX) errors.push(`${id}: short_label_${lang} exceeds ${SHORT_LABEL_MAX} characters`);
  }
  return errors;
}
export function taxonomyErrors(taxonomy) {
  const errors = [];
  if (!Number.isFinite(Date.parse(taxonomy.rules_effective_at))) errors.push('taxonomy: invalid rules_effective_at');
  if (taxonomy.decision_rules_effective_at !== undefined && !Number.isFinite(Date.parse(taxonomy.decision_rules_effective_at))) errors.push('taxonomy: invalid decision_rules_effective_at');
  for (const [alias, target] of Object.entries(taxonomy.category_aliases || {})) if (!taxonomy.categories.includes(target)) errors.push(`taxonomy: category alias ${alias} -> unknown ${target}`);
  for (const [alias, target] of Object.entries(taxonomy.source_type_aliases || {})) if (!taxonomy.source_types.includes(target)) errors.push(`taxonomy: source_type alias ${alias} -> unknown ${target}`);
  return errors;
}
// Rules for events first seen after taxonomy.rules_effective_at; history stays as recorded.
export function eventRuleErrors(e, taxonomy) {
  const errors = [], id = `event ${e.event_id}`;
  const hint = (aliases, value) => aliases?.[value] ? ` (use "${aliases[value]}")` : '';
  if (!taxonomy.categories.includes(e.category)) errors.push(`${id}: category "${e.category}" is not in config/taxonomy.json${hint(taxonomy.category_aliases, e.category)}`);
  if (!taxonomy.source_types.includes(e.source_type)) errors.push(`${id}: source_type "${e.source_type}" is not in config/taxonomy.json${hint(taxonomy.source_type_aliases, e.source_type)}`);
  if (!e.organization?.length) errors.push(`${id}: organization is empty`);
  for (const org of e.organization || []) if (taxonomy.organization_aliases?.[org]) errors.push(`${id}: organization "${org}" should be "${taxonomy.organization_aliases[org]}"`);
  errors.push(...shortLabelErrors(e, id));
  if (e.maturity <= 2 && e.recommendation === 'ADOPT') errors.push(`${id}: maturity ${e.maturity} cannot be ADOPT`);
  // next_action doubles as the one-day verification for an early TRIAL (AGENTS.md §16.2).
  if (e.maturity <= 2 && e.recommendation === 'TRIAL') for (const lang of ['zh', 'en']) if (!e[`trial_reason_${lang}`]?.trim() && !e[`next_action_${lang}`]?.trim()) errors.push(`${id}: TRIAL at maturity ${e.maturity} needs next_action_${lang} (or trial_reason_${lang})`);
  return errors;
}
// Decision fields for events first seen or materially updated after decision_rules_effective_at:
// every card states what to do next, and summaries stay short instead of accumulating version logs.
export function eventDecisionErrors(e) {
  const id = `event ${e.event_id}`;
  return [...textErrors(e, 'next_action', id, true), ...textErrors(e, 'summary', id, false), ...shortLabelErrors(e, id)];
}
// A project's own current judgment; it is never inherited from whichever event matched its name.
export function projectJudgmentErrors(p) {
  const j = p.judgment, id = `project ${p.id}`;
  if (!j) return [];
  const errors = [...textErrors(j, 'judgment', id, true), ...textErrors(j, 'next_action', id, false)];
  if (!RECOMMENDATIONS.includes(j.recommendation)) errors.push(`${id}: judgment recommendation "${j.recommendation}"`);
  if (!j.basis_event_ids?.length) errors.push(`${id}: judgment needs basis_event_ids`);
  for (const ev of j.basis_event_ids || []) if (!p.event_ids.includes(ev)) errors.push(`${id}: judgment basis ${ev} is not one of its events`);
  if (!Number.isFinite(Date.parse(j.reviewed_at))) errors.push(`${id}: judgment needs reviewed_at`);
  return errors;
}
export function materialChanges(events, trends, topics=[], projects=[]) {
  return [[events,'event'],[trends,'trend'],[topics,'topic'],[projects,'project']].flatMap(([items,type])=>items.flatMap(item=>(item.changes||[]).map(c=>({...c,object_type:type,object_id:item.event_id||item.id}))));
}
export function validateKnowledge({ events, projects, sources, trends, topics, briefings, reviews, taxonomy }) {
  const errors = taxonomy ? taxonomyErrors(taxonomy) : [];
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
  const scenarioIds = new Set(SCENARIOS.map(s => s.id));
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
    if (!Array.isArray(e.scenario_ids)) errors.push(`event ${e.event_id}: scenario_ids must be an array`);
    else refs(e.scenario_ids, scenarioIds, `event ${e.event_id}: scenario_ids`);
    if (!['verified', 'frontier', 'legacy'].includes(e.evidence_stage)) errors.push(`event ${e.event_id}: evidence_stage`);
    if (!RECOMMENDATIONS.includes(e.recommendation)) errors.push(`event ${e.event_id}: recommendation "${e.recommendation}"`);
    if (taxonomy && Date.parse(e.first_seen_at) >= Date.parse(taxonomy.rules_effective_at)) errors.push(...eventRuleErrors(e, taxonomy));
    const decided = taxonomy?.decision_rules_effective_at;
    if (decided && (after(e.first_seen_at, decided) || after(e.last_updated_at, decided))) errors.push(...eventDecisionErrors(e));
  }
  // When a project's events change after the decision rules date, its judgment must be re-reviewed.
  const latestChange = new Map(events.map(e => [e.event_id, (e.changes || []).map(c => c.discovered_at).filter(Boolean).sort().at(-1)]));
  for (const p of projects) {
    errors.push(...projectJudgmentErrors(p));
    const decided = taxonomy?.decision_rules_effective_at;
    const latest = [...(p.event_ids || []).map(id => latestChange.get(id)), ...(p.changes || []).map(c => c.discovered_at)].filter(Boolean).sort().at(-1);
    if (decided && after(latest, decided) && !(p.judgment && Date.parse(p.judgment.reviewed_at) >= Date.parse(latest))) errors.push(`project ${p.id}: judgment must be reviewed after its latest change (${latest})`);
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
  return [...new Set(errors)];
}
