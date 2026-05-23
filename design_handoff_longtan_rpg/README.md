# 交接：龙潭村 RPG 探索原型 → XianJian 项目

> **给 Claude Code 的开发者**：这份文档是高保真设计原型的工程交接说明。原型在 OM (Anthropic Skills) 环境中用 React + 内联 SVG 完成，**不是要直接搬代码**，而是要把它**重新实现在你已有的 XianJian/frontend 代码库中**，复用你已有的 React + Vite + Tailwind + zustand 技术栈。

---

## 1. 这个原型是什么？

把**元家乡 2050** 从"旅游 App"升级成"**解谜冒险游戏**"风格的探索体验：

- **村管家龙寻** 不再是按钮——他是一个二头身卡通 NPC，**站在地图上**，玩家点击他触发对话
- **空间详情页**（如小梅桩）不再是 tab 切换——**保留俯视地图视角**，主理人作为 NPC 站在自己的庭院里
- **对话框** 是经典 RPG 风格：头像 + 名牌 + 打字机文字 + 编号选项按钮 + 自由输入框
- 整体视觉：**现代国风插画**（线稿 + 水彩晕染 + 宣纸纸纹）

参考游戏：
- 《动物森友会》—— 地图 + NPC 站位 + 对话框
- 《Stardew Valley》—— NPC 对话风格（portrait + name + text box）
- 《未定事件簿》—— 现代感角色对话 UI

### 设计截图（在 `screenshots/` 文件夹）

| 文件 | 内容 |
|---|---|
| `01-village-with-longxun.png` | 村庄主界面 · 龙寻站在中央，头顶"！"徽章 + "点我说话"气泡 |
| `02-rpg-dialog-longxun.png` | 龙寻 RPG 对话框 · 头像 + 名牌 + 文字 + 3 选项 |
| `03-xiaomeizhuang-courtyard.png` | 小梅桩庭院全景 · 房屋、花圃、茶桌、猫、鸟笼、小梅 NPC |
| `04-xiaomei-dialog.png` | 小梅对话中 · 文中带 `[c-002]` 证据引用 |
| `05-quest-board.png` | 任务板 SlideOver · 3 张活动卡片 + 元气奖励 |
| `06-works-wall.png` | 作品收藏墙 · 拍立得风格 6 张作品卡 |

## 2. 保真度

**高保真原型（hi-fi）**。所有视觉、动效、交互都已落地：颜色、字体、间距、过场、打字机、状态切换都按最终意图实现。开发时**像素级还原**——但用你 XianJian 项目里已有的 React + Tailwind 生态，不要直接搬我的内联 style。

## 3. 当前原型 vs. 真实集成

| 模块 | 原型现状（在这里）| 真实数据源（应该接到哪里）|
|---|---|---|
| 对话内容 | `src/dialog-scripts.js` 我手写的 ~20 个剧本节点 | XianJian 后端 `POST /api/chat`（已有），读 `vault/persona-cards/*.json` |
| 自由输入回复 | `window.claude.complete()`（OM 平台内置 Haiku）| 后端 `personaAgent.js` → DeepSeek |
| 活动列表 | `src/app.jsx` 里硬编码 `XM_QUESTS` 数组 | `vault/wiki/activities/xiaomeizhuang/*.md` （需写 loader + 路由）|
| 作品列表 | `src/app.jsx` 里硬编码 `XM_WORKS` 数组 | `vault/wiki/works/*.md` + `worksLoader.js`（已存在）|
| 空间数据 | 直接画在 SVG 里（map_position 写死）| `vault/wiki/spaces/*.md` + `/api/spaces`（已有，需扩展）|
| 引用 [c-NNN] | 剧本里手写 | 来自 `persona-cards/xiaomei.json` 的 `evidence_ledger` |
| 龙寻数据 | `dialog-scripts.js` + `persona-prompts.js` | **MVP2 任务**：等《乡村造梦记》ingest 完成后蒸馏出 `longxun.json` |

**核心交接任务 = 把上面所有 mock 数据全部替换成真实 API 调用。**

