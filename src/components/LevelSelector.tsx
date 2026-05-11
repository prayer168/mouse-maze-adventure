import type { MazeLevel } from '../types';
import './LevelSelector.css';

interface Props {
  levels: MazeLevel[];
  currentId: number;
  onSelect: (level: MazeLevel) => void;
}

const DIFFICULTY_ICON: Record<string, string> = {
  Beginner: '🌱',
  Easy:     '⭐',
  Medium:   '🌟',
  Advanced: '🔥',
  Expert:   '💀',
};

export function LevelSelector({ levels, currentId, onSelect }: Props) {
  return (
    <nav className="level-selector" aria-label="Select level">
      {levels.map(level => (
        <button
          key={level.id}
          className={`level-btn diff-${level.difficulty.toLowerCase()}${level.id === currentId ? ' active' : ''}`}
          onClick={() => onSelect(level)}
          aria-pressed={level.id === currentId}
          title={level.description}
        >
          <span className="level-icon" aria-hidden="true">
            {DIFFICULTY_ICON[level.difficulty]}
          </span>
          <span className="level-name">{level.name}</span>
        </button>
      ))}
    </nav>
  );
}
