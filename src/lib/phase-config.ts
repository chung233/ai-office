/** Phase Tab 靜態設定 — 7 個階段的描述與 agent 對應 */
interface PhaseTabConfig {
  id: string;
  label: string;
  description: string;
  /** 參與的 agent id（依互動順序排列） */
  agentIds: string[];
  /** flow 圖的文字說明 */
  flowLabel: string;
}

const PHASE_TAB_CONFIGS: Record<string, PhaseTabConfig> = {
  understand: {
    id: 'understand',
    label: '理解',
    description: 'Orchestrator 分析需求、確認範圍與限制條件',
    agentIds: ['hermes'],
    flowLabel: 'Orchestrator 獨立分析',
  },
  decompose: {
    id: 'decompose',
    label: '分解',
    description: 'Orchestrator 將任務拆分為可執行的子目標',
    agentIds: ['hermes'],
    flowLabel: 'Orchestrator 獨立拆解',
  },
  check: {
    id: 'check',
    label: '檢查',
    description: 'Orchestrator 提交計畫給 PM 進行可行性審核',
    agentIds: ['hermes', 'pm'],
    flowLabel: 'Orchestrator → PM',
  },
  iterate: {
    id: 'iterate',
    label: '迭代',
    description: 'PM 與 SrEng 來回協作，實作核心功能',
    agentIds: ['pm', 'sreng'],
    flowLabel: 'PM ↔ SrEng',
  },
  review: {
    id: 'review',
    label: '審查',
    description: 'SrEng 提交成果，Reviewer 進行最終審查',
    agentIds: ['sreng', 'reviewer'],
    flowLabel: 'SrEng → Reviewer',
  },
  deliver: {
    id: 'deliver',
    label: '交付',
    description: 'Orchestrator 整合最終產出並交付',
    agentIds: ['hermes'],
    flowLabel: 'Orchestrator 主導交付',
  },
  reflect: {
    id: 'reflect',
    label: '反思',
    description: 'Orchestrator 進行事後分析與經驗總結',
    agentIds: ['hermes'],
    flowLabel: 'Orchestrator 事後分析',
  },
};

/** 依 phase id 取得設定 */
export function getPhaseConfig(id: string): PhaseTabConfig | undefined {
  return PHASE_TAB_CONFIGS[id];
}

/** 取得所有 phase 設定陣列 */
export function getPhaseConfigs(): PhaseTabConfig[] {
  return Object.values(PHASE_TAB_CONFIGS);
}