## 4. 素材剥离任务（重要）

原型里**所有视觉元素都是 SVG 内联在 JSX 里**——这对原型方便，对生产不友好。

请抽出 `XianJian/frontend/public/assets/` 目录，结构如下：

```
public/assets/
├── characters/
│   ├── longxun-sprite.svg     # 来自 src/characters.jsx LongxunSprite
│   ├── longxun-portrait.svg   # 来自 src/characters.jsx LongxunPortrait
│   ├── xiaomei-sprite.svg
│   └── xiaomei-portrait.svg
├── maps/
│   ├── village-longtan.svg    # 来自 src/village-map.jsx
│   └── space-xiaomeizhuang.svg # 来自 src/xiaomeizhuang-scene.jsx
└── ui/
    └── seal-yuan.svg           # "元" 角章
```

**重构方式**：

1. 把每个 SVG 组件的内容（`<svg>...</svg>`）抽到独立 .svg 文件
2. 组件改为加载 SVG 文件：

```jsx
// 旧（原型）
<LongxunSprite className="..." />

// 新（生产）
<img src="/assets/characters/longxun-sprite.svg" alt="龙寻" className="..." />
// 或者用 react-svgr 引入为组件以便 CSS 控制
```

3. **未来用户可以替换 SVG/PNG 文件**而不动代码。如果用户后续提供 PNG 立绘，把对应文件替换即可。

## 5. 文件清单（在 `prototype/` 子目录中）

| 文件 | 作用 | 迁移目标位置 |
|---|---|---|
| `龙潭村奇遇.html` | 主入口 | 整合进 React Router 现有路由 `/`（替换 VillageMap）|
| `src/tokens.css` | 设计令牌（颜色、字体、间距）| `XianJian/frontend/src/styles/rpg-tokens.css`，与 `globals.css` 合并 |
| `src/characters.jsx` | 角色立绘 | 拆素材 + `src/components/Char{Sprite,Portrait}.jsx` |
| `src/village-map.jsx` | 龙潭村地图 SVG | 拆素材 + `src/components/maps/VillageMap.jsx` |
| `src/xiaomeizhuang-scene.jsx` | 小梅桩庭院 SVG | 拆素材 + `src/components/maps/XiaomeiZhuangScene.jsx` |
| `src/rpg-dialog.jsx` | RPG 对话框（打字机 + 选项 + 输入）| `src/components/RPGDialog.jsx` |
| `src/scene-ui.jsx` | NPC, MapPin, HUD, SceneTransition | `src/components/scene/*.jsx` |
| `src/side-panels.jsx` | QuestBoard, WorksWall, ToolDock | `src/components/panels/*.jsx` |
| `src/dialog-scripts.js` | 对话剧本（开场白 + 跟进选项模板）| **拆**：开场白 + fallback 选项保留在前端；具体回答从 backend 拿 |
| `src/persona-prompts.js` | Claude 系统提示词 | **不要迁移**——真实系统从 `vault/persona-cards/*.json` 的 `system_prompt` 字段读 |
| `src/app.jsx` | 主状态机 + 场景调度 | `src/pages/VillageMap.jsx` + `src/pages/SpaceDetail.jsx`（重写）|

## 6. 设计 Tokens

完整 token 表见 `prototype/src/tokens.css`。核心摘录：

### 颜色

| Token | Hex | 用途 |
|---|---|---|
| `--paper-50` | `#fbf6ea` | 米白宣纸（最亮，对话框底）|
| `--paper-100` | `#f5ecd7` | 米黄纸（页面底）|
| `--paper-200` | `#ead9b6` | 老纸（卡片）|
| `--ink-900` | `#1b1612` | 浓墨（边框、标题、强文）|
| `--ink-700` | `#3a2f25` | 重墨 |
| `--ink-500` | `#6a5740` | 淡墨（辅助文字）|
| `--ink-300` | `#a6927a` | 飞白（次级灰）|
| `--moss-400` | `#84a17a` | 远山绿 |
| `--moss-600` | `#4f7259` | 林荫深绿 |
| `--water-300` | `#a8c4cb` | 溪流浅 |
| `--water-500` | `#6b97a3` | 深水 |
| `--persimmon-500` | `#d97757` | **品牌橙**，主点缀色 |
| `--persimmon-700` | `#a4502f` | 印章 / 强 CTA |
| `--wood-500` | `#9b7651` | 老木 |
| `--wood-700` | `#6b4c30` | 屋脊瓦 |

