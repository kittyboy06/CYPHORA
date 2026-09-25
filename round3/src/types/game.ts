export type CommandType = 'RUN' | 'JUMP' | 'ATTACK' | 'DEFEND' | 'ACTIVATE_TOTEM';

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
    vulnerablePattern: boolean[]; // e.g. [false, false, true] means Shielded, Shielded, Vulnerable
  };
}
