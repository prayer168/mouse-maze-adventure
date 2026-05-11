import type { Difficulty } from '../types';
import './GameStatus.css';

interface Props {
  levelName: string;
  difficulty: Difficulty;
  steps: number;
  elapsed: number;
  started: boolean;
}

const DIFFICULTY_COLOR: Record<Difficulty, string> = {
  Beginner: '#16a34a',
  Easy:     '#2563eb',
  Medium:   '#d97706',
  Advanced: '#dc2626',
  Expert:   '#7c3aed',
};

const DIFFICULTY_ZH: Record<Difficulty, string> = {
  Beginner: '入門',
  Easy:     '簡單',
  Medium:   '中等',
  Advanced: '進階',
  Expert:   '專家',
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function GameStatus({ levelName, difficulty, steps, elapsed, started }: Props) {
  return (
    <div className="game-status">
      <div className="status-level">
        <span className="status-level-name">{levelName}</span>
        <span className="status-badge" style={{ background: DIFFICULTY_COLOR[difficulty] }}>
          {DIFFICULTY_ZH[difficulty]}
        </span>
      </div>

      <div className="status-stats">
        <div className="stat">
          <span className="stat-label">步數</span>
          <span className="stat-value">{steps}</span>
        </div>
        <div className="stat-divider" />
        <div className="stat">
          <span className="stat-label">時間</span>
          <span className={`stat-value mono${!started ? ' idle' : ''}`}>
            {started ? formatTime(elapsed) : '– –'}
          </span>
        </div>
      </div>
    </div>
  );
}
