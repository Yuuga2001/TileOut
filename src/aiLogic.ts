import { GameState, Move } from './types';
import { getValidMoves, makeMove } from './gameLogic';

export function getAIMove(state: GameState): Move {
  const validMoves = getValidMoves(state);

  let bestMove = validMoves[0];
  let bestScore = -Infinity;

  for (const move of validMoves) {
    const score = evaluateMove(state, move);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

function evaluateMove(state: GameState, move: Move): number {
  const newState = makeMove(state, move);

  if (newState.status === 'whiteWin') {
    return 10000;
  }
  if (newState.status === 'blackWin') {
    return -10000;
  }
  if (newState.status === 'draw') {
    return 0;
  }

  let score = 0;

  score += newState.whiteMaxConnection * 100;
  score -= newState.blackMaxConnection * 100;

  score += newState.whiteTileCount * 10;
  score -= newState.blackTileCount * 10;

  const tilesRemoved = (state.blackTileCount - newState.blackTileCount);
  score += tilesRemoved * 50;

  score += Math.random() * 10;

  return score;
}
