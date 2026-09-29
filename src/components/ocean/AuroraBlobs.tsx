'use client';

import { motion, useReducedMotion } from 'framer-motion';

/** 极光光斑：缓慢漂移的紫色/青色模糊光团 */
export function AuroraBlobs({ lite = false }: { lite?: boolean }) {
  const reduced = useReducedMotion();
  const still = lite || reduced;

  const blobs = [
    { top: '-12%', left: '-8%', size: 520, color: 'rgba(147,115,188,0.42)', dur: 26, delay: 0 },
    { top: '18%', left: '58%', size: 460, color: 'rgba(94,231,255,0.16)', dur: 32, delay: 2.5 },
    { top: '58%', left: '6%', size: 480, color: 'rgba(60,59,128,0.55)', dur: 30, delay: 1.2 },
    { top: '70%', left: '66%', size: 380, color: 'rgba(123,255,203,0.10)', dur: 36, delay: 3.4 },
  ];

  return (
    <div className="absolute inset-0">
      {blobs.map((b, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            top: b.top,
            left: b.left,
            width: b.size,
            height: b.size,
            background: `radial-gradient(circle at 50% 50%, ${b.color}, transparent 68%)`,
            filter: 'blur(46px)',
          }}
          animate={
            still
              ? undefined
              : { x: [0, 28, -18, 0], y: [0, -22, 16, 0], scale: [1, 1.08, 0.96, 1] }
          }
          transition={
            still
              ? undefined
              : { duration: b.dur, repeat: Infinity, ease: 'easeInOut', delay: b.delay }
          }
        />
      ))}
    </div>
  );
}