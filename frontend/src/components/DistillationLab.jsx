/**
 * DistillationLab.jsx — 分身蒸馏模拟体验
 *
 * 三段式流程：
 *   prepare   → 将素材文件拖入蒸馏釜（HTML5 drag-and-drop + click 选文件）
 *   distilling → 蒸馏进度动画（5个阶段，~7秒）
 *   complete  → 分身觉醒预览（示例对话）
 */

import { useState, useRef, useCallback } from 'react';
import { useEffect } from 'react';

// ── 演示预填文件（模拟已上传的主理人素材）────────────────────
const DEMO_FILES = [
  { name: '梅桩主采访录音_20240315.mp3',    size: 28 * 1024 * 1024, icon: '🎙' },
  { name: '小梅桩公众号文章合集.docx',       size: 142 * 1024,        icon: '📝' },
  { name: '梅桩主朋友圈精选截图×12.jpg',     size: 3.2 * 1024 * 1024, icon: '🖼' },
  { name: '活动介绍与日常对话记录.txt',       size: 48 * 1024,         icon: '📃' },
];

// ── 素材类型参考标签 ──────────────────────────────────────────
const MATERIAL_TAGS = [
  '录音采访', '公众号文章', '朋友圈截图',
  '小红书内容', '视频号文件', '对话记录',
];

// ── 文件图标映射 ──────────────────────────────────────────────
function fileIcon(name) {
  const ext = (name.split('.').pop() || '').toLowerCase();
  if (['mp3','m4a','wav','aac','ogg'].includes(ext)) return '🎙';
  if (['mp4','mov','avi','webm','mkv'].includes(ext)) return '🎬';
  if (['jpg','jpeg','png','webp','gif','heic'].includes(ext)) return '🖼';
  if (['pdf'].includes(ext)) return '📄';
  if (['doc','docx'].includes(ext)) return '📝';
  if (['txt','md'].includes(ext)) return '📃';
  if (['xls','xlsx','csv'].includes(ext)) return '📊';
  return '📁';
}

function formatSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

// ── 蒸馏阶段 ─────────────────────────────────────────────────
const STAGES = [
  { label: '解析素材',     detail: '正在读取你提供的内容…' },
  { label: '提炼语气图谱', detail: '捕捉你的口头禅和说话方式…' },
  { label: '构建证据台账', detail: '为每条声明标注出处，确保可溯源…' },
  { label: '写入行为边界', detail: '定义分身能说什么、遇到什么要说「去问真人」…' },
  { label: '凝结数字分身', detail: '你的精华正在凝结成形…' },
];

// ── 分身觉醒示例对话 ─────────────────────────────────────────
const PREVIEW_QA = [
  {
    q: '你这个空间是做什么的？',
    a: '我叫小梅，在龙潭村做非标民宿——小梅桩。前律师转型，现在做自己喜欢的事。这里不是标准酒店，是我的家对外打开的一扇窗。[c-003]',
  },
  {
    q: '什么样的客人不适合来？',
    a: '喜欢在屋里开着空调刷手机的，可能不适合来这里。我更想接待那些真的想走走、聊聊、感受乡村生活的人。[c-011]',
  },
  {
    q: '有空房吗，怎么预约？',
    a: '可以先和我的分身聊聊你的想法，聊完觉得合适再加我微信约实地看看。每个人来的状态不一样，我喜欢先了解一下。',
  },
];

// ── 打字机 Hook ──────────────────────────────────────────────
function useTypewriter(text, speed = 10) {
  const [shown, setShown] = useState('');
  const ref = useRef(null);
  useEffect(() => {
    setShown('');
    let i = 0;
    clearInterval(ref.current);
    ref.current = setInterval(() => {
      i++;
      setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(ref.current);
    }, speed);
    return () => clearInterval(ref.current);
  }, [text, speed]);
  return shown;
}

