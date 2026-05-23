/**
 * components/TaijiOpening.jsx
 * 太极开场动画 — 进入地图前的全屏过场
 *
 * props:
 *   onDone — 动画完成后回调
 */

import { useEffect, useState } from 'react';

export default function TaijiOpening({ onDone }) {
  const [phase, setPhase] = useState('in'); // 'in' | 'hold' | 'out'

  useEffect(() => {
    // 进场 0.8s → 停留 1.5s → 退场 0.8s → done
    const t1 = setTimeout(() => setPhase('hold'), 800);
    const t2 = setTimeout(() => setPhase('out'), 2300);
    const t3 = setTimeout(() => onDone?.(), 3100);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, []);

  return (
    <div className={`
      fixed inset-0 z-50 bg-stone-900 flex flex-col items-center justify-center
      transition-opacity duration-700
      ${phase === 'out' ? 'opacity-0 pointer-events-none' : 'opacity-100'}
    `}>
      {/* 太极 SVG */}
      <div className={`
        transition-transform duration-700
        ${phase === 'in' ? 'scale-75 opacity-0' : 'scale-100 opacity-100'}
        ${phase === 'out' ? 'scale-110' : ''}
      `}>
        <svg width="120" height="120" viewBox="0 0 120 120" className="animate-spin-slow">
          {/* 外圆 */}
          <circle cx="60" cy="60" r="58" fill="none" stroke="#d6d3d1" strokeWidth="1" />
          {/* 阴半（黑） */}
          <path d="M60,2 A58,58 0 0,1 60,118 A29,29 0 0,1 60,60 A29,29 0 0,0 60,2 Z" fill="#1c1917" />
          {/* 阳半（白） */}
          <path d="M60,2 A58,58 0 0,0 60,118 A29,29 0 0,0 60,60 A29,29 0 0,1 60,2 Z" fill="#fafaf9" />
          {/* 阴中阳鱼眼 */}
          <circle cx="60" cy="31" r="9" fill="#fafaf9" />
          {/* 阳中阴鱼眼 */}
          <circle cx="60" cy="89" r="9" fill="#1c1917" />
        </svg>
      </div>

      <div className={`
        mt-6 text-center transition-all duration-700
        ${phase === 'in' ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}
      `}>
        <p className="text-stone-100 text-lg font-light tracking-widest">元家乡 2050</p>
        <p className="text-stone-400 text-xs mt-1 tracking-wider">龙潭村数字旅居平台</p>
      </div>

      {/* 跳过 */}
      <button
        onClick={onDone}
        className="absolute bottom-8 text-stone-500 text-xs hover:text-stone-300 transition-colors"
      >
        跳过
      </button>
    </div>
  );
}
