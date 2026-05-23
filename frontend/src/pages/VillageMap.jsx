/**
 * pages/VillageMap.jsx — RPG 风格村庄地图主页
 * 路由: /
 *
 * 功能：
 * - 太极开场动画（首次访问，sessionStorage 防重播）
 * - 手绘 SVG 地图底图（VillageMap 组件）
 * - 龙圣子 NPC（可点击，触发 RPG 对话框）
 * - 小梅桩 MapPin（点击进入庭院场景）
 * - 138 数字游民基地 MapPin（暂锁）
 * - HUD 顶部状态栏
 * - 黑色过场动画
 * - RPGDialog 对话框（打字机 + 选项 + 自由输入接后端）
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useYuanXP } from '../lib/yuanxp.js';
import { sendChat } from '../lib/api.js';
import { getScripts, resolveNode } from '../lib/dialog-scripts.js';
import { detectWorkMedia } from '../lib/workMedia.js';
import { useBgm } from '../lib/useBgm.js';
import VillageMapSVG from '../components/maps/VillageMap.jsx';
import NPC from '../components/scene/NPC.jsx';
import MapPin from '../components/scene/MapPin.jsx';
import CloudPin from '../components/scene/CloudPin.jsx';
import HUD from '../components/scene/HUD.jsx';
import SceneTransition from '../components/scene/SceneTransition.jsx';
import RPGDialog from '../components/RPGDialog.jsx';
import TaijiOpening from '../components/TaijiOpening.jsx';

// 模块级标记：刷新页面时归零，React Router 导航时保留
let _openingShown = false;

function useOpeningOnce() {
  const [show, setShow] = useState(!_openingShown);
  const done = () => {
    _openingShown = true;
    setShow(false);
  };
  return [show, done];
}

export default function VillageMap() {
  const navigate = useNavigate();
  const { xp, log, add } = useYuanXP();

  // 背景音乐
  useBgm('/assets/audio/village-bgm.mp3', 0.28);

  // 开场动画
  const [showOpening, doneOpening] = useOpeningOnce();

  // 过场动画
  const [transitioning, setTransitioning] = useState(false);
  const transTarget = useRef(null);

  // 对话框状态
  const [dialog, setDialog] = useState(null);
  // dialog: { speaker, nodeId } | null

  // 自由输入对话历史
  const [chatHistory, setChatHistory] = useState([]);
  const [busy, setBusy] = useState(false);

  // 当前节点数据（memoized）
  const scripts = dialog ? getScripts(dialog.speaker) : null;
  const node = (scripts && dialog) ? resolveNode(scripts, dialog.nodeId) : null;

  /** 打开 RPG 对话框，指定 speaker + nodeId */
  function openDialog(speaker, nodeId = 'open') {
    add('DIALOG_LONGXUN', `与${speaker}对话`);
    setDialog({ speaker, nodeId });
    setChatHistory([]);
  }

  /** 关闭对话框 */
  function closeDialog() {
    setDialog(null);
    setBusy(false);
  }

  /** 处理选项点击 */
  function handleChoose(choice) {
    if (!choice) return;

    // 特殊 action
    if (choice.action === 'enter_xiaomeizhuang') {
      closeDialog();
      startTransition('/space/xiaomeizhuang');
      return;
    }
    if (choice.action === 'back_to_map' || choice.action === 'close') {
      closeDialog();
      return;
    }

    // 跳转到下一节点
    if (choice.next && dialog) {
      add('DIALOG_LONGXUN', `对话节点 ${choice.next}`);
      setDialog(prev => prev ? { ...prev, nodeId: choice.next } : null);
    }
  }

  /** 处理自由输入 */
  async function handleFree(text) {
    if (!text.trim() || busy || !dialog) return;
    setBusy(true);

    const userMsg = { role: 'user', content: text };
    const newHistory = [...chatHistory, userMsg];
    setChatHistory(newHistory);

    try {
      const res = await sendChat({
        slug: dialog.speaker,
        message: text,
        history: chatHistory.slice(-6), // 最近 3 轮
      });
      const replyText = res.text || res.reply || (res.toolResult ? '我为你整理了一份旅居方案。' : '…');
      const assistantMsg = { role: 'assistant', content: replyText };
      setChatHistory(prev => [...prev, assistantMsg]);
      add('FREEFORM_CHAT', '自由对话');
      if (res.toolResult?.type === 'propose_itinerary') add('RECEIVE_ITINERARY', '收到旅居方案');

      // 渲染后端回复为临时节点，附带关键词检测到的媒体和结构化方案
      const detectedMedia = detectWorkMedia(replyText);
      setDialog(prev => prev ? {
        ...prev,
        nodeId: '__freeform__',
        _freeformNode: {
          speaker: prev.speaker,
          text: replyText,
          media: detectedMedia,
          toolResult: res.toolResult || null,
          choices: [{ label: '回到主线', next: 'open' }],
        }
      } : null);
    } catch (err) {
      console.error('freeform chat error:', err);
    } finally {
      setBusy(false);
    }
  }

  /** 过场动画并跳转 */
  function startTransition(path) {
    transTarget.current = path;
    setTransitioning(true);
    setTimeout(() => {
      navigate(transTarget.current);
    }, 550);
  }

  // 解析当前对话节点（含临时自由输入节点）
  const currentNode = dialog?.nodeId === '__freeform__'
    ? dialog._freeformNode
    : node;

  return (
    <div
      className="no-select"
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: 'var(--paper-200)',
      }}
    >
      {/* ── SVG 地图底图 ── */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <VillageMapSVG
          style={{ width: '100%', height: '100%', display: 'block' }}
        />
      </div>

      {/* ── 龙圣子 NPC ── */}
      <NPC
        name="longxun"
        x={20}
        y={78}
        label="龙圣子"
        badge="！"
        prompt="点击与龙圣子对话"
        onClick={() => openDialog('longxun', 'open')}
      />

      {/* ── 小梅桩 MapPin（可进入） ── */}
      <MapPin
        x={20}
        y={40}
        label="小梅桩"
        color="var(--persimmon-500)"
        onClick={() => startTransition('/space/xiaomeizhuang')}
      />

      {/* ── DAO龙潭数字游民基地（可进入） ── */}
      <MapPin
        x={48}
        y={75}
        label="DAO数字游民基地"
        color="var(--moss-600)"
        onClick={() => startTransition('/space/dao-longtan')}
      />

      {/* ── 金豆子（可进入） ── */}
      <MapPin
        x={33}
        y={37}
        label="金豆子"
        color="var(--moss-600)"
        onClick={() => startTransition('/space/jindouzi')}
      />

      {/* ── 黄喆云空间（炼金工作室）── */}
      <CloudPin
        x={50}
        y={55}
        label="分身蒸馏工作室"
        icon="cloud-pin-flask.svg"
        onClick={() => startTransition('/space/huangzhe-ai-studio')}
      />

      {/* ── HUD 状态栏 ── */}
      <HUD xp={xp} log={log} location="龙潭村" />

      {/* ── 右下角装饰太极（顺时针） ── */}
      <div style={{
        position: 'absolute',
        bottom: 20, right: 'calc(12% + 20px)',
        zIndex: 10, pointerEvents: 'none',
      }}>
        <img
          src="/assets/images/taiji.png"
          alt="太极"
          width="144" height="144"
          draggable={false}
          style={{ animation: 'map-taiji-cw 18s linear infinite', display: 'block', opacity: 0.7 }}
        />
        <style>{`
          @keyframes map-taiji-cw {
            from { transform: rotate(0deg); }
            to   { transform: rotate(-360deg); }
          }
        `}</style>
      </div>

      {/* ── 左下角项目标识 ── */}
      <div style={{
        position: 'absolute',
        bottom: 20,
        left: 20,
        zIndex: 10,
        fontFamily: 'var(--font-serif)',
        fontSize: 13,
        color: 'var(--paper-50)',
        textShadow: '0 1px 4px rgba(27,22,18,.8)',
        letterSpacing: '0.05em',
        userSelect: 'none',
      }}>
        元家乡 2050 · 龙潭村数字旅居
      </div>

      {/* ── 过场动画 ── */}
      <SceneTransition show={transitioning} />

      {/* ── RPG 对话框 ── */}
      {dialog && currentNode && (
        <RPGDialog
          speaker={currentNode.speaker || dialog.speaker}
          name={currentNode.name || (dialog.speaker === 'longxun' ? '龙圣子' : '梅桩主')}
          nameSub={currentNode.nameSub || (dialog.speaker === 'longxun' ? '龙潭村守护者' : '小梅桩主理人')}
          text={currentNode.text || ''}
          media={currentNode.media}
          toolResult={currentNode.toolResult}
          choices={currentNode.choices || []}
          onChoose={handleChoose}
          onFree={handleFree}
          onClose={closeDialog}
          onNavigate={(path) => { closeDialog(); startTransition(path); }}
          busy={busy}
          accent={dialog.speaker === 'longxun' ? 'var(--moss-600)' : 'var(--persimmon-500)'}
        />
      )}

      {/* ── 太极开场动画（最顶层） ── */}
      {showOpening && <TaijiOpening onDone={doneOpening} />}
    </div>
  );
}
