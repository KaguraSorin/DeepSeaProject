'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Anchor, Compass, Flag, Sparkles, Target } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';
import type { LearningPlan, Stage } from '@/types/plan';
import { cn } from '@/lib/utils/cn';
import { createRng } from '@/lib/utils/id';
import { formatCN } from '@/lib/utils/date';
import { STAGE_THEME_COLOR, STAGE_THEME_LABEL } from '@/lib/theme/tokens';
import { GlassCard } from '@/components/ui/GlassCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Collapsible } from '@/components/ui/Collapsible';
import { Tag } from '@/components/ui/Tag';
import { RouteCurve } from './RouteCurve';
import { RouteNode } from './RouteNode';

export interface OceanRouteMapProps {
  plan: LearningPlan | null;
  selectedStageId?: string | null;
  onSelectStage?: (stageId: string | null) => void;
  className?: string;
}

const VB_W = 800;
const VB_H = 360;
const PAD_X = 92;

function stageProgress(stage: Stage): number {
  const total = stage.tasks.length;
  if (!total) return 0;
  const done = stage.tasks.filter((t) => t.done).length;
  return Math.round((done / total) * 100);
}

/** 沿蛇形/C 形曲线依次分布节点坐标（确定，不随机） */
function layoutNodes(count: number): { x: number; y: number }[] {
  if (count <= 0) return [];
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0.5 : i / (count - 1);
    const x = PAD_X + t * (VB_W - PAD_X * 2);
    const y = VB_H / 2 + Math.sin(t * Math.PI * 1.6) * 78;
    pts.push({ x, y });
  }
  return pts;
}