### 字体

| Token | 字体栈 | 用途 |
|---|---|---|
| `--font-serif` | `"Noto Serif SC"`, `"Source Han Serif SC"`, `"Songti SC"`, `"STSong"`, serif | 标题、对话文字、名牌 |
| `--font-sans` | `"Noto Sans SC"`, `"PingFang SC"`, `"Hiragino Sans GB"`, `"Microsoft YaHei"`, sans-serif | UI、输入框 |
| `--font-mono` | `"JetBrains Mono"`, `ui-monospace`, monospace | 数字（元气值、坐标）|

### 圆角 & 阴影

| Token | 值 | 用途 |
|---|---|---|
| `--r-sm / md / lg / xl` | `6 / 12 / 20 / 28` | 卡片、按钮、面板 |
| `--shadow-soft` | `0 2px 6px rgba(43,30,15,.08), 0 8px 24px rgba(43,30,15,.06)` | 卡片 |
| `--shadow-frame` | `0 4px 0 rgba(27,22,18,.85), 0 12px 24px rgba(27,22,18,.20)` | RPG 按钮 |

### 纸纹 & 笔触

`.paper-bg` 类提供 SVG turbulence noise + 渐变光斑底，复制到生产环境即可。

## 7. 屏幕 / 视图

### 7.1 VillageScene（村庄主界面，路由 `/`）

**布局**：全屏 1600×1000 viewBox SVG 底图（自动 cover），叠加层放 NPC 和 MapPin。

**包含**：
- `<VillageMap>` 全屏底图（手绘地图，含远近三层山、龙潭溪、廊桥、田垄、村屋群、竹林、罗盘、村名印章）
- `<NPC name="longxun" x={50.5} y={70}>` 龙寻立绘，头顶 ! 徽章 + "点我说话" 浮动气泡
- 多个 `<MapPin>`：
  - 小梅桩 `x={37} y={75}` 橙色，可点击 → 进入空间
  - 138 数字游民基地 `x={71} y={50}` 水色，**locked**
  - 廊桥 / 老酒坊 / 古琴坊 三个 locked pin（占位，未来扩展）
- 顶部 `<HUD>`：元气数值 + 当前位置
- 左下角"元" 角章 + 项目名 "元家乡 2050"
- 右下角 `<TweaksPanel>`（开发期可见）

**交互**：
- 点击 NPC 龙寻 → 打开 `<RPGDialog>` 加载剧本节点 `longxun.open`
- 点击小梅桩 pin → 场景转场（黑色快闪 0.55s）→ 跳到 SpaceScene + 自动打开 `xiaomei.open` 对话
- 点击 locked pin → alert 提示"demo 未开放"

### 7.2 SpaceScene · 小梅桩（路由 `/space/xiaomeizhuang`）

**布局**：全屏 1600×1000 viewBox SVG 庭院（保留俯视感）。

**包含**：
- `<XiaomeiZhuangScene>` 背景：天空渐变、远山、院墙、地面、青石路、主屋（带门、窗、檐下灯笼、门口黑板写 "My Home / My Life Style"）、左右两块花圃、茶桌、猫、鸟笼
- `<NPC name="xiaomei" x={50} y={68} scale={1.0}>` 小梅立绘
- `<HUD>` 顶部带 "← 回村庄" 按钮
- `<ToolDock>` 右侧浮起两个工具按钮：
  - **任 活动** 徽章 3（橙色），打开 `<QuestBoard>`
  - **作 作品** 徽章 6（绿色），打开 `<WorksWall>`

