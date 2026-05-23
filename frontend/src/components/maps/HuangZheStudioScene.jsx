/**
 * HuangZheStudioScene.jsx — 分身蒸馏工作室场景背景
 *
 * 黄喆的云空间在视觉上呈现为一个炼金感的数字工作室：
 * Gemini 生成的 AI 工作室场景图，暗色背景 contain 居中显示。
 */

export default function HuangZheStudioScene({ children }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        background: '#0d1117',          // 深色调，科技感
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <img
        src="/assets/images/spaces/huangzhe-ai-studio/huangzhe-studio-bg.png"
        alt="分身蒸馏工作室"
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          width: 'auto',
          height: 'auto',
          display: 'block',
          objectFit: 'contain',
        }}
      />
      {children}
    </div>
  );
}
