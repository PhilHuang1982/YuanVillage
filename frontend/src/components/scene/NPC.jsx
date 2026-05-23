/**
 * NPC.jsx — 游戏地图上的角色容器
 * 立绘 + 浮动动画 + ! 徽章 + 点击说话气泡
 */

import { CharSprite } from '../characters/CharSprite';

export default function NPC({
  name,
  x,
  y,
  label,
  prompt,
  onClick,
  scale = 1,
  mirror = false,
  badge = '！',
}) {
  return (
    <div
      className="no-select"
      onClick={onClick}
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(-50%, -100%) scale(${scale})`,
        transformOrigin: 'bottom center',
        cursor: 'pointer',
        zIndex: 20,
      }}
    >
      {/* 点我说话气泡 */}
      {prompt && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: 14,
          background: 'var(--paper-50)',
          border: '2px solid var(--ink-900)',
          borderRadius: 8,
          padding: '5px 10px',
          fontFamily: 'var(--font-serif)',
          fontSize: 13,
          color: 'var(--ink-900)',
          whiteSpace: 'nowrap',
          boxShadow: '0 3px 0 var(--ink-900)',
          pointerEvents: 'none',
          animation: 'npc-prompt-bob 2.4s ease-in-out infinite',
        }}>
          {prompt}
          {/* 小三角尾巴 */}
          <div style={{
            position: 'absolute', bottom: -8, left: '50%',
            transform: 'translateX(-50%) rotate(45deg)',
            width: 10, height: 10,
            background: 'var(--paper-50)',
            border: '2px solid var(--ink-900)',
            borderTop: 'none', borderLeft: 'none',
          }} />
        </div>
      )}

      {/* ! 徽章 */}
      {badge && (
        <div style={{
          position: 'absolute', top: -18, right: -12,
          width: 26, height: 26, borderRadius: 99,
          background: 'var(--persimmon-500)',
          border: '2px solid var(--ink-900)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 0 var(--ink-900)',
          animation: 'npc-badge-pulse 1.5s ease-in-out infinite',
          zIndex: 2,
          overflow: 'hidden',
        }}>
          <span style={{
            color: 'var(--paper-50)',
            fontFamily: 'var(--font-serif)', fontSize: 15, fontWeight: 700,
            lineHeight: 1, letterSpacing: 0,
            display: 'block',
            textAlign: 'center', width: '100%',
            marginTop: 1,
            /* ！全角字符视觉偏左，仅对单个感叹号补偿 */
            marginLeft: badge === '！' ? 7 : 0,
          }}>{badge}</span>
        </div>
      )}

      {/* 立绘 + 浮动动画 */}
      <div style={{
        animation: 'npc-bob 3s ease-in-out infinite',
        transform: mirror ? 'scaleX(-1)' : 'none',
        filter: 'drop-shadow(0 6px 8px rgba(27,22,18,.25))',
      }}>
        <CharSprite name={name} style={{ width: 120, height: 192, display: 'block' }} />
      </div>

      {/* 名牌 */}
      {label && (
        <div style={{
          position: 'absolute', top: '100%', left: '50%',
          transform: 'translateX(-50%)',
          marginTop: 4,
          background: 'var(--ink-900)', color: 'var(--paper-50)',
          padding: '2px 10px', borderRadius: 4,
          fontFamily: 'var(--font-serif)', fontSize: 12,
          letterSpacing: '0.1em', whiteSpace: 'nowrap',
          pointerEvents: 'none',
        }}>{label}</div>
      )}

      <style>{`
        @keyframes npc-bob {
          0%, 100% { transform: translateY(0) }
          50%      { transform: translateY(-6px) }
        }
        @keyframes npc-prompt-bob {
          0%, 100% { transform: translateX(-50%) translateY(0) }
          50%      { transform: translateX(-50%) translateY(-4px) }
        }
        @keyframes npc-badge-pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 2px 0 var(--ink-900), 0 0 0 0 rgba(217,119,87,.5) }
          50%      { transform: scale(1.08); box-shadow: 0 2px 0 var(--ink-900), 0 0 0 8px rgba(217,119,87,0) }
        }
      `}</style>
    </div>
  );
}
