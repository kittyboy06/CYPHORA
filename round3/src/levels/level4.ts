import { LevelDefinition, TileType } from '../types/game';

const G = TileType.GROUND;
const FIRE = TileType.FIRE;
const GOBLIN = TileType.GOBLIN;
const T_FIRE = TileType.TOTEM_FIRE;
const T_GOBLIN = TileType.TOTEM_GOBLIN;
const T_FINAL = TileType.TOTEM_FINAL;

// Track pattern (14 tiles, 1-indexed for FizzBuzz):
// 3(FIRE), 5(GOBLIN), 6(FIRE), 9(FIRE), 10(GOBLIN), 12(FIRE). Rest are GROUND.
// Array: [G, G, FIRE, G, GOBLIN, FIRE, G, G, FIRE, GOBLIN, G, FIRE, G, G]
const track = [G, G, FIRE, G, GOBLIN, FIRE, G, G, FIRE, GOBLIN, G, FIRE, G, G];

const zone1 = [...track, T_FIRE];
const zone2 = [...track, T_GOBLIN];
const zone3 = [...track, T_FINAL];

export const level4: LevelDefinition = {
  id: 'level_04',
  name: 'The Path of Trials',
  length: 46, // 1 (start) + 3 * 15 (14 track + 1 totem)
  playerStartX: 0,
  tiles: [G, ...zone1, ...zone2, ...zone3],
};
