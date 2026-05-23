/**
 * scripts/distill.js — 主理人 / 云村民 / steward 统一蒸馏 v0.4
 *
 * 两阶段架构：
 *   Stage 1（wiki ingest）: raw/<slug>/ → wiki/sources/<slug>-*.md + wiki/entities/ + wiki/activities/ + wiki/works/
 *   Stage 2（本脚本）:  wiki/sources/<slug>-*.md → persona-cards/<slug>.json
 *
 * v0.4 变更：
 * - 文本来源从 raw/<slug>/*.md 改为 wiki/sources/<slug>-*.md（wiki 知识层）
 * - 图片仍读自 raw/<slug>/图片资产/（仅多模态用）
 * - 活动仍读自 raw/<slug>/活动/ 文件夹（获取图片和结构化描述）
 * - 原 readRawDir() 重命名为 readWikiSources()
 *
 * 用法：
 *   npm run distill xiaomei
 *   npm run distill xiaomei --force   # wiki/sources 为空时强制继续
 */

import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { chat } from './llm.js';

const VAULT_ROOT = path.resolve(import.meta.dirname, '..');
const ENTITIES_DIR = path.join(VAULT_ROOT, 'wiki/entities');
const SPACES_DIR = path.join(VAULT_ROOT, 'wiki/spaces');
const WIKI_SOURCES_DIR = path.join(VAULT_ROOT, 'wiki/sources');
const RAW_DIR = path.join(VAULT_ROOT, 'raw');
const CARDS_DIR = path.join(VAULT_ROOT, 'persona-cards');

// 图片资产目录名（不同 slug 可能名字不同，后续可配置）
const IMAGE_ASSET_DIRNAME = '图片资产';
// 活动目录名
const ACTIVITY_DIRNAME = '活动';

// === Distill System Prompt ===
const DISTILL_SYSTEM = `你是数字分身蒸馏专家。基于给定的人物骨架、源材料（文章/朋友圈/访谈）以及空间/活动照片，输出 CCv3 (Character Card V3) 格式的 JSON。

## 输出字段（完整模式）
- spec: "chara_card_v3"
- spec_version: "3.0"
- name（人物称呼）
- description（200 字内，第三人称，描述可观察行为和事实，禁止形容词堆砌）
- personality（200 字内，行为规则，禁止"她很佛系"等形容词）
- scenario（50 字内，访客进入对话的典型场景）
- first_mes（第一句话，60 字内，符合该人物说话风格）
- mes_example（3-5 段示例对话，必须基于素材原话改编）
- system_prompt（含 L0 硬约束 + 三语态切换 + 形容词禁令，见下方说明）
- x_xianjian_person_kind（host / cloud-villager / steward）
- x_xianjian_space_slug（关联空间 slug）
- x_xianjian_skills（[{name, description}]）
- x_xianjian_aesthetic_keywords（5-8 个词）
- x_xianjian_evidence_ledger（见下方格式）
- x_xianjian_source_refs（引用的源文件列表）
- x_xianjian_videos（视频列表，格式见下方，从素材中提取）
- x_xianjian_activities（从 活动/ 目录提取的活动列表）

## x_xianjian_videos 格式
从素材中提取所有视频，格式：
[{ "vid": "wxv_XXX", "url": "原文链接", "title": "文章标题", "description": "50字内视频内容描述" }]
注：agent 推荐时可直接推送此 url 给访客观看。

## x_xianjian_activities 格式
从 活动/ 目录中提取：
[{ "name": "活动名", "description": "简介", "photo_count": N }]

## evidence_ledger 格式
每条 claim 必须：
- claim_id: "c-001"（三位数字）
- claim: "具体可验证的事实陈述"
- confidence: "high"（≥2 源）| "medium"（1 源）
- source_refs: ["文件名"]
- abstain_if: （可选）触发 abstain 的情况

## system_prompt 结构
必须包含：
1. L0 红线：基于 sources/ledger 回答，abstain 兜底，标 [c-NNN] 引用
2. L5 边界禁忌：不评论其他主理人，不猜测商业计划，不公开他人隐私
3. 三语态切换（<NARRATOR>故事价值观 / <OPERATOR>业务答疑 / <VALIDATOR>内部自检）

## 蒸馏方法论（硬约束）
1. 形容词禁令：不写"她很佛系"，写"遇到要求五星级服务的客人，倾向于拒接"
2. 证据阈值：0 源→跳过；1 源→confidence:medium+"我记得..."; ≥2 源→confidence:high
3. 真实对白优先：mes_example 必须从素材原话改编，不许凭空发明
4. 不超出素材范围：evidence_ledger 只挂素材中实际存在的引用
5. 图片信息：如果你看到了空间或活动的照片，可以在 description/aesthetic_keywords 中体现视觉风格

请输出严格 JSON，不要任何 markdown 围栏或解释文字。`;

