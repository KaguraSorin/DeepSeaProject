'use client';

import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface RippleItem {
  id: number;
  x: number;
  y: number;
}

export interface RippleProps {
  children: ReactNode;
  className?: string;
  color?: string;
}

/** 点击涟漪：点击处扩散一圈水波，仅动画 transform/opacity。 */
export function Ripple({ children, className, color = 'rgba(147,115,188,0.5)' }: RippleProps) {
  const [ripples, setRipples] = useState<RippleItem[]>([]);

  function add(e: React.MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    const id = Date.now() + Math.random();
    setRipples((prev) => [...prev, { id, x: e.clientX - r.left, y: e.clientY - r.top }]);
    setTimeout(() => setRipples((prev) => prev.filter((p) => p.id !== id)), 650);
  }

  return (
    <div className={cn('relative overflow-hidden', className)} onClick={add}>
      {children}
      {ripples.map((rp) => (
        <span
          key={rp.id}
          aria-hidden
          className="pointer-events-none absolute rounded-full"
          style={{
            left: rp.x,
            top: rp.y,
            width: 12,
            height: 12,
            marginLeft: -6,
            marginTop: -6,
            background: `radial-gradient(circle, ${color}, transparent 70%)`,
            animation: 'ripple 0.65s ease-out forwards',
          }}
        />
      ))}
      <style jsx global>{`
        @keyframes ripple {
          from {
            transform: scale(0);
            opacity: 0.8;
          }
          to {
            transform: scale(24);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}