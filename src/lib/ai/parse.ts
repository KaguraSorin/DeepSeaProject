import type { LearningPlan, PlanInput, Stage, StageTheme, TaskType } from '@/types/plan';
import { uid } from '@/lib/utils/id';
import { isPast, todayISO } from '@/lib/utils/date';

const STAGE_THEMES: StageTheme[] = ['indigo', 'aurora', 'cyan'];
const TASK_TYPES: TaskType[] = ['study', 'practice', 'review', 'rest'];
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** 从模型返回文本中提取 JSON（容忍 ```json 围栏与前后多余文字） */
export function extractJSON(raw: string): any | null {
  if (!raw) return null;
  let text = raw.trim();

  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) text = fence[1].trim();

  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;

  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}

function asTheme(v: any, fallback: StageTheme): StageTheme {
  return STAGE_THEMES.includes(v) ? v : fallback;
}

function asType(v: any): TaskType {
  return TASK_TYPES.includes(v) ? v : 'study';
}

function asDate(v: any, fallback: string): string {
  return typeof v === 'string' && ISO_DATE.test(v) ? v : fallback;
}

/**
 * 校验并规范化 AI 输出 → LearningPlan。
 * 任一项不满足（结构缺失 / 类型错误）返回 null，调用方回退 Mock。
 */
export function parsePlanJSON(raw: string, input: PlanInput): LearningPlan | null {
  const data = extractJSON(raw);
  if (!data || typeof data !== 'object') return null;

  const rawStages = Array.isArray(data.stages) ? data.stages : null;
  if (!rawStages || rawStages.length < 2 || rawStages.length > 5) return null;

  const today = todayISO();
  const planId = uid('plan');
  let taskSeq = 0;

  const stages: Stage[] = [];
  for (let i = 0; i < rawStages.length; i++) {
    const s = rawStages[i];
    if (!s || typeof s !== 'object') return null;
    if (!Array.isArray(s.tasks) || s.tasks.length === 0) return null;

    const startDate = asDate(s.startDate, today);
    const endDate = asDate(s.endDate, startDate);
    if (isPast(endDate) && i === 0 && isPast(startDate)) {
      // 截止日期已过，视为无效计划 → 回退 Mock
      return null;
    }

    const tasks = [];
    for (const t of s.tasks) {
      if (!t || typeof t.title !== 'string' || !t.title.trim()) return null;
      const durationMin = Number(t.durationMin);
      if (!Number.isFinite(durationMin) || durationMin <= 0 || durationMin > 600) return null;
      tasks.push({
        id: uid(`task${taskSeq++}`),
        date: asDate(t.date, startDate),
        title: t.title.trim(),
        durationMin: Math.round(durationMin),
        type: asType(t.type),
        resource: typeof t.resource === 'string' ? t.resource : undefined,
        done: false,
      });
    }

    stages.push({
      id: uid('stage'),
      index: Number.isFinite(Number(s.index)) ? Number(s.index) : i,
      title: typeof s.title === 'string' && s.title.trim() ? s.title.trim() : `第 ${i + 1} 阶段`,
      goal: typeof s.goal === 'string' ? s.goal : '',
      theme: asTheme(s.theme, i % 2 === 0 ? 'indigo' : 'aurora'),
      startDate,
      endDate,
      milestones: Array.isArray(s.milestones)
        ? s.milestones
            .filter((m: any) => m && typeof m.title === 'string')
            .slice(0, 4)
            .map((m: any) => ({
              id: uid('ms'),
              title: m.title,
              description: typeof m.description === 'string' ? m.description : undefined,
            }))
        : [],
      tasks,
    });
  }

  const now = new Date().toISOString();

  return {
    id: planId,
    title: typeof data.title === 'string' && data.title.trim() ? data.title.trim() : `${input.goal} · 深海航线`,
    summary: typeof data.summary === 'string' ? data.summary : '',
    accent: asTheme(data.accent, stages[0].theme),
    createdAt: now,
    updatedAt: now,
    input,
    stages,
    reviewPlan: Array.isArray(data.reviewPlan)
      ? data.reviewPlan
          .filter((r: any) => r && typeof r.cadence === 'string')
          .slice(0, 6)
          .map((r: any) => ({
            cadence: r.cadence,
            description: typeof r.description === 'string' ? r.description : '',
          }))
      : [],
    dailyTip: typeof data.dailyTip === 'string' ? data.dailyTip : '',
    streak: 0,
    source: 'ai',
  };
}