import type { AICompletionArgs, AIProvider } from './provider';

interface OpenAIConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
  provider: string;
}

const TIMEOUT_MS = 30_000;

/**
 * OpenAI 兼容 Provider：原生 fetch 调 /chat/completions。
 * 兼容 OpenAI / 通义 DashScope / 智谱 / 任意自建兼容端点。
 */
export function createOpenAIProvider(cfg: OpenAIConfig): AIProvider {
  return {
    name: cfg.provider,
    async complete({ system, messages }: AICompletionArgs): Promise<string> {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

      try {
        const res = await fetch(`${cfg.baseUrl.replace(/\/$/, '')}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${cfg.apiKey}`,
          },
          body: JSON.stringify({
            model: cfg.model,
            temperature: 0.7,
            messages: [{ role: 'system', content: system }, ...messages],
            response_format: { type: 'json_object' },
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`AI request failed: ${res.status}`);
        }

        const data = await res.json();
        const content = data?.choices?.[0]?.message?.content;
        if (typeof content !== 'string' || !content.trim()) {
          throw new Error('AI response empty');
        }
        return content;
      } finally {
        clearTimeout(timer);
      }
    },
  };
}