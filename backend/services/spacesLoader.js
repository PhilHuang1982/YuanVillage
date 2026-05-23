/**
 * services/spacesLoader.js
 * 读取 vault/wiki/spaces/*.md，返回空间列表（含 frontmatter + 简介段落）
 */

import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

const VAULT_PATH = () => process.env.VAULT_PATH
  ? path.resolve(process.cwd(), process.env.VAULT_PATH)
  : path.resolve(process.cwd(), '../vault');

let _cache = null;
let _cacheAt = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 min

export async function loadSpaces() {
  if (_cache && Date.now() - _cacheAt < CACHE_TTL) return _cache;

  const spacesDir = path.join(VAULT_PATH(), 'wiki/spaces');
  let files;
  try {
    files = await fs.readdir(spacesDir);
  } catch {
    return [];
  }

  const spaces = [];
  for (const f of files) {
    if (!f.endsWith('.md')) continue;
    const raw = await fs.readFile(path.join(spacesDir, f), 'utf8');
    const { data: meta, content } = matter(raw);
    // 取"## 空间介绍"段落第一段作为 intro
    const introMatch = content.match(/##\s*空间介绍\s*\n+([\s\S]*?)(?:\n##|$)/);
    const intro = introMatch ? introMatch[1].trim().split('\n\n')[0] : '';
    spaces.push({ ...meta, intro });
  }

  _cache = spaces;
  _cacheAt = Date.now();
  return spaces;
}

export async function loadSpace(slug) {
  const all = await loadSpaces();
  return all.find(s => s.slug === slug) ?? null;
}

export function invalidateCache() {
  _cache = null;
}
