export type CommandType = 'RUN' | 'JUMP' | 'ATTACK' | 'DEFEND' | 'ACTIVATE_TOTEM' | 'DODGE' | 'SLIDE' | 'ACTIVATE_TILE' | 'EQUIP';

export interface Command {
  type: CommandType;
}

export enum TileType {
  EMPTY = 0,
  GROUND = 1,
  TRAP = 2,
  GOAL = 3,
  FIRE = 4,
  GOBLIN = 5,
  TOTEM_FIRE = 6,
  TOTEM_GOBLIN = 7,
  TOTEM_FINAL = 8,
  COLOR_RED = 9,
  COLOR_BLUE = 10,
  COLOR_GOLD = 11,
  ITEM_SWORD = 12,
  ITEM_SHIELD = 13,
}

export interface LevelDefinition {
  id: string;
  name: string;
  length: number;
  playerStartX: number;
  tiles: TileType[]; // 1D array for side-scroller floor
  beast?: {
    positionIndex: number;
    hp: number;
    vulnerablePattern: boolean[]; // Used by the legacy backup scene.
  };
}
