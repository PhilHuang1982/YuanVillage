/**
 * DaoLongtanLobby.jsx — 138数字游民基地玄关入口
 *
 * 进入基地时先展示外部空间图，配打字机氛围文字，
 * 点击"推门进入"后调用 onEnter() 切换到室内场景。
 */

import { useState, useEffect } from 'react';

const ENTRY_LINES = [
  '还没走近，就听见了说话声——',
  '几个年轻人在廊道里讨论什么，',
  '偶尔爆发出一阵笑声。',
  '',
  '村里的老李说：',
  '「去年那批游民来了，',
  '还帮我们做了个小程序。」',
  '',
  '也不知道今天里面',
  '又聚了哪里来的人，',
  '在聊什么新鲜的事。',
];

const CHAR_SPEED = 18;
const LINE_PAUSE = 180;
const BLANK_PAUSE = 100;

export default function DaoLongtanLobby({ onEnter }) {
  const [doneLines, setDoneLines] = useState([]);
  const [lineIdx, setLineIdx]     = useState(0);
  const [charIdx, setCharIdx]     = useState(0);
  const [showBtn, setShowBtn]     = useState(false);
  const [visible, setVisible]     = useState(false);

  useEffect(() => { const t = setTimeout(() => setVisible(true), 80); return () => clearTimeout(t); }, []);

  useEffect(() => {
    if (lineIdx >= ENTRY_LINES.length) {
      const t = setTimeout(() => setShowBtn(true), 700);
      return () => clearTimeout(t);
    }

    const line = ENTRY_LINES[lineIdx];

    if (charIdx >= line.length) {
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

  const displayLines = [...doneLines];
  if (lineIdx < ENTRY_LINES.length) {
    displayLines.push(ENTRY_LINES[lineIdx].slice(0, charIdx));
  }
  const isTyping = lineIdx < ENTRY_LINES.length;

  return (
    <div style={{
      position: 'absolute', inset: 0,
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.9s ease',
      background: '#0d1520',
    }}>
      {/* 外部空间照片 */}
      <img
        src="/assets/images/spaces/dao-longtan/exterior.jpg"
        alt="138数字游民基地外部"
        draggable={false}
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'contain', objectPosition: 'center',
          display: 'block',
        }}
      />

      {/* 渐变遮罩 */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, rgba(13,21,32,0.1) 0%, rgba(13,21,32,0.5) 55%, rgba(13,21,32,0.75) 100%)',
      }} />

      {/* 内容区 */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '0 28px',
      }}>
        {/* 打字机文字 */}
        <div style={{
          maxWidth: 520,
          width: '100%',
          fontFamily: 'var(--font-serif, "Noto Serif SC", serif)',
          color: '#E8F0F8',
          fontSize: 'clamp(14px, 2vw, 18px)',
          lineHeight: 2.3,
          letterSpacing: '0.06em',
          textAlign: 'center',
          textShadow: '0 2px 12px rgba(0,0,0,0.8)',
          minHeight: '14em',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
        }}>
          {displayLines.map((line, i) => (
            <div key={i} style={{ minHeight: line === '' ? '0.9em' : undefined }}>
              {line}
              {isTyping && i === displayLines.length - 1 && (
                <span style={{
                  display: 'inline-block',
                  width: 2, height: '0.9em',
                  background: '#E8F0F8',
                  verticalAlign: 'text-bottom',
                  marginLeft: 2,
                  animation: 'dlt-blink 0.75s step-end infinite',
                }} />
              )}
            </div>
          ))}
        </div>

        {/* 推门按钮 */}
        {showBtn && (
          <button onClick={onEnter} className="enter-btn enter-btn--cool">
            <span className="enter-btn__label">推门进入</span>
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
        @keyframes dlt-blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        @keyframes dlt-rise {
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
          animation: dlt-rise 0.55s cubic-bezier(.22,.68,0,1.2);
          transition: box-shadow 0.15s, background 0.15s;
        }
        .enter-btn--cool {
          color: #0d1520;
          background: #E8F0F8;
          border: 2px solid #0d1520;
          box-shadow: 0 5px 0 rgba(0,0,0,0.5);
        }
        .enter-btn--cool:hover {
          background: #d0dde8;
          box-shadow: 0 5px 0 rgba(0,0,0,0.5), 0 0 16px 4px rgba(232,240,248,0.25);
        }
        .enter-btn--cool:active {
          transform: translateY(4px);
          box-shadow: 0 1px 0 rgba(0,0,0,0.5);
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
