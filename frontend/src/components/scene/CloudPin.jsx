/**
 * CloudPin.jsx — 云空间地图点位标记
 *
 * 视觉规范（来自 spec）：
 * - 白银色虚化光晕，半透明
 * - 呼吸动效（opacity 0.6 ↔ 1.0，3s 循环）
 * - 使用 public/assets/characters/<icon> 自定义图标
 * - 标签附带 ☁ 标记，与实空间泪滴形成视觉区分
 */

import { useState } from 'react';

export default function CloudPin({ x, y, label, icon, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      className="no-select"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        all: 'unset',
        cursor: 'pointer',
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: 15,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
      }}
    >
      {/* 光晕底层 */}
      <div style={{
        position: 'relative',
        width: 68,
        height: 68,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {/* 外层大光晕 */}
        <div style={{
          position: 'absolute',
          inset: -18,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(180,210,255,0.45) 0%, rgba(160,190,255,0.15) 55%, transparent 80%)',
          animation: 'cloud-breathe 3s ease-in-out infinite',
          transform: hovered ? 'scale(1.2)' : 'scale(1)',
          transition: 'transform 0.3s ease',
        }} />
        {/* 内层亮核 */}
        <div style={{
          position: 'absolute',
          inset: -6,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(220,235,255,0.75) 0%, rgba(180,210,255,0.3) 60%, transparent 100%)',
          animation: 'cloud-breathe 3s ease-in-out infinite 0.4s',
          boxShadow: hovered
            ? '0 0 24px 8px rgba(160,190,255,0.55)'
            : '0 0 16px 4px rgba(160,190,255,0.35)',
          transition: 'box-shadow 0.3s ease',
        }} />

        {/* 图标 */}
        <img
          src={`/assets/characters/${icon}`}
          alt={label}
          draggable={false}
          style={{
            width: 58,
            height: 58,
            objectFit: 'contain',
            display: 'block',
            position: 'relative',
            zIndex: 1,
            filter: hovered
              ? 'drop-shadow(0 0 12px rgba(160,190,255,1)) drop-shadow(0 0 4px rgba(255,255,255,0.8))'
              : 'drop-shadow(0 0 8px rgba(140,170,255,0.7)) drop-shadow(0 2px 4px rgba(100,130,220,0.4))',
            transition: 'filter 0.3s ease',
          }}
        />
      </div>

      {/* 标签 */}
      <div style={{
        background: 'rgba(230,238,255,0.92)',
        border: '1.5px solid rgba(140,170,230,0.8)',
        padding: '1px 8px',
        borderRadius: 4,
        fontFamily: 'var(--font-serif)',
        fontSize: 11,
        color: '#3a4a7a',
        whiteSpace: 'nowrap',
        boxShadow: '0 2px 8px rgba(120,150,220,0.2)',
        backdropFilter: 'blur(4px)',
      }}>
        ☁ {label}
      </div>

      <style>{`
        @keyframes cloud-breathe {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
    </button>
  );
}
