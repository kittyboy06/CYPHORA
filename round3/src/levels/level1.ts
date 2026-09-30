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
  length: 19,
  playerStartX: 0,
  tiles: [
    G, G, T,             // runs: 1 (idx 0 to 1, length 2)
    G, G, G, T,          // runs: 2 (idx 3 to 5, length 3)
    G, G, G, G, T,       // runs: 3 (idx 7 to 10, length 4)
    G, G, G, G, G,       // runs: 4 (idx 12 to 16, length 5)
    X                    // Goal at idx 17 (wait, length is 18. Index 17)
  ]
};
