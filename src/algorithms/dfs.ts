import type { AlgorithmResult, MazeGrid, Position } from '../types';

/**
 * Depth-First Search
 *
 * Pure function — no side-effects, no external state.
 * Uses an explicit stack (iterative) to avoid call-stack limits.
 *
 * Explores one direction as far as possible before backtracking.
 * Does NOT guarantee the shortest path.
 *
 * Time:  O(R × C)   Space: O(R × C)
 */
export function dfs(grid: MazeGrid, start: Position, end: Position): AlgorithmResult {
  const t0   = performance.now();
  const rows = grid.length;
  const cols = grid[0].length;

  const key = (r: number, c: number) => `${r},${c}`;

  const visited  = new Set<string>();
  const parent   = new Map<string, string | null>();
  const explored: Position[] = [];

  const startKey = key(start.row, start.col);
  const endKey   = key(end.row, end.col);

  // Push in reverse neighbour order so the stack pops in a natural (up → right) direction.
  const stack: [number, number][] = [[start.row, start.col]];
  visited.add(startKey);
  parent.set(startKey, null);

  while (stack.length > 0) {
    const [r, c] = stack.pop()!;
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

    // Push neighbours in reverse priority so right/down are explored first visually.
    for (const [dr, dc] of [[0, -1], [1, 0], [0, 1], [-1, 0]] as const) {
      const nr = r + dr, nc = c + dc, nk = key(nr, nc);
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited.has(nk) && grid[nr][nc] === 0) {
        visited.add(nk);
        parent.set(nk, key(r, c));
        stack.push([nr, nc]);
      }
    }
  }

  return { path: [], explored, timeMs: performance.now() - t0 };
}
