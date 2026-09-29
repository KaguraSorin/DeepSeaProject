'use client';

import { useRef, type ReactNode } from 'react';
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

export interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  /** 磁吸强度（位移像素上限） */
  strength?: number;
  disabled?: boolean;
  ariaLabel?: string;
}

/** 磁吸按钮：鼠标靠近时轻微吸附跟随，仅使用 transform。 */
export function MagneticButton({
  children,
  className,
  onClick,
  strength = 10,
  disabled,
  ariaLabel,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 18 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 18 });

  function move(e: React.PointerEvent) {
    if (reduced || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    x.set(dx * strength);
    y.set(dy * strength);
  }
  function reset() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={move}
      onPointerLeave={reset}
      style={{ x, y }}
      className={cn('inline-block', className)}
    >
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={ariaLabel}
        className="inline-flex items-center justify-center disabled:cursor-not-allowed disabled:opacity-45"
      >
        {children}
      </button>
    </motion.div>
  );
}