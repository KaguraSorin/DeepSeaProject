'use client';

import { forwardRef } from 'react';
import type { LearningPlan } from '@/types/plan';
import { STAGE_THEME_COLOR } from '@/lib/theme/tokens';
import { AGENT_NAME, SCHOOL_LOGO_SRC, SCHOOL_NAME, SITE_NAME } from '@/lib/config/site';
import { cn } from '@/lib/utils/cn';

export interface SharePosterProps {
  plan: LearningPlan | null;
  className?: string;
}

const W = 760;
const H = 1000;

/**
 * 分享海报：复用真实 DOM 渲染（html-to-image 截图导出），不重复绘制 Canvas。
 * 该节点离屏常驻渲染，确保随时可被捕获。
 */
export const SharePoster = forwardRef<HTMLDivElement, SharePosterProps>(function SharePoster(
  { plan, className },
  ref,
) {
  const total = plan ? plan.stages.reduce((n, s) => n + s.tasks.length, 0) : 0;
  const done = plan ? plan.stages.reduce((n, s) => n + s.tasks.filter((t) => t.done).length, 0) : 0;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const circumference = 2 * Math.PI * 74;

  return (
    <div
      aria-hidden
      className={cn('pointer-events-none', className)}
      style={{ position: 'fixed', left: -99999, top: 0, width: W, height: H, overflow: 'hidden' }}
    >
      <div
        ref={ref}
        style={{
          width: W,
          height: H,
          position: 'relative',
          background:
            'radial-gradient(120% 90% at 18% 0%, #3C3B80 0%, #24264f 40%, #191B41 74%, #12132e 100%)',
          color: '#F7F4FF',
          fontFamily: 'var(--font-sans)',
          padding: 48,
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* 装饰光斑 */}
        <div
          style={{
            position: 'absolute',
            top: -120,
            right: -80,
            width: 420,
            height: 420,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(147,115,188,0.5), transparent 68%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -140,
            left: -100,
            width: 460,
            height: 460,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(94,231,255,0.22), transparent 70%)',
          }}
        />

        {/* 头部：校徽 + 校名 */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={SCHOOL_LOGO_SRC} alt="" width={72} height={72} style={{ width: 72, height: 72 }} />
          <div>
            <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: 1 }}>{SCHOOL_NAME}</div>
            <div style={{ fontSize: 16, color: '#C9C4E6', marginTop: 4 }}>{SITE_NAME}</div>
          </div>
        </div>

        {/* 标题 */}
        <div style={{ position: 'relative', marginTop: 40 }}>
          <div style={{ fontSize: 15, color: '#5EE7FF', letterSpacing: 3 }}>MY LEARNING ROUTE</div>
          <div style={{ fontSize: 44, fontWeight: 800, lineHeight: 1.25, marginTop: 12 }}>
            {plan ? plan.title : '我的深海航线'}
          </div>
          <div style={{ fontSize: 19, color: '#C9C4E6', marginTop: 14, lineHeight: 1.6 }}>
            {plan ? plan.summary : '还没有生成航线，去告诉汐你的目标吧。'}
          </div>
        </div>

        {/* 进度环 + 关键数据 */}
        <div
          style={{
            position: 'relative',
            marginTop: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 40,
            background: 'rgba(247,244,255,0.06)',
            border: '1px solid rgba(247,244,255,0.14)',
            borderRadius: 28,
            padding: 32,
          }}
        >
          <svg width={180} height={180} viewBox="0 0 180 180" style={{ flexShrink: 0 }}>
            <defs>
              <linearGradient id="posterRing" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#9373BC" />
                <stop offset="1" stopColor="#5EE7FF" />
              </linearGradient>
            </defs>
            <circle cx="90" cy="90" r="74" fill="none" stroke="rgba(247,244,255,0.12)" strokeWidth="16" />
            <circle
              cx="90"
              cy="90"
              r="74"
              fill="none"
              stroke="url(#posterRing)"
              strokeWidth="16"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - pct / 100)}
              transform="rotate(-90 90 90)"
            />
            <text
              x="90"
              y="86"
              textAnchor="middle"
              fill="#F7F4FF"
              fontSize="40"
              fontWeight="800"
            >
              {pct}%
            </text>
            <text x="90" y="114" textAnchor="middle" fill="#C9C4E6" fontSize="15">
              总进度
            </text>
          </svg>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <Stat label="已完成任务" value={`${done} / ${total}`} />
            <Stat label="连续打卡" value={`${plan?.streak ?? 0} 天`} color="#7BFFCB" />
            <Stat label="每日投入" value={`${plan?.input?.dailyMinutes ?? 0} 分钟`} />
            <Stat label="截止日期" value={plan?.input?.deadline || '未定'} />
          </div>
        </div>

        {/* 阶段列表 */}
        <div style={{ position: 'relative', marginTop: 36, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {(plan?.stages || []).map((s) => {
            const sTotal = s.tasks.length;
            const sDone = s.tasks.filter((t) => t.done).length;
            const sp = sTotal ? Math.round((sDone / sTotal) * 100) : 0;
            return (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    flexShrink: 0,
                    background: STAGE_THEME_COLOR[s.theme],
                    boxShadow: `0 0 14px ${STAGE_THEME_COLOR[s.theme]}`,
                  }}
                />
                <span style={{ flex: 1, fontSize: 20, fontWeight: 600 }}>{s.title}</span>
                <span style={{ fontSize: 18, color: '#C9C4E6' }}>
                  {sDone}/{sTotal} · {sp}%
                </span>
              </div>
            );
          })}
        </div>

        {/* 底部寄语 */}
        <div
          style={{
            position: 'relative',
            marginTop: 'auto',
            paddingTop: 24,
            borderTop: '1px solid rgba(247,244,255,0.14)',
            fontSize: 18,
            color: '#C9C4E6',
            lineHeight: 1.6,
          }}
        >
          {plan?.dailyTip ? `“${plan.dailyTip}”` : '深海安静，但从不空旷。'}
          <div style={{ marginTop: 10, fontSize: 15, color: '#9373BC' }}>
            由 {AGENT_NAME} 生成 · {SCHOOL_NAME}
          </div>
        </div>
      </div>
    </div>
  );
});

function Stat({ label, value, color = '#F7F4FF' }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <div style={{ fontSize: 15, color: '#C9C4E6' }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color, marginTop: 4 }}>{value}</div>
    </div>
  );
}