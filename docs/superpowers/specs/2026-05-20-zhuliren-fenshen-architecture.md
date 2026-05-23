# 架构设计 Spec：主理人数字分身（黑客松 Demo）

**日期**：2026-05-20
**作者**：黄喆（产品 + 实现）
**状态**：草稿 v1，待 review
**关联业务 spec**：`2026-05-20-zhuliren-fenshen-business.md`

---

## 0. 设计原则

1. **48 小时单人交付**：所有技术选型以 vibe-coding 友好为最高优先级
2. **wiki 是 single source of truth**：markdown 文件 + frontmatter，人和模型都可读
3. **不引入向量库、不做 RAG**：Claude 200k context 内全塞，靠 prompt cache 控成本
4. **反幻觉三件套**：grounded prompt + evidence_ledger + abstain
5. **LLM provider 可现场切换**：手写 50 行 wrapper，兼容 Claude/DeepSeek/OpenAI
6. **数据库完全独立**：不与作者已有的 `/mnt/wiki-vault-win` 打通
7. **村管家是方案设计师，不是搜索引擎**：通过多轮挖需求 + 画画像 + 组合 IP/空间/服务，输出可执行的定制旅居方案（详见 §6）
8. **AI 立场：释放人，不替代人**：本项目所有 AI 能力的设计目标是把主理人从重复事务中解放，回到创造性的生活和工作。这一立场在 prompt、UX 文案、演示叙事中保持一致

---

## 1. 技术栈总览

| 层 | 选型 | 理由 |
|----|------|------|
| 前端 | Vite + React 18 + Tailwind | AI 辅助编码最成熟、零配置启动 |
| 后端 | Node.js + Express（单文件） | 与前端同栈，部署简单 |
| LLM | 手写 wrapper，默认 Claude Sonnet 4.6，备用 DeepSeek | Anthropic prompt cache 折扣 90%，DeepSeek OpenAI 兼容协议作为兜底 |
| 数据 | 文件系统 markdown vault + JSON persona-cards | 透明、可审计、Git 可托管 |
| 部署 | 前端 Vercel + 后端 Render/Railway | 30 分钟可上线，二维码现场体验 |
| 任务追踪 | git + Markdown spec | 无外部依赖 |

**显式拒绝**：LiteLLM、向量数据库、Khoj、LangChain、SillyTavern、Letta、Mem0、Dify、Coze。

---

## 2. 整体架构图

```
┌────────────────────────────────────────────────────────────────┐
│                浏览器 (Vite + React + Tailwind)                │
│                                                                │
│  ┌─────────────────┐  ┌──────────────────┐  ┌──────────────┐ │
│  │ 村地图层        │  │ 空间内页         │  │ 订单确认     │ │
│  │  - 文创熙岭底图 │  │  - 活动 tab      │  │  - 商品/金额 │ │
│  │  - 3 个点位     │  │  - 作品 tab      │  │  - 二维码    │ │
│  │  - 高亮联动     │  │  - 主理人对话    │  │  - 订单号    │ │
│  │  - 村管家面板   │  │  - 商品抽屉      │  │              │ │
│  └────────┬────────┘  └────────┬─────────┘  └──────────────┘ │
│           │ /api/chat           │ /api/chat                   │
│           │ agent=steward       │ agent=<slug>                │
└───────────┼─────────────────────┼─────────────────────────────┘
            │                     │
            ▼                     ▼
┌────────────────────────────────────────────────────────────────┐
│              后端 (Node Express 单文件 ~300 行)                │
│                                                                │
│  路由层:                                                       │
│    POST /api/chat                                              │
│    GET  /api/spaces                                            │
│    GET  /api/spaces/:slug/activities                           │
│    GET  /api/spaces/:slug/works                                │
│    GET  /api/spaces/:slug/products                             │
│    POST /api/orders                                            │
│                                                                │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ services/llm.js  (50 行手写 wrapper)                      │ │
│  │   chat({ system, messages, cache_marker })                │ │
│  │   provider 由 env LLM_PROVIDER 决定                       │ │
│  │   claude  → Anthropic SDK + prompt caching                │ │
│  │   deepseek → OpenAI SDK (base_url 改为 deepseek)          │ │
│  │   openai  → OpenAI SDK                                    │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ services/personaLoader.js                                 │ │
│  │   loadPersona(slug):                                      │ │
│  │     1. read vault/persona-cards/<slug>.json               │ │
│  │     2. resolve x_xianjian_source_refs[] → 读 wiki/...     │ │
│  │     3. 读 wiki/activities/<space>/*.md 按 today() 分类    │ │
│  │     4. assemble system prompt (灵魂层 + sources           │ │
│  │        + featured_activities + activity_archive)          │ │
│  │     5. 内存 cache 5 min                                   │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ services/personaAgent.js (统一抽象, 同时承载主理人与村管家) │ │
│  │   chat({ slug, message, history }):                       │ │
│  │     1. PersonaLoader.load(slug) → 拉灵魂层 + sources       │ │
│  │     2. 若 person_kind=steward:                            │ │
│  │        - 额外注入 L1 facts (history_ledger)               │ │
│  │        - 额外注入 L2 chapter_summaries                    │ │
│  │        - 处理 x_xianjian_aggregates 聚合全村摘要           │ │
│  │        - 启用 tools: [propose_itinerary]                  │ │
│  │     3. 若 person_kind=host:                               │ │
│  │        - 走默认路径 (sources + 活动 + ledger)              │ │
│  │     4. 若 person_kind=cloud-villager:                     │ │
│  │        - 走默认路径, 但 space 是 cloud 类型                │ │
│  │        - sources 多来自远程作品/线上访谈/项目说明           │ │
│  │     5. 调 LLM, 返回结果 (含 tool_use 解析)                 │ │
│  └───────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│            Vault (H:/myProject/XianJian/vault/)                │
│                                                                │
│  wiki/                ← single source of truth                 │
│   ├─ entities/        ← 人设原始描述 (蒸馏的原料)              │
│   │   ├─ xiaomei.md                                            │
│   │   ├─ gangzi.md                                             │
│   │   └─ <第三人>.md                                            │
│   ├─ sources/         ← 访谈/文章/朋友圈 (按 frontmatter 标 person)
│   │   ├─ interview-xiaomei-2026-05-19.md                       │
│   │   ├─ gongzhonghao-xiaomei-2022-spring.md                   │
│   │   ├─ moments-xiaomei-2024.md                               │
│   │   └─ ...                                                   │
│   ├─ works/           ← 代表作品 (诗/画/曲, 含元数据)           │
│   │   └─ xiaomei-painting-01.md                                │
│   ├─ spaces/          ← 空间元数据 (坐标/封面/关联主理人)        │
│   │   ├─ xiaomeizhuang.md                                      │
│   │   ├─ gangzi-studio.md                                      │
│   │   └─ <第三个>.md                                            │
│   └─ activities/      ← 活动 (按空间分子目录, frontmatter 含 date)
│       ├─ xiaomeizhuang/                                        │
│       │   ├─ 2026-05-28-tea-tasting.md                         │
│       │   └─ 2025-04-20-poetry-night.md       (历史)           │
│       ├─ gangzi-studio/                                        │
│       └─ <第三个>/                                              │
│                                                                │
│  persona-cards/       ← 蒸馏产物 (灵魂层 + evidence_ledger)    │
│   ├─ xiaomei.json                                              │
│   ├─ gangzi.json                                               │
│   ├─ <第三人>.json                                              │
│   └─ _archive/        ← Correction Log 触发的旧版本归档        │
│                                                                │
│  raw/                 ← 原始未清洗素材 (访谈 txt, HTML 等)      │
│   └─ ...                                                       │
│                                                                │
│  scripts/             ← 数据处理脚本                            │
│   ├─ normalize.js     ← 原始素材 → wiki/sources                │
│   └─ distill.js       ← wiki/entities + sources → persona-card │
└────────────────────────────────────────────────────────────────┘

(显式无: vector db, sqlite-vec, embeddings 目录)
```

---

## 3. 数据 Schema：面向乡村文化 IP 数字化的知识库（项目独立设计）

### 3.0 设计立场

本项目知识库 schema **完全独立设计**，不复用作者已有的"一人公司 wiki SKILL.md v0.8"。原因：

| 维度 | 一人公司知识库 | 本项目（乡村文化 IP） |
|------|--------------|-------------------|
| 主体 | 业务/产品/客户/方法论 | 村庄/人物/空间/事件 |
| 时间维度 | 弱 | 强（村庄发展是一条时间线） |
| 实体子类 | organization / person / product / concept_initiative | village / person / space / historical_event / intangible_heritage / scenic_spot |
| Case 体系 | industry × business_domain 二维 | 不适用（乡村是叙事而非案例） |
| 关键关系 | concept ↔ case ↔ entity | village → events / persons / spaces → activities / works |

### 3.1 实体类型与目录结构

```
vault/wiki/
 ├─ villages/                  ← 村庄级实体
 │   └─ longtang.md            (本项目唯一一个 village,但 schema 通用,可复制到其他村)
 ├─ entities/                  ← 人物实体
 │   ├─ xiaomei.md             (主理人)
 │   ├─ gangzi.md              (主理人)
 │   ├─ <third>.md             (主理人,占位)
 │   ├─ steward.md             (村管家"龙寻",虚构人设)
 │   └─ historical-<name>.md   (村史中出现的关键人物,如林正禄等)
 ├─ spaces/                    ← 物理空间
 │   ├─ xiaomeizhuang.md
 │   ├─ gangzi-studio.md
 │   └─ <third-space>.md
 ├─ historical_events/         ← 历史事件 (本项目新增)
 │   ├─ 2015-first-artists-arrive.md
 │   ├─ 2017-cultural-village-recognition.md
 │   └─ ...
 ├─ intangible_heritage/       ← 非遗项目 (本项目新增)
 │   ├─ pingnan-mubahuiqu.md   (平南目板会曲)
 │   ├─ red-yeast-wine.md      (红曲黄酒)
 │   └─ ...
 ├─ scenic_spots/              ← 景点 (本项目新增)
 │   ├─ baishuiyang.md         (白水洋)
 │   ├─ wan-an-bridge.md       (万安桥)
 │   └─ longtang-village-itself.md
 ├─ sources/                   ← 原始素材
 │   ├─ interview-xiaomei-2026-05-19.md
 │   ├─ gongzhonghao-xiaomei-2022-spring.md
 │   ├─ moments-xiaomei-2024.md
 │   ├─ longtang-zaomeng-ji-ch-01.md   ← 《龙潭造梦记》章节(本项目新增)
 │   ├─ longtang-zaomeng-ji-ch-02.md
 │   └─ ... (约 20-30 个章节)
 ├─ works/                     ← 代表作品
 │   └─ xiaomei-painting-01.md
 └─ activities/                ← 活动
     ├─ xiaomeizhuang/
     ├─ gangzi-studio/
     └─ <third-space>/
```