// ============================================================
// 工具函数
// ============================================================

/** 修复 Obsidian wiki-link 图片路径 → 本地 图片资产/ 路径
 *  ![[笔记同步助手/images/<hash>.jpg|alt]] → ![[图片资产/<hash>.jpg|alt]]
 *  同时返回提取到的图片文件名列表（用于多模态注入）
 */
function fixImageLinks(content, imageDir) {
  const foundImages = new Set();
  const fixed = content.replace(
    /!\[\[笔记同步助手\/images\/([^\]|]+)(\|[^\]]*)?\]\]/g,
    (_, filename, alt) => {
      foundImages.add(filename);
      return `![${alt ? alt.slice(1) : filename}](${path.join(imageDir, filename)})`;
    }
  );
  return { fixed, images: [...foundImages] };
}

/** 提取视频链接
 *  > 📹 此处为视频内容（vid: wxv\_XXX），...原文查看：[...](url)
 *  注意：md 文件中下划线可能被转义为 \_
 */
function extractVideoLinks(content, articleTitle) {
  const videos = [];
  const lines = content.split('\n');
  for (const line of lines) {
    if (!line.includes('📹')) continue;
    // vid 可能含转义下划线 wxv\_2765...
    const vidMatch = line.match(/vid:\s*(wxv[\w\\]+)/);
    const urlMatch = line.match(/\]\((https?:\/\/[^)\s]+)\)/);
    if (vidMatch && urlMatch) {
      // 还原转义的下划线
      const vid = vidMatch[1].replace(/\\+_/g, '_').replace(/\\/g, '');
      videos.push({
        vid,
        url: urlMatch[1],
        title: articleTitle || '未命名',
        description: '', // 蒸馏 LLM 会填写
      });
    }
  }
  return videos;
}

/** 读取单个图片为 base64（最大 3MB，超过则跳过）*/
async function readImageBase64(imgPath) {
  try {
    const stat = await fs.stat(imgPath);
    if (stat.size > 3 * 1024 * 1024) {
      console.warn(`   ⚠ 图片过大，跳过多模态注入: ${path.basename(imgPath)} (${(stat.size/1024).toFixed(0)}KB)`);
      return null;
    }
    const buf = await fs.readFile(imgPath);
    const ext = path.extname(imgPath).toLowerCase();
    const mediaType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
    return { data: buf.toString('base64'), media_type: mediaType, filename: path.basename(imgPath) };
  } catch {
    return null;
  }
}

/** 读取 wiki/sources/<slug>-*.md（Stage 2 文本来源）
 *  返回: { sources: [{ref, body, images, videos}], allImageFilenames: Set, allVideos: [] }
 *  注：images/videos 从 source body 中提取（主要是 📹 标记和图片文件名引用）
 */
