/**
 * server.js — 元家乡 2050 backend 入口
 * 单文件 Express app，加载 dotenv 后挂载各路由
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import chatRouter from './routes/chat.js';
import spacesRouter from './routes/spaces.js';
import ordersRouter from './routes/orders.js';

const app = express();
const PORT = process.env.PORT || 3001;

// CORS：开发阶段允许 localhost Vite dev server
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:3000',
  ],
  methods: ['GET', 'POST'],
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => res.json({
  status: 'ok',
  provider: process.env.LLM_PROVIDER || 'claude',
  model: process.env.LLM_MODEL || 'claude-sonnet-4-5',
  vaultPath: process.env.VAULT_PATH || '../vault',
  ts: new Date().toISOString(),
}));

// Routes
app.use('/api/chat', chatRouter);
app.use('/api/spaces', spacesRouter);
app.use('/api/orders', ordersRouter);

// 404 catch-all
app.use((req, res) => res.status(404).json({ error: `Not found: ${req.method} ${req.path}` }));

app.listen(PORT, () => {
  console.log(`\n🏡 元家乡 2050 backend running at http://localhost:${PORT}`);
  console.log(`   LLM provider : ${process.env.LLM_PROVIDER || 'claude'}`);
  console.log(`   Model        : ${process.env.LLM_MODEL || 'claude-sonnet-4-5'}`);
  console.log(`   Vault        : ${process.env.VAULT_PATH || '../vault'}\n`);
});
