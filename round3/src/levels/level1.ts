import { LevelDefinition, TileType } from '../types/game';

const G = TileType.GROUND;
const T = TileType.TRAP;
const X = TileType.GOAL;

// The Broken Bridge:
// Wide platforms separated by single-tile gaps.
// run() = advance 1 tile on ground. Stepping on TRAP = death.
// jump() = if gap ahead, leap over it (+2 tiles). If ground ahead, jump in place (no movement).
// Solution requires BOTH: run across platforms, jump over gaps.
export const level1: LevelDefinition = {
  id: 'level_01',
  name: 'The Broken Bridge',
  length: 16,
  playerStartX: 0,
  tiles: [
    G, // 0  Start platform
    G, // 1
    G, // 2
    T, // 3  Gap 1
    G, // 4  Platform 2
    G, // 5
    T, // 6  Gap 2
    G, // 7  Platform 3
    G, // 8
    G, // 9
    T, // 10 Gap 3
    G, // 11 Platform 4
    G, // 12
    T, // 13 Gap 4
    G, // 14 Final platform
    X, // 15 Goal
  ]
};
