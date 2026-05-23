/* ============================================================
   xiaomeizhuang-scene.jsx
   小梅桩 — 进入空间后的近景（保留俯视感的庭院视角）
   ============================================================ */

function XiaomeiZhuangScene({ children }) {
  return (
    <div style={{
      position: "absolute",
      inset: 0,
      overflow: "hidden",
    }}>
      <svg
        viewBox="0 0 1600 1000"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        xmlns="http://www.w3.org/2000/svg"
        aria-label="小梅桩庭院"
      >
        <defs>
          {/* 天 */}
          <linearGradient id="xz-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f5ecd7" />
            <stop offset="50%" stopColor="#ead9b6" />
            <stop offset="100%" stopColor="#d6c194" />
          </linearGradient>
          {/* 远山 */}
          <linearGradient id="xz-mtn" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7c9886" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#a6bea9" stopOpacity="0.5" />
          </linearGradient>
          {/* 地面（黄土地） */}
          <linearGradient id="xz-ground" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#dec8a0" />
            <stop offset="100%" stopColor="#b89762" />
          </linearGradient>
          {/* 房屋墙 */}
          <linearGradient id="xz-wall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f7edd6" />
            <stop offset="100%" stopColor="#d6b889" />
          </linearGradient>
          {/* 屋顶 */}
          <linearGradient id="xz-roof" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5a4838" />
            <stop offset="100%" stopColor="#2a1f15" />
          </linearGradient>
          {/* 花床 */}
          <radialGradient id="xz-flower-r" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#e89a7a" />
            <stop offset="100%" stopColor="#a4502f" />
          </radialGradient>
          <radialGradient id="xz-flower-y" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f7d678" />
            <stop offset="100%" stopColor="#c89844" />
          </radialGradient>

          <filter id="xz-noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
            <feColorMatrix values="0 0 0 0 0.15  0 0 0 0 0.10  0 0 0 0 0.05  0 0 0 .06 0" />
          </filter>
        </defs>

        {/* 天 */}
        <rect width="1600" height="500" fill="url(#xz-sky)" />
        {/* 远山 */}
        <path d="M 0 280 Q 200 200 380 240 Q 540 260 720 200 Q 900 160 1080 220 Q 1280 250 1480 200 Q 1580 180 1600 220 L 1600 360 L 0 360 Z" fill="url(#xz-mtn)" />
        <path d="M 0 280 Q 200 200 380 240 Q 540 260 720 200 Q 900 160 1080 220 Q 1280 250 1480 200 Q 1580 180 1600 220" stroke="#1b1612" strokeWidth="1.5" fill="none" opacity=".4" />

        {/* 院墙（远） */}
        <path d="M 0 480 L 1600 480 L 1600 510 L 0 510 Z" fill="#c9a784" stroke="#1b1612" strokeWidth="1.8" />
        {/* 院墙瓦顶（一层）*/}
        <path d="M 0 470 L 1600 470 L 1600 482 L 0 482 Z" fill="#5a4838" stroke="#1b1612" strokeWidth="1.5" />

        {/* 地面 */}
        <rect y="510" width="1600" height="490" fill="url(#xz-ground)" />
        <rect y="510" width="1600" height="490" fill="url(#xz-ground)" filter="url(#xz-noise)" opacity="0.5" />

        {/* 院子里的青石路 */}
        <path d="M 600 1000 Q 700 900 720 800 Q 740 700 800 660 L 1000 660 Q 1060 700 1080 800 Q 1100 900 1200 1000 Z"
              fill="#c9b58e" stroke="#1b1612" strokeWidth="2" opacity=".7" />
        {Array.from({ length: 8 }).map((_, i) => (
          <line key={`p-${i}`} x1={620 + i * 75} y1={950 - i * 25} x2={640 + i * 75} y2={935 - i * 25} stroke="#1b1612" strokeWidth="1.2" opacity=".4" />
        ))}

        {/* 主屋（小梅桩房子，居中靠后）*/}
        <g transform="translate(720 380)">
          {/* 屋身 */}
          <path d="M 0 100 L 0 280 L 360 280 L 360 100 L 180 30 Z" fill="url(#xz-wall)" stroke="#1b1612" strokeWidth="2.5" strokeLinejoin="round" />
          {/* 屋顶（青瓦曲檐）*/}
          <path d="M -30 110 Q -20 60 180 20 Q 380 60 390 110 L 390 130 Q 180 100 -30 130 Z"
                fill="url(#xz-roof)" stroke="#1b1612" strokeWidth="2.5" strokeLinejoin="round" />
          {/* 屋脊 */}
          <path d="M -20 110 Q 180 80 380 110" stroke="#1b1612" strokeWidth="1.8" fill="none" />
          {/* 瓦纹 */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300].map((x, i) => (
            <path key={`tile-${i}`} d={`M ${-10 + x} ${95 - Math.sin((x / 200) * Math.PI) * 25} L ${-5 + x} ${105 - Math.sin((x / 200) * Math.PI) * 28}`} stroke="#1b1612" strokeWidth=".7" opacity=".4" />
          ))}

          {/* 门 */}
          <rect x="150" y="170" width="60" height="110" fill="#5a3924" stroke="#1b1612" strokeWidth="2.5" />
          <line x1="180" y1="170" x2="180" y2="280" stroke="#1b1612" strokeWidth="2" />
          <circle cx="170" cy="225" r="2" fill="#d97757" />
          <circle cx="190" cy="225" r="2" fill="#d97757" />

          {/* 窗 */}
          <rect x="50" y="170" width="60" height="60" fill="#3d5560" stroke="#1b1612" strokeWidth="2" />
          <line x1="80" y1="170" x2="80" y2="230" stroke="#1b1612" strokeWidth="1.2" />
          <line x1="50" y1="200" x2="110" y2="200" stroke="#1b1612" strokeWidth="1.2" />

          <rect x="250" y="170" width="60" height="60" fill="#3d5560" stroke="#1b1612" strokeWidth="2" />
          <line x1="280" y1="170" x2="280" y2="230" stroke="#1b1612" strokeWidth="1.2" />
          <line x1="250" y1="200" x2="310" y2="200" stroke="#1b1612" strokeWidth="1.2" />

          {/* 门口黑板 */}
          <rect x="-50" y="200" width="60" height="40" fill="#2a2018" stroke="#1b1612" strokeWidth="2" />
          <rect x="-50" y="200" width="60" height="40" fill="none" stroke="#9b7651" strokeWidth="3" />
          <text x="-20" y="218" fontSize="10" fill="#f5ecd7" fontFamily="serif" textAnchor="middle" fontStyle="italic">My Home</text>
          <text x="-20" y="232" fontSize="9" fill="#f5ecd7" fontFamily="serif" textAnchor="middle" fontStyle="italic">My Life Style</text>

          {/* 屋檐下挂的灯笼 */}
          <circle cx="80" cy="140" r="8" fill="#d97757" stroke="#1b1612" strokeWidth="1.5" />
          <line x1="80" y1="130" x2="80" y2="125" stroke="#1b1612" strokeWidth="1" />
          <line x1="80" y1="148" x2="80" y2="156" stroke="#1b1612" strokeWidth="1" />
          <circle cx="280" cy="140" r="8" fill="#d97757" stroke="#1b1612" strokeWidth="1.5" />
          <line x1="280" y1="130" x2="280" y2="125" stroke="#1b1612" strokeWidth="1" />
          <line x1="280" y1="148" x2="280" y2="156" stroke="#1b1612" strokeWidth="1" />
        </g>

        {/* 左侧花圃 */}
        <g transform="translate(180 600)">
          <ellipse cx="200" cy="80" rx="220" ry="35" fill="#84a17a" stroke="#1b1612" strokeWidth="2" opacity=".7" />
          {/* 一团团花 */}
          {[
            [40, 60, "r"], [90, 50, "y"], [130, 70, "r"], [170, 55, "r"],
            [220, 70, "y"], [260, 50, "r"], [300, 65, "y"], [340, 55, "r"],
          ].map(([x, y, c], i) => (
            <g key={`fl-${i}`}>
              <circle cx={x} cy={y} r="14" fill={c === "r" ? "url(#xz-flower-r)" : "url(#xz-flower-y)"} stroke="#1b1612" strokeWidth="1.5" />
              <circle cx={x} cy={y} r="4" fill="#1b1612" opacity=".4" />
              {/* 花瓣分 */}
              <path d={`M ${x - 8} ${y - 8} L ${x + 8} ${y + 8} M ${x + 8} ${y - 8} L ${x - 8} ${y + 8}`} stroke="#1b1612" strokeWidth="1" opacity=".4" />
              {/* 叶 */}
              <ellipse cx={x - 4} cy={y + 16} rx="4" ry="3" fill="#4f7259" stroke="#1b1612" strokeWidth="1" transform={`rotate(-20 ${x - 4} ${y + 16})`} />
            </g>
          ))}
        </g>

        {/* 右侧花圃 */}
        <g transform="translate(1000 600)">
          <ellipse cx="200" cy="80" rx="220" ry="35" fill="#84a17a" stroke="#1b1612" strokeWidth="2" opacity=".7" />
          {[
            [40, 60, "y"], [90, 50, "r"], [130, 70, "r"], [170, 55, "y"],
            [220, 70, "r"], [260, 50, "y"], [300, 65, "r"], [340, 55, "y"],
          ].map(([x, y, c], i) => (
            <g key={`fl2-${i}`}>
              <circle cx={x} cy={y} r="14" fill={c === "r" ? "url(#xz-flower-r)" : "url(#xz-flower-y)"} stroke="#1b1612" strokeWidth="1.5" />
              <circle cx={x} cy={y} r="4" fill="#1b1612" opacity=".4" />
              <path d={`M ${x - 8} ${y - 8} L ${x + 8} ${y + 8} M ${x + 8} ${y - 8} L ${x - 8} ${y + 8}`} stroke="#1b1612" strokeWidth="1" opacity=".4" />
              <ellipse cx={x - 4} cy={y + 16} rx="4" ry="3" fill="#4f7259" stroke="#1b1612" strokeWidth="1" transform={`rotate(-20 ${x - 4} ${y + 16})`} />
            </g>
          ))}
        </g>

        {/* 院子里的茶桌（小梅常坐处） */}
        <g transform="translate(220 800)">
          {/* 桌 */}
          <ellipse cx="60" cy="50" rx="60" ry="14" fill="#a4502f" stroke="#1b1612" strokeWidth="2" />
          <rect x="55" y="50" width="10" height="40" fill="#6b4c30" stroke="#1b1612" strokeWidth="1.5" />
          {/* 茶壶 */}
          <ellipse cx="40" cy="40" rx="14" ry="8" fill="#3a2812" stroke="#1b1612" strokeWidth="1.5" />
          <ellipse cx="40" cy="36" rx="6" ry="3" fill="#1b1612" />
          <path d="M 54 40 Q 62 38 62 32" stroke="#1b1612" strokeWidth="1.5" fill="none" />
          {/* 茶杯 */}
          <ellipse cx="78" cy="44" rx="6" ry="3" fill="#f5ecd7" stroke="#1b1612" strokeWidth="1.2" />
          <ellipse cx="92" cy="46" rx="6" ry="3" fill="#f5ecd7" stroke="#1b1612" strokeWidth="1.2" />
          {/* 雾汽 */}
          <path d="M 36 28 Q 30 20 36 14 M 44 28 Q 50 20 44 14" stroke="#a8c4cb" strokeWidth="1.5" fill="none" opacity=".7" strokeLinecap="round" />
        </g>

        {/* 院子里的猫 */}
        <g transform="translate(1340 870)">
          <ellipse cx="30" cy="40" rx="22" ry="12" fill="#dec8a0" stroke="#1b1612" strokeWidth="1.5" />
          <circle cx="14" cy="32" r="10" fill="#dec8a0" stroke="#1b1612" strokeWidth="1.5" />
          <path d="M 8 24 L 6 18 L 12 22 Z M 20 24 L 22 18 L 16 22 Z" fill="#dec8a0" stroke="#1b1612" strokeWidth="1" />
          <circle cx="11" cy="31" r="1" fill="#1b1612" />
          <circle cx="18" cy="31" r="1" fill="#1b1612" />
          <path d="M 14 34 L 13 36 L 16 36 L 15 34" stroke="#1b1612" strokeWidth="0.7" fill="#a4502f" />
          <path d="M 52 42 Q 62 38 64 32" stroke="#1b1612" strokeWidth="1.5" fill="none" />
        </g>

        {/* 院子角落的鸟笼 */}
        <g transform="translate(1140 380)">
          <ellipse cx="20" cy="50" rx="18" ry="6" fill="#6b4c30" stroke="#1b1612" strokeWidth="1.5" />
          <path d="M 4 50 Q 4 25 20 14 Q 36 25 36 50 Z" fill="none" stroke="#1b1612" strokeWidth="2" />
          {Array.from({ length: 6 }).map((_, i) => (
            <line key={`bird-${i}`} x1={6 + i * 5.5} y1={48} x2={6 + i * 5.5} y2={16 + Math.abs(i - 2.5) * 3} stroke="#1b1612" strokeWidth="1.2" />
          ))}
          <line x1="20" y1="14" x2="20" y2="2" stroke="#1b1612" strokeWidth="1.5" />
          <circle cx="20" cy="0" r="2" fill="#d97757" />
          {/* 小鸟 */}
          <ellipse cx="20" cy="35" rx="5" ry="4" fill="#84a17a" stroke="#1b1612" strokeWidth="1" />
          <circle cx="22" cy="33" r="1" fill="#1b1612" />
        </g>
      </svg>

      {/* 子内容（NPC、面板等）覆盖在 SVG 上 */}
      {children}
    </div>
  );
}

window.XiaomeiZhuangScene = XiaomeiZhuangScene;
