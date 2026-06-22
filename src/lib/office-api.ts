import type { HermesState, PhaseData, Agent, WsMessage, AgentStatus, PhaseStatus } from '../types/office';

const API_BASE = 'http://localhost:4820';
const WS_URL = 'ws://localhost:4820/ws';

/* ── 後端 → 前端映射常數 ── */

/** 後端 agent_role (name) → 前端 agent 固定屬性 */
const ROLE_MAP: Record<string, { id: string; name: string; emoji: string; color: string; role: string }> = {
  orchestrator: { id: 'hermes', name: 'Hermes', emoji: '🦉', color: '#38BDF8', role: 'Orchestrator' },
  pm:          { id: 'pm', name: 'PM', emoji: '🦊', color: '#FB923C', role: 'Project Manager' },
  sreng:       { id: 'sreng', name: 'SrEng', emoji: '🐱', color: '#A78BFA', role: 'Sr Engineer' },
  reviewer:    { id: 'reviewer', name: 'Reviewer', emoji: '🐰', color: '#34D399', role: 'Final Reviewer' },
};

/** 4 個前端 default agent（永遠全部顯示） */
const DEFAULT_AGENTS: Agent[] = [
  { ...ROLE_MAP.orchestrator, status: 'idle', task: '' },
  { ...ROLE_MAP.pm,          status: 'idle', task: '' },
  { ...ROLE_MAP.sreng,       status: 'idle', task: '' },
  { ...ROLE_MAP.reviewer,    status: 'idle', task: '' },
];

/** 後端 phase_name (label) → 前端 phase id */
const PHASE_MAP: Record<string, string> = {
  UNDERSTAND:  'understand',
  DECOMPOSE:   'decompose',
  CHECK_PM:    'check',
  ITERATE:     'iterate',
  FINAL_REVIEW:'review',
  DELIVER:     'deliver',
  REFLECT:     'reflect',
};

/** 7 個前端 default phase（永遠全部顯示） */
const DEFAULT_PHASES: PhaseData[] = [
  { id: 'understand', label: '理解', status: 'pending' },
  { id: 'decompose',  label: '分解', status: 'pending' },
  { id: 'check',      label: '檢查', status: 'pending' },
  { id: 'iterate',    label: '迭代', status: 'pending' },
  { id: 'review',     label: '審查', status: 'pending' },
  { id: 'deliver',    label: '交付', status: 'pending' },
  { id: 'reflect',    label: '反思', status: 'pending' },
];

/* ── 輔助型別（後端 raw 回應欄位）── */

interface RawAgent {
  id?: string;
  name?: string;       // agent_role: orchestrator|pm|sreng|reviewer
  status?: string;
  task?: string;
  progress?: number;
}

interface RawPhase {
  id?: string;
  label?: string;      // phase_name: UNDERSTAND|DECOMPOSE|CHECK_PM|…
  status?: string;
}

/* ── API ── */

/** 從 REST 端點取得初始狀態，並映射為前端格式 */
export async function fetchInitialState(): Promise<HermesState> {
  const res = await fetch(`${API_BASE}/api/hermes/state`);
  if (!res.ok) {
    throw new Error(`無法載入初始狀態（HTTP ${res.status}）`);
  }
  const json: unknown = await res.json();
  const raw = json as Record<string, unknown>;
  if (!Array.isArray(raw.agents)) {
    throw new Error('後端回應格式不符：缺少 agents 欄位');
  }

  /* ── Agents：合併後端資料到 4 個 default agent ── */
  const rawAgents = raw.agents as RawAgent[];
  const mergedAgents = DEFAULT_AGENTS.map((da) => {
    // 用 da.id 反查後端 agent_role (name)
    const backendRole = Object.keys(ROLE_MAP).find(
      (role) => ROLE_MAP[role].id === da.id,
    );
    const match = backendRole
      ? rawAgents.find((ra) => ra.name === backendRole)
      : undefined;
    if (!match) return da; // 後端沒這 agent 的資料，保持 idle
    return {
      ...da,
      status: (match.status as AgentStatus) ?? da.status,
      task: match.task ?? da.task,
      progress: match.progress,
    };
  });

  /* ── Phases：標記後端正處理的 phase ── */
  const rawPhase: RawPhase | null =
    raw.phase && typeof raw.phase === 'object' ? (raw.phase as RawPhase) : null;

  const mergedPhases: PhaseData[] = DEFAULT_PHASES.map((dp) => {
    if (!rawPhase?.label) return dp;
    const mappedId = PHASE_MAP[rawPhase.label];
    if (mappedId === dp.id) {
      return {
        ...dp,
        status: (rawPhase.status as PhaseStatus) ?? 'active',
      };
    }
    return dp;
  });

  return {
    active: !!raw.active,
    agents: mergedAgents,
    phase: rawPhase
      ? {
          id: rawPhase.label ? PHASE_MAP[rawPhase.label] ?? rawPhase.id ?? '' : rawPhase.id ?? '',
          label: rawPhase.label ?? '',
          status: (rawPhase.status as PhaseStatus) ?? 'active',
        }
      : null,
    phases: mergedPhases,
  };
}

/**
 * 建立原生 WebSocket 連線，包含自動重連。
 * 回傳一個 cleanup 函式 — 呼叫端必須在元件卸載時呼叫。
 */
export function createWebSocket(
  onMessage: (msg: WsMessage) => void,
  onStatusChange: (status: 'connecting' | 'open' | 'closed') => void,
): () => void {
  let ws: WebSocket | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let destroyed = false;

  function connect() {
    if (destroyed) return;

    onStatusChange('connecting');
    ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      if (destroyed) {
        ws?.close();
        return;
      }
      onStatusChange('open');
    };

    ws.onmessage = (ev: MessageEvent) => {
      if (destroyed) return;
      try {
        const data: unknown = JSON.parse(ev.data as string);
        onMessage(data as WsMessage);
      } catch {
        // 忽略無法解析的訊息，不破壞既有畫面
        console.warn('收到無法解析的 WebSocket 訊息');
      }
    };

    ws.onclose = () => {
      if (destroyed) return;
      onStatusChange('closed');
      scheduleReconnect();
    };

    ws.onerror = () => {
      // onclose 會接著觸發，由 onclose 處理重連
      ws?.close();
    };
  }

  function scheduleReconnect() {
    if (destroyed) return;
    reconnectTimer = setTimeout(() => {
      connect();
    }, 3000);
  }

  /** 銷毀：關閉 WebSocket、清除重連計時器 */
  function destroy() {
    destroyed = true;
    if (reconnectTimer !== null) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    if (ws) {
      ws.onopen = null;
      ws.onmessage = null;
      ws.onclose = null;
      ws.onerror = null;
      ws.close();
      ws = null;
    }
  }

  connect();
  return destroy;
}
