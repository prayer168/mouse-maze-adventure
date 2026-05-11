import { useState } from 'react';
import type { MazeLevel, Difficulty } from '../types';
import { generateMaze } from '../algorithms/generateMaze';
import type { MazeSize, GenDifficulty } from '../algorithms/generateMaze';
import './GeneratorPanel.css';

interface Props {
  onGenerate: (level: MazeLevel) => void;
  /** true when the currently displayed maze was randomly generated */
  isActive: boolean;
}

const SIZES: { value: MazeSize; label: string }[] = [
  { value: 8,  label: '8×8'   },
  { value: 12, label: '12×12' },
  { value: 16, label: '16×16' },
  { value: 20, label: '20×20' },
];

const DIFFICULTIES: { id: GenDifficulty; label: string; hint: string }[] = [
  { id: 'easy',   label: '簡單', hint: '多條捷徑，較容易走出' },
  { id: 'medium', label: '中等', hint: '少量捷徑，需要動腦' },
  { id: 'hard',   label: '困難', hint: '幾乎沒有捷徑，死路最多' },
];

// Map generator difficulty to the existing Difficulty type used in GameStatus
const DIFFICULTY_MAP: Record<GenDifficulty, Difficulty> = {
  easy:   'Easy',
  medium: 'Medium',
  hard:   'Expert',
};

const DIFFICULTY_ZH: Record<GenDifficulty, string> = {
  easy:   '簡單',
  medium: '中等',
  hard:   '困難',
};

export function GeneratorPanel({ onGenerate, isActive }: Props) {
  const [size,       setSize]       = useState<MazeSize>(12);
  const [genDiff,    setGenDiff]    = useState<GenDifficulty>('medium');
  const [generating, setGenerating] = useState(false);

  function handleGenerate() {
    setGenerating(true);
    // Yield to the browser for one frame so the "生成中…" text renders
    // before the synchronous generation blocks the main thread.
    setTimeout(() => {
      const maze = generateMaze(size, size, genDiff);

      const level: MazeLevel = {
        id:          0,   // 0 = generated (no preset has this id)
        name:        `隨機 ${size}×${size}`,
        difficulty:  DIFFICULTY_MAP[genDiff],
        description: `${size}×${size} 格隨機迷宮・難度：${DIFFICULTY_ZH[genDiff]}`,
        grid:        maze.grid,
        start:       maze.start,
        end:         maze.end,
      };

      onGenerate(level);
      setGenerating(false);
    }, 16);
  }

  return (
    <div className={`gen-panel${isActive ? ' gen-panel--active' : ''}`}>
      <div className="gen-header">
        <span className="gen-title">🎲 隨機迷宮生成器</span>
        {isActive && <span className="gen-active-badge">使用中</span>}
      </div>

      {/* ── Size picker ───────────────────────────────────────── */}
      <div className="gen-row">
        <span className="gen-row-label">大小</span>
        <div className="gen-options">
          {SIZES.map(({ value, label }) => (
            <button
              key={value}
              className={`gen-opt${size === value ? ' gen-opt--on' : ''}`}
              onClick={() => setSize(value)}
              aria-pressed={size === value}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Difficulty picker ─────────────────────────────────── */}
      <div className="gen-row">
        <span className="gen-row-label">難度</span>
        <div className="gen-options">
          {DIFFICULTIES.map(({ id, label, hint }) => (
            <button
              key={id}
              className={`gen-opt gen-opt--${id}${genDiff === id ? ' gen-opt--on' : ''}`}
              onClick={() => setGenDiff(id)}
              aria-pressed={genDiff === id}
              title={hint}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Generate button ───────────────────────────────────── */}
      <button
        className="gen-go-btn"
        onClick={handleGenerate}
        disabled={generating}
        aria-busy={generating}
      >
        {generating ? '⏳ 生成中…' : '🎲 生成隨機迷宮'}
      </button>
    </div>
  );
}
