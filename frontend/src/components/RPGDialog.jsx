/**
 * RPGDialog.jsx — RPG 风格对话框
 * 头像 + 名牌 + 打字机文字 + 编号选项 + 自由输入
 */

import { useState, useEffect, useRef } from 'react';
import { CharPortrait } from './characters/CharPortrait';

/* ---------- 打字机 Hook ---------- */
function useTypewriter(text, speedMs = 28, enabled = true) {
  const [shown, setShown] = useState('');
  const [done, setDone] = useState(false);
  const skipRef = useRef(false);

  useEffect(() => {
    setShown('');
    setDone(false);
    skipRef.current = false;
    if (!text) { setDone(true); return; }
    if (!enabled) { setShown(text); setDone(true); return; }

    let i = 0;
    let timer;
    const tick = () => {
      if (skipRef.current) { setShown(text); setDone(true); return; }
      i++;
      setShown(text.slice(0, i));
      if (i >= text.length) { setDone(true); return; }
      timer = setTimeout(tick, speedMs);
    };
    timer = setTimeout(tick, speedMs);
    return () => clearTimeout(timer);
  }, [text, speedMs, enabled]);

  const skip = () => { skipRef.current = true; };
  return { shown, done, skip };
}

/* ---------- 媒体卡片（图片 / 视频链接）---------- */
function MediaCard({ item }) {
  if (!item) return null;

  if (item.type === 'image') {
    return (
      <div style={{ marginTop: 10, borderRadius: 8, overflow: 'hidden', border: '1.5px solid var(--line-mid)' }}>
        <img
          src={item.url}
          alt={item.title || '作品图片'}
          draggable={false}
          style={{ display: 'block', width: '100%', maxHeight: 240, objectFit: 'contain', background: 'var(--paper-100)' }}
        />
        {item.title && (
          <div style={{ padding: '4px 10px', fontFamily: 'var(--font-serif)', fontSize: 12, color: 'var(--ink-500)' }}>
            {item.title}{item.year ? ` · ${item.year}` : ''}
          </div>
        )}
      </div>
    );
  }

  if (item.type === 'video') {
    return (
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          marginTop: 10, padding: '8px 12px',
          background: 'var(--ink-900)', borderRadius: 8,
          border: '1.5px solid var(--ink-900)',
          boxShadow: '0 3px 0 rgba(0,0,0,.3)',
          textDecoration: 'none', cursor: 'pointer',
        }}
      >
        <span style={{
          width: 32, height: 32, borderRadius: 99,
          background: 'var(--persimmon-500)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, flexShrink: 0, color: '#fff',
        }}>▶</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 14, color: 'var(--paper-50)', fontWeight: 600 }}>
            {item.title}
          </div>
          {(item.desc || item.year) && (
            <div style={{ fontSize: 12, color: 'var(--paper-300)', marginTop: 2 }}>
              {[item.desc, item.year].filter(Boolean).join(' · ')}
            </div>
          )}
        </div>
        <span style={{ color: 'var(--paper-400)', fontSize: 18, flexShrink: 0 }}>→</span>
      </a>
    );
  }

  return null;
}

function MediaGroup({ media }) {
  if (!media) return null;
  const list = Array.isArray(media) ? media : [media];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {list.map((item, i) => <MediaCard key={i} item={item} />)}
    </div>
  );
}

