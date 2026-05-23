# Cursor 交接文档：龙寻蒸馏 + 《乡村造梦记》Ingest

> **任务目标**：为村管家 AI 分身"龙寻"完成两件事：
> 1. 将《乡村造梦记》内容做 wiki ingest（手动提取文字 → `wiki/sources/longxun-src-*.md`）
> 2. 用 distill.js 蒸馏出完整的 `persona-cards/longxun.json`

---

## 项目概况

**元家乡 2050** — 48 小时 hackathon demo。为福建屏南龙潭村的空间主理人们制作 AI 数字分身，部署在对话界面。

```
XianJian/
├── backend/          # Express + DeepSeek API
│   ├── routes/chat.js
│   ├── services/
│   │   ├── personaAgent.js   # 统一对话入口
│   │   ├── personaLoader.js  # 加载并组装 system prompt
│   │   ├── llm.js            # DeepSeek / Claude 切换
│   │   └── stewardTool.js    # propose_itinerary 工具 schema
│   └── .env                  # ⚠️ 含 API key，不要 commit
├── frontend/         # React + Vite + Tailwind
│   └── src/pages/ChatDebug.jsx  # 对话调试页（路由 /chat?slug=longxun）
└── vault/            # 知识库（Obsidian vault）
    ├── raw/longxun/  # 原始素材放这里
    ├── wiki/
    │   ├── sources/      # Stage 1 输出：longxun-src-*.md
    │   ├── entities/     # 人物骨架：longxun.md
    │   └── spaces/       # 空间档案：xiaomeizhuang.md（目前唯一）
    ├── persona-cards/
    │   ├── longxun.json  # 当前：骨架版（placeholder: true）
    │   └── xiaomei.json  # 完整版（参考对象）
    └── scripts/
        ├── distill.js    # Stage 2 蒸馏脚本（重要）
        └── gen-longxun-card.js  # 手动生成骨架卡片的脚本
```

---

## 当前状态

### 已完成

- `vault/persona-cards/longxun.json` — **骨架版**，含 `placeholder: true`
  - 龙寻能对话、知道小梅桩基本信息
  - evidence_ledger 为空，没有村史知识
  - first_mes 已配置（前端加载即显示开场白）
- `vault/wiki/entities/longxun.md` — 骨架（身份/能力/行为边界定义）
- 后端接口已就绪，可以 `?slug=longxun` 测试

### 待完成

1. **《乡村造梦记》内容 → wiki/sources/longxun-src-*.md**（Stage 1）
2. **蒸馏生成完整 longxun.json**（Stage 2）

---

## 关键问题：PDF 是扫描件

`vault/raw/longxun/《乡村造梦记》（沉洲，作家出版社，2021）.pdf`

- 大小：356MB
- 类型：**扫描 PDF**（图片，无嵌入文字）
- `pdftotext` 只能提取约 20 bytes（封面文字）

### 解决方案（三选一，由你决定）

**方案 A（推荐）：手动摘录关键章节**
用 PDF 阅读器打开，人工阅读并摘录龙潭村相关段落，写入 `wiki/sources/longxun-src-*.md`。
- 优点：质量最高，无需额外工具
- 工作量：约 2-4 小时（取决于摘录深度）

**方案 B：在线 OCR**
用 Adobe Acrobat / 万彩办公大师 / iLovePDF 等工具对 PDF 做 OCR，导出可复制的文字，再摘录。
- 优点：省人力
- 注意：OCR 对手写体、竖排版准确率不一定理想

**方案 C：暂时用 mock 数据先通蒸馏流程**
手写几条 mock source（虚构龙潭村史），先跑通 distill.js 流程，后续替换真实内容。
- 适合：只是想先测试蒸馏 pipeline 是否 work

---

## Stage 1：wiki/sources 文件格式

每个 source 文件放在 `vault/wiki/sources/`，命名规则：`longxun-src-001.md`（三位数递增）。

### 完整 frontmatter 示例

```markdown
---
type: source
id: longxun-src-001
person_slug: longxun
source_file: raw/longxun/《乡村造梦记》第X章.md
source_type: book   # book | article | interview | weixin | video_transcript
title: "《乡村造梦记》— 龙潭村历史：废村与复兴"
date: 2021-01-01
tags: [村史, 废村, 林正碌, 复兴]
evidence_for: [village_history, new_villagers_wave]
status: active
created: 2026-05-21
---

> 直接引用原文，用 > 引用块格式。

> 另一段引用。每个引用块对应原书中一个完整段落或语义单元。

补充说明（不是原文引用的可以放正文，但要标明是摘要/转述）。
```

### 适合龙寻的 evidence 类型（参考）

龙寻是村管家，应该知道的事：

| evidence_for 标签 | 含义 |
|---|---|
| `village_history` | 龙潭村历史（废村/复兴时间线）|
| `new_villagers_wave` | 新村民浪潮（什么时候开始、谁来了）|
| `lin_zhenglu` | 林正碌与"人人都是艺术家"计划 |
| `space_intro` | 各个空间/民宿的介绍 |
| `host_profiles` | 主理人人物信息 |
| `village_culture` | 龙潭文化活动、社区氛围 |
| `geography` | 地理位置、交通、自然环境 |

### 参考：小梅的 source 文件结构

看 `vault/wiki/sources/xiaomei-src-001.md` 到 `xiaomei-src-010.md` 即可，格式完全一致。

---

## Stage 2：运行 distill.js

### 环境配置

`backend/.env`（已配置好，不要 commit）：
```
LLM_PROVIDER=deepseek
DEEPSEEK_API_KEY=sk-2acff61ebf5e4a89903f8851c0cb4f6d
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
LLM_MODEL=deepseek-chat
VAULT_PATH=../vault
```

