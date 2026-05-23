/**
 * routes/orders.js
 * POST /api/orders  — mock 订单（MVP1 无真实支付）
 */

import { Router } from 'express';
import { randomUUID } from 'crypto';

const router = Router();

// In-memory store (resets on server restart; MVP 阶段足够)
const orders = [];

router.post('/', (req, res) => {
  const { spaceSlug, productId, quantity = 1, guestName } = req.body;
  if (!spaceSlug || !productId) {
    return res.status(400).json({ error: 'spaceSlug and productId are required' });
  }
  const order = {
    orderId: `YXX-${randomUUID().slice(0, 8).toUpperCase()}`,
    spaceSlug,
    productId,
    quantity,
    guestName: guestName || '访客',
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  orders.push(order);
  console.log('[order] created:', order.orderId);
  res.json(order);
});

router.get('/:orderId', (req, res) => {
  const order = orders.find(o => o.orderId === req.params.orderId);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

export default router;
