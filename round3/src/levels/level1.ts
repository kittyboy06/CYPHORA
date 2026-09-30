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
  length: 26,
  playerStartX: 0,
  tiles: [
    G, G, T,             // runs: 1 (idx 0 to 1, jump over 2 to 3)
    G, G, G, T,          // runs: 2 (idx 3 to 5, jump over 6 to 7)
    G, G, G, G, T,       // runs: 3 (idx 7 to 10, jump over 11 to 12)
    G, G, G, G, G, T,    // runs: 4 (idx 12 to 16, jump over 17 to 18)
    G, G, G, G, G, G, T, // runs: 5 (idx 18 to 23, jump over 24 to 25)
    X                    // Goal at idx 25
  ]
};
