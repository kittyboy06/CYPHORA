import { LevelDefinition, TileType } from '../types/game';

const G = TileType.GROUND;
const SWORD = TileType.ITEM_SWORD;
const SHIELD = TileType.ITEM_SHIELD;
const X = TileType.GOAL;

// The Beast's Lair:
// Sword at 3rd block (idx 2).
// Shield at 5th block (idx 4).
// Beast at 10th block (idx 9).
// Player must equip items and stop at the 7th block (idx 6), exactly 3 tiles before the beast.
export const level2: LevelDefinition = {
  id: 'level_02',
  name: "The Beast's Lair",
  length: 10,
  playerStartX: 0,
  tiles: [
    G, G, SWORD, G, SHIELD, G, G, G, G, X
  ],
  beast: {
    positionIndex: 9,
    hp: 4,
    vulnerablePattern: [true, false, false, true, true, false, true]
  }
};
