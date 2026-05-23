/**
 * pages/SpaceDetail.jsx — 空间详情页（双模式）
 * 路由: /space/:slug
 *
 * 物理空间（space_kind === 'physical'）:
 *   → SVG 庭院场景 + NPC + HUD + ToolDock + SlideOver 面板 + RPGDialog
 *   若空间无专属 SVG，回退到渐变色背景 + NPC
 *
 * 云空间（space_kind === 'cloud'）:
 *   → 保留原有 Tab 布局（对话 / 活动 / 作品）
 */

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchSpaces, fetchSpaceActivities, fetchSpaceWorks, sendChat } from '../lib/api.js';
import { useYuanXP } from '../lib/yuanxp.js';
import { getPersonaSlug } from '../lib/persona-routing.js';
import { getScripts, resolveNode } from '../lib/dialog-scripts.js';
import { detectWorkMedia } from '../lib/workMedia.js';
import { useBgm } from '../lib/useBgm.js';

// Scene components (physical)
import XiaomeiZhuangScene from '../components/maps/XiaomeiZhuangScene.jsx';
import XiaomeiZhuangLobby from '../components/maps/XiaomeiZhuangLobby.jsx';
import DaoLongtanLobby from '../components/maps/DaoLongtanLobby.jsx';
import DaoLongtanScene from '../components/maps/DaoLongtanScene.jsx';
import HuangZheStudioScene from '../components/maps/HuangZheStudioScene.jsx';
import JindouziScene from '../components/maps/JindouziScene.jsx';
import NPC from '../components/scene/NPC.jsx';
import MiniMap from '../components/scene/MiniMap.jsx';
import HUD from '../components/scene/HUD.jsx';
import SceneTransition from '../components/scene/SceneTransition.jsx';
import RPGDialog from '../components/RPGDialog.jsx';
import DistillationLab from '../components/DistillationLab.jsx';
import ToolDock from '../components/panels/ToolDock.jsx';
import QuestBoard from '../components/panels/QuestBoard.jsx';
import WorksWall from '../components/panels/WorksWall.jsx';

// Cloud / legacy components
import PersonaChat from '../components/PersonaChat.jsx';
import ActivityList from '../components/ActivityList.jsx';
import WorkGallery from '../components/WorkGallery.jsx';
import YuanXPWidget from '../components/YuanXPWidget.jsx';

// ──────────────────────────────────────────────
// 物理空间场景视图
// ──────────────────────────────────────────────

/** 已有场景组件的 slug 映射（SVG 或 PNG 背景） */
const SVG_SCENES = {
  xiaomeizhuang:        XiaomeiZhuangScene,
  'dao-longtan':        DaoLongtanScene,
  'huangzhe-ai-studio': HuangZheStudioScene,
  jindouzi:             JindouziScene,
};

/** 渐变色回退（未来新空间上线前） */
const FALLBACK_GRADIENTS = [
  'linear-gradient(135deg, #a8c4cb 0%, #6b97a3 100%)',
  'linear-gradient(135deg, #c7d6b0 0%, #4f7259 100%)',
  'linear-gradient(135deg, #d6c194 0%, #9b7651 100%)',
];
function slugGradient(slug) {
  let h = 0;
  for (let c of slug) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return FALLBACK_GRADIENTS[h % FALLBACK_GRADIENTS.length];
}

/** 各物理空间的背景音乐映射 */
const SPACE_BGM = {
  xiaomeizhuang:        '/assets/audio/xiaomeizhuang-bgm.mp3',
  'dao-longtan':        '/assets/audio/dao-longtan-bgm.mp3',
  'huangzhe-ai-studio': '/assets/audio/huangzhe-ai-studio-bgm.mp3',
  jindouzi:             '/assets/audio/jindouzi-bgm.mp3',
};

/** 各物理空间 NPC 位置（百分比，相对视口）默认 x=50 y=68 */
const NPC_POSITIONS = {
  'dao-longtan':        { x: 74, y: 81 },
  'huangzhe-ai-studio': { x: 20, y: 90 },
  jindouzi:             { x: 36, y: 87 },
  xiaomeizhuang:        { x: 74, y: 78 },
};

