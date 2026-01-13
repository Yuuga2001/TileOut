export type TileColor = 'black' | 'white' | null;

export type Player = 'black' | 'white';

export type Direction = 'up' | 'down' | 'left' | 'right';

export type GameMode = 'ai' | 'twoPlayer';

export type GameStatus = 'playing' | 'blackWin' | 'whiteWin' | 'draw';

export interface Position {
  row: number;
  col: number;
}

export interface GameState {
  board: TileColor[][];
  currentPlayer: Player;
  status: GameStatus;
  mode: GameMode;
  blackTileCount: number;
  whiteTileCount: number;
  blackMaxConnection: number;
  whiteMaxConnection: number;
}

export interface Move {
  player: Player;
  type: 'row' | 'column';
  index: number;
  direction: Direction;
}
