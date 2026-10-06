import { LevelDefinition, TileType } from '../types/game';

const G = TileType.GROUND;
const FIRE = TileType.FIRE;
const GOBLIN = TileType.GOBLIN;
const T_FIRE = TileType.TOTEM_FIRE;
const T_GOBLIN = TileType.TOTEM_GOBLIN;
const T_FINAL = TileType.TOTEM_FINAL;

// Fourteen action steps cover this 17-tile track before its totem.
const track = [
  G, G,
  FIRE, G,
  G,
  GOBLIN,
  FIRE, G,
  G, G,
  FIRE, G,
  GOBLIN,
  G,
  FIRE, G,
  G,
];

const zone1 = [...track, T_FIRE];
const zone2 = [...track, T_GOBLIN];
const zone3 = [...track, T_FINAL];

export const level3: LevelDefinition = {
  id: 'level_03',
  name: 'The Path of Trials',
  length: 55,
  playerStartX: 0,
  tiles: [G, ...zone1, ...zone2, ...zone3],
};