/** 各物理空间 NPC 缩放比例（默认 1） */
const NPC_SCALES = {
  'huangzhe-ai-studio': 1.5,
  jindouzi:             1.5,
  xiaomeizhuang:        1.3,
  'dao-longtan':        1.5,
};

function PhysicalSceneView({ space, activities, works, xp, onBack }) {
  const SceneComponent = SVG_SCENES[space.slug] ?? null;
  const personaSlug = getPersonaSlug(space);

  // 背景音乐（根据空间 slug 选曲，音量稍低避免遮盖对话）
  useBgm(SPACE_BGM[space.slug] ?? null, 0.22);

  // 玄关状态：小梅桩 / 数字游民基地进入时先展示门口，点击后切换室内
  const HAS_LOBBY = ['xiaomeizhuang', 'dao-longtan'];
  const [inLobby, setInLobby] = useState(HAS_LOBBY.includes(space.slug));

  // Dialog state
  const [dialog, setDialog] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [busy, setBusy] = useState(false);
  const { log, add } = useYuanXP();

  // Panel state
  const [panel, setPanel] = useState(null); // 'quests' | 'works' | null

  // 蒸馏体验 lab
  const [showDistillationLab, setShowDistillationLab] = useState(false);

  // Scripts
  const scripts = dialog ? getScripts(dialog.speaker) : null;
  const node = (scripts && dialog) ? resolveNode(scripts, dialog.nodeId) : null;
  const currentNode = dialog?.nodeId === '__freeform__' ? dialog._freeformNode : node;

  function openDialog(speaker, nodeId = 'open') {
    add('DIALOG_HOST', `与${speaker}对话`);
    setDialog({ speaker, nodeId });
    setChatHistory([]);
  }

  function closeDialog() {
    setDialog(null);
    setBusy(false);
  }

  function handleChoose(choice) {
    if (!choice) return;
    if (choice.action === 'back_to_map' || choice.action === 'close') {
      closeDialog();
      return;
    }
    if (choice.action === 'open_distillation_lab') {
      setShowDistillationLab(true);
      return;
    }
    if (choice.next && dialog) {
      add('DIALOG_HOST', `对话节点 ${choice.next}`);
      setDialog(prev => prev ? { ...prev, nodeId: choice.next } : null);
    }
  }

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
        history: chatHistory.slice(-6),
      });
      const replyText = res.text || res.reply || (res.toolResult ? '我为你整理了一份旅居方案。' : '…');
      const assistantMsg = { role: 'assistant', content: replyText };
      setChatHistory(prev => [...prev, assistantMsg]);
      add('FREEFORM_CHAT', '自由对话');
      if (res.toolResult?.type === 'propose_itinerary') add('RECEIVE_ITINERARY', '收到旅居方案');
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

  const toolButtons = [
    {
      icon: '任',
      label: '活动',
      badge: (activities.upcoming?.length || 0) + (activities.past?.length || 0),
      onClick: () => {
        setPanel('quests');
        add('VIEW_ACTIVITIES', `查看 ${space.name} 活动`);
      },
    },
    {
      icon: '作',
      label: '作品',
      badge: works.length,
      onClick: () => setPanel('works'),
    },
  ];

  const npcName = space.host_name || (personaSlug === 'xiaomei' ? '梅桩主' : personaSlug);
  const npcSub = space.host_title || space.name;
  const npcAccent = personaSlug === 'longxun'
    ? 'var(--moss-600)'
    : personaSlug === 'huangzhe'
      ? 'var(--water-500, #4f9fbf)'
      : 'var(--persimmon-500)';

  return (
    <div
      className="no-select"
      style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}
    >
      {/* ── 玄关（门口照片 + 打字机文字）── */}
      {inLobby && space.slug === 'xiaomeizhuang' && (
        <XiaomeiZhuangLobby onEnter={() => setInLobby(false)} />
      )}
      {inLobby && space.slug === 'dao-longtan' && (
        <DaoLongtanLobby onEnter={() => setInLobby(false)} />
      )}

      {/* ── 场景背景（玄关消失后显示）── */}
      {!inLobby && (SceneComponent ? (
        <SceneComponent />
      ) : (
        <div style={{
          position: 'absolute', inset: 0,
          background: slugGradient(space.slug),
        }} />
      ))}

      {/* ── 主理人 NPC ── */}
      {!inLobby && personaSlug && (
        <NPC
          name={personaSlug}
          x={NPC_POSITIONS[space.slug]?.x ?? 50}
          y={NPC_POSITIONS[space.slug]?.y ?? 68}
          scale={NPC_SCALES[space.slug] ?? 1}
          label={npcName}
          badge="！"
          prompt={`点击与${npcName}对话`}
          onClick={() => openDialog(personaSlug, 'open')}
        />
      )}

      {/* ── 柯基 Ego（仅金豆子空间）── */}
      {/* Note: inLobby is always false for jindouzi, so no guard needed */}
      {space.slug === 'jindouzi' && (
        <NPC
          name="corgi"
          x={39}
          y={91}
          scale={0.57}
          label="Ego"
          badge="汪"
          prompt="点击和 Ego 玩"
          onClick={() => openDialog('corgi', 'open')}
        />
      )}

      {/* ── HUD（带回村按钮）── */}
      {!inLobby && <HUD xp={xp} log={log} location={space.name} showBack onBack={onBack} />}

      {/* ── 左上角村地图缩略图 ── */}
      {!inLobby && <MiniMap slug={space.slug} />}

      {/* ── 右侧工具按钮 ── */}
      {!inLobby && <ToolDock buttons={toolButtons} />}

      {/* ── SlideOver: 活动任务板 ── */}
      {!inLobby && <QuestBoard
        open={panel === 'quests'}
        onClose={() => setPanel(null)}
        items={activities}
      />}

      {/* ── SlideOver: 作品收藏墙 ── */}
      {!inLobby && <WorksWall
        open={panel === 'works'}
        onClose={() => setPanel(null)}
        items={works}
      />}

      {/* ── RPG 对话框 ── */}
      {!inLobby && dialog && currentNode && (
        <RPGDialog
          speaker={currentNode.speaker || dialog.speaker}
          name={currentNode.name || npcName}
          nameSub={currentNode.nameSub || npcSub}
          text={currentNode.text || ''}
          media={currentNode.media}
          toolResult={currentNode.toolResult}
          choices={currentNode.choices || []}
          onChoose={handleChoose}
          onFree={handleFree}
          onClose={closeDialog}
          onNavigate={(path) => { closeDialog(); navigate(path); }}
          busy={busy}
          accent={npcAccent}
        />
      )}

      {/* ── 蒸馏体验 Lab（最顶层 overlay）── */}
      {showDistillationLab && (
        <DistillationLab
          onComplete={() => {
            setShowDistillationLab(false);
            // 蒸馏完成后回到 experience_done 节点
            setDialog(prev => prev
              ? { ...prev, nodeId: 'experience_done' }
              : { speaker: 'huangzhe', nodeId: 'experience_done' }
            );
          }}
          onClose={() => setShowDistillationLab(false)}
        />
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// 云空间 Tab 布局（保留原有逻辑）
// ──────────────────────────────────────────────

const TABS = ['对话', '活动', '作品'];

function CloudSpaceView({ space, slug }) {
  const navigate = useNavigate();
  const { add } = useYuanXP();
  const [tab, setTab] = useState('对话');
  const [coverError, setCoverError] = useState(false);
  const personaSlug = getPersonaSlug(space);
  const coverUrl = `/images/${slug}-cover.jpg`;

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto bg-white">
      {/* 封面区域 */}
      <div className="flex-none relative">
        <div className="w-full h-44 bg-stone-200 overflow-hidden">
          {!coverError ? (
            <img
              src={coverUrl}
              alt={space.name}
              className="w-full h-full object-cover"
              onError={() => setCoverError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-stone-200 to-stone-300">
              <div className="text-center">
                <p className="text-4xl mb-1">☁</p>
                <p className="text-xs text-stone-400">{space.name}</p>
              </div>
            </div>
          )}
        </div>
        <button
          onClick={() => navigate('/')}
          className="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white text-lg hover:bg-black/60 transition-colors"
        >
          ←
        </button>
        <div className="absolute top-3 right-3 bg-sky-500/80 backdrop-blur-sm text-white text-xs rounded-full px-2.5 py-1">
          ☁ 云空间
        </div>
      </div>

      {/* 空间信息 */}
      <div className="flex-none px-4 py-3 border-b border-stone-100">
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <h1 className="text-lg font-bold text-stone-800">{space.name}</h1>
            {space.short_pitch && (
              <p className="text-xs text-stone-500 mt-0.5">{space.short_pitch}</p>
            )}
          </div>
        </div>
        {space.style_keywords?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {space.style_keywords.map(k => (
              <span key={k} className="text-xs bg-stone-100 text-stone-600 rounded-full px-2 py-0.5">{k}</span>
            ))}
          </div>
        )}
        <div className="mt-2 bg-sky-50 border border-sky-200 text-sky-700 text-xs rounded-xl px-3 py-2">
          ☁ 这是云空间——主理人在线上，不在龙潭村。
        </div>
      </div>

      {/* Tab 切换 */}
      <div className="flex-none flex border-b border-stone-100">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => {
              setTab(t);
              if (t === '活动') add('VIEW_ACTIVITIES', `查看 ${space.name} 活动`);
            }}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              tab === t
                ? 'text-stone-800 border-b-2 border-stone-800'
                : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab 内容 */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {tab === '对话' && personaSlug && (
          <PersonaChat
            slug={personaSlug}
            onTurn={() => add('FREEFORM_CHAT', `与 ${space.name} 主理人对话`)}
          />
        )}
        {tab === '活动' && (
          <div className="h-full overflow-y-auto px-4 py-2">
            <ActivityList spaceSlug={slug} />
          </div>
        )}
        {tab === '作品' && (
          <div className="h-full overflow-y-auto px-4 py-2">
            <WorkGallery spaceSlug={slug} />
          </div>
        )}
      </div>

      <YuanXPWidget />
    </div>
  );
}

