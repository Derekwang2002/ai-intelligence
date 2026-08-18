// Prefix internal paths with the configured Astro base (GitHub Pages serves
// the site under /ai-intelligence/, locally under /) and the locale prefix
// (English pages live under /en/, Chinese — the default — at the root).
import type { Locale } from './i18n';

const rawBase = (import.meta.env.BASE_URL ?? '/').replace(/\/+$/, '');

export function u(path: string, locale: Locale = 'zh'): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  const prefix = locale === 'en' ? '/en' : '';
  return `${rawBase}${prefix}${p}`;
}

// Strip base + locale prefix from a URL pathname, yielding the logical path
// (e.g. /ai-intelligence/en/events/ -> /events/). Used for nav active state
// and for computing the counterpart URL in the other language.
export function logicalPath(pathname: string): string {
  let p = pathname;
  if (rawBase && p.startsWith(rawBase)) p = p.slice(rawBase.length) || '/';
  if (p === '/en' || p.startsWith('/en/')) p = p.slice(3) || '/';
  return p;
}

export function fmtDateTime(
  iso: string | null | undefined,
  locale: Locale = 'zh',
  timeZone = 'Asia/Shanghai'
): string {
  if (!iso) return '—';
  const d = new Date(iso.includes('T') ? iso : `${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'zh-CN', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d);
}
