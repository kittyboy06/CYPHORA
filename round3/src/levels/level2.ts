import { LevelDefinition, TileType } from '../types/game';

const G = TileType.GROUND;
const SWORD = TileType.ITEM_SWORD;
const SHIELD = TileType.ITEM_SHIELD;
const X = TileType.GOAL;

// The Beast's Lair:
// Sword at 3rd block (idx 2).
// Shield at 5th block (idx 4).
// Beast at 10th block (idx 9).
// Player must equip items and stop at 8th block (idx 7) to attack safely.
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
    hp: 3,
    vulnerablePattern: [false, false, true] // Shield, Shield, Drop Shield
  }
};
