import { LevelDefinition, TileType } from '../types/game';

// 🟦 → 🟦 → 🟥 → 🟦 → 🟨 → 🟥 → 🟦 → 🟥 → 🟨
// B, B, R, B, G, R, B, R, G, X

export const level3: LevelDefinition = {
  id: 'level_03',
  name: 'The Ancient Colour Cipher',
  length: 10,
  playerStartX: 0,
  tiles: [
    TileType.COLOR_GOLD,
    TileType.COLOR_RED,
    TileType.COLOR_BLUE,
    TileType.COLOR_GOLD,
    TileType.COLOR_RED,
    TileType.COLOR_BLUE,
    TileType.COLOR_RED,
    TileType.COLOR_GOLD,
    TileType.COLOR_BLUE,
    TileType.GOAL
  ]
};
