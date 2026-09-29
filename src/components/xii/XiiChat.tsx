'use client';

import { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GradientButton } from '@/components/ui/GradientButton';
import { XiiMessage } from './XiiMessage';
import { ThinkingWave } from './ThinkingWave';
import { cn } from '@/lib/utils/cn';
import { AGENT_NAME } from '@/lib/config/site';
import type { ChatMessage } from '@/types/chat';

export interface XiiChatProps {
  messages: ChatMessage[];
  thinking?: boolean;
  onSend: (text: string) => void;
  disabled?: boolean;
  className?: string;
}

/** 汐对话：消息列表 + 输入框；Enter 发送、Shift+Enter 换行。 */
export function XiiChat({
  messages,
  thinking = false,
  onSend,
  disabled = false,
  className,
}: XiiChatProps) {
  const [text, setText] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  // 新消息 / 思考时自动滚到底部
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length, thinking]);

  function submit() {
    const t = text.trim();
    if (!t || disabled) return;
    onSend(t);
    setText('');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    submit();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <GlassCard className={cn('flex flex-col gap-3', className)}>
      {/* 消息列表 */}
      <div
        ref={listRef}
        className="no-scrollbar flex max-h-[52vh] flex-col gap-3 overflow-y-auto pr-1 sm:max-h-[60vh]"
      >
        {messages.length === 0 && !thinking ? (
          <div className="flex gap-2.5">
            <span
              aria-hidden
              className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[rgba(147,115,188,0.55)] bg-[rgba(147,115,188,0.18)] text-xs font-semibold text-text-1"
            >
              {AGENT_NAME}
            </span>
            <div className="glass max-w-[85%] rounded-2xl rounded-tl-md px-4 py-3 text-sm leading-relaxed text-text-1">
              <p>你好，我是{AGENT_NAME} 🐚</p>
              <p className="mt-1 text-text-2">
                告诉我你的目标和每天能投入的时间，我就为你铺一条深海航线；也可以直接问我，比如「雅思 7
                分大概要准备多久？」
              </p>
            </div>
          </div>
        ) : (
          messages.map((m) => <XiiMessage key={m.id} message={m} />)
        )}

        {thinking && <ThinkingWave className="pl-1" />}
      </div>

      {/* 输入区 */}
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <label htmlFor="xii-input" className="sr-only">
          给{AGENT_NAME}发消息
        </label>
        <textarea
          id="xii-input"
          rows={2}
          value={text}
          disabled={disabled}
          placeholder={`和${AGENT_NAME}说点什么…（Enter 发送，Shift+Enter 换行）`}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          className={cn(
            'max-h-28 min-h-[44px] flex-1 resize-none rounded-2xl border bg-[rgba(247,244,255,0.05)] px-3.5 py-2.5 text-sm text-text-1',
            'placeholder:text-text-2/55 transition-colors focus:border-[rgba(147,115,188,0.7)] focus:outline-none',
            'border-[rgba(247,244,255,0.14)] disabled:cursor-not-allowed disabled:opacity-50',
          )}
        />
        <GradientButton
          type="submit"
          disabled={disabled || text.trim().length === 0}
          ariaLabel="发送"
          className="rounded-full px-3 py-3"
        >
          <Send size={18} aria-hidden />
        </GradientButton>
      </form>
    </GlassCard>
  );
}