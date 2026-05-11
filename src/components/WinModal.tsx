import type { Stars } from '../types';
import type { ScoreResult } from '../utils/scoring';
import './WinModal.css';

interface Props {
  score: ScoreResult;
  elapsed: number;
  steps: number;
  hasNext: boolean;
  onReset: () => void;
  onNext: () => void;
}

const STAR_MESSAGE: Record<Stars, string> = {
  3: '完美通關！🧀',
  2: '做得很好！',
  1: '你成功了！',
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function WinModal({ score, elapsed, steps, hasNext, onReset, onNext }: Props) {
  const { stars, optimalSteps, extraSteps } = score;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="win-title">
      <div className="modal">

        {/* 星星 */}
        <div className="stars-row" aria-label={`${stars} 顆星，滿分 3 顆`}>
          {([1, 2, 3] as Stars[]).map(n => (
            <span
              key={n}
              className={`star${n <= stars ? ' filled' : ' empty'}`}
              style={{ animationDelay: `${(n - 1) * 0.12}s` }}
              aria-hidden="true"
            >
              ★
            </span>
          ))}
        </div>

        <h2 id="win-title" className="modal-title">{STAR_MESSAGE[stars]}</h2>

        {/* 統計格 */}
        <div className="modal-stats">
          <div className="modal-stat">
            <span className="modal-stat-value mono">{formatTime(elapsed)}</span>
            <span className="modal-stat-label">時間</span>
          </div>
          <div className="modal-stat-divider" />
          <div className="modal-stat">
            <span className="modal-stat-value">{steps}</span>
            <span className="modal-stat-label">步數</span>
          </div>
          <div className="modal-stat-divider" />
          <div className="modal-stat">
            <span className="modal-stat-value">{optimalSteps}</span>
            <span className="modal-stat-label">最佳步數</span>
          </div>
        </div>

        {extraSteps > 0 && (
          <p className="modal-extra">
            比最佳步數多走了 {extraSteps} 步
          </p>
        )}

        <div className="modal-actions">
          <button className="btn-retry" onClick={onReset}>
            🔄 再試一次
          </button>
          {hasNext ? (
            <button className="btn-next" onClick={onNext} autoFocus>
              下一關 →
            </button>
          ) : (
            <button className="btn-next" onClick={onReset} autoFocus>
              再玩一次 🏆
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
