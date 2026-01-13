import { TileColor, Player, GameState, Move, Position, GameStatus } from './types';

const BOARD_SIZE = 8;
const WIN_CONNECTION = 10;
const MIN_TILES = 8;

export function createInitialBoard(): TileColor[][] {
  const board: TileColor[][] = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    board[row] = [];
    for (let col = 0; col < BOARD_SIZE; col++) {
      board[row][col] = (row + col) % 2 === 0 ? 'black' : 'white';
    }
  }
  return board;
}

export function createInitialGameState(mode: 'ai' | 'twoPlayer'): GameState {
  return {
    board: createInitialBoard(),
    currentPlayer: 'black',
    status: 'playing',
    mode,
    blackTileCount: 32,
    whiteTileCount: 32,
    blackMaxConnection: 0,
    whiteMaxConnection: 0,
  };
}

export function makeMove(state: GameState, move: Move): GameState {
  const newBoard = state.board.map(row => [...row]);

  if (move.type === 'column') {
    slideColumn(newBoard, move.index, move.direction as 'up' | 'down');
  } else {
    slideRow(newBoard, move.index, move.direction as 'left' | 'right');
  }

  removeIsolatedTiles(newBoard);

  const blackCount = countTiles(newBoard, 'black');
  const whiteCount = countTiles(newBoard, 'white');
  const blackMaxConn = findMaxConnection(newBoard, 'black');
  const whiteMaxConn = findMaxConnection(newBoard, 'white');

  const status = checkGameStatus(blackCount, whiteCount, blackMaxConn, whiteMaxConn);

  return {
    ...state,
    board: newBoard,
    currentPlayer: state.currentPlayer === 'black' ? 'white' : 'black',
    status,
    blackTileCount: blackCount,
    whiteTileCount: whiteCount,
    blackMaxConnection: blackMaxConn,
    whiteMaxConnection: whiteMaxConn,
  };
}

function slideColumn(board: TileColor[][], col: number, direction: 'up' | 'down'): void {
  const column: TileColor[] = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    column.push(board[row][col]);
  }

  if (direction === 'up') {
    column.shift()!;
    // 一番下に新しいタイルを配置（その上のタイルと異なる色）
    const aboveTile = column[column.length - 1];
    const newTile = aboveTile === 'black' ? 'white' : 'black';
    column.push(newTile);
  } else {
    column.pop()!;
    // 一番上に新しいタイルを配置（その下のタイルと異なる色）
    const belowTile = column[0];
    const newTile = belowTile === 'black' ? 'white' : 'black';
    column.unshift(newTile);
  }

  for (let row = 0; row < BOARD_SIZE; row++) {
    board[row][col] = column[row];
  }
}

function slideRow(board: TileColor[][], row: number, direction: 'left' | 'right'): void {
  if (direction === 'left') {
    board[row].shift()!;
    // 一番右に新しいタイルを配置（その左のタイルと異なる色）
    const leftTile = board[row][board[row].length - 1];
    const newTile = leftTile === 'black' ? 'white' : 'black';
    board[row].push(newTile);
  } else {
    board[row].pop()!;
    // 一番左に新しいタイルを配置（その右のタイルと異なる色）
    const rightTile = board[row][0];
    const newTile = rightTile === 'black' ? 'white' : 'black';
    board[row].unshift(newTile);
  }
}

function removeIsolatedTiles(board: TileColor[][]): void {
  const toRemove: Position[] = [];

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] !== null && isIsolated(board, row, col)) {
        toRemove.push({ row, col });
      }
    }
  }

  for (const pos of toRemove) {
    board[pos.row][pos.col] = null;
  }
}

function isIsolated(board: TileColor[][], row: number, col: number): boolean {
  const directions = [
    { dr: -1, dc: 0 },
    { dr: 1, dc: 0 },
    { dr: 0, dc: -1 },
    { dr: 0, dc: 1 },
  ];

  for (const { dr, dc } of directions) {
    const newRow = row + dr;
    const newCol = col + dc;
    if (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE) {
      if (board[newRow][newCol] !== null) {
        return false;
      }
    }
  }

  return true;
}

