'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { BookOpen, Clock3, Link2 } from 'lucide-react';
import type { Task } from '@/types/plan';
import { cn } from '@/lib/utils/cn';
import { TASK_TYPE_META } from '@/lib/theme/tokens';
import { Tag } from '@/components/ui/Tag';

export interface TaskCardProps {
  task: Task;
  onToggle: () => void;
  /** 强调色，默认取 TASK_TYPE_META[task.type].color */
  accent?: string;
  className?: string;
}

const BURST = [
  { x: -11, y: -10 },
  { x: 11, y: -12 },
  { x: 14, y: 7 },
  { x: -12, y: 9 },
  { x: 0, y: -16 },
];

/** 今日任务卡片：自定义圆形复选框 + 完成气泡反馈，整卡可点击/键盘可达。 */
export function TaskCard({ task, onToggle, accent, className }: TaskCardProps) {
  const meta = TASK_TYPE_META[task.type] || TASK_TYPE_META.study;
  const color = accent || meta.color;
  const reduced = useReducedMotion();

  const [burst, setBurst] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  function handleToggle() {
    if (!task.done && !reduced) {
      setBurst(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setBurst(false), 620);
    }
    onToggle();
  }

  const isResourceLink = !!task.resource && /^https?:/i.test(task.resource);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={task.done}
      aria-label={`${task.title}，${task.done ? '已完成' : '未完成'}`}
      onClick={handleToggle}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleToggle();
        }
      }}
      className={cn(
        'group flex cursor-pointer items-center gap-3 rounded-2xl border p-3 transition-colors outline-none',
        task.done
          ? 'border-[rgba(123,255,203,0.28)] bg-[rgba(123,255,203,0.06)]'
          : 'border-[rgba(247,244,255,0.12)] bg-[rgba(247,244,255,0.04)] hover:border-[rgba(147,115,188,0.45)]',
        className,
      )}
    >
      {/* 复选框 */}
      <span className="relative grid h-7 w-7 shrink-0 place-items-center">
        {/* 完成时气泡爆开（仅 transform / opacity） */}
        <AnimatePresence>
          {burst &&
            BURST.map((b, i) => (
              <motion.span
                key={i}
                aria-hidden="true"
                className="pointer-events-none absolute h-1.5 w-1.5 rounded-full"
                style={{ background: color }}
                initial={{ opacity: 0.85, x: 0, y: 0, scale: 0.6 }}
                animate={{ opacity: 0, x: b.x, y: b.y, scale: 1.2 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            ))}
        </AnimatePresence>

        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full border-2 transition-colors duration-300"
          style={{
            borderColor: task.done ? '#7BFFCB' : 'rgba(247,244,255,0.35)',
            background: task.done
              ? 'linear-gradient(135deg, #7BFFCB, #5EE7FF)'
              : 'transparent',
          }}
        />
        <AnimatePresence>
          {task.done && (
            <motion.span
              key="check"
              className="relative grid place-items-center text-[#12203a]"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={3.2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <motion.path
                  d="M4 12.5 L9.5 18 L20 6.5"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.34, ease: 'easeOut' }}
                />
              </svg>
            </motion.span>
          )}
        </AnimatePresence>
      </span>

      {/* 内容 */}
      <div className={cn('min-w-0 flex-1 transition-opacity', task.done && 'opacity-70')}>
        <span
          className={cn(
            'block truncate text-sm font-medium',
            task.done ? 'text-text-2 line-through' : 'text-text-1',
          )}
        >
          {task.title}
        </span>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-text-2">
          <Tag color={meta.color}>{meta.label}</Tag>
          <span className="inline-flex items-center gap-1">
            <Clock3 size={12} />
            {task.durationMin} 分钟
          </span>
          {task.resource && (
            <span className="inline-flex min-w-0 items-center gap-1">
              {isResourceLink ? <Link2 size={12} /> : <BookOpen size={12} />}
              <span className="truncate">{task.resource}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}