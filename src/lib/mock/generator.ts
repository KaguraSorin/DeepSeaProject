import type {
  LearningPlan,
  Milestone,
  PlanInput,
  Stage,
  Task,
  TaskType,
} from '@/types/plan';
import { addDays, daysBetween, todayISO } from '@/lib/utils/date';
import { createRng, hashSeed, pickBySeed, seededId } from '@/lib/utils/id';
import { stageThemeByIndex } from '@/lib/theme/tokens';

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
/** 7 天为一个学习周期，周期内第 7 天为休息 / 轻复习 */
const WEEK = 7;

interface Templates {
  study: string[];
  practice: string[];
  review: string[];
  rest: string[];
  stages: string[];
  resources: string[];
}

const COMMON: Templates = {
  study: ['核心概念精读与笔记', '知识点拆解与梳理', '教材精读 + 要点标注', '体系框架搭建'],
  practice: ['配套练习 1 组', '动手实践一个小任务', '真题演练与订正', '场景化应用练习'],
  review: ['昨日错题复盘', '本周要点回捞', '知识卡片自测', '薄弱环节补漏'],
  rest: ['海面漂浮 · 轻松浸泡', '浅滩漫步 · 随心复习', '静水补给 · 只做轻输入'],
  stages: ['起航 · 基础锚定', '深潜 · 能力进阶', '抵达 · 冲刺收束'],
  resources: ['官方教材 + 免费公开课', '经典入门书 + 练习册', '优质网课 + 社区答疑'],
};

const PRESETS: { match: RegExp; tpl: Partial<Templates> }[] = [
  {
    match: /雅思|托福|IELTS|TOEFL/i,
    tpl: {
      study: ['雅思核心词汇 30 词 + 长难句精析', '口语 Part2 素材积累', '阅读题型技巧精讲'],
      practice: ['听力精听 1 段 + 跟读', '口语录音输出 1 题', '写作小作文 1 篇'],
      review: ['昨日错题复盘 + 同义替换整理', '口语高频话题回捞'],
      rest: ['英文泛听浸泡 · 无压力', '看一集英文剧集放松'],
      resources: ['剑桥雅思真题 + 当季口语题库', '雅思官方指南 + 高频词表'],
    },
  },
  {
    match: /考研|研究生/i,
    tpl: {
      study: ['专业课章节精读 + 思维导图', '政治核心考点精讲', '数学公式推导梳理'],
      practice: ['真题限时演练 1 套', '选择题专项训练', '大题步骤书写练习'],
      review: ['错题本回捞 + 知识点串讲', '背诵内容滚动复习'],
      rest: ['轻量回顾 · 只翻错题本', '散步放松 · 听听英语'],
      resources: ['考研大纲 + 历年真题', '目标院校参考书 + 网课'],
    },
  },
  {
    match: /前端|编程|程序员|代码|开发|python|java|react|算法/i,
    tpl: {
      study: ['核心概念与官方文档精读', '源码片段阅读与理解', '设计模式 / 数据结构梳理'],
      practice: ['动手实现一个小功能', '刷 1 道算法题并总结', '重构一段旧代码'],
      review: ['代码回顾与优化点整理', '知识盲区补漏'],
      rest: ['轻量阅读技术博客', '离线整理笔记'],
      resources: ['官方文档 + MDN', '经典教材 + 开源项目'],
    },
  },
  {
    match: /英语|英文|English/i,
    tpl: {
      study: ['高频词汇 + 语法精讲', '句型结构拆解', '篇章精读与翻译'],
      practice: ['口语跟读 10 分钟', '写作输出 1 段', '听力精听 1 段'],
      review: ['词汇滚动复习', '错题与笔记回捞'],
      rest: ['英文歌曲 / 播客浸泡', '轻松看剧集练听力'],
      resources: ['新概念 / 语法书 + 词表', '免费公开课 + 原声素材'],
    },
  },
];

function pickTemplates(input: PlanInput): Templates {
  const hay = `${input.goal} ${input.preferences || ''}`;
  const hit = PRESETS.find((p) => p.match.test(hay));
  if (!hit) return COMMON;
  return { ...COMMON, ...hit.tpl } as Templates;
}

const TIPS = [
  '别急，深海的光要慢慢来。今天走的每一小步，都会在海底留下发亮的痕迹。',
  '潮汐有涨落，学习也有起伏。允许自己慢一点，但别停下。',
  '把大目标拆成小气泡，一个一个浮上去，海面就在不远处。',
  '今天的你只和昨天的你比较。航线是你自己的，不必追赶别人的浪。',
  '完成比完美更重要。哪怕只点亮一座小岛，也是真实的抵达。',
  '深海安静，但从不空旷。你的努力正被这片海悄悄记住。',
];