### 3.1.1 `wiki/villages/<slug>.md`（村庄实体，新增）

```yaml
---
type: village
slug: longtang
name: 龙潭村
location:
  county: 屏南县
  city: 宁德市
  province: 福建省
  coordinates: [27.0, 119.0]   # 大致坐标, 仅供参考
established_era: 历史悠久, 具体不详
ai-first: true
---

## 给后续 Claude 的说明
龙潭村作为本项目的核心载体, 此页是它的实体描述. 本页 frontmatter
含村庄结构化元数据, body 含发展时间线和关键叙事.

## 基本信息
- 行政归属: 福建省宁德市屏南县熙岭乡
- 定位: 国家乡村振兴示范点, 学习强国宣传案例
- 现住人口: <填具体数字, 或留空>
- 新村民数量: <估算>
- 空间数量: <估算>

## 发展时间线
- 2015: 林正禄老师等人开始引入艺术家入驻 [[wiki/historical_events/2015-first-artists-arrive]]
- 2017: ...
- 2019: 小梅庄主 [[wiki/entities/xiaomei]] 入驻
- 2020-2023: 文创村落成型期
- 2024: 数字游民基地 138 建立
- 2026 (现在): 黑客松 + 数字化探索

## 关键人物 (按村史出现顺序)
- [[wiki/entities/historical-lin-zhenglu]]   (林正禄, 村庄文化复兴发起人)
- [[wiki/entities/xiaomei]]                  (小梅庄主, 早期新村民代表)
- [[wiki/entities/yuange]]                   (源哥, 6 年新村民, 思想者)
...

## 关联空间
- [[wiki/spaces/xiaomeizhuang]]
- [[wiki/spaces/gangzi-studio]]
- [[wiki/spaces/138-base]]
...

## 关联非遗
- [[wiki/intangible_heritage/red-yeast-wine]]
- [[wiki/intangible_heritage/wumi-fan]]
...

## 关联景点
- [[wiki/scenic_spots/longtang-village-itself]]   (村庄本身就是 5A 候选)
- [[wiki/scenic_spots/baishuiyang]]               (周边)
...
```

### 3.1.2 `wiki/entities/<slug>.md`（人物实体，字段细化）

人物实体分两个子类，schema 共享但具体字段强度不同：

| 子类 | 用途 | 举例 |
|------|------|------|
| `person_kind: host` | 在地主理人（实空间），已在龙潭村定居 | 小梅庄主、浅予 |
| `person_kind: cloud-villager` | 云村民（云空间），未在地，提供远程服务/IP | 黄喆（作者本人） |
| `person_kind: steward` | 村管家，虚构角色，可被蒸馏成"村导览"分身 | 龙寻 |
| `person_kind: historical` | 村史中出现的关键人物，仅作为村史 ledger 引用 | 林正禄等 |

**Host 主理人骨架示例**：

```yaml
---
type: entity
entity_kind: person
person_kind: host
slug: xiaomei
name: 小梅庄主
village: longtang
date: 2026-05-20
ai-first: true
---

## 给后续 Claude 的说明
小梅庄主的实体描述页, 用于蒸馏数字分身的灵魂层。

## 基本身份
- 性别: 女
- 居龙潭村: 6 年 (始于 2019)
- 前职业: 律师
- 现身份: 小梅庄空间主理人 + 画家
- 出生地 / 教育背景: <可空>

## 关键人生经历 (life_milestones)
- 律师阶段: <时间, 关键事>
- 转折: <为什么离开律师, 关键触发事件>
- 来龙潭: 2019, <怎么遇到龙潭、第一年做了什么>
- 建小梅庄: <时间, 一手设计的关键决策>

## 价值观核心
- 反对消费主义/标准化服务
- 重视东方与西方、自然与人文的融合
- 接待是双向匹配, 不是单向供给

## 接待风格
- 客人多时反而加价, 不卷低价
- 拒绝携程式标准化, 一切个性化
- 同频朋友愿意主动给优惠

## 说话风格特征
- 喜欢"我觉得"起头
- 节奏从容, 不堆砌
- 直接但不激烈

## 关联空间
- [[wiki/spaces/xiaomeizhuang]]

## 代表作品
- [[wiki/works/xiaomei-painting-01]]
- [[wiki/works/xiaomei-painting-02]]

## 关键活动
- [[wiki/activities/xiaomeizhuang/2026-05-28-tea-tasting]]
- [[wiki/activities/xiaomeizhuang/2025-04-20-poetry-night]]

## 关联源
- [[wiki/sources/interview-xiaomei-2026-05-19]]
- [[wiki/sources/gongzhonghao-xiaomei-2022-spring]]
- [[wiki/sources/moments-xiaomei-2024]]

## 在村庄中的角色
- 早期新村民代表
- 见证了龙潭村从空村到文创村的全过程
- 在 [[wiki/historical_events/...]] 中出现

## 蒸馏指令补充 (给 distill.js 看的)
- mes_example 必须从访谈原话改编, 不许凭空发明
- description / personality 各控制在 200 字以内
- evidence_ledger 每条 claim 必须挂 ≥2 个 source_id 才能标 confidence: high
```

**Steward 村管家骨架示例**：

```yaml
---
type: entity
entity_kind: person
person_kind: steward
slug: steward
name: 龙寻
village: longtang
is_fictional: true              # 重要: 标明虚构角色
date: 2026-05-20
ai-first: true
---

## 给后续 Claude 的说明
龙寻是本项目设定的虚构村管家角色, 不对应任何真实人物.
它的灵魂层是设计/虚构的, 但它讲述的村史内容必须真实可考(grounded 在 sources).

## 角色设定
- 身份: 在龙潭村住了 10 年的"数字村民"
- 性别: 中性 (默认用"它"或不强调性别)
- 性格: 见多识广、热情但不聒噪、对村史如数家珍、对访客真诚关心
- 价值观: 信奉"AI 释放人, 不替代人"; 帮主理人挡掉错配客人; 帮访客找到同频连接

## 说话风格
- 第一人称用"我"
- 介绍村史时偏叙事感, 像讲故事
- 挖访客需求时用追问 + 同理
- 推荐方案时具体、有理由、不含糊
- 偶尔自称"村管家", 不过度卖萌

## 知识范围
- 龙潭村全部公开历史 (来自 sources/longtang-zaomeng-ji-ch-*.md 等)
- 全部空间元数据 (运行时自动聚合)
- 全部主理人 skills 摘要 (运行时自动聚合)
- 全部 upcoming 活动 (运行时自动聚合)

## 行为边界
- 史实问答: 必须 grounded 在 history_ledger 或 chapter_summaries
- 方案设计: 必须组合已注入的空间和主理人, 不创造不存在的服务
- 敏感话题: 见"敏感话题清单"段落
- 商业承诺: 不替主理人定价, 不替主理人确认时间

## 敏感话题清单 (运行时硬约束)
- 政治评价: 礼貌绕开 "这个我不便评价"
- 主理人之间的比较负面话: 绝不参与
- 与其他村庄的对比 (袁家村等): 仅讲事实, 不预言
- 政府补贴具体金额: 没公开数据就 abstain

## 蒸馏指令补充
- description / personality 是设计的, 不依赖 ledger
- 但 mes_example 必须基于真实场景 (访客可能问什么), 不要发明不存在的村史细节
```

### 3.1.3 `wiki/spaces/<slug>.md`（空间实体）

空间有两种 `space_kind`：

| `space_kind` | 含义 | 在地图上视觉 |
|--------------|------|-------------|
| `physical` | 在地实体空间，有真实坐标和房屋 | 实心圆点（黑色），清晰边缘 |
| `cloud` | 云空间，云村民提供远程服务的虚拟据点 | 虚化光晕（白银色），半透明 |

**实空间示例**：

```yaml
---
type: space
space_kind: physical
slug: xiaomeizhuang
name: 小梅庄
village: longtang
host_person_slug: xiaomei
map_position: { x: 38, y: 64 }     # 百分比坐标 (相对底图)
cover_image: /images/xiaomeizhuang-cover.jpg
style_keywords: [非标, 自然花园, 主理人长居, 独栋]
rooms_total: 4
rooms_open_to_nomads: 2
short_pitch: "前律师建的非标民宿, 重视客人质量过于数量"
established_year: 2019
ai-first: true
---

## 空间介绍

<200-400 字介绍, 给村管家路由用 + 空间内页头部用>

## 历史背景

<空间怎么来的, 哪一年建的, 关键改造节点; 给村管家做"空间史"答疑用>

## 当前活动
- [[wiki/activities/xiaomeizhuang/2026-05-28-tea-tasting]]

## 服务清单
- 住宿 (4 房间, 2 房间长租给数字游民)
- 春茶分享会
- 一对一空间美学导览
- 庄主作品鉴赏
```

**云空间示例**：

```yaml
---
type: space
space_kind: cloud
slug: huangzhe-ai-studio
name: 黄喆的 AI 原生工作室
village: longtang                  # 挂在龙潭村的云空间板块
host_person_slug: huangzhe
map_position: { x: 72, y: 22 }     # 地图上虚化位置 (避开实空间区)
cover_image: /images/huangzhe-cloud-cover.jpg  # 抽象视觉, 非实景
style_keywords: [云空间, AI 原生, 远程协作, 跨城市]
short_pitch: "AI 原生开发者的云空间, 提供主理人数字分身蒸馏与 AI 转型咨询"
established_year: 2026
ai-first: true
---

## 空间介绍

这是黄喆作为云村民在元家乡 2050 的虚拟空间. 物理上他还在北京,
但通过本项目蒸馏出的云分身, 已经入驻了龙潭村的云空间板块.

## 提供的远程服务

- 主理人数字分身蒸馏 (远程协作, 4-7 天交付)
- AI 转型咨询 (1 对 1, 30 分钟 / 90 分钟)
- AI 原生开发陪跑 (按项目计费)

## 与在地空间的潜在合作

- 给小梅庄主蒸馏更深的分身 (本项目就是起点)
- 帮 138 基地的浅予也搭一个 AI 数字管家
- 远程参与龙潭村线上活动 (录播 + 直播评论)
```

