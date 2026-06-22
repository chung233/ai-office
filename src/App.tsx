import { useState, useEffect, useCallback, useRef } from 'react';
import type { Agent, PhaseData, OfficeEvent, ConnStatus, WsMessage } from './types/office';
import { fetchInitialState, createWebSocket } from './lib/office-api';
import OfficeDashboard from './components/OfficeDashboard';

/** 後端未回傳任何 agent 時使用的預設值 */
const DEFAULT_AGENTS: Agent[] = [
  { id: 'hermes', name: 'Hermes', role: 'Orchestrator', emoji: '🦉', color: '#38BDF8', status: 'idle', task: '' },
  { id: 'pm', name: 'PM', role: 'Project Manager', emoji: '🦊', color: '#FB923C', status: 'idle', task: '' },
  { id: 'sreng', name: 'SrEng', role: 'Sr Engineer', emoji: '🐱', color: '#A78BFA', status: 'idle', task: '' },
  { id: 'reviewer', name: 'Reviewer', role: 'Final Reviewer', emoji: '🐰', color: '#34D399', status: 'idle', task: '' },
];

const DEFAULT_PHASES: PhaseData[] = [
  { id: 'understand', label: '理解', status: 'pending' },
  { id: 'decompose', label: '分解', status: 'pending' },
  { id: 'check', label: '檢查', status: 'pending' },
  { id: 'iterate', label: '迭代', status: 'pending' },
  { id: 'review', label: '審查', status: 'pending' },
  { id: 'deliver', label: '交付', status: 'pending' },
  { id: 'reflect', label: '反思', status: 'pending' },
];

export default function App() {
  const [agents, setAgents] = useState<Agent[]>(DEFAULT_AGENTS);
  const [phases, setPhases] = useState<PhaseData[]>(DEFAULT_PHASES);
  const [events, setEvents] = useState<OfficeEvent[]>([]);
  const [connStatus, setConnStatus] = useState<ConnStatus>('connecting');
  const [elapsed, setElapsed] = useState(0);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const agentIdsRef = useRef(DEFAULT_AGENTS.map((a) => a.id));
  const phaseIdsRef = useRef(DEFAULT_PHASES.map((p) => p.id));

  // 初始 REST 載入
  useEffect(() => {
    let cancelled = false;
    fetchInitialState()
      .then((state) => {
        if (cancelled) return;
        if (state.agents.length > 0) {
          setAgents(state.agents);
          agentIdsRef.current = state.agents.map((a) => a.id);
        }
        if (state.phases.length > 0) {
          setPhases(state.phases);
          phaseIdsRef.current = state.phases.map((p) => p.id);
        }
        setFetchError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : '未知錯誤';
        setFetchError(msg);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // WebSocket 訊息處理
  const handleWsMessage = useCallback((msg: WsMessage) => {
    if (msg.type === 'agent_update') {
      setAgents((prev) =>
        prev.map((a) => (a.id === msg.agent.id ? msg.agent : a)),
      );
    } else if (msg.type === 'phase_update') {
      setPhases((prev) =>
        prev.map((p) => (p.id === msg.phase.id ? msg.phase : p)),
      );
    } else if (msg.type === 'event') {
      setEvents((prev) => [msg.event, ...prev].slice(0, 200));
    }
  }, []);

  // WebSocket 連線
  useEffect(() => {
    const destroy = createWebSocket(handleWsMessage, setConnStatus);
    return destroy;
  }, [handleWsMessage]);

  // 計時器
  useEffect(() => {
    const timer = setInterval(() => setElapsed((n) => n + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <OfficeDashboard
      agents={agents}
      phases={phases}
      events={events}
      connStatus={connStatus}
      elapsed={elapsed}
      fetchError={fetchError}
    />
  );
}