async function readWikiSources(slug) {
  const sources = [];
  const allImageFilenames = new Set();
  const allVideos = [];

  let entries;
  try {
    entries = await fs.readdir(WIKI_SOURCES_DIR, { withFileTypes: true });
  } catch {
    return { sources, allImageFilenames, allVideos };
  }

  // 只取 <slug>-src-*.md 文件
  const matched = entries.filter(e =>
    !e.isDirectory() && e.name.startsWith(`${slug}-src-`) && e.name.endsWith('.md')
  ).sort((a, b) => a.name.localeCompare(b.name));

  for (const ent of matched) {
    const full = path.join(WIKI_SOURCES_DIR, ent.name);
    const raw = await fs.readFile(full, 'utf8');
    const { data: meta, content: body } = matter(raw);

    // 提取 body 中的视频引用（📹 vid: wxv_XXX | url: https://... 格式）
    const videos = [];
    for (const line of body.split('\n')) {
      if (!line.includes('📹') && !line.includes('vid: wxv')) continue;
      const vidMatch = line.match(/vid:\s*(wxv[\w_]+)/);
      const urlMatch = line.match(/url:\s*(https?:\/\/\S+)/);
      if (vidMatch && urlMatch) {
        videos.push({ vid: vidMatch[1], url: urlMatch[1], title: meta.title || ent.name, description: '' });
        allVideos.push({ vid: vidMatch[1], url: urlMatch[1], title: meta.title || ent.name, description: '' });
      }
    }

    sources.push({
      ref: `wiki/sources/${ent.name}`,
      body,
      images: [],
      videos,
      meta,
    });
  }

  return { sources, allImageFilenames, allVideos };
}

// 保留旧版 readRawDir 供调试/强制读 raw 场景（加 --raw 参数时使用）
async function readRawDir(slug) {
  const dir = path.join(RAW_DIR, slug);
  const imageDir = path.join(dir, IMAGE_ASSET_DIRNAME);
  const activityDir = path.join(dir, ACTIVITY_DIRNAME);
  const sources = [];
  const allImageFilenames = new Set();
  const allVideos = [];

  async function walk(d) {
    let entries;
    try { entries = await fs.readdir(d, { withFileTypes: true }); }
    catch { return; }

    for (const ent of entries) {
      const full = path.join(d, ent.name);
      if (ent.isDirectory()) {
        if (full === imageDir || full === activityDir) continue;
        await walk(full);
        continue;
      }
      if (!ent.name.endsWith('.md')) continue;
      const raw = await fs.readFile(full, 'utf8');
      const rel = path.relative(RAW_DIR, full).replace(/\\/g, '/');
      const { fixed, images } = fixImageLinks(raw, IMAGE_ASSET_DIRNAME);
      images.forEach(img => allImageFilenames.add(img));
      const articleTitle = ent.name.replace(/\.md$/, '');
      const videos = extractVideoLinks(raw, articleTitle);
      allVideos.push(...videos);
      sources.push({ ref: `raw/${rel}`, body: fixed, images, videos });
    }
  }

  await walk(dir);
  return { sources, allImageFilenames, allVideos };
}

/** 读取 活动/ 子目录
 *  每个活动文件夹 → { name, description, images: [filename] }
 */
async function readActivities(slug) {
  const activityDir = path.join(RAW_DIR, slug, ACTIVITY_DIRNAME);
  const activities = [];

  let activityFolders;
  try {
    activityFolders = await fs.readdir(activityDir, { withFileTypes: true });
  } catch {
    return activities; // 无活动目录
  }

  for (const ent of activityFolders) {
    if (!ent.isDirectory()) continue;
    const folderPath = path.join(activityDir, ent.name);
    const files = await fs.readdir(folderPath, { withFileTypes: true });

    // 读取文字介绍
    let description = '';
    const textFile = files.find(f => !f.isDirectory() && (f.name.endsWith('.txt') || f.name.endsWith('.md')));
    if (textFile) {
      description = await fs.readFile(path.join(folderPath, textFile.name), 'utf8');
    }

    // 收集图片文件名
    const imageFiles = files
      .filter(f => !f.isDirectory() && /\.(jpg|jpeg|png|webp)$/i.test(f.name))
      .map(f => f.name);

    activities.push({
      name: ent.name,
      description: description.trim(),
      imageFiles, // 相对于活动文件夹的文件名
      folderPath,
    });
  }

  return activities;
}

/** 选最多 N 张图片加载为 base64（优先活动图片，其次资产目录） */
async function loadImagesForMultimodal(slug, allImageFilenames, activities, maxTotal = 8) {
  const imageDir = path.join(RAW_DIR, slug, IMAGE_ASSET_DIRNAME);
  const loaded = [];

  // 1. 先加活动图片（每个活动取 1 张）
  for (const act of activities) {
    if (loaded.length >= maxTotal) break;
    if (act.imageFiles.length === 0) continue;
    const imgPath = path.join(act.folderPath, act.imageFiles[0]);
    const img = await readImageBase64(imgPath);
    if (img) loaded.push({ ...img, context: `活动: ${act.name}` });
  }

  // 2. 再从图片资产目录补充
  const assetFilenames = [...allImageFilenames];
  for (const filename of assetFilenames) {
    if (loaded.length >= maxTotal) break;
    const imgPath = path.join(imageDir, filename);
    const img = await readImageBase64(imgPath);
    if (img) loaded.push({ ...img, context: '素材图片' });
  }

  return loaded;
}

