// RSS 2.0 for the static site. Follows and bookmarks stay in one browser and send nothing,
// so feeds are how a reader gets new briefings, projects or scenarios without opening the site.
const INVALID_XML = /[^\u0009\u000A\u000D -퟿-�\u{10000}-\u{10FFFF}]/gu;
export const xml = value => String(value ?? '').replace(INVALID_XML, '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
export const rfc822 = value => new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00Z` : value).toUTCString();

export function buildRss({ title, description, link, self, language, updated, items }) {
  const entries = items.map(i => [
    '  <item>',
    `    <title>${xml(i.title)}</title>`,
    `    <link>${xml(i.link)}</link>`,
    `    <guid isPermaLink="false">${xml(i.guid)}</guid>`,
    `    <pubDate>${rfc822(i.date)}</pubDate>`,
    ...(i.categories || []).map(c => `    <category>${xml(c)}</category>`),
    `    <description>${xml(i.description)}</description>`,
    '  </item>',
  ].join('\n'));
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '<channel>',
    `  <title>${xml(title)}</title>`,
    `  <link>${xml(link)}</link>`,
    `  <description>${xml(description)}</description>`,
    `  <language>${xml(language)}</language>`,
    `  <lastBuildDate>${rfc822(updated)}</lastBuildDate>`,
    `  <atom:link href="${xml(self)}" rel="self" type="application/rss+xml"/>`,
    ...entries,
    '</channel>',
    '</rss>',
    '',
  ].join('\n');
}
