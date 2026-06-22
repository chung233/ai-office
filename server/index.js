import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';
import { initWebSocket } from './websocket.js';
import hermesRouter from './routes/hermes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 4820;

const app = express();
const server = createServer(app);

// ── Middleware ──

app.use(cors({
  origin: ['http://localhost:5199', 'http://localhost:5173', 'http://localhost:4820'],
  credentials: true,
}));

app.use(express.json());

// ── API routes ──

app.use('/api/hermes', hermesRouter);

// ── Serve static files (Vite build output) ──

const distPath = join(__dirname, '..', 'dist');
if (existsSync(distPath)) {
  app.use(express.static(distPath));

  // SPA fallback: serve index.html for any non-API route
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/') || req.path.startsWith('/ws')) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.sendFile(join(distPath, 'index.html'));
  });
}

// ── WebSocket ──

initWebSocket(server);

// ── Start ──

server.listen(PORT, () => {
  console.log(`🏢 ai-office server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket ready at ws://localhost:${PORT}/ws`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down...');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down...');
  server.close(() => process.exit(0));
});
