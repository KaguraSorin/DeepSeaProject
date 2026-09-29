'use client';

import { useMemo, useState } from 'react';
import { AlertCircle, Sparkles, Wand2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GradientButton } from '@/components/ui/GradientButton';
import { Ripple } from '@/components/ui/Ripple';
import { ThinkingWave } from '@/components/xii/ThinkingWave';
import { cn } from '@/lib/utils/cn';
import { addDays, diffFromToday, formatCN, todayISO } from '@/lib/utils/date';
import { AGENT_NAME } from '@/lib/config/site';
import type { PlanInput } from '@/types/plan';

export interface PlanFormProps {
  value: Partial<PlanInput>;
  onChange: (patch: Partial<PlanInput>) => void;
  onSubmit: () => void;
  loading?: boolean;
  error?: string | null;
  className?: string;
}

const MIN_MINUTES = 10;
const MAX_MINUTES = 600;
const DEFAULT_MINUTES = 60;
const EXAMPLE_DEADLINE_DAYS = 60;

function defaultDeadline(): string {
  return addDays(todayISO(), EXAMPLE_DEADLINE_DAYS);
}

const FIELD_CLS =
  'w-full rounded-xl border border-[rgba(247,244,255,0.14)] bg-[rgba(247,244,255,0.05)] ' +
  'px-3 py-2 text-sm text-text-1 placeholder:text-text-2/55 transition-colors ' +
  'focus:border-[rgba(147,115,188,0.7)] focus:outline-none';

const LABEL_CLS = 'mb-1.5 block text-xs font-medium tracking-wide text-text-2';

