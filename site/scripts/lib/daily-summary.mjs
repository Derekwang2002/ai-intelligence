// Daily report executive-summary parsing for the archive cards (bullets or a paragraph).

export function extractExcerpt(md) {
  const m = md.match(/## Daily Executive Summary\n([\s\S]*?)(?=\n## |\n$|$)/);
  if (!m) return '';
  const lines = m[1].split('\n').map((l) => l.trim()).filter(Boolean);
  const bullets = lines.filter((l) => l.startsWith('-')).map((l) => l.replace(/^-\s*/, ''));
  // Some runs write the summary as a paragraph; use it rather than leaving the archive card blank.
  const parts = bullets.length ? bullets : lines.filter((l) => !/^(>|#|\|)/.test(l));
  const text = parts.join(' ').replace(/\*\*/g, '').replace(/`/g, '').replace(/\[(.*?)\]\(.*?\)/g, '$1');
  return text.length > 220 ? text.slice(0, 217) + '…' : text;
}

// Parse the executive-summary bullets into structured highlights for the
// daily index cards: { kind: 'new' | 'update' | null, title, body }.
// Handles both bullet shapes: "**新事件（…）：Title（ev-…）**——body" and
// the older "**Title**: body".
export function parseHighlights(md) {
  const m = md.match(/## Daily Executive Summary\n([\s\S]*?)(?=\n## |\n$|$)/);
  if (!m) return [];
  return m[1]
    .split('\n')
    .filter((l) => /^-\s/.test(l))
    .map((l) => {
      const text = l.replace(/^-\s*/, '');
      const bm = text.match(/^\*\*(.+?)\*\*([\s\S]*)$/);
      let head = bm ? bm[1] : text;
      let body = bm ? bm[2] : '';
      let kind = null;
      const km = head.match(/^(新事件|更新|New event|Update)\s*(?:[（(][^)）]*[)）])?\s*[:：]\s*/i);
      if (km) {
        kind = /新事件|new/i.test(km[1]) ? 'new' : 'update';
        head = head.slice(km[0].length);
      }
      // Drop trailing parentheticals that only carry event ids / recs,
      // e.g. "（ev-20260818-04，维持 WATCH）".
      head = head.replace(/\s*[（(][^()（）]*\bev-[^()（）]*[)）]\s*$/i, '');
      head = head.replace(/\s+/g, ' ').trim();
      body = body
        .replace(/^[—–\-:：\s]+/, '')
        .replace(/\*\*/g, '')
        .replace(/\[(.*?)\]\(.*?\)/g, '$1')
        .replace(/\s+/g, ' ')
        .trim();
      if (body.length > 90) body = body.slice(0, 89).trimEnd() + '…';
      return { kind, title: head, body };
    })
    .filter((h) => h.title);
}
