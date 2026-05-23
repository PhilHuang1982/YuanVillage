/**
 * SceneTransition.jsx — 场景切换过场
 * 全屏黑色快闪 550ms，模拟 RPG 进门效果
 */

export default function SceneTransition({ show }) {
  if (!show) return null;
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      zIndex: 90,
      pointerEvents: 'none',
      animation: 'scene-trans 1.1s ease both',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'var(--ink-900)',
        animation: 'trans-flash .55s ease both',
      }} />
      <style>{`
        @keyframes scene-trans {
          0%   { opacity: 1 }
          100% { opacity: 0 }
        }
        @keyframes trans-flash {
          0%   { transform: scaleY(0); transform-origin: center }
          50%  { transform: scaleY(1) }
          100% { transform: scaleY(0); transform-origin: center }
        }
      `}</style>
    </div>
  );
}
