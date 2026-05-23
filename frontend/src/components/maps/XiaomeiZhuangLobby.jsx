/**
 * XiaomeiZhuangLobby.jsx — 小梅桩玄关入口
 *
 * 进入小梅桩时先展示外部空间图，配打字机氛围文字，
 * 点击"敲门进入"后调用 onEnter() 切换到室内场景。
 */

import { useState, useEffect } from 'react';

const ENTRY_LINES = [
  '青石路走到尽头，',
  '转过廊桥，',
  '远远看见一院繁花。',
  '',
  '风过来，带着草木和泥土的香。',
  '',
  '隐隐有歌声，',
  '从院子里漂出来——',
  '不知道是录音，还是她今天心情好。',
  '',
  '你站在门口，',
  '轻轻敲了两下。',
];

const CHAR_SPEED = 18;   // ms per character
const LINE_PAUSE = 180;  // ms after each line
const BLANK_PAUSE = 100; // ms for blank lines

export default function XiaomeiZhuangLobby({ onEnter }) {
  const [doneLines, setDoneLines]   = useState([]);
  const [lineIdx, setLineIdx]       = useState(0);
  const [charIdx, setCharIdx]       = useState(0);
  const [showBtn, setShowBtn]       = useState(false);
  const [visible, setVisible]       = useState(false);

  // Fade in on mount
  useEffect(() => { const t = setTimeout(() => setVisible(true), 80); return () => clearTimeout(t); }, []);

  // Typewriter engine
  useEffect(() => {
    if (lineIdx >= ENTRY_LINES.length) {
      const t = setTimeout(() => setShowBtn(true), 700);
      return () => clearTimeout(t);
    }

    const line = ENTRY_LINES[lineIdx];

    if (charIdx >= line.length) {
      // Line complete → pause then advance
      const pause = line === '' ? BLANK_PAUSE : LINE_PAUSE;
      const t = setTimeout(() => {
        setDoneLines(prev => [...prev, line]);
        setLineIdx(prev => prev + 1);
        setCharIdx(0);
      }, pause);
      return () => clearTimeout(t);
    }

    const t = setTimeout(() => setCharIdx(prev => prev + 1), CHAR_SPEED);
    return () => clearTimeout(t);
  }, [lineIdx, charIdx]);

  // Build display: completed lines + current partial line
  const displayLines = [...doneLines];
  if (lineIdx < ENTRY_LINES.length) {
    displayLines.push(ENTRY_LINES[lineIdx].slice(0, charIdx));
  }
  const isTyping = lineIdx < ENTRY_LINES.length;

  return (
    <div
      style={{
        position: 'absolute', inset: 0,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.9s ease',
      }}
    >
      {/* 外部空间照片 — contain 保证全图可见 */}
      <img
        src="/assets/images/spaces/xiaomeizhuang/exterior.png"
        alt="小梅桩外观"
        draggable={false}
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'contain', objectPosition: 'center',
          display: 'block',
        }}
      />

      {/* 渐变遮罩 — 底部深，顶部浅，给文字留空间 */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.72) 100%)',
      }} />

      {/* 内容区 */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '0 28px',
        gap: 0,
      }}>

        {/* 打字机文字块 */}
        <div style={{
          maxWidth: 520,
          width: '100%',
          fontFamily: 'var(--font-serif, "Noto Serif SC", serif)',
          color: '#F5EFE6',
          fontSize: 'clamp(15px, 2.2vw, 19px)',
          lineHeight: 2.3,
          letterSpacing: '0.07em',
          textAlign: 'center',
          textShadow: '0 2px 12px rgba(0,0,0,0.7)',
          minHeight: '14em',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
        }}>
          {displayLines.map((line, i) => (
            <div
              key={i}
              style={{ minHeight: line === '' ? '0.9em' : undefined }}
            >
              {line}
              {/* 光标：只在当前正在打字的行末显示 */}
              {isTyping && i === displayLines.length - 1 && (
                <span style={{
                  display: 'inline-block',
                  width: 2, height: '0.95em',
                  background: '#F5EFE6',
                  verticalAlign: 'text-bottom',
                  marginLeft: 2,
                  animation: 'xmz-blink 0.75s step-end infinite',
                }} />
              )}
            </div>
          ))}
        </div>

        {/* 敲门按钮 */}
        {showBtn && (
          <button onClick={onEnter} className="enter-btn enter-btn--warm">
            <span className="enter-btn__label">敲门进入</span>
            <span className="enter-btn__arrows">
              <span style={{ animationDelay: '0ms' }}>›</span>
              <span style={{ animationDelay: '180ms' }}>›</span>
              <span style={{ animationDelay: '360ms' }}>›</span>
              <span style={{ animationDelay: '540ms' }}>›</span>
            </span>
          </button>
        )}
      </div>

      <style>{`
        @keyframes xmz-blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        @keyframes xmz-rise {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes arrow-chase {
          0%, 100% { opacity: 0.15; transform: translateX(0); }
          50%       { opacity: 1;    transform: translateX(3px); }
        }
        .enter-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 13px 36px 13px 44px;
          font-family: var(--font-serif, "Noto Serif SC", serif);
          font-size: 15px;
          letter-spacing: 0.2em;
          border-radius: 3px;
          cursor: pointer;
          user-select: none;
          animation: xmz-rise 0.55s cubic-bezier(.22,.68,0,1.2);
          transition: box-shadow 0.15s, background 0.15s;
        }
        .enter-btn--warm {
          color: #1C1410;
          background: #F5EFE6;
          border: 2px solid #1C1410;
          box-shadow: 0 5px 0 rgba(0,0,0,0.45);
        }
        .enter-btn--warm:hover {
          background: #EDE4D8;
          box-shadow: 0 5px 0 rgba(0,0,0,0.45), 0 0 16px 4px rgba(245,239,230,0.3);
        }
        .enter-btn--warm:active {
          transform: translateY(4px);
          box-shadow: 0 1px 0 rgba(0,0,0,0.45);
        }
        .enter-btn__label { position: relative; }
        .enter-btn__arrows {
          display: inline-flex;
          gap: 1px;
          font-size: 18px;
          line-height: 1;
        }
        .enter-btn__arrows span {
          display: inline-block;
          animation: arrow-chase 0.9s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
