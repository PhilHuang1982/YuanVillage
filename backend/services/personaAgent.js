/**
 * services/personaAgent.js
 * 统一的 persona chat handler，承载 host / cloud-villager / steward
 */

import { chat } from './llm.js';
import { loadPersona } from './personaLoader.js';
import { PROPOSE_ITINERARY_TOOL } from './stewardTool.js';

/**
 * @param {object} opts
 * @param {string} opts.slug        - persona slug
 * @param {string} opts.message     - user's latest message
 * @param {Array}  opts.history     - [{role, content}] prior turns
 * @returns {Promise<{text, toolResult, personKind}>}
 */
export async function chatWithPersona({ slug, message, history = [] }) {
  const persona = await loadPersona(slug);
  const { systemPrompt, personKind } = persona;

  const tools = personKind === 'steward' ? [PROPOSE_ITINERARY_TOOL] : undefined;

  const messages = [
    ...history.map(h => ({ role: h.role, content: h.content })),
    { role: 'user', content: message },
  ];

  const { text, toolUse } = await chat({
    system: systemPrompt,
    messages,
    maxTokens: 2048,
    tools,
    cacheMarker: true,
  });

  let toolResult = null;
  if (toolUse?.name === 'propose_itinerary') {
    toolResult = {
      type: 'propose_itinerary',
      data: toolUse.input,
    };
  }

  return { text, toolResult, personKind };
}
