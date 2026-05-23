/**
 * CharPortrait.jsx — 角色对话框头像（加载 public/assets/characters/）
 *
 * 替换方式：直接换对应的 SVG 文件，组件无需改动。
 *   longxun → /assets/characters/longxun-portrait-120x150.svg
 *   xiaomei → /assets/characters/xiaomei-portrait-120x150.svg
 *
 * 分辨率：120×150（viewBox 裁剪窗口，取头部+肩膀区域）
 */

const PORTRAIT_MAP = {
  longxun:  '/assets/characters/longxun-portrait-120x150.svg',
  xiaomei:  '/assets/characters/xiaomei-portrait-120x150.png',
  qianyu:   '/assets/characters/qianyu-portrait.png',
  huangzhe: '/assets/characters/huangzhe-portrait.png',
  gangzi:   '/assets/characters/gangzi-portrait.png',
  corgi:    '/assets/characters/gangzi-corgi.svg',
};

export function CharPortrait({ name, className = '', style }) {
  const src = PORTRAIT_MAP[name];
  if (!src) return null;
  return (
    <img
      src={src}
      alt={name}
      className={className}
      draggable={false}
      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', ...style }}
    />
  );
}
