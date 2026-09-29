import type { ChatMessage, XiiRequest, XiiResponse } from '@/types/chat';
import type { PlanInput } from '@/types/plan';
import { mockGenerator } from '@/lib/mock/generator';
import { getProvider } from './provider';
import { SYSTEM_PROMPT, buildUserPrompt } from './prompt';
import { parsePlanJSON } from './parse';

const QUESTIONS: { key: keyof PlanInput; q: string }[] = [
  { key: 'goal', q: '你想抵达的「目标海域」是什么？比如雅思 7 分、考研上岸、转行前端。' },
  { key: 'currentLevel', q: '你现在的起点大概在哪？完全零基础、有一点基础，还是想进阶提升？' },
  { key: 'dailyMinutes', q: '每天愿意投入多少分钟？哪怕 30 分钟，也可以画出航线。' },
  { key: 'deadline', q: '希望在什么日期之前抵达？给我一个大概的时间点就好。' },
];

function missingFields(input: Partial<PlanInput>): (keyof PlanInput)[] {
  const miss: (keyof PlanInput)[] = [];
  if (!input.goal || !String(input.goal).trim()) miss.push('goal');
  if (!input.currentLevel || !String(input.currentLevel).trim()) miss.push('currentLevel');
  if (!input.dailyMinutes || Number(input.dailyMinutes) <= 0) miss.push('dailyMinutes');
  if (!input.deadline || !String(input.deadline).trim()) miss.push('deadline');
  return miss;
}

function buildQuestions(miss: (keyof PlanInput)[]): string[] {
  return QUESTIONS.filter((item) => miss.includes(item.key))
    .slice(0, 3)
    .map((item) => item.q);
}

/** 把输入补全为完整 PlanInput（用于 Mock 生成） */
function fillInput(input: Partial<PlanInput>): PlanInput {
  return {
    goal: (input.goal || '突破学习目标').trim(),
    currentLevel: (input.currentLevel || '零基础').trim(),
    dailyMinutes: Math.round(Number(input.dailyMinutes) || 60),
    deadline: input.deadline || '',
    preferences: input.preferences,
  };
}

/**
 * 汐的对话 / 生成入口：
 * 1. 关键字段缺失 → 返回最多 3 个追问
 * 2. 字段齐全 → 有 provider 则调用并解析，成功返回 source:'ai'
 * 3. 任一步失败 → 静默回退 Mock，返回 source:'mock'
 */
export async function generateXiiResponse(req: XiiRequest): Promise<XiiResponse> {
  const input = req.input || {};
  const messages: ChatMessage[] = req.messages || [];

  const miss = missingFields(input);
  if (miss.length > 0) {
    return { type: 'question', questions: buildQuestions(miss) };
  }

  const fullInput = fillInput(input);

  try {
    const provider = await getProvider();
    if (provider) {
      const isFollowUp =
        messages.length > 0 && messages.some((m) => m.role === 'xii' && m.kind === 'question');
      const userPrompt = isFollowUp
        ? `${buildUserPrompt(input, messages)}\n\n（以上信息已收集完整，请直接生成计划，不要追问。）`
        : buildUserPrompt(input, messages);

      const raw = await provider.complete({
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }],
      });

      const plan = parsePlanJSON(raw, fullInput);
      if (plan) return { type: 'plan', plan, source: 'ai' };
    }
  } catch {
    // 网络 / 超时 / 解析失败 → 回退 Mock，不阻断用户
  }

  return { type: 'plan', plan: mockGenerator(fullInput), source: 'mock' };
}