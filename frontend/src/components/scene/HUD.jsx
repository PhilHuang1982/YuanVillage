/**
 * HUD.jsx — 顶部状态栏
 * ✦ XP 元气 · 当前位置 | 可选"← 回村庄"按钮
 * 点击元气 pill → 展开积分记录弹窗
 */

import { useState } from 'react';

function XpLogModal({ log, onClose }) {
  return (
    <>
      {/* 遮罩 */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          zIndex: 90,
          background: 'rgba(0,0,0,0.35)',
        }}
      />
      {/* 弹窗 */}
      <div style={{
        position: 'fixed',
        top: 60, right: 20,
        zIndex: 91,
        width: 280,
        maxHeight: 360,
        background: 'var(--paper-50)',
        border: '2px solid var(--ink-900)',
        borderRadius: 12,
        boxShadow: '0 6px 0 var(--ink-900)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* 标题 */}
        <div style={{
          padding: '10px 16px',
          borderBottom: '1px solid var(--line-mid)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontFamily: 'var(--font-serif)', fontSize: 14, fontWeight: 700,
          color: 'var(--ink-900)',
        }}>
          <span><span style={{ color: 'var(--persimmon-500)' }}>✦</span> 元气记录</span>
          <button
            onClick={onClose}
            style={{ all: 'unset', cursor: 'pointer', color: 'var(--ink-500)', fontSize: 18, lineHeight: 1 }}
          >×</button>
        </div>
        {/* 列表 */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {log.length === 0 ? (
            <div style={{ padding: '20px 16px', color: 'var(--ink-500)', fontSize: 13, textAlign: 'center' }}>
              还没有积分记录
            </div>
          ) : log.map((item, i) => (
            <div key={i} style={{
              padding: '8px 16px',
              borderBottom: '1px solid var(--line-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              fontSize: 13,
            }}>
              <span style={{ color: 'var(--ink-700)', fontFamily: 'var(--font-serif)' }}>{item.label}</span>
              <span style={{
                fontFamily: 'var(--font-mono)', fontWeight: 600,
                color: item.delta > 0 ? 'var(--moss-600)' : 'var(--persimmon-500)',
              }}>
                +{item.delta}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default function HUD({ xp = 0, log = [], location, showBack = false, onBack }) {
  const [showLog, setShowLog] = useState(false);

  return (
    <>
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        zIndex: 30,
        pointerEvents: 'none',
      }}>
        {/* 回村庄按钮 */}
        {showBack && (
          <button
            onClick={onBack}
            style={{
              all: 'unset', cursor: 'pointer',
              pointerEvents: 'auto',
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 14px',
              background: 'var(--paper-50)',
              border: '2px solid var(--ink-900)',
              borderRadius: 99,
              boxShadow: '0 3px 0 var(--ink-900)',
              fontFamily: 'var(--font-serif)',
              fontSize: 14,
              color: 'var(--ink-900)',
            }}
          >← 回村庄</button>
        )}

        <div style={{ flex: 1 }} />

        {/* 元气/位置 pill — 可点击展开记录 */}
        <div
          onClick={() => setShowLog(v => !v)}
          style={{
            pointerEvents: 'auto',
            cursor: 'pointer',
            background: 'var(--paper-50)',
            border: '2px solid var(--ink-900)',
            borderRadius: 99,
            boxShadow: '0 3px 0 var(--ink-900)',
            padding: '6px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontFamily: 'var(--font-serif)',
            fontSize: 13,
            color: 'var(--ink-900)',
            userSelect: 'none',
          }}
        >
          <span style={{ color: 'var(--persimmon-500)', fontSize: 16 }}>✦</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{xp}</span>
          <span style={{ color: 'var(--ink-500)' }}>元气</span>
          {location && (
            <>
              <span style={{ color: 'var(--line-mid)', margin: '0 2px' }}>|</span>
              <span style={{ color: 'var(--ink-700)' }}>{location}</span>
            </>
          )}
        </div>
      </div>

      {/* 积分记录弹窗 */}
      {showLog && <XpLogModal log={log} onClose={() => setShowLog(false)} />}
    </>
  );
}
