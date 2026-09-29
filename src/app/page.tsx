'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Compass, ListChecks, Sparkles, Target, Waves } from 'lucide-react';

import { TopNav } from '@/components/layout/TopNav';
import { BottomBar } from '@/components/layout/BottomBar';
import { BentoGrid, BentoItem } from '@/components/layout/BentoGrid';
import { PlanForm } from '@/components/form/PlanForm';
import { XiiChat } from '@/components/xii/XiiChat';
import { EmotionBadge } from '@/components/xii/EmotionBadge';
import { OceanRouteMap } from '@/components/route/OceanRouteMap';
import { TodayTasks } from '@/components/tasks/TodayTasks';
import { ProgressRing } from '@/components/progress/ProgressRing';
import { StreakBadge } from '@/components/progress/StreakBadge';
import { PlanSwitcher } from '@/components/plans/PlanSwitcher';
import { ExportMenu } from '@/components/export/ExportMenu';
import { SharePoster } from '@/components/export/SharePoster';
import { GlassCard } from '@/components/ui/GlassCard';
import { Collapsible } from '@/components/ui/Collapsible';
import { ProgressBar } from '@/components/ui/ProgressBar';

import { mockGenerator } from '@/lib/mock/generator';
import { useHydratePlanStore, usePlanStore } from '@/lib/store/planStore';
import { planToMarkdown, downloadText, safeFileName } from '@/lib/export/markdown';
import { exportNodeAsPng } from '@/lib/export/poster';
import { cn } from '@/lib/utils/cn';
import { addDays, diffFromToday, formatCN, todayISO } from '@/lib/utils/date';
import { uid } from '@/lib/utils/id';
import { AGENT_NAME, SITE_NAME } from '@/lib/config/site';
import { TASK_TYPE_META } from '@/lib/theme/tokens';
import type { ChatMessage, XiiResponse } from '@/types/chat';
import type { LearningPlan, PlanInput } from '@/types/plan';

const DRAFT_KEY = '__draft__';

function nowISO() {
  return new Date().toISOString();
}

function makeMessage(role: 'user' | 'xii', content: string, kind?: ChatMessage['kind']): ChatMessage {
  return { id: uid('msg'), role, content, createdAt: nowISO(), kind };
}

/** 表单路径：补齐默认值（与 PlanForm 展示保持一致） */
function normalizeFromForm(input: Partial<PlanInput>): PlanInput {
  return {
    goal: (input.goal || '').trim(),
    currentLevel: (input.currentLevel || '零基础').trim(),
    dailyMinutes: Number.isFinite(Number(input.dailyMinutes)) ? Number(input.dailyMinutes) : 60,
    deadline: input.deadline || addDays(todayISO(), 60),
    preferences: input.preferences,
  };
}

/** 对话路径：把用户自由文本吸收进「下一个缺失字段」，让 Mock 也能收敛 */
function absorbChat(text: string, input: Partial<PlanInput>): Partial<PlanInput> {
  const t = text.trim();
  if (!t) return input;
  const next: Partial<PlanInput> = { ...input };

  if (!next.goal) {
    next.goal = t;
    return next;
  }
  if (!next.currentLevel) {
    next.currentLevel = t;
    return next;
  }
  if (!next.dailyMinutes) {
    const m = t.match(/(\d{1,4})\s*(分钟|min|分|小时|h|hour)?/i);
    if (m) {
      const hour = /小时|h|hour/i.test(m[2] || '');
      next.dailyMinutes = hour ? Number(m[1]) * 60 : Number(m[1]);
      return next;
    }
  }
  if (!next.deadline) {
    const abs = t.match(/\d{4}-\d{2}-\d{2}/);
    if (abs) {
      next.deadline = abs[0];
      return next;
    }
    const rel = t.match(/(\d{1,3})\s*(天|周|星期|个月|月)/);
    if (rel) {
      const n = Number(rel[1]);
      const unit = rel[2];
      const days = unit === '天' ? n : unit === '周' || unit === '星期' ? n * 7 : n * 30;
      next.deadline = addDays(todayISO(), days);
      return next;
    }
  }
  if (!next.preferences) next.preferences = t;
  return next;
}

