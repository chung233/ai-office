import type { PhaseData } from '../types/office';
import { getPhaseConfig } from '../lib/phase-config';

interface Props {
  phases: PhaseData[];
  selectedTabId: string;
  onSelectTab: (id: string) => void;
}

/** Phase 狀態對應的小圓點樣式 */
const STATUS_DOT: Record<string, string> = {
  done: 'bg-st-done',
  active: 'bg-accent animate-pulse',
  pending: 'bg-text-dim',
};

export default function PhaseTabs({ phases, selectedTabId, onSelectTab }: Props) {
  if (phases.length === 0) {
    return null;
  }

  return (
    <div className="border-b border-subtle">
      {/* 桌面：水平 tab 列 */}
      <div className="hidden sm:flex max-w-[1440px] mx-auto px-8">
        {phases.map((phase) => {
          const config = getPhaseConfig(phase.id);
          const isSelected = phase.id === selectedTabId;
          const isActivePhase = phase.status === 'active';

          return (
            <button
              key={phase.id}
              type="button"
              onClick={() => onSelectTab(phase.id)}
              className={[
                'relative flex items-center gap-2 px-4 py-3 text-sm font-medium',
                'border-b-2 transition-all duration-200',
                isSelected
                  ? 'border-accent text-accent'
                  : 'border-transparent text-text-muted hover:text-text-primary hover:border-subtle',
                isActivePhase && isSelected
                  ? 'animate-[tab-glow_2s_ease-in-out_infinite]'
                  : '',
              ].join(' ')}
            >
              {/* Phase 狀態小圓點 */}
              <span
                className={`inline-block w-1.5 h-1.5 rounded-full ${STATUS_DOT[phase.status] ?? 'bg-text-dim'}`}
              />
              {config?.label ?? phase.label}
            </button>
          );
        })}
      </div>

      {/* 手機：下拉選單 */}
      <div className="sm:hidden px-4 py-2">
        <select
          value={selectedTabId}
          onChange={(e) => onSelectTab(e.target.value)}
          className="w-full bg-surface border border-subtle rounded-lg px-3 py-2 text-sm text-text-primary
            focus:outline-none focus:border-accent appearance-none cursor-pointer"
        >
          {phases.map((phase) => {
            const config = getPhaseConfig(phase.id);
            const prefix =
              phase.status === 'done' ? '✓ ' : phase.status === 'active' ? '● ' : '○ ';
            return (
              <option key={phase.id} value={phase.id}>
                {prefix}
                {config?.label ?? phase.label}
              </option>
            );
          })}
        </select>
      </div>
    </div>
  );
}
