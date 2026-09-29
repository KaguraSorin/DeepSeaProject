'use client';

import { useRef, type ReactNode } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

export interface GlassCardProps {
  children: ReactNode;
  className?: string;
  /** 桌面端 3D 倾斜跟随鼠标 */
  tilt?: boolean;
  /** 悬停描边发光 */
  hover?: boolean;
  padded?: boolean;
  onClick?: () => void;
  as?: 'div' | 'section' | 'article' | 'aside';
}

/**
 * 玻璃卡片原语：玻璃底 + 描边 + 可选 3D 倾斜。
 * 仅使用 transform / opacity 动画；减少动态或窄屏时自动禁用倾斜。
 */
export function GlassCard({
  children,
  className,
  tilt = false,
  hover = true,
  padded = true,
  onClick,
  as = 'div',
}: GlassCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [6, -6]), { stiffness: 140, damping: 18 });
  const ry = useSpring(useTransform(mx, [0, 1], [-6, 6]), { stiffness: 140, damping: 18 });
  const on = tilt && !reduced;

  const Comp: any = motion[as] || motion.div;

  function handleMove(e: React.PointerEvent) {
    if (!on || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  }
  function handleLeave() {
    mx.set(0.5);
    my.set(0.5);
  }

  return (
    <Comp
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      onClick={onClick}
      style={on ? { rotateX: rx, rotateY: ry, transformPerspective: 1000 } : undefined}
      className={cn(
        'glass gpu relative rounded-3xl shadow-glass transition-colors duration-300',
        hover && 'hover:border-[rgba(147,115,188,0.5)]',
        padded && 'p-5 sm:p-6',
        onClick && 'cursor-pointer',
        className,
      )}
    >
      {children}
    </Comp>
  );
}