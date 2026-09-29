import { LevelDefinition, TileType } from '../types/game';

const G = TileType.GROUND;
const T = TileType.TRAP;
const X = TileType.GOAL;

// The Broken Bridge:
// Pattern: 3 ground tiles, then 1 gap — repeating.
// run() 3 times, jump() once, repeat.
// Solution: use a loop with modulo (every 4th step is a jump)
//   or nested loops: repeat N { run(); run(); run(); jump(); }
export const level1: LevelDefinition = {
  id: 'level_01',
  name: 'The Broken Bridge',
  length: 20,
  playerStartX: 0,
  tiles: [
    G, // 0  Start
    G, // 1
    G, // 2
    T, // 3  Gap 1
    G, // 4
    G, // 5
    G, // 6
    T, // 7  Gap 2
    G, // 8
    G, // 9
    G, // 10
    T, // 11 Gap 3
    G, // 12
    G, // 13
    G, // 14
    T, // 15 Gap 4
    G, // 16
    G, // 17
    G, // 18
    X, // 19 Goal
  ]
};
