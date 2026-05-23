# Vault — 元家乡 2050 知识库

> **Single Source of Truth**：所有 AI 分身的原料、蒸馏产物、运行时数据都在这里。

## 目录说明

```
vault/
├── raw/                  # 蒸馏唯一输入源 (用户人工整理)
│   ├── xiaomei/          # 小梅桩主原料 (访谈摘录 + 公众号 + 朋友圈 + 人设笔记)
│   ├── longxun/          # 龙寻 (造梦记 OCR 产物, MVP2)
│   └── ...               # 其他主理人 (MVP4)
│
├── wiki/                 # Markdown 知识层
│   ├── village/          # 村庄实体
│   ├── entities/         # 人物实体骨架 (蒸馏原料之一)
│   ├── spaces/           # 空间实体 (基础导航单元)
│   ├── sources/          # 已清洗、可对外引用的源片段 (Evidence Panel 用)
│   ├── activities/       # 活动 (按空间子目录)
│   ├── works/            # 代表作品
│   ├── historical_events/
│   ├── intangible_heritage/
│   └── scenic_spots/
│
├── persona-cards/        # 蒸馏产物 (CCv3 JSON)
│   └── _archive/         # 旧版本归档
│
└── scripts/              # 蒸馏脚本
    ├── distill.js        # 主理人/云村民/steward 统一蒸馏
    ├── extract-book.js   # 《乡村造梦记》OCR + 章节切
    ├── distill-chapters.js
    ├── extract-facts.js
    └── extract-entities.js
```

## 约定

- `raw/` 中的内容**不对外展示**，是内部蒸馏原料，可含敏感原话
- `wiki/sources/` 中的内容是从 raw/ 挑出的**可引用片段**，会出现在前端 Evidence Panel
- persona-cards `_archive/` 目录已在根 `.gitignore` 中排除大文件；但 `.json` 本身入库
- 运行蒸馏：`cd vault/scripts && npm run distill <slug>`