/** Catmull-Rom → 三次贝塞尔，得到平滑航线 */
function smoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) {
    const p = points[0];
    return `M ${p.x} ${p.y} l 0.01 0`;
  }
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${p2.x} ${p2.y}`;
  }
  return d;
}

/** 空状态灯塔插画 */
function Lighthouse() {
  return (
    <svg width="120" height="90" viewBox="0 0 120 90" aria-hidden="true">
      <defs>
        <linearGradient id="lh-beam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5EE7FF" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#5EE7FF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M60 14 L52 48 L68 48 Z" fill="#3C3B80" opacity="0.9" />
      <rect x="52" y="46" width="16" height="4" rx="2" fill="#9373BC" />
      <circle cx="60" cy="11" r="5" fill="#5EE7FF" />
      <path d="M60 11 L26 5 L26 17 Z" fill="url(#lh-beam)" opacity="0.55" />
      <path d="M60 11 L94 5 L94 17 Z" fill="url(#lh-beam)" opacity="0.55" />
      <path
        d="M0 68 Q 20 58 40 68 T 80 68 T 120 68 L120 90 L0 90 Z"
        fill="rgba(60,59,128,0.45)"
      />
      <path
        d="M0 76 Q 24 68 48 76 T 96 76 T 120 76 L120 90 L0 90 Z"
        fill="rgba(94,231,255,0.16)"
      />
    </svg>
  );
}

export function OceanRouteMap({
  plan,
  selectedStageId,
  onSelectStage,
  className,
}: OceanRouteMapProps) {
  const reduced = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [drawn, setDrawn] = useState(false);

  const stages = plan?.stages ?? [];
  const points = useMemo(() => layoutNodes(stages.length), [stages.length]);
  const path = useMemo(() => smoothPath(points), [points]);

  // 进入可视区时触发一次逐段绘制
  useEffect(() => {
    if (reduced) {
      setDrawn(true);
      return;
    }
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setDrawn(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setDrawn(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced, stages.length]);

  // 固定种子气泡，避免 SSR / CSR 不一致
  const bubbles = useMemo(() => {
    const rng = createRng(20250928);
    return Array.from({ length: 8 }, (_, i) => ({
      id: i,
      cx: 40 + rng() * (VB_W - 80),
      cy: 50 + rng() * (VB_H - 100),
      r: 3 + rng() * 7,
      o: 0.05 + rng() * 0.08,
      dur: 6 + rng() * 5,
      delay: rng() * 4,
    }));
  }, []);

  const selected = stages.find((s) => s.id === selectedStageId) || null;

  if (!plan) {
    return (
      <GlassCard className={cn('relative overflow-hidden', className)} hover={false}>
        <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
          <Lighthouse />
          <div>
            <p className="text-sm font-medium text-text-1">航线还没有点亮</p>
            <p className="mt-1 text-xs leading-relaxed text-text-2">
              生成你的学习计划后，这里会长出一条通往目标的发光航线。
            </p>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className={cn('relative overflow-hidden', className)} hover={false}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Compass size={18} className="text-cyan" />
          <h3 className="text-base font-semibold text-text-1">海洋航线图</h3>
        </div>
        <span className="text-xs text-text-2">{stages.length} 个阶段</span>
      </div>

      <div ref={wrapRef} className="no-scrollbar mt-3 w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="学习阶段航线图"
          className="h-auto w-full min-w-[620px] sm:min-w-0"
        >
          <defs>
            <radialGradient id="route-sea" cx="50%" cy="45%" r="72%">
              <stop offset="0%" stopColor="rgba(60,59,128,0.32)" />
              <stop offset="100%" stopColor="rgba(25,27,65,0)" />
            </radialGradient>
          </defs>
          <rect x="0" y="0" width={VB_W} height={VB_H} rx="24" fill="url(#route-sea)" />

          {/* 低透明度漂浮气泡（不遮挡文字） */}
          {bubbles.map((b) => (
            <circle
              key={b.id}
              cx={b.cx}
              cy={b.cy}
              r={b.r}
              fill="rgba(247,244,255,0.9)"
              opacity={b.o}
              className={reduced ? undefined : 'animate-float'}
              style={
                reduced
                  ? undefined
                  : {
                      transformBox: 'fill-box',
                      transformOrigin: 'center',
                      animationDuration: `${b.dur}s`,
                      animationDelay: `${b.delay}s`,
                    }
              }
            />
          ))}

          <RouteCurve d={path} progress={drawn ? 1 : 0} />

          {stages.map((stage, i) => {
            const pt = points[i];
            if (!pt) return null;
            const p = stageProgress(stage);
            const status: 'locked' | 'active' | 'done' =
              p >= 100 ? 'done' : p > 0 ? 'active' : 'locked';
            return (
              <RouteNode
                key={stage.id}
                stage={stage}
                x={pt.x}
                y={pt.y}
                status={status}
                progress={p}
                selected={selectedStageId === stage.id}
                onSelect={() => onSelectStage?.(selectedStageId === stage.id ? null : stage.id)}
              />
            );
          })}
        </svg>
      </div>

      {selected ? (
        <div className="mt-4 rounded-2xl border border-[rgba(94,231,255,0.28)] bg-[rgba(94,231,255,0.06)] p-4">
          <div className="flex items-center justify-between gap-3">
            <h4 className="flex min-w-0 items-center gap-2 text-sm font-semibold text-text-1">
              <Target size={15} className="shrink-0 text-cyan" />
              <span className="truncate">
                第 {selected.index + 1} 站 · {selected.title}
              </span>
            </h4>
            <Tag color={STAGE_THEME_COLOR[selected.theme]}>{STAGE_THEME_LABEL[selected.theme]}</Tag>
          </div>

          <p className="mt-2 text-xs leading-relaxed text-text-2">{selected.goal}</p>
          <p className="mt-1 text-xs text-text-2">
            周期：{formatCN(selected.startDate)} — {formatCN(selected.endDate)}
          </p>

          <div className="mt-3">
            <ProgressBar
              value={stageProgress(selected)}
              color={STAGE_THEME_COLOR[selected.theme]}
              showLabel
              label="阶段进度"
            />
          </div>

          {selected.milestones.length > 0 && (
            <div className="mt-3">
              <Collapsible title="里程碑" icon={<Flag size={14} className="text-aurora" />} defaultOpen>
                <ul className="space-y-2">
                  {selected.milestones.slice(0, 3).map((m) => (
                    <li key={m.id} className="flex items-start gap-2 text-xs text-text-2">
                      <Sparkles size={13} className="mt-0.5 shrink-0 text-mint" />
                      <span>
                        <span className="text-text-1">{m.title}</span>
                        {m.description ? ` · ${m.description}` : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              </Collapsible>
            </div>
          )}
        </div>
      ) : (
        <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-text-2">
          <Anchor size={13} className="text-aurora" />
          点一点航线上的岛屿，看看那一站的风景
        </p>
      )}
    </GlassCard>
  );
}