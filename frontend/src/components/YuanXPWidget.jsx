/**
 * components/YuanXPWidget.jsx
 * 元XP 积分悬浮 widget，固定在页面右下角
 */

import { useState } from 'react';
import { useYuanXP } from '../lib/yuanxp.js';

export default function YuanXPWidget() {
  const { xp, log } = useYuanXP();
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {/* Log popover */}
      {open && log.length > 0 && (
        <div className="bg-white border border-stone-100 rounded-2xl shadow-lg p-3 w-52 text-xs">
          <p className="font-semibold text-stone-500 mb-2">积分记录</p>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {log.map((entry, i) => (
              <div key={i} className="flex justify-between text-stone-600">
                <span className="truncate">{entry.label}</span>
                <span className="font-mono text-amber-600 ml-2">+{entry.delta}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Badge */}
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 bg-stone-800 text-white rounded-full px-3 py-1.5 text-xs font-medium shadow-md hover:bg-stone-700 transition-colors"
      >
        <span className="text-amber-400">✦</span>
        <span className="font-mono">{xp}</span>
        <span className="text-stone-300">元XP</span>
      </button>
    </div>
  );
}
