/**
 * CharSprite.jsx — 角色全身立绘（加载 public/assets/characters/）
 *
 * 替换方式：直接换对应的 SVG 文件，组件无需改动。
 *   longxun → /assets/characters/longxun-sprite-200x320.svg
 *   xiaomei → /assets/characters/xiaomei-sprite-200x320.svg
 *
 * 分辨率：200×320（viewBox 坐标系，渲染尺寸由 style 控制）
 */

const SPRITE_MAP = {
  longxun:  '/assets/characters/longxun-sprite-200x320.svg',
  xiaomei:  '/assets/characters/xiaomei-sprite-200x320.png',
  qianyu:   '/assets/characters/qianyu-sprite.png',
  huangzhe: '/assets/characters/huangzhe-sprite.png',
  gangzi:   '/assets/characters/gangzi-sprite.png',
  corgi:    '/assets/characters/gangzi-corgi.svg',
};

export function CharSprite({ name, className = '', style }) {
  const src = SPRITE_MAP[name];
  if (!src) return null;
  return (
    <img
      src={src}
      alt={name}
      className={className}
      draggable={false}
      style={{ display: 'block', ...style }}
    />
  );
}