/* ---------- 旅居方案全屏弹窗 ---------- */
function ItineraryModal({ data, onClose, onNavigate }) {
  if (!data) return null;
  const { guest_profile, recommended_spaces, recommended_persons, itinerary_outline, not_recommended } = data;

  const sectionStyle = {
    paddingBottom: 20, marginBottom: 20,
    borderBottom: '1px solid var(--line-mid)',
  };
  const labelStyle = {
    fontSize: 10, fontFamily: 'var(--font-mono)',
    color: 'var(--ink-400)', letterSpacing: '0.12em',
    marginBottom: 8, display: 'block',
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 80,
        background: 'rgba(27,22,18,.55)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        padding: '0 0 24px 0',
      }}
    >
      {/* 弹窗主体 */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 680,
          maxHeight: '88vh',
          background: 'var(--paper-50)',
          border: '2.5px solid var(--ink-900)',
          borderBottom: 'none',
          borderRadius: '18px 18px 0 0',
          boxShadow: '0 -6px 32px rgba(27,22,18,.25)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* 顶部标题栏 */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px 12px',
          borderBottom: '1.5px solid var(--line-mid)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 700,
              color: 'var(--ink-900)',
            }}>旅居方案</span>
            {guest_profile?.type && (
              <span style={{
                fontSize: 11, fontFamily: 'var(--font-serif)', fontWeight: 700,
                color: 'var(--paper-50)', background: 'var(--moss-600)',
                padding: '2px 10px', borderRadius: 99,
              }}>{guest_profile.type}</span>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              all: 'unset', cursor: 'pointer',
              width: 28, height: 28, borderRadius: 99,
              background: 'var(--ink-900)', color: 'var(--paper-50)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, flexShrink: 0,
            }}
          >×</button>
        </div>

        {/* 可滚动内容区 */}
        <div style={{
          overflowY: 'auto', flex: 1,
          padding: '20px 20px 32px',
          fontSize: 13,
        }}>
          {/* 访客画像 */}
          {guest_profile?.key_needs?.length > 0 && (
            <div style={sectionStyle}>
              <span style={labelStyle}>访客画像 · 核心需求</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {guest_profile.key_needs.map((n, i) => (
                  <span key={i} style={{
                    fontSize: 12, color: 'var(--ink-700)',
                    background: 'var(--paper-200)', padding: '3px 10px', borderRadius: 99,
                    border: '1px solid var(--line-mid)',
                  }}>{n}</span>
                ))}
              </div>
            </div>
          )}

          {/* 旅居方案大纲 */}
          {itinerary_outline && (
            <div style={sectionStyle}>
              <span style={labelStyle}>旅居方案大纲</span>
              <p style={{
                margin: 0, lineHeight: 1.85, color: 'var(--ink-800)',
                whiteSpace: 'pre-wrap', fontFamily: 'var(--font-serif)', fontSize: 14,
              }}>{itinerary_outline}</p>
            </div>
          )}

          {/* 推荐空间 */}
          {recommended_spaces?.length > 0 && (
            <div style={sectionStyle}>
              <span style={labelStyle}>推荐空间</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {recommended_spaces.map((s, i) => {
                  const canNav = onNavigate && s.space_slug;
                  return (
                    <div
                      key={i}
                      onClick={canNav ? () => { onClose(); onNavigate(`/space/${s.space_slug}`); } : undefined}
                      style={{
                        display: 'flex', gap: 10, alignItems: 'flex-start',
                        padding: '10px 12px',
                        background: 'var(--paper-100)',
                        border: '1.5px solid var(--line-mid)',
                        borderLeft: '4px solid var(--persimmon-500)',
                        borderRadius: 8,
                        cursor: canNav ? 'pointer' : 'default',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={canNav ? (e) => e.currentTarget.style.background = 'var(--paper-200)' : undefined}
                      onMouseLeave={canNav ? (e) => e.currentTarget.style.background = 'var(--paper-100)' : undefined}
                    >
                      <span style={{
                        fontSize: 10, fontFamily: 'var(--font-mono)',
                        color: 'var(--paper-50)', background: 'var(--persimmon-500)',
                        borderRadius: 99, width: 20, height: 20, flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1,
                      }}>{i + 1}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, color: 'var(--ink-900)', fontSize: 14 }}>
                            {s.space_name}
                          </span>
                          {canNav && (
                            <span style={{ fontSize: 11, color: 'var(--persimmon-500)', fontFamily: 'var(--font-mono)' }}>进入 →</span>
                          )}
                        </div>
                        {s.reason && (
                          <div style={{ fontSize: 12, color: 'var(--ink-600)', marginTop: 4, lineHeight: 1.6 }}>
                            {s.reason}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 推荐主理人 */}
          {recommended_persons?.length > 0 && (
            <div style={sectionStyle}>
              <span style={labelStyle}>推荐主理人</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {recommended_persons.map((p, i) => {
                  const spaceSlug = p.person_space_slug || p.person_slug;
                  const canNav = onNavigate && spaceSlug;
                  return (
                    <div
                      key={i}
                      onClick={canNav ? () => { onClose(); onNavigate(`/space/${spaceSlug}`); } : undefined}
                      style={{
                        display: 'flex', gap: 10, alignItems: 'flex-start',
                        padding: '10px 12px',
                        background: 'var(--paper-100)',
                        border: '1.5px solid var(--line-mid)',
                        borderLeft: '4px solid var(--moss-600)',
                        borderRadius: 8,
                        cursor: canNav ? 'pointer' : 'default',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={canNav ? (e) => e.currentTarget.style.background = 'var(--paper-200)' : undefined}
                      onMouseLeave={canNav ? (e) => e.currentTarget.style.background = 'var(--paper-100)' : undefined}
                    >
                      <span style={{
                        fontSize: 10, fontFamily: 'var(--font-serif)',
                        color: 'var(--paper-50)', background: 'var(--moss-600)',
                        borderRadius: 99, width: 20, height: 20, flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1,
                      }}>人</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, color: 'var(--ink-900)', fontSize: 14 }}>
                            {p.person_name}
                          </span>
                          {canNav && (
                            <span style={{ fontSize: 11, color: 'var(--moss-600)', fontFamily: 'var(--font-mono)' }}>对话 →</span>
                          )}
                        </div>
                        {p.connect_reason && (
                          <div style={{ fontSize: 12, color: 'var(--ink-600)', marginTop: 4, lineHeight: 1.6 }}>
                            {p.connect_reason}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 不推荐 */}
          {not_recommended?.length > 0 && (
            <div style={{ ...sectionStyle, borderBottom: 'none', marginBottom: 0 }}>
              <span style={{ ...labelStyle, color: 'var(--ink-300)' }}>诚实说明 · 不太适合你的</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {not_recommended.map((n, i) => (
                  <span key={i} style={{ fontSize: 12, color: 'var(--ink-400)', display: 'flex', gap: 8 }}>
                    <span style={{ flexShrink: 0 }}>—</span><span>{n}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- 旅居方案封面卡片（对话框内）---------- */
function ItineraryCard({ data, onNavigate }) {
  const [open, setOpen] = useState(false);
  if (!data) return null;
  const { guest_profile, recommended_spaces, itinerary_outline } = data;

  // 截取方案大纲前两行作为预览
  const preview = itinerary_outline
    ? itinerary_outline.split('\n').filter(Boolean).slice(0, 2).join('\n')
    : '';

  return (
    <>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(true); }}
        style={{
          all: 'unset', display: 'block', width: '100%',
          marginTop: 10, cursor: 'pointer',
          border: '2px solid var(--ink-900)',
          borderRadius: 10,
          overflow: 'hidden',
          boxShadow: '0 3px 0 var(--ink-900)',
          background: 'var(--paper-50)',
        }}
      >
        {/* 封面头部 */}
        <div style={{
          background: 'var(--moss-600)',
          padding: '10px 14px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              fontFamily: 'var(--font-serif)', fontSize: 13, fontWeight: 700,
              color: 'var(--paper-50)',
            }}>旅居方案</span>
            {guest_profile?.type && (
              <span style={{
                fontSize: 10, color: 'var(--moss-600)',
                background: 'var(--paper-50)',
                padding: '1px 8px', borderRadius: 99,
                fontFamily: 'var(--font-serif)', fontWeight: 700,
              }}>{guest_profile.type}</span>
            )}
          </div>
          <span style={{ color: 'rgba(255,255,255,.7)', fontSize: 12 }}>点击查看 →</span>
        </div>

        {/* 封面内容预览 */}
        <div style={{ padding: '10px 14px' }}>
          {/* 空间数量提示 */}
          <div style={{ fontSize: 11, color: 'var(--ink-400)', fontFamily: 'var(--font-mono)' }}>
            {recommended_spaces?.length > 0 ? `推荐 ${recommended_spaces.length} 个空间` : '已为你定制旅居计划'}
          </div>
        </div>
      </button>

      {open && <ItineraryModal data={data} onClose={() => setOpen(false)} onNavigate={onNavigate} />}
    </>
  );
}

/* ---------- [c-NNN] 引用渲染 ---------- */
/* 已知图片库（与 xiaomei.json x_xianjian_gallery 同步）*/
const GALLERY = {
  'xmz-1': { url: '/assets/images/spaces/xiaomeizhuang/xmz-1.jpg', caption: '小梅桩花园（傍晚）' },
  'xmz-2': { url: '/assets/images/spaces/xiaomeizhuang/xmz-2.jpg', caption: '小梅桩客厅' },
  'xmz-3': { url: '/assets/images/spaces/xiaomeizhuang/xmz-3.jpg', caption: '小梅桩入口' },
};

/**
 * 从原始文本中剥离图片标签，返回纯净文本 + 图片 ID 列表
 * 打字机只渲染纯净文本，图片在打字完成后单独展示
 */
function extractImages(rawText) {
  if (!rawText) return { cleanText: '', imageIds: [] };
  const imageIds = [];
  const cleanText = rawText
    .replace(/\[图:([^\]]+)\]/g, (_, id) => { imageIds.push(id.trim()); return ''; })
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return { cleanText, imageIds };
}

/** 打字机文本内的引用标签渲染（仅处理 [c-NNN]，不再处理图片）*/
function renderWithCitations(text) {
  if (!text) return null;
  const parts = text.split(/(\[c-\d+\])/g);
  return parts.map((part, i) => {
    if (/^\[c-\d+\]$/.test(part)) {
      return (
        <span key={i} style={{
          display: 'inline-block',
          background: 'rgba(217,119,87,.15)',
          color: 'var(--persimmon-700)',
          border: '1px solid rgba(217,119,87,.4)',
          borderRadius: 4,
          padding: '0 5px',
          fontSize: 11,
          fontFamily: 'var(--font-mono)',
          verticalAlign: 'middle',
          margin: '0 2px',
          lineHeight: '1.6',
        }}>{part}</span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

/** 图片展示区（打字完成后渲染，在文字区下方独立 div）*/
function PhotoStrip({ imageIds }) {
  if (!imageIds || imageIds.length === 0) return null;
  const entries = imageIds.map(id => GALLERY[id]).filter(Boolean);
  if (entries.length === 0) return null;

  const isSingle = entries.length === 1;
  return (
    <div style={{
      display: 'flex', gap: 8, marginTop: 8,
      flexDirection: isSingle ? 'column' : 'row',
    }}>
      {entries.map((entry, i) => (
        <div key={i} style={{
          flex: 1,
          borderRadius: 10,
          overflow: 'hidden',
          border: '1.5px solid var(--line-mid)',
          boxShadow: '0 2px 8px rgba(27,22,18,.18)',
          background: 'var(--paper-100)',
        }}>
          <div style={{ width: '100%', aspectRatio: '1 / 1', overflow: 'hidden' }}>
            <img
              src={entry.url}
              alt={entry.caption}
              draggable={false}
              style={{
                display: 'block',
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
              }}
            />
          </div>
          <div style={{
            padding: '4px 8px 5px',
            fontSize: 11, color: 'var(--ink-400)',
            fontFamily: 'var(--font-serif)',
          }}>{entry.caption}</div>
        </div>
      ))}
    </div>
  );
}

/* ---------- 名牌 ---------- */
function NamePlate({ name, sub, accent = '#d97757' }) {
  return (
    <div style={{
      position: 'absolute', left: 24, top: -38,
      background: 'var(--ink-900)',
      color: 'var(--paper-50)',
      padding: '8px 18px 8px 14px',
      borderRadius: '4px 4px 4px 4px',
      fontFamily: 'var(--font-serif)',
      fontSize: 17, letterSpacing: '0.06em',
      boxShadow: '0 4px 0 rgba(0,0,0,.25)',
      display: 'flex', alignItems: 'baseline', gap: 10,
      userSelect: 'none',
      zIndex: 2,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: 99, background: accent, display: 'inline-block', flexShrink: 0 }} />
      <span style={{ fontWeight: 600 }}>{name}</span>
      {sub && <span style={{ color: 'var(--paper-300)', fontSize: 11, letterSpacing: '0.15em' }}>{sub}</span>}
    </div>
  );
}

/* ---------- 选项按钮 ---------- */
function ChoiceButton({ label, hint, onClick, index, disabled }) {
  return (
    <button type="button" className="rpg-choice no-select" onClick={onClick} disabled={disabled}>
      <span className="rpg-choice-num">{index + 1}</span>
      <span className="rpg-choice-label">{label}</span>
      {hint && <span className="rpg-choice-hint">{hint}</span>}
    </button>
  );
}

/* ---------- 自由输入条 ---------- */
function FreeformInput({ onSend, busy }) {
  const [v, setV] = useState('');
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); const t = v.trim(); if (!t || busy) return; setV(''); onSend(t); }}
      style={{ display: 'flex', gap: 8, marginTop: 4, alignItems: 'stretch', position: 'relative' }}
    >
      <span style={{
        position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
        color: 'var(--ink-300)', fontSize: 14, fontFamily: 'var(--font-mono)', pointerEvents: 'none',
      }}>›</span>
      <input
        value={v}
        onChange={(e) => setV(e.target.value)}
        placeholder={busy ? '对方正在思考…' : '想自己问点别的…'}
        disabled={busy}
        className="rpg-freeform-input"
      />
      <button type="submit" disabled={!v.trim() || busy} className="rpg-freeform-send">
        {busy ? '···' : '说'}
      </button>
    </form>
  );
}

/* ---------- 主对话框 ---------- */
export default function RPGDialog({
  speaker,
  name,
  nameSub,
  text,
  media,
  toolResult,
  choices = [],
  onChoose,
  onFree,
  onNavigate,
  speed = 28,
  accent,
  onClose,
  showChoicesEarly = false,
  busy = false,
}) {
  const resolvedAccent = accent || (speaker === 'longxun' ? '#84a17a' : '#d97757');
  // 剥离图片标签：打字机只处理纯文字，避免逐帧重排
  const { cleanText, imageIds } = extractImages(text);
  const { shown, done, skip } = useTypewriter(cleanText, speed);

  // 空格/回车 跳过打字机
  useEffect(() => {
    function onKey(e) {
      if (!done && (e.code === 'Space' || e.code === 'Enter')) { e.preventDefault(); skip(); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [done, skip]);

  const canSeeChoices = showChoicesEarly || done;

  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0,
      padding: '0 16px 18px',
      zIndex: 40, pointerEvents: 'none',
    }}>
      <div style={{ maxWidth: 920, margin: '0 auto', position: 'relative', pointerEvents: 'auto' }}>
        <NamePlate name={name} sub={nameSub} accent={resolvedAccent} />

        {/* 主框 */}
        <div
          className="paper-bg no-select"
          onClick={() => !done && skip()}
          style={{
            position: 'relative',
            border: '2.5px solid var(--ink-900)',
            borderRadius: 14,
            boxShadow: '0 6px 0 var(--ink-900), 0 20px 40px rgba(27,22,18,.25)',
            padding: '18px 20px 16px',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'stretch',
            gap: 16,
            cursor: !done ? 'pointer' : 'default',
            maxHeight: 'calc(82vh - 60px)',
            overflow: 'hidden',
          }}
        >
          {/* 关闭键 */}
          {onClose && (
            <button onClick={(e) => { e.stopPropagation(); onClose(); }} aria-label="关闭对话" style={{
              all: 'unset', position: 'absolute', top: -14, right: -14,
              cursor: 'pointer', width: 32, height: 32, borderRadius: 99,
              background: 'var(--ink-900)', color: 'var(--paper-50)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, boxShadow: '0 3px 0 rgba(0,0,0,.3)', zIndex: 2,
            }}>×</button>
          )}

          {/* 头像框 */}
          <div style={{
            flexShrink: 0, alignSelf: 'flex-start', width: 112, height: 122,
            border: '2.5px solid var(--ink-900)', borderRadius: 10,
            background: 'linear-gradient(180deg, var(--paper-50), var(--paper-200))',
            boxShadow: 'inset 0 0 0 3px var(--paper-50), 0 3px 0 var(--ink-900)',
            overflow: 'hidden', position: 'relative',
          }}>
            <CharPortrait name={speaker} style={{ width: '100%', height: '100%' }} />
            <div style={{
              position: 'absolute', bottom: 6, right: 6,
              fontFamily: 'var(--font-serif)', fontSize: 9,
              color: resolvedAccent, fontWeight: 700,
              border: `1.5px solid ${resolvedAccent}`,
              padding: '1px 4px', borderRadius: 2, letterSpacing: '0.1em',
              writingMode: 'vertical-rl',
            }}>
              {speaker === 'longxun' ? '村' : speaker === 'qianyu' ? '梦' : speaker === 'huangzhe' ? '蒸' : speaker === 'gangzi' ? '豆' : speaker === 'corgi' ? '汪' : '梅'}
            </div>
          </div>

          {/* 文本区（统一滚动：文字+媒体+选项一起） */}
          <div style={{ flex: 1, minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto', paddingRight: 4 }}>
            <div>
              <p style={{
                fontFamily: 'var(--font-serif)', fontSize: 16, lineHeight: 1.7,
                color: 'var(--ink-900)', margin: 0, letterSpacing: '0.02em',
                whiteSpace: 'pre-wrap', minHeight: 44,
              }}>
                {renderWithCitations(shown)}
                {!done && <span className="cursor-blink">▍</span>}
                {done && choices.length > 0 && <span className="continue-indicator"> ▼</span>}
              </p>
            </div>

            {/* 空间实景图片（打字完成后展示，独立于 p 标签外）*/}
            {done && imageIds.length > 0 && (
              <div onClick={(e) => e.stopPropagation()}>
                <PhotoStrip imageIds={imageIds} />
              </div>
            )}

            {/* 媒体卡片（打字机结束后展示）*/}
            {done && media && (
              <div onClick={(e) => e.stopPropagation()}>
                <MediaGroup media={media} />
              </div>
            )}

            {/* 旅居方案卡片（toolResult: propose_itinerary）*/}
            {done && toolResult?.type === 'propose_itinerary' && (
              <ItineraryCard data={toolResult.data} onNavigate={onNavigate} />
            )}

            {/* 选项 */}
            {canSeeChoices && choices.length > 0 && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: choices.length > 2 ? '1fr 1fr' : '1fr',
                gap: 8, marginTop: 2,
              }}>
                {choices.map((c, i) => (
                  <ChoiceButton key={i} index={i} label={c.label} hint={c.hint}
                    disabled={busy}
                    onClick={(e) => { e.stopPropagation(); onChoose?.(c); }}
                  />
                ))}
              </div>
            )}

            {/* 自由输入 */}
            {onFree && canSeeChoices && (
              <div onClick={(e) => e.stopPropagation()} style={{ marginTop: choices.length ? 2 : 0 }}>
                <FreeformInput onSend={onFree} busy={busy} />
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .cursor-blink {
          display: inline-block; width: 6px; margin-left: 1px;
          animation: cursor-blink 1s steps(2) infinite;
          color: var(--ink-500);
        }
        @keyframes cursor-blink { 50% { opacity: 0 } }
        .continue-indicator {
          color: var(--persimmon-500);
          animation: continue-bounce 1.2s ease-in-out infinite;
          display: inline-block;
        }
        @keyframes continue-bounce {
          0%, 100% { transform: translateY(0) }
          50% { transform: translateY(3px) }
        }
      `}</style>
    </div>
  );
}
