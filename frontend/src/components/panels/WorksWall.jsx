/**
 * WorksWall.jsx — 作品收藏墙（SlideOver 内容）
 *
 * items 字段（来自 worksLoader.js）：
 *   title, medium, year, description, tags
 *   video_url  → 点击跳转外部链接（公众号/视频）
 *   image_url  → 点击内联 Lightbox 查看
 *   （两者均无 → 展开作品简介）
 */

import { useState } from 'react';
import SlideOver from './SlideOver';

const BG_PRESETS = [
  'linear-gradient(135deg, #a8c4cb, #6b97a3)',
  'linear-gradient(135deg, #84a17a, #4f7259)',
  'linear-gradient(135deg, #d6c194, #9b7651)',
  'linear-gradient(135deg, #f0b48a, #a4502f)',
  'linear-gradient(135deg, #c7d6b0, #4f7259)',
  'linear-gradient(135deg, #9eb1a9, #3d6770)',
];

/** 根据字段判断点击行为 */
function getAction(w) {
  if (w.video_url) return 'link';
  if (w.image_url) return 'image';
  return 'desc';
}

/** 媒介类型 → 图标 */
function mediumIcon(medium = '') {
  if (/电影|视频|微电影/.test(medium)) return '▶';
  if (/画|水彩|油画|插画/.test(medium)) return '🖼';
  if (/歌|音乐|歌曲/.test(medium)) return '♪';
  if (/文|书|文章/.test(medium)) return '文';
  return '作';
}

/** 图片全屏 Lightbox */
function Lightbox({ src, title, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 99,
        background: 'rgba(0,0,0,.88)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
    >
      <img
        src={src}
        alt={title}
        draggable={false}
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '90vw', maxHeight: '80vh',
          borderRadius: 8,
          boxShadow: '0 8px 40px rgba(0,0,0,.6)',
          objectFit: 'contain',
        }}
      />
      {title && (
        <p style={{
          marginTop: 14, fontFamily: 'var(--font-serif)',
          color: 'var(--paper-200)', fontSize: 15,
        }}>{title}</p>
      )}
      <button
        onClick={onClose}
        style={{
          all: 'unset', cursor: 'pointer',
          position: 'fixed', top: 20, right: 20,
          width: 36, height: 36, borderRadius: 99,
          background: 'var(--paper-50)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, color: 'var(--ink-900)',
          boxShadow: '0 3px 0 rgba(0,0,0,.3)',
        }}
      >×</button>
    </div>
  );
}

