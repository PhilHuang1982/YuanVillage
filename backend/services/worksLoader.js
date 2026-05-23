/**
 * services/worksLoader.js
 * 读取 vault/wiki/works/*.md，按 space_slug 过滤
 */

import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

const VAULT_PATH = () => process.env.VAULT_PATH
  ? path.resolve(process.cwd(), process.env.VAULT_PATH)
  : path.resolve(process.cwd(), '../vault');

export async function loadWorks(spaceSlug) {
  const dir = path.join(VAULT_PATH(), 'wiki/works');
  let files;
  try {
    files = await fs.readdir(dir);
  } catch {
    return [];
  }

  const works = [];
  for (const f of files) {
    if (!f.endsWith('.md')) continue;
    const raw = await fs.readFile(path.join(dir, f), 'utf8');
    const { data: meta, content } = matter(raw);
    if (spaceSlug && meta.space_slug !== spaceSlug) continue;
    const descMatch = content.match(/##\s*作品说明\s*\n+([\s\S]*?)(?:\n##|$)/);
    const description = descMatch ? descMatch[1].trim().split('\n\n')[0] : '';
    works.push({ ...meta, description });
  }

  return works;
}
