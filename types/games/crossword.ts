import type { GameStatus } from './common';

export type ClueDirection = 'across' | 'down';

export interface CrosswordCell {
  letter: string | null;
  number?: number;
  isBlack: boolean;
}

export interface Clue {
  number: number;
  text: string;
  answer: string;
  startRow: number;
  startCol: number;
  length: number;
  direction: ClueDirection;
}

export interface CrosswordPuzzle {
  id: string;
  date: string;
  title?: string;
  author?: string;
  size: { rows: number; cols: number };
  grid: CrosswordCell[][];
  clues: {
    across: Clue[];
    down: Clue[];
  };
}

export interface CrosswordGameState {
  puzzle: CrosswordPuzzle;
  userGrid: string[][];
  selectedCell: { row: number; col: number } | null;
  direction: ClueDirection;
  revealedCells: string[];
  checkedCells: Record<string, boolean>;
  gameStatus: GameStatus;
  startTime: number;
  elapsedTime: number;
}

export interface CrosswordStats {
  puzzlesCompleted: number;
  averageTime: number;
  bestTime: number;
}
