/**
 * routes/chat.js
 * GET  /api/chat/open/:slug  → { name, first_mes, personKind, spaceSlug }  开场白
 * POST /api/chat             → { text, toolResult, personKind }            对话
 */

import { Router } from 'express';
import { chatWithPersona } from '../services/personaAgent.js';
import { loadPersona } from '../services/personaLoader.js';

const router = Router();

// 开场白接口：前端载入时调用，返回 first_mes（不消耗 LLM）
router.get('/open/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const persona = await loadPersona(slug);
    const { card } = persona;
    res.json({
      name: card.name,
      first_mes: card.first_mes || '',
      personKind: persona.personKind,
      spaceSlug: persona.spaceSlug,
    });
  } catch (err) {
    console.error('[chat/open] error:', err.message);
    const status = err.message.includes('not found') ? 404 : 500;
    res.status(status).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { slug, message, history = [] } = req.body;
    if (!slug || !message) {
      return res.status(400).json({ error: 'slug and message are required' });
    }
    const result = await chatWithPersona({ slug, message, history });
    res.json(result);
  } catch (err) {
    console.error('[chat] error:', err.message);
    const status = err.message.includes('not found') ? 404 : 500;
    res.status(status).json({ error: err.message });
  }
});

export default router;
