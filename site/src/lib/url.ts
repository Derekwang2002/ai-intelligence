// Prefix internal paths with the configured Astro base (GitHub Pages serves
// the site under /ai-intelligence/, locally under /).
const rawBase = (import.meta.env.BASE_URL ?? '/').replace(/\/+$/, '');

export function u(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${rawBase}${p}`;
}

export const CATEGORY_LABELS: Record<string, string> = {
  'foundation-model': 'Foundation Models',
  'agent-security': 'Agent Security',
  'agent': 'Agent',
  'ai-engineering': 'AI Engineering',
  'developer-tools': 'Developer Tools',
  'open-source': 'Open Source',
  infrastructure: 'Infrastructure',
  research: 'Research',
  business: 'Business & Policy',
};

export function catLabel(cat: string): string {
  return CATEGORY_LABELS[cat] ?? cat;
}

// Category -> CSS variable used for its color dot / radar quadrant.
export const CATEGORY_VARS: Record<string, string> = {
  'foundation-model': 'var(--cat-model)',
  research: 'var(--cat-research)',
  agent: 'var(--cat-agent)',
  'agent-security': 'var(--cat-agent)',
  'ai-engineering': 'var(--cat-agent)',
  'developer-tools': 'var(--cat-tools)',
  'open-source': 'var(--cat-oss)',
  infrastructure: 'var(--cat-infra)',
  business: 'var(--cat-business)',
};

export function fmtDateTime(iso: string | null | undefined, timeZone = 'Asia/Shanghai'): string {
  if (!iso) return '—';
  const d = new Date(iso.includes('T') ? iso : `${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d);
}
