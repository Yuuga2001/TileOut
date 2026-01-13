# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TileOut (タイルアウト) is a 2-player strategic board game built with React and TypeScript. Players slide tiles on a 10x10 board to create connections and eliminate opponent tiles. Black player can only move columns vertically, white player can only move rows horizontally.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
tsc && vite build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## Core Game Architecture

### Game Rules & Win Conditions
- **Board**: 10x10 grid, initially checkerboard pattern (50 black, 50 white tiles)
- **Movement constraints**: Black player moves columns only (up/down), white player moves rows only (left/right)
- **Tile removal**: Isolated tiles (no adjacent tiles in any direction) are automatically removed after each move
- **Victory conditions**:
  1. Connect 10 tiles of your color (checked via DFS in `findMaxConnection`)
  2. Reduce opponent below 10 tiles
  3. If both below 10 tiles: player with larger max connection wins (or draw if equal)

### Code Structure

**[types.ts](src/types.ts)** - Type definitions for the entire game
- `GameState`: Central state object containing board, player, counts, and status
- `Move`: Represents a player action (row/column, index, direction)
- `Player`, `TileColor`, `Direction`, `GameMode`, `GameStatus` enums

**[gameLogic.ts](src/gameLogic.ts)** - Pure game mechanics
- `createInitialGameState()`: Initialize game with mode (ai/twoPlayer)
- `makeMove()`: Immutably applies a move and returns new state
  - Slides row/column
  - Removes isolated tiles
  - Recalculates counts and max connections
  - Checks win conditions
- `slideRow()` / `slideColumn()`: Circular shift implementation
- `removeIsolatedTiles()`: Uses `isIsolated()` to find and remove tiles with no adjacent tiles
- `findMaxConnection()`: DFS-based connected component search
- `getValidMoves()`: Returns all legal moves for current player based on movement constraints

**[aiLogic.ts](src/aiLogic.ts)** - AI opponent (white player in AI mode)
- `getAIMove()`: Greedy evaluation of all valid moves
- `evaluateMove()`: Heuristic scoring based on:
  - Immediate win/loss detection
  - Max connection difference (100x weight)
  - Tile count difference (10x weight)
  - Opponent tiles removed (50x weight)
  - Small random factor for variety

**[App.tsx](src/App.tsx)** - React UI and game orchestration
- Manages `GameState` with React hooks
- Handles user input via directional buttons around board
- Implements 600ms animation delay for moves
- Auto-triggers AI moves when white player's turn in AI mode
- Displays game status, player info, and win/restart overlay

### Key Implementation Details

1. **Immutable state updates**: `makeMove()` always returns a new state object, never mutates input
2. **Move validation**: `canPlayerMove()` enforces movement constraints (black=columns, white=rows)
3. **Tile isolation check**: A tile is isolated if all 4 adjacent cells are null/out-of-bounds
4. **Connection detection**: Uses DFS with visited tracking to find largest connected component per player
5. **Animation state**: `isAnimating` flag prevents move spam during transitions

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build tool**: Vite 5
- **Linting**: ESLint with TypeScript, React hooks, and React refresh plugins
- **Styling**: CSS (App.css)
