/* ============================================================
   side-panels.jsx — 任务板 / 作品墙 / 物品栏 (RPG UI)
   出现在空间场景中，作为可展开的卡片
   ============================================================ */

/* ---------- 任务板（活动）---------- */
function QuestBoard({ open, onClose, items = [] }) {
  return (
    <SlideOver title="任务板" icon="任" open={open} onClose={onClose} accent="var(--persimmon-500)">
      {items.length === 0 ? (
        <p style={{ color: "var(--ink-500)", fontSize: 13, padding: 12 }}>暂无活动。</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {items.map((q, i) => (
            <div key={i} style={{
              background: "var(--paper-50)",
              border: "2px solid var(--ink-900)",
              borderLeft: `6px solid ${q.tone || "var(--persimmon-500)"}`,
              borderRadius: 10,
              boxShadow: "0 3px 0 var(--ink-900)",
              padding: "12px 14px",
            }}>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                marginBottom: 6,
              }}>
                <span style={{
                  fontFamily: "var(--font-serif)", fontSize: 15, fontWeight: 600,
                  color: "var(--ink-900)",
                }}>{q.title}</span>
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: 10,
                  color: "var(--ink-500)",
                  background: "var(--paper-200)",
                  padding: "2px 6px", borderRadius: 99,
                }}>{q.when}</span>
              </div>
              <p style={{
                margin: 0, fontSize: 13, color: "var(--ink-700)",
                lineHeight: 1.55,
              }}>{q.desc}</p>
              <div style={{
                display: "flex", gap: 6, marginTop: 8, alignItems: "center",
              }}>
                {q.tags?.map(t => (
                  <span key={t} style={{
                    fontSize: 10, color: "var(--ink-500)",
                    background: "var(--paper-200)",
                    padding: "2px 8px", borderRadius: 99,
                  }}>{t}</span>
                ))}
                <div style={{ flex: 1 }} />
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: 10,
                  color: "var(--persimmon-700)",
                }}>+ {q.xp || 12} 元气</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </SlideOver>
  );
}

/* ---------- 作品墙 ---------- */
function WorksWall({ open, onClose, items = [] }) {
  return (
    <SlideOver title="作品收藏" icon="作" open={open} onClose={onClose} accent="var(--moss-600)">
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 12,
      }}>
        {items.map((w, i) => (
          <div key={i} style={{
            background: "var(--paper-50)",
            border: "2px solid var(--ink-900)",
            borderRadius: 8,
            boxShadow: `${(i % 2 === 0 ? "-" : "")}2px 4px 0 var(--ink-900)`,
            transform: `rotate(${(i % 2 === 0 ? -1.5 : 1.5)}deg)`,
            padding: 10,
            transition: "transform .2s ease",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = "rotate(0deg) scale(1.03)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = `rotate(${(i % 2 === 0 ? -1.5 : 1.5)}deg) scale(1)`}
          >
            {/* 占位的"作品图" */}
            <div style={{
              aspectRatio: "4/3",
              background: w.bg || "linear-gradient(135deg, #a8c4cb, #6b97a3)",
              border: "1.5px solid var(--ink-900)",
              borderRadius: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 8,
              position: "relative",
              overflow: "hidden",
            }}>
              {w.svg ? w.svg : (
                <span style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: 36, color: "var(--paper-50)", opacity: .6,
                }}>{w.icon || "作"}</span>
              )}
              <div style={{
                position: "absolute", top: 6, right: 6,
                fontFamily: "var(--font-mono)", fontSize: 9,
                background: "rgba(27,22,18,.7)", color: "var(--paper-50)",
                padding: "1px 6px", borderRadius: 2,
              }}>{w.kind}</div>
            </div>
            <p style={{
              margin: 0, fontFamily: "var(--font-serif)", fontSize: 13, fontWeight: 600,
              color: "var(--ink-900)",
            }}>{w.title}</p>
            <p style={{
              margin: "2px 0 0", fontSize: 11, color: "var(--ink-500)",
              fontFamily: "var(--font-mono)",
            }}>{w.year}</p>
          </div>
        ))}
      </div>
    </SlideOver>
  );
}

