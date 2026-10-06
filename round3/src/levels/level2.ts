import { LevelDefinition, TileType } from '../types/game';

const G = TileType.GROUND;
const SWORD = TileType.ITEM_SWORD;
const SHIELD = TileType.ITEM_SHIELD;
const X = TileType.GOAL;
const BEAST_INDEX = 21;
const TILES = Array.from({ length: BEAST_INDEX + 1 }, (_, index) => {
  if (index === 2) return SWORD;
  if (index === 4) return SHIELD;
  if (index === BEAST_INDEX) return X;
  return G;
});

// The Beast's Lair:
// Sword at 3rd block (idx 2).
// Shield at 5th block (idx 4).
// Keep the beast beyond the starting camera view so the hero can collect both items
// before the guardian appears during the rightward camera pan.
export const level2: LevelDefinition = {
  id: 'level_02',
  name: "The Beast's Lair",
  length: TILES.length,
  playerStartX: 0,
  tiles: TILES,
  beast: {
    positionIndex: BEAST_INDEX,
    hp: 5,
    vulnerablePattern: [true, false, false, true, true, false, true]
  }
};
