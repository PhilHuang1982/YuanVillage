/**
 * pages/ChatDebug.jsx — MVP1 极简对话调试页
 * 路由: /chat?slug=xiaomei
 *
 * 功能：
 * - 与任意分身对话（slug 从 URL query 取）
 * - 显示 evidence_ledger 引用（[c-NNN] 格式）
 * - 显示 toolResult（village steward 方案）
 * - slug 切换 input（调试多 persona 用）
 * - 无地图、无积分、无动画——只有对话
 */

import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { sendChat, fetchPersonaOpen } from '../lib/api.js';

export default function ChatDebug() {
  const [searchParams, setSearchParams] = useSearchParams();
  const slugParam = searchParams.get('slug') || 'xiaomei';

  const [slug, setSlug] = useState(slugParam);
  const [inputSlug, setInputSlug] = useState(slugParam);
  const [messages, setMessages] = useState([]); // [{role, content, toolResult?}]
  const [personaName, setPersonaName] = useState('');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [openLoading, setOpenLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  // 同步 URL
  useEffect(() => {
    setSearchParams({ slug }, { replace: true });
  }, [slug]);

  // slug 变化时拉取开场白
  useEffect(() => {
    setMessages([]);
    setError('');
    setPersonaName('');
    setOpenLoading(true);
    fetchPersonaOpen(slug)
      .then(data => {
        setPersonaName(data.name || slug);
        if (data.first_mes) {
          setMessages([{
            role: 'assistant',
            content: data.first_mes,
            personKind: data.personKind,
          }]);
        }
      })
      .catch(err => setError(`载入分身失败: ${err.message}`))
      .finally(() => setOpenLoading(false));
  }, [slug]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const history = messages.map(m => ({ role: m.role, content: m.content }));

  async function handleSend(e) {
    e.preventDefault();
    const msg = input.trim();
    if (!msg || loading) return;
    setInput('');
    setError('');

    const userMsg = { role: 'user', content: msg };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await sendChat({ slug, message: msg, history });
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: res.text,
          toolResult: res.toolResult,
          personKind: res.personKind,
        },
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSlugChange(e) {
    e.preventDefault();
    const s = inputSlug.trim();
    if (!s) return;
    setSlug(s);
    setMessages([]); // 切换 persona 清空历史
    setError('');
  }

  function renderCitation(text) {
    // 把 [c-001] 渲染成橙色小标签
    return text.split(/(\[c-\d{3}\])/g).map((part, i) =>
      /^\[c-\d{3}\]$/.test(part)
        ? <span key={i} className="text-xs bg-amber-100 text-amber-700 border border-amber-200 rounded px-1 mx-0.5 font-mono">{part}</span>
        : <span key={i}>{part}</span>
    );
  }

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex-none border-b border-stone-200 bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-sm font-semibold text-stone-700">元家乡 2050 · 分身调试</h1>
            <p className="text-xs text-stone-400">MVP1 — 对话测试 & 蒸馏调试</p>
          </div>
          <div className="flex-1" />
          {/* Slug 切换 */}
          <form onSubmit={handleSlugChange} className="flex gap-1.5">
            <input
              value={inputSlug}
              onChange={e => setInputSlug(e.target.value)}
              placeholder="slug"
              className="text-xs border border-stone-200 rounded px-2 py-1 w-28 font-mono"
            />
            <button
              type="submit"
              className="text-xs bg-stone-800 text-white rounded px-2 py-1"
            >
              切换
            </button>
          </form>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-xs font-mono text-stone-500 bg-stone-100 rounded px-2 py-0.5">{slug}</span>
          {messages.length > 0 && (
            <button
              onClick={() => { setMessages([]); setError(''); }}
              className="text-xs text-stone-400 hover:text-stone-600"
            >
              清空历史
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-stone-400 text-sm mt-12">
            <p className="text-2xl mb-2">🌿</p>
            {openLoading
              ? <p className="animate-pulse">正在唤醒 {slug}…</p>
              : <><p>与 <span className="font-mono font-medium text-stone-600">{personaName || slug}</span> 开始对话</p>
                 <p className="text-xs mt-1 text-stone-300">蒸馏完成后方可对话；如报 404 请先运行 distill.js</p></>
            }
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className="max-w-sm">
              {m.role === 'user' ? (
                <div className="persona-bubble-user">{m.content}</div>
              ) : (
                <div>
                  <div className="persona-bubble-ai whitespace-pre-wrap text-sm leading-relaxed">
                    {renderCitation(m.content)}
                  </div>
                  {/* Tool result: propose_itinerary */}
                  {m.toolResult?.type === 'propose_itinerary' && (
                    <div className="mt-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-stone-700">
                      <p className="font-semibold text-amber-700 mb-1">🗺️ 定制方案</p>
                      <p className="font-medium">访客画像：{m.toolResult.data.guest_profile?.type}</p>
                      <p className="mt-1 text-stone-500">{m.toolResult.data.itinerary_outline}</p>
                      {m.toolResult.data.recommended_spaces?.length > 0 && (
                        <p className="mt-1">
                          推荐空间：{m.toolResult.data.recommended_spaces.map(s => s.space_name).join('、')}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="persona-bubble-ai text-stone-400 text-sm">
              <span className="animate-pulse">···</span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl px-4 py-2">
            ⚠ {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex-none border-t border-stone-200 bg-white px-4 py-3">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={`问 ${slug}…`}
            disabled={loading}
            className="flex-1 border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300 disabled:bg-stone-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-stone-800 text-white rounded-xl px-5 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            发送
          </button>
        </div>
        <p className="text-xs text-stone-300 mt-1.5 text-center">
          [c-NNN] = evidence 引用 · 切换 slug 可测试不同分身 · 历史保留在内存中
        </p>
      </form>
    </div>
  );
}
