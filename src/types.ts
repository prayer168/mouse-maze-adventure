export interface Position {
  row: number;
  col: number;
}

export type CellValue = 0 | 1;
export type MazeGrid = CellValue[][];

export type Difficulty = 'Beginner' | 'Easy' | 'Medium' | 'Advanced' | 'Expert';

export type Stars = 1 | 2 | 3;

export type AlgorithmId = 'bfs' | 'dfs' | 'astar';

export interface AlgorithmResult {
  /** Solution path from start to end, inclusive. Empty if unreachable. */
  path: Position[];
  /** Every cell examined during the search, in visit order. */
  explored: Position[];
  /** Wall-clock time the algorithm took to run, in milliseconds. */
  timeMs: number;
}

export interface MazeLevel {
  id: number;
  name: string;
  difficulty: Difficulty;
  description: string;
  grid: MazeGrid;
  start: Position;
  end: Position;
}
