/**
 * DaoLongtanScene.jsx — DAO龙潭数字游民基地室内场景
 *
 * 使用真实照片：public/assets/images/spaces/dao-longtan/interior.png
 * children 用于叠加 NPC / UI 层
 */

export default function DaoLongtanScene({ children }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      background: '#0d1520',
    }}>
      <img
        src="/assets/images/spaces/dao-longtan/interior.png"
        alt="138数字游民基地室内"
        draggable={false}
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'contain', objectPosition: 'center',
          display: 'block',
        }}
      />
      {/* 底部渐变，NPC 融合自然 */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '28%',
        background: 'linear-gradient(to top, rgba(13,21,32,0.55) 0%, transparent 100%)',
        pointerEvents: 'none',
      }} />
      {children}
    </div>
  );
}