`vault/scripts/` 有自己的 `package.json`，先安装依赖：
```bash
cd vault/scripts
npm install   # 如果 node_modules 不存在
```

### 蒸馏命令

```bash
# 在 vault/scripts/ 目录下运行
node distill.js longxun
```

distill.js 会：
1. 读 `wiki/entities/longxun.md`（骨架）
2. 读 `wiki/sources/longxun-src-*.md`（你写的 sources）
3. 读 `wiki/spaces/*.md`（空间档案，注入给 LLM 做路由知识）
4. 调 DeepSeek API 蒸馏出 CCv3 JSON
5. 写入 `persona-cards/longxun.json`（旧版本自动归档）

### 蒸馏特殊逻辑（steward 模式）

distill.js 检测到 `person_kind: steward` 时，还会尝试读：
- `persona-cards/longxun.l1-facts.json`（L1 史实层）
- `persona-cards/longxun.l2-chapters.json`（L2 章节摘要层）

这两个文件是 MVP2 的进阶功能，**目前不存在，跳过即可**（distill.js 会打 warn 但继续运行）。

### 可能遇到的问题

| 错误 | 原因 | 解决 |
|---|---|---|
| `找不到实体骨架` | entities/longxun.md 不存在 | 文件已存在，无需处理 |
| `wiki/sources/ 无 longxun-src-*.md` | Stage 1 没做 | 先写 source 文件 |
| `JSON parse 失败` | LLM 输出了非 JSON | 重跑一次，或看原始输出调整 prompt |
| `EADDRINUSE :3001` | 后端端口占用 | `Get-Process -Name node \| Stop-Process -Force` |

---

## 如何测试

### 启动后端
```bash
cd backend
npm run dev   # 端口 3001
```

### 启动前端
```bash
cd frontend
npm run dev   # 端口 5173
```

### 测试龙寻对话
浏览器打开：`http://localhost:5173/chat?slug=longxun`

### 用 curl/node 直接测 API
```bash
# 开场白（不消耗 LLM）
curl http://localhost:3001/api/chat/open/longxun

# 对话测试
node -e "
fetch('http://localhost:3001/api/chat', {
  method: 'POST',
  headers: {'Content-Type':'application/json'},
  body: JSON.stringify({slug:'longxun', message:'龙潭村是什么时候开始有人来的？', history:[]})
}).then(r=>r.json()).then(d=>console.log(d.text))
"
```

---

## 龙寻 persona card 的质量目标

蒸馏后的 `longxun.json` 应达到：

| 字段 | 目标 |
|---|---|
| `x_xianjian_evidence_ledger` | ≥ 8 条（每条有 source_refs 可追溯）|
| `mes_example` | 3 段：村史问答 + 访客画像识别 + 方案设计 |
| `system_prompt` | 三语态（村史/方案/路由）+ L0 红线 + L5 禁忌 |
| `x_xianjian_tools` | 保留 propose_itinerary（已在骨架卡里定义）|
| `x_xianjian_person_kind` | `"steward"` |
| `x_xianjian_space_slug` | `""` （龙寻代表整个村，不挂单一空间）|

---

## 参考：小梅的完整蒸馏结果

`vault/persona-cards/xiaomei.json` 是目前唯一完整版 persona card，结构和质量可作参考。

对比点：
- 小梅：`person_kind: "host"`，挂 `space_slug: "xiaomeizhuang"`，12 条 evidence
- 龙寻：`person_kind: "steward"`，`space_slug: ""`，村史知识 > 个人故事

---

## wiki/entities/longxun.md 内容摘要

（给 Cursor 快速了解龙寻设定，不必再读原文件）

- **身份**：虚构的 AI 村管家，代表整个龙潭村
- **来历**：从《乡村造梦记》390 页蒸馏而生（知识层待建）
- **立场**：中立有温度，不推销只匹配，尊重主理人个性边界
- **能力**：村史档案、访客画像（3-5 轮判断类型）、定制方案（propose_itinerary）、空间路由
- **三语态**：
  - 村史语态：冷静叙述，引用 [c-NNN]
  - 方案语态：创意组合资源
  - 路由语态：精准描述但不夸赞
- **禁忌**：不评价主理人高下、不承诺未确认的价格/档期、被问身份时诚实说是 AI

---

## 已知的空间信息（龙寻需要知道的）

### 小梅桩 (xiaomeizhuang)
- 主理人：小梅（梅宏），前律师，2019 年入驻
- 风格：非标、自然花园、主理人长居、独栋
- 客房：4 间，2 间开放给数字游民长租
- 不挂平台，只接受口碑 + 朋友介绍
- 主理人做创作（微电影/原创音乐/绘画/茶会）
- 适合：懂空间美学的创作者、重视主理人氛围的访客
- 价格：不公开，引导联系主理人

---

## git 注意事项

- `.env` 已在 `.gitignore`，不要 commit
- API key 在 `backend/.env`，仅本地使用
- 正常 commit 流程：`git add` 具体文件，`git commit -m "..."`
- 当前分支：`master`

---

## 完成标准 checklist

- [ ] `vault/wiki/sources/longxun-src-001.md` 至少存在（代表 Stage 1 开始）
- [ ] `wiki/sources/` 下有 ≥ 5 个 `longxun-src-*.md` 文件
- [ ] `node distill.js longxun` 运行成功，无 JSON parse 错误
- [ ] `persona-cards/longxun.json` 中 `placeholder` 字段为 `false` 或不存在
- [ ] `evidence_ledger` ≥ 8 条
- [ ] 浏览器访问 `/chat?slug=longxun`，龙寻能回答关于龙潭村历史的问题并引用 [c-NNN]
- [ ] 龙寻能在 3-4 轮对话后调用 `propose_itinerary` 工具输出方案卡片