export default function Page() {
  const hydrated = useHydratePlanStore();

  const plans = usePlanStore((s) => s.plans);
  const currentPlanId = usePlanStore((s) => s.currentPlanId);
  const chatByPlan = usePlanStore((s) => s.chatByPlan);
  const upsertPlan = usePlanStore((s) => s.upsertPlan);
  const removePlan = usePlanStore((s) => s.removePlan);
  const setCurrent = usePlanStore((s) => s.setCurrent);
  const toggleTask = usePlanStore((s) => s.toggleTask);
  const checkinStreak = usePlanStore((s) => s.checkinStreak);
  const updateInput = usePlanStore((s) => s.updateInput);
  const regenerate = usePlanStore((s) => s.regenerate);
  const appendMessage = usePlanStore((s) => s.appendMessage);
  const clearChat = usePlanStore((s) => s.clearChat);

  const plan = useMemo(
    () => plans.find((p) => p.id === currentPlanId) ?? null,
    [plans, currentPlanId],
  );
  const chatKey = plan?.id ?? DRAFT_KEY;
  const messages = useMemo(() => chatByPlan[chatKey] ?? [], [chatByPlan, chatKey]);

  const [input, setInput] = useState<Partial<PlanInput>>({});
  const [loading, setLoading] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
  const [plansOpen, setPlansOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const posterRef = useRef<HTMLDivElement>(null);
  const seededRef = useRef(false);

  /* ---------- 首次访问：内置示例航线（雅思 7 分 / 每天 60 分钟 / 60 天） ---------- */
  useEffect(() => {
    if (!hydrated || seededRef.current) return;
    seededRef.current = true;
    if (plans.length > 0) return;

    const sample = mockGenerator({
      goal: '雅思 7 分',
      currentLevel: '四级 500 分',
      dailyMinutes: 60,
      deadline: addDays(todayISO(), 60),
    });
    upsertPlan(sample);
    appendMessage(
      sample.id,
      makeMessage(
        'xii',
        `这是${AGENT_NAME}为你准备的一条示例航线（雅思 7 分 · 每天 60 分钟 · 60 天）。你可以直接体验打卡，也可以在上面填写自己的目标，让我重新为你铺一条。`,
        'system',
      ),
    );
  }, [hydrated, plans.length, upsertPlan, appendMessage]);

  /* ---------- 提示条自动消失 ---------- */
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  /* ---------- 统计 ---------- */
  const stats = useMemo(() => {
    if (!plan) return { total: 0, done: 0, pct: 0 };
    const total = plan.stages.reduce((n, s) => n + s.tasks.length, 0);
    const done = plan.stages.reduce((n, s) => n + s.tasks.filter((t) => t.done).length, 0);
    return { total, done, pct: total ? Math.round((done / total) * 100) : 0 };
  }, [plan]);

  const todayTasks = useMemo(() => {
    if (!plan) return [] as { id: string; label: string }[];
    const today = todayISO();
    return plan.stages
      .flatMap((s) => s.tasks)
      .filter((t) => t.date === today)
      .map((t) => ({ id: t.id, label: `${t.title} · ${t.durationMin}分钟` }));
  }, [plan]);

  const checkedToday = plan?.lastCheckinDate === todayISO();

  /* ---------- 核心请求 ---------- */
  const requestXii = useCallback(
    async (nextInput: Partial<PlanInput>, history: ChatMessage[], key: string) => {
      setThinking(true);
      setError(null);
      try {
        const res = await fetch('/api/xii', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ input: nextInput, messages: history }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: XiiResponse = await res.json();

        if (data.type === 'question') {
          appendMessage(
            key,
            makeMessage('xii', data.questions.join('\n'), 'question'),
          );
          return null;
        }

        const created = data.plan;
        upsertPlan(created);
        // 把草稿会话迁移到新计划下
        const draft = usePlanStore.getState().chatByPlan[DRAFT_KEY] ?? [];
        draft.forEach((m) => appendMessage(created.id, m));
        clearChat(DRAFT_KEY);
        appendMessage(
          created.id,
          makeMessage(
            'xii',
            `${data.source === 'ai' ? '航线已生成' : '这次先用本地能力为你铺好了航线'}：《${created.title}》。${created.summary}`,
            'plan',
          ),
        );
        setSelectedStageId(null);
        return created as LearningPlan;
      } catch {
        // 接口不可用 → 本地 Mock 兜底，绝不白屏
        setError('汐暂时连不上远处的水面信号，已用本地航线为你兜底。');
        const fallback = mockGenerator(normalizeFromForm(nextInput));
        upsertPlan(fallback);
        const draft = usePlanStore.getState().chatByPlan[DRAFT_KEY] ?? [];
        draft.forEach((m) => appendMessage(fallback.id, m));
        clearChat(DRAFT_KEY);
        appendMessage(
          fallback.id,
          makeMessage('xii', `已用本地能力为你生成《${fallback.title}》。`, 'plan'),
        );
        return fallback;
      } finally {
        setThinking(false);
      }
    },
    [appendMessage, clearChat, upsertPlan],
  );

  /* ---------- 表单提交：生成航线 ---------- */
  const handleFormSubmit = useCallback(async () => {
    const full = normalizeFromForm(input);
    if (!full.goal) {
      setError('先告诉汐一个学习目标吧。');
      return;
    }
    if (full.deadline && diffFromToday(full.deadline) < 0) {
      setError('截止日期已经过去了，换一个未来的日期，航线才画得出来。');
      return;
    }
    setLoading(true);
    setInput(full);
    const summary = `目标：${full.goal}；当前水平：${full.currentLevel}；每天 ${full.dailyMinutes} 分钟；截止 ${formatCN(full.deadline)}${full.preferences ? `；偏好：${full.preferences}` : ''}`;
    const userMsg = makeMessage('user', summary);
    appendMessage(chatKey, userMsg);
    await requestXii(full, [...messages, userMsg], chatKey);
    setLoading(false);
  }, [input, chatKey, messages, appendMessage, requestXii]);

  /* ---------- 对话发送 ---------- */
  const handleSend = useCallback(
    async (text: string) => {
      const t = text.trim();
      if (!t) return;
      const userMsg = makeMessage('user', t);

      if (plan) {
        appendMessage(plan.id, userMsg);
        // 计划调整：每日时长
        const minMatch = t.match(/每天[^0-9]{0,6}(\d{1,4})\s*(分钟|min|分|小时|h)/i);
        if (minMatch) {
          const isHour = /小时|h$/i.test(minMatch[2]);
          const minutes = isHour ? Number(minMatch[1]) * 60 : Number(minMatch[1]);
          updateInput(plan.id, { dailyMinutes: minutes });
          appendMessage(
            plan.id,
            makeMessage(
              'xii',
              `好，已把每天的投入调整为 ${minutes} 分钟，并重算了任务时长，不会超出你的时间。`,
              'answer',
            ),
          );
          return;
        }
        if (/重新生成|重算|换一版|再来一条/.test(t)) {
          regenerate(plan.id);
          appendMessage(plan.id, makeMessage('xii', '航线已重新绘制，再看看吧。', 'plan'));
          return;
        }
        appendMessage(
          plan.id,
          makeMessage(
            'xii',
            '这条航线正为你亮着。想调整的话，可以修改左侧条件再点生成，或直接说「我每天只能学 30 分钟」。',
            'answer',
          ),
        );
        return;
      }

      // 还没有航线 → 追问 / 收集
      appendMessage(chatKey, userMsg);
      const merged = absorbChat(t, input);
      setInput(merged);
      await requestXii(merged, [...messages, userMsg], chatKey);
    },
    [plan, chatKey, input, messages, appendMessage, updateInput, regenerate, requestXii],
  );

  /* ---------- 导出 ---------- */
  const handleExportMarkdown = useCallback(() => {
    if (!plan) return;
    downloadText(`${safeFileName(plan.title)}.md`, planToMarkdown(plan));
    setToast('Markdown 已开始下载');
  }, [plan]);

  const handleCopy = useCallback(async () => {
    if (!plan) return;
    try {
      await navigator.clipboard.writeText(planToMarkdown(plan));
      setToast('Markdown 已复制到剪贴板');
    } catch {
      setError('当前浏览器不允许访问剪贴板，请改用下载。');
    }
  }, [plan]);

  const handlePrint = useCallback(() => {
    if (!plan) return;
    window.print();
  }, [plan]);

  const handlePoster = useCallback(async () => {
    if (!plan || !posterRef.current) return;
    setExporting(true);
    try {
      await exportNodeAsPng(posterRef.current, {
        filename: `${safeFileName(plan.title)}-海报.png`,
      });
      setToast('海报已生成');
    } catch {
      setError('海报生成失败，请稍后再试。');
    } finally {
      setExporting(false);
    }
  }, [plan]);

  /* ---------- 其它操作 ---------- */
  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handleNewPlan = useCallback(() => {
    setCurrent(null);
    setInput({});
    setError(null);
    setSelectedStageId(null);
    setPlansOpen(false);
    scrollTo('form');
  }, [setCurrent, scrollTo]);

  const handleRegenerate = useCallback(() => {
    if (!plan) return;
    regenerate(plan.id);
    setToast('航线已按当前条件重算');
  }, [plan, regenerate]);

  const handleToggleTask = useCallback(
    (taskId: string) => {
      if (plan) toggleTask(plan.id, taskId);
    },
    [plan, toggleTask],
  );

  const handleCheckin = useCallback(() => {
    if (plan) checkinStreak(plan.id);
  }, [plan, checkinStreak]);

  const hasPlan = Boolean(plan);

  return (
    <div className="relative min-h-[100dvh]">
      <TopNav
        planTitle={plan?.title}
        planCount={plans.length}
        hasPlan={hasPlan}
        onNewPlan={handleNewPlan}
        onRegenerate={handleRegenerate}
        onExportMarkdown={handleExportMarkdown}
        onPrint={handlePrint}
        onSharePoster={handlePoster}
        onTogglePlans={() => setPlansOpen((v) => !v)}
        exporting={exporting}
      />

      <main id="top" className="mx-auto w-full max-w-[1400px] px-4 pb-28 pt-6 sm:px-6 lg:pb-12">
        {/* Hero */}
        <section className="mb-6 flex flex-col gap-3 sm:mb-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="flex flex-wrap items-center gap-3"
          >
            <span className="glass inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs text-text-2">
              <Waves size={13} className="text-cyan" aria-hidden />
              {SITE_NAME}
            </span>
            <EmotionBadge text={`${AGENT_NAME} 陪你下潜`} tone="calm" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.08 }}
            className="text-gradient max-w-3xl text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl"
          >
            把目标，变成一条会发光的航线
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.16 }}
            className="max-w-2xl text-sm leading-relaxed text-text-2 sm:text-base"
          >
            告诉{AGENT_NAME}你的学习目标、当前水平和可用时间，她会追问关键信息，
            再为你铺好阶段、周计划与每日任务。打卡一次，航线就亮一点。
          </motion.p>
        </section>

        <BentoGrid>
          {/* 航线图 */}
          <BentoItem id="route" className="lg:col-span-8">
            <OceanRouteMap
              plan={plan}
              selectedStageId={selectedStageId}
              onSelectStage={setSelectedStageId}
            />
          </BentoItem>

          {/* 表单 */}
          <BentoItem id="form" className="lg:col-span-4">
            <PlanForm
              value={input}
              onChange={(patch) => setInput((prev) => ({ ...prev, ...patch }))}
              onSubmit={handleFormSubmit}
              loading={loading}
              error={error}
            />
          </BentoItem>

          {/* 今日任务 */}
          <BentoItem id="tasks" className="lg:col-span-5">
            <TodayTasks plan={plan} onToggle={handleToggleTask} />
          </BentoItem>

          {/* 汐对话 */}
          <BentoItem id="chat" className="lg:col-span-4">
            <XiiChat
              messages={messages}
              thinking={thinking}
              onSend={handleSend}
              disabled={loading}
            />
          </BentoItem>

          {/* 进度 / 打卡 / 寄语 / 导出 */}
          <BentoItem className="flex flex-col gap-4 lg:col-span-3">
            <GlassCard className="flex flex-col items-center gap-4" padded>
              <ProgressRing
                value={stats.pct}
                label={`${stats.pct}%`}
                sublabel="总进度"
              />
              <div className="w-full">
                <ProgressBar
                  value={stats.pct}
                  showLabel
                  label={`已完成 ${stats.done}/${stats.total}`}
                  color="#9373BC"
                />
              </div>
              <StreakBadge
                streak={plan?.streak ?? 0}
                checkedToday={checkedToday}
                onCheckin={handleCheckin}
              />
            </GlassCard>

            <GlassCard>
              <Collapsible
                title="汐的今日寄语"
                icon={<Compass size={15} className="text-cyan" aria-hidden />}
                defaultOpen
              >
                <p className="text-sm leading-relaxed text-text-2">
                  {plan?.dailyTip || '先告诉汐你的目标，她会送你一句今天的海风。'}
                </p>
              </Collapsible>
            </GlassCard>

            <GlassCard>
              <Collapsible
                title="今日任务概览"
                icon={<ListChecks size={15} className="text-mint" aria-hidden />}
                defaultOpen={false}
              >
                {todayTasks.length === 0 ? (
                  <p className="text-xs text-text-2">今天没有安排任务，好好休息也是一种进度。</p>
                ) : (
                  <ul className="flex flex-col gap-1.5">
                    {todayTasks.map((t) => (
                      <li key={t.id} className="flex items-start gap-2 text-xs text-text-2">
                        <Target size={12} className="mt-0.5 shrink-0 text-aurora" aria-hidden />
                        <span>{t.label}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {Object.entries(TASK_TYPE_META).map(([k, v]) => (
                    <span
                      key={k}
                      className="rounded-full px-2 py-0.5 text-[11px]"
                      style={{ color: v.color, background: `${v.color}1f` }}
                    >
                      {v.label}
                    </span>
                  ))}
                </div>
              </Collapsible>
            </GlassCard>

            <ExportMenu
              onMarkdown={handleExportMarkdown}
              onPrint={handlePrint}
              onPoster={handlePoster}
              onCopy={handleCopy}
              disabled={!hasPlan}
              busy={exporting}
            />
          </BentoItem>
        </BentoGrid>

        {/* 页脚 */}
        <footer className="mt-10 flex flex-col items-center gap-2 text-center text-xs text-text-2">
          <Sparkles size={14} className="text-aurora" aria-hidden />
          <p>
            {SITE_NAME} · 由 {AGENT_NAME} 生成 · 数据仅保存在你的浏览器本地
          </p>
        </footer>
      </main>

      <BottomBar
        onJumpForm={() => scrollTo('form')}
        onJumpRoute={() => scrollTo('route')}
        onJumpTasks={() => scrollTo('tasks')}
        onJumpChat={() => scrollTo('chat')}
        onExport={handleExportMarkdown}
        hasPlan={hasPlan}
      />

      <PlanSwitcher
        open={plansOpen}
        plans={plans}
        currentPlanId={currentPlanId}
        onClose={() => setPlansOpen(false)}
        onSwitch={(id) => {
          setCurrent(id);
          setSelectedStageId(null);
          setPlansOpen(false);
        }}
        onDelete={(id) => {
          removePlan(id);
          setToast('已删除该航线');
        }}
        onNew={handleNewPlan}
      />

      {/* 离屏海报节点（供 html-to-image 截图） */}
      <SharePoster ref={posterRef} plan={plan} />

      {/* Toast */}
      <div
        aria-live="polite"
        className={cn(
          'pointer-events-none fixed bottom-24 left-1/2 z-[60] -translate-x-1/2 lg:bottom-8',
          'transition-all duration-300',
          toast ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
        )}
      >
        {toast && (
          <div className="glass-strong rounded-full px-4 py-2 text-xs text-text-1 shadow-glow">
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}