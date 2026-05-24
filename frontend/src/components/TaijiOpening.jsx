/**
 * components/TaijiOpening.jsx
 * 太极开场动画 — 进入地图前的全屏过场
 *
 * props:
 *   onDone — 点击进入后回调
 */

import { useEffect, useState } from 'react';

const ENTRY_LINES = [
  '2050年，你经历了AI浪潮的全貌。',
  '带着那个时代的记忆，你穿越回二十年前——',
  '回到龙潭村。',
  '这里山水如旧，人心未变。',
  '你的使命：',
  '在这里种下一粒种子——',
  '城与乡融合，人与AI共生的元乡村。',
];

const CHAR_SPEED = 18;
const LINE_PAUSE = 120;
const BLANK_PAUSE = 60;

export default function TaijiOpening({ onDone }) {
  const [taijiFaded, setTaijiFaded] = useState(false);
  const [doneLines, setDoneLines]   = useState([]);
  const [lineIdx, setLineIdx]       = useState(-1);
  const [charIdx, setCharIdx]       = useState(0);
  const [showBtn, setShowBtn]       = useState(false);
  const [exiting, setExiting]       = useState(false);

  // 太极进场
  useEffect(() => {
    const t = setTimeout(() => {
      setTaijiFaded(true);
      setTimeout(() => setLineIdx(0), 400);
    }, 900);
    return () => clearTimeout(t);
  }, []);

  // 打字机引擎
  useEffect(() => {
    if (lineIdx < 0) return;
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
  if (lineIdx >= 0 && lineIdx < ENTRY_LINES.length) {
    displayLines.push(ENTRY_LINES[lineIdx].slice(0, charIdx));
  }
  const isTyping = lineIdx >= 0 && lineIdx < ENTRY_LINES.length;

  function handleEnter() {
    setExiting(true);
    setTimeout(() => onDone?.(), 700);
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: '#0c0a09',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      opacity: exiting ? 0 : 1,
      transition: 'opacity 0.7s ease',
      pointerEvents: exiting ? 'none' : 'auto',
      padding: '0 24px',
    }}>

      {/* 太极 + 标题 */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        opacity: taijiFaded ? 1 : 0,
        transform: taijiFaded ? 'scale(1)' : 'scale(0.85)',
        transition: 'opacity 0.7s ease, transform 0.7s ease',
      }}>
        <img
          src="/assets/images/taiji.png"
          alt="太极"
          width="240" height="240"
          draggable={false}
          style={{ display: 'block', animation: 'taiji-spin 12s linear infinite' }}
        />
        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <p style={{
            color: '#e7e5e4', fontSize: 22,
            fontFamily: 'var(--font-serif, "Noto Serif SC", serif)',
            letterSpacing: '0.25em', fontWeight: 400, margin: 0,
          }}>元家乡 2050</p>
          <p style={{ color: '#78716c', fontSize: 11, letterSpacing: '0.15em', marginTop: 6 }}>
            龙潭村数字旅居平台
          </p>
        </div>
      </div>

      {/* 打字机故事文字 */}
      <div style={{
        marginTop: 40, maxWidth: 480, width: '100%',
        fontFamily: 'var(--font-serif, "Noto Serif SC", serif)',
        fontSize: 17, lineHeight: 2.2, letterSpacing: '0.08em',
        color: '#c8c4be', textAlign: 'center',
        minHeight: '9em', display: 'flex', flexDirection: 'column', justifyContent: 'center',
      }}>
        {displayLines.map((line, i) => {
          const isLast = i === displayLines.length - 1;
          const bright = i >= 5;
          return (
            <div key={i} style={{
              minHeight: line === '' ? '0.8em' : undefined,
              color: bright ? '#e7e5e4' : '#c8c4be',
              fontWeight: bright ? 500 : 400,
            }}>
              {line}
              {isTyping && isLast && (
                <span style={{
                  display: 'inline-block', width: 2, height: '0.9em',
                  background: '#c8c4be', verticalAlign: 'text-bottom',
                  marginLeft: 2, animation: 'taiji-blink 0.75s step-end infinite',
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* 进入按钮 */}
      <div style={{
        marginTop: 44,
        opacity: showBtn ? 1 : 0,
        transform: showBtn ? 'translateY(0)' : 'translateY(16px)',
        transition: 'opacity 0.6s ease, transform 0.6s ease',
        pointerEvents: showBtn ? 'auto' : 'none',
      }}>
        <button onClick={handleEnter} className="enter-btn enter-btn--dark">
          <span className="enter-btn__label">踏入元乡村</span>
          <span className="enter-btn__arrows">
            <span style={{ animationDelay: '0ms' }}>›</span>
            <span style={{ animationDelay: '180ms' }}>›</span>
            <span style={{ animationDelay: '360ms' }}>›</span>
            <span style={{ animationDelay: '540ms' }}>›</span>
          </span>
        </button>
      </div>

      <style>{`
        @keyframes taiji-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(-360deg); }
        }
        @keyframes taiji-blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
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
          transition: box-shadow 0.15s, background 0.15s;
        }
        .enter-btn--dark {
          color: #0c0a09;
          background: #e7e5e4;
          border: 2px solid #a8a29e;
          box-shadow: 0 5px 0 rgba(0,0,0,0.55);
        }
        .enter-btn--dark:hover {
          background: #d6d3d1;
          box-shadow: 0 5px 0 rgba(0,0,0,0.55), 0 0 18px 4px rgba(231,229,228,0.18);
        }
        .enter-btn--dark:active {
          transform: translateY(4px);
          box-shadow: 0 1px 0 rgba(0,0,0,0.55);
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
