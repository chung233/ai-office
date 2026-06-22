import type { Agent } from '../types/office';
import { getPhaseConfig } from '../lib/phase-config';
import AgentCard from './AgentCard';

interface Props {
  phaseId: string;
  agents: Agent[];
  /** 註冊 AgentCard 的 DOM ref，供 MessageFlow SVG 定位使用 */
  registerCardRef?: (id: string) => (el: HTMLDivElement | null) => void;
}

export default function PhaseTabPanel({ phaseId, agents, registerCardRef }: Props) {
  const config = getPhaseConfig(phaseId);

  if (!config) {
    return (
      <div className="text-center py-12 text-text-muted">
        找不到此階段的設定
      </div>
    );
  }

  const participatingAgents = agents.filter((a) => config.agentIds.includes(a.id));
  const isSingleAgent = config.agentIds.length === 1;
  const isBidirectional = config.flowLabel.includes('↔');

  return (
    <div className="animate-[fade-up_200ms_ease-out]">
      {/* Phase 標題 + 描述 */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-text-primary mb-1">
          {config.label}
        </h2>
        <p className="text-text-muted text-sm">{config.description}</p>
      </div>

      {/* 參與 Agent 列表 */}
      <div className="mb-6 p-4 rounded-xl bg-surface border border-subtle">
        <h3 className="text-sm font-medium text-text-primary mb-3">參與 Agent</h3>
        {participatingAgents.length === 0 ? (
          <p className="text-text-dim text-sm">尚無 Agent 資料</p>
        ) : (
          <ul className="space-y-2">
            {participatingAgents.map((agent) => (
              <li key={agent.id} className="flex items-center gap-3 text-sm">
                <span className="text-lg">{agent.emoji}</span>
                <span className="text-text-primary font-medium">{agent.name}</span>
                <span className="text-text-muted">— {agent.role}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 迷你 Flow 圖 */}
      <div className="mb-6 p-4 rounded-xl bg-surface border border-subtle">
        <h3 className="text-sm font-medium text-text-primary mb-3">互動流程</h3>
        <div className="flex items-center justify-center gap-4 py-2">
          {isSingleAgent ? (
            /* 單一 agent：顯示圖示 + 說明 */
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-2xl">
                {participatingAgents[0]?.emoji ?? '?'}
              </div>
              <span className="text-xs text-text-muted">{config.flowLabel}</span>
            </div>
          ) : (
            <>
              {/* 來源 agent */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-2xl">
                  {participatingAgents[0]?.emoji ?? '?'}
                </div>
                <span className="text-xs text-text-dim">
                  {participatingAgents[0]?.name ?? ''}
                </span>
              </div>

              {/* 箭頭 */}
              <div className="flex flex-col items-center">
                <span className="text-accent text-xl font-bold">
                  {isBidirectional ? '↔' : '→'}
                </span>
                <span className="text-[10px] text-text-dim mt-1">{config.flowLabel}</span>
              </div>

              {/* 目標 agent */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-xl bg-accent2/10 border border-accent2/20 flex items-center justify-center text-2xl">
                  {participatingAgents[1]?.emoji ?? '?'}
                </div>
                <span className="text-xs text-text-dim">
                  {participatingAgents[1]?.name ?? ''}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Agent 卡片網格 */}
      <div>
        <h3 className="text-sm font-medium text-text-primary mb-3">Agent 狀態</h3>
        {participatingAgents.length === 0 ? (
          <p className="text-text-dim text-sm text-center py-8">尚無 Agent 資料</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {participatingAgents.map((agent, i) => (
              <div
                key={agent.id}
                ref={registerCardRef?.(agent.id)}
                data-agent-id={agent.id}
                style={{ animationDelay: `${i * 80}ms` }}
                className="animate-[fade-up_400ms_ease-out_both]"
              >
                <AgentCard agent={agent} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
