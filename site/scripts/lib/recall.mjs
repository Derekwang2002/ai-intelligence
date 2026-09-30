// Recall audit: independent attention signals (HN, HF trending) are compared with the
// knowledge base. They only surface candidates; facts still come from primary sources.
import { canonicalUrl } from './intelligence.mjs';

const AI_TITLE = /\b(AI|LLMs?|GPT[-\w.]*|Claude|Gemini|OpenAI|Anthropic|DeepMind|models?|agents?|agentic|Llama|Qwen|DeepSeek|Mistral|Kimi|GLM|Grok|xAI|Codex|Copilot|Cursor|inference|GPUs?|CUDA|Nvidia|TPU|MCP|open[- ]weights?|fine-?tun\w*|RAG|embeddings?|transformers?|diffusion|RLHF|reasoning|benchmark)\b/i;
const DERIVATIVE_MODEL = /(gguf|awq|gptq|mlx|exl[23]|bnb|\d-?bit|fp8|nvfp4|mxfp[48]|int[48]|uncensored|abliterated|heretic|lora|merged?\b)/i;
const STOPWORDS = new Set(['the','and','for','with','from','into','your','our','how','why','what','when','this','that','show','ask','tell','introducing','announcing','new','now','using','use','model','models','agent','agents','open','source','release','released','launch','launches','llm','llms']);

export const isAiStory = title => AI_TITLE.test(String(title || ''));
export const isDerivativeModel = id => DERIVATIVE_MODEL.test(String(id || '').split('/').pop());

const safeCanonical = url => { try { return canonicalUrl(url); } catch { return null; } };
const escape = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Tokens that identify a thing: versions (4.7, GPT-6) or capitalised words. Bare "1" or "V4" are too common.
export function distinctiveTokens(title) {
  return [...new Set(String(title || '').split(/[\s,:;!?()"“”'’/|]+/)
    .map(t => t.replace(/^[^\w]+|[^\w]+$/g, ''))
    .filter(t => t.length >= 3 && (/\d/.test(t) || /^[A-Z]/.test(t)))
    .map(t => t.toLowerCase())
    .filter(t => !STOPWORDS.has(t)))];
}

export function buildMatcher(events, sources = []) {
  const sourceUrl = new Map(sources.map(s => [s.id, s.url]));
  const byUrl = new Map();
  const texts = [];
  for (const e of events) {
    const urls = [e.primary_source, ...(e.secondary_sources || []), ...(e.source_ids || []).map(id => sourceUrl.get(id))].filter(Boolean);
    for (const url of urls) {
      const key = safeCanonical(url);
      if (key) byUrl.set(key, [...new Set([...(byUrl.get(key) || []), e.event_id])]);
    }
    texts.push({ id: e.event_id, text: [e.title, e.title_zh, e.summary_en, JSON.stringify(e.technical_details || {}), ...urls].join(' ').toLowerCase() });
  }
  return { byUrl, texts };
}

export function matchItem(item, matcher) {
  const key = safeCanonical(item.url);
  const byUrl = key ? matcher.byUrl.get(key) : null;
  if (byUrl?.length) return { matched_event_ids: byUrl, suggested_event_ids: [] };
  if (item.model_id) {
    const id = item.model_id.toLowerCase();
    const hits = matcher.texts.filter(t => t.text.includes(id)).map(t => t.id);
    if (hits.length) return { matched_event_ids: hits, suggested_event_ids: [] };
  }
  // Token overlap is only a hint for the reviewer, never an automatic match.
  const tokens = distinctiveTokens(item.model_id ? item.model_id.split('/').pop().replace(/[-_]/g, ' ') : item.title);
  const need = Math.max(1, Math.ceil(tokens.length / 2));
  const suggested = tokens.length ? matcher.texts
    .map(t => ({ id: t.id, n: tokens.filter(tok => new RegExp(`(^|[^a-z0-9])${escape(tok)}([^a-z0-9]|$)`).test(t.text)).length }))
    .filter(t => t.n >= need).sort((a, b) => b.n - a.n || b.id.localeCompare(a.id)).slice(0, 3).map(t => t.id) : [];
  return { matched_event_ids: [], suggested_event_ids: suggested };
}

// handled: ids already given a final disposition in earlier runs (deferred items come back).
// existing: items already in this manifest, whose dispositions are preserved on re-runs.
export function classifyRecall(items, matcher, { handled = new Set(), existing = [] } = {}) {
  const previous = new Map(existing.map(i => [i.id, i]));
  const matched = [], skipped = [], pending = [];
  for (const item of items) {
    if (handled.has(item.id)) { skipped.push(item.id); continue; }
    const result = matchItem(item, matcher);
    if (result.matched_event_ids.length) { matched.push({ id: item.id, title: item.title, event_ids: result.matched_event_ids }); continue; }
    const kept = previous.get(item.id);
    pending.push({ ...item, suggested_event_ids: result.suggested_event_ids, disposition: kept?.disposition ?? null, event_id: kept?.event_id ?? null, reason: kept?.reason ?? null });
  }
  return { matched, skipped, pending };
}

export function handledRecallIds(manifests) {
  return new Set(manifests.flatMap(m => m?.recall_audit?.items || []).filter(i => i.disposition && i.disposition !== 'deferred').map(i => i.id));
}