/** 作品简介弹窗 */
function DescModal({ work, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 99,
        background: 'rgba(0,0,0,.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(480px, 90vw)',
          background: 'var(--paper-50)',
          border: '2px solid var(--ink-900)',
          borderRadius: 12,
          boxShadow: '0 6px 0 var(--ink-900)',
          overflow: 'hidden',
        }}
      >
        <div style={{
          padding: '12px 16px',
          borderBottom: '1.5px solid var(--line-mid)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: 16, color: 'var(--ink-900)' }}>
              {work.title}
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 2 }}>
              {[work.medium, work.year].filter(Boolean).join(' · ')}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ all: 'unset', cursor: 'pointer', fontSize: 20, color: 'var(--ink-500)', lineHeight: 1 }}
          >×</button>
        </div>
        <div style={{ padding: '14px 16px', maxHeight: '60vh', overflowY: 'auto' }}>
          <p style={{
            margin: 0, fontFamily: 'var(--font-serif)', fontSize: 14,
            lineHeight: 1.8, color: 'var(--ink-700)', whiteSpace: 'pre-wrap',
          }}>
            {work.description || '暂无介绍。'}
          </p>
          {work.tags?.length > 0 && (
            <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {work.tags.map((t, i) => (
                <span key={i} style={{
                  fontSize: 11, fontFamily: 'var(--font-mono)',
                  background: 'var(--paper-200)', border: '1px solid var(--line-mid)',
                  borderRadius: 4, padding: '1px 8px', color: 'var(--ink-600)',
                }}>{t}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** 单张作品卡 */
function WorkCard({ w, index, onCardClick }) {
  const action = getAction(w);
  const icon = mediumIcon(w.medium);

  const handleClick = (e) => {
    e.stopPropagation();
    if (action === 'link') {
      window.open(w.video_url, '_blank', 'noopener,noreferrer');
    } else {
      onCardClick(w, action);
    }
  };

  return (
    <div
      onClick={handleClick}
      style={{
        background: 'var(--paper-50)',
        border: '2px solid var(--ink-900)',
        borderRadius: 8,
        boxShadow: `${index % 2 === 0 ? '-' : ''}2px 4px 0 var(--ink-900)`,
        transform: `rotate(${index % 2 === 0 ? -1.5 : 1.5}deg)`,
        padding: 10,
        cursor: 'pointer',
        transition: 'transform .2s ease, box-shadow .15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'rotate(0deg) scale(1.04)';
        e.currentTarget.style.boxShadow = '0 6px 0 var(--ink-900)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = `rotate(${index % 2 === 0 ? -1.5 : 1.5}deg) scale(1)`;
        e.currentTarget.style.boxShadow = `${index % 2 === 0 ? '-' : ''}2px 4px 0 var(--ink-900)`;
      }}
    >
      {/* 封面 */}
      <div style={{
        aspectRatio: '4/3',
        background: w.bg || BG_PRESETS[index % BG_PRESETS.length],
        border: '1.5px solid var(--ink-900)',
        borderRadius: 4,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 8,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* 封面图（有 image_url 时显示） */}
        {w.image_url && (
          <img
            src={w.image_url}
            alt={w.title}
            draggable={false}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}

        {/* 类型图标 */}
        <span style={{
          fontFamily: 'var(--font-serif)', fontSize: 34,
          color: 'var(--paper-50)', opacity: w.image_url ? 0 : .55,
          position: 'relative', zIndex: 1,
        }}>{icon}</span>

        {/* 媒介标签 */}
        <div style={{
          position: 'absolute', top: 6, right: 6,
          fontFamily: 'var(--font-mono)', fontSize: 9,
          background: 'rgba(27,22,18,.75)', color: 'var(--paper-50)',
          padding: '1px 6px', borderRadius: 2, zIndex: 2,
        }}>{w.medium || w.type}</div>

        {/* 操作提示覆盖 */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 3,
          background: 'rgba(0,0,0,.0)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background .2s',
        }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,.28)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,.0)'; }}
        >
          <span style={{
            fontSize: action === 'link' ? 28 : 22,
            color: '#fff',
            textShadow: '0 2px 8px rgba(0,0,0,.6)',
            opacity: 0,
            transition: 'opacity .2s',
          }}
            ref={(el) => {
              if (!el) return;
              const parent = el.parentElement;
              parent.onmouseenter = () => { el.style.opacity = '1'; parent.style.background = 'rgba(0,0,0,.28)'; };
              parent.onmouseleave = () => { el.style.opacity = '0'; parent.style.background = 'rgba(0,0,0,0)'; };
            }}
          >
            {action === 'link' ? '▶' : action === 'image' ? '⊕' : '↗'}
          </span>
        </div>
      </div>

      {/* 标题 */}
      <p style={{
        margin: 0, fontFamily: 'var(--font-serif)', fontSize: 13, fontWeight: 600,
        color: 'var(--ink-900)', lineHeight: 1.4,
      }}>{w.title}</p>
      <p style={{
        margin: '2px 0 0', fontSize: 11, color: 'var(--ink-500)',
        fontFamily: 'var(--font-mono)',
      }}>{w.year}</p>

      {/* 点击提示 */}
      <p style={{
        margin: '4px 0 0', fontSize: 10, color: 'var(--persimmon-500)',
        fontFamily: 'var(--font-serif)',
      }}>
        {action === 'link' ? '点击观看 →' : action === 'image' ? '点击查看图片 →' : '点击查看介绍 →'}
      </p>
    </div>
  );
}

export default function WorksWall({ open, onClose, items = [] }) {
  const [lightbox, setLightbox] = useState(null);   // { src, title }
  const [descWork, setDescWork] = useState(null);    // work object

  function handleCardClick(w, action) {
    if (action === 'image') setLightbox({ src: w.image_url, title: w.title });
    else if (action === 'desc') setDescWork(w);
  }

  return (
    <>
      <SlideOver title="作品收藏" icon="作" open={open} onClose={onClose} accent="var(--moss-600)">
        {items.length === 0 ? (
          <p style={{ color: 'var(--ink-500)', fontSize: 13, padding: 12 }}>暂无作品展示。</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {items.map((w, i) => (
              <WorkCard key={i} w={w} index={i} onCardClick={handleCardClick} />
            ))}
          </div>
        )}
      </SlideOver>

      {/* 图片 Lightbox */}
      {lightbox && (
        <Lightbox src={lightbox.src} title={lightbox.title} onClose={() => setLightbox(null)} />
      )}

      {/* 作品简介弹窗 */}
      {descWork && (
        <DescModal work={descWork} onClose={() => setDescWork(null)} />
      )}
    </>
  );
}
