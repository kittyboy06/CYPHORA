import { LevelDefinition, TileType } from '../types/game';

const G = TileType.GROUND;
const FIRE = TileType.FIRE;
const GOBLIN = TileType.GOBLIN;
const T_FIRE = TileType.TOTEM_FIRE;
const T_GOBLIN = TileType.TOTEM_GOBLIN;
const T_FINAL = TileType.TOTEM_FINAL;

// Track pattern for 14 loop iterations.
// The JUMP command advances the player by 2 tiles (skipping the fire).
// RUN and ATTACK advance by 1 tile.
// The track has exactly 17 elements so that at i=14, the player lands on the element AFTER the track (the Totem).
const track = [
  G, G,       // i=1,2 (RUN, RUN) -> indices 1, 2
  FIRE, G,    // i=3 (JUMP over pit) -> lands on 4
  G,          // i=4 (RUN) -> index 5
  GOBLIN,     // i=5 (ATTACK) -> index 6
  FIRE, G,    // i=6 (JUMP over pit) -> lands on 8
  G, G,       // i=7,8 (RUN, RUN) -> indices 9, 10
  FIRE, G,    // i=9 (JUMP over pit) -> lands on 12
  GOBLIN,     // i=10 (ATTACK) -> index 13
  G,          // i=11 (RUN) -> index 14
  FIRE, G,    // i=12 (JUMP over pit) -> lands on 16
  G           // i=13 (RUN) -> index 17
];

// i=14 (RUN) will advance from index 17 to index 18, which is where the Totem is!
const zone1 = [...track, T_FIRE];
const zone2 = [...track, T_GOBLIN];
const zone3 = [...track, T_FINAL];

export const level4: LevelDefinition = {
  id: 'level_04',
  name: 'The Path of Trials',
  length: 55, // 1 (start) + 18 + 18 + 18
  playerStartX: 0,
  tiles: [G, ...zone1, ...zone2, ...zone3],
};
