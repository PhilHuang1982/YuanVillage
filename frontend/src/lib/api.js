/**
 * lib/api.js — 后端 API 调用封装
 */

const BASE = import.meta.env.VITE_API_URL || '/api';

/** 获取分身开场白（不消耗 LLM，从 persona card 读取） */
export async function fetchPersonaOpen(slug) {
  const res = await fetch(`${BASE}/chat/open/${slug}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json(); // { name, first_mes, personKind, spaceSlug }
}

export async function sendChat({ slug, message, history = [] }) {
  const res = await fetch(`${BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slug, message, history }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json(); // { text, toolResult, personKind }
}

export async function fetchSpaces() {
  const res = await fetch(`${BASE}/spaces`);
  if (!res.ok) throw new Error(`fetch spaces failed: ${res.status}`);
  return res.json();
}

export async function fetchSpaceActivities(spaceSlug) {
  const res = await fetch(`${BASE}/spaces/${spaceSlug}/activities`);
  if (!res.ok) throw new Error(`fetch activities failed: ${res.status}`);
  return res.json();
}

export async function fetchSpaceWorks(spaceSlug) {
  const res = await fetch(`${BASE}/spaces/${spaceSlug}/works`);
  if (!res.ok) throw new Error(`fetch works failed: ${res.status}`);
  return res.json();
}
