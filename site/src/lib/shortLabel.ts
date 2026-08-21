// 事件的图内短标签：从英文规范标题提取"头部"（产品/论文名），
// 去掉开头组织名与动作词、尾巴修饰。用于雷达图/泳道图的悬停标签与矩阵单元格。
// 数据局限：标题不是为短标签写的，过长时截断；将来若要更高质量可在知识库侧加 curated 字段。

const ACTION_VERBS = /^(?:launches?|releases?|unveils?|adds?|introduces?|previews?|open-?sources?|ships?|announces?|explains?|发布|推出|开源|上线|详解|预览)\s+/i;
const TRAILING = /\s+(?:stable|ga|preview|beta|general availability)$/i;

export function shortLabel(e: any): string {
  const orgs: string[] = e?.organization ?? [];
  let head = String(e?.title ?? '').trim();
  if (!head) return orgs[0] ?? '';

  // 头部 = 最早出现的破折号/冒号之前（论文名、产品名通常在这里）
  const seps = [' — ', '——', ': '];
  let cut = -1;
  for (const s of seps) {
    const i = head.indexOf(s);
    if (i !== -1 && (cut === -1 || i < cut)) cut = i;
  }
  if (cut !== -1) head = head.slice(0, cut);

  // 去开头组织名（要求词边界：Qwen3.8-27B 不能被 "Qwen" 剥成 "3.8-27B"）
  for (const o of orgs) {
    if (o !== 'academic' && head.toLowerCase().startsWith(o.toLowerCase()) && (head.length === o.length || /\s/.test(head[o.length]))) {
      head = head.slice(o.length).trim();
      break;
    }
  }
  head = head.replace(ACTION_VERBS, '');
  // "Bedrock adds xAI Grok 4.6" → "Bedrock xAI Grok 4.6"
  head = head.replace(/\s+(?:adds|launches?|releases?|unveils?|introduces?|ships?)\s+/i, ' ');
  // "CS-4 at SUPERNOVA 2026" → "CS-4"
  head = head.split(/\s+at\s+/i)[0];
  head = head.replace(TRAILING, '').trim();

  if (!head) head = String(e?.title ?? '').split(/\s+/).slice(0, 3).join(' ');
  return head.length > 24 ? `${head.slice(0, 24).trimEnd()}…` : head;
}

// 估算 SVG 文本宽度（font-size 13）：CJK 全宽，ASCII 窄
export function labelWidth(s: string): number {
  let w = 0;
  for (const ch of s) w += (ch.codePointAt(0) ?? 0) > 0xff ? 13.5 : 7.4;
  return Math.ceil(w) + 18; // 左右 padding
}
