'use client';

import { useMemo } from 'react';
import { createRng } from '@/lib/utils/id';

/**
 * 漂浮气泡：向上缓慢浮升。
 * 使用固定种子生成位置，保证 SSR / CSR 渲染一致（避免 hydration 警告）。
 */
export function Bubbles({ lite = false }: { lite?: boolean }) {
  const count = lite ? 8 : 20;

  const bubbles = useMemo(() => {
    const rng = createRng(20240401);
    return Array.from({ length: count }, (_, i) => {
      const size = 4 + rng() * 16;
      return {
        id: i,
        left: `${rng() * 100}%`,
        size,
        delay: rng() * 16,
        duration: 16 + rng() * 14,
        opacity: 0.15 + rng() * 0.3,
      };
    });
  }, [count]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {bubbles.map((b) => (
        <span
          key={b.id}
          className="absolute bottom-[-60px] rounded-full"
          style={{
            left: b.left,
            width: b.size,
            height: b.size,
            background:
              'radial-gradient(circle at 32% 28%, rgba(247,244,255,0.85), rgba(201,196,230,0.28) 55%, transparent 72%)',
            border: '1px solid rgba(247,244,255,0.18)',
            opacity: b.opacity,
            animation: lite ? undefined : `rise ${b.duration}s linear ${b.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}