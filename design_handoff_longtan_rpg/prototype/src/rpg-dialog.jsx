/* ============================================================
   rpg-dialog.jsx — RPG 对话框
   头像 + 名牌 + 打字机文字 + 选项按钮 + (可选)自由输入
   ============================================================ */

const { useState, useEffect, useRef } = React;

/* ---------- 打字机 Hook ---------- */
function useTypewriter(text, speedMs = 28, enabled = true) {
  const [shown, setShown] = useState("");
  const [done, setDone] = useState(false);
  const skipRef = useRef(false);

  useEffect(() => {
    setShown("");
    setDone(false);
    skipRef.current = false;
    if (!text) { setDone(true); return; }
    if (!enabled) { setShown(text); setDone(true); return; }

    let i = 0;
    let timer;
    const tick = () => {
      if (skipRef.current) {
        setShown(text);
        setDone(true);
        return;
      }
      i++;
      setShown(text.slice(0, i));
      if (i >= text.length) { setDone(true); return; }
      timer = setTimeout(tick, speedMs);
    };
    timer = setTimeout(tick, speedMs);
    return () => clearTimeout(timer);
  }, [text, speedMs, enabled]);

  const skip = () => { skipRef.current = true; };
  return { shown, done, skip };
}

/* ---------- 名牌（书签悬挂样式） ---------- */
function NamePlate({ name, sub, accent = "#d97757" }) {
  return (
    <div
      className="rpg-nameplate"
      style={{
        position: "absolute",
        left: 24,
        top: -22,
        background: "var(--ink-900, #1b1612)",
        color: "var(--paper-50, #fbf6ea)",
        padding: "8px 18px 8px 14px",
        borderRadius: "4px 4px 4px 4px",
        fontFamily: "var(--font-serif)",
        fontSize: 17,
        letterSpacing: "0.06em",
        boxShadow: "0 4px 0 rgba(0,0,0,.25)",
        display: "flex",
        alignItems: "baseline",
        gap: 10,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: 99, background: accent, display: "inline-block" }} />
      <span style={{ fontWeight: 600 }}>{name}</span>
      {sub && <span style={{ color: "var(--paper-300, #d6c194)", fontSize: 11, letterSpacing: "0.15em" }}>{sub}</span>}
    </div>
  );
}

/* ---------- 选项按钮 ---------- */
function ChoiceButton({ label, hint, onClick, index, disabled }) {
  return (
    <button
      type="button"
      className="rpg-choice"
      onClick={onClick}
      disabled={disabled}
    >
      <span className="rpg-choice-num">{index + 1}</span>
      <span className="rpg-choice-label">{label}</span>
      {hint && <span className="rpg-choice-hint">{hint}</span>}
    </button>
  );
}

/* ---------- 自由输入条 ---------- */
function FreeformInput({ onSend, busy, placeholder = "想自己问点别的…" }) {
  const [v, setV] = useState("");
  const ref = useRef(null);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const t = v.trim();
        if (!t || busy) return;
        setV("");
        onSend(t);
      }}
      style={{
        display: "flex",
        gap: 8,
        marginTop: 4,
        alignItems: "stretch",
        position: "relative",
      }}
    >
      <span style={{
        position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
        color: "var(--ink-300)", fontSize: 14, fontFamily: "var(--font-mono)",
        pointerEvents: "none",
      }}>›</span>
      <input
        ref={ref}
        value={v}
        onChange={(e) => setV(e.target.value)}
        placeholder={busy ? "对方正在思考…" : placeholder}
        disabled={busy}
        className="rpg-freeform-input"
      />
      <button
        type="submit"
        disabled={!v.trim() || busy}
        className="rpg-freeform-send"
      >
        {busy ? "···" : "说"}
      </button>
    </form>
  );
}

/* ---------- 主对话框 ---------- */
/**
 * <RPGDialog
 *   speaker="longxun"
 *   name="龙寻"
 *   nameSub="村管家 · 龙潭村"
 *   text="…"
 *   choices={[{label, hint?, value}]}
 *   onChoose={(value) => ...}
 *   onFree={(text) => ...}                     // 可选，给自由输入
 *   speed={28}
 *   accent="#d97757"
 *   onClose={() => ...}                        // 右上角 X
 * />
 */
