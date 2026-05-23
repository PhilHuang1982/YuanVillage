/**
 * scripts/ingest-longxun.js
 * Stage 1 ingest: OCR 页面 → wiki/sources/longxun-src-*.md
 *
 * 按主题将《乡村造梦记》OCR 文本聚合成知识层 source 文件，
 * 供 distill.js Stage 2 使用。
 *
 * 用法：node vault/scripts/ingest-longxun.js
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OCR_DIR = path.resolve(__dirname, '../raw/longxun/ocr-full');
const OUT_DIR = path.resolve(__dirname, '../wiki/sources');

async function readPage(n) {
  const file = path.join(OCR_DIR, `page-${String(n).padStart(4, '0')}.txt`);
  try {
    const txt = await fs.readFile(file, 'utf8');
    return txt.trim();
  } catch {
    return '';
  }
}

async function readPages(ranges) {
  // ranges: [[start, end], ...]  inclusive
  const parts = [];
  for (const [start, end] of ranges) {
    for (let i = start; i <= end; i++) {
      const txt = await readPage(i);
      if (txt.length > 50) parts.push(txt);
    }
  }
  return parts.join('\n\n');
}

function sourceFile({ id, personSlug, sourceType, title, date, tags, evidenceFor, pages, body }) {
  const frontmatter = [
    '---',
    'type: source',
    `id: ${id}`,
    `person_slug: ${personSlug}`,
    `source_file: raw/longxun/ocr-full/`,
    `source_type: ${sourceType}`,
    `title: "${title}"`,
    `date: "${date}"`,
    `tags: [${tags.map(t => `"${t}"`).join(', ')}]`,
    `evidence_for: [${evidenceFor.map(t => `"${t}"`).join(', ')}]`,
    `pages: [${pages.join(', ')}]`,
    'status: active',
    'created: 2026-05-22',
    '---',
  ].join('\n');

  return `${frontmatter}\n\n${body}\n`;
}

const SOURCES = [
  {
    id: 'longxun-src-001',
    title: '《乡村造梦记》序言 — 屏南乡村振兴与文创复兴',
    date: '2021-01-01',
    tags: ['屏南', '乡村振兴', '文创', '林正碌', '人人都是艺术家'],
    evidenceFor: ['village_revival', 'lin_zhenglu', 'cultural_movement'],
    pages: [[14, 21]],
  },
  {
    id: 'longxun-src-002',
    title: '《乡村造梦记》楔子 — 龙潭古村与林正碌',
    date: '2021-01-01',
    tags: ['龙潭', '古村', '林正碌', '溪流', '古厝'],
    evidenceFor: ['village_geography', 'lin_zhenglu', 'village_character'],
    pages: [[23, 26]],
  },
  {
    id: 'longxun-src-003',
    title: '《乡村造梦记》— 林正碌与"人人都是艺术家"运动',
    date: '2021-01-01',
    tags: ['林正碌', '人人都是艺术家', '绘画教学', '艺术普及', '后现代'],
    evidenceFor: ['lin_zhenglu', 'art_movement', 'village_revival'],
    pages: [[30, 56]],
  },
  {
    id: 'longxun-src-004',
    title: '《乡村造梦记》— 龙潭村复兴：从废村到文创社区',
    date: '2021-01-01',
    tags: ['龙潭', '废村', '复兴', '新村民', '古厝改造'],
    evidenceFor: ['village_history', 'village_revival', 'new_villagers_wave'],
    pages: [[73, 86]],
  },
  {
    id: 'longxun-src-005',
    title: '《乡村造梦记》— 新村民群像：随喜书店·曾伟',
    date: '2021-01-01',
    tags: ['新村民', '随喜书店', '曾伟', '社区', '书店'],
    evidenceFor: ['new_villagers_wave', 'space_intro', 'community_life'],
    pages: [[309, 314]],
  },
  {
    id: 'longxun-src-006',
    title: '《乡村造梦记》— 新村民群像：静轩文化艺术空间·胡文亮',
    date: '2021-01-01',
    tags: ['新村民', '静轩', '胡文亮', '江西团队', '黄酒', '创业'],
    evidenceFor: ['new_villagers_wave', 'space_intro', 'village_economy'],
    pages: [[315, 322]],
  },
  {
    id: 'longxun-src-007',
    title: '《乡村造梦记》— 空间群像：悠然之家·燕窝空间·以画谈心',
    date: '2021-01-01',
    tags: ['新村民', '悠然之家', '燕窝空间', '以画谈心', '黄璟', '空间'],
    evidenceFor: ['space_intro', 'new_villagers_wave', 'village_culture'],
    pages: [[319, 328]],
  },
  {
    id: 'longxun-src-008',
    title: '《乡村造梦记》— "千年一遇"美术展与龙潭文化活动',
    date: '2021-01-01',
    tags: ['千年一遇', '美术展', '文化活动', '新老村民', '策展', '龙潭驿'],
    evidenceFor: ['village_culture', 'cultural_events', 'community_life'],
    pages: [[325, 332]],
  },
  {
    id: 'longxun-src-009',
    title: '《乡村造梦记》— 小梅桩·梅宏（小梅）',
    date: '2021-01-01',
    tags: ['小梅桩', '梅宏', '小梅', '律师', '创作', '新村民'],
    evidenceFor: ['host_profiles', 'space_intro', 'xiaomei_background'],
    pages: [[334, 342], [354, 360]],
  },
  {
    id: 'longxun-src-010',
    title: '《乡村造梦记》— 龙潭村的日常：新老村民共生',
    date: '2021-01-01',
    tags: ['龙潭', '新村民', '老村民', '共生', '日常生活', '复兴'],
    evidenceFor: ['community_life', 'village_revival', 'village_culture'],
    pages: [[344, 356]],
  },
  {
    id: 'longxun-src-011',
    title: '《乡村造梦记》— 林正碌与乡村振兴：整体叙述',
    date: '2021-01-01',
    tags: ['林正碌', '乡村振兴', '屏南', '温铁军', '研究院'],
    evidenceFor: ['lin_zhenglu', 'village_revival', 'policy_context'],
    pages: [[345, 353], [373, 380]],
  },
  {
    id: 'longxun-src-012',
    title: '《乡村造梦记》结尾 — 龙潭的未来与乡村梦',
    date: '2021-01-01',
    tags: ['龙潭', '未来', '乡村梦', '林正碌', '新村民', '复兴'],
    evidenceFor: ['village_revival', 'future_vision', 'lin_zhenglu'],
    pages: [[381, 390]],
  },
];

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });

  for (const src of SOURCES) {
    console.log(`[ingest] ${src.id}: 读取页面...`);
    const body = await readPages(src.pages);
    if (!body) {
      console.warn(`  ⚠ 内容为空，跳过`);
      continue;
    }

    const content = sourceFile({
      id: src.id,
      personSlug: 'longxun',
      sourceType: 'book',
      title: src.title,
      date: src.date,
      tags: src.tags,
      evidenceFor: src.evidenceFor,
      pages: src.pages.flat(),
      body,
    });

    const outPath = path.join(OUT_DIR, `${src.id}.md`);
    await fs.writeFile(outPath, content, 'utf8');
    const chars = body.length;
    console.log(`  ✓ ${src.id}.md (${chars} 字)`);
  }

  console.log('\n[ingest] 完成 ✓');
}

main().catch(e => { console.error(e); process.exit(1); });
