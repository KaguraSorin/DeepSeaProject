'use client';

import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ChatMessage } from '@/types/chat';
import type { LearningPlan, PlanInput } from '@/types/plan';
import { mockGenerator } from '@/lib/mock/generator';
import { isYesterday, todayISO } from '@/lib/utils/date';

export interface PlanState {
  plans: LearningPlan[];
  currentPlanId: string | null;
  chatByPlan: Record<string, ChatMessage[]>;
  hydrated: boolean;

  setHydrated: (v: boolean) => void;
  upsertPlan: (plan: LearningPlan) => void;
  removePlan: (id: string) => void;
  setCurrent: (id: string | null) => void;
  toggleTask: (planId: string, taskId: string) => void;
  /** 打卡：昨天打过 → +1；今天已打 → 不变；否则重置为 1 */
  checkinStreak: (planId: string) => void;
  /** 调整输入（如“我每天只能学 30 分钟”）并重算任务 */
  updateInput: (planId: string, patch: Partial<PlanInput>) => void;
  /** 按当前输入重新生成计划（保留打卡与对话） */
  regenerate: (planId: string) => void;
  appendMessage: (planId: string, msg: ChatMessage) => void;
  clearChat: (planId: string) => void;
  resetAll: () => void;
}

/** 用新输入重算计划，保留 id / 打卡 / 创建时间 */
function rebuild(plan: LearningPlan, input: PlanInput): LearningPlan {
  const fresh = mockGenerator(input);
  return {
    ...fresh,
    id: plan.id,
    createdAt: plan.createdAt,
    streak: plan.streak,
    lastCheckinDate: plan.lastCheckinDate,
    source: plan.source,
  };
}

export const usePlanStore = create<PlanState>()(
  persist(
    (set, get) => ({
      plans: [],
      currentPlanId: null,
      chatByPlan: {},
      hydrated: false,

      setHydrated: (v) => set({ hydrated: v }),

      upsertPlan: (plan) =>
        set((s) => {
          const exists = s.plans.some((p) => p.id === plan.id);
          return {
            plans: exists ? s.plans.map((p) => (p.id === plan.id ? plan : p)) : [plan, ...s.plans],
            currentPlanId: plan.id,
          };
        }),

      removePlan: (id) =>
        set((s) => {
          const plans = s.plans.filter((p) => p.id !== id);
          const chatByPlan = { ...s.chatByPlan };
          delete chatByPlan[id];
          return {
            plans,
            chatByPlan,
            currentPlanId: s.currentPlanId === id ? plans[0]?.id ?? null : s.currentPlanId,
          };
        }),

      setCurrent: (id) => set({ currentPlanId: id }),

      toggleTask: (planId, taskId) =>
        set((s) => ({
          plans: s.plans.map((p) => {
            if (p.id !== planId) return p;
            return {
              ...p,
              updatedAt: new Date().toISOString(),
              stages: p.stages.map((st) => ({
                ...st,
                tasks: st.tasks.map((t) =>
                  t.id === taskId
                    ? {
                        ...t,
                        done: !t.done,
                        completedAt: !t.done ? new Date().toISOString() : undefined,
                      }
                    : t,
                ),
              })),
            };
          }),
        })),

      checkinStreak: (planId) =>
        set((s) => ({
          plans: s.plans.map((p) => {
            if (p.id !== planId) return p;
            const today = todayISO();
            if (p.lastCheckinDate === today) return p;
            const next = p.lastCheckinDate && isYesterday(p.lastCheckinDate) ? p.streak + 1 : 1;
            return {
              ...p,
              streak: next,
              lastCheckinDate: today,
              updatedAt: new Date().toISOString(),
            };
          }),
        })),

      updateInput: (planId, patch) =>
        set((s) => ({
          plans: s.plans.map((p) =>
            p.id === planId ? rebuild(p, { ...p.input, ...patch }) : p,
          ),
        })),

      regenerate: (planId) =>
        set((s) => ({
          plans: s.plans.map((p) => (p.id === planId ? rebuild(p, p.input) : p)),
        })),

      appendMessage: (planId, msg) =>
        set((s) => ({
          chatByPlan: { ...s.chatByPlan, [planId]: [...(s.chatByPlan[planId] || []), msg] },
        })),

      clearChat: (planId) =>
        set((s) => {
          const chatByPlan = { ...s.chatByPlan };
          delete chatByPlan[planId];
          return { chatByPlan };
        }),

      resetAll: () => set({ plans: [], currentPlanId: null, chatByPlan: {} }),
    }),
    {
      name: 'deepsea-storage',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s) => ({
        plans: s.plans,
        currentPlanId: s.currentPlanId,
        chatByPlan: s.chatByPlan,
      }),
    },
  ),
);

/**
 * 在客户端挂载后手动 rehydrate，避免 SSR / CSR 首屏不一致。
 * 返回是否已完成本地数据恢复。
 */
export function useHydratePlanStore(): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let alive = true;
    Promise.resolve(usePlanStore.persist.rehydrate()).finally(() => {
      usePlanStore.getState().setHydrated(true);
      if (alive) setReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);
  return ready;
}

/** 便捷选择器 */
export const selectCurrentPlan = (s: PlanState): LearningPlan | null =>
  s.plans.find((p) => p.id === s.currentPlanId) ?? null;