/**
 * VillageMap.jsx — 龙潭村手绘地图（加载 public/assets/maps/）
 *
 * 替换方式：把 village-map-1600x1000.png 换成新图即可，此文件无需改动。
 *
 * 分辨率：1600×1000（设计分辨率）
 * objectFit: contain — 保证地图完整显示，不裁切；两侧空白由父容器 paper 色填充。
 */

export default function VillageMap({ className = '', style }) {
  return (
    <img
      src="/assets/maps/village-map-1600x1000.png"
      alt="龙潭村插画地图"
      className={className}
      draggable={false}
      style={{ objectFit: 'contain', objectPosition: 'center', ...style }}
    />
  );
}
