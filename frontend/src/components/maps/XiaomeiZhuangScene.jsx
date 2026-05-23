/**
 * XiaomeiZhuangScene.jsx — 小梅桩室内场景
 *
 * 使用真实照片：public/assets/images/spaces/xiaomeizhuang/interior.png
 * children 用于叠加 NPC / UI 层
 */

export default function XiaomeiZhuangScene({ children }) {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#1a130d' }}>
      <img
        src="/assets/images/spaces/xiaomeizhuang/interior.png"
        alt="小梅桩室内"
        draggable={false}
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'contain', objectPosition: 'center',
          display: 'block',
        }}
      />
      {/* 底部渐变，让 NPC 融合自然 */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%',
        background: 'linear-gradient(to top, rgba(26,19,13,0.55) 0%, transparent 100%)',
        pointerEvents: 'none',
      }} />
      {children}
    </div>
  );
}
