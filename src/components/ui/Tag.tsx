'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export interface TagProps {
  children: ReactNode;
  /** 十六进制强调色，默认 aurora */
  color?: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

/** 标签/胶囊：用于任务类型、阶段主题、筛选等。 */
export function Tag({ children, color = '#9373BC', active = true, onClick, className }: TagProps) {
  return (
    <span
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium leading-5',
        onClick && 'cursor-pointer transition-transform hover:scale-[1.04]',
        !active && 'opacity-60',
        className,
      )}
      style={{
        color: active ? color : 'var(--text-2)',
        borderColor: active ? `${color}66` : 'rgba(247,244,255,0.14)',
        background: active ? `${color}1f` : 'rgba(247,244,255,0.04)',
      }}
    >
      {children}
    </span>
  );
}