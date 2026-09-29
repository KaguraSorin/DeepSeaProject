'use client';

import { Plus, Trash2, Route, X } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GradientButton } from '@/components/ui/GradientButton';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { cn } from '@/lib/utils/cn';
import { STAGE_THEME_COLOR } from '@/lib/theme/tokens';
import { formatCN } from '@/lib/utils/date';
import type { LearningPlan } from '@/types/plan';

export interface PlanSwitcherProps {
  open: boolean;
  plans: LearningPlan[];
  currentPlanId: string | null;
  onClose: () => void;
  onSwitch: (id: string) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
  className?: string;
}

function planProgress(plan: LearningPlan): number {
  const total = plan.stages.reduce((n, s) => n + s.tasks.length, 0);
  const done = plan.stages.reduce((n, s) => n + s.tasks.filter((t) => t.done).length, 0);
  return total ? Math.round((done / total) * 100) : 0;
}

/** 多计划切换面板：新建 / 切换 / 删除，各自强调色 */
export function PlanSwitcher({
  open,
  plans,
  currentPlanId,
  onClose,
  onSwitch,
  onDelete,
  onNew,
  className,
}: PlanSwitcherProps) {
  if (!open) return null;

  return (
    <div
      className={cn('fixed inset-0 z-50 flex items-start justify-center px-4 pt-20 no-print', className)}
      role="dialog"
      aria-modal="true"
      aria-label="计划列表"
    >
      <div
        className="absolute inset-0 bg-midnight/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <GlassCard
        className="relative z-10 max-h-[70vh] w-full max-w-md overflow-y-auto"
        padded
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-base font-semibold text-text-1">
            <Route size={16} className="text-aurora" aria-hidden />
            我的航线
          </h3>
          <div className="flex items-center gap-2">
            <GradientButton variant="ghost" size="sm" onClick={onNew}>
              <Plus size={14} aria-hidden />
              新建
            </GradientButton>
            <button
              type="button"
              onClick={onClose}
              aria-label="关闭"
              className="rounded-lg p-1.5 text-text-2 transition-colors hover:text-text-1"
            >
              <X size={16} aria-hidden />
            </button>
          </div>
        </div>

        {plans.length === 0 ? (
          <p className="py-6 text-center text-sm text-text-2">
            还没有航线，点「新建」开启第一条吧。
          </p>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {plans.map((p) => {
              const active = p.id === currentPlanId;
              const pct = planProgress(p);
              return (
                <li key={p.id}>
                  <div
                    className={cn(
                      'rounded-2xl border p-3 transition-colors',
                      active
                        ? 'border-[rgba(94,231,255,0.55)] bg-[rgba(94,231,255,0.08)]'
                        : 'border-[rgba(247,244,255,0.12)] bg-[rgba(247,244,255,0.04)]',
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => onSwitch(p.id)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ background: STAGE_THEME_COLOR[p.accent] }}
                            aria-hidden
                          />
                          <span className="truncate text-sm font-medium text-text-1">{p.title}</span>
                        </span>
                        <span className="mt-1 block truncate text-xs text-text-2">
                          {p.input?.goal} · 每日 {p.input?.dailyMinutes} 分钟 · 截止{' '}
                          {p.input?.deadline ? formatCN(p.input.deadline) : '未定'}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(p.id)}
                        aria-label={`删除 ${p.title}`}
                        className="shrink-0 rounded-lg p-1.5 text-text-2 transition-colors hover:text-coral"
                      >
                        <Trash2 size={15} aria-hidden />
                      </button>
                    </div>
                    <div className="mt-2.5">
                      <ProgressBar value={pct} height={6} color={STAGE_THEME_COLOR[p.accent]} />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </GlassCard>
    </div>
  );
}