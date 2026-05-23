/**
 * services/activitiesLoader.js
 * 读取 vault/wiki/activities/<space_slug>/*.md
 * 返回按日期分类的活动列表（upcoming / past）
 */

import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

const VAULT_PATH = () => process.env.VAULT_PATH
  ? path.resolve(process.cwd(), process.env.VAULT_PATH)
  : path.resolve(process.cwd(), '../vault');

function today() {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
}

export async function loadActivities(spaceSlug) {
  const dir = path.join(VAULT_PATH(), 'wiki/activities', spaceSlug);
  let files;
  try {
    files = await fs.readdir(dir);
  } catch {
    return { upcoming: [], past: [] };
  }

  const activities = [];
  for (const f of files) {
    if (!f.endsWith('.md')) continue;
    const raw = await fs.readFile(path.join(dir, f), 'utf8');
    const { data: meta, content } = matter(raw);
    // 取第一段作为 intro
    const introMatch = content.match(/##\s*活动简介\s*\n+([\s\S]*?)(?:\n##|$)/);
    const intro = introMatch ? introMatch[1].trim().split('\n\n')[0] : '';
    activities.push({ ...meta, intro });
  }

  // gray-matter 会把 YYYY-MM-DD 解析成 Date 对象，统一转成 YYYY-MM-DD 字符串
  function toDateStr(d) {
    if (!d) return '';
    if (d instanceof Date) return d.toISOString().split('T')[0];
    return String(d);
  }

  // Sort by date desc
  activities.sort((a, b) => toDateStr(b.date).localeCompare(toDateStr(a.date)));

  const t = today();
  return {
    upcoming: activities.filter(a => toDateStr(a.date) >= t),
    past: activities.filter(a => toDateStr(a.date) < t),
  };
}