export function PlanForm({
  value,
  onChange,
  onSubmit,
  loading = false,
  error = null,
  className,
}: PlanFormProps) {
  const [goalTouched, setGoalTouched] = useState(false);

  const goal = value.goal ?? '';
  const currentLevel = value.currentLevel ?? '';
  const dailyMinutes = value.dailyMinutes ?? DEFAULT_MINUTES;
  const deadline = value.deadline || defaultDeadline();
  const preferences = value.preferences ?? '';

  const minutesInvalid =
    !Number.isFinite(dailyMinutes) || dailyMinutes < MIN_MINUTES || dailyMinutes > MAX_MINUTES;
  const goalInvalid = goal.trim().length === 0;
  const canSubmit = !loading && !goalInvalid && !minutesInvalid;

  const sliderValue = Number.isFinite(dailyMinutes)
    ? Math.min(MAX_MINUTES, Math.max(MIN_MINUTES, dailyMinutes))
    : DEFAULT_MINUTES;
  const numberValue = Number.isFinite(dailyMinutes) ? String(dailyMinutes) : '';

  const deadlineHint = useMemo(() => {
    if (!deadline) return null;
    const days = diffFromToday(deadline);
    if (days < 0) return '这个日期已经过去了';
    return `约 ${days} 天后 · ${formatCN(deadline)}`;
  }, [deadline]);

  function patch(p: Partial<PlanInput>) {
    onChange(p);
  }

  function fillExample() {
    patch({
      goal: '雅思 7 分',
      currentLevel: '四级 500 分',
      dailyMinutes: DEFAULT_MINUTES,
      deadline: addDays(todayISO(), EXAMPLE_DEADLINE_DAYS),
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit();
  }

  return (
    <GlassCard className={cn('w-full', className)}>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {/* 头部 */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="shrink-0 text-aurora" aria-hidden />
              <h2 className="text-base font-semibold text-text-1">告诉{AGENT_NAME}你的航线</h2>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-text-2">
              填好下面几项，{AGENT_NAME}就能为你铺一条可打卡的学习航线。
            </p>
          </div>
          <GradientButton variant="ghost" size="sm" onClick={fillExample} disabled={loading}>
            <Wand2 size={14} aria-hidden />
            示例计划
          </GradientButton>
        </div>

        {/* 学习目标 */}
        <div>
          <label htmlFor="plan-goal" className={LABEL_CLS}>
            学习目标 <span className="text-coral">*</span>
          </label>
          <input
            id="plan-goal"
            type="text"
            className={FIELD_CLS}
            value={goal}
            placeholder="例如：雅思 7 分"
            autoComplete="off"
            disabled={loading}
            aria-invalid={goalTouched && goalInvalid}
            onChange={(e) => patch({ goal: e.target.value })}
            onBlur={() => setGoalTouched(true)}
          />
          {goalTouched && goalInvalid && (
            <p className="mt-1 text-xs text-coral">给这条航线一个目标吧，比如「雅思 7 分」。</p>
          )}
        </div>

        {/* 当前水平 */}
        <div>
          <label htmlFor="plan-level" className={LABEL_CLS}>
            当前水平
          </label>
          <input
            id="plan-level"
            type="text"
            className={FIELD_CLS}
            value={currentLevel}
            placeholder="例如：四级 500 分 / 零基础"
            autoComplete="off"
            disabled={loading}
            onChange={(e) => patch({ currentLevel: e.target.value })}
          />
        </div>

        {/* 每天可用时间 */}
        <div>
          <label htmlFor="plan-minutes" className={LABEL_CLS}>
            每天可用时间（分钟）
          </label>
          <div className="flex items-center gap-3">
            <input
              id="plan-minutes"
              type="range"
              min={MIN_MINUTES}
              max={MAX_MINUTES}
              step={5}
              value={sliderValue}
              disabled={loading}
              aria-valuemin={MIN_MINUTES}
              aria-valuemax={MAX_MINUTES}
              aria-valuenow={sliderValue}
              onChange={(e) => patch({ dailyMinutes: Number(e.target.value) })}
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-[rgba(247,244,255,0.14)] accent-aurora"
            />
            <div className="flex items-baseline gap-1">
              <input
                type="number"
                inputMode="numeric"
                min={MIN_MINUTES}
                max={MAX_MINUTES}
                value={numberValue}
                disabled={loading}
                aria-label="每天可用分钟数"
                aria-invalid={minutesInvalid}
                onChange={(e) =>
                  patch({ dailyMinutes: e.target.value === '' ? NaN : Number(e.target.value) })
                }
                className={cn(
                  'w-16 rounded-lg border bg-[rgba(247,244,255,0.05)] px-2 py-1 text-center text-sm text-text-1 focus:outline-none',
                  minutesInvalid
                    ? 'border-coral/60'
                    : 'border-[rgba(247,244,255,0.14)] focus:border-[rgba(147,115,188,0.7)]',
                )}
              />
              <span className="text-xs text-text-2">分钟</span>
            </div>
          </div>
          {minutesInvalid && (
            <p className="mt-1 text-xs text-coral">
              请填写 {MIN_MINUTES}–{MAX_MINUTES} 之间的分钟数。
            </p>
          )}
        </div>

        {/* 截止日期 */}
        <div>
          <label htmlFor="plan-deadline" className={LABEL_CLS}>
            截止日期
          </label>
          <input
            id="plan-deadline"
            type="date"
            className={cn(FIELD_CLS, '[color-scheme:dark]')}
            value={deadline}
            disabled={loading}
            onChange={(e) => patch({ deadline: e.target.value })}
          />
          {deadlineHint && <p className="mt-1 text-xs text-text-2">{deadlineHint}</p>}
        </div>

        {/* 偏好 */}
        <div>
          <label htmlFor="plan-preferences" className={LABEL_CLS}>
            偏好（可选）
          </label>
          <textarea
            id="plan-preferences"
            rows={2}
            className={cn(FIELD_CLS, 'resize-none')}
            value={preferences}
            placeholder="例如：希望多练口语 / 周末时间更充裕"
            disabled={loading}
            onChange={(e) => patch({ preferences: e.target.value })}
          />
        </div>

        {/* 错误提示 */}
        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-coral/50 bg-coral/10 px-3 py-2 text-xs text-coral"
          >
            <AlertCircle size={14} className="mt-0.5 shrink-0" aria-hidden />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* 加载状态 */}
        {loading && (
          <div aria-live="polite" className="rounded-xl border border-[rgba(147,115,188,0.35)] bg-[rgba(147,115,188,0.08)] px-3 py-2">
            <ThinkingWave label={`${AGENT_NAME}正在为你规划航线…`} />
          </div>
        )}

        {/* 提交 */}
        <div className="flex flex-col gap-1.5" aria-busy={loading}>
          <Ripple className="rounded-2xl">
            <GradientButton
              type="submit"
              size="lg"
              fullWidth
              disabled={!canSubmit}
              ariaLabel="生成航线"
            >
              <Sparkles size={16} aria-hidden />
              生成航线
            </GradientButton>
          </Ripple>
          {!goalInvalid && minutesInvalid && (
            <p className="text-center text-xs text-text-2">修正上面的提示后即可生成航线。</p>
          )}
        </div>
      </form>
    </GlassCard>
  );
}