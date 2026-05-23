/* ============================================================
   characters.jsx — 角色 SVG 立绘
   现代国风插画 · 二头身 · 线稿 + 水彩晕染
   暴露：
     <CharSprite name="longxun|xiaomei" />   游戏地图上的小立绘
     <CharPortrait name="longxun|xiaomei" /> 对话框头像（半身近景）
   ============================================================ */

/* ---------- 共用：水彩晕染笔触（背景污渍）---------- */
function Wash({ cx, cy, r, color, opacity = 0.35 }) {
  return (
    <ellipse
      cx={cx}
      cy={cy}
      rx={r}
      ry={r * 0.85}
      fill={color}
      opacity={opacity}
      style={{ filter: "blur(2px)" }}
    />
  );
}

/* ---------- 龙寻：村管家老向导 ----------
   设计语：竹青色长褂、灰白发、温和短须、手持竹简
   神态：眼神宁静，嘴角微扬，不刻意热情
*/
function LongxunSprite({ className = "", style }) {
  return (
    <svg
      viewBox="0 0 200 320"
      className={className}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="龙寻 立绘"
    >
      <defs>
        <linearGradient id="lx-robe" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5a6f5b" />
          <stop offset="60%" stopColor="#3f5341" />
          <stop offset="100%" stopColor="#2d3e30" />
        </linearGradient>
        <linearGradient id="lx-inner" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f1e6cf" />
          <stop offset="100%" stopColor="#dac9a4" />
        </linearGradient>
        <linearGradient id="lx-skin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f4dbb8" />
          <stop offset="100%" stopColor="#e1bd91" />
        </linearGradient>
        <radialGradient id="lx-cheek" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#e89a7a" stopOpacity=".55" />
          <stop offset="100%" stopColor="#e89a7a" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* 地面水墨阴影 */}
      <Wash cx={100} cy={305} r={42} color="#3a2f25" opacity={0.22} />

      {/* 长褂下摆（梯形）*/}
      <path
        d="M 50 180 Q 48 230 40 290 L 160 290 Q 152 230 150 180 Z"
        fill="url(#lx-robe)"
        stroke="#1b1612"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* 长褂前襟开口 */}
      <path
        d="M 100 180 Q 95 235 92 290"
        stroke="#1b1612"
        strokeWidth="1.5"
        fill="none"
        opacity=".7"
      />
      {/* 腰带 */}
      <rect x="48" y="200" width="104" height="10" fill="#a4502f" stroke="#1b1612" strokeWidth="1.5" />
      <circle cx="100" cy="205" r="3" fill="#f5ecd7" stroke="#1b1612" strokeWidth="1" />

      {/* 双手藏袖（袖口）*/}
      <path
        d="M 56 178 Q 50 200 58 218 Q 72 210 75 195 Z"
        fill="url(#lx-robe)"
        stroke="#1b1612"
        strokeWidth="2"
      />
      <path
        d="M 144 178 Q 150 200 142 218 Q 128 210 125 195 Z"
        fill="url(#lx-robe)"
        stroke="#1b1612"
        strokeWidth="2"
      />

      {/* 内衬领口 */}
      <path
        d="M 78 145 Q 100 168 122 145 L 122 175 L 78 175 Z"
        fill="url(#lx-inner)"
        stroke="#1b1612"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* 外衣领口（V形）*/}
      <path
        d="M 60 150 L 78 145 L 100 175 L 122 145 L 140 150 L 138 185 L 62 185 Z"
        fill="url(#lx-robe)"
        stroke="#1b1612"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {/* 脖子 */}
      <rect x="90" y="130" width="20" height="20" fill="url(#lx-skin)" stroke="#1b1612" strokeWidth="2" />

      {/* —— 头部 —— */}
      {/* 后发（灰白）*/}
      <path
        d="M 55 90 Q 50 60 70 45 Q 100 30 130 45 Q 150 60 145 95 L 145 120 Q 140 110 130 108 Q 125 105 122 100 L 78 100 Q 75 105 70 108 Q 60 110 55 120 Z"
        fill="#8a8576"
        stroke="#1b1612"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* 头发高光（飞白）*/}
      <path d="M 68 60 Q 80 50 95 52" stroke="#f5ecd7" strokeWidth="2" fill="none" opacity=".6" strokeLinecap="round" />

      {/* 脸 */}
      <ellipse cx="100" cy="95" rx="32" ry="38" fill="url(#lx-skin)" stroke="#1b1612" strokeWidth="2.5" />

      {/* 耳朵 */}
      <ellipse cx="68" cy="95" rx="5" ry="8" fill="url(#lx-skin)" stroke="#1b1612" strokeWidth="2" />
      <ellipse cx="132" cy="95" rx="5" ry="8" fill="url(#lx-skin)" stroke="#1b1612" strokeWidth="2" />

      {/* 头顶发髻 */}
      <ellipse cx="100" cy="42" rx="12" ry="10" fill="#6b6356" stroke="#1b1612" strokeWidth="2" />
      <path d="M 88 40 Q 100 30 112 40" stroke="#1b1612" strokeWidth="1.5" fill="none" />

      {/* 眉毛（淡墨）*/}
      <path d="M 78 84 Q 85 80 92 84" stroke="#3a2f25" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M 108 84 Q 115 80 122 84" stroke="#3a2f25" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* 眼睛（细长，宁静）*/}
      <path d="M 80 95 Q 86 99 92 95" stroke="#1b1612" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M 108 95 Q 114 99 120 95" stroke="#1b1612" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* 腮红水彩 */}
      <ellipse cx="80" cy="108" rx="7" ry="4" fill="url(#lx-cheek)" />
      <ellipse cx="120" cy="108" rx="7" ry="4" fill="url(#lx-cheek)" />

      {/* 鼻 */}
      <path d="M 100 100 L 99 110" stroke="#3a2f25" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* 嘴（微笑）*/}
      <path d="M 94 117 Q 100 121 106 117" stroke="#3a2f25" strokeWidth="2" fill="none" strokeLinecap="round" />

      {/* 短须（嘴角下两撇）*/}
      <path d="M 92 122 Q 90 130 88 134" stroke="#6b6356" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M 108 122 Q 110 130 112 134" stroke="#6b6356" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M 100 122 Q 98 132 96 138" stroke="#6b6356" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M 100 122 Q 102 132 104 138" stroke="#6b6356" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* 竹简（左手腕外）*/}
      <g transform="translate(40 195) rotate(-10)">
        <rect x="0" y="0" width="6" height="34" fill="#c9a784" stroke="#1b1612" strokeWidth="1.5" />
        <rect x="6" y="0" width="6" height="34" fill="#b08c63" stroke="#1b1612" strokeWidth="1.5" />
        <rect x="12" y="0" width="6" height="34" fill="#9b7651" stroke="#1b1612" strokeWidth="1.5" />
        <line x1="-1" y1="6" x2="19" y2="6" stroke="#a4502f" strokeWidth="1.5" />
        <line x1="-1" y1="28" x2="19" y2="28" stroke="#a4502f" strokeWidth="1.5" />
      </g>
    </svg>
  );
}

