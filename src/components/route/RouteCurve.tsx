'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export interface RouteCurveProps {
  /** SVG path d 字符串 */
  d: string;
  /** 0-1，已绘制比例 */
  progress?: number;
  color?: string;
  className?: string;
}

/**
 * 航线曲线：底层暗色航线 + 上层流光。
 * 通过 strokeDasharray / strokeDashoffset 表现「逐段绘制」，仅动描边、不动布局属性。
 */
export function RouteCurve({ d, progress = 1, color = '#5EE7FF', className }: RouteCurveProps) {
  const rawId = useId();
  const gid = `route-grad-${rawId.replace(/[^a-zA-Z0-9]/g, '')}`;
  const ref = useRef<SVGPathElement>(null);
  const [len, setLen] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    try {
      const total = el.getTotalLength();
      if (total) setLen(total);
    } catch {
      setLen(0);
    }
  }, [d]);

  const drawn = reduced ? 1 : Math.max(0, Math.min(1, progress));
  const offset = len ? len * (1 - drawn) : 0;
  const showGlow = len > 0;

  return (
    <g className={className} aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="45%" stopColor={color} />
          <stop offset="100%" stopColor="#7BFFCB" />
        </linearGradient>
      </defs>

      {/* 海湾暗底：低透明度大描边 */}
      <path d={d} fill="none" stroke="rgba(94,231,255,0.08)" strokeWidth={13} strokeLinecap="round" />
      {/* 底层航线 */}
      <path d={d} fill="none" stroke="rgba(147,115,188,0.22)" strokeWidth={6} strokeLinecap="round" />

      {/* 上层流光：逐段绘制 */}
      <path
        ref={ref}
        d={d}
        fill="none"
        stroke={`url(#${gid})`}
        strokeWidth={3.4}
        strokeLinecap="round"
        strokeDasharray={showGlow ? `${len}` : undefined}
        strokeDashoffset={offset}
        style={{
          transition: reduced ? 'none' : 'stroke-dashoffset 1.6s ease-out',
          opacity: showGlow || reduced ? 1 : 0,
        }}
      />

      {/* 流动光点：沿航线缓慢前进 */}
      {!reduced && (
        <motion.path
          d={d}
          fill="none"
          stroke="rgba(247,244,255,0.55)"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeDasharray="3 24"
          initial={{ strokeDashoffset: 0, opacity: 0 }}
          animate={{ strokeDashoffset: -54, opacity: drawn > 0 ? 0.6 : 0 }}
          transition={{
            strokeDashoffset: { duration: 3.4, repeat: Infinity, ease: 'linear' },
            opacity: { duration: 0.8 },
          }}
        />
      )}
    </g>
  );
}