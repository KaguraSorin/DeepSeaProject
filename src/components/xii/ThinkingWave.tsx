'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { AGENT_NAME } from '@/lib/config/site';

export interface ThinkingWaveProps {
  label?: string;
  className?: string;
}

const BARS = [0, 1, 2, 3, 4];

/** 思考波浪：五条竖条交错起伏，仅动画 transform / opacity。 */
export function ThinkingWave({ label = `${AGENT_NAME}正在思考…`, className }: ThinkingWaveProps) {
  const reduced = useReducedMotion();

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn('inline-flex items-center gap-2', className)}
    >
      <span className="flex h-4 items-end gap-[3px]" aria-hidden>
        {BARS.map((i) => (
          <motion.span
            key={i}
            className="w-[3px] rounded-full"
            style={{
              height: 16,
              transformOrigin: '50% 100%',
              background: 'linear-gradient(180deg, #5EE7FF, #9373BC)',
            }}
            animate={
              reduced
                ? { scaleY: 0.45, opacity: 0.55 }
                : { scaleY: [0.35, 1, 0.35], opacity: [0.5, 1, 0.5] }
            }
            transition={
              reduced
                ? { duration: 0 }
                : { duration: 1.1, repeat: Infinity, ease: 'easeInOut', delay: i * 0.12 }
            }
          />
        ))}
      </span>
      {label && <span className="text-xs text-text-2">{label}</span>}
    </div>
  );
}