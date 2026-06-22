import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db.js';
import { broadcast } from '../websocket.js';

const router = Router();

/**
 * POST /api/hermes/event
 * Receives events from hermes-emit CLI, writes to DB, broadcasts via WebSocket.
 */
router.post('/event', (req, res) => {
  try {
    const {
      session_id,
      agent_id,
      phase,
      phase_name,
      agent_role,
      status,
      message,
      data,
      event_type,
    } = req.body;

    const sid = session_id || 'unknown';
    const aid = agent_id || uuidv4();
    const evType = event_type || status || 'event';

    // Upsert session if not exists
    const existing = db.prepare('SELECT id FROM sessions WHERE id = ?').get(sid);
    if (!existing) {
      db.prepare(
        'INSERT INTO sessions (id, name, status, started_at) VALUES (?, ?, ?, datetime(\'now\'))'
      ).run(sid, sid, 'active');
    }

    // Upsert agent if agent_role is provided
    if (agent_role) {
      const existingAgent = db.prepare('SELECT id FROM agents WHERE id = ?').get(aid);
      if (!existingAgent) {
        db.prepare(
          'INSERT INTO agents (id, session_id, name, type, status, task, metadata) VALUES (?, ?, ?, ?, ?, ?, ?)'
        ).run(
          aid,
          sid,
          agent_role,
          'main',
          status || 'working',
          message || '',
          JSON.stringify(data || {})
        );
      } else {
        // Update agent status
        db.prepare(
          'UPDATE agents SET status = ?, task = ?, metadata = ? WHERE id = ?'
        ).run(status || 'working', message || '', JSON.stringify(data || {}), aid);
      }
    }

    // Insert event
    db.prepare(
      'INSERT INTO events (session_id, agent_id, event_type, summary, data) VALUES (?, ?, ?, ?, ?)'
    ).run(sid, aid, evType, message || '', JSON.stringify(data || {}));

    // Build phase data for broadcast
    const phaseData = phase != null
      ? {
          id: `phase_${phase}`,
          label: phase_name || `Phase ${phase}`,
          status: status === 'completed' ? 'done' : status === 'started' ? 'active' : 'pending',
        }
      : null;

    // Build agent data for broadcast
    const agentData = agent_role
      ? {
          id: aid,
          name: agent_role,
          role: agent_role,
          emoji: '🤖',
          color: '#6366f1',
          status: mapStatus(status),
          task: message || '',
        }
      : null;

    // Broadcast to WebSocket clients
    if (phaseData) {
      broadcast('phase_update', { phase: phaseData });
    }
    if (agentData) {
      broadcast('agent_update', { agent: agentData });
    }

    // Also broadcast a raw event
    broadcast('event', {
      event: {
        ts: new Date().toISOString(),
        fromAgent: agent_role || 'system',
        type: evType,
        text: message || '',
      },
    });

    res.json({ ok: true });
  } catch (err) {
    console.error('POST /api/hermes/event error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * GET /api/hermes/state
 * Returns the latest active session's agents + phase summary.
 */
router.get('/state', (_req, res) => {
  try {
    // Find the latest active session
    const session = db
      .prepare('SELECT * FROM sessions WHERE status = ? ORDER BY started_at DESC LIMIT 1')
      .get('active');

    if (!session) {
      return res.json({
        active: false,
        agents: [],
        phase: null,
      });
    }

    // Get agents for this session
    const agents = db
      .prepare('SELECT * FROM agents WHERE session_id = ?')
      .all(session.id)
      .map((a) => ({
        id: a.id,
        name: a.name,
        role: a.name,
        emoji: '🤖',
        color: '#6366f1',
        status: mapDbStatus(a.status),
        task: a.task || '',
      }));

    // Determine current phase from events
    const lastPhaseEvent = db
      .prepare(
        'SELECT * FROM events WHERE session_id = ? AND event_type IN (?, ?) ORDER BY id DESC LIMIT 1'
      )
      .get(session.id, 'started', 'completed');

    const phase = lastPhaseEvent
      ? {
          id: `phase_${lastPhaseEvent.summary || '1'}`,
          label: lastPhaseEvent.summary || 'Phase 1',
          status: lastPhaseEvent.event_type === 'started' ? 'active' : 'done',
        }
      : null;

    return res.json({
      active: true,
      agents,
      phase,
    });
  } catch (err) {
    console.error('GET /api/hermes/state error:', err);
    res.status(500).json({ active: false, agents: [], phase: null, error: err.message });
  }
});

// ── helpers ──

function mapStatus(s) {
  switch (s) {
    case 'working':
    case 'started':
      return 'working';
    case 'completed':
    case 'done':
      return 'completed';
    case 'waiting':
      return 'waiting';
    case 'error':
      return 'error';
    default:
      return 'idle';
  }
}

function mapDbStatus(s) {
  switch (s) {
    case 'working':
    case 'started':
      return 'working';
    case 'completed':
    case 'done':
      return 'completed';
    case 'waiting':
      return 'waiting';
    case 'error':
      return 'error';
    default:
      return 'idle';
  }
}

export default router;
