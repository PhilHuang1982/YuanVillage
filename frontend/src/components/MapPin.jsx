/**
 * components/MapPin.jsx
 * 地图上的空间点位，绝对定位，由父层容器决定坐标系
 *
 * props:
 *   space      — 空间对象 { slug, name, space_kind, map_position:{x,y}, short_pitch, host_person_slug }
 *   onClick    — 点击回调
 *   active     — 是否高亮
 */

export default function MapPin({ space, onClick, active = false }) {
  const { name, space_kind, map_position, short_pitch } = space;
  const isCloud = space_kind === 'cloud';
  const x = map_position?.x ?? 50;
  const y = map_position?.y ?? 50;

  return (
    <button
      onClick={() => onClick?.(space)}
      style={{ left: `${x}%`, top: `${y}%` }}
      className="absolute -translate-x-1/2 -translate-y-1/2 group z-20"
      title={name}
    >
      {/* 光晕（云空间 or active 时） */}
      {(isCloud || active) && (
        <span className={`
          absolute inset-0 rounded-full animate-ping opacity-40
          ${isCloud ? 'bg-sky-400' : 'bg-amber-400'}
        `} style={{ transform: 'scale(2)' }} />
      )}

      {/* 主点位 */}
      <span className={`
        relative flex items-center justify-center w-5 h-5 rounded-full border-2 shadow-md transition-transform group-hover:scale-125
        ${active
          ? 'bg-amber-500 border-amber-300 scale-125'
          : isCloud
            ? 'bg-sky-500 border-sky-300'
            : 'bg-stone-800 border-stone-400'
        }
      `}>
        <span className="text-white text-[8px] font-bold leading-none">
          {isCloud ? '☁' : ''}
        </span>
      </span>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center pointer-events-none">
        <div className="bg-stone-800 text-white text-xs rounded-xl px-2.5 py-1.5 whitespace-nowrap shadow-lg max-w-[140px]">
          <p className="font-medium">{name}</p>
          {short_pitch && <p className="text-stone-300 text-[10px] mt-0.5 line-clamp-1">{short_pitch}</p>}
        </div>
        <div className="w-2 h-2 bg-stone-800 rotate-45 -mt-1" />
      </div>
    </button>
  );
}