function countTiles(board: TileColor[][], color: Player): number {
  let count = 0;
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] === color) {
        count++;
      }
    }
  }
  return count;
}

function findMaxConnection(board: TileColor[][], color: Player): number {
  const visited: boolean[][] = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(false));
  let maxConnection = 0;

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] === color && !visited[row][col]) {
        const connection = dfs(board, visited, row, col, color);
        maxConnection = Math.max(maxConnection, connection);
      }
    }
  }

  return maxConnection;
}

function dfs(board: TileColor[][], visited: boolean[][], row: number, col: number, color: Player): number {
  if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) {
    return 0;
  }
  if (visited[row][col] || board[row][col] !== color) {
    return 0;
  }

  visited[row][col] = true;
  let count = 1;

  count += dfs(board, visited, row - 1, col, color);
  count += dfs(board, visited, row + 1, col, color);
  count += dfs(board, visited, row, col - 1, color);
  count += dfs(board, visited, row, col + 1, color);

  return count;
}

function checkGameStatus(
  blackCount: number,
  whiteCount: number,
  blackMaxConn: number,
  whiteMaxConn: number
): GameStatus {
  if (blackMaxConn >= WIN_CONNECTION) {
    return 'blackWin';
  }
  if (whiteMaxConn >= WIN_CONNECTION) {
    return 'whiteWin';
  }

  if (blackCount < MIN_TILES && whiteCount < MIN_TILES) {
    if (blackMaxConn > whiteMaxConn) {
      return 'blackWin';
    } else if (whiteMaxConn > blackMaxConn) {
      return 'whiteWin';
    } else {
      return 'draw';
    }
  }

  if (blackCount < MIN_TILES) {
    return 'whiteWin';
  }
  if (whiteCount < MIN_TILES) {
    return 'blackWin';
  }

  return 'playing';
}

export function canPlayerMove(player: Player, moveType: 'row' | 'column'): boolean {
  if (player === 'black') {
    return moveType === 'column';
  } else {
    return moveType === 'row';
  }
}

export function getValidMoves(state: GameState): Move[] {
  const moves: Move[] = [];
  const player = state.currentPlayer;

  if (player === 'black') {
    // 黒プレイヤーは上方向のみ
    for (let col = 0; col < BOARD_SIZE; col++) {
      moves.push({ player, type: 'column', index: col, direction: 'up' });
    }
  } else {
    // 白プレイヤーは右方向のみ
    for (let row = 0; row < BOARD_SIZE; row++) {
      moves.push({ player, type: 'row', index: row, direction: 'right' });
    }
  }

  return moves;
}

export function getWinningTiles(board: TileColor[][], color: Player): Position[] {
  const visited: boolean[][] = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(false));
  let maxConnection = 0;
  let winningPositions: Position[] = [];

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] === color && !visited[row][col]) {
        const positions: Position[] = [];
        const connection = dfsCollectPositions(board, visited, row, col, color, positions);
        if (connection > maxConnection) {
          maxConnection = connection;
          winningPositions = positions;
        }
      }
    }
  }

  return maxConnection >= WIN_CONNECTION ? winningPositions : [];
}

function dfsCollectPositions(
  board: TileColor[][],
  visited: boolean[][],
  row: number,
  col: number,
  color: Player,
  positions: Position[]
): number {
  if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) {
    return 0;
  }
  if (visited[row][col] || board[row][col] !== color) {
    return 0;
  }

  visited[row][col] = true;
  positions.push({ row, col });
  let count = 1;

  count += dfsCollectPositions(board, visited, row - 1, col, color, positions);
  count += dfsCollectPositions(board, visited, row + 1, col, color, positions);
  count += dfsCollectPositions(board, visited, row, col - 1, color, positions);
  count += dfsCollectPositions(board, visited, row, col + 1, color, positions);

  return count;
}
