/** Agent 運作狀態 */
export type AgentStatus = 'idle' | 'working' | 'waiting' | 'completed' | 'error';

/** WebSocket 連線狀態 */
export type ConnStatus = 'connecting' | 'open' | 'closed';

/** Phase 進度狀態 */
export type PhaseStatus = 'done' | 'active' | 'pending';

/** 事件類型 */
export type EventType = 'assign' | 'report' | 'error';

/** Agent 資料 */
export interface Agent {
  id: string;
  name: string;
  role: string;
  emoji: string;
  color: string;
  status: AgentStatus;
  task: string;
  progress?: number;
}

/** Phase 資料 — 7 個階段 */
export interface PhaseData {
  id: string;
  label: string;
  status: PhaseStatus;
}

/** 從後端或 WebSocket 收到的事件 */
export interface OfficeEvent {
  ts: string;
  fromAgent: string;
  toAgent?: string;
  type: EventType;
  text: string;
}

/** REST GET /api/hermes/state 的回應形狀 */
export interface HermesState {
  active: boolean;
  agents: Agent[];
  phase: PhaseData | null;
  /** 正規化後的 phases 陣列（解析層補上） */
  phases: PhaseData[];
}

/* ── WebSocket message 的已知形狀（伺服器推送）── */

export interface WsAgentUpdate {
  type: 'agent_update';
  agent: Agent;
}

export interface WsPhaseUpdate {
  type: 'phase_update';
  phase: PhaseData;
}

export interface WsEvent {
  type: 'event';
  event: OfficeEvent;
}

export type WsMessage = WsAgentUpdate | WsPhaseUpdate | WsEvent;
