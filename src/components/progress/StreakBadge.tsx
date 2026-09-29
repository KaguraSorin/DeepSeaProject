'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Droplets, Flame } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { GlassCard } from '@/components/ui/GlassCard';
import { GradientButton } from '@/components/ui/GradientButton';

export interface StreakBadgeProps {
  /** 连续打卡天数 */
  streak: number;
  /** 今天是否已打卡 */
  checkedToday?: boolean;
  onCheckin?: () => void;
  className?: string;
}

/** 连续打卡徽章：火焰徽章 + 大号数字 + 打卡入口。 */
export function StreakBadge({ streak, checkedToday = false, onCheckin, className }: StreakBadgeProps) {
  const reduced = useReducedMotion();
  const days = Math.max(0, Math.round(streak));

  return (
    <GlassCard className={cn('relative overflow-hidden', className)} hover={false}>
      <div
        role="group"
        aria-label={`连续打卡 ${days} 天，${checkedToday ? '今日已打卡' : '今日还未打卡'}`}
        className="flex items-center gap-4"
      >
        <motion.span
          aria-hidden="true"
          className="relative grid h-14 w-14 shrink-0 place-items-center rounded-2xl"
          style={{
            background: 'linear-gradient(140deg, rgba(147,115,188,0.38), rgba(94,231,255,0.18))',
            boxShadow: '0 0 22px rgba(147,115,188,0.35)',
          }}
          animate={reduced ? { opacity: 0.95 } : { scale: [1, 1.05, 1], opacity: [0.85, 1, 0.85] }}
          transition={reduced ? undefined : { duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Flame size={26} className="text-[#FFB27A]" />
        </motion.span>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold tabular-nums text-text-1">{days}</span>
            <span className="text-sm text-text-2">天</span>
          </div>
          <p className="mt-0.5 text-xs text-text-2">连续打卡 {days} 天</p>
        </div>
      </div>

      <div className="mt-4">
        {checkedToday ? (
          <div
            className="flex items-center justify-center gap-2 rounded-2xl border border-[rgba(123,255,203,0.35)] bg-[rgba(123,255,203,0.10)] px-4 py-2.5 text-sm font-medium text-mint"
            aria-label="今日已打卡"
          >
            <Droplets size={16} />
            今日已打卡
          </div>
        ) : (
          <GradientButton fullWidth onClick={onCheckin} ariaLabel="今日打卡">
            <Droplets size={16} />
            今日打卡
          </GradientButton>
        )}
      </div>
    </GlassCard>
  );
}