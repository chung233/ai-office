import type { ConnStatus } from '../types/office';

interface Props {
  connStatus: ConnStatus;
  completedPhases: number;
  totalPhases: number;
  activePhaseLabel?: string;
  elapsed: number;
}

const STATUS_LABEL: Record<ConnStatus, string> = {
  connecting: '連線中…',
  open: '已連線',
  closed: '已斷線',
};

const STATUS_DOT: Record<ConnStatus, string> = {
  connecting: 'bg-st-wait animate-pulse',
  open: 'bg-st-done',
  closed: 'bg-st-err animate-pulse',
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function Header({
  connStatus,
  completedPhases,
  totalPhases,
  activePhaseLabel,
  elapsed,
}: Props) {
  return (
    <header className="border-b border-subtle">
      <div className="flex items-center justify-between px-8 h-20 max-w-[1440px] mx-auto">
        {/* 左側：Logo + 標題 */}
        <div className="flex items-center gap-4 animate-[fade-up_200ms_ease-out_both]">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent2 flex items-center justify-center shadow-[0_0_12px_rgba(56,189,248,0.3)]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0A0E1A" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
              AI Office
            </h1>
            <p className="text-xs text-text-muted">Multi-Agent 即時監控</p>
          </div>
        </div>

        {/* 右側：狀態徽章群 */}
        <div className="flex items-center gap-4">
          {/* 連線狀態 pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-subtle text-xs">
            <span className={`inline-block w-2 h-2 rounded-full ${STATUS_DOT[connStatus]}`} />
            <span className="text-text-muted">{STATUS_LABEL[connStatus]}</span>
          </div>

          {/* Phase 進度 */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-subtle text-xs">
            <span className="text-accent font-medium">
              {activePhaseLabel ?? '—'}
            </span>
            <span className="text-text-muted">
              {completedPhases} / {totalPhases}
            </span>
          </div>

          {/* 計時器 */}
          <div className="px-3 py-1.5 rounded-full bg-surface border border-subtle text-xs font-mono text-text-muted tabular-nums min-w-[64px] text-center">
            {formatTime(elapsed)}
          </div>
        </div>
      </div>
    </header>
  );
}
