'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export interface BentoGridProps {
  children: ReactNode;
  className?: string;
}

/** Bento 错落网格：移动端单列，md 两列，lg 十二列错落排布 */
export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div
      className={cn(
        'grid w-full grid-cols-1 items-start gap-4 md:grid-cols-2 lg:grid-cols-12 lg:gap-5',
        className,
      )}
    >
      {children}
    </div>
  );
}

export interface BentoItemProps {
  children: ReactNode;
  className?: string;
  /** 锚点 id，供底部快捷栏跳转 */
  id?: string;
}

/** Bento 单元格：由使用方通过 className 指定 col-span / row-span 实现非等宽错落 */
export function BentoItem({ children, className, id }: BentoItemProps) {
  return (
    <div id={id} className={cn('min-w-0 scroll-mt-24', className)}>
      {children}
    </div>
  );
}