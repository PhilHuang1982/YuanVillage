/* ============================================================
   app.jsx — 主入口：状态机 + 场景调度 + 对话系统
   ============================================================ */

const { useState: useSt, useEffect: useEf, useRef: useRf } = React;

/* —— 默认 Tweaks（块内 JSON 会被宿主直写） —— */
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "textSpeed": 30,
  "dialogStyle": "ink-paper",
  "showHints": true,
  "ambientMotion": true,
  "uiAccent": "#d97757"
}/*EDITMODE-END*/;

/* —— 静态数据：活动 / 作品 —— */
const XM_QUESTS = [
  {
    title: "春茶分享会",
    when: "下周六 14:00",
    desc: "桩主自己烘的福鼎白茶，搭村里阿婆做的茶点。坐在花圃边喝，下午阳光会斜过来。",
    tags: ["茶会", "限 6 人", "免费"],
    tone: "var(--moss-600)",
    xp: 15,
  },
  {
    title: "空间美学一对一导览",
    when: "预约制 · 每周三/五",
    desc: "由桩主带你走一遍小梅桩——为什么这把椅子放这个角落，为什么这幅画挂这个房间。约 90 分钟。",
    tags: ["导览", "预约"],
    tone: "var(--persimmon-500)",
    xp: 18,
  },
  {
    title: "深度访谈接待",
    when: "申请制",
    desc: "若你是创作者、记者或研究者，可申请一次桩主的访谈时间。会被她反过来访谈。",
    tags: ["访谈", "需申请"],
    tone: "var(--water-500)",
    xp: 20,
  },
];

const XM_WORKS = [
  {
    title: "《我是谁》",
    year: "2021 · 2023 发布",
    kind: "微电影",
    icon: "影",
    bg: "linear-gradient(135deg, #3d5560, #1b1612)",
  },
  {
    title: "《我的水晶笔》",
    year: "2022",
    kind: "儿童微电影",
    icon: "童",
    bg: "linear-gradient(135deg, #84a17a, #4f7259)",
  },
  {
    title: "鹿与月湖",
    year: "2024",
    kind: "油画",
    icon: "画",
    bg: "linear-gradient(135deg, #6b97a3, #3d6770)",
  },
  {
    title: "风吹过的山坡上",
    year: "2022",
    kind: "原创歌",
    icon: "音",
    bg: "linear-gradient(135deg, #d97757, #a4502f)",
  },
  {
    title: "在水之洲（专场）",
    year: "2025·9",
    kind: "现场",
    icon: "演",
    bg: "linear-gradient(135deg, #a4502f, #5f2b14)",
  },
  {
    title: "客房壁画",
    year: "持续",
    kind: "壁画",
    icon: "壁",
    bg: "linear-gradient(135deg, #c7d6b0, #84a17a)",
  },
];

/* —— 解析对话节点（跟随 .next 跳转直到稳定节点） —— */
function resolveNode(scripts, id) {
  let cur = scripts[id];
  while (cur && cur.next && !cur.text) cur = scripts[cur.next];
  return cur;
}