// ============================================================
// 蒸馏主流程
// ============================================================

async function distill(slug) {
  console.log(`\n[distill] ▶ ${slug}`);

  // 1. 读实体骨架
  const entityPath = path.join(ENTITIES_DIR, `${slug}.md`);
  let entityRaw;
  try {
    entityRaw = await fs.readFile(entityPath, 'utf8');
  } catch {
    throw new Error(`找不到实体骨架: ${entityPath}\n请先创建 wiki/entities/${slug}.md`);
  }
  const { data: meta, content: entityBody } = matter(entityRaw);
  const isPlaceholder = !!meta.placeholder;
  const personKind = meta.person_kind || 'host';
  const spaceSlug = meta.space_slug || meta.x_xianjian_space_slug || '';

  console.log(`   person_kind: ${personKind} | space: ${spaceSlug || '(无)'} | placeholder: ${isPlaceholder}`);

  // 2. 读 wiki/sources/ 知识层（Stage 2 文本来源）
  //    若加 --raw 参数，则退回读 raw/<slug>/ 原始文件（调试用）
  const useRaw = process.argv.includes('--raw');
  const { sources, allImageFilenames, allVideos } = useRaw
    ? await readRawDir(slug)
    : await readWikiSources(slug);
  if (sources.length === 0 && !isPlaceholder) {
    const srcDesc = useRaw ? `raw/${slug}/ 无 .md 素材文件` : `wiki/sources/ 无 ${slug}-src-*.md 文件（请先运行 wiki ingest）`;
    console.warn(`   ⚠ WARN: ${srcDesc}`);
    if (!process.argv.includes('--force')) {
      console.error(`   中止。加 --force 可强制继续，--raw 可退回读 raw/ 目录。`);
      process.exit(1);
    }
  }
  const srcLabel = useRaw ? 'raw 素材' : 'wiki/sources';
  console.log(`   ${srcLabel}: ${sources.length} 个文件 | 图片资产: ${allImageFilenames.size} 张 | 视频: ${allVideos.length} 个`);

  // 3. 读活动目录
  const activities = await readActivities(slug);
  console.log(`   活动: ${activities.length} 个`);

  // 4. 读关联空间
  let spaceBody = '';
  if (spaceSlug) {
    try {
      spaceBody = await fs.readFile(path.join(SPACES_DIR, `${spaceSlug}.md`), 'utf8');
      console.log(`   空间: ${spaceSlug} ✓`);
    } catch {
      console.warn(`   ⚠ 找不到空间文件: wiki/spaces/${spaceSlug}.md`);
    }
  }

  // 5. （Steward 专用）读 L1/L2 文件
  let l1Text = '', l2Text = '';
  if (personKind === 'steward') {
    try { l1Text = await fs.readFile(path.join(CARDS_DIR, `${slug}.l1-facts.json`), 'utf8'); console.log('   L1 ✓'); }
    catch { console.warn('   ⚠ L1 facts 未就绪，请先运行 extract-facts.js'); }
    try { l2Text = await fs.readFile(path.join(CARDS_DIR, `${slug}.l2-chapters.json`), 'utf8'); console.log('   L2 ✓'); }
    catch { console.warn('   ⚠ L2 chapters 未就绪，请先运行 distill-chapters.js'); }
  }

  // 6. 加载图片（多模态，Claude 专用）
  //    图片始终从 raw/<slug>/图片资产/ 扫描（不依赖 wiki/sources 中的图片引用）
  const provider = process.env.LLM_PROVIDER || 'claude';
  let loadedImages = [];
  if (provider === 'claude' && !isPlaceholder) {
    // 若 allImageFilenames 为空（wiki/sources 模式），扫描 raw/图片资产/ 目录
    let imageFilenames = allImageFilenames;
    if (imageFilenames.size === 0) {
      const imageDir = path.join(RAW_DIR, slug, IMAGE_ASSET_DIRNAME);
      try {
        const imgEntries = await fs.readdir(imageDir);
        imgEntries.filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f)).forEach(f => imageFilenames.add(f));
      } catch { /* 无图片目录 */ }
    }
    loadedImages = await loadImagesForMultimodal(slug, imageFilenames, activities, 8);
    console.log(`   多模态图片: ${loadedImages.length} 张将注入 prompt`);
  } else if (provider !== 'claude') {
    console.log(`   (非 Claude provider，跳过图片注入)`);
  }

  // 7. 构建 user message content（文本 + 图片混合）
  const textPart = isPlaceholder
    ? buildPlaceholderPrompt({ slug, personKind, spaceSlug, entityBody, sources, activities, allVideos })
    : buildFullPrompt({ slug, personKind, spaceSlug, entityBody, spaceBody, sources, activities, allVideos, l1Text, l2Text });

  let messageContent;
  if (loadedImages.length > 0) {
    // 多模态 content blocks
    const blocks = [{ type: 'text', text: textPart }];
    for (const img of loadedImages) {
      blocks.push({ type: 'text', text: `\n[图片: ${img.context} — ${img.filename}]` });
      blocks.push({ type: 'image_base64', media_type: img.media_type, data: img.data });
    }
    messageContent = blocks;
  } else {
    messageContent = textPart;
  }

  // 8. 调 LLM
  console.log(`   调用 LLM (${provider})...`);
  const { text } = await chat({
    system: DISTILL_SYSTEM,
    messages: [{ role: 'user', content: messageContent }],
    maxTokens: 8192,
  });

  // 9. 解析 JSON
  let jsonText = text.trim();
  const fence = jsonText.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  if (fence) jsonText = fence[1].trim();

  let card;
  try {
    card = JSON.parse(jsonText);
  } catch {
    console.error('[distill] ✗ JSON parse 失败，原始输出（前 2000 字）：');
    console.error(text.slice(0, 2000));
    throw new Error('JSON parse failed');
  }

  // 10. 归档旧版本
  const outPath = path.join(CARDS_DIR, `${slug}.json`);
  try {
    const prev = await fs.readFile(outPath, 'utf8');
    const archivePath = path.join(CARDS_DIR, '_archive', `${slug}-${Date.now()}.json`);
    await fs.mkdir(path.dirname(archivePath), { recursive: true });
    await fs.writeFile(archivePath, prev);
    console.log(`   旧版本已归档`);
  } catch { /* 首次蒸馏 */ }

  // 11. 补元数据 + 确保 videos 字段在 card 中
  card.x_xianjian_meta = {
    distilled_at: new Date().toISOString(),
    distill_model: process.env.LLM_MODEL || 'claude-sonnet-4-5',
    distill_version: 'v0.4',
    source_mode: useRaw ? 'raw' : 'wiki-sources',
    placeholder: isPlaceholder,
    source_count: sources.length,
    images_injected: loadedImages.length,
    videos_extracted: allVideos.length,
    activities_extracted: activities.length,
  };

  // 如果 LLM 没有填写 videos（可能 prompt 模板里没提炼到），手动补回
  if (!card.x_xianjian_videos || card.x_xianjian_videos.length === 0) {
    card.x_xianjian_videos = allVideos;
  }

  // 12. 写出
  await fs.mkdir(CARDS_DIR, { recursive: true });
  await fs.writeFile(outPath, JSON.stringify(card, null, 2));

  const summary = [
    `evidence_ledger: ${card.x_xianjian_evidence_ledger?.length ?? 0} 条`,
    `videos: ${card.x_xianjian_videos?.length ?? 0} 个`,
    `activities: ${card.x_xianjian_activities?.length ?? 0} 个`,
  ].join(' | ');
  console.log(`   ✓ 蒸馏完成 → ${outPath}`);
  console.log(`   ${summary}\n`);
}

