/**
 * ToolDock.jsx — 空间场景右侧浮动工具按钮组
 * buttons: { icon, label, badge?, tone?, onClick }[]
 */

export default function ToolDock({ buttons = [] }) {
  return (
    <div style={{
      position: 'absolute',
      bottom: 200, right: 20,
      zIndex: 25,
      display: 'flex', flexDirection: 'column',
      gap: 10,
    }}>
      {buttons.map((b, i) => (
        <button
          key={i}
          onClick={b.onClick}
          title={b.label}
          className="no-select"
          style={{
            all: 'unset', cursor: 'pointer',
            width: 52, height: 52,
            background: 'var(--paper-50)',
            border: '2.5px solid var(--ink-900)',
            borderRadius: 12,
            boxShadow: '0 4px 0 var(--ink-900)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-serif)',
            color: 'var(--ink-900)',
            position: 'relative',
            transition: 'transform .08s ease, box-shadow .08s ease',
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'translateY(3px)';
            e.currentTarget.style.boxShadow = '0 1px 0 var(--ink-900)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 0 var(--ink-900)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 0 var(--ink-900)';
          }}
        >
          <span style={{
            fontSize: 20, fontWeight: 700, lineHeight: 1,
            color: b.tone || 'var(--ink-900)',
          }}>{b.icon}</span>
          <span style={{ fontSize: 10, marginTop: 2, color: 'var(--ink-500)' }}>{b.label}</span>
          {b.badge != null && b.badge > 0 && (
            <span style={{
              position: 'absolute', top: -6, right: -6,
              minWidth: 18, height: 18, padding: '0 5px',
              background: 'var(--persimmon-500)', color: 'var(--paper-50)',
              border: '1.5px solid var(--ink-900)', borderRadius: 99,
              fontSize: 10, fontFamily: 'var(--font-mono)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{b.badge}</span>
          )}
        </button>
      ))}
    </div>
  );
}
