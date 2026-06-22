import type { HermesState, PhaseData, Agent, WsMessage } from '../types/office';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4820';
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:4820/ws';

/** 從 REST 端點取得初始狀態 */
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
  // 正規化：後端回 phase (單數/null)，補成 phases 陣列
  const phases: PhaseData[] = raw.phase && typeof raw.phase === 'object'
    ? [raw.phase as PhaseData]
    : [];
  return {
    active: !!raw.active,
    agents: raw.agents as Agent[],
    phase: (raw.phase as PhaseData) ?? null,
    phases,
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