// ============================================================
// Prompt 构建
// ============================================================

function buildFullPrompt({ slug, personKind, spaceSlug, entityBody, spaceBody, sources, activities, allVideos, l1Text, l2Text }) {
  const parts = [];

  parts.push(`## 实体骨架 (slug: ${slug}, person_kind: ${personKind})\n\n${entityBody}\n`);

  if (spaceBody) {
    parts.push(`## 所属空间 (slug: ${spaceSlug})\n\n${spaceBody}\n`);
  }

  if (sources.length > 0) {
    parts.push(`## 文章/朋友圈/访谈素材 (共 ${sources.length} 篇)\n`);
    for (const s of sources) {
      const videoNote = s.videos.length > 0
        ? `\n[本文包含 ${s.videos.length} 个视频: ${s.videos.map(v => v.vid).join(', ')}]`
        : '';
      parts.push(`<source ref="${s.ref}"${videoNote}>\n${s.body}\n</source>\n`);
    }
  }

  if (activities.length > 0) {
    parts.push(`\n## 活动素材 (共 ${activities.length} 个)\n`);
    for (const act of activities) {
      parts.push(`### 活动: ${act.name}\n`);
      if (act.description) parts.push(`${act.description}\n`);
      if (act.imageFiles.length > 0) {
        parts.push(`（活动图片 ${act.imageFiles.length} 张，见多模态注入）\n`);
      }
    }
  }

  if (allVideos.length > 0) {
    parts.push(`\n## 提取到的视频链接 (共 ${allVideos.length} 个)\n`);
    for (const v of allVideos) {
      parts.push(`- vid: ${v.vid} | 来源: ${v.title} | url: ${v.url}\n`);
    }
    parts.push(`请在输出的 x_xianjian_videos 中包含以上视频（补写 description 字段，50字内）。\n`);
  }

  if (l1Text) parts.push(`\n## L1 史实\n${l1Text}\n`);
  if (l2Text) parts.push(`\n## L2 章节摘要\n${l2Text}\n`);

  parts.push(`
---
## 输出要求

请输出完整蒸馏 JSON。以下字段必填：
- x_xianjian_person_kind: "${personKind}"
- x_xianjian_space_slug: "${spaceSlug}"
- x_xianjian_source_refs: ${JSON.stringify(sources.map(s => s.ref))}
- x_xianjian_videos: （从素材提取，见上方视频列表，补写 description）
- x_xianjian_activities: [{ name, description, photo_count }]（从活动素材提取）
- x_xianjian_evidence_ledger: 至少 5 条（基于素材中有明确来源的事实）
`);
  return parts.join('\n');
}

