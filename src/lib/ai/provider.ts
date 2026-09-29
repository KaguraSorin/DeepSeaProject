export interface AICompletionArgs {
  system: string;
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[];
}

export interface AIProvider {
  name: string;
  complete(a: AICompletionArgs): Promise<string>;
}

/** 读取环境变量（不含任何真实密钥；未配置则返回 null，全量走 Mock） */
export function readAIConfig() {
  const provider = (process.env.AI_PROVIDER || 'none').toLowerCase();
  const apiKey = process.env.AI_API_KEY || '';
  const baseUrl = process.env.AI_BASE_URL || 'https://api.openai.com/v1';
  const model = process.env.AI_MODEL || 'gpt-4o-mini';
  return { provider, apiKey, baseUrl, model };
}

/**
 * 获取 AI Provider：
 * - 未配置（provider=none 或无密钥）→ 返回 null，调用方静默回退 Mock
 */
export async function getProvider(): Promise<AIProvider | null> {
  const cfg = readAIConfig();
  if (cfg.provider === 'none' || !cfg.apiKey) return null;
  const { createOpenAIProvider } = await import('./openai');
  return createOpenAIProvider(cfg);
}