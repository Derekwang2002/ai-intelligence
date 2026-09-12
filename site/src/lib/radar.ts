// 雷达数据规则：窗口、去重、每环上限选择。RadarChart 与 Insights 页共用，保证图与计数一致。
//
// 设计约束（内容增多后雷达必须保持可读）：
// - 只展示「近 RADAR_WINDOW_DAYS 天内有活动」的条目，活动 = 发布或有重要更新（取 published_date
//   与 last_updated_at 的较晚者）。老条目自然老化出雷达，完整历史在事件库。
// - 每个（象限 × 等级）组只上评分最高的 RING_CAP 条，保证光点永不重叠、编号永远两位以内。
// - 选择按分析评分（engineering_value → technical_impact → adoption_signal）而非时间：
//   雷达回答的是「当前最该关注什么」，新条目由日报承担。
import { QUADRANTS } from './quadrants';

export const RADAR_WINDOW_DAYS = 30;
export const RING_ORDER = ['ADOPT', 'TRIAL', 'WATCH', 'IGNORE'] as const;
export const RING_CAP: Record<string, number> = { ADOPT: 6, TRIAL: 6, WATCH: 6, IGNORE: 4 };
export const RING_IDX: Record<string, number> = { ADOPT: 0, TRIAL: 1, WATCH: 2, IGNORE: 3 };

const DAY = 86400000;

// 活动日期：last_updated_at 晚于发布日时以更新为准（复核过的事件值得留在雷达上）
export function activityDate(e: any): string {
  const pub = String(e?.published_date ?? '').slice(0, 10);
  const upd = String(e?.last_updated_at ?? '').slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(upd) && upd > pub ? upd : pub;
}

export interface RadarItem {
  e: any;
  quad: string;
  ring: string;
  act: string; // 活动日期 YYYY-MM-DD
}

export interface RadarSelection {
  items: RadarItem[]; // 展示顺序：象限 → 环 → 评分（与清单、编号一致）
  overflow: Map<string, number>; // 象限 → 窗口内未上图的条数
  windowTotal: number; // 窗口内（去重后）总条数
  shownTotal: number;
  cutoff: string; // 窗口起点 YYYY-MM-DD
  maxDate: string; // 数据集中最新活动日期
}

const scoreOf = (e: any) => [e?.engineering_value ?? 0, e?.technical_impact ?? 0, e?.adoption_signal ?? 0];

// 组内排序：评分高者优先，日期新者优先，event_id 兜底保证确定性
function byScoreThenDate(a: RadarItem, b: RadarItem): number {
  const sa = scoreOf(a.e);
  const sb = scoreOf(b.e);
  for (let i = 0; i < 3; i++) if (sb[i] !== sa[i]) return sb[i] - sa[i];
  return b.act.localeCompare(a.act) || String(a.e.event_id).localeCompare(String(b.e.event_id));
}

export function selectRadar(events: any[]): RadarSelection {
  // 每个 fingerprint 只保留一个实体，取活动日期最新的一条
  const byFp = new Map<string, any>();
  for (const e of events) {
    const fp = e.event_fingerprint || e.event_id;
    const cur = byFp.get(fp);
    if (!cur || activityDate(e) > activityDate(cur)) byFp.set(fp, e);
  }
  const unique = [...byFp.values()];

  // 窗口以数据集内最新活动日期为锚（不用构建时间，保证构建可复现）
  const maxDate = unique.map(activityDate).sort().at(-1) ?? '1970-01-01';
  const cutoffT = new Date(`${maxDate}T00:00:00Z`).getTime() - (RADAR_WINDOW_DAYS - 1) * DAY;
  const inWindow = unique.filter((e) => new Date(`${activityDate(e)}T00:00:00Z`).getTime() >= cutoffT);
  const cutoff = new Date(cutoffT).toISOString().slice(0, 10);

  // 按象限 × 环分组，组内评分排序后截断到 RING_CAP
  const quadIdx = (id: string) => QUADRANTS.findIndex((q) => q.id === id);
  const groups = new Map<string, RadarItem[]>();
  for (const e of inWindow) {
    const quad = QUADRANTS.find((q) => q.cats.includes(e.category));
    if (!quad) continue; // 未映射类别不进雷达（映射表应覆盖全部分类）
    const ring = RING_IDX[e.recommendation] !== undefined ? e.recommendation : 'WATCH';
    const k = `${quad.id}|${ring}`;
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push({ e, quad: quad.id, ring, act: activityDate(e) });
  }

  const items: RadarItem[] = [];
  const overflow = new Map<string, number>();
  const windowByQuad = new Map<string, number>();
  for (const g of groups.values()) windowByQuad.set(g[0].quad, (windowByQuad.get(g[0].quad) ?? 0) + g.length);

  for (const [k, g] of groups) {
    const [quad, ring] = k.split('|');
    g.sort(byScoreThenDate);
    const cap = RING_CAP[ring] ?? RING_CAP.WATCH;
    items.push(...g.slice(0, cap));
  }
  items.sort(
    (a, b) => quadIdx(a.quad) - quadIdx(b.quad) || RING_IDX[a.ring] - RING_IDX[b.ring] || byScoreThenDate(a, b)
  );

  const shownByQuad = new Map<string, number>();
  for (const it of items) shownByQuad.set(it.quad, (shownByQuad.get(it.quad) ?? 0) + 1);
  for (const q of QUADRANTS) {
    const more = (windowByQuad.get(q.id) ?? 0) - (shownByQuad.get(q.id) ?? 0);
    if (more > 0) overflow.set(q.id, more);
  }

  return { items, overflow, windowTotal: inWindow.length, shownTotal: items.length, cutoff, maxDate };
}
