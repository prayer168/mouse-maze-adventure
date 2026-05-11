import type { AlgorithmId, AlgorithmResult, MazeGrid, Position } from '../types';
import { bfs   } from './bfs';
import { dfs   } from './dfs';
import { astar } from './astar';

export interface AlgorithmMeta {
  id: AlgorithmId;
  name: string;
  icon: string;
  color: string;
  tagline: string;
  explanation: string;
  funFact: string;
  optimal: boolean;
  run: (grid: MazeGrid, start: Position, end: Position) => AlgorithmResult;
}

export const ALGORITHM_LIST: AlgorithmMeta[] = [
  {
    id: 'bfs',
    name: 'BFS',
    icon: '🌊',
    color: '#3b82f6',
    tagline: '廣度優先搜尋 — 永遠找到最短路徑',
    explanation:
      '想像把石頭丟進水裡，波紋往四面八方均勻擴散。' +
      'BFS 就是這樣運作的——先檢查距離一步的所有格子，' +
      '再檢查兩步的，然後三步，以此類推。' +
      '這種「波浪」模式保證每次都能找到最短路線！',
    funFact: '🏆 BFS 被用於 GPS 導航應用程式，找出兩地之間的最快路線。',
    optimal: true,
    run: bfs,
  },
  {
    id: 'dfs',
    name: 'DFS',
    icon: '🐾',
    color: '#f97316',
    tagline: '深度優先搜尋 — 衝到底才回頭',
    explanation:
      '想像一隻老鼠選了一條走廊，一路跑到盡頭才回來試試其他路。' +
      'DFS 會盡可能往一個方向深入，只有在碰到死路時才回頭。' +
      '它可能很快找到出路，也可能繞很長的冤枉路！' +
      '它不保證找到最短路徑。',
    funFact: '🌲 DFS 被用來解決數獨這類謎題，以及搜尋樹狀結構的資料。',
    optimal: false,
    run: dfs,
  },
  {
    id: 'astar',
    name: 'A★',
    icon: '⭐',
    color: '#8b5cf6',
    tagline: 'A* 搜尋 — 有目標感的聰明探索',
    explanation:
      'A*（念作「A星」）就像一個手持魔法羅盤的導航員，羅盤永遠指向起司。' +
      '每一步它都選擇「距離起點近又距離終點近」的格子。' +
      '這種專注讓它比 BFS 少走很多冤枉路，又能保證找到最短路徑！',
    funFact: '🎮 幾乎所有電玩遊戲都使用 A* 讓角色繞過障礙物移動。',
    optimal: true,
    run: astar,
  },
];

export const ALGORITHM_MAP = Object.fromEntries(
  ALGORITHM_LIST.map(a => [a.id, a]),
) as Record<AlgorithmId, AlgorithmMeta>;