### 3.1.4 `wiki/historical_events/<id>.md`（历史事件，新增）

```yaml
---
type: historical_event
slug: 2015-first-artists-arrive
title: 林正禄首批引入艺术家入驻龙潭村
village: longtang
date: 2015
# 多年期事件使用:
# date_start: 2015-01
# date_end: 2017-12
significance: high              # high | medium | low (用于摘要展示优先级)
related_persons:
  - historical-lin-zhenglu
  - xiaomei                     # 受这个事件影响的现在的主理人
related_spaces:
  - xiaomeizhuang
related_sources:
  - longtang-zaomeng-ji-ch-03
  - longtang-zaomeng-ji-ch-05
ai-first: true
---

## 事件描述

<2-5 段, 描述这个事件的背景、过程、影响; 引用原文>

## 引用原文片段

> "..."  [源:longtang-zaomeng-ji-ch-03, 页 45]
```

### 3.1.5 `wiki/intangible_heritage/<id>.md`（非遗项目，新增）

```yaml
---
type: intangible_heritage
slug: red-yeast-wine
name: 红曲黄酒
village: longtang                  # 或所在地
heritage_level: 省级                # 国家级 | 省级 | 市级 | 县级
ai-first: true
---

## 项目简介
<红曲黄酒的酿造工艺、文化价值、与龙潭村的关系>

## 体验方式
<如何在村里体验、有哪个主理人在做、相关活动>
```

### 3.1.6 `wiki/scenic_spots/<id>.md`（景点，新增）

```yaml
---
type: scenic_spot
slug: baishuiyang
name: 白水洋
level: 5A
village_proximity: longtang        # 与本村的关系: 邻近/远途
travel_time_from_village: 1.5h     # 给村管家做行程方案用
ai-first: true
---

## 景点简介
<对游客有用的、面向"旅居方案"的介绍>

## 推荐玩法
<与龙潭村结合的玩法>
```

### 3.1.7 `wiki/sources/<id>.md`（原始素材，含新 source_type）

```yaml
---
type: source
source_type: book-chapter        # interview | article | wechat-moment | work | book-chapter (新增)
id: longtang-zaomeng-ji-ch-03
date: 2023-XX-XX                 # 书出版日期或章节相关时间
book_title: 龙潭造梦记
chapter_number: 3
page_range: "45-72"               # 原书页码 (对应你提供的扫描版)
related_persons: [historical-lin-zhenglu, xiaomei]
related_events: [2015-first-artists-arrive]
tags: [村庄起源, 早期艺术家]
ai-first: true
---

## 给后续 Claude 的说明
这是《龙潭造梦记》第 3 章 (原书页 45-72) 的清洗后正文, 由 OCR 提取 + 人工校对.
作为村管家"龙寻"史实问答的核心源材料.

---

<OCR 提取后的章节正文>
```

兼容旧的访谈/文章 source 类型：

```yaml
---
type: source
source_type: interview
id: interview-xiaomei-2026-05-19
date: 2026-05-19
person: xiaomei
tags: [接待理念, 客户错配, 价格策略, 空间美学]
title: 小梅庄主黑客松期间深度访谈
source_url: ""
ai-first: true
---

## 给后续 Claude 的说明
这份是 2026-05-19 黑客松期间对小梅庄主的现场访谈, 已清洗口语填充词,
保留原话和具体观点。可直接作为分身的引用源。

---

<清洗后的访谈正文，分段保留庄主原话>
```

### 3.1.8 `wiki/activities/<space>/<date>-<slug>.md`

```yaml
---
type: activity
space: xiaomeizhuang
title: 春茶分享会
date: 2026-05-28              # 单日活动用 date
# 多日活动则使用:
# date_start: 2026-05-25
# date_end: 2026-05-28
status_override: ~            # 罕见: 'cancelled' | 'sold_out' 等手动覆盖
host: 小梅庄主
price: "¥80/人"
capacity: 12
tags: [茶艺, 户外]
ai-first: true
---

# 春茶分享会

今年新采的明前梅家坞... <活动详细描述 / 报名方式 / 图片占位>
```

**状态分类逻辑（运行时计算，不写入文件）**：
- `today() < date` 或 `today() < date_start` → `upcoming`
- `date_start ≤ today() ≤ date_end` 或 `today() == date` → `ongoing`
- `today() > date` 或 `today() > date_end` → `past`
- `status_override` 非空 → 直接使用

### 3.1.9 `wiki/works/<id>.md`

```yaml
---
type: work
id: xiaomei-painting-01
person: xiaomei
work_type: painting         # painting | poem | song | comic | other
title: 客厅东墙的春图
date: 2024-03
image: /images/xiaomei-painting-01.jpg
ai-first: true
---

## 作品说明

<庄主自述创作背景, 或访谈中提到的相关片段>
```

### 3.2 Persona Card Schema（CCv3 + 扩展）

```jsonc
// vault/persona-cards/xiaomei.json
{
  // === CCv3 标准元数据 ===
  "spec": "chara_card_v3",
  "spec_version": "3.0",

  // === CCv3 标准灵魂层 (distill.js 生成) ===
  "name": "小梅庄主",
  "description": "在龙潭村经营小梅庄 6 年的女庄主。前律师, 跑到福建乡村建了自己的家, 庄子全部由她一手设计...",
  "personality": "佛系、不卷流量。对'要五星级服务'的城市客人保持距离, 对懂自然、懂文化的同频客人主动让利。说话从容, 喜欢用'我觉得'起头...",
  "scenario": "访客通过线上'数字分身'入口与小梅庄主预聊。庄主分身代表她接待意向客人, 过滤错配的人。",
  "first_mes": "你好。我是小梅庄主, 这是我的数字分身。庄子的事、我自己的事, 你想聊什么都可以。",
  "mes_example": "<START>\n{{user}}: 你这有空调吗?\n{{char}}: 房间有, 21 年陆续装的。其实夏天龙潭不热, 我自己晚上还盖薄被。但福州来的客人受不了...\n<END>\n<START>\n...\n<END>",
  "system_prompt": "你是小梅庄主的数字分身。\n\n[L0 硬约束 - 最高优先级]\n1. 只基于灵魂层信息、<sources> 块和 evidence_ledger 回答\n2. 不编造未发生的事件、未说过的话\n3. 引用 ledger claim 时句末标 [claim_id]\n4. confidence='medium' 时回答开头加'我记得...'\n5. confidence='low' 时明确说'这点我不是很确定'\n6. 触及 abstain_if_asked_beyond 列表的话题, 答'这个我没聊过'\n\n[语态切换]\n- <NARRATOR> 讲往事/价值观时使用 (节奏从容)\n- <OPERATOR> 答业务/价格/活动时使用 (精确)\n- <VALIDATOR> 内部自检: ledger 是否有支撑?\n\n[禁令]\n- 不堆砌客套\n- 不主动推销, 客人聊到自然处再提及商品",

  // === 扩展字段 (x_xianjian_ 前缀, CCv3 规范允许 x_ 自定义) ===
  "x_xianjian_space_slug": "xiaomeizhuang",
  "x_xianjian_skills": [
    { "name": "接待意向客人", "category": "host" },
    { "name": "美学空间分享", "category": "art" },
    { "name": "花园种植", "category": "lifestyle" },
    { "name": "原创绘画", "category": "art" }
  ],
  "x_xianjian_aesthetic_keywords": ["自然与人文相融", "东方与西方相融", "非标", "佛系"],

  // === Evidence Ledger (PersonaCite 借鉴, 反幻觉核心) ===
  "x_xianjian_evidence_ledger": [
    {
      "claim_id": "c001",
      "claim": "庄主希望接待人数少而精, 1 人优惠 / 3 人加价",
      "sources": [
        {
          "source_id": "interview-xiaomei-2026-05-19",
          "excerpt": "我对入住的人数也是很有要求的, 一个人入住我就愿意给你便宜"
        },
        {
          "source_id": "interview-xiaomei-2026-05-19",
          "excerpt": "他说 3 个人过来我就想加钱"
        }
      ],
      "confidence": "high",
      "abstain_if_asked_beyond": ["具体折扣比例", "团体定价表"]
    },
    {
      "claim_id": "c002",
      "claim": "庄主对消费主义/平台化客人保持距离",
      "sources": [
        {
          "source_id": "interview-xiaomei-2026-05-19",
          "excerpt": "现在的平台已经把一些住客养的非常的刁蛮"
        }
      ],
      "confidence": "medium",
      "abstain_if_asked_beyond": ["拒绝过的具体案例"]
    }
  ],

  // === Source Refs (运行时从 wiki/ 读全文) ===
  "x_xianjian_source_refs": [
    "wiki/sources/interview-xiaomei-2026-05-19.md",
    "wiki/sources/gongzhonghao-xiaomei-2022-spring.md",
    "wiki/sources/moments-xiaomei-2024.md",
    "wiki/works/xiaomei-painting-01.md"
  ],

  // === Correction Log (dot-skill 借鉴) ===
  "x_xianjian_corrections": [
    // 比赛期间若主理人本人参与 review, 在此追加;
    // 若无, 留空数组即可, 不影响功能
  ],

  // === 元信息 ===
  "x_xianjian_meta": {
    "distilled_at": "2026-05-21T10:00:00Z",
    "distill_model": "claude-sonnet-4-6",
    "distill_version": "v0.1",
    "vault_path": "H:/myProject/XianJian/vault"
  }
}
```

### 3.3 村管家专用 Persona Card 扩展（分层蒸馏 L0-L3）

村管家 `steward.json` 跟主理人共用 CCv3 + x_xianjian_* 基础字段，但**多两个核心扩展字段**：

