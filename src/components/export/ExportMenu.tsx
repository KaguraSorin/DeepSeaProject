'use client';

import { useState } from 'react';
import { Copy, Download, FileText, Image as ImageIcon, Printer } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GradientButton } from '@/components/ui/GradientButton';
import { cn } from '@/lib/utils/cn';

export interface ExportMenuProps {
  onMarkdown: () => void;
  onPrint: () => void;
  onPoster: () => void;
  onCopy: () => void | Promise<void>;
  disabled?: boolean;
  busy?: boolean;
  className?: string;
}

/** 导出菜单：Markdown 下载 / 打印 PDF / 分享海报 / 复制 Markdown */
export function ExportMenu({
  onMarkdown,
  onPrint,
  onPoster,
  onCopy,
  disabled,
  busy,
  className,
}: ExportMenuProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <GlassCard className={cn('no-print', className)}>
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-text-1">
        <Download size={15} className="text-aurora" aria-hidden />
        保存与分享
      </h3>
      <div className="grid grid-cols-2 gap-2.5">
        <GradientButton variant="outline" size="sm" onClick={onMarkdown} disabled={disabled}>
          <FileText size={14} aria-hidden />
          Markdown
        </GradientButton>
        <GradientButton variant="outline" size="sm" onClick={onPrint} disabled={disabled}>
          <Printer size={14} aria-hidden />
          打印 / PDF
        </GradientButton>
        <GradientButton variant="outline" size="sm" onClick={handleCopy} disabled={disabled}>
          <Copy size={14} aria-hidden />
          {copied ? '已复制' : '复制文本'}
        </GradientButton>
        <GradientButton size="sm" onClick={onPoster} disabled={disabled || busy}>
          <ImageIcon size={14} aria-hidden />
          {busy ? '生成中…' : '分享海报'}
        </GradientButton>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-text-2">
        数据自动保存在本地浏览器，刷新不会丢失。导出即可带走你的航线。
      </p>
    </GlassCard>
  );
}