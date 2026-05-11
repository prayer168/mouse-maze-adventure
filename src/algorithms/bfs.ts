import type { AlgorithmResult, MazeGrid, Position } from '../types';

/**
 * Breadth-First Search
 *
 * Pure function — no side-effects, no external state.
 * Explores cells level-by-level (like ripples in water).
 * Always finds the SHORTEST path.
 *
 * Time:  O(R × C)   Space: O(R × C)
 */
export function bfs(grid: MazeGrid, start: Position, end: Position): AlgorithmResult {
  const t0   = performance.now();
  const rows = grid.length;
  const cols = grid[0].length;

  const key = (r: number, c: number) => `${r},${c}`;

  const visited  = new Set<string>();
  const parent   = new Map<string, string | null>();
  const explored: Position[] = [];

  const startKey = key(start.row, start.col);
  const endKey   = key(end.row, end.col);

  visited.add(startKey);
  parent.set(startKey, null);

  const queue: [number, number][] = [[start.row, start.col]];

  while (queue.length > 0) {
    const [r, c] = queue.shift()!;
    explored.push({ row: r, col: c });

    if (key(r, c) === endKey) {
      const path: Position[] = [];
      let cur: string | null = endKey;
      while (cur !== null) {
        const [pr, pc] = cur.split(',').map(Number);
        path.unshift({ row: pr, col: pc });
        cur = parent.get(cur) ?? null;
      }
      return { path, explored, timeMs: performance.now() - t0 };
    }

    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]] as const) {
      const nr = r + dr, nc = c + dc, nk = key(nr, nc);
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited.has(nk) && grid[nr][nc] === 0) {
        visited.add(nk);
        parent.set(nk, key(r, c));
        queue.push([nr, nc]);
      }
    }
  }

  return { path: [], explored, timeMs: performance.now() - t0 };
}
