'use client';

import { useEffect } from 'react';
import { useLowPerf } from '@/lib/hooks/useLowPerf';
import { AuroraBlobs } from './AuroraBlobs';
import { Bubbles } from './Bubbles';
import { Waves } from './Waves';
import { NoiseOverlay } from './NoiseOverlay';

/**
 * 动态海洋底座：midnight→indigo 径向渐变 + aurora 光斑漂移 + 雾白气泡 + 分层波浪 + 轻噪点。
 * 同时把低性能 / 减少动态状态写到 <html data-motion>，供 CSS 全局降级。
 */
export function OceanBackground() {
  const { liteMode } = useLowPerf();

  useEffect(() => {
    document.documentElement.dataset.motion = liteMode ? 'off' : 'on';
  }, [liteMode]);

  return (
    <div aria-hidden className="ocean-bg pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* 基础径向渐变 */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 90% at 20% 0%, #3C3B80 0%, #24264f 38%, #191B41 72%, #12132e 100%)',
        }}
      />
      {/* 顶部微光 */}
      <div
        className="absolute inset-x-0 top-0 h-[45vh]"
        style={{
          background:
            'radial-gradient(60% 100% at 50% 0%, rgba(147,115,188,0.30), transparent 70%)',
        }}
      />
      {!liteMode && <AuroraBlobs lite={liteMode} />}
      <Bubbles lite={liteMode} />
      <Waves lite={liteMode} />
      {!liteMode && <NoiseOverlay />}
      {/* 底部压暗，保证文字对比度 */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-midnight/85 to-transparent" />
    </div>
  );
}