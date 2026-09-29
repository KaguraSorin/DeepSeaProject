'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { CalendarDays, PartyPopper, Sparkles } from 'lucide-react';
import type { LearningPlan, Task } from '@/types/plan';
import { cn } from '@/lib/utils/cn';
import { diffFromToday, formatCN, todayISO } from '@/lib/utils/date';
import { GlassCard } from '@/components/ui/GlassCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { TaskCard } from './TaskCard';

export interface TodayTasksProps {
  plan: LearningPlan | null;
  onToggle: (taskId: string) => void;
  className?: string;
}

const BURST = [
  { x: -14, y: -10 },
  { x: 12, y: -14 },
  { x: 18, y: 4 },
  { x: -16, y: 8 },
  { x: 0, y: -18 },
];

/** 今日任务：按 todayISO 从计划中收集任务；无今日任务时回退到最近一天。 */
export function TodayTasks({ plan, onToggle, className }: TodayTasksProps) {
  const reduced = useReducedMotion();
  const today = todayISO();

  const allTasks = useMemo(() => (plan ? plan.stages.flatMap((s) => s.tasks) : []), [plan]);
  const todayTasks = useMemo(() => allTasks.filter((t) => t.date === today), [allTasks, today]);

  const fallback = useMemo(() => {
    if (todayTasks.length || !allTasks.length) return null;
    const dates = Array.from(new Set(allTasks.map((t) => t.date)));
    dates.sort((a, b) => Math.abs(diffFromToday(a)) - Math.abs(diffFromToday(b)));
    const nearest = dates[0];
    return { date: nearest, tasks: allTasks.filter((t) => t.date === nearest) };
  }, [todayTasks, allTasks]);

  const shown: Task[] = todayTasks.length ? todayTasks : fallback?.tasks ?? [];
  const shownDate = todayTasks.length ? today : fallback?.date ?? today;
  const total = shown.length;
  const doneCount = shown.filter((t) => t.done).length;
  const pct = total ? Math.round((doneCount / total) * 100) : 0;
  const allDone = total > 0 && doneCount === total;
  const isFallback = todayTasks.length === 0 && !!fallback;

  const [celebrate, setCelebrate] = useState(false);
  useEffect(() => {
    if (!allDone || reduced) return;
    setCelebrate(true);
    const t = setTimeout(() => setCelebrate(false), 1000);
    return () => clearTimeout(t);
  }, [allDone, reduced]);

  if (!plan) {
    return (
      <GlassCard className={cn(className)} hover={false}>
        <div className="flex items-center gap-2 text-text-1">
          <CalendarDays size={18} className="text-aurora" />
          <h3 className="text-base font-semibold">今日任务</h3>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-text-2">
          还没有航线。生成计划后，今天的任务会在这里等你靠岸。
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className={cn('relative overflow-hidden', className)} hover={false}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-text-1">
          <CalendarDays size={18} className="text-aurora" />
          <h3 className="text-base font-semibold">今日任务</h3>
        </div>
        <span className="text-xs text-text-2">{formatCN(shownDate)}</span>

        {/* 气泡爆开反馈 */}
        <AnimatePresence>
          {celebrate &&
            BURST.map((b, i) => (
              <motion.span
                key={i}
                aria-hidden="true"
                className="pointer-events-none absolute right-5 top-4 h-2 w-2 rounded-full bg-mint"
                initial={{ opacity: 0.9, x: 0, y: 0, scale: 0.5 }}
                animate={{ opacity: 0, x: b.x, y: b.y, scale: 1.2 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            ))}
        </AnimatePresence>
      </div>

      <div className="mt-3">
        <ProgressBar
          value={pct}
          color={allDone ? '#7BFFCB' : '#9373BC'}
          showLabel
          label={`已完成 ${doneCount}/${total}`}
        />
      </div>

      {isFallback && (
        <p className="mt-3 rounded-xl bg-[rgba(147,115,188,0.10)] px-3 py-2 text-xs leading-relaxed text-text-2">
          今天不在计划范围内，先为你展示最近一天（{formatCN(shownDate)}）的任务。
        </p>
      )}

      {total > 0 ? (
        <ul className="mt-3 space-y-2.5">
          {shown.map((t) => (
            <li key={t.id}>
              <TaskCard task={t} onToggle={() => onToggle(t.id)} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-text-2">这一天还没有排上任务，好好休息一下也很重要。</p>
      )}

      {allDone && (
        <p className="mt-3 flex items-center justify-center gap-1.5 text-sm font-medium text-mint">
          <PartyPopper size={15} />
          今天的航线全部点亮，辛苦啦，去吹吹海风吧
        </p>
      )}

      {!allDone && total > 0 && (
        <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-text-2">
          <Sparkles size={13} className="text-aurora" />
          一次一小步，海面会慢慢亮起来
        </p>
      )}
    </GlassCard>
  );
}