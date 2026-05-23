/**
 * lib/yuanxp.js — 元XP 积分 Zustand store
 *
 * 积分规则：
 *  - 进入空间: +20 XP
 *  - 龙圣子对话节点: +3 XP
 *  - 主理人对话节点: +5 XP
 *  - 自由输入对话: +2 XP
 *  - 查看活动: +5 XP
 *  - 获得行程方案: +20 XP
 *
 * MVP3: 纯内存，刷新清零；MVP4+ 可迁移至 localStorage
 */

import { create } from 'zustand';

const RULES = {
  VISIT_SPACE: 20,        // 进入空间（was 10）
  DIALOG_LONGXUN: 3,      // 龙圣子对话节点（new）
  DIALOG_HOST: 5,         // 主理人对话节点（new）
  FREEFORM_CHAT: 2,       // 自由输入（replaces CHAT_TURN）
  VIEW_ACTIVITIES: 5,     // 查看活动
  RECEIVE_ITINERARY: 20,  // 收到行程方案
};

export const useYuanXP = create((set, get) => ({
  xp: 0,
  log: [], // [{type, label, delta, at}]

  add(type, label) {
    const delta = RULES[type] ?? 1;
    set(state => ({
      xp: state.xp + delta,
      log: [{ type, label, delta, at: Date.now() }, ...state.log].slice(0, 50),
    }));
  },

  get total() { return get().xp; },
}));

export { RULES };
