# Wiki 操作日志

---

## [2026-05-21] ingest | xiaomei 原始素材编译

**执行者**：Claude (claude-sonnet-4-5)，作为 LLM 直接执行 wiki ingest

### 读取 raw 文件
共读取 10 篇 .md 文件：
- 六年龙潭岁月：在风吹过的山坡上歌唱.md（视频号）
- 小梅庄的诗与远方：我在龙潭村的山居生活.md（视频号）
- 《我是谁》- 我的第一部微电影.md（公众号 2023-03-17）
- 《我的水晶笔》- 我为龙潭小朋友们拍的一部儿童片.md（公众号 2022-12-13）
- 梅宏：一溪清流到龙潭.md（公众号 2020-05-08，牧少）
- 在状元台唱响心声：我的专场演唱会圆满落幕.md（视频号）
- 冬日龙潭村：炉火与歌声中的温暖相聚.md（视频号）
- 小梅桩，我在龙潭村的家：厨房里的歌声与日常.md（视频号）
- 小梅桩的客房.md（meipian.cn）
- 同步助手_2026-05-21.md（朋友圈图片消息，仅图片）

活动文件夹：5 个（歌剧&合唱、诗歌之夜、白牡丹茶会、在水之洲演唱会、月亮颂赏月晚会）

### 新建 wiki/sources
- xiaomei-src-001.md（来龙潭的原因/人文环境）
- xiaomei-src-002.md（时间vs金钱/律师转型）
- xiaomei-src-003.md（空间定位/理想客人/My Home My Life Style）
- xiaomei-src-004.md（《我的水晶笔》/对孩子的情感）
- xiaomei-src-005.md（《我是谁》微电影/创作态度）
- xiaomei-src-006.md（诗和远方/生活方式逐字稿）
- xiaomei-src-007.md（在状元台唱响心声/首演专场）
- xiaomei-src-008.md（六年龙潭岁月/原创歌曲）
- xiaomei-src-009.md（小梅桩的客房/空间描述）
- xiaomei-src-010.md（白牡丹茶会/朋友圈）

共 10 条

### 新建/更新 entities
- wiki/entities/xiaomei.md：追加"编译事实"段落（生平时间线 8 条、核心价值观 5 条、创作活动 5 条、代表性原话 4 条、视频资产 2 个）

### 新建 activities（基于 raw/活动/ 实际素材）
- 2025-02-07-geju-hechang.md（歌剧&合唱演出，与澳大利亚音乐人 Darryl 合唱《歌剧魅影》）
- 2025-07-18-shige-zhi-ye.md（小梅桩诗歌之夜，含温铁军教授、SeeDAO 数字游民）
- 2025-09-09-bainiudan-chahui.md（白牡丹茶会，三款白牡丹，茶后酒会舞会）
- 2025-09-13-zai-shui-zhi-zhou-yanchang.md（在水之洲个人首场专场演唱会，状元台）
- 2025-10-07-yueliangsong-shangyu.md（月亮颂赏月晚会，中秋即兴）

共 5 个（另有 3 个历史占位活动条目保留）

### 新建 works
- wiki/works/xiaomei-film-01.md（《我是谁》微电影，2021，vid: wxv_2765928080191422465）
- wiki/works/xiaomei-film-02.md（《我的水晶笔》儿童片，2022，vid: wxv_2702053366511861762）
- wiki/works/xiaomei-song-01.md（《风吹过的山坡上》原创歌曲，2025）

共 3 个（另有 1 个画作条目 xiaomei-painting-01.md 保留）

### 视频提取
- vid: wxv_2765928080191422465 → 《我是谁》微电影
- vid: wxv_2702053366511861762 → 《我的水晶笔》儿童片

共 2 个

### distill.js 更新
- 升级为 v0.4
- 文本来源从 raw/<slug>/*.md 改为 wiki/sources/<slug>-src-*.md
- 图片仍读自 raw/<slug>/图片资产/（多模态用）
- 加 --raw 参数可退回直接读 raw/（调试用）