function buildTasks(
  seedBase: string,
  stageIdx: number,
  startISO: string,
  dayCount: number,
  dailyMinutes: number,
  tpl: Templates,
  rng: () => number,
): Task[] {
  const tasks: Task[] = [];
  let seq = 0;
  const push = (date: string, type: TaskType, title: string, durationMin: number) => {
    tasks.push({
      id: seededId(`${seedBase}-s${stageIdx}-t${seq++}`, seq, 'task'),
      date,
      title,
      durationMin: Math.max(5, Math.round(durationMin)),
      type,
      resource: type === 'study' ? pickBySeed(tpl.resources, rng) : undefined,
      done: false,
    });
  };

  for (let d = 0; d < dayCount; d++) {
    const date = addDays(startISO, d);
    const dow = d % WEEK; // 周期内第几天（0..6）
    const weekIdx = Math.floor(d / WEEK);

    if (dow === WEEK - 1) {
      // 周期第 7 天：单条休息 / 轻复习（奇偶周交替，保证每周都有休息或复习）
      const isReview = weekIdx % 2 === 1;
      push(
        date,
        isReview ? 'review' : 'rest',
        pickBySeed(isReview ? tpl.review : tpl.rest, rng),
        Math.min(dailyMinutes, isReview ? 25 : 15),
      );
      continue;
    }

    if (dailyMinutes >= 20) {
      // 每天 1–2 条：主任务 + 副任务，时长之和严格等于（≤）dailyMinutes
      const subMin = clamp(Math.round(dailyMinutes * 0.3), 8, 15);
      const mainMin = dailyMinutes - subMin;
      push(date, 'study', pickBySeed(tpl.study, rng), mainMin);
      // 周期中段固定安排一次复习（艾宾浩斯式），其余为练习
      const isReviewSlot = dow === 3;
      push(
        date,
        isReviewSlot ? 'review' : 'practice',
        pickBySeed(isReviewSlot ? tpl.review : tpl.practice, rng),
        subMin,
      );
    } else {
      push(date, 'study', pickBySeed(tpl.study, rng), dailyMinutes);
    }
  }

  return tasks;
}

function buildMilestones(
  seedBase: string,
  stageIdx: number,
  title: string,
  goal: string,
): Milestone[] {
  return [
    {
      id: seededId(`${seedBase}-s${stageIdx}`, 1, 'ms'),
      title: `${title} · 阶段目标达成`,
      description: `完成本阶段全部核心任务，围绕「${goal}」建立稳定的学习节奏。`,
    },
    {
      id: seededId(`${seedBase}-s${stageIdx}`, 2, 'ms'),
      title: `${title} · 自测通过`,
      description: '通过一次阶段自测 / 输出，确认本阶段知识已能独立复现。',
    },
  ];
}

/**
 * Mock 计划生成器（确定性）：
 * 同一输入 → 相同的阶段划分、任务结构与标题（时间戳与你无关的字段除外）。
 */
export function mockGenerator(input: PlanInput): LearningPlan {
  const start = todayISO();
  const dailyMinutes = clamp(Math.round(Number(input.dailyMinutes) || 60), 10, 600);
  const goal = (input.goal || '学习目标').trim();

  const seedStr = [goal, input.currentLevel, dailyMinutes, input.deadline, input.preferences]
    .filter(Boolean)
    .join('|');
  const rng = createRng(hashSeed(seedStr));
  const tpl = pickTemplates(input);

  const totalDays = clamp(daysBetween(start, input.deadline || addDays(start, 60)), WEEK, 365);
  const stageCount = clamp(Math.ceil(totalDays / 30), 2, 3);

  // 均分天数：余数依次加到前面的阶段（保证各阶段天数之和 = totalDays）
  const base = Math.floor(totalDays / stageCount);
  const remainder = totalDays % stageCount;
  const spans = Array.from({ length: stageCount }, (_, i) => base + (i < remainder ? 1 : 0));

  const stages: Stage[] = [];
  let cursor = start;

  for (let i = 0; i < stageCount; i++) {
    const span = Math.max(1, spans[i]);
    const stageStart = cursor;
    const stageEnd = addDays(stageStart, span - 1);
    const stageTitle = tpl.stages[i] || `第 ${i + 1} 阶段`;
    const isCurrent = start >= stageStart && start <= stageEnd;

    stages.push({
      id: seededId(`${seedStr}-stage`, i, 'stage'),
      index: i,
      title: stageTitle,
      goal: `围绕「${goal}」推进第 ${i + 1} 阶段：${describeLevel(input.currentLevel, i, stageCount)}`,
      theme: stageThemeByIndex(i, isCurrent),
      startDate: stageStart,
      endDate: stageEnd,
      milestones: buildMilestones(seedStr, i, stageTitle, goal),
      tasks: buildTasks(seedStr, i, stageStart, span, dailyMinutes, tpl, rng),
    });

    cursor = addDays(stageEnd, 1);
  }

  const now = new Date().toISOString();

  return {
    id: seededId(seedStr, 0, 'plan'),
    title: `${goal} · 深海航线`,
    summary: `从「${input.currentLevel || '当前水平'}」出发，每天投入约 ${dailyMinutes} 分钟，用 ${totalDays} 天分 ${stageCount} 个阶段抵达「${goal}」。每周安排 1 天休息或轻复习，复习节奏遵循 1/3/7/15 天。`,
    accent: stages[0].theme,
    createdAt: now,
    updatedAt: now,
    input: { ...input, goal, dailyMinutes },
    stages,
    reviewPlan: [
      { cadence: '当天', description: '任务结束后用 3 分钟口述今天学了什么。' },
      { cadence: '第 3 天', description: '回捞 3 天前的要点，做一次快速自测。' },
      { cadence: '第 7 天', description: '每周固定一天轻复习，把错题与笔记过一遍。' },
      { cadence: '第 15 天', description: '半月做一次阶段自测，确认长期记忆已成形。' },
    ],
    dailyTip: pickBySeed(TIPS, rng),
    streak: 0,
    source: 'mock',
  };
}

function describeLevel(level: string, index: number, total: number): string {
  const lv = (level || '零基础').trim();
  if (index === 0) return `从「${lv}」夯实基础，建立最小可用知识框架`;
  if (index === total - 1) return '进入冲刺收束，强化输出与实战应用';
  return '拓展深度与熟练度，把知识连成网络';
}