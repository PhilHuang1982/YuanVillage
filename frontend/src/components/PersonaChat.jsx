/**
 * components/PersonaChat.jsx
 * 可复用对话组件（从 ChatDebug 提炼）
 *
 * props:
 *   slug        — persona slug
 *   compact     — 紧凑模式（StewardChatPanel 用）
 *   onTurn      — 每次 AI 回复回调（用于积分）
 *   onItinerary — 收到 propose_itinerary 结果时回调(toolResult.data)
 *   onSpaceNav  — 点击方案卡里的空间链接时回调(spaceSlug)
 */

import { useState, useRef, useEffect } from 'react';
import { sendChat, fetchPersonaOpen } from '../lib/api.js';
import ItineraryCard from './ItineraryCard.jsx';

function renderCitation(text) {
  return text.split(/(\[c-\d{3}\])/g).map((part, i) =>
    /^\[c-\d{3}\]$/.test(part)
      ? <span key={i} className="text-xs bg-amber-100 text-amber-700 border border-amber-200 rounded px-1 mx-0.5 font-mono">{part}</span>
      : <span key={i}>{part}</span>
  );
}

export default function PersonaChat({ slug, compact = false, onTurn, onItinerary, onSpaceNav }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [openLoading, setOpenLoading] = useState(false);
  const [personaName, setPersonaName] = useState('');
  const [error, setError] = useState('');
  const bottomRef = useRef(null);
  const prevSlug = useRef(null);

  // slug 变化时加载开场白
  useEffect(() => {
    if (!slug || slug === prevSlug.current) return;
    prevSlug.current = slug;
    setMessages([]);
    setError('');
    setPersonaName('');
    setOpenLoading(true);
    fetchPersonaOpen(slug)
      .then(data => {
        setPersonaName(data.name || slug);
        if (data.first_mes) {
          setMessages([{ role: 'assistant', content: data.first_mes, personKind: data.personKind }]);
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
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setLoading(true);
    try {
      const res = await sendChat({ slug, message: msg, history });
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: res.text,
        toolResult: res.toolResult,
        personKind: res.personKind,
      }]);
      onTurn?.();
      if (res.toolResult?.type === 'propose_itinerary') {
        onItinerary?.(res.toolResult.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const bubbleSize = compact ? 'max-w-[260px]' : 'max-w-sm';
  const textSize = compact ? 'text-xs' : 'text-sm';

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5">
        {messages.length === 0 && (
          <div className="text-center text-stone-400 text-xs mt-8">
            {openLoading
              ? <p className="animate-pulse">唤醒 {slug}…</p>
              : <p>与 <span className="font-medium text-stone-600">{personaName || slug}</span> 开始对话</p>
            }
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={bubbleSize}>
              {m.role === 'user' ? (
                <div className="persona-bubble-user !max-w-none">{m.content}</div>
              ) : (
                <div>
                  <div className={`persona-bubble-ai whitespace-pre-wrap ${textSize} leading-relaxed !max-w-none`}>
                    {renderCitation(m.content)}
                  </div>
                  {m.toolResult?.type === 'propose_itinerary' && (
                    <ItineraryCard data={m.toolResult.data} onSpaceClick={onSpaceNav} />
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
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl px-3 py-2">
            ⚠ {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex-none border-t border-stone-100 px-3 py-2.5">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={`问 ${personaName || slug}…`}
            disabled={loading}
            className="flex-1 border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300 disabled:bg-stone-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-stone-800 text-white rounded-xl px-4 py-2 text-sm disabled:opacity-40"
          >
            发送
          </button>
        </div>
      </form>
    </div>
  );
}
