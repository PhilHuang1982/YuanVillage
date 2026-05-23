/**
 * SlideOver.jsx — 通用右侧滑出面板容器
 */

export default function SlideOver({ title, icon, open, onClose, accent, children }) {
  if (!open) return null;
  return (
    <>
      {/* 遮罩 */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0, zIndex: 60,
          background: 'rgba(27,22,18,.35)',
        }}
      />
      {/* 面板 */}
      <div style={{
        position: 'absolute',
        top: 0, right: 0, bottom: 0,
        width: 'min(420px, 90vw)',
        background: 'var(--paper-100)',
        zIndex: 61,
        border: '2px solid var(--ink-900)',
        borderRight: 'none',
        boxShadow: '-6px 0 0 var(--ink-900), -16px 0 40px rgba(27,22,18,.25)',
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideover-in .25s ease',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 18px',
          display: 'flex', alignItems: 'center', gap: 12,
          borderBottom: '2px solid var(--ink-900)',
          background: 'var(--paper-200)',
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: accent || 'var(--persimmon-500)',
            color: 'var(--paper-50)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 700,
            border: '2px solid var(--ink-900)',
            boxShadow: '0 2px 0 var(--ink-900)',
          }}>{icon}</div>
          <h2 style={{
            margin: 0, fontFamily: 'var(--font-serif)', fontSize: 18,
            color: 'var(--ink-900)', flex: 1,
          }}>{title}</h2>
          <button onClick={onClose} style={{
            all: 'unset', cursor: 'pointer',
            width: 32, height: 32, borderRadius: 99,
            border: '2px solid var(--ink-900)',
            background: 'var(--paper-50)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, color: 'var(--ink-900)',
            boxShadow: '0 2px 0 var(--ink-900)',
          }}>×</button>
        </div>
        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 18 }}>
          {children}
        </div>
      </div>

      <style>{`
        @keyframes slideover-in {
          from { transform: translateX(100%) }
          to   { transform: translateX(0) }
        }
      `}</style>
    </>
  );
}
