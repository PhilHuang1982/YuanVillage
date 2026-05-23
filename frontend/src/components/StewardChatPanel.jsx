/**
 * components/StewardChatPanel.jsx
 * 村管家龙寻的侧滑对话面板，浮于地图上层
 *
 * props:
 *   open        — 是否展开
 *   onClose     — 关闭回调
 *   onTurn      — 每次 AI 回复（积分用）
 *   onItinerary — 收到方案（积分用）
 *   onSpaceNav  — 点击方案里的空间 → 导航到 SpaceDetail
 */

import PersonaChat from './PersonaChat.jsx';
import { STEWARD_SLUG } from '../lib/persona-routing.js';

export default function StewardChatPanel({ open, onClose, onTurn, onItinerary, onSpaceNav }) {
  return (
    <>
      {/* 遮罩 */}
      {open && (
        <div
          className="fixed inset-0 bg-black/20 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div className={`
        fixed right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl z-40
        flex flex-col transition-transform duration-300
        ${open ? 'translate-x-0' : 'translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex-none flex items-center gap-3 px-4 py-3 border-b border-stone-100">
          <div className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center text-white text-sm font-bold">
            寻
          </div>
          <div>
            <p className="text-sm font-semibold text-stone-800">村管家龙寻</p>
            <p className="text-xs text-stone-400">龙潭村 AI 导游 · 帮你规划旅居方案</p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto text-stone-400 hover:text-stone-600 text-lg"
          >
            ×
          </button>
        </div>

        {/* Chat */}
        <div className="flex-1 min-h-0">
          <PersonaChat
            slug={STEWARD_SLUG}
            compact={false}
            onTurn={onTurn}
            onItinerary={onItinerary}
            onSpaceNav={(spaceSlug) => {
              onSpaceNav?.(spaceSlug);
              onClose?.();
            }}
          />
        </div>
      </div>
    </>
  );
}
