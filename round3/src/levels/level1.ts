import { LevelDefinition, TileType } from '../types/game';

const G = TileType.GROUND;
const T = TileType.TRAP;
const X = TileType.GOAL;

// The Broken Bridge (Triangular Sequence):
// The required runs between jumps increase sequentially: 1, 2, 3, 4, 5...
// To pass, the player must write a loop where the run count increases by 1 each iteration.
// Example Solution:
// let runs = 1;
// while (runs <= 5) {
//   for (let i = 0; i < runs; i++) run();
//   jump();
//   runs++;
// }

export const level1: LevelDefinition = {
  id: 'level_01',
  name: 'The Broken Bridge',
  length: 24,
  playerStartX: 0,
  tiles: [
    G, G, T,                   // 2 blocks (idx 0-1) -> run 1
    G, G, G, T,                // 3 blocks (idx 3-5) -> run 2
    G, G, G, G, T,             // 4 blocks (idx 7-10) -> run 3
    G, G, G, G, G, T,          // 5 blocks (idx 12-16) -> run 4
    G, G, G, G, G, X           // 6 blocks (idx 18-23) -> run 5
  ]
};
