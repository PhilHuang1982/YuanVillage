/**
 * JindouziScene.jsx — 金豆子场景背景（写实风格）
 * 主理人：钢子（漫画师·马拉松跑者·烧烤师傅）
 */
export default function JindouziScene({ children }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      background: '#1a1208',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <img
        src="/assets/images/spaces/jindouzi/jindouzi-bg.jpg"
        alt="金豆子"
        draggable={false}
        style={{
          maxWidth: '100%', maxHeight: '100%',
          width: 'auto', height: 'auto',
          display: 'block',
          objectFit: 'contain',
        }}
      />
      {children}
    </div>
  );
}
