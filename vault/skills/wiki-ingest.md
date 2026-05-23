---
name: xianjian-wiki-ingest
description: 元家乡 2050 项目的 wiki 编译技能。将 raw/<slug>/ 下的原始素材编译进 wiki 知识层（sources/entities/activities/works）。基于 ai-native-company/skills/wiki/SKILL.md 框架重构，适配乡村文化 IP 数字化 schema。
parent_skill: ai-native-company/skills/wiki/SKILL.md
version: 0.1
---

# XianJian Wiki Ingest 技能

## 与父技能的关系

本技能是 `ai-native-company/skills/wiki/SKILL.md` 的 schema 重构版。核心原则一致：
- `raw/` 只读，不改写语义
- `wiki/` 由 LLM 维护，是 single source of truth
- 所有 wiki 页面必须可追溯到 raw/ 来源
- 自动优先执行确定性工作

**差异点**：实体类型、目录结构、frontmatter schema 针对乡村文化 IP 重新设计。

---

## 目录结构

```
vault/
├── raw/<person-slug>/          # 原始素材（只读）
│   ├── *.md                    # 公众号文章、朋友圈、访谈
│   ├── 图片资产/*.jpg           # 图片（ingest 不处理，distill 多模态用）
│   └── 活动/<活动名>/           # 每个活动：介绍.txt + 图片
│
├── wiki/                       # 知识层（ingest 输出，distill 输入）
│   ├── village/<slug>.md       # 村庄实体
│   ├── entities/<slug>.md      # 人物实体（骨架 + 编译事实）
│   ├── spaces/<slug>.md        # 空间实体（手写为主）
│   ├── sources/<id>.md         # 可引用摘录（Evidence Panel 展示层）
│   ├── activities/<space>/<date>-<slug>.md  # 活动条目
│   ├── works/<id>.md           # 作品条目
│   └── historical_events/      # 村史事件（MVP2 从《乡村造梦记》提取）
│
└── persona-cards/<slug>.json   # distill 输出（Stage 2，不在本 skill 范围内）
```

---

## 两阶段流程

```
Stage 1: Wiki Ingest（本 skill）
  raw/<slug>/ ──────────────────────────────────►  wiki/sources/<slug>-*.md
                                               ►  wiki/entities/<slug>.md （enriched）
                                               ►  wiki/activities/<space>/*.md
                                               ►  wiki/works/*.md

Stage 2: Distillation（vault/scripts/distill.js）
  wiki/sources/<slug>-*.md  ┐
  wiki/entities/<slug>.md   ├──► persona-cards/<slug>.json
  wiki/spaces/<slug>.md     │
  raw/<slug>/图片资产/       ┘ （多模态，仅图片）
```

**关键边界**：distill.js 不再直接读 raw/*.md；raw/ 在 Stage 2 只提供图片。

---

## Ingest 操作规范

### 触发方式
- "ingest xiaomei 的原始素材"
- "把 raw/xiaomei/ 编译进 wiki"
- "更新小梅桩主的知识库"

### 执行步骤

**Step 1：读取 raw/<slug>/ 所有素材**
- 递归读取所有 .md 文件（跳过 图片资产/ 和 活动/）
- 读取 活动/ 下各子文件夹的 .txt
- 记录图片文件名（不读内容，ingest 不处理图片）
- 提取视频链接（`📹 vid: wxv_XXX` 格式）

**Step 2：生成 wiki/sources/ 可引用摘录**

每个源文件（公众号文章、访谈）提取 2-5 条最具代表性的引用：
- 原话段落（非摘要改写）
- 每条引用标注来源文件名 + 主题 tag
- 只选能支撑 persona 核心特征的段落（证据阈值：一条引用 = 一个 evidence_ledger claim 的 source_ref）

frontmatter 格式：
```yaml
---
type: source
id: <slug>-src-<NNN>       # e.g. xiaomei-src-001
person_slug: xiaomei
source_file: raw/xiaomei/六年龙潭岁月：在风吹过的山坡上歌唱.md
source_type: article        # article | moments | interview | video
title: "（原文标题）"
date: YYYY-MM-DD            # 文章发布日期或采集日期
tags: [接待理念, 空间美学]  # 主题标签
evidence_for: [c-001, c-002]  # 预期支撑的 claim_id（distill 时填充）
status: active
created: 2026-05-21
---
```

**Step 3：丰富 wiki/entities/<slug>.md**

在已有骨架基础上，追加从 raw 中提取的事实段落：
```markdown
## 编译事实（ingest 产出，基于 raw/ 素材）

### 生平时间线
- 2018 年：…（来源：[raw/xiaomei/xxx.md]）

### 核心价值观（有证据的陈述）
- （可观察行为，不写形容词）

### 代表性原话（供 mes_example 参考）
> "（原话）"（来源：sources/xiaomei-src-001.md）

### 视频资产
- vid: wxv_XXX → [url]（描述）
```

**注意**：不覆盖 entity 骨架中的"蒸馏指令补充"和"不要让 AI 编造的内容"部分。

**Step 4：生成 wiki/activities/<space>/<date>-<slug>.md**

从 raw/<slug>/活动/ 每个子文件夹提取一个活动条目：
```yaml
---
type: activity
slug: <date>-<name-slug>
space_slug: xiaomeizhuang
host_person_slug: xiaomei
title: "（活动名）"
date: YYYY-MM-DD            # 从文件夹名或内容推断
status: past | upcoming
tags: [...]
photo_count: N              # 活动文件夹中的图片数
source_file: raw/xiaomei/活动/<活动名>/活动介绍.txt
---
```

**Step 5：生成 wiki/works/<id>.md**

从 raw 素材中识别作品（微电影、画作、歌曲等）：
```yaml
---
type: work
slug: <id>
person_slug: xiaomei
space_slug: xiaomeizhuang
title: "（作品名）"
medium: 微电影 | 水彩 | 原创歌曲
year: YYYY
tags: [...]
video_vid: wxv_XXX          # 若是视频
video_url: https://...
source_file: raw/xiaomei/xxx.md
---
```

**Step 6：更新 wiki/log.md**
```markdown
## [YYYY-MM-DD] ingest | <slug> 原始素材编译
- 读取 raw 文件：N 篇
- 新建 sources：N 条
- 新建/更新 entities：xiaomei.md
- 新建 activities：N 个
- 新建 works：N 个
- 视频提取：N 个
```

---

## 质量约束

1. **evidence 阈值**：wiki/sources/ 只放原话，不放 LLM 改写的摘要
2. **不扩展 raw 的信息**：ingest 不能推断 raw 中没有的事实
3. **不覆盖人工骨架**：entity 的 frontmatter 和"蒸馏指令补充"由人工维护
4. **来源可追溯**：每个 sources/ 条目的 source_file 字段必须指向实际存在的 raw/ 文件
5. **活动日期推断**：文件夹名含日期则直接用；否则从内容推断，无法确定则留 `date: unknown`

---

## 与 distill.js 的接口约定

Stage 2 读取的来源：
- `wiki/entities/<slug>.md`（骨架 + 编译事实）
- `wiki/sources/<slug>-*.md`（所有可引用摘录）
- `wiki/spaces/<spaceSlug>.md`（空间信息）
- `raw/<slug>/图片资产/*.jpg`（仅图片，多模态）

`distill.js` 将 `wiki/sources/<slug>-*.md` 的 `id` 作为 `evidence_ledger[].source_refs` 的值，实现 Evidence Panel 的"点 claim → 看原文"功能。
