'use client';

import { cn } from '@/lib/utils/cn';

export type EmotionTone = 'calm' | 'cheer' | 'focus';

export interface EmotionBadgeProps {
  text: string;
  tone?: EmotionTone;
  className?: string;
}

const TONE_COLOR: Record<EmotionTone, string> = {
  calm: '#9373BC',
  cheer: '#7BFFCB',
  focus: '#5EE7FF',
};

/** 情绪胶囊：tone 决定主色，带轻微呼吸动画（transform / opacity）。 */
export function EmotionBadge({ text, tone = 'calm', className }: EmotionBadgeProps) {
  const color = TONE_COLOR[tone];

  return (
    <span
      title={text}
      className={cn(
        'inline-flex max-w-full items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium leading-5 animate-breathe',
        className,
      )}
      style={{ color, borderColor: `${color}66`, background: `${color}1f` }}
    >
      <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: color }} />
      <span className="truncate whitespace-nowrap">{text}</span>
    </span>
  );
}