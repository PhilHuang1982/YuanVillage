/* ============================================================
   scenes.jsx — VillageScene + SpaceScene
   ============================================================ */

const { useState: useS, useEffect: useE, useRef: useR, useMemo } = React;

/* ---------- NPC 容器（站位 + 浮动 + 点击 + 提示）---------- */
function NPC({ name, x, y, label, sub, prompt, onClick, scale = 1, mirror = false, badge = "！" }) {
  return (
    <div
      className="npc-wrap no-select"
      onClick={onClick}
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(-50%, -100%) scale(${scale})`,
        transformOrigin: "bottom center",
        cursor: "pointer",
        zIndex: 20,
      }}
    >
      {/* 提示气泡 */}
      {prompt && (
        <div
          className="npc-prompt"
          style={{
            position: "absolute",
            bottom: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            marginBottom: 14,
            background: "var(--paper-50)",
            border: "2px solid var(--ink-900)",
            borderRadius: 8,
            padding: "5px 10px",
            fontFamily: "var(--font-serif)",
            fontSize: 13,
            color: "var(--ink-900)",
            whiteSpace: "nowrap",
            boxShadow: "0 3px 0 var(--ink-900)",
            pointerEvents: "none",
            animation: "npc-prompt-bob 2.4s ease-in-out infinite",
          }}
        >
          {prompt}
          <div style={{
            position: "absolute",
            bottom: -8,
            left: "50%",
            transform: "translateX(-50%) rotate(45deg)",
            width: 10, height: 10,
            background: "var(--paper-50)",
            border: "2px solid var(--ink-900)",
            borderTop: "none", borderLeft: "none",
          }} />
        </div>
      )}

      {/* "!" 徽章 */}
      {badge && (
        <div
          style={{
            position: "absolute",
            top: -18,
            right: -12,
            width: 26, height: 26,
            borderRadius: 99,
            background: "var(--persimmon-500)",
            color: "var(--paper-50)",
            border: "2px solid var(--ink-900)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--font-serif)", fontSize: 16, fontWeight: 700,
            boxShadow: "0 2px 0 var(--ink-900)",
            animation: "npc-badge-pulse 1.5s ease-in-out infinite",
            zIndex: 2,
          }}
        >{badge}</div>
      )}

      {/* 立绘 */}
      <div style={{
        animation: "npc-bob 3s ease-in-out infinite",
        transform: mirror ? "scaleX(-1)" : "none",
        filter: "drop-shadow(0 6px 8px rgba(27,22,18,.25))",
      }}>
        <CharSprite name={name} style={{ width: 120, height: 192, display: "block" }} />
      </div>

      {/* 名牌 */}
      {label && (
        <div style={{
          position: "absolute",
          top: "100%",
          left: "50%",
          transform: "translateX(-50%)",
          marginTop: 4,
          background: "var(--ink-900)",
          color: "var(--paper-50)",
          padding: "2px 10px",
          borderRadius: 4,
          fontFamily: "var(--font-serif)",
          fontSize: 12,
          letterSpacing: "0.1em",
          whiteSpace: "nowrap",
          pointerEvents: "none",
        }}>{label}</div>
      )}

      <style>{`
        @keyframes npc-bob {
          0%, 100% { transform: translateY(0) }
          50%      { transform: translateY(-6px) }
        }
        @keyframes npc-prompt-bob {
          0%, 100% { transform: translateX(-50%) translateY(0) }
          50%      { transform: translateX(-50%) translateY(-4px) }
        }
        @keyframes npc-badge-pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 2px 0 var(--ink-900), 0 0 0 0 rgba(217,119,87,.5) }
          50%      { transform: scale(1.08); box-shadow: 0 2px 0 var(--ink-900), 0 0 0 8px rgba(217,119,87,0) }
        }
      `}</style>
    </div>
  );
}

/* ---------- 地图点位（不可对话，仅探索）---------- */
function MapPin({ x, y, label, color = "var(--ink-900)", onClick, locked = false }) {
  return (
    <button
      className="map-pin no-select"
      onClick={onClick}
      style={{
        all: "unset",
        cursor: locked ? "not-allowed" : "pointer",
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        transform: "translate(-50%, -100%)",
        zIndex: 15,
        opacity: locked ? 0.55 : 1,
      }}
    >
      <div style={{
        width: 32, height: 40,
        position: "relative",
        filter: "drop-shadow(0 4px 4px rgba(27,22,18,.25))",
      }}>
        <svg viewBox="0 0 32 40" width="32" height="40">
          <path d="M 16 38 C 4 22 4 12 16 4 C 28 12 28 22 16 38 Z" fill={color} stroke="#1b1612" strokeWidth="2" />
          <circle cx="16" cy="14" r="5" fill="var(--paper-50)" stroke="#1b1612" strokeWidth="1.5" />
        </svg>
      </div>
      <div style={{
        position: "absolute",
        top: "100%",
        left: "50%",
        transform: "translateX(-50%)",
        marginTop: 2,
        background: "var(--paper-50)",
        border: "1.5px solid var(--ink-900)",
        padding: "1px 8px",
        borderRadius: 4,
        fontFamily: "var(--font-serif)",
        fontSize: 11,
        color: "var(--ink-900)",
        whiteSpace: "nowrap",
        boxShadow: "0 2px 0 var(--ink-900)",
      }}>
        {label}{locked && " 🔒"}
      </div>
    </button>
  );
}

/* ---------- 顶部 HUD ---------- */
function HUD({ scene, onBack, xp, currentVisit }) {
  return (
    <div style={{
      position: "absolute",
      top: 0, left: 0, right: 0,
      padding: "16px 20px",
      display: "flex",
      alignItems: "center",
      gap: 14,
      zIndex: 30,
      pointerEvents: "none",
    }}>
      {scene !== "village" && (
        <button
          onClick={onBack}
          style={{
            all: "unset", cursor: "pointer",
            pointerEvents: "auto",
            display: "flex", alignItems: "center", gap: 8,
            padding: "8px 14px",
            background: "var(--paper-50)",
            border: "2px solid var(--ink-900)",
            borderRadius: 99,
            boxShadow: "0 3px 0 var(--ink-900)",
            fontFamily: "var(--font-serif)",
            fontSize: 14,
            color: "var(--ink-900)",
          }}
        >← 回村庄</button>
      )}

      <div style={{ flex: 1 }} />

      {/* 元XP / 进度章 */}
      <div style={{
        pointerEvents: "auto",
        background: "var(--paper-50)",
        border: "2px solid var(--ink-900)",
        borderRadius: 99,
        boxShadow: "0 3px 0 var(--ink-900)",
        padding: "6px 14px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        fontFamily: "var(--font-serif)",
        fontSize: 13,
        color: "var(--ink-900)",
      }}>
        <span style={{ color: "var(--persimmon-500)", fontSize: 16 }}>✦</span>
        <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>{xp}</span>
        <span style={{ color: "var(--ink-500)" }}>元气</span>
        {currentVisit && (
          <>
            <span style={{ color: "var(--line-mid)", margin: "0 4px" }}>|</span>
            <span style={{ color: "var(--ink-700)" }}>{currentVisit}</span>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------- 进入空间的转场（卷轴展开）---------- */
function SceneTransition({ show }) {
  if (!show) return null;
  return (
    <div style={{
      position: "absolute",
      inset: 0,
      zIndex: 90,
      pointerEvents: "none",
      animation: "scene-trans 1.1s ease both",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        background: "var(--ink-900)",
        animation: "trans-flash .55s ease both",
      }} />
      <style>{`
        @keyframes scene-trans {
          0%   { opacity: 1 }
          100% { opacity: 0 }
        }
        @keyframes trans-flash {
          0%   { transform: scaleY(0); transform-origin: center }
          50%  { transform: scaleY(1) }
          100% { transform: scaleY(0); transform-origin: center }
        }
      `}</style>
    </div>
  );
}

window.NPC = NPC;
window.MapPin = MapPin;
window.HUD = HUD;
window.SceneTransition = SceneTransition;
