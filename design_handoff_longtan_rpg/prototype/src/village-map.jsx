/* ============================================================
   village-map.jsx — 手绘龙潭村插画地图
   顶视斜 45°，线稿 + 水彩晕染
   ============================================================ */

function VillageMap({ className = "", style }) {
  return (
    <svg
      viewBox="0 0 1600 1000"
      className={className}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
      aria-label="龙潭村插画地图"
    >
      <defs>
        {/* 远山水墨 */}
        <linearGradient id="vm-mtn-far" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9eb1a9" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#cdd5ce" stopOpacity="0.35" />
        </linearGradient>
        <linearGradient id="vm-mtn-mid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7c9886" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#a6bea9" stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id="vm-mtn-near" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5d7d61" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#84a17a" stopOpacity="0.75" />
        </linearGradient>

        {/* 水（溪流）*/}
        <linearGradient id="vm-water" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#cfdfe2" />
          <stop offset="100%" stopColor="#9bb9c2" />
        </linearGradient>

        {/* 田地 */}
        <linearGradient id="vm-field" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d6e0b0" />
          <stop offset="100%" stopColor="#b6c789" />
        </linearGradient>

        {/* 屋顶（青瓦）*/}
        <linearGradient id="vm-roof" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5a4838" />
          <stop offset="100%" stopColor="#3a2a1c" />
        </linearGradient>
        <linearGradient id="vm-roof-warm" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a4502f" />
          <stop offset="100%" stopColor="#6b2f17" />
        </linearGradient>

        {/* 墙（夯土黄）*/}
        <linearGradient id="vm-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f1e0b8" />
          <stop offset="100%" stopColor="#d6b889" />
        </linearGradient>

        {/* 树冠 */}
        <radialGradient id="vm-tree" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#a5c08a" />
          <stop offset="100%" stopColor="#4f7259" />
        </radialGradient>

        {/* 路径 */}
        <pattern id="vm-cobble" width="14" height="10" patternUnits="userSpaceOnUse">
          <rect width="14" height="10" fill="#d6c194" />
          <path d="M0 5 Q 7 2 14 5 M 0 10 Q 7 12 14 10 M 7 0 Q 4 5 7 10" stroke="#a89572" strokeWidth=".8" fill="none" />
        </pattern>

        {/* 纸纹（轻噪点）*/}
        <filter id="vm-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix values="0 0 0 0 0.15  0 0 0 0 0.10  0 0 0 0 0.05  0 0 0 .07 0" />
        </filter>

        {/* 复用：传统屋（45°斜）*/}
        <symbol id="vm-house" viewBox="0 0 100 80">
          {/* 墙 */}
          <path d="M 18 40 L 50 24 L 82 40 L 82 70 L 18 70 Z" fill="url(#vm-wall)" stroke="#1b1612" strokeWidth="1.8" strokeLinejoin="round" />
          {/* 屋顶（曲线檐） */}
          <path d="M 8 42 Q 15 22 50 14 Q 85 22 92 42 Q 50 36 8 42 Z" fill="url(#vm-roof)" stroke="#1b1612" strokeWidth="2" strokeLinejoin="round" />
          {/* 屋脊 */}
          <path d="M 14 40 Q 50 28 86 40" stroke="#1b1612" strokeWidth="1.5" fill="none" />
          {/* 瓦楞 */}
          <path d="M 22 32 L 24 40 M 32 28 L 34 38 M 42 24 L 44 36 M 58 24 L 56 36 M 68 28 L 66 38 M 78 32 L 76 40" stroke="#1b1612" strokeWidth=".8" fill="none" opacity=".5" />
          {/* 门 */}
          <rect x="44" y="52" width="12" height="18" fill="#5a3924" stroke="#1b1612" strokeWidth="1.5" />
          <line x1="50" y1="52" x2="50" y2="70" stroke="#1b1612" strokeWidth="1" />
          {/* 窗 */}
          <rect x="26" y="50" width="10" height="8" fill="#3d5560" stroke="#1b1612" strokeWidth="1.2" />
          <rect x="64" y="50" width="10" height="8" fill="#3d5560" stroke="#1b1612" strokeWidth="1.2" />
        </symbol>

        {/* 复用：屋顶颜色变体 */}
        <symbol id="vm-house-warm" viewBox="0 0 100 80">
          <path d="M 18 40 L 50 24 L 82 40 L 82 70 L 18 70 Z" fill="url(#vm-wall)" stroke="#1b1612" strokeWidth="1.8" />
          <path d="M 8 42 Q 15 22 50 14 Q 85 22 92 42 Q 50 36 8 42 Z" fill="url(#vm-roof-warm)" stroke="#1b1612" strokeWidth="2" strokeLinejoin="round" />
          <path d="M 14 40 Q 50 28 86 40" stroke="#1b1612" strokeWidth="1.5" fill="none" />
          <rect x="44" y="52" width="12" height="18" fill="#5a3924" stroke="#1b1612" strokeWidth="1.5" />
          <rect x="26" y="50" width="10" height="8" fill="#3d5560" stroke="#1b1612" strokeWidth="1.2" />
          <rect x="64" y="50" width="10" height="8" fill="#3d5560" stroke="#1b1612" strokeWidth="1.2" />
        </symbol>

        {/* 树 */}
        <symbol id="vm-tree-sym" viewBox="0 0 60 80">
          <ellipse cx="30" cy="62" rx="14" ry="5" fill="#1b1612" opacity=".2" />
          <rect x="27" y="42" width="6" height="20" fill="#6b4c30" stroke="#1b1612" strokeWidth="1.2" />
          <circle cx="30" cy="35" r="22" fill="url(#vm-tree)" stroke="#1b1612" strokeWidth="1.8" />
          <path d="M 18 28 Q 30 22 42 28 M 22 40 Q 30 36 38 40" stroke="#1b1612" strokeWidth="1" fill="none" opacity=".4" />
        </symbol>

        {/* 竹 */}
        <symbol id="vm-bamboo" viewBox="0 0 30 80">
          <path d="M 8 78 L 8 8" stroke="#4f7259" strokeWidth="2.5" />
          <path d="M 18 78 L 18 14" stroke="#4f7259" strokeWidth="2" />
          <path d="M 14 75 L 14 22" stroke="#4f7259" strokeWidth="2.2" />
          {[20, 36, 52].map((y, i) => (
            <g key={i}>
              <ellipse cx="8" cy={y} rx="3" ry="1.5" fill="#3a4f3e" />
              <ellipse cx="14" cy={y + 6} rx="3" ry="1.5" fill="#3a4f3e" />
              <ellipse cx="18" cy={y + 2} rx="3" ry="1.5" fill="#3a4f3e" />
            </g>
          ))}
          <path d="M 8 18 Q 0 14 -2 8 M 8 18 Q 16 14 22 8" stroke="#4f7259" strokeWidth="1.2" fill="none" />
          <path d="M 14 24 Q 6 20 4 14 M 14 24 Q 22 18 26 12" stroke="#4f7259" strokeWidth="1.2" fill="none" />
          <path d="M 18 30 Q 26 26 28 20" stroke="#4f7259" strokeWidth="1.2" fill="none" />
        </symbol>

        {/* 廊桥 */}
        <symbol id="vm-bridge" viewBox="0 0 200 80">
          {/* 桥身 */}
          <path d="M 20 50 Q 100 30 180 50 L 180 60 Q 100 42 20 60 Z" fill="#9b7651" stroke="#1b1612" strokeWidth="2" strokeLinejoin="round" />
          {/* 廊顶 */}
          <path d="M 20 45 Q 100 22 180 45 L 180 30 Q 100 8 20 30 Z" fill="url(#vm-roof)" stroke="#1b1612" strokeWidth="2" strokeLinejoin="round" />
          {/* 柱 */}
          {[40, 70, 100, 130, 160].map((x, i) => (
            <line key={i} x1={x} y1="46" x2={x} y2="32" stroke="#1b1612" strokeWidth="1.5" />
          ))}
          {/* 倒影/桥洞 */}
          <path d="M 60 60 Q 80 70 100 60 M 110 60 Q 130 70 150 60" stroke="#1b1612" strokeWidth="1.5" fill="none" />
        </symbol>
      </defs>

      {/* —— 底色：宣纸 —— */}
      <rect width="1600" height="1000" fill="#f5ecd7" />
      <rect width="1600" height="1000" fill="#f5ecd7" filter="url(#vm-noise)" opacity="0.6" />

      {/* —— 远山（最远层）—— */}
      <path d="M 0 280 Q 200 200 380 240 Q 540 260 720 200 Q 900 160 1080 220 Q 1280 250 1480 200 Q 1580 180 1600 220 L 1600 320 L 0 320 Z" fill="url(#vm-mtn-far)" />

      {/* —— 中山 —— */}
      <path d="M 0 360 Q 160 280 320 330 Q 480 360 640 290 Q 820 240 1000 320 Q 1180 380 1360 320 Q 1500 290 1600 340 L 1600 420 L 0 420 Z" fill="url(#vm-mtn-mid)" />
      {/* 中山线稿（淡墨）*/}
      <path d="M 0 360 Q 160 280 320 330 Q 480 360 640 290 Q 820 240 1000 320 Q 1180 380 1360 320 Q 1500 290 1600 340" stroke="#3a2f25" strokeWidth="1.6" fill="none" opacity=".35" />

      {/* —— 近山（左右两侧，环抱村庄）—— */}
      <path d="M 0 420 Q 80 320 180 380 Q 280 440 320 420 Q 360 400 380 460 L 380 1000 L 0 1000 Z" fill="url(#vm-mtn-near)" />
      <path d="M 1600 420 Q 1520 340 1420 400 Q 1320 450 1280 430 Q 1240 415 1220 470 L 1220 1000 L 1600 1000 Z" fill="url(#vm-mtn-near)" />
      <path d="M 0 420 Q 80 320 180 380 Q 280 440 320 420 Q 360 400 380 460" stroke="#1b1612" strokeWidth="1.6" fill="none" opacity=".5" />
      <path d="M 1600 420 Q 1520 340 1420 400 Q 1320 450 1280 430 Q 1240 415 1220 470" stroke="#1b1612" strokeWidth="1.6" fill="none" opacity=".5" />

      {/* —— 田 —— */}
      <g opacity="0.85">
        <path d="M 380 500 L 600 460 L 680 500 L 540 540 Z" fill="url(#vm-field)" stroke="#6b4c30" strokeWidth="1.2" strokeDasharray="4 3" />
        <path d="M 540 540 L 680 500 L 760 540 L 620 580 Z" fill="url(#vm-field)" stroke="#6b4c30" strokeWidth="1.2" strokeDasharray="4 3" />
        <path d="M 380 500 L 540 540 L 460 580 L 320 540 Z" fill="url(#vm-field)" opacity="0.85" stroke="#6b4c30" strokeWidth="1.2" strokeDasharray="4 3" />

        <path d="M 1000 460 L 1180 440 L 1280 480 L 1100 510 Z" fill="url(#vm-field)" stroke="#6b4c30" strokeWidth="1.2" strokeDasharray="4 3" />
        <path d="M 1100 510 L 1280 480 L 1380 520 L 1200 560 Z" fill="url(#vm-field)" stroke="#6b4c30" strokeWidth="1.2" strokeDasharray="4 3" />
        {/* 稻苗点状 */}
        {Array.from({ length: 24 }).map((_, i) => (
          <circle key={`f1-${i}`} cx={420 + (i % 8) * 30 + (Math.floor(i / 8) * 15)} cy={500 + Math.floor(i / 8) * 25} r="1.5" fill="#4f7259" />
        ))}
        {Array.from({ length: 24 }).map((_, i) => (
          <circle key={`f2-${i}`} cx={1030 + (i % 8) * 30 + (Math.floor(i / 8) * 12)} cy={470 + Math.floor(i / 8) * 25} r="1.5" fill="#4f7259" />
        ))}
      </g>

      {/* —— 溪流（从左上贯穿到右下）—— */}
      <path
        d="M -20 380 Q 200 460 360 520 Q 480 560 520 640 Q 540 720 700 760 Q 880 800 1020 760 Q 1180 720 1320 780 Q 1480 830 1640 820"
        fill="none"
        stroke="url(#vm-water)"
        strokeWidth="56"
        strokeLinecap="round"
      />
      {/* 水波 */}
      <path
        d="M -20 380 Q 200 460 360 520 Q 480 560 520 640 Q 540 720 700 760 Q 880 800 1020 760 Q 1180 720 1320 780 Q 1480 830 1640 820"
        fill="none"
        stroke="#7ea0aa"
        strokeWidth="1.2"
        opacity=".7"
      />
      <path d="M 240 470 Q 270 475 300 470 M 460 580 Q 490 585 520 580 M 780 770 Q 810 776 840 770 M 1100 750 Q 1130 756 1160 750 M 1380 800 Q 1410 806 1440 800" stroke="#5d8590" strokeWidth="1" fill="none" opacity=".6" />

      {/* —— 廊桥（跨溪）—— */}
      <g transform="translate(620 670) rotate(8)">
        <use href="#vm-bridge" width="200" height="80" />
      </g>

      {/* —— 道路 —— */}
      <path
        d="M 320 920 Q 480 800 580 680 Q 660 600 760 580 Q 880 560 1000 580 Q 1140 600 1240 540 Q 1340 480 1420 440"
        stroke="url(#vm-cobble)"
        strokeWidth="22"
        fill="none"
        strokeLinecap="round"
        opacity=".95"
      />
      <path
        d="M 320 920 Q 480 800 580 680 Q 660 600 760 580 Q 880 560 1000 580 Q 1140 600 1240 540 Q 1340 480 1420 440"
        stroke="#1b1612"
        strokeWidth="1.2"
        fill="none"
        opacity=".4"
        strokeDasharray="3 5"
      />

      {/* —— 房屋群 —— */}
      {/* 上排村落 */}
      <g>
        <use href="#vm-house" x="420" y="440" width="90" height="72" />
        <use href="#vm-house-warm" x="500" y="430" width="90" height="72" />
        <use href="#vm-house" x="580" y="450" width="90" height="72" />
        <use href="#vm-house" x="660" y="470" width="90" height="72" />
      </g>

      {/* 河岸两侧密集村落 */}
      <g>
        <use href="#vm-house" x="780" y="620" width="100" height="80" />
        <use href="#vm-house-warm" x="870" y="630" width="100" height="80" />
        <use href="#vm-house" x="950" y="620" width="100" height="80" />
        <use href="#vm-house" x="1030" y="640" width="100" height="80" />
        <use href="#vm-house-warm" x="1110" y="660" width="100" height="80" />
      </g>

      {/* 小梅桩位置（河南岸独栋大屋）*/}
      <g transform="translate(540 720)">
        {/* 庭院围墙 */}
        <path d="M -30 60 Q -30 30 0 20 L 120 20 Q 150 30 150 60 L 150 90 L -30 90 Z" fill="#e8d6a4" stroke="#1b1612" strokeWidth="1.8" opacity=".7" />
        {/* 院内花草 */}
        <circle cx="0" cy="62" r="6" fill="#84a17a" stroke="#1b1612" strokeWidth="1" />
        <circle cx="14" cy="60" r="5" fill="#d97757" stroke="#1b1612" strokeWidth="1" />
        <circle cx="28" cy="64" r="6" fill="#84a17a" stroke="#1b1612" strokeWidth="1" />
        <circle cx="120" cy="60" r="6" fill="#84a17a" stroke="#1b1612" strokeWidth="1" />
        <circle cx="106" cy="62" r="5" fill="#f0b48a" stroke="#1b1612" strokeWidth="1" />
        {/* 房屋 */}
        <use href="#vm-house" x="30" y="-10" width="120" height="100" />
      </g>

      {/* 下排村落 */}
      <g>
        <use href="#vm-house" x="780" y="850" width="100" height="80" />
        <use href="#vm-house-warm" x="900" y="860" width="100" height="80" />
        <use href="#vm-house" x="1010" y="840" width="100" height="80" />
      </g>

      {/* —— 树 —— */}
      {[
        [430, 540], [380, 600], [320, 660], [690, 540], [620, 590], [760, 570],
        [870, 760], [960, 770], [1080, 780], [820, 920], [1140, 900], [1220, 800],
        [1260, 700], [1320, 660], [1360, 600], [1400, 560], [1240, 460],
      ].map(([x, y], i) => (
        <use key={`t-${i}`} href="#vm-tree-sym" x={x} y={y} width={48 + (i % 3) * 10} height={64 + (i % 3) * 12} />
      ))}

      {/* 竹林（围村） */}
      {[
        [260, 740], [290, 760], [320, 750], [350, 770],
        [1340, 720], [1370, 740], [1400, 730], [1430, 750]
      ].map(([x, y], i) => (
        <use key={`b-${i}`} href="#vm-bamboo" x={x} y={y} width={26} height={70} />
      ))}

      {/* 138 数字游民基地（特殊建筑：玻璃顶白屋）*/}
      <g transform="translate(1080 460)">
        <path d="M 0 30 L 0 80 L 100 80 L 100 30 L 50 0 Z" fill="#fbf6ea" stroke="#1b1612" strokeWidth="2" strokeLinejoin="round" />
        <path d="M 0 30 L 50 0 L 100 30" fill="#6b97a3" stroke="#1b1612" strokeWidth="1.8" />
        <rect x="14" y="40" width="20" height="14" fill="#6b97a3" stroke="#1b1612" strokeWidth="1.2" />
        <rect x="40" y="40" width="20" height="14" fill="#6b97a3" stroke="#1b1612" strokeWidth="1.2" />
        <rect x="66" y="40" width="20" height="14" fill="#6b97a3" stroke="#1b1612" strokeWidth="1.2" />
        <rect x="42" y="58" width="16" height="22" fill="#5a3924" stroke="#1b1612" strokeWidth="1.2" />
        {/* "138" 招牌 */}
        <rect x="30" y="-12" width="40" height="14" fill="#d97757" stroke="#1b1612" strokeWidth="1.2" rx="2" />
        <text x="50" y="-2" textAnchor="middle" fontSize="10" fill="#fbf6ea" fontWeight="bold" fontFamily="monospace">138</text>
      </g>

      {/* —— 远景烟雾（轻雾感）—— */}
      <ellipse cx="500" cy="320" rx="200" ry="20" fill="#fbf6ea" opacity="0.45" />
      <ellipse cx="1100" cy="340" rx="240" ry="22" fill="#fbf6ea" opacity="0.45" />

      {/* —— 远景村名印章 —— */}
      <g transform="translate(80 80)">
        <rect x="0" y="0" width="120" height="120" fill="#a4502f" stroke="#1b1612" strokeWidth="2" rx="3" opacity=".92" />
        <text x="60" y="48" textAnchor="middle" fontFamily="var(--font-serif)" fontSize="34" fill="#fbf6ea" fontWeight="700">龙潭</text>
        <text x="60" y="84" textAnchor="middle" fontFamily="var(--font-serif)" fontSize="34" fill="#fbf6ea" fontWeight="700">古村</text>
        <text x="60" y="108" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="#fbf6ea" opacity=".7">福建·屏南</text>
      </g>

      {/* —— 罗盘 —— */}
      <g transform="translate(1480 100)" opacity=".88">
        <circle r="46" fill="#fbf6ea" stroke="#1b1612" strokeWidth="2" />
        <path d="M 0 -38 L 8 0 L 0 38 L -8 0 Z" fill="#d97757" stroke="#1b1612" strokeWidth="1.5" />
        <text y="-32" textAnchor="middle" fontFamily="var(--font-serif)" fontSize="14" fill="#1b1612" fontWeight="700">北</text>
        <text y="44" textAnchor="middle" fontFamily="var(--font-serif)" fontSize="14" fill="#1b1612" fontWeight="700">南</text>
        <text x="-38" y="4" textAnchor="middle" fontFamily="var(--font-serif)" fontSize="14" fill="#1b1612" fontWeight="700">西</text>
        <text x="38" y="4" textAnchor="middle" fontFamily="var(--font-serif)" fontSize="14" fill="#1b1612" fontWeight="700">东</text>
        <circle r="46" fill="none" stroke="#1b1612" strokeWidth="0.8" strokeDasharray="2 3" />
      </g>

      {/* —— 标签提示（"探索点位 →" 隐喻）—— */}
    </svg>
  );
}

window.VillageMap = VillageMap;