/* ---------- 通用 SlideOver 容器 ---------- */
function SlideOver({ title, icon, open, onClose, accent, children }) {
  if (!open) return null;
  return (
    <>
      {/* 遮罩 */}
      <div
        onClick={onClose}
        style={{
          position: "absolute", inset: 0, zIndex: 60,
          background: "rgba(27,22,18,.35)",
        }}
      />
      {/* 面板 */}
      <div style={{
        position: "absolute",
        top: 0, right: 0, bottom: 0,
        width: "min(420px, 90vw)",
        background: "var(--paper-100)",
        zIndex: 61,
        border: "2px solid var(--ink-900)",
        borderRight: "none",
        boxShadow: "-6px 0 0 var(--ink-900), -16px 0 40px rgba(27,22,18,.25)",
        display: "flex",
        flexDirection: "column",
      }}>
        {/* Header */}
        <div style={{
          padding: "16px 18px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          borderBottom: "2px solid var(--ink-900)",
          background: "var(--paper-200)",
        }}>
          <div style={{
            width: 36, height: 36,
            borderRadius: 8,
            background: accent || "var(--persimmon-500)",
            color: "var(--paper-50)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--font-serif)", fontSize: 18, fontWeight: 700,
            border: "2px solid var(--ink-900)",
            boxShadow: "0 2px 0 var(--ink-900)",
          }}>{icon}</div>
          <h2 style={{
            margin: 0, fontFamily: "var(--font-serif)", fontSize: 18,
            color: "var(--ink-900)", flex: 1,
          }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              all: "unset", cursor: "pointer",
              width: 32, height: 32,
              borderRadius: 99,
              border: "2px solid var(--ink-900)",
              background: "var(--paper-50)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18,
              color: "var(--ink-900)",
              boxShadow: "0 2px 0 var(--ink-900)",
            }}
          >×</button>
        </div>
        {/* Body */}
        <div style={{
          flex: 1, overflowY: "auto",
          padding: "18px",
        }}>
          {children}
        </div>
      </div>

      <style>{`
        @keyframes fade-in { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slide-in {
          from { transform: translateX(100%) }
          to   { transform: translateX(0) }
        }
      `}</style>
    </>
  );
}

/* ---------- 工具按钮（角落浮起，召唤面板） ---------- */
function ToolDock({ buttons }) {
  return (
    <div style={{
      position: "absolute",
      bottom: 200, right: 20,
      zIndex: 25,
      display: "flex", flexDirection: "column",
      gap: 10,
    }}>
      {buttons.map((b, i) => (
        <button
          key={i}
          onClick={b.onClick}
          title={b.title}
          style={{
            all: "unset", cursor: "pointer",
            width: 52, height: 52,
            background: "var(--paper-50)",
            border: "2.5px solid var(--ink-900)",
            borderRadius: 12,
            boxShadow: "0 4px 0 var(--ink-900)",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            fontFamily: "var(--font-serif)",
            color: "var(--ink-900)",
            position: "relative",
            transition: "transform .08s ease, box-shadow .08s ease",
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = "translateY(3px)";
            e.currentTarget.style.boxShadow = "0 1px 0 var(--ink-900)";
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 0 var(--ink-900)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 0 var(--ink-900)";
          }}
        >
          <span style={{ fontSize: 20, fontWeight: 700, lineHeight: 1, color: b.tone || "var(--ink-900)" }}>{b.icon}</span>
          <span style={{ fontSize: 10, marginTop: 2, color: "var(--ink-500)" }}>{b.label}</span>
          {b.badge && (
            <span style={{
              position: "absolute", top: -6, right: -6,
              minWidth: 18, height: 18,
              padding: "0 5px",
              background: "var(--persimmon-500)",
              color: "var(--paper-50)",
              border: "1.5px solid var(--ink-900)",
              borderRadius: 99,
              fontSize: 10, fontFamily: "var(--font-mono)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>{b.badge}</span>
          )}
        </button>
      ))}
    </div>
  );
}

window.QuestBoard = QuestBoard;
window.WorksWall = WorksWall;
window.ToolDock = ToolDock;