function RPGDialog({
  speaker,
  name,
  nameSub,
  text,
  choices = [],
  onChoose,
  onFree,
  speed = 28,
  accent,
  onClose,
  showChoicesEarly = false,
  busy = false,
}) {
  const { shown, done, skip } = useTypewriter(text, speed);

  // 空格 / 回车 跳过打字
  useEffect(() => {
    function onKey(e) {
      if (!done && (e.code === "Space" || e.code === "Enter")) {
        e.preventDefault();
        skip();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [done]);

  const canSeeChoices = showChoicesEarly || done;

  return (
    <div
      className="rpg-dialog-wrap"
      style={{
        position: "absolute",
        left: 0, right: 0, bottom: 0,
        padding: "0 16px 18px",
        zIndex: 40,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          maxWidth: 920,
          margin: "0 auto",
          position: "relative",
          pointerEvents: "auto",
        }}
      >
        {/* 名牌 */}
        <NamePlate name={name} sub={nameSub} accent={accent} />

        {/* 主框：左 头像 / 右 文本 */}
        <div
          className="rpg-dialog-box paper-bg"
          onClick={() => !done && skip()}
          style={{
            position: "relative",
            border: "2.5px solid var(--ink-900)",
            borderRadius: 14,
            boxShadow: "0 6px 0 var(--ink-900), 0 20px 40px rgba(27,22,18,.25)",
            padding: "18px 20px 16px",
            display: "grid",
            gridTemplateColumns: "112px 1fr",
            gap: 16,
            cursor: !done ? "pointer" : "default",
          }}
        >
          {/* 关闭键 */}
          {onClose && (
            <button
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              aria-label="关闭对话"
              style={{
                all: "unset",
                position: "absolute",
                top: -14, right: -14,
                cursor: "pointer",
                width: 32, height: 32, borderRadius: 99,
                background: "var(--ink-900)", color: "var(--paper-50)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, lineHeight: 1,
                boxShadow: "0 3px 0 rgba(0,0,0,.3)",
                zIndex: 2,
              }}
            >×</button>
          )}

          {/* 头像框（粘顶） */}
          <div
            style={{
              alignSelf: "start",
              width: 112,
              height: 122,
              border: "2.5px solid var(--ink-900)",
              borderRadius: 10,
              background: "linear-gradient(180deg, var(--paper-50), var(--paper-200))",
              boxShadow: "inset 0 0 0 3px var(--paper-50), 0 3px 0 var(--ink-900)",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <CharPortrait name={speaker} style={{ width: "100%", height: "100%" }} />
            {/* 微微角章 */}
            <div style={{
              position: "absolute", bottom: 6, right: 6,
              fontFamily: "var(--font-serif)", fontSize: 9,
              color: accent || "var(--persimmon-500)", fontWeight: 700,
              border: `1.5px solid ${accent || "var(--persimmon-500)"}`,
              padding: "1px 4px", borderRadius: 2,
              letterSpacing: "0.1em",
              writingMode: "vertical-rl",
            }}>
              {speaker === "longxun" ? "村" : "梅"}
            </div>
          </div>

          {/* 文本区 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, minHeight: 122 }}>
            {/* 文本：可滚动的最大高度 40vh */}
            <div
              className="rpg-text-scroll"
              style={{
                maxHeight: "min(40vh, 360px)",
                overflowY: "auto",
                paddingRight: 6,
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: 16,
                  lineHeight: 1.7,
                  color: "var(--ink-900)",
                  margin: 0,
                  letterSpacing: "0.02em",
                  whiteSpace: "pre-wrap",
                  minHeight: 44,
                }}
              >
                {shown}
                {!done && <span className="cursor-blink">▍</span>}
                {done && choices.length > 0 && <span className="continue-indicator">▼</span>}
              </p>
            </div>

            {/* 选项 */}
            {canSeeChoices && choices.length > 0 && (
              <div
                className="rpg-choices-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: choices.length > 2 ? "1fr 1fr" : "1fr",
                  gap: 8,
                  marginTop: 2,
                }}
              >
                {choices.map((c, i) => (
                  <ChoiceButton
                    key={i}
                    index={i}
                    label={c.label}
                    hint={c.hint}
                    disabled={busy}
                    onClick={(e) => { e.stopPropagation(); onChoose?.(c.value ?? c.label, c); }}
                  />
                ))}
              </div>
            )}

            {/* 自由输入（永远显示，除非显式关闭） */}
            {onFree && canSeeChoices && (
              <div onClick={(e) => e.stopPropagation()} style={{ marginTop: choices.length ? 2 : 0 }}>
                <FreeformInput onSend={onFree} busy={busy} />
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .cursor-blink {
          display: inline-block; width: 6px; margin-left: 1px;
          animation: cursor-blink 1s steps(2) infinite;
          color: var(--ink-500);
        }
        @keyframes cursor-blink { 50% { opacity: 0 } }
        .continue-indicator {
          display: inline-block;
          margin-left: 8px;
          color: var(--persimmon-500);
          animation: continue-bounce 1.2s ease-in-out infinite;
        }
        @keyframes continue-bounce {
          0%, 100% { transform: translateY(0) }
          50%      { transform: translateY(3px) }
        }
        @keyframes rpg-choices-in {
          from { opacity: 0; transform: translateY(6px) }
          to   { opacity: 1; transform: translateY(0) }
        }
      `}</style>
    </div>
  );
}

window.RPGDialog = RPGDialog;
window.useTypewriter = useTypewriter;