// ──────────────────────────────────────────────
// 主页面（路由入口）
// ──────────────────────────────────────────────

export default function SpaceDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { xp, log, add } = useYuanXP();

  const [space, setSpace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState({ upcoming: [], past: [] });
  const [works, setWorks] = useState([]);
  const [transitioning, setTransitioning] = useState(false);
  const xpGivenRef = useRef(false);

  useEffect(() => {
    xpGivenRef.current = false;
    setLoading(true);
    setActivities([]);
    setWorks([]);

    fetchSpaces()
      .then(spaces => {
        const found = spaces.find(s => s.slug === slug);
        if (!found) throw new Error('空间不存在');
        setSpace(found);

        if (!xpGivenRef.current) {
          add('VISIT_SPACE', `探索 ${found.name}`);
          xpGivenRef.current = true;
        }

        // 若物理空间，同时拉取活动和作品
        if (found.space_kind === 'physical') {
          Promise.all([
            fetchSpaceActivities(slug).catch(() => ({})),
            fetchSpaceWorks(slug).catch(() => []),
          ]).then(([acts, wrks]) => {
            // API 返回 { upcoming: [], past: [] }，合并后 upcoming 在前
            const upcoming = Array.isArray(acts?.upcoming) ? acts.upcoming : [];
            const past = Array.isArray(acts?.past) ? acts.past : [];
            setActivities({ upcoming, past });
            setWorks(Array.isArray(wrks) ? wrks : []);
          });
        }
      })
      .catch(err => {
        console.error(err);
        navigate('/');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading || !space) {
    return (
      <div
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          height: '100vh',
          fontFamily: 'var(--font-serif)',
          color: 'var(--ink-500)',
          background: 'var(--paper-100)',
        }}
      >
        <p style={{ fontSize: 14 }}>载入中…</p>
      </div>
    );
  }

  // 物理空间 → 场景视图
  if (space.space_kind === 'physical') {
    return (
      <>
        <SceneTransition show={transitioning} />
        <PhysicalSceneView
          space={space}
          activities={activities}
          works={works}
          xp={xp}
          onBack={() => {
            setTransitioning(true);
            setTimeout(() => navigate('/'), 550);
          }}
        />
      </>
    );
  }

  // 云空间 → Tab 布局
  return <CloudSpaceView space={space} slug={slug} />;
}