```jsonc
// vault/persona-cards/steward.json (摘录关键扩展字段)
{
  // === CCv3 标准灵魂层 (L0, 永远在 prompt) ===
  "name": "龙寻",
  "description": "...",      // 虚构人设
  "personality": "...",
  "first_mes": "你好, 我是龙寻, 龙潭村的数字村管家. 第一次来吗?",
  "mes_example": "<对话样例>",
  "system_prompt": "...",   // 含 L0 硬约束 + 三语态 + 敏感话题清单

  // === 村管家分层知识引用 (本项目独创) ===
  "x_xianjian_history_ledger_ref": "vault/persona-cards/steward.l1-facts.json",
  // L1 史实摘要: 50-100 条结构化 facts, 每条挂 source + confidence
  // 永远全量进 prompt (~5-10k tokens)

  "x_xianjian_chapter_summaries_ref": "vault/persona-cards/steward.l2-chapters.json",
  // L2 章节摘要: 20-30 个章节摘要 (《龙潭造梦记》全书索引)
  // 每个 300-500 字, 含 chapter_id / 时间段 / 涉及人物 / 涉及空间 / 关键事件
  // 永远全量进 prompt (~15-25k tokens)

  // === 运行时聚合标记 (PersonaLoader 看到这些 flag 时, 额外注入) ===
  "x_xianjian_aggregates": {
    "load_all_spaces": true,           // 自动读 wiki/spaces/*.md 摘要
    "load_all_persons_skills": true,   // 自动读所有 persona-cards 的 skills/aesthetic
    "load_all_upcoming_activities": true,
    "load_all_intangible_heritage": true,   // 简短摘要
    "load_all_scenic_spots": true            // 简短摘要
  },

  // === 工具 ===
  "x_xianjian_tools": ["propose_itinerary"],

  // === 源材料 (L3, 不进 prompt, 仅作存档) ===
  "x_xianjian_source_refs": [
    "wiki/sources/longtang-zaomeng-ji-ch-01.md",
    "wiki/sources/longtang-zaomeng-ji-ch-02.md",
    // ... 全部章节原文 (20-30 篇)
  ]
}
```

**`steward.l1-facts.json` 结构** (与 evidence_ledger 同源)：

```jsonc
{
  "version": "v0.1",
  "distilled_at": "...",
  "facts": [
    {
      "fact_id": "h001",
      "fact": "林正禄于 2015 年开始引入艺术家入驻龙潭村",
      "sources": [
        {
          "source_id": "longtang-zaomeng-ji-ch-03",
          "page": 45,
          "excerpt": "原书原文..."
        }
      ],
      "confidence": "high",
      "related_persons": ["historical-lin-zhenglu"],
      "related_events": ["2015-first-artists-arrive"],
      "tags": ["村庄起源", "早期艺术家"]
    },
    {
      "fact_id": "h002",
      "fact": "...",
      "sources": [...],
      "confidence": "medium",
      ...
    }
    // 总计 50-100 条
  ]
}
```

**`steward.l2-chapters.json` 结构**：

```jsonc
{
  "version": "v0.1",
  "distilled_at": "...",
  "book_title": "龙潭造梦记",
  "chapters": [
    {
      "chapter_id": "ch-01",
      "title": "<章节标题>",
      "page_range": "1-25",
      "time_period": "2014-2016",
      "key_persons": ["historical-lin-zhenglu"],
      "key_spaces": [],
      "key_events": ["2015-first-artists-arrive"],
      "summary": "本章讲述了林正禄如何在 2015 年决定回到龙潭村, 并开始邀请第一批艺术家入驻... (300-500 字)",
      "source_id": "longtang-zaomeng-ji-ch-01"
    },
    // ... 20-30 章
  ]
}
```

### 3.4 关键 schema 决策

| 决策 | 原因 |
|------|------|
| persona-card 只存 source_refs 不存全文 | wiki 是 single source of truth；改 wiki 即生效，不必重蒸馏 |
| evidence_ledger 与 source_refs 分离 | ledger 是"被引证的精炼 claim"，refs 是"模型可访问的全部源"；前者影响生成、后者影响检索 |
| 活动不写入 persona-card | 活动有时效性，运行时按 today() 计算更新更省事 |
| 三种 confidence + abstain_if_asked_beyond | 满足"显式说不知道"，是 demo 杀手锏 |
| 三语态 in-context（非真 multi-agent） | MASCOT 思路落地为 200 tokens 的 prompt 段，避免 48h 多 agent 调试地狱 |
| 村管家用分层蒸馏 L0-L3 取代向量库 | 390 页书 OCR 后约 20-30 万 tokens, 装不进单次 prompt; 分层蒸馏可控、可审计、可演示透明 |
| L1/L2 引用单独 JSON 文件（不内联） | 避免 persona-card JSON 文件膨胀；分别可独立重蒸馏 |

---

## 4. LLM Wrapper（手写，~50 行）

### 4.1 接口约定

```js
// services/llm.js
async function chat({
  system,           // string, system prompt (含 cache 区段)
  messages,         // [{role, content}]
  cache_marker,     // optional: 标记 system prompt 中可缓存的前缀长度 (Claude only)
  tools,            // optional: tool use 强制 JSON 输出 (steward agent 用)
  max_tokens = 1024
}) {
  const provider = process.env.LLM_PROVIDER || 'claude';
  switch (provider) {
    case 'claude':   return callClaude(...);
    case 'deepseek': return callDeepSeek(...);
    case 'openai':   return callOpenAI(...);
    default: throw new Error(`Unknown provider: ${provider}`);
  }
}
```

### 4.2 三个 provider 适配

| Provider | SDK | 关键差异 |
|----------|-----|---------|
| Claude | `@anthropic-ai/sdk` | system 是顶级参数；prompt cache 用 `cache_control: { type: 'ephemeral' }` 标记 |
| DeepSeek | `openai` (base_url 改为 `https://api.deepseek.com/v1`) | OpenAI 兼容；不支持 prompt cache，但 system 长不那么贵 |
| OpenAI | `openai` | 标准 |

**Tool use 强制 JSON 输出**（村管家用）：
- Claude: `tools: [{ name: 'recommend', input_schema: {...} }]` + `tool_choice: { type: 'tool', name: 'recommend' }`
- OpenAI/DeepSeek: `tools` + `tool_choice: { type: 'function', function: { name: 'recommend' }}`

### 4.3 环境变量

```bash
# .env
LLM_PROVIDER=claude              # claude | deepseek | openai
LLM_MODEL=claude-sonnet-4-6
LLM_API_KEY=sk-ant-xxx
LLM_BASE_URL=                    # deepseek 时设 https://api.deepseek.com/v1
PROMPT_CACHE_ENABLED=true        # claude only
```

切换 provider 流程：改 `.env` → 重启后端进程 → 5 分钟内生效。

---

## 5. PersonaLoader 运行时拼装

### 5.1 拼装顺序（最大化 prompt cache 命中）

```
[stable区 — prompt cache 头部]
  1. 灵魂层 (description/personality/scenario/mes_example/system_prompt)
  2. evidence_ledger 序列化为文本

[半稳定区 — wiki sources 改才变, 仍可 cache]
  3. <sources>
       <source id="..." date="..." tags="..."> ... </source>
       ...
     </sources>

[每日变化区 — 每天 0 点切一次]
  4. <featured_activities>
       <activity id="..." date="..."> ... </activity>
       ...
     </featured_activities>
  5. <activity_archive>  ← 摘要, 不放全文
       ...
     </activity_archive>

[每轮变化区]
  6. user 对话历史
  7. user 当前消息
```

### 5.2 缓存策略

| 层 | 缓存位置 | TTL |
|----|---------|-----|
| persona-card JSON 解析结果 | 后端进程内存 | 5 分钟 |
| wiki sources 文件读取 | 后端进程内存 | 5 分钟 |
| activities 列表 | 后端进程内存 | 1 小时（活动状态变化慢） |
| Claude prompt cache | Anthropic 服务端 | 5 分钟 prefix 匹配 |

**Wiki 改了如何生效**：
- 改 `wiki/sources/*.md`：5 分钟后内存 cache 过期，自动重读
- 改 `wiki/entities/*.md`：必须 `npm run distill <slug>` 重生成 persona-card
- 改 `wiki/activities/*.md`：1 小时后内存 cache 过期（或重启后端立即生效）

### 5.3 内存预算粗算

```
单个主理人 system prompt:
  灵魂层 (含 ledger)                     ≈ 2000 tokens
  sources 全文 (3-5 个文件)              ≈ 30000-45000 tokens
  featured_activities + archive          ≈ 2000 tokens
  ─────────────────────────────────────
  system prompt 总计                     ≈ 34000-49000 tokens

  对话历史 (10 轮)                       ≈ 3000-5000 tokens
  user message                           ≈ 100-500 tokens
  ─────────────────────────────────────
  总输入                                 ≈ 37000-54500 tokens

  Claude Sonnet 4.6 context: 200000 → 富余 70%+
  Claude 输入定价 (uncached): $3 / 1M tokens
  Claude 输入定价 (cached):   $0.30 / 1M tokens

  单次对话成本 (首次 prime):    ~$0.16
  单次对话成本 (cache hit):     ~$0.02
```

### 5.4 PersonaLoader 伪代码

```js
// services/personaLoader.js
const cache = new Map();

async function loadPersona(slug) {
  const cacheKey = `persona:${slug}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.at < 5 * 60 * 1000) return cached.data;

  const card = JSON.parse(await fs.readFile(`vault/persona-cards/${slug}.json`));
  const sources = await Promise.all(
    card.x_xianjian_source_refs.map(ref => fs.readFile(`vault/${ref}`))
  );
  const activities = await loadActivitiesForSpace(card.x_xianjian_space_slug);

  const systemPrompt = assembleSystemPrompt({ card, sources, activities });
  const data = { card, systemPrompt };
  cache.set(cacheKey, { data, at: Date.now() });
  return data;
}

function assembleSystemPrompt({ card, sources, activities }) {
  return [
    card.system_prompt,
    '',
    '## 人设描述', card.description,
    '## 性格', card.personality,
    '## 场景', card.scenario,
    '## 示范对话', card.mes_example,
    '',
    '## Evidence Ledger',
    card.x_xianjian_evidence_ledger.map(formatLedgerEntry).join('\n\n'),
    '',
    '<sources>',
    sources.map((s, i) => `<source ref="${card.x_xianjian_source_refs[i]}">\n${s}\n</source>`).join('\n'),
    '</sources>',
    '',
    '<featured_activities>',
    activities.featured.map(formatActivity).join('\n'),
    '</featured_activities>',
    '',
    '<activity_archive>',
    activities.archive.slice(0, 10).map(formatActivitySummary).join('\n'),
    '</activity_archive>'
  ].join('\n');
}
```

---

## 6. 村管家 = 一个特殊的 Persona（统一 PersonaAgent 抽象）

### 6.0 架构收敛：村管家与主理人共用 PersonaAgent

**重要架构决策**：村管家不再是独立模块 `stewardAgent.js`，而是**一个特殊的 persona**，与主理人共用 `PersonaAgent` 抽象。

```
              ┌─── PersonaAgent (统一抽象) ───┐
              │   - loadPersona(slug)         │
              │   - chat(message, history)    │
              │   - 支持 tools 参数            │
              └────────────┬──────────────────┘
                           │
       ┌───────────────────┼───────────────────┐
       ▼                   ▼                   ▼
  主理人分身 (host)      村管家 (steward)    访客分身 (Phase 2)
  slug=xiaomei           slug=steward
  sources=个人素材        sources=村史+aggregates
  tools=[]                tools=[propose_itinerary]
                          extras=[L1 facts, L2 chapters]