// ── 主组件 ──────────────────────────────────────────────────
export default function DistillationLab({ onComplete, onClose }) {
  const [phase, setPhase]           = useState('prepare');
  const [files, setFiles]           = useState(DEMO_FILES); // 预填主理人素材，演示可直接点击
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress]     = useState(0);
  const [stageIdx, setStageIdx]     = useState(0);
  const [qaIdx, setQaIdx]           = useState(0);
  const [showResult, setShowResult] = useState(false);
  const fileInputRef = useRef(null);
  const dropRef = useRef(null);

  // ── 文件处理 ──────────────────────────────────────────────
  const addFiles = useCallback((incoming) => {
    const mapped = incoming.map(f => ({
      name: f.name,
      size: f.size,
      icon: fileIcon(f.name),
    }));
    setFiles(prev => {
      // 去重（按文件名）
      const names = new Set(prev.map(x => x.name));
      return [...prev, ...mapped.filter(f => !names.has(f.name))];
    });
  }, []);

  function onDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    const dropped = Array.from(e.dataTransfer.files);
    if (dropped.length) addFiles(dropped);
  }

  function onDragOver(e) {
    e.preventDefault();
    setIsDragging(true);
  }

  function onDragLeave(e) {
    if (!dropRef.current?.contains(e.relatedTarget)) setIsDragging(false);
  }

  function onFileInput(e) {
    const picked = Array.from(e.target.files);
    if (picked.length) addFiles(picked);
    e.target.value = '';
  }

  function removeFile(name) {
    setFiles(prev => prev.filter(f => f.name !== name));
  }

  // ── 开始蒸馏 ──────────────────────────────────────────────
  function startDistillation() {
    setPhase('distilling');
    setProgress(0);
    setStageIdx(0);
  }

  // ── 蒸馏进度驱动 ──────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'distilling') return;
    const iv = setInterval(() => {
      setProgress(prev => {
        const next = prev + 1;
        setStageIdx(Math.min(Math.floor(next / 20), STAGES.length - 1));
        if (next >= 100) {
          clearInterval(iv);
          setTimeout(() => { setPhase('complete'); setShowResult(true); }, 600);
          return 100;
        }
        return next;
      });
    }, 70);
    return () => clearInterval(iv);
  }, [phase]);

  // ── 完成后轮播示例对话 ────────────────────────────────────
  useEffect(() => {
    if (phase !== 'complete') return;
    const t = setInterval(() => setQaIdx(i => (i + 1) % PREVIEW_QA.length), 3500);
    return () => clearInterval(t);
  }, [phase]);

  const currentQA = PREVIEW_QA[qaIdx];
  const previewAnswer = useTypewriter(showResult ? currentQA.a : '', 10);

  return (
    <>
      <style>{`
        @keyframes vessel-float {
          0%,100% { transform: translateY(0) }
          50%      { transform: translateY(-7px) }
        }
        @keyframes bubble-rise {
          0%   { opacity:.7; transform: translateY(0) scale(1) }
          100% { opacity:0;  transform: translateY(-56px) scale(.4) }
        }
        @keyframes lab-in {
          from { opacity:0; transform: translateY(20px) }
          to   { opacity:1; transform: translateY(0) }
        }
        @keyframes file-pop {
          from { opacity:0; transform: scale(.85) translateY(6px) }
          to   { opacity:1; transform: scale(1) translateY(0) }
        }
        @keyframes sparkle {
          0%,100% { opacity:0; transform:scale(0) }
          50%     { opacity:1; transform:scale(1) }
        }
        @keyframes reveal-up {
          from { opacity:0; transform:translateY(10px) }
          to   { opacity:1; transform:translateY(0) }
        }
        .dl-drop-zone {
          transition: background .2s, border-color .2s, transform .15s;
        }
        .dl-drop-zone.drag-over {
          background: #e8f4fb !important;
          border-color: #4f9fbf !important;
          transform: scale(1.01);
        }
        .dl-file-item {
          animation: file-pop .2s ease both;
        }
        .dl-progress-bar { transition: width .25s linear; }
      `}</style>

      {/* 全屏遮罩 */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(10,8,6,.8)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}>
        {/* 面板 */}
        <div style={{
          background: 'var(--paper-50, #faf6f0)',
          border: '2px solid var(--ink-900, #1b1612)',
          borderRadius: 16,
          boxShadow: '0 8px 0 var(--ink-900, #1b1612)',
          width: '100%', maxWidth: 540,
          maxHeight: '90vh', overflowY: 'auto',
          padding: '28px 24px 24px',
          position: 'relative',
          animation: 'lab-in .3s ease',
        }}>
          {/* 关闭 */}
          <button onClick={onClose} style={{
            position: 'absolute', top: 14, right: 14,
            width: 30, height: 30, borderRadius: 99,
            background: 'transparent',
            border: '1.5px solid var(--ink-900)',
            cursor: 'pointer', fontSize: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>×</button>

          {/* ══ PHASE: PREPARE ══════════════════════════════════ */}
          {phase === 'prepare' && (
            <div>
              <div style={{ marginBottom: 16, paddingRight: 32 }}>
                <div style={{ fontSize: 11, letterSpacing: '.14em', color: 'var(--moss-600, #4a6741)', fontFamily: 'var(--font-serif)', marginBottom: 4 }}>
                  ⚗ 蒸馏模拟体验
                </div>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 700, margin: 0, color: 'var(--ink-900)' }}>
                  梅桩主的素材已就位
                </h2>
                <p style={{ marginTop: 8, fontSize: 13, color: '#666', lineHeight: 1.6 }}>
                  下方是真实蒸馏所需的素材类型——录音、截图、文章、对话记录。已为你预加载梅桩主的部分素材，可直接点击开始蒸馏。
                </p>
              </div>

              {/* 素材类型提示标签 */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                {MATERIAL_TAGS.map(t => (
                  <span key={t} style={{
                    fontSize: 11, padding: '3px 10px',
                    background: 'var(--paper-200, #efe8dc)',
                    border: '1px solid var(--ink-900)',
                    borderRadius: 99,
                    fontFamily: 'var(--font-serif)',
                    color: 'var(--ink-900)',
                  }}>{t}</span>
                ))}
              </div>

              {/* 拖放区 */}
              <div
                ref={dropRef}
                className={`dl-drop-zone${isDragging ? ' drag-over' : ''}`}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${isDragging ? '#4f9fbf' : 'var(--ink-900)'}`,
                  borderRadius: 14,
                  padding: '28px 20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: isDragging ? '#e8f4fb' : 'white',
                  marginBottom: 14,
                  minHeight: 130,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  gap: 8,
                }}
              >
                <div style={{ fontSize: 36 }}>{isDragging ? '⚗️' : '➕'}</div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 15, fontWeight: 700, color: 'var(--ink-900)' }}>
                  {isDragging ? '松手，投入蒸馏釜' : '继续投入更多素材（可选）'}
                </div>
                <div style={{ fontSize: 12, color: '#999' }}>
                  拖入或点击选择 · 录音 / 截图 / 文章 / 视频均可
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                style={{ display: 'none' }}
                onChange={onFileInput}
              />

              {/* 已投入的文件列表 */}
              {files.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, color: '#888', marginBottom: 8, fontFamily: 'var(--font-serif)' }}>
                    已投入蒸馏釜 · {files.length} 个文件
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {files.map((f, i) => (
                      <div key={f.name} className="dl-file-item" style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        background: 'var(--paper-200, #efe8dc)',
                        border: '1px solid #ccc',
                        borderRadius: 8, padding: '7px 12px',
                        animationDelay: `${i * 0.04}s`,
                      }}>
                        <span style={{ fontSize: 18 }}>{f.icon}</span>
                        <span style={{ flex: 1, fontSize: 13, color: 'var(--ink-900)', fontFamily: 'var(--font-serif)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {f.name}
                        </span>
                        {f.size > 0 && (
                          <span style={{ fontSize: 11, color: '#999', flexShrink: 0 }}>
                            {formatSize(f.size)}
                          </span>
                        )}
                        <button onClick={() => removeFile(f.name)} style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: '#bbb', fontSize: 16, lineHeight: 1, padding: '0 2px',
                          flexShrink: 0,
                        }}>×</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 开始按钮 */}
              <button
                disabled={files.length === 0}
                onClick={startDistillation}
                style={{
                  width: '100%', padding: '14px 0',
                  background: files.length > 0 ? 'var(--ink-900, #1b1612)' : '#ddd',
                  color: files.length > 0 ? 'var(--paper-50, #faf6f0)' : '#aaa',
                  border: 'none', borderRadius: 10,
                  fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 700,
                  cursor: files.length > 0 ? 'pointer' : 'not-allowed',
                  boxShadow: files.length > 0 ? '0 4px 0 #555' : 'none',
                  letterSpacing: '.03em',
                  transition: 'background .2s, color .2s',
                }}
              >
                {files.length === 0 ? '先把素材拖进来' : `⚗ 开始蒸馏 ${files.length} 个文件`}
              </button>
            </div>
          )}

          {/* ══ PHASE: DISTILLING ════════════════════════════════ */}
          {phase === 'distilling' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, letterSpacing: '.14em', color: 'var(--moss-600)', fontFamily: 'var(--font-serif)', marginBottom: 8 }}>
                ⚗ 蒸馏进行中
              </div>

              {/* 蒸馏釜 */}
              <div style={{ position: 'relative', width: 120, height: 120, margin: '0 auto 24px' }}>
                <div style={{
                  width: 120, height: 120, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1a3a5c 0%, #0d5e8a 50%, #16a085 100%)',
                  border: '2.5px solid var(--ink-900)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 40,
                  animation: 'vessel-float 1.8s ease-in-out infinite',
                  boxShadow: '0 0 24px rgba(22,160,133,.5), 0 4px 0 var(--ink-900)',
                }}>⚗️</div>
                {[...Array(4)].map((_, i) => (
                  <div key={i} style={{
                    position: 'absolute',
                    width: 8 + i * 3, height: 8 + i * 3,
                    borderRadius: '50%',
                    background: 'rgba(22,160,133,.5)',
                    left: `${20 + i * 18}%`,
                    bottom: `${60 + (i % 2) * 10}%`,
                    animation: `bubble-rise ${1.2 + i * 0.4}s ease-in-out ${i * 0.3}s infinite`,
                  }} />
                ))}
              </div>

              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 700, color: 'var(--ink-900)', marginBottom: 6 }}>
                {STAGES[stageIdx].label}
              </div>
              <div style={{ fontSize: 13, color: '#777', marginBottom: 20, minHeight: 20 }}>
                {STAGES[stageIdx].detail}
              </div>

              {/* 进度条 */}
              <div style={{
                background: 'var(--paper-200)', borderRadius: 99, height: 10,
                border: '1.5px solid var(--ink-900)', overflow: 'hidden', marginBottom: 16,
              }}>
                <div className="dl-progress-bar" style={{
                  width: `${progress}%`, height: '100%',
                  background: 'linear-gradient(90deg, #0d5e8a, #16a085)',
                  borderRadius: 99,
                }} />
              </div>

              {/* 阶段点 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 4 }}>
                {STAGES.map((s, i) => (
                  <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: 10, color: i <= stageIdx ? 'var(--water-500, #4f9fbf)' : '#bbb', fontFamily: 'var(--font-serif)', transition: 'color .3s' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: i <= stageIdx ? 'var(--water-500, #4f9fbf)' : '#ddd', margin: '0 auto 3px', transition: 'background .3s' }} />
                    {s.label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ PHASE: COMPLETE ══════════════════════════════════ */}
          {phase === 'complete' && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: 32, marginBottom: 8, animation: 'sparkle 1.2s ease .1s both' }}>✨</div>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 700, margin: 0, color: 'var(--ink-900)', animation: 'reveal-up .4s ease both' }}>
                  分身已凝结完成
                </h2>
                <p style={{ marginTop: 8, fontSize: 13, color: '#777', animation: 'reveal-up .4s ease .1s both' }}>
                  这是从你的素材中萃取出的数字分身，正在用她的语气和你对话——
                </p>
              </div>

              {/* 对话预览 */}
              <div style={{
                background: 'var(--paper-200)', border: '1.5px solid var(--ink-900)',
                borderRadius: 12, padding: 16, marginBottom: 14,
                minHeight: 150, animation: 'reveal-up .5s ease .2s both',
              }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                  <div style={{
                    background: '#e8f4f8', border: '1px solid #b0d4e8',
                    borderRadius: '12px 12px 2px 12px',
                    padding: '8px 12px', maxWidth: '75%',
                    fontSize: 13, color: '#333', lineHeight: 1.5,
                  }}>{currentQA.q}</div>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 32, height: 32, flexShrink: 0, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #d97757, #c05c3e)',
                    border: '1.5px solid var(--ink-900)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                  }}>梅</div>
                  <div style={{
                    background: 'white', border: '1px solid #ddd',
                    borderRadius: '2px 12px 12px 12px',
                    padding: '8px 12px', flex: 1,
                    fontSize: 13, color: '#333', lineHeight: 1.6, minHeight: 52,
                  }}>
                    {previewAnswer}
                    <span style={{ display: 'inline-block', width: 2, height: 13, background: 'var(--ink-900)', marginLeft: 1, animation: 'sparkle .6s ease-in-out infinite', verticalAlign: 'middle' }} />
                  </div>
                </div>
                <div style={{ textAlign: 'right', marginTop: 8 }}>
                  <button onClick={() => { setQaIdx(i => (i + 1) % PREVIEW_QA.length); setShowResult(true); }} style={{ background: 'none', border: 'none', fontSize: 11, color: '#999', cursor: 'pointer', fontFamily: 'var(--font-serif)' }}>
                    换一个问题 →
                  </button>
                </div>
              </div>

              {/* 说明 */}
              <div style={{
                background: '#f0f7fb', border: '1px solid #b0d4e8',
                borderRadius: 10, padding: '11px 14px', marginBottom: 18,
                fontSize: 12, color: '#555', lineHeight: 1.7,
                animation: 'reveal-up .5s ease .3s both',
              }}>
                🔍 真实蒸馏中，分身基于 <strong>22 条证据条目</strong>，每句话都可溯源到原始素材——录音时间戳、文章段落、对话截图。整个过程通常在 <strong>一小时</strong> 内完成。
              </div>

              {/* 按钮 */}
              <div style={{ display: 'flex', gap: 10, animation: 'reveal-up .5s ease .4s both' }}>
                <button onClick={onComplete} style={{
                  flex: 2, padding: '13px 0',
                  background: 'var(--ink-900)', color: 'var(--paper-50)',
                  border: 'none', borderRadius: 10,
                  fontFamily: 'var(--font-serif)', fontSize: 15, fontWeight: 700,
                  cursor: 'pointer', boxShadow: '0 4px 0 #555', letterSpacing: '.03em',
                }}>了解真实蒸馏合作 →</button>
                <button onClick={onClose} style={{
                  flex: 1, padding: '13px 0',
                  background: 'transparent', color: 'var(--ink-900)',
                  border: '1.5px solid var(--ink-900)', borderRadius: 10,
                  fontFamily: 'var(--font-serif)', fontSize: 14, cursor: 'pointer',
                }}>关闭</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
