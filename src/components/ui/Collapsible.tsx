'use client';

import { useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface CollapsibleProps {
  title: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
  /** 右侧附加内容（不参与折叠） */
  right?: ReactNode;
  icon?: ReactNode;
}

/** 可折叠模块：标题栏 + 展开内容，用于 Bento 卡片收纳。 */
export function Collapsible({
  title,
  children,
  defaultOpen = true,
  className,
  right,
  icon,
}: CollapsibleProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-center gap-2 text-left text-sm font-semibold text-text-1 transition-colors hover:text-white"
        >
          {icon}
          <span className="truncate">{title}</span>
          <ChevronDown
            size={16}
            className={cn(
              'shrink-0 text-text-2 transition-transform duration-300',
              open && 'rotate-180',
            )}
          />
        </button>
        {right}
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pt-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}