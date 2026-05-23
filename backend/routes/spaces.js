/**
 * routes/spaces.js
 * GET /api/spaces           → 所有空间列表
 * GET /api/spaces/:slug     → 单个空间详情
 * GET /api/spaces/:slug/activities  → 空间活动（含 upcoming/past 分类）
 * GET /api/spaces/:slug/works       → 空间主理人作品
 */

import { Router } from 'express';
import { loadSpaces, loadSpace } from '../services/spacesLoader.js';
import { loadActivities } from '../services/activitiesLoader.js';
import { loadWorks } from '../services/worksLoader.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const spaces = await loadSpaces();
    res.json(spaces);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const space = await loadSpace(req.params.slug);
    if (!space) return res.status(404).json({ error: 'Space not found' });
    res.json(space);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:slug/activities', async (req, res) => {
  try {
    const activities = await loadActivities(req.params.slug);
    res.json(activities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:slug/works', async (req, res) => {
  try {
    const works = await loadWorks(req.params.slug);
    res.json(works);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
