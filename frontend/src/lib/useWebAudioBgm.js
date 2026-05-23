/**
 * useWebAudioBgm — 程序化背景音乐（Web Audio API）
 *
 * 无需音频文件，浏览器实时合成。
 * 遵守浏览器自动播放策略：首次用户交互后才开始。
 *
 * theme 可选值：
 *   'scifi' — 科幻感氛围：低频 drone + 和弦垫音 + 高频微光 + 散落琶音
 *
 * 用法：
 *   const { muted, toggleMute } = useWebAudioBgm('scifi', { volume: 0.25 });
 */
import { useEffect, useRef, useState } from 'react';

/* ─────────────────────────────────────────────────────────────
   主 Hook
───────────────────────────────────────────────────────────── */
export function useWebAudioBgm(theme, { volume = 0.25 } = {}) {
  const ctxRef    = useRef(null);
  const masterRef = useRef(null);
  const [muted,   setMuted]   = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!theme) return;

    // 必须在用户手势之后创建 AudioContext（Chrome 策略）
    const tryStart = () => {
      if (ctxRef.current) return;

      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;

      const ctx = new AC();
      ctxRef.current = ctx;

      const master = ctx.createGain();
      master.gain.setValueAtTime(0, ctx.currentTime);
      master.gain.linearRampToValueAtTime(volume, ctx.currentTime + 4); // 4 秒淡入
      master.connect(ctx.destination);
      masterRef.current = master;

      if (theme === 'scifi') buildSciFi(ctx, master);

      ctx.resume();
      setStarted(true);
    };

    window.addEventListener('click',   tryStart, { once: true });
    window.addEventListener('keydown', tryStart, { once: true });

    return () => {
      window.removeEventListener('click',   tryStart);
      window.removeEventListener('keydown', tryStart);

      // 淡出 + 关闭 ctx
      const ctx    = ctxRef.current;
      const master = masterRef.current;
      if (ctx && master) {
        const now = ctx.currentTime;
        master.gain.setValueAtTime(master.gain.value, now);
        master.gain.linearRampToValueAtTime(0, now + 2);
        setTimeout(() => ctx.close().catch(() => {}), 2500);
        ctxRef.current    = null;
        masterRef.current = null;
        setStarted(false);
      }
    };
  }, [theme, volume]);

  const toggleMute = () => {
    const ctx    = ctxRef.current;
    const master = masterRef.current;
    if (!ctx || !master) return;

    setMuted(prev => {
      const next = !prev;
      const now  = ctx.currentTime;
      if (next) {
        master.gain.linearRampToValueAtTime(0, now + 0.6);
      } else {
        master.gain.linearRampToValueAtTime(volume, now + 0.6);
      }
      return next;
    });
  };

  return { muted, toggleMute, started };
}

/* ─────────────────────────────────────────────────────────────
   科幻音景构建
   层次结构：
     1. Sub drone   — 55 Hz 正弦，带极慢 LFO 振颤
     2. Chord pad   — A minor 四音和弦（锯齿→低通），慢速滤波扫描
     3. Hi shimmer  — 880 / 1320 Hz 高频微光，颤音调制
     4. Arp pings   — 散落音符（A 小调五声音阶），三角波，随机触发
───────────────────────────────────────────────────────────── */
function buildSciFi(ctx, master) {
  const t = ctx.currentTime;

  // ── 1. Sub drone（55 Hz）──────────────────────────────────
  const subOsc  = ctx.createOscillator();
  const subGain = ctx.createGain();
  subOsc.type          = 'sine';
  subOsc.frequency.value = 55;
  subGain.gain.value   = 0.22;
  subOsc.connect(subGain);
  subGain.connect(master);

  // Sub LFO：极慢音高漂移 ±1.2 Hz
  const subLFO     = ctx.createOscillator();
  const subLFOGain = ctx.createGain();
  subLFO.type          = 'sine';
  subLFO.frequency.value = 0.06;
  subLFOGain.gain.value  = 1.2;
  subLFO.connect(subLFOGain);
  subLFOGain.connect(subOsc.frequency);

  subOsc.start(t);
  subLFO.start(t);

  // ── 2. Chord pad（A minor：A2 C3 E3 A3）──────────────────
  const padFilter = ctx.createBiquadFilter();
  padFilter.type          = 'lowpass';
  padFilter.frequency.value = 520;
  padFilter.Q.value       = 1.8;
  padFilter.connect(master);

  const padGain = ctx.createGain();
  padGain.gain.value = 0.14;
  padGain.connect(padFilter);

  // 轻微音高差（每个声部 ±0.4 Hz detune）
  const padFreqs = [110, 130.8, 164.8, 220];
  const detunes  = [ 0.4, -0.3,  0.2, -0.4];
  padFreqs.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    osc.type          = 'sawtooth';
    osc.frequency.value = freq + detunes[i];
    osc.connect(padGain);
    osc.start(t);
  });

  // 滤波扫描 LFO（0.03 Hz，±260 Hz）
  const fLFO     = ctx.createOscillator();
  const fLFOGain = ctx.createGain();
  fLFO.type           = 'sine';
  fLFO.frequency.value  = 0.03;
  fLFOGain.gain.value   = 260;
  fLFO.connect(fLFOGain);
  fLFOGain.connect(padFilter.frequency);
  fLFO.start(t);

  // ── 3. Hi shimmer（880 / 1320 Hz）────────────────────────
  const shimGain = ctx.createGain();
  shimGain.gain.value = 0.06;
  shimGain.connect(master);

  [880, 1320].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    osc.type          = 'sine';
    osc.frequency.value = freq + i * 0.5; // 微小 detune
    osc.connect(shimGain);
    osc.start(t);
  });

  // 颤音 LFO（0.18 Hz）
  const tremoLFO     = ctx.createOscillator();
  const tremoLFOGain = ctx.createGain();
  tremoLFO.type           = 'sine';
  tremoLFO.frequency.value  = 0.18;
  tremoLFOGain.gain.value   = 0.045;
  tremoLFO.connect(tremoLFOGain);
  tremoLFOGain.connect(shimGain.gain);
  tremoLFO.start(t);

  // ── 4. Arp pings（A 小调五声音阶，随机散落）──────────────
  // 音符：A3 C4 D4 E4 G4 A4（×2 octave shift for shimmer feel）
  const arpPool = [220, 261.6, 293.7, 329.6, 392, 440, 523.3, 587.3];
  scheduleArpPings(ctx, master, arpPool);
}

/* 随机散落的三角波音符（永不停止，随 ctx 关闭而停） */
function scheduleArpPings(ctx, master, notes) {
  function next() {
    if (ctx.state === 'closed') return;

    const now  = ctx.currentTime;
    const freq = notes[Math.floor(Math.random() * notes.length)];
    const dur  = 1.8 + Math.random() * 1.5;   // 音符持续
    const gap  = 3.5 + Math.random() * 5;      // 下一音符间隔（3.5–8.5 s）

    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type          = 'triangle';
    osc.frequency.value = freq;

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.07, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    osc.connect(gain);
    gain.connect(master);
    osc.start(now);
    osc.stop(now + dur + 0.05);

    setTimeout(next, gap * 1000);
  }

  // 首次延迟 3 秒，等淡入结束再起音
  setTimeout(next, 3000);
}
