/**
 * useBgm — 背景音乐 Hook
 *
 * - 挂载时自动淡入播放（loop）
 * - 卸载时自动淡出停止
 * - 支持浏览器自动播放策略：首次需用户交互后才能播放
 */
import { useEffect, useRef } from 'react';

const FADE_MS = 1200;   // 淡入/淡出时长
const STEPS   = 40;     // 动画帧数

export function useBgm(src, volume = 0.3) {
  const audioRef = useRef(null);

  useEffect(() => {
    if (!src) return;

    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = 0;
    audioRef.current = audio;

    let fadeInTimer = null;

    const startPlayback = () => {
      audio.play().then(() => {
        // 淡入
        let step = 0;
        const interval = FADE_MS / STEPS;
        const increment = volume / STEPS;
        fadeInTimer = setInterval(() => {
          step++;
          audio.volume = Math.min(volume, increment * step);
          if (step >= STEPS) clearInterval(fadeInTimer);
        }, interval);
      }).catch(() => {
        // 浏览器阻止自动播放时静默失败
      });
    };

    // 立即尝试播放（用户已有过交互时有效）
    startPlayback();

    // 若被阻止，等用户第一次点击后再播
    const onFirstInteraction = () => {
      if (audio.paused) startPlayback();
      window.removeEventListener('click', onFirstInteraction);
      window.removeEventListener('keydown', onFirstInteraction);
    };
    window.addEventListener('click', onFirstInteraction);
    window.addEventListener('keydown', onFirstInteraction);

    return () => {
      // 清理
      clearInterval(fadeInTimer);
      window.removeEventListener('click', onFirstInteraction);
      window.removeEventListener('keydown', onFirstInteraction);

      // 淡出
      const startVol = audio.volume;
      if (startVol === 0) {
        audio.pause();
        return;
      }
      const interval = FADE_MS / STEPS;
      const decrement = startVol / STEPS;
      let step = 0;
      const fadeOut = setInterval(() => {
        step++;
        audio.volume = Math.max(0, startVol - decrement * step);
        if (step >= STEPS) {
          clearInterval(fadeOut);
          audio.pause();
          audio.src = '';
        }
      }, interval);
    };
  }, [src]);
}
