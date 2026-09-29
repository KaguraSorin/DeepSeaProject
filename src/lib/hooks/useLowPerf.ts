'use client';

import { useEffect, useState } from 'react';

export interface LowPerfState {
  /** 用户偏好减少动态 */
  reducedMotion: boolean;
  /** 低性能设备（窄屏 / 少核 / 少内存 / 省流量） */
  lowPerf: boolean;
  /** 是否应关闭光斑 / 噪点 / 3D 倾斜等重效果 */
  liteMode: boolean;
  ready: boolean;
}

/**
 * 低性能 / 减少动态探测：
 * - 支持 prefers-reduced-motion 时关闭动画
 * - 依据 CPU 核数、内存、屏幕宽度判断是否降级
 */
export function useLowPerf(): LowPerfState {
  const [state, setState] = useState<LowPerfState>({
    reducedMotion: false,
    lowPerf: false,
    liteMode: false,
    ready: false,
  });

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const nav: any = navigator;

    const compute = () => {
      const reducedMotion = mq.matches;
      const cores = nav.hardwareConcurrency || 4;
      const mem = nav.deviceMemory || 8;
      const narrow = window.innerWidth < 480;
      const saveData = nav.connection?.saveData === true;
      const lowPerf = cores <= 4 || mem <= 4 || saveData;
      setState({
        reducedMotion,
        lowPerf,
        liteMode: reducedMotion || lowPerf || narrow,
        ready: true,
      });
    };

    compute();
    mq.addEventListener('change', compute);
    return () => mq.removeEventListener('change', compute);
  }, []);

  return state;
}