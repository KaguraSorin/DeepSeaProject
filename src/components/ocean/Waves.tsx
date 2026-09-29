'use client';

import { motion, useReducedMotion } from 'framer-motion';

/** 分层波浪：底部三段正弦波缓慢起伏 */
export function Waves({ lite = false }: { lite?: boolean }) {
  const reduced = useReducedMotion();
  const still = lite || reduced;

  const layers = [
    { color: 'rgba(60,59,128,0.55)', y: 0, dur: 14, path: 'M0,60 C180,20 360,100 540,60 C720,20 900,100 1080,60 C1260,20 1440,100 1620,60 L1620,160 L0,160 Z' },
    { color: 'rgba(147,115,188,0.28)', y: 14, dur: 20, path: 'M0,80 C200,40 400,110 600,80 C800,50 1000,120 1200,80 C1350,50 1500,110 1620,80 L1620,160 L0,160 Z' },
    { color: 'rgba(94,231,255,0.14)', y: 26, dur: 26, path: 'M0,100 C220,70 420,130 640,100 C860,70 1060,130 1280,100 C1400,80 1520,120 1620,100 L1620,160 L0,160 Z' },
  ];

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[32vh] min-h-[180px]">
      {layers.map((l, i) => (
        <motion.svg
          key={i}
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 1620 160"
          preserveAspectRatio="none"
          animate={still ? undefined : { x: [0, -40, 0] }}
          transition={
            still ? undefined : { duration: l.dur, repeat: Infinity, ease: 'easeInOut' }
          }
          style={{ bottom: -l.y }}
        >
          <path d={l.path} fill={l.color} />
        </motion.svg>
      ))}
    </div>
  );
}