```

PersonaLoader 看到 `person_kind: steward` 时，额外做这些事：
1. 加载 `x_xianjian_history_ledger_ref` 指向的 L1 facts JSON
2. 加载 `x_xianjian_chapter_summaries_ref` 指向的 L2 章节摘要 JSON
3. 处理 `x_xianjian_aggregates` 标记：聚合全村 spaces / persons / activities / heritage / scenic_spots 摘要
4. 注入 `x_xianjian_tools` 声明的工具（如 `propose_itinerary`）

主理人分身（`person_kind: host`）走默认路径，不触发这些额外加载。

### 6.1 村管家的角色定位

村管家"龙寻"是一个**虚构数字村民**，核心能力：

1. **讲村史**：基于《龙潭造梦记》等史料叙述龙潭村的发展、关键人物、事件、非遗、景点
2. **挖需求**：通过多轮自然对话，挖掘访客真实的旅居目的、性格、约束、特殊期待
3. **画画像**：归纳访客所属的"旅居人群类型"（参考画像见 §6.4）
4. **出方案**：组合主理人 IP + 空间 + 独特产品/服务，生成可执行的定制旅居方案
5. **守底线**：史实必须 grounded 在 history_ledger / chapter_summaries；方案必须 grounded 在已注入的空间和主理人

### 6.2 System Prompt 结构（三语态：村史 / 方案 / 路由）

```
你是龙寻, 龙潭村的数字村管家. 在龙潭村住了 10 年的虚拟数字村民.

## 你的三种工作语态 (根据访客提问内置切换)

[语态 1: 村史叙述]
- 触发场景: 访客问村庄历史、关键人物、非遗、景点、来源故事
- 数据来源: history_ledger (L1 facts) + chapter_summaries (L2)
- 硬约束: 每条史实必须挂 fact_id 引用, 句末标 [h001] 等
- confidence='medium' 时回答开头加"我记得书里写过..."
- confidence='low' 或没有 fact 支撑时, 答"这个我不是很确定, 等比赛后我们把更多材料整理进来"

[语态 2: 方案设计]
- 触发场景: 访客有旅居意向, 描述了需求或偏好
- 工作流程:
  1. 信息不足时, 主动追问 1-3 个关键问题 (目的/时长/同行/期待)
  2. 信息齐全时, 调用 propose_itinerary tool 输出结构化方案
  3. 方案必须组合主理人 IP + 空间 + 独特产品/服务

[语态 3: 空间路由]
- 触发场景: 访客已选定方向, 想深入了解某个具体空间或主理人
- 行为: 简短介绍空间和主理人特色 (摘要来自 aggregates), 引导"想深入聊请进 XX 空间"
- 不要替主理人深入回答, 留给主理人分身

## 你的核心工作不是推荐空间, 而是为访客设计**个性化定制旅居方案**。

## 工作流程
1. 先深挖访客需求, 不够清晰时主动追问 1-3 个关键问题:
   - 旅居目的 (放空 / 创作 / 学习 / 带娃 / 康养 / 体验)
   - 时长 (1-2 天 / 3-5 天 / 一周以上)
   - 同行人 (一个人 / 情侣 / 家庭带娃 / 朋友)
   - 特殊期待 (动手做点啥 / 看作品 / 学技能 / 完全发呆)
   - 边界 (对什么反感, 比如不喜欢酒店式服务、人多嘈杂等)
2. 根据收到的信息, 归纳访客画像 (参考画像枚举)
3. 调用 propose_itinerary tool 输出结构化方案

## 龙潭村信息 (single source of truth, 由 PersonaLoader 运行时注入)

<history_ledger>
  (L1: 50-100 条结构化史实, 每条带 fact_id / source / confidence)
  h001: 林正禄 2015 年开始引入艺术家入驻 [confidence: high]
        - 源: longtang-zaomeng-ji-ch-03, 页 45
        - 原文摘录: "..."
  h002: ...
  ...
</history_ledger>

<chapter_summaries>
  (L2: 20-30 个章节摘要, 每个 300-500 字, 给模型作"目录索引")
  ch-01 (页 1-25, 2014-2016):
    时间段: 龙潭村起源 + 林正禄回乡
    关键人物: [historical-lin-zhenglu]
    关键事件: [2015-first-artists-arrive]
    摘要: "本章讲述了林正禄如何在 2015 年决定..."
  ch-02 (页 26-50, ...):
    ...
</chapter_summaries>

<spaces>
  <space slug="xiaomeizhuang">
    名称: 小梅庄
    主理人: 小梅庄主 (前律师, 现画家, 不卷流量)
    风格: 非标, 自然花园, 独栋
    技能: [接待意向客人, 美学分享, 花园, 绘画]
    服务清单: [住宿 1 晚, 春茶分享会, 一对一空间美学导览]
    今日主推活动: 春茶分享会 (5/28)
  </space>
  <space slug="gangzi-studio">...</space>
  <space slug="<第三个>">...</space>
</spaces>

<intangible_heritage>
  - 红曲黄酒 (省级非遗)
  - 乌米饭
  ...
</intangible_heritage>

<scenic_spots>
  - 白水洋 (5A, 1.5h 车程)
  - 万安桥 (中国廊桥之乡代表)
  ...
</scenic_spots>

## 旅居人群画像参考
- 独处型/创作向: 适合小梅庄、独立工作空间; 安静、有作品可看、可学习手作
- 数字游民: 适合 138 类基地; 需要稳定 wifi、远程工作友好、有同类社群
- 亲子家庭: 适合带院子的空间; 需要安全、可放娃、有研学/手作活动
- 退休康养: 适合县城与村庄结合; 医疗便利, 白天活动村里
- 艺术家/写作者: 适合主理人本身是艺术家的空间; 同频对话价值高
- 普通体验者: 适合标准化空间; 不在本平台核心服务对象

## 方案构成原则
方案必须组合以下要素 (不只是空间):
- 主理人 IP: 推荐跟哪位主理人产生连接, 为什么 (体现这位主理人独特价值)
- 空间: 住哪 / 工作哪 / 活动哪
- 独特产品/服务: 主推活动、技能课程、代表作品体验、特色产品

## 反幻觉约束
- 只能基于 <spaces> 块里实际存在的空间/主理人/服务做推荐
- 没覆盖的需求, 答"这个龙潭村目前没有, 但您可以考虑 XX, 因为..."或"这个等比赛后我们逐步把更多主理人加进来"
- 不要承诺价格 / 不要承诺确切时间 (这些后续主理人本人确认)

## 立场
你不是携程, 不是流量分发器。你是帮访客找到与乡村真正同频的连接、并帮主理人筛选同频访客的双向匹配设计师。
```

### 6.3 Tool Schema（强制结构化输出）

```json
{
  "name": "propose_itinerary",
  "description": "为访客输出定制化旅居方案",
  "input_schema": {
    "type": "object",
    "properties": {
      "guest_profile": {
        "type": "object",
        "description": "对访客的画像归纳",
        "properties": {
          "persona_type": {
            "type": "string",
            "enum": ["independent-creator", "digital-nomad", "family-with-kids", "retirement-wellness", "artist-writer", "general-experiencer"],
            "description": "归纳到的旅居人群类型"
          },
          "key_needs": {
            "type": "array",
            "items": { "type": "string" },
            "description": "访客提到的核心需求关键词 (2-5 个)"
          },
          "constraints": {
            "type": "array",
            "items": { "type": "string" },
            "description": "访客提到的边界/禁忌 (0-3 个)"
          }
        },
        "required": ["persona_type", "key_needs"]
      },
      "recommended_spaces": {
        "type": "array",
        "items": { "type": "string" },
        "description": "推荐空间的 slug 列表, 按匹配度排序"
      },
      "recommended_persons": {
        "type": "array",
        "items": { "type": "string" },
        "description": "推荐建立连接的主理人 slug 列表"
      },
      "recommended_offerings": {
        "type": "array",
        "description": "推荐的具体产品/服务/活动",
        "items": {
          "type": "object",
          "properties": {
            "space_slug": { "type": "string" },
            "offering_type": {
              "type": "string",
              "enum": ["accommodation", "activity", "skill-class", "work-experience", "product"]
            },
            "title": { "type": "string" },
            "why": { "type": "string", "description": "为什么推荐给这个访客" }
          },
          "required": ["space_slug", "offering_type", "title", "why"]
        }
      },
      "itinerary_outline": {
        "type": "array",
        "description": "可选: 按天的简要行程 (访客提到了天数才输出)",
        "items": {
          "type": "object",
          "properties": {
            "day": { "type": "integer" },
            "stay_at": { "type": "string", "description": "当晚住哪个 space_slug" },
            "highlights": {
              "type": "array",
              "items": { "type": "string" },
              "description": "当天 2-4 个要点 (做什么, 跟谁, 在哪)"
            }
          },
          "required": ["day", "highlights"]
        }
      },
      "not_recommended": {
        "type": "array",
        "description": "明确不推荐的空间及原因 (有助于评委理解路由可解释性)",
        "items": {
          "type": "object",
          "properties": {
            "slug": { "type": "string" },
            "why_not": { "type": "string" }
          },
          "required": ["slug", "why_not"]
        }
      },
      "reason": {
        "type": "string",
        "description": "整体方案的核心理由, 自然口语, 100-200 字"
      }
    },
    "required": ["guest_profile", "recommended_spaces", "reason"]
  }
}
```

### 6.4 多轮对话与"何时出方案"

村管家不必每一轮都立刻调用 tool 输出方案。判断逻辑：

| 当前对话状态 | 行为 |
|------------|------|
| 访客需求模糊 (例如只说"想来玩") | 不调用 tool, 用自然语言追问 1-2 个关键问题 |
| 关键信息齐 3 项以上 (目的/时长/同行/期待 中) | 调用 tool 输出方案, 自然语言部分作为方案介绍 |
| 访客对前一版方案有调整诉求 | 重新调用 tool 输出新方案, 解释调整点 |
| 访客已表达想去某个空间深聊 | 不调用 tool, 用自然语言引导其点击进入空间内页 |

实现上：System prompt 末尾加一段"对话状态判断指引", 模型自行决定何时调用 tool, 何时纯文本。

### 6.5 前端联动

```
村管家返回 (含 tool result) → 前端拆解:

