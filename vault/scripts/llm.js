/**
 * scripts/llm.js — 蒸馏脚本专用 LLM wrapper
 * 支持 claude / deepseek / openai
 * 支持多模态（Claude 原生，OpenAI 兼容格式）
 *
 * chat({ system, messages, maxTokens })
 * messages 中 content 可以是 string 或 ContentBlock[]
 *   ContentBlock: { type: 'text', text } | { type: 'image_base64', media_type, data }
 */

import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

let _anthropic = null;
let _openai = null;

function getClient() {
  const provider = process.env.LLM_PROVIDER || 'claude';
  if (provider === 'claude') {
    if (!_anthropic) _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    return { provider, client: _anthropic };
  }
  if (!_openai) {
    const baseURL = provider === 'deepseek'
      ? (process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1')
      : undefined;
    const apiKey = provider === 'deepseek' ? process.env.DEEPSEEK_API_KEY : process.env.OPENAI_API_KEY;
    _openai = new OpenAI({ apiKey, baseURL });
  }
  return { provider, client: _openai };
}

/**
 * 把内部格式的 message content 转成对应 SDK 格式
 * 内部格式：
 *   string → 纯文本
 *   ContentBlock[] → 混合文本+图片
 *     { type: 'text', text: '...' }
 *     { type: 'image_base64', media_type: 'image/jpeg', data: '<base64>' }
 */
function toAnthropicContent(content) {
  if (typeof content === 'string') return content;
  return content.map(block => {
    if (block.type === 'text') return { type: 'text', text: block.text };
    if (block.type === 'image_base64') return {
      type: 'image',
      source: { type: 'base64', media_type: block.media_type, data: block.data },
    };
    return block;
  });
}

function toOpenAIContent(content) {
  if (typeof content === 'string') return content;
  return content.map(block => {
    if (block.type === 'text') return { type: 'text', text: block.text };
    if (block.type === 'image_base64') return {
      type: 'image_url',
      image_url: { url: `data:${block.media_type};base64,${block.data}` },
    };
    return block;
  });
}

export async function chat({ system, messages, maxTokens = 8192 }) {
  const { provider, client } = getClient();
  const model = process.env.LLM_MODEL ||
    (provider === 'claude' ? 'claude-sonnet-4-5' :
     provider === 'deepseek' ? 'deepseek-chat' : 'gpt-4o-mini');

  if (provider === 'claude') {
    const anthropicMessages = messages.map(m => ({
      role: m.role,
      content: toAnthropicContent(m.content),
    }));
    const res = await client.messages.create({
      model,
      max_tokens: maxTokens,
      system,
      messages: anthropicMessages,
    });
    const textBlock = res.content.find(b => b.type === 'text');
    return { text: textBlock?.text ?? '' };
  }

  // OpenAI / DeepSeek（DeepSeek 不支持图片，图片 block 会被忽略）
  const openaiMessages = [
    { role: 'system', content: system },
    ...messages.map(m => ({ role: m.role, content: toOpenAIContent(m.content) })),
  ];
  const res = await client.chat.completions.create({
    model,
    max_tokens: maxTokens,
    messages: openaiMessages,
  });
  return { text: res.choices[0].message.content ?? '' };
}