/* ============================================================
   主 App
   ============================================================ */
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  const [scene, setScene] = useSt("village");     // "village" | "xiaomeizhuang"
  const [dialog, setDialog] = useSt(null);        // { actor, nodeId }
  const [xp, setXp] = useSt(0);
  const [seen, setSeen] = useSt(new Set());       // 已访问节点
  const [panel, setPanel] = useSt(null);          // "quest" | "works" | null
  const [transitioning, setTrans] = useSt(false);
  const [llmBusy, setLlmBusy] = useSt(false);     // 自由输入时 Claude 是否在思考
  const freeHistoryRef = useRf({ longxun: [], xiaomei: [] });
  const lastScriptedNodeRef = useRf({ longxun: "open", xiaomei: "open" });

  const addXp = (delta) => setXp((v) => v + delta);

  /* 对话节点跳转 */
  function openDialog(actor, nodeId = "open") {
    const node = resolveNode(window.SCRIPTS[actor], nodeId);
    if (!node) return;
    setDialog({ actor, nodeId: nodeId });
    // 记住最近一个剧本节点（用户走 freeform 后能回到这里）
    if (!nodeId.startsWith("__free_") && !nodeId.startsWith("__claude_")) {
      lastScriptedNodeRef.current[actor] = nodeId;
    }
    const k = `${actor}:${nodeId}`;
    if (!seen.has(k)) {
      addXp(actor === "longxun" ? 3 : 5);
      const ns = new Set(seen); ns.add(k); setSeen(ns);
    }
  }
  function closeDialog() {
    setDialog(null);
  }
  function handleChoose(value, choice) {
    // 处理 action（如 enter_xiaomeizhuang / back_to_map）
    if (choice.action === "enter_xiaomeizhuang") {
      setTrans(true);
      setDialog(null);
      setTimeout(() => {
        setScene("xiaomeizhuang");
        addXp(20);
        setTimeout(() => openDialog("xiaomei", "open"), 350);
        setTimeout(() => setTrans(false), 600);
      }, 350);
      return;
    }
    if (choice.action === "back_to_map") {
      setTrans(true);
      setDialog(null);
      setTimeout(() => {
        setScene("village");
        setTimeout(() => setTrans(false), 600);
      }, 350);
      return;
    }
    // 普通跳转
    if (choice.next) openDialog(dialog.actor, choice.next);
    else closeDialog();
  }

  async function handleFree(text) {
    const actor = dialog.actor;
    const sys = window.PERSONA_PROMPTS?.[actor];
    if (!sys) { return; }

    // 当前剧本节点上下文，帮 Claude 接得上
    const lastNode = resolveNode(window.SCRIPTS[actor], lastScriptedNodeRef.current[actor]);
    const sceneCtx = lastNode?.text ? `（上一句你刚说："${lastNode.text}"）` : "";

    const hist = freeHistoryRef.current[actor];
    hist.push({ role: "user", content: text });

    setLlmBusy(true);
    // 立刻显示"思考中"占位节点
    const thinkingId = "__claude_thinking_" + Date.now();
    window.SCRIPTS[actor][thinkingId] = {
      speaker: actor,
      name: actor === "longxun" ? "龙寻" : "小梅",
      sub: actor === "longxun" ? "村管家·思考中" : "小梅·思考中",
      text: "（沉吟片刻……）",
      choices: [],
    };
    setDialog({ actor, nodeId: thinkingId });

    try {
      const reply = await window.claude.complete({
        messages: [
          { role: "user", content: `${sys}\n\n${sceneCtx}\n\n用户对你说：${text}\n\n请直接以角色身份回答，简短，不超过 100 字。` },
          ...hist.slice(-6).map(h => ({ role: h.role, content: h.content })).slice(0, -1),
          { role: "user", content: text },
        ],
      });

      hist.push({ role: "assistant", content: reply });

      // 替换节点
      const replyId = "__claude_" + Date.now();
      window.SCRIPTS[actor][replyId] = {
        speaker: actor,
        name: actor === "longxun" ? "龙寻" : "小梅",
        sub: actor === "longxun" ? "村管家·实时" : (scene === "xiaomeizhuang" ? "小梅·实时" : "小梅"),
        text: reply,
        choices: [
          { label: "← 回到对话主线", next: lastScriptedNodeRef.current[actor] },
        ],
      };
      setDialog({ actor, nodeId: replyId });
      addXp(2);
    } catch (err) {
      console.error("[Claude]", err);
      const errId = "__claude_err_" + Date.now();
      window.SCRIPTS[actor][errId] = {
        speaker: actor,
        name: actor === "longxun" ? "龙寻" : "小梅",
        sub: "（信号有点远）",
        text: actor === "longxun"
          ? "山里的信号不太稳，刚才那句你再说一遍？"
          : "刚走神了。你再说一遍。",
        choices: [
          { label: "← 回到对话主线", next: lastScriptedNodeRef.current[actor] },
        ],
      };
      setDialog({ actor, nodeId: errId });
    } finally {
      setLlmBusy(false);
    }
  }

  const currentNode = dialog
    ? resolveNode(window.SCRIPTS[dialog.actor], dialog.nodeId)
    : null;

  const currentVisit = scene === "xiaomeizhuang" ? "小梅桩" : "龙潭村";

  return (
    <div className="paper-bg no-select" style={{
      position: "relative",
      width: "100vw",
      height: "100vh",
      overflow: "hidden",
      fontFamily: "var(--font-sans)",
      color: "var(--ink-900)",
    }}>
      {/* —— Village Scene —— */}
      {scene === "village" && (
        <>
          <div style={{ position: "absolute", inset: 0 }}>
            <VillageMap style={{ width: "100%", height: "100%" }} />
          </div>

          {/* 龙寻 NPC 站位（村口廊桥附近） */}
          <NPC
            name="longxun"
            x={50.5}
            y={70}
            label="村管家·龙寻"
            prompt={t.showHints && !seen.has("longxun:open") ? "点我说话" : null}
            scale={0.85}
            onClick={() => openDialog("longxun", "open")}
          />

          {/* 小梅桩 pin */}
          <MapPin
            x={37}
            y={75}
            label="小梅桩"
            color="var(--persimmon-500)"
            onClick={() => {
              setTrans(true);
              setTimeout(() => {
                setScene("xiaomeizhuang");
                addXp(20);
                setTimeout(() => openDialog("xiaomei", "open"), 350);
                setTimeout(() => setTrans(false), 600);
              }, 350);
            }}
          />

          {/* 138 基地 pin (locked) */}
          <MapPin
            x={71}
            y={50}
            label="138 数字游民基地"
            color="var(--water-500)"
            locked
            onClick={() => {
              // 显示锁定提示
              alert("（demo 未开放）138 基地空间即将上线");
            }}
          />

          {/* 装饰：廊桥点位 */}
          <MapPin x={45} y={70} label="廊桥" color="var(--ink-700)" locked
            onClick={() => alert("（demo 未开放）廊桥故事即将上线")} />
          <MapPin x={28} y={50} label="老酒坊" color="var(--persimmon-700)" locked
            onClick={() => alert("（demo 未开放）老酒坊主理人未上线")} />
          <MapPin x={85} y={75} label="古琴坊" color="var(--moss-600)" locked
            onClick={() => alert("（demo 未开放）古琴坊主理人未上线")} />
        </>
      )}

      {/* —— Space Scene: 小梅桩 —— */}
      {scene === "xiaomeizhuang" && (
        <XiaomeiZhuangScene>
          {/* 小梅 NPC（庭院中间） */}
          <NPC
            name="xiaomei"
            x={50}
            y={68}
            label="小梅 · 桩主"
            prompt={t.showHints && !seen.has("xiaomei:open") ? "点她说话" : null}
            scale={1.0}
            onClick={() => openDialog("xiaomei", "open")}
            badge={!seen.has("xiaomei:open") ? "！" : "?"}
          />

          {/* 副 NPC：村里小孩在跑（装饰）*/}
          <div style={{
            position: "absolute",
            left: "78%", top: "85%",
            transform: "translate(-50%, -100%)",
            fontFamily: "var(--font-serif)",
            fontSize: 11,
            color: "var(--ink-500)",
            background: "var(--paper-50)",
            border: "1.5px dashed var(--ink-500)",
            padding: "2px 8px",
            borderRadius: 4,
            opacity: .85,
          }}>村里的孩子跑过</div>

          {/* 工具栏：任务板 + 作品墙 */}
          <ToolDock buttons={[
            { icon: "任", label: "活动", onClick: () => setPanel("quest"), badge: XM_QUESTS.length, tone: "var(--persimmon-500)" },
            { icon: "作", label: "作品", onClick: () => setPanel("works"), badge: XM_WORKS.length, tone: "var(--moss-600)" },
          ]} />

          <QuestBoard open={panel === "quest"} onClose={() => setPanel(null)} items={XM_QUESTS} />
          <WorksWall open={panel === "works"} onClose={() => setPanel(null)} items={XM_WORKS} />
        </XiaomeiZhuangScene>
      )}

      {/* —— HUD —— */}
      <HUD
        scene={scene}
        xp={xp}
        currentVisit={currentVisit}
        onBack={() => {
          setTrans(true);
          setDialog(null);
          setTimeout(() => {
            setScene("village");
            setTimeout(() => setTrans(false), 600);
          }, 350);
        }}
      />

      {/* —— 转场遮罩 —— */}
      <SceneTransition show={transitioning} />

      {/* —— RPGDialog —— */}
      {dialog && currentNode && (
        <RPGDialog
          speaker={dialog.actor}
          name={currentNode.name || (dialog.actor === "longxun" ? "龙寻" : "小梅")}
          nameSub={currentNode.sub}
          text={currentNode.text}
          choices={
            currentNode.end
              ? [{ label: "← 关闭对话", value: "__close" }]
              : (currentNode.choices || [])
          }
          accent={t.uiAccent}
          speed={t.textSpeed}
          busy={llmBusy}
          onClose={closeDialog}
          onFree={handleFree}
          onChoose={(val, choice) => {
            if (val === "__close") return closeDialog();
            handleChoose(val, choice);
          }}
        />
      )}

      {/* —— 标题角章（左下） —— */}
      <div style={{
        position: "absolute",
        bottom: 18, left: 20,
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        gap: 10,
        pointerEvents: "none",
      }}>
        <div style={{
          width: 36, height: 36,
          background: "var(--persimmon-700)",
          color: "var(--paper-50)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--font-serif)",
          fontSize: 22, fontWeight: 700,
          border: "1.5px solid var(--ink-900)",
          boxShadow: "0 2px 0 var(--ink-900)",
        }}>元</div>
        <div>
          <div style={{
            fontFamily: "var(--font-serif)", fontSize: 14, fontWeight: 600,
            color: "var(--ink-900)", letterSpacing: "0.1em",
          }}>元家乡 2050</div>
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 10,
            color: "var(--ink-500)", letterSpacing: "0.15em",
          }}>LONG·TAN · QUEST</div>
        </div>
      </div>

      {/* —— Tweaks 面板 —— */}
      <TweaksPanel title="Tweaks">
        <TweakSection title="对话节奏">
          <TweakSlider label="文字速度" hint="每字毫秒，越小越快" min={5} max={80} step={1}
                       value={t.textSpeed} onChange={(v) => setTweak("textSpeed", v)} />
          <TweakToggle label="显示新手提示" value={t.showHints} onChange={(v) => setTweak("showHints", v)} />
        </TweakSection>
        <TweakSection title="视觉">
          <TweakColor label="UI 点缀色" value={t.uiAccent}
                      options={["#d97757", "#a4502f", "#6b97a3", "#4f7259", "#9b7651"]}
                      onChange={(v) => setTweak("uiAccent", v)} />
          <TweakToggle label="NPC 浮动动画" value={t.ambientMotion}
                       onChange={(v) => setTweak("ambientMotion", v)} />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
