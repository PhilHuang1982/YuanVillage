/**
 * services/llm.js — 统一 LLM wrapper (~50 行)
 * 支持 claude / deepseek / openai，通过 LLM_PROVIDER env 切换
 * 接口：chat({ system, messages, maxTokens, tools, cacheMarker })
 * 返回：{ text, toolUse }
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
  // deepseek & openai share the OpenAI SDK
  if (!_openai) {
    const baseURL = provider === 'deepseek'
      ? (process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1')
      : undefined;
    const apiKey = provider === 'deepseek'
      ? process.env.DEEPSEEK_API_KEY
      : process.env.OPENAI_API_KEY;
    _openai = new OpenAI({ apiKey, baseURL });
  }
  return { provider, client: _openai };
}

/**
 * @param {object} opts
 * @param {string} opts.system       - system prompt (will be prompt-cached on Claude)
 * @param {Array}  opts.messages     - [{role, content}]
 * @param {number} [opts.maxTokens]  - default 4096
 * @param {Array}  [opts.tools]      - tool schemas (Claude/OpenAI format)
 * @param {boolean}[opts.cacheMarker]- mark system prompt for caching (Claude only)
 * @returns {Promise<{text: string, toolUse: object|null}>}
 */
export async function chat({ system, messages, maxTokens = 4096, tools, cacheMarker = true }) {
  const { provider, client } = getClient();
  const model = process.env.LLM_MODEL ||
    (provider === 'claude' ? 'claude-sonnet-4-5' :
     provider === 'deepseek' ? 'deepseek-chat' : 'gpt-4o-mini');

  if (provider === 'claude') {
    // Prompt caching: mark system prompt as ephemeral cache_control
    const systemBlock = cacheMarker
      ? [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }]
      : system;

    const req = {
      model,
      max_tokens: maxTokens,
      system: systemBlock,
      messages,
    };
    if (tools?.length) req.tools = tools;

    const res = await client.messages.create(req);

    const textBlock = res.content.find(b => b.type === 'text');
    const toolBlock = res.content.find(b => b.type === 'tool_use');
    return {
      text: textBlock?.text ?? '',
      toolUse: toolBlock ?? null,
    };
  }

  // OpenAI / DeepSeek
  const req = {
    model,
    max_tokens: maxTokens,
    messages: [{ role: 'system', content: system }, ...messages],
  };
  if (tools?.length) {
    req.tools = tools.map(t => ({ type: 'function', function: t }));
    req.tool_choice = 'auto';
  }

  const res = await client.chat.completions.create(req);
  const msg = res.choices[0].message;
  const toolCall = msg.tool_calls?.[0];
  return {
    text: msg.content ?? '',
    toolUse: toolCall
      ? { name: toolCall.function.name, input: JSON.parse(toolCall.function.arguments) }
      : null,
  };
}
