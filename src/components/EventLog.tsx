import { useState, useRef, useEffect } from 'react';
import type { Agent, OfficeEvent, ConnStatus } from '../types/office';

interface Props {
  events: OfficeEvent[];
  connStatus: ConnStatus;
  agents: Agent[];
}

/** 事件類型對應的標籤 */
const TYPE_LABEL: Record<string, string> = {
  assign: '派工',
  report: '回報',
  error: '錯誤',
};

export default function EventLog({ events, connStatus, agents }: Props) {
  const [expanded, setExpanded] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  // 自動捲到最新
  useEffect(() => {
    if (expanded && listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [events, expanded]);

  // 取得 agent 顏色
  const agentColor = (id: string) => agents.find((a) => a.id === id)?.color ?? '#54607A';

  // 斷線警示條
  const isDisconnected = connStatus === 'closed';

  const latestEvent = events[0];

  return (
    <footer
      className={`border-t transition-colors duration-300 ${
        isDisconnected ? 'bg-st-err/10 border-st-err/30' : 'border-subtle'
      }`}
    >
      {/* 斷線警示 */}
      {isDisconnected && (
        <div className="px-8 py-2 bg-st-err/15 text-st-err text-xs text-center font-medium">
          WebSocket 已斷線，重新連線中…
        </div>
      )}

      {/* 收合列 */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-8 py-3 hover:bg-surface/50 transition-colors cursor-pointer"
        aria-expanded={expanded}
        aria-label={expanded ? '收合事件日誌' : '展開事件日誌'}
      >
        <div className="flex items-center gap-3 text-xs">
          <span className="text-text-muted font-medium">事件日誌</span>
          {latestEvent ? (
            <>
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ backgroundColor: agentColor(latestEvent.fromAgent) }}
              />
              <span className="text-text-muted truncate max-w-[300px]">{latestEvent.text}</span>
            </>
          ) : (
            <span className="text-text-dim">尚無事件</span>
          )}
        </div>
        <span className="text-text-dim text-xs transition-transform duration-200" style={{ transform: expanded ? 'rotate(180deg)' : undefined }}>
          ▲
        </span>
      </button>

      {/* 展開清單 */}
      {expanded && (
        <div
          ref={listRef}
          className="max-h-48 overflow-y-auto border-t border-subtle"
        >
          {events.length === 0 ? (
            <div className="px-8 py-6 text-center text-text-dim text-xs">
              尚無事件記錄
            </div>
          ) : (
            events.map((event, i) => (
              <div
                key={`${event.ts}-${i}`}
                className="flex items-center gap-3 px-8 py-2 text-xs border-b border-subtle/50 hover:bg-surface/30 transition-colors"
                style={{ animation: 'slide-in-down 120ms ease-out both' }}
              >
                {/* 時間 */}
                <span className="font-mono text-text-dim tabular-nums min-w-[80px]">
                  {event.ts}
                </span>

                {/* 來源 Agent 色點 */}
                <span
                  className="inline-block w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: agentColor(event.fromAgent) }}
                  title={event.fromAgent}
                />

                {/* 箭頭 */}
                {event.toAgent && (
                  <span className="text-text-dim shrink-0">→</span>
                )}

                {/* 目標 Agent 色點 */}
                {event.toAgent && (
                  <span
                    className="inline-block w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: agentColor(event.toAgent) }}
                    title={event.toAgent}
                  />
                )}

                {/* 類型標籤 */}
                <span
                  className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium ${
                    event.type === 'assign'
                      ? 'bg-st-work/15 text-st-work'
                      : event.type === 'report'
                        ? 'bg-st-done/15 text-st-done'
                        : 'bg-st-err/15 text-st-err'
                  }`}
                >
                  {TYPE_LABEL[event.type] ?? event.type}
                </span>

                {/* 事件文字 */}
                <span className="text-text-muted truncate">{event.text}</span>
              </div>
            ))
          )}
        </div>
      )}
    </footer>
  );
}
