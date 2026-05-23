/**
 * components/ItineraryCard.jsx
 * 渲染龙寻 propose_itinerary 工具返回的方案卡片
 *
 * props:
 *   data — toolResult.data（来自 chatWithPersona 返回）
 *   onSpaceClick — 点击推荐空间时的回调(spaceSlug)
 */

export default function ItineraryCard({ data, onSpaceClick }) {
  if (!data) return null;
  const { guest_profile, recommended_spaces, recommended_persons, itinerary_outline, recommended_offerings } = data;

  return (
    <div className="mt-3 bg-gradient-to-br from-amber-50 to-stone-50 border border-amber-200 rounded-2xl p-4 text-sm text-stone-700 space-y-3">
      {/* 标题 */}
      <div className="flex items-center gap-2">
        <span className="text-lg">🗺️</span>
        <p className="font-semibold text-amber-800">龙潭定制方案</p>
        {guest_profile?.type && (
          <span className="ml-auto text-xs bg-amber-100 text-amber-700 rounded-full px-2 py-0.5">
            {guest_profile.type}
          </span>
        )}
      </div>

      {/* 访客需求 */}
      {guest_profile?.key_needs?.length > 0 && (
        <div>
          <p className="text-xs text-stone-400 mb-1">核心需求</p>
          <div className="flex flex-wrap gap-1">
            {guest_profile.key_needs.map((need, i) => (
              <span key={i} className="text-xs bg-white border border-stone-200 rounded-full px-2 py-0.5">{need}</span>
            ))}
          </div>
        </div>
      )}

      {/* 方案大纲 */}
      {itinerary_outline && (
        <div>
          <p className="text-xs text-stone-400 mb-1">方案概要</p>
          <p className="text-sm leading-relaxed">{itinerary_outline}</p>
        </div>
      )}

      {/* 推荐空间 */}
      {recommended_spaces?.length > 0 && (
        <div>
          <p className="text-xs text-stone-400 mb-2">推荐空间</p>
          <div className="space-y-1.5">
            {recommended_spaces.map((s, i) => (
              <button
                key={i}
                onClick={() => onSpaceClick?.(s.space_slug)}
                className="w-full flex items-start gap-2 bg-white rounded-xl p-2.5 border border-stone-100 hover:border-amber-200 hover:bg-amber-50 transition-colors text-left"
              >
                <span className="text-amber-500 mt-0.5">▪</span>
                <div>
                  <p className="font-medium text-sm">{s.space_name}</p>
                  <p className="text-xs text-stone-500 mt-0.5">{s.reason}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 推荐主理人 */}
      {recommended_persons?.length > 0 && (
        <div>
          <p className="text-xs text-stone-400 mb-1">推荐连接</p>
          <div className="flex flex-wrap gap-1.5">
            {recommended_persons.map((p, i) => (
              <span key={i} className="text-xs bg-stone-100 rounded-full px-2.5 py-1">
                {p.person_name} · {p.connect_reason}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 推荐活动/体验 */}
      {recommended_offerings?.length > 0 && (
        <div>
          <p className="text-xs text-stone-400 mb-1">可体验</p>
          <ul className="text-xs space-y-0.5">
            {recommended_offerings.map((o, i) => (
              <li key={i} className="flex gap-1.5"><span className="text-amber-400">·</span>{o}</li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-[10px] text-stone-300 text-right">由村管家龙寻生成</p>
    </div>
  );
}
