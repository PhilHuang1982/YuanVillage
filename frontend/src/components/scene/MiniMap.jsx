/**
 * MiniMap.jsx — 左上角村地图缩略图
 *
 * 显示村庄 SVG 地图的小版本，当前空间位置用橙红色脉冲圆点标注。
 * 放置在 HUD 下方（top: 72px），不含龙圣子 NPC。
 */

import VillageMapSVG from '../maps/VillageMap.jsx';

/** 各空间在村地图上的位置（与 VillageMap.jsx MapPin 坐标一致）*/
const SPACE_DOTS = {
  xiaomeizhuang:        { x: 20, y: 40 },
  'dao-longtan':        { x: 48, y: 75 },
  jindouzi:             { x: 33, y: 37 },
  'huangzhe-ai-studio': { x: 50, y: 55 },
};

const MAP_W = 336;
const MAP_H = 252;

export default function MiniMap({ slug }) {
  const dot = SPACE_DOTS[slug];

  return (
    <div
      title="龙潭村地图"
      style={{
        position: 'absolute',
        top: 72,
        left: 16,
        width: MAP_W,
        height: MAP_H,
        zIndex: 30,
        borderRadius: 8,
        overflow: 'hidden',
        border: '2px solid var(--ink-900, #1C1410)',
        boxShadow: '0 4px 0 var(--ink-900, #1C1410)',
        pointerEvents: 'none',   /* 不阻挡点击 */
      }}
    >
      {/* 地图底图（SVG 完整缩放） */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <VillageMapSVG style={{ width: '100%', height: '100%', display: 'block' }} />
      </div>

      {/* 半透明磨砂遮罩，让地图稍暗便于圆点突出 */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(255,248,236,0.15)',
        pointerEvents: 'none',
      }} />

      {/* 当前位置脉冲圆点 */}
      {dot && (
        <div style={{
          position: 'absolute',
          left: `${dot.x}%`,
          top: `${dot.y}%`,
          transform: 'translate(-50%, -50%)',
          zIndex: 2,
          pointerEvents: 'none',
        }}>
          {/* 脉冲光环 */}
          <div style={{
            position: 'absolute',
            width: 36, height: 36,
            borderRadius: '50%',
            background: 'var(--persimmon-500, #d97753)',
            left: '50%', top: '50%',
            transform: 'translate(-50%, -50%)',
            animation: 'mm-pulse 1.6s ease-out infinite',
          }} />
          {/* 实心圆点 */}
          <div style={{
            width: 14, height: 14,
            borderRadius: '50%',
            background: 'var(--persimmon-500, #d97753)',
            border: '2px solid #fff',
            boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
          }} />
        </div>
      )}

      {/* 左上角「龙潭村」标签 */}
      <div style={{
        position: 'absolute',
        top: 4, left: 6,
        fontFamily: 'var(--font-serif, "Noto Serif SC", serif)',
        fontSize: 10,
        color: 'var(--ink-700, #4a3728)',
        letterSpacing: '0.05em',
        pointerEvents: 'none',
        textShadow: '0 1px 2px rgba(255,248,236,0.9)',
        lineHeight: 1,
      }}>
        龙潭村
      </div>

      <style>{`
        @keyframes mm-pulse {
          0%   { transform: translate(-50%,-50%) scale(0.8); opacity: 0.7; }
          70%  { transform: translate(-50%,-50%) scale(2.4); opacity: 0; }
          100% { transform: translate(-50%,-50%) scale(2.4); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
