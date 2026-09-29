'use client';

import { Download, ListChecks, Map, MessageCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface BottomBarProps {
  onJumpForm: () => void;
  onJumpRoute: () => void;
  onJumpTasks: () => void;
  onJumpChat: () => void;
  onExport: () => void;
  hasPlan: boolean;
  className?: string;
}

const items = [
  { key: 'form', label: '目标', Icon: Sparkles },
  { key: 'route', label: '航线', Icon: Map },
  { key: 'tasks', label: '任务', Icon: ListChecks },
  { key: 'chat', label: '汐', Icon: MessageCircle },
] as const;

/** 移动端底部快捷栏：仅 lg 以下显示 */
export function BottomBar({
  onJumpForm,
  onJumpRoute,
  onJumpTasks,
  onJumpChat,
  onExport,
  hasPlan,
  className,
}: BottomBarProps) {
  const handlers: Record<string, () => void> = {
    form: onJumpForm,
    route: onJumpRoute,
    tasks: onJumpTasks,
    chat: onJumpChat,
  };

  return (
    <nav
      aria-label="快捷导航"
      className={cn(
        'glass-strong fixed inset-x-0 bottom-0 z-40 border-t border-[rgba(247,244,255,0.12)] no-print lg:hidden',
        className,
      )}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-between px-2 py-1.5">
        {items.map(({ key, label, Icon }) => (
          <button
            key={key}
            type="button"
            onClick={handlers[key]}
            className="flex min-w-[56px] flex-1 flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[11px] text-text-2 transition-colors hover:text-text-1 active:scale-95"
          >
            <Icon size={18} aria-hidden />
            {label}
          </button>
        ))}
        <button
          type="button"
          onClick={onExport}
          disabled={!hasPlan}
          className="flex min-w-[56px] flex-1 flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[11px] text-text-2 transition-colors hover:text-text-1 active:scale-95 disabled:opacity-40"
        >
          <Download size={18} aria-hidden />
          导出
        </button>
      </div>
    </nav>
  );
}