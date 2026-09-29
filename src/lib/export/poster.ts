'use client';

import { toPng } from 'html-to-image';

export interface PosterOptions {
  filename?: string;
  /** 输出倍率，默认 2（社交分享清晰度） */
  pixelRatio?: number;
  backgroundColor?: string;
}

/**
 * 把真实 DOM 节点渲染为 PNG 并下载（复用现有卡片，不重复绘制 Canvas）。
 */
export async function exportNodeAsPng(node: HTMLElement, options: PosterOptions = {}) {
  const { filename = 'deepsea-poster.png', pixelRatio = 2, backgroundColor = '#191B41' } = options;

  const dataUrl = await toPng(node, {
    pixelRatio,
    backgroundColor,
    cacheBust: true,
    filter: (el) => {
      // 过滤掉明确标记为不导出的装饰节点
      const anyEl = el as HTMLElement;
      return !(anyEl?.dataset && anyEl.dataset.export === 'hide');
    },
  });

  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/** 直接下载为图片（不自动触发） */
export async function renderNodeAsPng(node: HTMLElement, options: PosterOptions = {}) {
  const { pixelRatio = 2, backgroundColor = '#191B41' } = options;
  return toPng(node, { pixelRatio, backgroundColor, cacheBust: true });
}