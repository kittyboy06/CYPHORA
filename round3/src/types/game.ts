export type CommandType = 'RUN' | 'JUMP';

export interface Command {
  type: CommandType;
}

export enum TileType {
  EMPTY = 0,
  GROUND = 1,
  TRAP = 2,
  GOAL = 3,
}

export interface LevelDefinition {
  id: string;
  name: string;
  length: number;
  playerStartX: number;
  tiles: TileType[]; // 1D array for side-scroller floor
}
