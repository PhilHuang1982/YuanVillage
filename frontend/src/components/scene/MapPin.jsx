/**
 * MapPin.jsx — 地图点位标记（RPG 风格泪滴形）
 * 替换旧版简单圆圈标记
 */

export default function MapPin({ x, y, label, color = 'var(--ink-900)', onClick, locked = false }) {
  return (
    <button
      className="no-select"
      onClick={locked ? undefined : onClick}
      style={{
        all: 'unset',
        cursor: locked ? 'not-allowed' : 'pointer',
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -100%)',
        zIndex: 15,
        opacity: locked ? 0.55 : 1,
      }}
    >
      <div style={{
        width: 32, height: 40,
        position: 'relative',
        filter: 'drop-shadow(0 4px 4px rgba(27,22,18,.25))',
      }}>
        <svg viewBox="0 0 32 40" width="32" height="40">
          <path d="M 16 38 C 4 22 4 12 16 4 C 28 12 28 22 16 38 Z"
            fill={color} stroke="#1b1612" strokeWidth="2" />
          <circle cx="16" cy="14" r="5" fill="var(--paper-50)" stroke="#1b1612" strokeWidth="1.5" />
        </svg>
      </div>
      <div style={{
        position: 'absolute', top: '100%', left: '50%',
        transform: 'translateX(-50%)',
        marginTop: 2,
        background: 'var(--paper-50)',
        border: '1.5px solid var(--ink-900)',
        padding: '1px 8px', borderRadius: 4,
        fontFamily: 'var(--font-serif)', fontSize: 11,
        color: 'var(--ink-900)', whiteSpace: 'nowrap',
        boxShadow: '0 2px 0 var(--ink-900)',
      }}>
        {label}{locked && ' 🔒'}
      </div>
    </button>
  );
}
