// 四象限划分：类别 → 象限。雷达图、泳道图、事件页矩阵共用同一份映射。
import { t, type Locale, type UiKey } from './i18n';

export interface Quadrant {
  id: string;
  labelKey: UiKey;
  cats: string[];
}

// 映射必须覆盖知识库出现的所有 category：未命中的事件会被雷达静默丢弃。
export const QUADRANTS: Quadrant[] = [
  { id: 'models', labelKey: 'radar.quad.models', cats: ['foundation-model', 'research'] },
  { id: 'agents', labelKey: 'radar.quad.agents', cats: ['agent-security', 'agent', 'ai-engineering', 'computer-use', 'safety'] },
  { id: 'infra', labelKey: 'radar.quad.infra', cats: ['open-source', 'infrastructure'] },
  { id: 'tools', labelKey: 'radar.quad.tools', cats: ['developer-tools', 'business', 'business-policy'] },
];

export function quadrantOf(category: string): string | null {
  return QUADRANTS.find((q) => q.cats.includes(category))?.id ?? null;
}

export function quadLabel(id: string, locale: Locale): string {
  const q = QUADRANTS.find((q) => q.id === id);
  return q ? t(locale, q.labelKey) : id;
}
