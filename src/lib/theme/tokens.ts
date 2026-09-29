import type { StageTheme } from '@/types/plan';

/** 设计令牌：与 globals.css / tailwind.config 保持一致 */
export const TOKENS = {
  midnight: '#191B41',
  indigo: '#3C3B80',
  aurora: '#9373BC',
  cyan: '#5EE7FF',
  mint: '#7BFFCB',
  text1: '#F7F4FF',
  text2: '#C9C4E6',
  glass: 'rgba(247,244,255,0.06)',
  glassBorder: 'rgba(247,244,255,0.14)',
} as const;

/** 阶段主题 → 主色（控制点缀不超 2 个：cyan / mint 仅作强调） */
export const STAGE_THEME_COLOR: Record<StageTheme, string> = {
  indigo: '#3C3B80',
  aurora: '#9373BC',
  cyan: '#5EE7FF',
  mint: '#7BFFCB',
};

export const STAGE_THEME_LABEL: Record<StageTheme, string> = {
  indigo: '深潜',
  aurora: '极光',
  cyan: '洋流',
  mint: '新生',
};

/** 阶段默认在 indigo / aurora 间循环；进行中阶段临时用 cyan 高亮 */
export function stageThemeByIndex(index: number, isCurrent = false): StageTheme {
  if (isCurrent) return 'cyan';
  return index % 2 === 0 ? 'indigo' : 'aurora';
}

/** 任务类型 → 展示信息 */
export const TASK_TYPE_META = {
  study: { label: '学习', color: '#9373BC' },
  practice: { label: '练习', color: '#5EE7FF' },
  review: { label: '复习', color: '#7BFFCB' },
  rest: { label: '休息', color: '#C9C4E6' },
} as const;