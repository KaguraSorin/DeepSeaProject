import { describe, expect, it } from 'vitest';
import { mockGenerator } from './generator';
import type { PlanInput, Task } from '@/types/plan';
import { addDays, todayISO } from '@/lib/utils/date';

function makeInput(overrides: Partial<PlanInput> = {}): PlanInput {
  const today = todayISO();
  return {
    goal: '雅思 7 分',
    currentLevel: '四级 500 分',
    dailyMinutes: 60,
    deadline: addDays(today, 60),
    ...overrides,
  };
}

/** 按日期聚合任务 */
function groupByDate(tasks: Task[]): Map<string, Task[]> {
  const map = new Map<string, Task[]>();
  for (const t of tasks) {
    const arr = map.get(t.date) || [];
    arr.push(t);
    map.set(t.date, arr);
  }
  return map;
}

describe('mockGenerator', () => {
  it('每日任务总时长不超过 dailyMinutes', () => {
    for (const dailyMinutes of [10, 20, 30, 45, 60, 90, 120]) {
      const plan = mockGenerator(makeInput({ dailyMinutes }));
      for (const stage of plan.stages) {
        for (const [, tasks] of groupByDate(stage.tasks)) {
          const sum = tasks.reduce((n, t) => n + t.durationMin, 0);
          expect(sum).toBeLessThanOrEqual(dailyMinutes);
        }
      }
    }
  });

  it('每个完整学习周都包含休息或复习任务', () => {
    const plan = mockGenerator(makeInput({ deadline: addDays(todayISO(), 90), dailyMinutes: 60 }));
    for (const stage of plan.stages) {
      const byDate = groupByDate(stage.tasks);
      const dates = [...byDate.keys()].sort();
      const fullWeeks = Math.floor(dates.length / 7);
      for (let w = 0; w < fullWeeks; w++) {
        const hasRestOrReview = dates
          .slice(w * 7, w * 7 + 7)
          .some((d) => byDate.get(d)!.some((t) => t.type === 'rest' || t.type === 'review'));
        expect(hasRestOrReview).toBe(true);
      }
    }
  });

  it('阶段数落在 [2, 3] 区间', () => {
    for (const days of [7, 15, 30, 31, 60, 90, 200, 400]) {
      const plan = mockGenerator(makeInput({ deadline: addDays(todayISO(), days) }));
      expect(plan.stages.length).toBeGreaterThanOrEqual(2);
      expect(plan.stages.length).toBeLessThanOrEqual(3);
    }
  });

  it('相同输入产出确定性的计划（阶段与任务一致）', () => {
    const input = makeInput();
    const a = mockGenerator(input);
    const b = mockGenerator(input);
    expect(a.title).toBe(b.title);
    expect(a.dailyTip).toBe(b.dailyTip);
    expect(JSON.stringify(a.stages)).toBe(JSON.stringify(b.stages));
  });

  it('任务类型合法且每阶段有 2 个里程碑', () => {
    const plan = mockGenerator(makeInput());
    const valid = new Set(['study', 'practice', 'review', 'rest']);
    for (const stage of plan.stages) {
      expect(stage.milestones).toHaveLength(2);
      for (const t of stage.tasks) {
        expect(valid.has(t.type)).toBe(true);
        expect(t.durationMin).toBeGreaterThan(0);
      }
    }
    expect(plan.source).toBe('mock');
  });
});