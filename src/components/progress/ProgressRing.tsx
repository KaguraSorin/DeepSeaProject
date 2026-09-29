'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

export interface ProgressRingProps {
  /** 0-100 */
  value: number;
  size?: number;
  stroke?: number;
  /** 环内主文字，如 '62%' */
  label?: string;
  /** 环内小字，如 '总进度' */
  sublabel?: string;
  /** 默认 aurora */
  color?: string;
  className?: string;
}

/** 进度环：SVG 双环 + 渐变进度弧；中心数字滚动。 */
export function ProgressRing({
  value,
  size = 132,
  stroke = 10,
  label,
  sublabel,
  color = '#9373BC',
  className,
}: ProgressRingProps) {
  const rawId = useId();
  const gid = `ring-grad-${rawId.replace(/[^a-zA-Z0-9]/g, '')}`;
  const reduced = useReducedMotion();

  const v = Math.max(0, Math.min(100, value));
  const r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;
  const offset = C * (1 - v / 100);
  const center = size / 2;

  // 数字滚动（reduced-motion 时直接赋值）
  const [display, setDisplay] = useState(Math.round(v));
  const prevRef = useRef(Math.round(v));
  useEffect(() => {
    const to = Math.round(v);
    if (reduced) {
      setDisplay(to);
      prevRef.current = to;
      return;
    }
    const from = prevRef.current;
    if (from === to) return;
    const start = performance.now();
    const dur = 700;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        prevRef.current = to;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [v, reduced]);

  // label 为纯百分比时同样使用滚动数字
  const main =
    label === undefined ? `${display}%` : /^\d+%$/.test(label) ? `${display}%` : label;

  return (
    <div
      className={cn('relative inline-grid place-items-center', className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`进度 ${Math.round(v)}%${sublabel ? `，${sublabel}` : ''}`}
      >
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor="#5EE7FF" />
          </linearGradient>
        </defs>

        {/* 底环 */}
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke="rgba(247,244,255,0.10)"
          strokeWidth={stroke}
        />

        {/* 进度弧 */}
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke={`url(#${gid})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${C}`}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${center} ${center})`}
          style={{
            transition: reduced ? 'none' : 'stroke-dashoffset 0.9s cubic-bezier(0.16,1,0.3,1)',
          }}
        />
      </svg>

      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="text-2xl font-bold tabular-nums text-text-1">{main}</div>
          {sublabel && <div className="mt-0.5 text-xs text-text-2">{sublabel}</div>}
        </div>
      </div>
    </div>
  );
}