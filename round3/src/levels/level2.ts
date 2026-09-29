import { LevelDefinition, TileType } from '../types/game';

const G = TileType.GROUND;
const F = TileType.FIRE;
const X = TileType.GOAL;

// The Beast's Lair:
// Fire at 5th block (idx 4).
// Beast at 10th block (idx 9).
// Player must stop at 8th block (idx 7) to attack safely.
export const level2: LevelDefinition = {
  id: 'level_02',
  name: "The Beast's Lair",
  length: 11,
  playerStartX: 0,
  tiles: [
    G, G, G, G, F, G, G, G, G, G, X
  ],
  beast: {
    positionIndex: 9,
    hp: 3,
    vulnerablePattern: [false, false, true] // Shield, Shield, Drop Shield
  }
};
