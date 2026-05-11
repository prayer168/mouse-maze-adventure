import type { AlgorithmId } from '../types';
import type { AiStats } from '../hooks/useAiSolver';
import { ALGORITHM_LIST, ALGORITHM_MAP } from '../algorithms/index';
import './AlgoPanel.css';

interface Props {
  selectedId: AlgorithmId;
  onSelect: (id: AlgorithmId) => void;
  stats: AiStats | null;
  isRunning: boolean;
}

export function AlgoPanel({ selectedId, onSelect, stats, isRunning }: Props) {
  const algo = ALGORITHM_MAP[selectedId];

  return (
    <div className="algo-panel">
      {/* ── 下拉選單 ─────────────────────────────────────────── */}
      <div className="algo-select-row">
        <label htmlFor="algo-select" className="algo-select-label">
          演算法
        </label>
        <select
          id="algo-select"
          className="algo-select"
          value={selectedId}
          onChange={e => onSelect(e.target.value as AlgorithmId)}
          disabled={isRunning}
          aria-label="選擇搜尋演算法"
        >
          {ALGORITHM_LIST.map(a => (
            <option key={a.id} value={a.id}>
              {a.icon} {a.name} — {a.tagline}
            </option>
          ))}
        </select>
      </div>

      {/* ── 說明卡片 ─────────────────────────────────────────── */}
      <div className="algo-card" style={{ '--algo-color': algo.color } as React.CSSProperties}>
        <div className="algo-card-header">
          <span className="algo-card-icon">{algo.icon}</span>
          <div>
            <span className="algo-card-name">{algo.name}</span>
            <span className={`algo-card-badge ${algo.optimal ? 'badge-optimal' : 'badge-not-optimal'}`}>
              {algo.optimal ? '✓ 最短路徑' : '✗ 非最短'}
            </span>
          </div>
        </div>
        <p className="algo-card-text">{algo.explanation}</p>
        <p className="algo-card-fact">{algo.funFact}</p>
      </div>

      {/* ── 統計資料（執行後顯示）────────────────────────────── */}
      {stats && (
        <div className="algo-stats" style={{ '--algo-color': algo.color } as React.CSSProperties}>
          <div className="algo-stat">
            <span className="algo-stat-icon">🔍</span>
            <span className="algo-stat-value">{stats.exploredCount}</span>
            <span className="algo-stat-label">已探索格子</span>
          </div>
          <div className="algo-stat-divider" />
          <div className="algo-stat">
            <span className="algo-stat-icon">🛤️</span>
            <span className="algo-stat-value">{stats.pathLength}</span>
            <span className="algo-stat-label">路徑步數</span>
          </div>
          <div className="algo-stat-divider" />
          <div className="algo-stat">
            <span className="algo-stat-icon">⏱️</span>
            <span className="algo-stat-value">{stats.timeMs.toFixed(2)}</span>
            <span className="algo-stat-label">毫秒（計算時間）</span>
          </div>
        </div>
      )}

      {/* ── 顏色圖例 ─────────────────────────────────────────── */}
      <div className="algo-legend">
        <span className="legend-item">
          <span className="legend-swatch swatch-explored" />
          已探索格子
        </span>
        <span className="legend-item">
          <span className="legend-swatch swatch-path" style={{ background: algo.color }} />
          最終路徑
        </span>
      </div>
    </div>
  );
}
