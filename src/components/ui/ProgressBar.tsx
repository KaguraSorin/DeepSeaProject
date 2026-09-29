'use client';

import { cn } from '@/lib/utils/cn';

export interface ProgressBarProps {
  /** 0–100 */
  value: number;
  className?: string;
  color?: string;
  height?: number;
  showLabel?: boolean;
  label?: string;
}

/** 线性进度条：渐变填充 + 平滑过渡。 */
export function ProgressBar({
  value,
  className,
  color = '#9373BC',
  height = 8,
  showLabel = false,
  label,
}: ProgressBarProps) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="mb-1.5 flex items-center justify-between text-xs text-text-2">
          <span>{label}</span>
          <span className="tabular-nums">{v}%</span>
        </div>
      )}
      <div
        className="w-full overflow-hidden rounded-full bg-[rgba(247,244,255,0.10)]"
        style={{ height }}
        role="progressbar"
        aria-valuenow={v}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || '进度'}
      >
        <div
          className="h-full rounded-full transition-[width] duration-700 ease-out"
          style={{
            width: `${v}%`,
            background: `linear-gradient(90deg, ${color}, #5EE7FF)`,
          }}
        />
      </div>
    </div>
  );
}