import { LevelDefinition, TileType } from '../types/game';

const G = TileType.GROUND;
const X = TileType.GOAL;

// The Beast's Lair:
// Player stands on solid ground. The beast is in front of them.
// The beast pattern is: Shielded, Shielded, Vulnerable (false, false, true).
// The beast has 3 HP.
// Goal is right behind the beast, but the beast must be defeated first.
export const level2: LevelDefinition = {
  id: 'level_02',
  name: "The Beast's Lair",
  length: 10,
  playerStartX: 2,
  tiles: [
    G, G, G, G, G, G, G, G, G, X
  ],
  beast: {
    positionIndex: 6,
    hp: 3,
    vulnerablePattern: [false, false, true] // Shield, Shield, Drop Shield
  }
};