1. text 部分 → 显示在聊天面板, 普通气泡
2. tool result (propose_itinerary 结构) → 触发渲染:
   a. recommended_spaces[] → 地图上对应点位 CSS class 加 'highlight'
      (金色光晕 + 1.5s pulse + 1.05x 缩放, 6s 后衰减为常态金色边)
   b. not_recommended[] → 对应点位加 'dimmed' (轻度灰阶)
   c. 方案卡片 → 聊天面板下方展开一张"方案卡片"小窗 (MVP: 仅展示 reason
      + 推荐列表; 完整版本: 展示 itinerary_outline 时间线)
   d. 点击方案卡片里的空间 → 直接路由进 /space/:slug
```

### 6.6 MVP 阶段简化（确保 48h 内可交付）

P0 (必交付):
- 多轮对话挖需求 ✓
- 输出 guest_profile + recommended_spaces + reason ✓
- 地图联动高亮 ✓
- not_recommended 解释 ✓

P1 (时间允许):
- recommended_offerings 完整结构化输出
- 方案卡片 UI 美化

P2 (Phase 2 留):
- itinerary_outline 按天行程渲染
- 方案可一键调整、重新生成
- 方案可分享/导出

---

## 7. 蒸馏 Pipeline

蒸馏分两条独立 pipeline：**主理人蒸馏**（A 链路）与**村管家蒸馏**（B 链路）。

### 7.1 主理人蒸馏 (A 链路)

```
raw/                            scripts/normalize.js
 ├─ 访谈.txt                     ───────────────────────►  vault/wiki/sources/*.md
 ├─ 公众号.html                  (清洗口语词 / 去模板 /
 └─ 朋友圈.txt                    标 frontmatter)

vault/wiki/entities/<host-slug>.md   人工编写
 (人设骨架 + [[wikilinks]])         ──────────────►  saved

vault/wiki/entities/<host-slug>.md  scripts/distill.js
+ 关联 sources                      ──────────────►  vault/persona-cards/<host-slug>.json
                                    (调 LLM 生成灵魂层 +
                                     evidence_ledger)    + _archive/<slug>-vN.json
```

### 7.2 村管家蒸馏 (B 链路, 新增, 处理《龙潭造梦记》390 页扫描版)

```
raw/longtang-zaomeng-ji.pdf (扫描版, 390 页, 360M)
       │
       ├─ Step B1: scripts/extract-book.js
       │   ├─ PDF OCR (调 PaddleOCR / Tesseract / 商用 API)
       │   ├─ 章节切分 (按页码段或标题识别, 切成 20-30 章)
       │   ├─ 每章一个 wiki/sources/longtang-zaomeng-ji-ch-NN.md
       │   └─ 含 frontmatter: source_type=book-chapter, page_range, ...
       │
       ├─ Step B2: scripts/distill-chapters.js
       │   ├─ for each chapter: LLM 读章节 → 300-500 字摘要
       │   ├─ 抽取: title, time_period, key_persons, key_spaces, key_events
       │   └─ 写入 vault/persona-cards/steward.l2-chapters.json
       │
       ├─ Step B3: scripts/extract-facts.js
       │   ├─ LLM 扫全书 → 抽取 50-100 条关键史实
       │   ├─ 每条 fact 挂 source_id + page + excerpt + confidence
       │   ├─ 标 related_persons, related_events, tags
       │   └─ 写入 vault/persona-cards/steward.l1-facts.json
       │
       ├─ Step B4: scripts/extract-entities.js
       │   ├─ LLM 扫全书 → 命名实体识别
       │   ├─ 输出: 人物 / 事件 / 非遗 / 景点
       │   └─ 半自动生成:
       │       - wiki/entities/historical-<name>.md  (草稿)
       │       - wiki/historical_events/<id>.md      (草稿)
       │       - wiki/intangible_heritage/<id>.md    (草稿)
       │       - wiki/scenic_spots/<id>.md           (草稿)
       │   (脚本输出草稿, 人工 review 后入库)
       │
       └─ Step B5: scripts/distill.js --steward
           ├─ 读 wiki/entities/steward.md (龙寻人设骨架, 手写)
           ├─ 读 sources (《龙潭造梦记》章节 + 其他)
           ├─ 调 LLM 生成 description / personality / mes_example
           ├─ 写入 vault/persona-cards/steward.json
           │     ├─ 灵魂层 (虚构人设)
           │     ├─ x_xianjian_aggregates 标记 (运行时聚合)
           │     ├─ x_xianjian_history_ledger_ref → l1-facts.json
           │     ├─ x_xianjian_chapter_summaries_ref → l2-chapters.json
           │     ├─ x_xianjian_tools: ["propose_itinerary"]
           │     └─ x_xianjian_source_refs (L3 章节原文路径)
```

### 7.3 蒸馏时间预估（48h 切片中的位置）

| Step | 耗时估计 | 备注 |
|------|---------|------|
| B1 PDF OCR + 章节切分 (390 页扫描版) | 2-3h | 扫描版 OCR 较慢; 可异步; PaddleOCR 中文识别质量较好 |
| B2 章节摘要批跑 (20-30 章 × LLM) | 1.5h | 异步并发, 30 个 LLM 调用 |
| B3 史实抽取 (LLM 多次扫书) | 1.5h | 分段扫 + 合并去重 |
| B4 命名实体抽取 (人物/事件/非遗/景点) | 1h | 实体识别 + 人工 review |
| B5 龙寻人设手写 + distill | 1h | 同主理人蒸馏 |
| **村管家增量总计** | **~7-8h** | 占 48h 的 15% |

### 7.4 主理人蒸馏 prompt（沿用前 §7.2 中的方法论，保持不变）

借鉴 dot-skill `persona_builder.md` 方法论：

### 7.2 蒸馏 Prompt（distill.js 的核心）

借鉴 dot-skill `persona_builder.md` 方法论：

```
你是数字分身蒸馏专家。基于以下骨架和源材料, 输出 CCv3 格式的 JSON。

## 输出字段
- description (200 字内)
- personality (200 字内)
- scenario (50 字内)
- first_mes (50 字内)
- mes_example (3-5 段对话, 必须从源材料原话改编)
- system_prompt (含 L0 硬约束 + 语态切换段)
- x_xianjian_skills (结构化数组)
- x_xianjian_aesthetic_keywords (5-8 个)
- x_xianjian_evidence_ledger (重点!)

## 蒸馏方法论 (硬约束)

1. **形容词禁令**:
   不准写"她很佛系"、"她有审美追求"。
   必须写成可观察的行为或可执行的规则。
   错: "她对消费主义客人反感"
   对: "遇到要求五星级标准服务的客人, 倾向于拒绝或推荐到隔壁宾馆"

2. **证据阈值** (PersonaCite):
   每条 evidence_ledger.claim 必须挂 source 引用。
   ≥2 个源 → confidence: high
   1 个源 → confidence: medium, 模型回答时开头加"我记得..."
   0 个源 → 不要写, 跳过
   每个 claim 必须列出 abstain_if_asked_beyond (3-5 个超出语料范围的话题)

3. **真实对白优先**:
   mes_example 的每段对话必须来源于 sources 中真实出现过的对话或表述,
   不许凭空发明该人物没说过的话。

4. **优先级机器** (dot-skill L0):
   system_prompt 顶部按以下优先级写硬规则:
   L0 红线 > L5 边界禁忌 > 一般行为 > 风格细节
   L0 永远 override 其他层。

## 输入

### 实体骨架
{entityMd}

### 源材料
{sources.map(...).join('\n')}

## 输出

直接输出 JSON, 不要任何解释文字。
```

### 7.3 distill.js 工作流

```js
async function distill(slug) {
  // 1. 读 entity 骨架
  const entityMd = await fs.readFile(`vault/wiki/entities/${slug}.md`);

  // 2. 解析 [[wikilinks]] → 收集 source 路径
  const refs = parseWikilinks(entityMd);
  const sources = await Promise.all(refs.map(r => fs.readFile(`vault/${r}.md`)));

  // 3. 构造蒸馏 prompt (见 7.2)
  const prompt = buildDistillPrompt({ entityMd, refs, sources });

  // 4. 调 LLM
  const response = await llm.chat({
    system: '你是数字分身蒸馏专家.',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 4096
  });

  // 5. 解析 JSON, 自动补 source_refs (脚本添加, 不依赖 LLM)
  const card = JSON.parse(extractJSON(response));
  card.x_xianjian_source_refs = refs.map(r => `${r}.md`);
  card.x_xianjian_meta = {
    distilled_at: new Date().toISOString(),
    distill_model: process.env.LLM_MODEL,
    distill_version: 'v0.1'
  };

  // 6. 归档旧版本 (如有)
  const existingPath = `vault/persona-cards/${slug}.json`;
  if (await exists(existingPath)) {
    const archiveName = `_archive/${slug}-v${Date.now()}.json`;
    await fs.rename(existingPath, `vault/persona-cards/${archiveName}`);
  }

  // 7. 写入新版本
  await fs.writeFile(existingPath, JSON.stringify(card, null, 2));
  console.log(`[distill] ${slug} → ${existingPath}`);
}
```

### 7.4 人工 review 闭环

蒸馏脚本完成后**必须**人工打开 JSON 检查：
1. mes_example 是否像该主理人原话？
2. evidence_ledger 的 excerpt 是否真的在 source 里找得到？
3. abstain_if_asked_beyond 列表是否合理？

不像 → 改 `wiki/entities/<slug>.md` 的"说话风格"段或加更多 source → 重跑 distill。

---

## 8. 前端 UX 细节

### 8.1 路由

```
/                    → 村地图层 (默认)
/space/:slug         → 空间内页
/order/:orderId      → 订单确认页 (mock)
```

### 8.2 关键交互

**实空间 vs 云空间的视觉区分（地图层核心呈现）**：

| 维度 | 实空间（`space_kind: physical`） | 云空间（`space_kind: cloud`） |
|------|--------------------------------|----------------------------|
| 点位形状 | 实心圆 | 虚化光晕环 |
| 配色 | 深色（黑 / 深棕） | 浅色（银 / 半透明白） |
| 边缘 | 清晰锐利 | 模糊渐变 |
| 静态动效 | 静止 | 缓慢呼吸（opacity 0.6 ↔ 1.0，3s 周期） |
| 命中悬停 | 缩放 1.05x + 显示空间名 | 缩放 1.05x + 显示空间名 + "云空间"小标签 |
| 推荐高亮（村管家选中后） | 金色光晕 + 1.5s pulse | 银色光晕 + 1.5s pulse |

CSS 草稿：
```css
.map-pin--physical { background:#1a1a1a; border-radius:50%; }
.map-pin--cloud    { background:radial-gradient(rgba(255,255,255,.85), rgba(255,255,255,.1));
                     animation: cloud-breathe 3s ease-in-out infinite; }
@keyframes cloud-breathe { 0%,100% { opacity:.6 } 50% { opacity:1 } }
```

**村管家高亮联动**：
- 村管家返回 `recommended_spaces: ["xiaomeizhuang", "huangzhe-ai-studio"]`
- 前端给地图上对应点位的 DOM 元素加 CSS class `highlight`
- 动效：金色（实空间）/ 银色（云空间）光晕 + 1.5s pulse + 1.05x 缩放，持续 6s 后衰减为常态金色/银色边

**对话框设计**：
- 主理人头像 + 名字在顶部
- 消息气泡：用户右侧蓝色，主理人左侧白色带边框
- **每条主理人回答末尾的 `[c001]` `[源:xxx]` 标记可点击**
- 点击展开"证据卡片"小窗：显示 source excerpt 摘录 + "查看原文"按钮 → 跳到 IDE 打开 markdown（或在前端展示 markdown 渲染）

**空间内页结构**：
```
┌──────────────────────────────────────────────────┐
│ 空间封面图 (cover_image)                          │
├──────────────────────────────────────────────────┤
│ 小梅庄                                            │
│ 主理人: 小梅庄主                                  │
│ [开始与庄主分身对话 →]  (主 CTA)                  │
├──────────────────────────────────────────────────┤
│ ┌─ 活动 (3) ─┬─ 作品 (5) ─┐                       │
│ │  ●          │            │                       │
│ │ 春茶分享会 · 5/28          ← featured            │
│ │ 山中音乐会 · 6/15          ← featured            │
│ │ 诗歌之夜 · 2024 春          ← archive            │
│ └─────────────────────────┘                       │
├──────────────────────────────────────────────────┤
│ <对话区, 占主要视觉空间>                          │
│ ...                                              │
├──────────────────────────────────────────────────┤
│ ⌃ 如果你也想来 · 庄主提供 (默认折叠)               │
│   - 住宿 1 晚 ¥320                                │
│   - 春茶分享会名额 ¥80                            │
└──────────────────────────────────────────────────┘
```

### 8.3 评论员模式（演示用）

加一个隐藏路由 `/judge-mode`，对地图层和对话框启用：
- 主理人对话窗口右侧固定一个**证据面板**（默认折叠，开关切到展开）
- 展开后实时显示：当前消息触发的 evidence_ledger 条目 + abstain 触发情况
- 这是给评委演示"可解释性"用的 panel，正式用户视图里没有

### 8.4 游戏化积分系统（YuanXP，简略版）

**目的**：体现"游戏化乡村社区"概念，让访客在 demo 中能感受到互动是有反馈的；同时给 Phase 2 的"积分兑换云空间建设权"留出叙事接口。

**状态结构**：

```js
// frontend/src/lib/yuanxp.js (Zustand store 或 React Context)
{
  xp: 0,
  events: [                 // 用于演示时展示"获得历史"
    { at: timestamp, action: 'enter_space', target: 'xiaomeizhuang', delta: +5 },
    ...
  ]
}
```

**积分规则**（写死在前端，不接后端）：

| 动作 | 触发条件 | 奖励 |
|------|---------|------|
| `talk_steward_deep` | 与村管家对话后村管家返回包含 `propose_itinerary` 的 tool_use | +10 |
| `enter_space` | 进入任意空间内页（首次进入计算，重复进入不重复奖励） | +5 |
| `chat_persona_long` | 与某个主理人/云村民分身完成 ≥5 轮对话 | +20 |
| `browse_activity_or_work` | 在空间内页点开任意 activity 或 work 卡片 | +5 |
| `mock_order_complete` | 完成 mock 下单流程 | +30 |

去重：每个 `(action, target)` 元组只首次触发计分（避免刷分）。

**UI 呈现**：

- 页面右上角固定小部件（48px × 48px 圆形 + "✦ 元家乡积分" 标签）
- 当前积分数实时显示（大字号）
- 获得积分时触发：数字滚动动画 0.5s + 弹出一个 "+5" / "+20" 飘字（fade out 1.2s）
- 点击小部件展开 popover，显示积分历史列表（最近 5 条）

**演示意义说明**（写在 popover 底部一行小字）：
> "积分将在 Phase 2 兑换云空间建设权 / 主理人优惠 / 龙潭文创产品。本期 demo 仅展示获得机制。"

**实现成本**：1-1.5h（Zustand store + 几个 hook 触发点 + 一个简单组件）。若时间紧张，**降级方案**：只在地图层右上角显示积分数字，不做动画和 popover，仍能体现"游戏化"概念。降级版 0.5h 即可。

**显式不做**：
- 积分写入 vault 或后端
- 积分兑换商城
- 多用户排行榜
- LLM prompt 中感知积分（不影响对话）

---

## 9. 48 小时切片计划（重排版：小梅庄主 + 黄喆云村民 + 浅予占位 + 完整村管家 + 实/云空间区分 + 游戏积分）

**资源分配总览**：

| 投入区块 | 估时 | 占比 |
|---------|-----|-----|
| 项目骨架 + 数据准备 (A) | 6h | 12.5% |
| 后端 (B) | 11h | 23% |
| 前端 (C) | 12h | 25% |
| 主理人蒸馏 (D-A 链路) | 5h | 10.5% |
| 村管家蒸馏 (D-B 链路, 新增) | 7.5h | 15.5% |
| 联调 / 兜底 (E) | 4h | 8.5% |
| 演示部署 (F) | 2.5h | 5% |
| 合计 | 48h | 100% |

### 9.1 详细切片表

| 时段 | 阶段 | 任务 | 交付物 |
|------|------|------|--------|
| 0-2h | A1 | 项目骨架: vault/ + scripts/ + frontend/ + backend/ + .env | 空仓库结构 |
| 2-3h | A2-host | 清洗小梅庄主访谈 → 3-4 个 source.md (含黄喆 5/19 访谈记录) | wiki/sources/xiaomei*.md |
| 3-4h | A3-host | 写 wiki/entities/xiaomei.md (人设骨架, person_kind: host) + spaces/xiaomeizhuang.md (space_kind: physical) | xiaomei entity + space |
| 4-5h | A4-cloud | 黄喆 (云村民) 素材整理 + entities/huangzhe.md (person_kind: cloud-villager) + spaces/huangzhe-ai-studio.md (space_kind: cloud) | huangzhe entity + cloud space |
| 5-6h | A5-occ | 浅予占位: entities/qianyu.md 极简 + spaces/138-base.md (space_kind: physical) | 占位文件 |
| 0-2h | A-book | (并行) 启动《龙潭造梦记》PDF OCR (扫描版 390 页) | raw 文本提取中 |
| 4-7h | B1 | Node Express 路由 + .env 加载 | 后端 hello world |
| 7-10h | B2 | services/llm.js (Claude + DeepSeek + OpenAI) | LLM wrapper 跑通 |
| 10-13h | B3 | services/personaLoader.js (含 steward 分支: 加载 L1/L2 + aggregates) | /api/chat agent=xiaomei 跑通 |
| 13-15h | B4 | propose_itinerary tool 集成 + steward agent 路径打通 | /api/chat agent=steward 跑通 |
| 8-12h | C1 | Vite + React + Tailwind init + 路由 + 村地图层框架 (含实/云空间双类点位样式) | 地图可加载, 实/云空间视觉区分清晰 |
| 12-16h | C2 | 村管家聊天面板 + 高亮联动 (含云空间银色光晕) + 方案卡片 (MVP) | 与 steward 联调通 |
| 16-20h | C3 | 空间内页 (活动/作品 tabs + 对话 + 商品抽屉; 实空间和云空间略有不同 layout) | 单空间页能聊 |
| 20-21h | C4 | mock 下单流程 + 订单确认页 | 下单链路通 |
| 21-22.5h | C5 | YuanXP 积分系统 (Zustand store + 触发点 + 右上角组件 + 动效) | 积分实时累积可见 |
| 22.5-24h | C6 | 主流程端到端联通 + 视觉打磨 (含太极阴阳虚化开场动画) | 完整流程跑通 |
| 2-4h | D-B1 | scripts/extract-book.js: OCR → 章节切分 (并行 OCR 完成后) | 20-30 个 ch-*.md |
| 6-8h | D-B2 | scripts/distill-chapters.js → l2-chapters.json | L2 章节摘要 |
| 8-10h | D-B3 | scripts/extract-facts.js → l1-facts.json | L1 史实 50-100 条 |
| 10-11h | D-B4 | scripts/extract-entities.js → 草稿入 wiki/historical_events / intangible_heritage / scenic_spots | 实体草稿 |
| 11-12h | D-B5 | 龙寻人设手写 + scripts/distill.js --steward | persona-cards/steward.json |
| 16-18h | D-A1 | scripts/distill.js 实现 + 蒸馏小梅庄主 (3 轮迭代) | persona-cards/xiaomei.json |
| 18-20h | D-A2 | 蒸馏黄喆 (云村民) + 浅予占位简版 | 3 个 persona-cards |
| 36-40h | E1 | 端到端跑 5 遍, 记卡点 + 修 bug | 卡点清单清空 |
| 40-42h | E2 | 兜底机制: DeepSeek 切换测试 + 离线 fallback 视频准备 | 离线模式可切 |
| 42-44h | E3 | UI 最终打磨 + 响应式校验 + 评论员模式 (/judge-mode) | 体感成品 |
| 42-44h | F1 | 部署: Vercel (前) + Render (后) + DNS + 二维码 | 公网可访 |
| 44-46h | F2 | 演示稿 + 现场截图 + 海报 | 演示包 |
| 46-48h | F3 | 演示彩排 3 遍 + 机动 Buffer | 节奏熟练 |

### 9.2 关键里程碑

- **T+6h**：所有 wiki 骨架就位（含 2 深主理人 + 1 占位 + village + 实体目录）；《龙潭造梦记》OCR 跑完
- **T+12h**：村管家蒸馏 B 链路完成（steward.json + l1-facts.json + l2-chapters.json）
- **T+16h**：后端 `/api/chat agent=steward / agent=xiaomei` 都能返回回答
- **T+20h**：主理人 A 链路完成（2 个深蒸馏 + 1 个简版占位）
- **T+24h**：完整端到端流程跑通（地图 → 村管家方案 → 空间 → 主理人对话 → 下单）
- **T+36h**：UI 打磨完成
- **T+42h**：公网部署完成，可扫码访问
- **T+48h**：演示就绪

### 9.3 阶段并行说明

并行的几条线索：
- **A-book OCR**（0-2h 启动）与 **B 后端**（4h 开始）、**C 前端**（8h 开始）独立运行
- **D-A 主理人蒸馏**（16h 后）和 **D-B 村管家蒸馏**（2h 后串行启动）时间错开，避免 LLM 调用速率打架
- E 联调 必须 A/B/C/D 全部 ≥ MVP 才能开始

实际单人开发：**任务级串行 + 等待 OCR 等异步任务时切前/后端代码**，48h 内做完所有 A→F 阶段。

### 9.4 浅予（138 大管家）占位策略

**占位含义**：浅予作为 demo 中的第三个 persona，**可见但仅支持轻度对话**。具体处理：

- `wiki/spaces/138-base.md` 完整（地图上能高亮，space_kind: physical）
- `wiki/entities/qianyu.md` 极简骨架（200 字介绍 + 关键人设特征）
- `vault/persona-cards/qianyu.json` 极简版：只有 description + first_mes + mes_example 1-2 段 + 一句兜底回答
- 前端点击进入 138 基地内页：完整页面（活动 tab、商品抽屉等），但对话区显示"分身处于早期版本，仅能回答基础问题；完整深聊版本下一阶段上线"
- 评委演示时可一句话带过："浅予是 138 数字游民基地的大管家，是我们规划的第三位主理人，本期为简版，下一期接入完整对话能力"

这样既不影响 demo 完整性，又能给评委传达"系统可扩展、还能复制更多主理人"的信号。同时，三位 persona 形成清晰的差异化矩阵：

| Persona | 类型 | 角色 |
|---------|------|------|
| 小梅庄主 | 在地实空间（host） | 艺术家 / 民宿主 |
| 黄喆 | 纯线上云空间（cloud-villager） | AI 原生开发者 / 远程服务提供者 |
| 浅予 | 在地实空间（host，占位） | 138 基地大管家 / 在地数字游民代表 |
| 龙寻 | 虚构村管家（steward） | 跨空间方案设计师 + 村史问答 |

---

## 10. 风险与兜底

| 风险 | 概率 | 影响 | 兜底 |
|------|------|------|------|
| Claude API 限流或网络抽风 | 中 | 演示直接挂 | `.env` 切 DeepSeek（5 分钟） |
| DeepSeek 风格与 Claude 差距过大 | 中 | 切换后人设崩 | 提前在 D2 阶段双 provider 跑同对话脚本验证 |
| 蒸馏出来的 mes_example 不像本人 | 高 | 评委一眼看出假 | 人工 review 闭环，至少 3 轮蒸馏迭代 |
| 现场网络不稳 | 中 | 站点访问慢 | 准备移动热点 + 本地启动备用 |
| 评委追问超出范围 | 高 | 暴露分身的薄弱 | abstain 机制本身就是答案，是 feature |
| 文创熙岭地图素材授权问题 | 低 | 演示前要替换 | 兜底用手绘 SVG 替代 |
| 时间不够：第 3 个主理人没蒸馏完 | 低 | 已规划: 第 3 个就是占位 | 占位策略见 §9.4, 演示叙事已铺好 |
| OCR 质量差导致章节文本错乱 | 中 | 史实 ledger 不准 | 重要章节人工补救; 不重要的标 low confidence |
| 章节摘要批跑超时 | 中 | L2 不全 | 优先蒸前 1/3 章节; 后半段标"待补充" |
| 前端 + 后端联调 bug | 中 | 卡在 24h 那个里程碑 | E1 阶段 4h 是专门的联调 buffer |

### 10.1 离线 fallback 机制

为防 LLM 完全不可用，预录 3 个核心演示对话的"回答脚本"硬编码到前端：
- 触发条件：环境变量 `OFFLINE_MODE=true`
- 行为：对预设问题返回预录答案，对未预设问题返回"演示版离线，请等待 LLM 恢复"
- 启用方式：演示前 30 秒一键切换

---

## 11. 非功能性需求

| 维度 | 要求 |
|------|------|
| 性能 | 单次对话首字时间 < 3s（cache hit）, < 8s（cache miss） |
| 可用性 | 演示当天 9:00-22:00 期间可用 |
| 可读性 | wiki 中所有 markdown 文件人类可读，frontmatter 规范统一 |
| 可审计性 | 每条 AI 输出可在 30 秒内回溯到 source markdown 的具体段落 |
| 可移植性 | LLM provider 切换 ≤ 5 分钟 |
| 安全性 | 不包含真实主理人未授权的私人信息（朋友圈/视频号需经主理人口头同意） |

---

## 12. 显式不做的设计决策（避免未来 review 时被质疑）

| 不做的事 | 理由 |
|---------|------|
| 不接 LiteLLM | 50 行手写 wrapper 够用，少一个依赖 |
| 不引入向量数据库 | 200k context 全塞 prompt 够 |
| 不用 RAG | 同上 |
| 不做用户账号 | 演示用 sessionStorage |
| 不做真实支付 | mock 即可，演示无关 |
| 不与作者已有 wiki 打通 | 独立 demo vault，避免污染 |
| 不做 multi-agent 编排 | MASCOT 三语态在单 prompt 内实现 |
| 不做向后兼容 / 数据迁移 | 黑客松一次性产物 |
| 不做单元测试 | 时间不够；做端到端验证替代 |
| 不做 i18n | 仅中文 |

---

## 附录 A：文件清单

```
H:/myProject/XianJian/
├── docs/superpowers/specs/
│   ├── 2026-05-20-zhuliren-fenshen-business.md         (业务 spec, 本 spec 的姐妹篇)
│   └── 2026-05-20-zhuliren-fenshen-architecture.md     (本文)
├── vault/                                              (数据层)
│   ├── wiki/
│   │   ├── villages/longtang.md                        (村庄实体, 新增)
│   │   ├── entities/                                   (人物: host/steward/historical)
│   │   ├── spaces/
│   │   ├── historical_events/                          (新增)
│   │   ├── intangible_heritage/                        (新增)
│   │   ├── scenic_spots/                               (新增)
│   │   ├── sources/                                    (含 book-chapter 新类型)
│   │   ├── works/
│   │   └── activities/
│   ├── persona-cards/
│   │   ├── xiaomei.json
│   │   ├── <host2>.json
│   │   ├── <third>.json                                (占位简版)
│   │   ├── steward.json
│   │   ├── steward.l1-facts.json                       (村管家分层蒸馏 L1)
│   │   ├── steward.l2-chapters.json                    (村管家分层蒸馏 L2)
│   │   └── _archive/
│   ├── raw/
│   │   ├── longtang-zaomeng-ji.pdf                     (扫描版原书)
│   │   └── ...
│   └── scripts/                                        (数据处理)
│       ├── normalize.js                                (主理人素材清洗)
│       ├── distill.js                                  (主理人 + 村管家通用蒸馏)
│       ├── extract-book.js                             (PDF OCR + 章节切分, B 链路)
│       ├── distill-chapters.js                         (L2 章节摘要批跑, B 链路)
│       ├── extract-facts.js                            (L1 史实抽取, B 链路)
│       └── extract-entities.js                         (人物/事件/非遗/景点识别, B 链路)
├── backend/                                            (Node Express)
│   ├── server.js                                       (单文件路由)
│   ├── services/
│   │   ├── llm.js                                      (50 行 wrapper, Claude/DeepSeek/OpenAI)
│   │   ├── personaLoader.js                            (host + steward 统一加载, 支持分层蒸馏)
│   │   └── personaAgent.js                             (统一 agent 抽象, 取代独立 stewardAgent)
│   ├── package.json
│   └── .env.example
├── frontend/                                           (Vite + React)
│   ├── src/
│   │   ├── App.jsx
│   │   ├── pages/
│   │   │   ├── VillageMap.jsx
│   │   │   ├── SpaceDetail.jsx
│   │   │   └── OrderConfirm.jsx
│   │   ├── components/
│   │   │   ├── ChatPanel.jsx
│   │   │   ├── ActivityList.jsx
│   │   │   ├── WorkGallery.jsx
│   │   │   ├── ProductDrawer.jsx
│   │   │   └── EvidencePanel.jsx                       (judge-mode 用)
│   │   └── lib/api.js
│   ├── public/
│   │   ├── map-base.png                                (文创熙岭底图)
│   │   ├── xiaomeizhuang-cover.jpg
│   │   └── images/...
│   └── package.json
├── ref/                                                (原始访谈, 已存在)
└── README.md
```

## 附录 B：开发环境

| 工具 | 版本 |
|------|------|
| Node.js | ≥ 20 LTS |
| npm | ≥ 10 |
| Git | 任意现代版本 |
| Claude API key | Anthropic |
| DeepSeek API key | DeepSeek（兜底） |
| 部署 | Vercel + Render/Railway |

---

**Review 后请回复**：
1. 架构图是否清晰？组件边界是否合理？
2. Schema 设计（CCv3 + dot-skill + PersonaCite + MASCOT 整合）是否过度复杂？
3. 48 小时切片节奏是否可信？哪段你觉得高估/低估？
4. 风险与兜底是否覆盖了你担心的场景？
5. 是否有显式不做的决策需要补充？