function buildPlaceholderPrompt({ slug, personKind, spaceSlug, entityBody, sources, activities, allVideos }) {
  return `
## 实体骨架 (slug: ${slug}, person_kind: ${personKind}, 占位模式)

${entityBody}

## 素材概要
- ${sources.length} 篇文章/朋友圈
- ${activities.length} 个活动
- ${allVideos.length} 个视频

---
占位模式：输出简化版 persona-card。
- description: 100 字内
- first_mes: 50 字内
- mes_example: 1 段
- evidence_ledger: 空数组 []
- system_prompt: "我是${slug}的早期版本数字分身，仅能回答基础问题。完整版本正在蒸馏中。"
- x_xianjian_person_kind: "${personKind}"
- x_xianjian_space_slug: "${spaceSlug}"
- x_xianjian_source_refs: ${JSON.stringify(sources.map(s => s.ref))}
- x_xianjian_videos: ${JSON.stringify(allVideos)}
- x_xianjian_activities: ${JSON.stringify(activities.map(a => ({ name: a.name, description: a.description.slice(0, 100), photo_count: a.imageFiles.length })))}
`;
}

// ============================================================
// 入口
// ============================================================

const slug = process.argv[2];
if (!slug) {
  console.error('Usage: npm run distill <slug> [--force]');
  console.error('Examples:');
  console.error('  npm run distill xiaomei');
  console.error('  npm run distill qianyu     # entity.md 含 placeholder: true');
  console.error('  npm run distill longxun    # steward 模式（需要 L1/L2 就绪）');
  process.exit(1);
}

distill(slug).catch(e => {
  console.error('[distill] 失败:', e.message);
  process.exit(1);
});
