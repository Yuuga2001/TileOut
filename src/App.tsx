import { useState, useEffect } from 'react';
import './App.css';
import { GameState, GameMode, Move, Direction, Position, TileColor } from './types';
import { createInitialGameState, makeMove, canPlayerMove, getWinningTiles } from './gameLogic';
import { getAIMove } from './aiLogic';

const BOARD_SIZE = 8;

function App() {
  const [gameState, setGameState] = useState<GameState>(createInitialGameState('twoPlayer'));
  const [selectedMode, setSelectedMode] = useState<GameMode>('twoPlayer');
  const [isAnimating, setIsAnimating] = useState(false);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);
  const [animatingMove, setAnimatingMove] = useState<Move | null>(null);
  const [previousBoard, setPreviousBoard] = useState<TileColor[][] | null>(null);
  const [animationStarted, setAnimationStarted] = useState(false);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [selectedCol, setSelectedCol] = useState<number | null>(null);

  useEffect(() => {
    if (
      gameState.mode === 'ai' &&
      gameState.currentPlayer === 'white' &&
      gameState.status === 'playing' &&
      !isAnimating
    ) {
      const timer = setTimeout(() => {
        handleAIMove();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [gameState, isAnimating]);

  // アニメーション開始時にスタイルをリセット
  useEffect(() => {
    if (animatingMove && previousBoard && !animationStarted) {
      // 次のフレームでアニメーションを開始
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimationStarted(true);
        });
      });
    }
  }, [animatingMove, previousBoard, animationStarted]);

  const handleModeChange = (mode: GameMode) => {
    setSelectedMode(mode);
    setGameState(createInitialGameState(mode));
  };

  const handleMove = (move: Move) => {
    if (isAnimating || gameState.status !== 'playing') return;
    if (!canPlayerMove(gameState.currentPlayer, move.type)) return;

    // 新しい状態を先に計算
    const newState = makeMove(gameState, move);

    // 現在の盤面を保存し、新しい状態をセット
    setPreviousBoard(gameState.board.map(row => [...row]));
    setGameState(newState);
    setIsAnimating(true);
    setAnimatingMove(move);
    setAnimationStarted(false);
    setSelectedRow(null);
    setSelectedCol(null);

    // アニメーション完了後にクリーンアップ
    setTimeout(() => {
      setIsAnimating(false);
      setAnimatingMove(null);
      setPreviousBoard(null);
      setAnimationStarted(false);
    }, 1000);
  };

  const handleAIMove = () => {
    if (gameState.status !== 'playing') return;

    const move = getAIMove(gameState);

    // 新しい状態を先に計算
    const newState = makeMove(gameState, move);

    // 現在の盤面を保存し、新しい状態をセット
    setPreviousBoard(gameState.board.map(row => [...row]));
    setGameState(newState);
    setIsAnimating(true);
    setAnimatingMove(move);
    setAnimationStarted(false);

    // アニメーション完了後にクリーンアップ
    setTimeout(() => {
      setIsAnimating(false);
      setAnimatingMove(null);
      setPreviousBoard(null);
      setAnimationStarted(false);
    }, 1000);
  };

  const handleRestart = () => {
    setGameState(createInitialGameState(selectedMode));
  };

  const handleRowMove = (rowIndex: number, direction: 'left' | 'right') => {
    handleMove({
      player: gameState.currentPlayer,
      type: 'row',
      index: rowIndex,
      direction,
    });
  };

  const handleColMove = (colIndex: number, direction: 'up' | 'down') => {
    handleMove({
      player: gameState.currentPlayer,
      type: 'column',
      index: colIndex,
      direction,
    });
  };

  const getStatusText = () => {
    switch (gameState.status) {
      case 'blackWin':
        return '黒の勝利！';
      case 'whiteWin':
        return '白の勝利！';
      case 'draw':
        return '引き分け！';
      default:
        return '';
    }
  };

  const getStatusClass = () => {
    switch (gameState.status) {
      case 'blackWin':
        return 'black-win';
      case 'whiteWin':
        return 'white-win';
      case 'draw':
        return 'draw';
      default:
        return '';
    }
  };

  const getWinningTilesPositions = (): Position[] => {
    if (gameState.status === 'blackWin') {
      return getWinningTiles(gameState.board, 'black');
    } else if (gameState.status === 'whiteWin') {
      return getWinningTiles(gameState.board, 'white');
    }
    return [];
  };

  const isWinningTile = (row: number, col: number): boolean => {
    const winningTiles = getWinningTilesPositions();
    return winningTiles.some(pos => pos.row === row && pos.col === col);
  };

  const handleTileClick = (row: number, col: number) => {
    if (isAnimating || gameState.status !== 'playing') return;

    // 既に同じタイルが選択されている場合、スライドを実行
    if (gameState.currentPlayer === 'black' && selectedCol === col) {
      handleColMove(col, 'up');
      setSelectedCol(null);
      setSelectedRow(null);
    } else if (gameState.currentPlayer === 'white' && selectedRow === row) {
      handleRowMove(row, 'right');
      setSelectedCol(null);
      setSelectedRow(null);
    } else {
      // まだ選択されていない場合、選択状態にする
      if (gameState.currentPlayer === 'black') {
        setSelectedCol(col);
        setSelectedRow(null);
      } else {
        setSelectedRow(row);
        setSelectedCol(null);
      }
    }
  };

  const handleTileHover = (row: number, col: number) => {
    if (isAnimating || gameState.status !== 'playing') return;

    if (gameState.currentPlayer === 'black') {
      setHoveredCol(col);
      setHoveredRow(null);
    } else {
      setHoveredRow(row);
      setHoveredCol(null);
    }
  };

  const handleTileLeave = () => {
    setHoveredRow(null);
    setHoveredCol(null);
  };

  const isInHoveredLine = (row: number, col: number): boolean => {
    if (gameState.currentPlayer === 'black') {
      return hoveredCol === col;
    } else {
      return hoveredRow === row;
    }
  };

  const isInSelectedLine = (row: number, col: number): boolean => {
    if (gameState.currentPlayer === 'black') {
      return selectedCol === col;
    } else {
      return selectedRow === row;
    }
  };

  // 各タイルの移動元の位置を計算
  const getPreviousPosition = (row: number, col: number): {row: number, col: number} | null => {
    if (!animatingMove || !previousBoard) return null;

    const move = animatingMove;
    const currentTile = gameState.board[row][col];

    if (currentTile === null) return null;

    // このタイルがスライド対象の列/行にある場合
    const isInAnimatingLine =
      (move.type === 'column' && move.index === col) ||
      (move.type === 'row' && move.index === row);

    if (!isInAnimatingLine) return null;

    // 移動元の位置を計算（削除処理前の位置なので単純に1つずらす）
    if (move.type === 'column') {
      if (move.direction === 'up') {
        // 上にスライドした場合、1つ下から来た（ただし一番下は一番上から）
        const prevRow = row === BOARD_SIZE - 1 ? 0 : row + 1;
        return { row: prevRow, col };
      } else {
        // 下にスライドした場合、1つ上から来た（ただし一番上は一番下から）
        const prevRow = row === 0 ? BOARD_SIZE - 1 : row - 1;
        return { row: prevRow, col };
      }
    } else {
      if (move.direction === 'right') {
        // 右にスライドした場合、1つ左から来た（ただし一番左は一番右から）
        const prevCol = col === 0 ? BOARD_SIZE - 1 : col - 1;
        return { row, col: prevCol };
      } else {
        // 左にスライドした場合、1つ右から来た（ただし一番右は一番左から）
        const prevCol = col === BOARD_SIZE - 1 ? 0 : col + 1;
        return { row, col: prevCol };
      }
    }
  };

  const getTileStyle = (row: number, col: number): React.CSSProperties => {
    const prevPos = getPreviousPosition(row, col);
    if (!prevPos || !animatingMove) return {};

    const rowDiff = prevPos.row - row;
    const colDiff = prevPos.col - col;

    // 循環を考慮した差分計算
    let translateY = 0;
    let translateX = 0;

    if (animatingMove.type === 'column') {
      // 縦方向の移動
      if (Math.abs(rowDiff) > BOARD_SIZE / 2) {
        // 循環している場合（例：0行目から7行目へ = 下から上へ回り込み）
        translateY = rowDiff > 0 ? -100 : 100;
      } else {
        translateY = rowDiff * 100;
      }
    } else {
      // 横方向の移動
      if (Math.abs(colDiff) > BOARD_SIZE / 2) {
        // 循環している場合
        translateX = colDiff > 0 ? -100 : 100;
      } else {
        translateX = colDiff * 100;
      }
    }

    // アニメーション開始前は元の位置、開始後は最終位置へ移動
    if (!animationStarted) {
      return {
        transform: `translate(${translateX}%, ${translateY}%)`,
        transition: 'none',
      };
    } else {
      return {
        transform: 'translate(0%, 0%)',
        transition: 'transform 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      };
    }
  };

  return (
    <div className="app">
      {gameState.status !== 'playing' && (
        <div className={`victory-banner ${getStatusClass()}`}>
          <div className="victory-banner-content">
            <h2 className="victory-title">{getStatusText()}</h2>
            <div className="victory-stats">
              黒の最大連結: {gameState.blackMaxConnection} | 白の最大連結: {gameState.whiteMaxConnection}
            </div>
            <button className="restart-button-small" onClick={handleRestart}>
              もう一度プレイ
            </button>
          </div>
        </div>
      )}
      <div className="game-container">
        <div className="game-header">
          <h1 className="game-title">Tile Out</h1>
          <p className="game-subtitle">タイルアウト - 戦略ボードゲーム</p>
        </div>

        <div className="mode-selector">
          <button
            className={`mode-button ${selectedMode === 'twoPlayer' ? 'active' : ''}`}
            onClick={() => handleModeChange('twoPlayer')}
          >
            ふたりで対戦
          </button>
          <button
            className={`mode-button ${selectedMode === 'ai' ? 'active' : ''}`}
            onClick={() => handleModeChange('ai')}
          >
            AI対戦
          </button>
        </div>

        <div className="game-info">
          <div className={`player-info ${gameState.currentPlayer === 'black' ? 'active' : ''}`}>
            <div className="player-name">⚫ 黒プレイヤー</div>
            <div className="player-stats">
              <div>最大連結: {gameState.blackMaxConnection}</div>
              <div>操作: タイルをクリックして列を上へ</div>
            </div>
          </div>
          <div className={`player-info ${gameState.currentPlayer === 'white' ? 'active' : ''}`}>
            <div className="player-name">⚪ 白プレイヤー</div>
            <div className="player-stats">
              <div>最大連結: {gameState.whiteMaxConnection}</div>
              <div>操作: タイルをクリックして行を右へ</div>
            </div>
          </div>
        </div>

        <div className="board-wrapper">
          <div className="board">
            {gameState.board.map((row, rowIndex) =>
              row.map((tile, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`tile ${tile === 'black' ? 'black' : tile === 'white' ? 'white' : 'empty'} ${
                    isWinningTile(rowIndex, colIndex) ? 'winning' : ''
                  } ${gameState.status === 'playing' && !isAnimating ? 'clickable' : ''} ${
                    isInSelectedLine(rowIndex, colIndex)
                      ? `selected-line ${gameState.currentPlayer === 'black' ? 'black-player' : 'white-player'}`
                      : isInHoveredLine(rowIndex, colIndex) ? 'hovered-line' : ''
                  }`}
                  style={getTileStyle(rowIndex, colIndex)}
                  onClick={() => handleTileClick(rowIndex, colIndex)}
                  onMouseEnter={() => handleTileHover(rowIndex, colIndex)}
                  onMouseLeave={handleTileLeave}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
