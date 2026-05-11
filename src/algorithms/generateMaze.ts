/**
 * generateMaze.ts
 * ────────────────────────────────────────────────────────────────
 * Random maze generator using the Iterative Recursive Backtracker
 * (depth-first search) algorithm.
 *
 * Key guarantee: every generated maze is fully connected — there is
 * ALWAYS at least one valid path from start (top-left) to end
 * (bottom-right).
 *
 * How it works:
 *   1. Start with a grid of all walls.
 *   2. Pick the top-left cell; push it onto a stack.
 *   3. While the stack is not empty:
 *        a. Look at the top cell's unvisited neighbours.
 *        b. If any exist, pick one at random, knock down the wall
 *           between them, mark it visited, push it.
 *        c. If none exist, pop (backtrack).
 *   4. This carves a spanning tree — one unique path between any
 *      two cells, guaranteeing a solution always exists.
 *   5. Optionally remove extra walls to create loops / shortcuts
 *      (easier difficulty).
 */

import type { MazeGrid, Position } from '../types';

// ── Public types ──────────────────────────────────────────────────────────────

export type MazeSize = 8 | 12 | 16 | 20;

export type GenDifficulty = 'easy' | 'medium' | 'hard';

export interface GeneratedMaze {
  /** Full grid — 0 = walkable path, 1 = wall */
  grid: MazeGrid;
  /** Starting position (always top-left walkable cell) */
  start: Position;
  /** Goal position (always bottom-right walkable cell) */
  end: Position;
  /** Total grid columns (= 2 * cellsWide + 1) */
  gridWidth: number;
  /** Total grid rows (= 2 * cellsTall + 1) */
  gridHeight: number;
}

// ── Difficulty → extra-wall-removal ratio ─────────────────────────────────────
// Removing more interior walls creates alternative routes (loops).
// Fewer alternative routes = more dead ends = harder to solve.
const EXTRA_REMOVAL: Record<GenDifficulty, number> = {
  easy:   0.28,  // remove 28 % of interior walls → many shortcuts
  medium: 0.12,  // remove 12 % → occasional shortcuts
  hard:   0.00,  // remove nothing → pure spanning tree, maximum dead ends
};

// ── Core generator ────────────────────────────────────────────────────────────

/**
 * @param cellsWide  Number of navigable cells horizontally
 * @param cellsTall  Number of navigable cells vertically
 * @param difficulty Controls how many extra shortcuts are carved
 */
export function generateMaze(
  cellsWide: MazeSize,
  cellsTall: MazeSize,
  difficulty: GenDifficulty,
): GeneratedMaze {
  const W = 2 * cellsWide + 1;   // total grid columns
  const H = 2 * cellsTall + 1;   // total grid rows

  // ── 1. Initialise: everything is a wall ──────────────────────────────────
  const grid: number[][] = Array.from({ length: H }, () => new Array(W).fill(1));

  // ── 2. Iterative DFS (recursive backtracker) ─────────────────────────────
  //
  // Navigable cells live at ODD grid positions:
  //   cell (r, c)  ←→  grid (2r+1, 2c+1)
  //
  // The wall between cell (r1,c1) and neighbour (r2,c2) sits at the
  // midpoint in grid coordinates:
  //   wall_row = r1+r2+1,  wall_col = c1+c2+1

  const visited: boolean[][] = Array.from(
    { length: cellsTall },
    () => new Array(cellsWide).fill(false),
  );

  // Open the starting cell (0,0) → grid (1,1)
  visited[0][0] = true;
  grid[1][1] = 0;

  const stack: [number, number][] = [[0, 0]];

  while (stack.length > 0) {
    const [cr, cc] = stack[stack.length - 1];

    // Collect unvisited cell-neighbours (N / S / W / E)
    const unvisited: [number, number][] = [];
    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]] as const) {
      const nr = cr + dr;
      const nc = cc + dc;
      if (
        nr >= 0 && nr < cellsTall &&
        nc >= 0 && nc < cellsWide &&
        !visited[nr][nc]
      ) {
        unvisited.push([nr, nc]);
      }
    }

    if (unvisited.length === 0) {
      stack.pop();      // backtrack
      continue;
    }

    // Pick a random unvisited neighbour
    const idx = Math.floor(Math.random() * unvisited.length);
    const [nr, nc] = unvisited[idx];

    // Open the neighbour cell
    grid[2 * nr + 1][2 * nc + 1] = 0;

    // Knock down the wall between current cell and chosen neighbour
    grid[cr + nr + 1][cc + nc + 1] = 0;

    visited[nr][nc] = true;
    stack.push([nr, nc]);
  }

  // ── 3. Extra wall removal — creates loops for easier difficulties ─────────
  const ratio = EXTRA_REMOVAL[difficulty];
  if (ratio > 0) {
    // Collect all interior "passage walls":
    //   - wall between two cell rows: row is EVEN, col is ODD
    //   - wall between two cell cols: row is ODD,  col is EVEN
    //   - exclude the outer border (rows 0, H-1 and cols 0, W-1)
    const walls: [number, number][] = [];
    for (let r = 1; r < H - 1; r++) {
      for (let c = 1; c < W - 1; c++) {
        if (grid[r][c] === 1 && ((r % 2 === 0) !== (c % 2 === 0))) {
          walls.push([r, c]);
        }
      }
    }

    // Fisher-Yates shuffle, then open the first `toRemove` entries
    for (let i = walls.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [walls[i], walls[j]] = [walls[j], walls[i]];
    }
    const toRemove = Math.floor(walls.length * ratio);
    for (let i = 0; i < toRemove; i++) {
      grid[walls[i][0]][walls[i][1]] = 0;
    }
  }

  const start: Position = { row: 1,     col: 1     };
  const end:   Position = { row: H - 2, col: W - 2 };

  return {
    grid: grid as unknown as MazeGrid,
    start,
    end,
    gridWidth:  W,
    gridHeight: H,
  };
}
