'use client';

import { Download, FileText, Layers, Printer, RefreshCw, Sparkles, Waves } from 'lucide-react';
import { GradientButton } from '@/components/ui/GradientButton';
import { Tag } from '@/components/ui/Tag';
import { cn } from '@/lib/utils/cn';
import { AGENT_NAME, SCHOOL_LOGO_ALT, SCHOOL_LOGO_SRC, SCHOOL_NAME, SITE_NAME } from '@/lib/config/site';

export interface TopNavProps {
  planTitle?: string;
  planCount?: number;
  hasPlan: boolean;
  onNewPlan: () => void;
  onRegenerate: () => void;
  onExportMarkdown: () => void;
  onPrint: () => void;
  onSharePoster: () => void;
  onTogglePlans: () => void;
  exporting?: boolean;
  className?: string;
}

/**
 * 顶部导航：左侧**强制显性展示校徽 + 学校名称**，右侧为当前计划与操作入口。
 * 校徽/校名通过 lib/config/site.ts 常量集中配置，替换真实素材无需改组件。
 */
export function TopNav({
  planTitle,
  planCount = 0,
  hasPlan,
  onNewPlan,
  onRegenerate,
  onExportMarkdown,
  onPrint,
  onSharePoster,
  onTogglePlans,
  exporting = false,
  className,
}: TopNavProps) {
  return (
    <header
      className={cn(
        'glass-strong sticky top-0 z-40 w-full border-b border-[rgba(247,244,255,0.12)] no-print',
        className,
      )}
    >
      <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-4 py-2.5 sm:gap-4 sm:px-6 sm:py-3">
        {/* 校徽 + 校名（显性标识，左置） */}
        <a
          href="#top"
          className="flex min-w-0 shrink-0 items-center gap-2.5 rounded-2xl px-1 py-1"
          aria-label={`${SCHOOL_NAME} · ${SITE_NAME}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={SCHOOL_LOGO_SRC}
            alt={SCHOOL_LOGO_ALT}
            width={38}
            height={38}
            className="h-9 w-9 shrink-0 drop-shadow-[0_0_10px_rgba(94,231,255,0.35)] sm:h-10 sm:w-10"
          />
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-sm font-bold tracking-wide text-text-1 sm:text-base">
              {SCHOOL_NAME}
            </span>
            <span className="hidden truncate text-[11px] text-text-2 sm:block">{SITE_NAME}</span>
          </span>
        </a>

        <span className="hidden h-8 w-px shrink-0 bg-[rgba(247,244,255,0.14)] sm:block" />

        {/* 当前计划名 */}
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Waves size={16} className="hidden shrink-0 text-aurora sm:block" aria-hidden />
          <span className="truncate text-sm text-text-2 sm:text-[15px]">
            {planTitle ? (
              <span className="font-medium text-text-1">{planTitle}</span>
            ) : (
              <span>还没有航线 · 先告诉{AGENT_NAME}你的目标吧</span>
            )}
          </span>
          {planCount > 1 && (
            <Tag color="#5EE7FF" className="hidden shrink-0 md:inline-flex">
              {planCount} 条航线
            </Tag>
          )}
        </div>

        {/* 操作区 */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <GradientButton
            variant="ghost"
            size="sm"
            onClick={onTogglePlans}
            ariaLabel="计划列表"
            className="hidden sm:inline-flex"
          >
            <Layers size={14} aria-hidden />
            <span className="hidden lg:inline">计划</span>
          </GradientButton>

          <GradientButton
            variant="ghost"
            size="sm"
            onClick={onNewPlan}
            ariaLabel="新建计划"
          >
            <Sparkles size={14} aria-hidden />
            <span className="hidden lg:inline">新建</span>
          </GradientButton>

          <GradientButton
            variant="ghost"
            size="sm"
            onClick={onRegenerate}
            disabled={!hasPlan}
            ariaLabel="重新生成航线"
          >
            <RefreshCw size={14} aria-hidden />
            <span className="hidden lg:inline">重算</span>
          </GradientButton>

          <GradientButton
            variant="outline"
            size="sm"
            onClick={onExportMarkdown}
            disabled={!hasPlan}
            ariaLabel="导出 Markdown"
            className="hidden md:inline-flex"
          >
            <FileText size={14} aria-hidden />
            <span className="hidden xl:inline">Markdown</span>
          </GradientButton>

          <GradientButton
            variant="outline"
            size="sm"
            onClick={onPrint}
            disabled={!hasPlan}
            ariaLabel="打印或导出 PDF"
            className="hidden md:inline-flex"
          >
            <Printer size={14} aria-hidden />
            <span className="hidden xl:inline">打印</span>
          </GradientButton>

          <GradientButton
            size="sm"
            onClick={onSharePoster}
            disabled={!hasPlan || exporting}
            ariaLabel="生成分享海报"
          >
            <Download size={14} aria-hidden />
            <span className="hidden sm:inline">{exporting ? '生成中…' : '海报'}</span>
          </GradientButton>
        </div>
      </div>
    </header>
  );
}