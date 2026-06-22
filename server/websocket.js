import { WebSocketServer } from 'ws';

/** @type {Set<import('ws').WebSocket>} */
const clients = new Set();

/**
 * Initialize WebSocket server on the given HTTP server.
 * Path: /ws
 */
export function initWebSocket(httpServer) {
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws) => {
    clients.add(ws);

    ws.on('close', () => {
      clients.delete(ws);
    });

    ws.on('error', () => {
      clients.delete(ws);
    });

    // Send a welcome message
    ws.send(JSON.stringify({ type: 'connected' }));
  });

  // Heartbeat ping every 30 seconds
  const interval = setInterval(() => {
    for (const ws of clients) {
      if (ws.readyState === ws.OPEN) {
        ws.ping();
      }
    }
  }, 30_000);

  wss.on('close', () => {
    clearInterval(interval);
  });

  return wss;
}

/**
 * Broadcast a message to all connected clients.
 * @param {string} type
 * @param {unknown} data
 */
export function broadcast(type, data) {
  const msg = JSON.stringify({ type, ...data });
  for (const ws of clients) {
    if (ws.readyState === ws.OPEN) {
      ws.send(msg);
    }
  }
}
