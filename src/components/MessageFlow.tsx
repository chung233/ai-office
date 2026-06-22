import { type RefObject } from 'react';
import type { Agent, OfficeEvent } from '../types/office';

interface Props {
  agents: Agent[];
  events: OfficeEvent[];
  stageRef: RefObject<HTMLDivElement | null>;
  cardRefs: RefObject<Map<string, HTMLDivElement>>;
}

/** Agent 之間的固定路由（依 ID 順序） */
const ROUTES: [string, string][] = [
  ['hermes', 'pm'],
  ['pm', 'sreng'],
  ['sreng', 'reviewer'],
];

function getCenter(el: HTMLDivElement, container: HTMLDivElement): { x: number; y: number } {
  const cr = container.getBoundingClientRect();
  const er = el.getBoundingClientRect();
  return {
    x: er.left + er.width / 2 - cr.left,
    y: er.top + er.height / 2 - cr.top,
  };
}

export default function MessageFlow({ agents, events, stageRef, cardRefs }: Props) {
  // 每次 render 都重算 edges（計算量極小）；useMemo 的 deps 皆為 stable refs，
  // mount 時 DOM 尚未就緒會永遠 render 空陣列。
  const container = stageRef.current;
  const edges: { fromId: string; toId: string; path: string }[] = container
    ? ROUTES.map(([fromId, toId]) => {
        const fromEl = cardRefs.current?.get(fromId);
        const toEl = cardRefs.current?.get(toId);
        if (!fromEl || !toEl) return null;

        const from = getCenter(fromEl, container);
        const to = getCenter(toEl, container);

        // 貝茲控制點：水平偏移
        const dx = Math.abs(to.x - from.x) * 0.4;
        const cp1 = { x: from.x + dx, y: from.y };
        const cp2 = { x: to.x - dx, y: to.y };

        return {
          fromId,
          toId,
          path: `M ${from.x} ${from.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${to.x} ${to.y}`,
        };
      }).filter(Boolean) as { fromId: string; toId: string; path: string }[]
    : [];

  // 最近 1-2 個帶 toAgent 的事件 → 活躍封包
  const activePackets = events
    .filter((e) => e.toAgent)
    .slice(0, 2)
    .map((e) => {
      const edge = edges.find((ed) => ed.fromId === e.fromAgent && ed.toId === e.toAgent);
      return edge ? { ...e, path: edge.path } : null;
    })
    .filter(Boolean) as (OfficeEvent & { path: string })[];

  // 取得 agent 主色（供連線顏色）
  const agentColor = (id: string) => agents.find((a) => a.id === id)?.color ?? '#54607A';

  return (
    <svg
      className="absolute inset-0 pointer-events-none z-10 hidden lg:block"
      style={{ width: '100%', height: '100%' }}
    >
      {/* 靜態連線 */}
      {edges.map((edge) => (
        <g key={`${edge.fromId}-${edge.toId}`}>
          <path
            d={edge.path}
            fill="none"
            stroke={agentColor(edge.fromId)}
            strokeWidth={1.5}
            opacity={0.2}
          />
        </g>
      ))}

      {/* 活躍封包 */}
      {activePackets.map((pkt, i) => (
        <g key={`${pkt.ts}-${i}`}>
          {/* 光暈軌跡 */}
          <path
            d={pkt.path}
            fill="none"
            stroke="#A78BFA"
            strokeWidth={2}
            opacity={0.5}
            strokeDasharray="8 40"
            className="animate-[packet-flow_0.6s_linear_infinite]"
          />
          {/* 流動圓點 */}
          <circle r="5" fill="#A78BFA" opacity="0.9" filter="url(#packetGlow)">
            <animateMotion dur="0.8s" repeatCount="indefinite" path={pkt.path} />
          </circle>
        </g>
      ))}

      <defs>
        <filter id="packetGlow">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
        </filter>
      </defs>
    </svg>
  );
}