**关键决策**：原本的 tab 切换（对话 / 活动 / 作品）被替换为：
- 对话 = 默认打开的 RPGDialog
- 活动 = 可召唤的 SlideOver 任务板（右侧滑出）
- 作品 = 可召唤的 SlideOver 作品墙（右侧滑出）

### 7.3 RPGDialog（核心对话组件，可复用）

**位置**：`position: absolute; bottom: 0`，全宽，最大内容宽 920px 居中。

**结构**：
```
┌─ NamePlate（漂浮在对话框顶部）─────────────────┐
│  ● 角色名  · 子标题                              │ 
├──────────────────────────────────────────────────┤
│ ┌─────┐  对话文字（打字机逐字出现）           ▼  │
│ │头像 │                                          │
│ │112× │  ┌────────────┐ ┌────────────┐         │
│ │122  │  │ ① 选项 1   │ │ ② 选项 2   │         │
│ │     │  └────────────┘ └────────────┘         │
│ │     │  ┌────────────┐                         │
│ │     │  │ ③ 选项 3   │                         │
│ │     │  └────────────┘                         │
│ └─────┘                                          │
│         › [自由输入...                    ] [说] │
└──────────────────────────────────────────────────┘
                                                  ×（右上角关闭）
```

**API**：

```ts
interface RPGDialogProps {
  speaker: "longxun" | "xiaomei";  // 决定头像
  name: string;                     // 名牌主文
  nameSub?: string;                 // 名牌副文（"村管家 · 龙潭村"）
  text: string;                     // 角色台词
  choices?: { label: string; hint?: string; value?: any; next?: string; action?: string }[];
  onChoose?: (value, choice) => void;
  onFree?: (text: string) => void | Promise<void>;
  speed?: number;                   // 打字机速度，ms/字，默认 30
  busy?: boolean;                   // 等待 LLM 时禁用输入
  accent?: string;                  // UI 点缀色
  onClose?: () => void;
  showChoicesEarly?: boolean;       // 不等打字机完成就显示选项
}
```

**行为细节**：
- 打字机：每字 30ms（可配置）。完成时显示橙色 ▼ 提示继续
- 点击对话框任意位置 / 空格 / 回车 → 立即跳过打字机到完整文本
- 选项按钮：编号 1/2/3，cream 底 + 墨色边框 + 3px 投影。Hover 变更深一档，Active 下压 3px
- 自由输入：永远显示（在选项下方）。busy 状态时输入框灰、placeholder 变"对方正在思考…"
- 关闭键 X：浮在右上角

### 7.4 ToolDock + SlideOver（QuestBoard / WorksWall）

**ToolDock** 浮在场景右侧，垂直堆叠按钮（52×52）。每个按钮带 icon 字、label、右上角数字徽章。点击展开对应 SlideOver。

**SlideOver** 从右侧推入（width: min(420px, 90vw)，全高）。结构：
- 顶部 header：icon 方块 + 标题 + X 关闭
- Body：可滚动内容
- 遮罩：rgba(27,22,18,.35)

**QuestBoard 内容**：任务卡列表，每张卡片：标题、时间、描述、标签、"+15 元气"奖励。
**WorksWall 内容**：2 列拍立得风格网格，每张卡片轻微旋转 ±1.5°，hover 时回正 + 缩放 1.03。

## 8. 交互流程

```
[村庄地图] 
  ├─ 点击 龙寻 NPC ──→ 打开 RPGDialog (longxun.open)
  │   └─ 选 "我想找个有意思的主理人" → ...路由对话 → 选 "好，去小梅桩"
  │       └─ choice.action === "enter_xiaomeizhuang" 
  │           └─ 场景转场（黑色快闪 550ms）→ SpaceScene
  │
  ├─ 点击 小梅桩 MapPin ──→ 转场 → SpaceScene + 自动开对话 (xiaomei.open)
  │
  └─ 点击 锁定 pin ──→ alert
  
[空间场景 · 小梅桩]
  ├─ 点击 小梅 NPC ──→ 打开 RPGDialog (xiaomei.open)
  │   ├─ 走对话分支
  │   └─ 自由输入 → 调 backend /api/chat → 替换为 Claude 回复 + 一个 "回到对话主线" 按钮
  ├─ 点击 任 ──→ 打开 QuestBoard SlideOver
  ├─ 点击 作 ──→ 打开 WorksWall SlideOver
  └─ 点击 "← 回村庄" ──→ 转场 → VillageScene
```

