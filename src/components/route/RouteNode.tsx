'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { Stage } from '@/types/plan';
import { STAGE_THEME_COLOR } from '@/lib/theme/tokens';

export interface RouteNodeProps {
  stage: Stage;
  x: number;
  y: number;
  status: 'locked' | 'active' | 'done';
  progress: number; // 0-100
  selected?: boolean;
  onSelect?: () => void;
}

const R = 22; // 岛屿半径
const R2 = 15; // 内圈进度弧半径
const C2 = 2 * Math.PI * R2;

/**
 * 航线岛屿节点：SVG <g>，可聚焦、可键盘触发。
 * 未开始 = indigo 半透明；进行中 = aurora/cyan 呼吸发光；完成 = mint 微光。
 */
export function RouteNode({ stage, x, y, status, progress, selected, onSelect }: RouteNodeProps) {
  const reduced = useReducedMotion();
  const [hover, setHover] = useState(false);

  const themeColor = STAGE_THEME_COLOR[stage.theme] || '#9373BC';
  const activeColor = stage.theme === 'cyan' ? '#5EE7FF' : '#9373BC';
  const p = Math.max(0, Math.min(100, Math.round(progress)));

  const color = status === 'done' ? '#7BFFCB' : status === 'active' ? activeColor : '#4A488F';
  const fill =
    status === 'done'
      ? 'rgba(123,255,203,0.18)'
      : status === 'active'
        ? `${activeColor}33`
        : 'rgba(60,59,128,0.38)';

  const ringColor = selected ? '#5EE7FF' : hover ? themeColor : 'rgba(147,115,188,0.5)';
  const dash2 = (C2 * p) / 100;

  const title = stage.title.length > 9 ? `${stage.title.slice(0, 9)}…` : stage.title;
  const labelW = Math.max(title.length * 12.5, 60) + 20;
  const statusText = status === 'done' ? '已完成' : status === 'active' ? '进行中' : '未开始';

  function activate() {
    onSelect?.();
  }

  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={`${stage.title}，进度 ${p}%，${statusText}`}
      aria-pressed={!!selected}
      onClick={activate}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activate();
        }
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ cursor: 'pointer', outline: 'none' }}
    >
      {/* 进行中：呼吸发光外环 */}
      {status === 'active' && (
        <motion.circle
          cx={x}
          cy={y}
          r={R + 8}
          fill="none"
          stroke={activeColor}
          strokeWidth={2}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
          animate={
            reduced ? { opacity: 0.45 } : { opacity: [0.22, 0.6, 0.22], scale: [1, 1.12, 1] }
          }
          transition={reduced ? undefined : { duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* 完成：mint 微光 */}
      {status === 'done' && (
        <circle cx={x} cy={y} r={R + 6} fill="none" stroke="rgba(123,255,203,0.35)" strokeWidth={1.5} />
      )}

      {/* 选中 / 悬停：外环高亮 */}
      {(selected || hover) && (
        <circle
          cx={x}
          cy={y}
          r={R + 12}
          fill="none"
          stroke={ringColor}
          strokeWidth={selected ? 2 : 1.4}
          strokeDasharray={selected ? '5 6' : undefined}
        />
      )}

      {/* 岛屿本体 */}
      <circle cx={x} cy={y} r={R} fill={fill} stroke={color} strokeWidth={2} />

      {/* 内圈：进度底环 + 进度弧 */}
      <circle cx={x} cy={y} r={R2} fill="none" stroke="rgba(247,244,255,0.14)" strokeWidth={3} />
      <circle
        cx={x}
        cy={y}
        r={R2}
        fill="none"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
        strokeDasharray={`${C2}`}
        strokeDashoffset={C2 - dash2}
        transform={`rotate(-90 ${x} ${y})`}
      />

      {/* 阶段序号 */}
      <text
        x={x}
        y={y + 4.5}
        textAnchor="middle"
        fontSize={13}
        fontWeight={700}
        fill="#F7F4FF"
        style={{ pointerEvents: 'none' }}
      >
        {stage.index + 1}
      </text>

      {/* 文字标注：半透明底垫 + 轻微描边，保证深色底可读 */}
      <g style={{ pointerEvents: 'none' }}>
        <rect
          x={x - labelW / 2}
          y={y + 28}
          width={labelW}
          height={44}
          rx={12}
          fill="rgba(18,20,48,0.74)"
          stroke="rgba(247,244,255,0.10)"
        />
        <text
          x={x}
          y={y + 46}
          textAnchor="middle"
          fontSize={12}
          fontWeight={600}
          fill="#F7F4FF"
          stroke="rgba(18,20,48,0.9)"
          strokeWidth={0.6}
          style={{ paintOrder: 'stroke' }}
        >
          {title}
        </text>
        <text
          x={x}
          y={y + 64}
          textAnchor="middle"
          fontSize={11}
          fontWeight={600}
          fill={status === 'done' ? '#7BFFCB' : status === 'active' ? activeColor : '#C9C4E6'}
        >
          {p}%
        </text>
      </g>
    </g>
  );
}