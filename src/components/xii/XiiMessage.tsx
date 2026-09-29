'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { HelpCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { AGENT_NAME } from '@/lib/config/site';
import type { ChatMessage } from '@/types/chat';

export interface XiiMessageProps {
  message: ChatMessage;
}

/** 打字机：汐的消息逐字显示；减少动态时直接全量展示。 */
function useTypewriter(text: string, enabled: boolean) {
  const [shown, setShown] = useState(() => (enabled ? '' : text));

  useEffect(() => {
    if (!enabled) {
      setShown(text);
      return;
    }
    setShown('');
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) window.clearInterval(id);
    }, 22);
    return () => window.clearInterval(id);
  }, [text, enabled]);

  return shown;
}

export function XiiMessage({ message }: XiiMessageProps) {
  const reduced = useReducedMotion();
  const isUser = message.role === 'user';
  const typewriterOn = !isUser && !reduced;
  const shown = useTypewriter(message.content, typewriterOn);
  const typing = typewriterOn && shown.length < message.content.length;

  const isQuestion = message.kind === 'question';
  const isPlan = message.kind === 'plan';

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn('flex w-full gap-2.5', isUser ? 'justify-end' : 'justify-start')}
    >
      {/* 汐的头像 */}
      {!isUser && (
        <span
          aria-hidden
          className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[rgba(147,115,188,0.55)] bg-[rgba(147,115,188,0.18)] text-xs font-semibold text-text-1"
        >
          {AGENT_NAME}
        </span>
      )}

      <div className={cn('flex max-w-[85%] flex-col', isUser ? 'items-end' : 'items-start')}>
        {/* kind 提示胶囊 */}
        {isQuestion && (
          <span className="mb-1.5 inline-flex items-center gap-1 rounded-full border border-cyan/50 bg-cyan/10 px-2.5 py-0.5 text-xs text-cyan">
            <HelpCircle size={12} aria-hidden />
            {AGENT_NAME}想先了解几件事
          </span>
        )}
        {isPlan && (
          <span className="mb-1.5 inline-flex items-center gap-1 rounded-full border border-mint/50 bg-mint/10 px-2.5 py-0.5 text-xs text-mint">
            <Sparkles size={12} aria-hidden />
            航线已生成
          </span>
        )}

        {/* 气泡 */}
        <div
          className={cn(
            'whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
            isUser
              ? 'rounded-tr-md bg-gradient-to-br from-aurora to-indigo text-text-1 shadow-glow'
              : 'glass rounded-tl-md text-text-1',
            isQuestion && 'ring-1 ring-cyan/45',
          )}
        >
          {isUser ? message.content : shown}
          {typing && (
            <span
              aria-hidden
              className="ml-0.5 inline-block h-3.5 w-[2px] translate-y-0.5 animate-pulse rounded-full bg-aurora align-middle"
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}