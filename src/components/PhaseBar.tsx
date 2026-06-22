import type { PhaseData } from '../types/office';

interface Props {
  phases: PhaseData[];
}

export default function PhaseBar({ phases }: Props) {
  const doneCount = phases.filter((p) => p.status === 'done').length;
  const total = phases.length;

  return (
    <div className="px-8 py-4 border-b border-subtle">
      <div className="relative max-w-[1440px] mx-auto">
        {/* 底軌 */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-subtle" />

        {/* 已完成軌段 */}
        {doneCount > 0 && (
          <div
            className="absolute top-4 left-0 h-0.5 bg-gradient-to-r from-accent to-accent2 transition-[width] duration-500 ease-out"
            style={{ width: `${Math.min(doneCount / Math.max(total - 1, 1), 1) * 100}%` }}
          />
        )}

        {/* 節點 */}
        <div className="relative flex justify-between">
          {phases.map((phase) => {
            const isDone = phase.status === 'done';
            const isActive = phase.status === 'active';
            const isPending = phase.status === 'pending';

            return (
              <div key={phase.id} className="flex flex-col items-center">
                {/* 節點圓圈 */}
                <div className="relative flex items-center justify-center">
                  {isDone && (
                    <span className="relative z-10 w-6 h-6 rounded-full bg-st-done flex items-center justify-center shadow-[0_0_8px_rgba(52,211,153,0.4)]">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 8l4 4 6-8" strokeDasharray="20" strokeDashoffset="20" className="animate-[draw-check_300ms_ease-out_forwards]">
                          <animate attributeName="stroke-dashoffset" from="20" to="0" dur="300ms" fill="freeze" />
                        </path>
                      </svg>
                    </span>
                  )}

                  {isActive && (
                    <span className="relative z-10 w-6 h-6 rounded-full bg-accent shadow-[0_0_12px_rgba(56,189,248,0.5)]">
                      <span className="absolute inset-[-4px] rounded-full border-2 border-accent/30 animate-[orbit_3s_linear_infinite]" />
                    </span>
                  )}

                  {isPending && (
                    <span className="relative z-10 w-6 h-6 rounded-full bg-surface-2 border-2 border-subtle" />
                  )}
                </div>

                {/* 標籤 */}
                <span
                  className={`mt-2 text-xs whitespace-nowrap ${
                    isActive
                      ? 'text-text-primary font-medium'
                      : isDone
                        ? 'text-st-done'
                        : 'text-text-dim'
                  }`}
                >
                  {phase.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