function LongxunPortrait({ className = "", style }) {
  /* 半身近景：用同一张但 viewBox 取头 + 肩 */
  return (
    <svg
      viewBox="40 20 120 150"
      className={className}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="龙寻 头像"
    >
      <defs>
        <linearGradient id="lxp-robe" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5a6f5b" />
          <stop offset="100%" stopColor="#2d3e30" />
        </linearGradient>
        <linearGradient id="lxp-inner" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f1e6cf" />
          <stop offset="100%" stopColor="#dac9a4" />
        </linearGradient>
        <linearGradient id="lxp-skin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f4dbb8" />
          <stop offset="100%" stopColor="#e1bd91" />
        </linearGradient>
        <radialGradient id="lxp-cheek" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#e89a7a" stopOpacity=".6" />
          <stop offset="100%" stopColor="#e89a7a" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* 肩 / 衣领（裁切到 viewBox 下沿） */}
      <path d="M 78 145 Q 100 168 122 145 L 122 175 L 78 175 Z" fill="url(#lxp-inner)" stroke="#1b1612" strokeWidth="2.5" />
      <path d="M 50 155 L 78 145 L 100 175 L 122 145 L 150 155 L 150 175 L 50 175 Z" fill="url(#lxp-robe)" stroke="#1b1612" strokeWidth="2.5" strokeLinejoin="round" />
      <rect x="90" y="130" width="20" height="20" fill="url(#lxp-skin)" stroke="#1b1612" strokeWidth="2" />

      {/* 后发 */}
      <path d="M 55 90 Q 50 55 70 40 Q 100 25 130 40 Q 150 55 145 95 L 145 130 Q 140 115 130 110 Q 125 105 122 100 L 78 100 Q 75 105 70 110 Q 60 115 55 130 Z" fill="#8a8576" stroke="#1b1612" strokeWidth="2.5" />
      <path d="M 68 55 Q 82 45 96 48" stroke="#f5ecd7" strokeWidth="2.5" fill="none" opacity=".55" strokeLinecap="round" />

      {/* 脸 */}
      <ellipse cx="100" cy="95" rx="34" ry="40" fill="url(#lxp-skin)" stroke="#1b1612" strokeWidth="2.5" />

      {/* 耳 */}
      <ellipse cx="66" cy="95" rx="6" ry="9" fill="url(#lxp-skin)" stroke="#1b1612" strokeWidth="2" />
      <ellipse cx="134" cy="95" rx="6" ry="9" fill="url(#lxp-skin)" stroke="#1b1612" strokeWidth="2" />

      {/* 发髻 */}
      <ellipse cx="100" cy="38" rx="14" ry="11" fill="#6b6356" stroke="#1b1612" strokeWidth="2" />
      <path d="M 86 36 Q 100 25 114 36" stroke="#1b1612" strokeWidth="1.5" fill="none" />

      {/* 眉 */}
      <path d="M 76 82 Q 85 78 94 82" stroke="#3a2f25" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M 106 82 Q 115 78 124 82" stroke="#3a2f25" strokeWidth="3" fill="none" strokeLinecap="round" />

      {/* 眼（细长含笑） */}
      <path d="M 78 95 Q 86 100 94 95" stroke="#1b1612" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M 106 95 Q 114 100 122 95" stroke="#1b1612" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="86" cy="96" r="1.2" fill="#1b1612" />
      <circle cx="114" cy="96" r="1.2" fill="#1b1612" />

      {/* 腮红 */}
      <ellipse cx="78" cy="110" rx="9" ry="5" fill="url(#lxp-cheek)" />
      <ellipse cx="122" cy="110" rx="9" ry="5" fill="url(#lxp-cheek)" />

      {/* 鼻 */}
      <path d="M 100 100 L 99 113" stroke="#3a2f25" strokeWidth="1.8" fill="none" strokeLinecap="round" />

      {/* 嘴 */}
      <path d="M 93 119 Q 100 124 107 119" stroke="#3a2f25" strokeWidth="2.4" fill="none" strokeLinecap="round" />

      {/* 须 */}
      <path d="M 91 122 Q 88 132 86 138" stroke="#6b6356" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M 109 122 Q 112 132 114 138" stroke="#6b6356" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M 100 124 Q 98 135 96 142" stroke="#6b6356" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M 100 124 Q 102 135 104 142" stroke="#6b6356" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/* ---------- 小梅：小梅桩主理人 ----------
   设计语：亚麻米色衫 + 苔藓绿围裙、低束发、手执花枝
   神态：眼神冷静观察感，不笑场，淡淡的
*/
function XiaomeiSprite({ className = "", style }) {
  return (
    <svg
      viewBox="0 0 200 320"
      className={className}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="小梅 立绘"
    >
      <defs>
        <linearGradient id="xm-shirt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f7eed8" />
          <stop offset="100%" stopColor="#dec8a0" />
        </linearGradient>
        <linearGradient id="xm-apron" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#84a17a" />
          <stop offset="100%" stopColor="#4f7259" />
        </linearGradient>
        <linearGradient id="xm-pants" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6b4c30" />
          <stop offset="100%" stopColor="#3a2812" />
        </linearGradient>
        <linearGradient id="xm-skin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f6dec1" />
          <stop offset="100%" stopColor="#e6c099" />
        </linearGradient>
        <radialGradient id="xm-cheek" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#e89a7a" stopOpacity=".55" />
          <stop offset="100%" stopColor="#e89a7a" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* 地面阴影 */}
      <Wash cx={100} cy={305} r={40} color="#3a2f25" opacity={0.22} />

      {/* 裤腿 */}
      <path d="M 70 220 Q 70 270 75 295 L 95 295 Q 95 260 96 220 Z" fill="url(#xm-pants)" stroke="#1b1612" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M 104 220 Q 105 260 105 295 L 125 295 Q 130 270 130 220 Z" fill="url(#xm-pants)" stroke="#1b1612" strokeWidth="2.5" strokeLinejoin="round" />

      {/* 鞋（布鞋） */}
      <ellipse cx="85" cy="297" rx="14" ry="6" fill="#3a2812" stroke="#1b1612" strokeWidth="2" />
      <ellipse cx="115" cy="297" rx="14" ry="6" fill="#3a2812" stroke="#1b1612" strokeWidth="2" />

      {/* 围裙（在衣服外）*/}
      <path d="M 62 185 Q 60 215 68 235 L 132 235 Q 140 215 138 185 Z" fill="url(#xm-apron)" stroke="#1b1612" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M 62 185 L 138 185" stroke="#1b1612" strokeWidth="1.5" opacity=".4" />
      {/* 围裙绳 */}
      <path d="M 62 188 Q 50 195 48 200" stroke="#1b1612" strokeWidth="1.5" fill="none" />
      <path d="M 138 188 Q 150 195 152 200" stroke="#1b1612" strokeWidth="1.5" fill="none" />

      {/* 衣身 */}
      <path d="M 56 165 L 56 210 L 144 210 L 144 165 Q 130 145 100 145 Q 70 145 56 165 Z" fill="url(#xm-shirt)" stroke="#1b1612" strokeWidth="2.5" strokeLinejoin="round" />

      {/* 袖子 */}
      <path d="M 56 165 Q 42 175 38 200 Q 48 205 58 200 Z" fill="url(#xm-shirt)" stroke="#1b1612" strokeWidth="2.5" />
      <path d="M 144 165 Q 158 175 162 200 Q 152 205 142 200 Z" fill="url(#xm-shirt)" stroke="#1b1612" strokeWidth="2.5" />

      {/* 手（露出袖口） */}
      <circle cx="46" cy="208" r="7" fill="url(#xm-skin)" stroke="#1b1612" strokeWidth="2" />
      <circle cx="154" cy="208" r="7" fill="url(#xm-skin)" stroke="#1b1612" strokeWidth="2" />

      {/* 花枝（右手）*/}
      <g transform="translate(150 165)">
        <path d="M 0 45 Q -5 30 -10 10 Q -8 -2 -3 -10" stroke="#4f7259" strokeWidth="2" fill="none" strokeLinecap="round" />
        <circle cx="-3" cy="-10" r="6" fill="#f0b48a" stroke="#1b1612" strokeWidth="1.5" />
        <circle cx="-10" cy="2" r="5" fill="#e89a7a" stroke="#1b1612" strokeWidth="1.5" />
        <circle cx="-7" cy="22" r="4" fill="#f0b48a" stroke="#1b1612" strokeWidth="1.5" />
        <path d="M -12 15 Q -16 12 -18 18" stroke="#4f7259" strokeWidth="1.5" fill="none" />
        <path d="M -5 5 Q -1 -2 4 0" stroke="#4f7259" strokeWidth="1.5" fill="none" />
      </g>

      {/* 领口 */}
      <path d="M 86 140 Q 100 158 114 140 L 114 165 L 86 165 Z" fill="url(#xm-skin)" stroke="#1b1612" strokeWidth="2.5" />

      {/* 脖子 */}
      <rect x="92" y="125" width="16" height="18" fill="url(#xm-skin)" stroke="#1b1612" strokeWidth="2" />

      {/* —— 头 —— */}
      {/* 后发 */}
      <path d="M 58 100 Q 53 60 76 42 Q 100 28 124 42 Q 147 60 142 100 L 142 130 Q 138 115 130 110 L 70 110 Q 62 115 58 130 Z" fill="#2a2018" stroke="#1b1612" strokeWidth="2.5" />

      {/* 脸 */}
      <ellipse cx="100" cy="92" rx="32" ry="38" fill="url(#xm-skin)" stroke="#1b1612" strokeWidth="2.5" />

      {/* 耳 */}
      <ellipse cx="68" cy="92" rx="5" ry="8" fill="url(#xm-skin)" stroke="#1b1612" strokeWidth="2" />
      <ellipse cx="132" cy="92" rx="5" ry="8" fill="url(#xm-skin)" stroke="#1b1612" strokeWidth="2" />

      {/* 刘海（细碎几缕） */}
      <path d="M 75 70 Q 85 60 100 62 Q 115 60 125 70 L 125 95 Q 115 80 100 80 Q 85 80 75 95 Z" fill="#2a2018" stroke="#1b1612" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M 80 65 L 85 80 M 95 60 L 95 78 M 110 62 L 112 78" stroke="#1b1612" strokeWidth="1.5" opacity=".6" />

      {/* 后脑发束（低马尾从耳后伸出） */}
      <path d="M 138 102 Q 158 108 162 130 Q 160 145 152 148 Q 145 140 142 125 Z" fill="#2a2018" stroke="#1b1612" strokeWidth="2.5" />

      {/* 眉（平直，淡冷） */}
      <path d="M 78 84 L 92 83" stroke="#1b1612" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 108 83 L 122 84" stroke="#1b1612" strokeWidth="2.5" strokeLinecap="round" />

      {/* 眼（杏仁状，淡冷观察感）*/}
      <path d="M 78 94 Q 85 91 92 94 Q 85 97 78 94 Z" fill="#1b1612" stroke="#1b1612" strokeWidth="2" />
      <path d="M 108 94 Q 115 91 122 94 Q 115 97 108 94 Z" fill="#1b1612" stroke="#1b1612" strokeWidth="2" />
      <circle cx="84" cy="93" r="1" fill="#fff" opacity=".8" />
      <circle cx="114" cy="93" r="1" fill="#fff" opacity=".8" />

      {/* 腮红（淡淡的） */}
      <ellipse cx="80" cy="106" rx="6" ry="3" fill="url(#xm-cheek)" />
      <ellipse cx="120" cy="106" rx="6" ry="3" fill="url(#xm-cheek)" />

      {/* 鼻 */}
      <path d="M 100 98 L 99 108" stroke="#3a2f25" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* 嘴（平直 + 一点点弧度，不笑） */}
      <path d="M 95 115 Q 100 117 105 115" stroke="#a4502f" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function XiaomeiPortrait({ className = "", style }) {
  return (
    <svg
      viewBox="40 20 120 150"
      className={className}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="小梅 头像"
    >
      <defs>
        <linearGradient id="xmp-shirt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f7eed8" />
          <stop offset="100%" stopColor="#dec8a0" />
        </linearGradient>
        <linearGradient id="xmp-apron" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#84a17a" />
          <stop offset="100%" stopColor="#4f7259" />
        </linearGradient>
        <linearGradient id="xmp-skin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f6dec1" />
          <stop offset="100%" stopColor="#e6c099" />
        </linearGradient>
        <radialGradient id="xmp-cheek" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#e89a7a" stopOpacity=".6" />
          <stop offset="100%" stopColor="#e89a7a" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* 围裙边缘 */}
      <path d="M 60 175 L 140 175 L 140 175 Q 100 200 60 175 Z" fill="url(#xmp-apron)" stroke="#1b1612" strokeWidth="2.5" />

      {/* 衣身 */}
      <path d="M 52 155 L 52 175 L 148 175 L 148 155 Q 130 138 100 138 Q 70 138 52 155 Z" fill="url(#xmp-shirt)" stroke="#1b1612" strokeWidth="2.5" strokeLinejoin="round" />

      {/* 领口 */}
      <path d="M 84 138 Q 100 156 116 138 L 116 162 L 84 162 Z" fill="url(#xmp-skin)" stroke="#1b1612" strokeWidth="2.5" />

      {/* 脖 */}
      <rect x="91" y="120" width="18" height="20" fill="url(#xmp-skin)" stroke="#1b1612" strokeWidth="2" />

      {/* 后发轮廓 */}
      <path d="M 56 95 Q 50 55 76 38 Q 100 24 124 38 Q 150 55 144 95 L 144 130 Q 138 115 130 108 L 70 108 Q 62 115 56 130 Z" fill="#2a2018" stroke="#1b1612" strokeWidth="2.5" />

      {/* 脸 */}
      <ellipse cx="100" cy="88" rx="34" ry="40" fill="url(#xmp-skin)" stroke="#1b1612" strokeWidth="2.5" />

      {/* 耳 */}
      <ellipse cx="66" cy="90" rx="6" ry="9" fill="url(#xmp-skin)" stroke="#1b1612" strokeWidth="2" />
      <ellipse cx="134" cy="90" rx="6" ry="9" fill="url(#xmp-skin)" stroke="#1b1612" strokeWidth="2" />

      {/* 刘海 */}
      <path d="M 72 64 Q 84 52 100 55 Q 116 52 128 64 L 128 92 Q 116 75 100 75 Q 84 75 72 92 Z" fill="#2a2018" stroke="#1b1612" strokeWidth="2.5" />
      <path d="M 78 60 L 84 78 M 95 54 L 95 76 M 110 56 L 112 76 M 121 60 L 119 78" stroke="#1b1612" strokeWidth="1.4" opacity=".55" />

      {/* 后发束 */}
      <path d="M 140 100 Q 162 108 166 130 Q 164 148 154 152 Q 146 142 142 128 Z" fill="#2a2018" stroke="#1b1612" strokeWidth="2.5" />

      {/* 眉（平直） */}
      <path d="M 76 80 L 93 79" stroke="#1b1612" strokeWidth="3" strokeLinecap="round" />
      <path d="M 107 79 L 124 80" stroke="#1b1612" strokeWidth="3" strokeLinecap="round" />

      {/* 眼（杏仁，含一点观察感） */}
      <path d="M 76 92 Q 85 88 94 92 Q 85 96 76 92 Z" fill="#1b1612" stroke="#1b1612" strokeWidth="2.4" />
      <path d="M 106 92 Q 115 88 124 92 Q 115 96 106 92 Z" fill="#1b1612" stroke="#1b1612" strokeWidth="2.4" />
      <circle cx="84" cy="91" r="1.4" fill="#fff" opacity=".9" />
      <circle cx="114" cy="91" r="1.4" fill="#fff" opacity=".9" />

      {/* 腮红 */}
      <ellipse cx="78" cy="103" rx="7" ry="4" fill="url(#xmp-cheek)" />
      <ellipse cx="122" cy="103" rx="7" ry="4" fill="url(#xmp-cheek)" />

      {/* 鼻 */}
      <path d="M 100 97 L 99 108" stroke="#3a2f25" strokeWidth="1.8" fill="none" strokeLinecap="round" />

      {/* 嘴（平直一点点）*/}
      <path d="M 94 116 Q 100 119 106 116" stroke="#a4502f" strokeWidth="2.4" fill="none" strokeLinecap="round" />

      {/* 耳后小花（创作者标识） */}
      <g transform="translate(60 70)">
        <circle cx="0" cy="0" r="3.5" fill="#f0b48a" stroke="#1b1612" strokeWidth="1.2" />
        <circle cx="0" cy="0" r="1.2" fill="#a4502f" />
      </g>
    </svg>
  );
}

/* ---------- 调度器 ---------- */
function CharSprite({ name, ...props }) {
  if (name === "longxun") return <LongxunSprite {...props} />;
  if (name === "xiaomei") return <XiaomeiSprite {...props} />;
  return null;
}
function CharPortrait({ name, ...props }) {
  if (name === "longxun") return <LongxunPortrait {...props} />;
  if (name === "xiaomei") return <XiaomeiPortrait {...props} />;
  return null;
}

window.CharSprite = CharSprite;
window.CharPortrait = CharPortrait;
