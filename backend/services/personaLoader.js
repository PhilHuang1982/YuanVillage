/**
 * services/personaLoader.js
 * 从 vault/persona-cards/<slug>.json 加载蒸馏产物
 * 拼装成 system prompt（灵魂层 + 空间信息 + 活动 + ledger）
 * 支持 host / cloud-villager / steward
 */

import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { loadActivities } from './activitiesLoader.js';
import { loadSpace } from './spacesLoader.js';

const VAULT_PATH = () => process.env.VAULT_PATH
  ? path.resolve(process.cwd(), process.env.VAULT_PATH)
  : path.resolve(process.cwd(), '../vault');

// 5 min in-memory cache per slug
const _cache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

export async function loadPersona(slug) {
  const cached = _cache.get(slug);
  if (cached && Date.now() - cached.at < CACHE_TTL) return cached.data;

  const cardPath = path.join(VAULT_PATH(), 'persona-cards', `${slug}.json`);
  let card;
  try {
    card = JSON.parse(await fs.readFile(cardPath, 'utf8'));
  } catch {
    throw new Error(`Persona card not found: ${slug}. 请先运行 distill.js`);
  }

  const personKind = card.x_xianjian_person_kind || 'host';
  const spaceSlug = card.x_xianjian_space_slug;

  // Load space info
  let space = null;
  if (spaceSlug) {
    space = await loadSpace(spaceSlug);
  }

  // Load activities for this persona's space
  let activities = { upcoming: [], past: [] };
  if (spaceSlug) {
    activities = await loadActivities(spaceSlug);
  }

  // Assemble system prompt
  const systemPrompt = assembleSystemPrompt({ card, space, activities, personKind, slug });

  const data = {
    slug,
    name: card.name,
    personKind,
    spaceSlug,
    systemPrompt,
    card, // keep raw card for frontend display
  };

  _cache.set(slug, { data, at: Date.now() });
  return data;
}

function assembleSystemPrompt({ card, space, activities, personKind, slug }) {
  const parts = [];

  // === L0: Soul layer (always first, maximizes prompt cache hit) ===
  parts.push(`你是 ${card.name}（${card.description ?? ''}）。\n`);
  if (card.personality) parts.push(`## 性格与行为模式\n${card.personality}\n`);
  if (card.system_prompt) parts.push(card.system_prompt);

  // === Space context ===
  if (space) {
    parts.push(`\n## 你所在的空间：${space.name}\n`);
    parts.push(`${space.intro || ''}\n`);
    if (space.short_pitch) parts.push(`一句话：${space.short_pitch}\n`);
    if (space.service_list) parts.push(`服务清单：${space.service_list}\n`);
  }

  // === Upcoming activities ===
  if (activities.upcoming.length > 0) {
    parts.push('\n## 近期活动\n');
    for (const a of activities.upcoming) {
      parts.push(`- **${a.title}** (${a.date})：${a.intro || ''}\n`);
    }
  }

  // === Evidence ledger ===
  if (card.x_xianjian_evidence_ledger?.length) {
    parts.push('\n## 知识引用清单（evidence_ledger）\n');
    parts.push('回答下列话题时，请引用对应 claim_id（格式 [c-NNN]）：\n');
    for (const item of card.x_xianjian_evidence_ledger) {
      const conf = item.confidence ? `(${item.confidence})` : '';
      parts.push(`- [${item.claim_id}] ${conf} ${item.claim}\n`);
    }
    parts.push('\n如被问及 ledger 中没有支撑的问题，请说"这方面我没有把握，不太好乱说"而不是编造。\n');
  }

  // === Cloud villager note ===
  if (personKind === 'cloud-villager') {
    parts.push('\n## 特别说明\n');
    parts.push('你是云村民，物理上不在龙潭村，通过云空间与访客互动。请主动说明"我在线上，不在村里"，不要让访客误以为可以线下见面。\n');
  }

  return parts.join('');
}

export function invalidatePersonaCache(slug) {
  if (slug) _cache.delete(slug);
  else _cache.clear();
}
