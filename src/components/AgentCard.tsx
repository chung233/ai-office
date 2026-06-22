import type { Agent } from '../types/office';

interface Props {
  agent: Agent;
}

const STATUS_LABEL: Record<string, string> = {
  idle: '待命',
  working: '工作中',
  waiting: '等待中',
  completed: '已完成',
  error: '錯誤',
};

const STATUS_BG: Record<string, string> = {
  idle: 'bg-st-idle/15 text-st-idle',
  working: 'bg-st-work/15 text-st-work',
  waiting: 'bg-st-wait/15 text-st-wait',
  completed: 'bg-st-done/15 text-st-done',
  error: 'bg-st-err/15 text-st-err',
};

const STATUS_DOT: Record<string, string> = {
  idle: 'bg-st-idle',
  working: 'bg-st-work animate-pulse',
  waiting: 'bg-st-wait animate-pulse',
  completed: 'bg-st-done',
  error: 'bg-st-err animate-[error-blink_0.4s_ease-in-out_infinite]',
};

export default function AgentCard({ agent }: Props) {
  const { status, color } = agent;
  const isWorking = status === 'working';
  const isWaiting = status === 'waiting';
  const isCompleted = status === 'completed';
  const isError = status === 'error';
  const isIdle = status === 'idle';

  // 卡片發光邊框
  const glowStyle =
    isWorking || isError
      ? { boxShadow: `0 0 24px -4px ${color}66` }
      : isCompleted
        ? { boxShadow: `0 0 12px -2px ${color}44` }
        : undefined;

  return (
    <div
      className={`relative rounded-2xl border border-subtle bg-surface p-5 transition-all duration-300 ${
        isError ? 'animate-[shake_0.4s_ease-in-out]' : ''
      } ${isIdle ? 'opacity-70' : ''}`}
      style={glowStyle}
    >
      {/* 頂列：狀態燈 + 名稱 */}
      <div className="flex items-center justify-between mb-4">
        <span className={`inline-block w-2 h-2 rounded-full ${STATUS_DOT[status]}`} />
      </div>

      {/* 頭像光環 */}
      <div className="flex justify-center mb-4">
        <div className="relative">
          {/* 光環 */}
          {isWorking && (
            <div
              className="absolute inset-[-6px] rounded-full animate-[orbit_4s_linear_infinite]"
              style={{
                background: `conic-gradient(from 0deg, ${color}44, ${color}, ${color}44)`,
                mask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), black calc(100% - 2px))',
                WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), black calc(100% - 2px))',
              }}
            />
          )}
          {isWaiting && (
            <div
              className="absolute inset-[-6px] rounded-full animate-[orbit_6s_linear_infinite]"
              style={{
                background: `conic-gradient(from 0deg, transparent 0deg, #FBBF24 60deg, transparent 80deg, transparent 180deg, #FBBF24 240deg, transparent 260deg)`,
                mask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), black calc(100% - 2px))',
                WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), black calc(100% - 2px))',
              }}
            />
          )}
          {isCompleted && (
            <div
              className="absolute inset-[-4px] rounded-full border-2"
              style={{ borderColor: color }}
            />
          )}
          {isError && (
            <div
              className="absolute inset-[-6px] rounded-full animate-[error-blink_0.4s_ease-in-out_infinite]"
              style={{
                background: `conic-gradient(from 0deg, ${color}44, ${color}cc, ${color}44)`,
                mask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), black calc(100% - 2px))',
                WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), black calc(100% - 2px))',
              }}
            />
          )}

          {/* Emoji 圓 */}
          <div
            className={`w-[72px] h-[72px] rounded-full flex items-center justify-center text-4xl ${
              isWorking ? 'animate-[breathe_2s_ease-in-out_infinite]' : ''
            }`}
            style={{ backgroundColor: `${color}1A` }}
          >
            {agent.emoji}
          </div>

          {/* completed 的 ✓ 徽章 */}
          {isCompleted && (
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-st-done flex items-center justify-center shadow-[0_0_6px_rgba(52,211,153,0.5)]">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                <path d="M3 8l4 4 6-8" />
              </svg>
            </span>
          )}
        </div>
      </div>

      {/* 名稱 + 角色 */}
      <div className="text-center mb-3">
        <h3 className="text-base font-semibold text-text-primary">{agent.name}</h3>
        <p className="text-xs text-text-muted">{agent.role}</p>
      </div>

      {/* 狀態 pill */}
      <div className="flex justify-center mb-3">
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${STATUS_BG[status]}`}>
          {STATUS_LABEL[status]}
        </span>
      </div>

      {/* 任務摘要 */}
      <p className="text-xs text-text-muted text-center mb-3 line-clamp-2 min-h-[2rem]">
        {agent.task || '—'}
      </p>

      {/* 進度條 */}
      <div className="h-0.5 bg-surface-2 rounded-full overflow-hidden">
        {agent.progress !== undefined && agent.progress >= 0 ? (
          <div
            className="h-full rounded-full transition-[width] duration-500 ease-out"
            style={{
              width: `${Math.min(100, agent.progress)}%`,
              backgroundColor: color,
            }}
          />
        ) : isWorking ? (
          <div
            className="h-full w-1/3 rounded-full animate-[indeterminate-slide_1.2s_linear_infinite]"
            style={{ backgroundColor: color }}
          />
        ) : null}
      </div>
    </div>
  );
}
