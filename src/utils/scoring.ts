import type { MazeLevel, Stars } from '../types';
import { bfs } from '../algorithms/bfs';

// ── Optimal-path length — delegates to the shared pure BFS ───────────────────

export function bfsOptimal(level: Pick<MazeLevel, 'grid' | 'start' | 'end'>): number {
  const { path } = bfs(level.grid, level.start, level.end);
  return path.length === 0 ? Infinity : path.length - 1;
}

// ── Star thresholds (adjust these to tune difficulty of ratings) ──────────────
//   steps ≤ optimal × THRESHOLD → that many stars

const THRESHOLDS: Record<Stars, number> = {
  3: 1.25, // within 25 % of optimal → 3 stars
  2: 1.75, // within 75 % of optimal → 2 stars
  1: Infinity,
};

export function computeStars(steps: number, optimalSteps: number): Stars {
  for (const s of [3, 2, 1] as Stars[]) {
    if (steps <= Math.ceil(optimalSteps * THRESHOLDS[s])) return s;
  }
  return 1;
}

// ── Convenience: compute everything for one level ─────────────────────────────

export interface ScoreResult {
  stars: Stars;
  optimalSteps: number;
  extraSteps: number;
}

export function scoreLevel(level: MazeLevel, steps: number): ScoreResult {
  const optimalSteps = bfsOptimal(level);
  const stars = computeStars(steps, optimalSteps);
  return { stars, optimalSteps, extraSteps: steps - optimalSteps };
}
