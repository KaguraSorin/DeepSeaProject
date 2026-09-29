export type ChatRole = 'user' | 'xii';
export type ChatKind = 'question' | 'answer' | 'plan' | 'system';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  kind?: ChatKind;
}

/** POST /api/xii 请求体 */
export interface XiiRequest {
  input: Partial<PlanInputValue>;
  messages: ChatMessage[];
}

type PlanInputValue = {
  goal: string;
  currentLevel: string;
  dailyMinutes: number;
  deadline: string;
  preferences?: string;
};

/** POST /api/xii 响应体 */
export type XiiResponse =
  | { type: 'question'; questions: string[] }
  | { type: 'plan'; plan: import('./plan').LearningPlan; source: 'ai' | 'mock' };