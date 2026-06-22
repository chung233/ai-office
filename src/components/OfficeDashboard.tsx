import { useRef, useEffect, useState } from 'react';
import type { Agent, PhaseData, OfficeEvent, ConnStatus } from '../types/office';
import Header from './Header';
import PhaseBar from './PhaseBar';
import AgentCard from './AgentCard';
import MessageFlow from './MessageFlow';
import EventLog from './EventLog';

interface Props {
  agents: Agent[];
  phases: PhaseData[];
  events: OfficeEvent[];
  connStatus: ConnStatus;
  elapsed: number;
  fetchError: string | null;
}

export default function OfficeDashboard({
  agents,
  phases,
  events,
  connStatus,
  elapsed,
  fetchError,
}: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [, setTick] = useState(0); // force re-render for MessageFlow positions

  // Re-render MessageFlow when stage resizes
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setTick((n) => n + 1));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const registerCardRef = (id: string) => (el: HTMLDivElement | null) => {
    if (el) {
      cardRefs.current.set(id, el);
    } else {
      cardRefs.current.delete(id);
    }
  };

  const completedPhaseCount = phases.filter((p) => p.status === 'done').length;
  const activePhase = phases.find((p) => p.status === 'active');

  return (
    <div className="min-h-screen bg-base text-text-primary antialiased flex flex-col">
      {/* 背景光暈 */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-accent/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-accent2/5 blur-[120px]" />
      </div>

      <Header
        connStatus={connStatus}
        completedPhases={completedPhaseCount}
        totalPhases={phases.length}
        activePhaseLabel={activePhase?.label}
        elapsed={elapsed}
      />

      <PhaseBar phases={phases} />

      {/* 載入/錯誤狀態 */}
      {fetchError && (
        <div className="mx-8 mb-4 px-4 py-3 bg-st-err/15 border border-st-err/30 rounded-xl text-st-err text-sm">
          無法載入初始狀態：{fetchError}
          <span className="block text-text-muted text-xs mt-1">
            使用預設值顯示，即時更新仍可透過 WebSocket 接收
          </span>
        </div>
      )}

      {/* 主舞台 */}
      <div ref={stageRef} className="relative flex-1 px-8 py-6">
        <MessageFlow
          agents={agents}
          events={events}
          stageRef={stageRef}
          cardRefs={cardRefs}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-[1440px] mx-auto">
          {agents.map((agent, i) => (
            <div
              key={agent.id}
              ref={registerCardRef(agent.id)}
              data-agent-id={agent.id}
              style={{ animationDelay: `${i * 80}ms` }}
              className="animate-[fade-up_400ms_ease-out_both]"
            >
              <AgentCard agent={agent} />
            </div>
          ))}
        </div>
      </div>

      <EventLog events={events} connStatus={connStatus} agents={agents} />
    </div>
  );
}