## 9. 元气（XP）系统

| 动作 | 奖励 |
|---|---|
| 访问新对话节点 | 龙寻 +3, 小梅 +5 |
| 进入空间 | +20 |
| 自由输入对话 | +2/次 |

数值显示在顶部 HUD 圆角条里：`✦ 28 元气 · 小梅桩`。

可考虑：用 zustand store（你已有依赖）+ localStorage 持久化。原型用 `useState` 内存态。

## 10. 对话脚本结构

每个角色一个剧本对象，键是节点 ID：

```js
{
  open: {                         // 入口节点
    speaker: "longxun",
    name: "龙寻",
    sub: "村管家 · 龙潭村",       // 名牌副标题
    text: "你来了。\n\n这条溪...",
    choices: [
      { label: "我想了解这个村", next: "history" },
      { label: "想找个有意思的主理人", next: "match_intro" },
      { label: "我就随便看看", next: "wander" },
    ],
  },
  // 跳转节点（无 text，只 next）
  back_to_open: { next: "open" },
  // 终结节点
  wander: { ..., end: true },
  // 触发 action 而非跳转
  route_xiaomei: {
    text: "...",
    choices: [
      { label: "好，去敲门 →", action: "enter_xiaomeizhuang" },
      { label: "我再想想", next: "wander" },
    ],
  },
}
```

**生产环境改造**：
1. 保留 `open` 节点和 5-10 个"骨架引导"节点在前端，避免每次开场都打 API
2. 当用户选某个选项 next 不在前端时，发 POST `/api/chat` 让 LLM 返回 `{ text, suggestedChoices, toolResult? }`
3. 后端 `persona-cards/*.json` 的 `mes_example` 字段可注入对话模板

## 11. Tweaks（开发期面板）

右下角浮起的设计面板，提供运行时调参：

- **文字速度**：5–80ms / 字
- **UI 点缀色**：4 档色板（橙、深橙、水蓝、苔绿）
- **NPC 浮动动画**：开关
- **显示新手提示**：开关

迁移到生产时**可去掉** 或者作为开发模式 toggle。

## 12. 已知限制 / 待办

- [ ] **龙寻 persona card 还是 placeholder**（XianJian/vault/persona-cards/longxun.json），等《乡村造梦记》OCR + 蒸馏完成
- [ ] 138 数字游民基地等其他空间的场景图还没画
- [ ] 主理人浅予（138 大管家）的立绘没有
- [ ] 元气只是装饰，没有 unlock 机制
- [ ] 没有 mobile 适配（对话框在 < 640px 屏幕上可能挤）
- [ ] 没有键盘 a11y（除了空格跳过打字机）
- [ ] SceneTransition 的卷轴展开动画现在用的是简单黑色快闪，可以做得更精致

## 13. 给开发者的建议优先级

```
1. 先把 prototype/src/tokens.css 合并进 globals.css
2. 把 RPGDialog 组件原样搬到 src/components/，独立测试 UI 一致性
3. 把 NPC / MapPin / HUD / SceneTransition 搬到 src/components/scene/
4. SVG 素材剥离（characters/maps），改为 <img src=...> 加载
5. 重写 src/pages/VillageMap.jsx 用新组件 + 接 /api/spaces
6. 重写 src/pages/SpaceDetail.jsx 用新组件 + 接 /api/chat
7. 把 dialog-scripts 退化成"开场白模板"+ 让 backend 返回 suggestedChoices
8. 接 zustand 做元气持久化
9. 把 Tweaks 面板留作 dev-only
```

每一步都可以独立验证，不会让整个 app 长时间坏掉。

---

**祝玩得开心。这个原型不是终点，是一种"游戏感探索"的可能性 demo——具体落地时一切结构都可以重新设计。**
