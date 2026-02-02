export type CellValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | null;

export interface SudokuCell {
  value: CellValue;
  isGiven: boolean; // Pre-filled cells that can't be changed
  notes: Set<number>; // Pencil marks
  isError: boolean;
}

export type SudokuGrid = SudokuCell[][];

export interface SudokuPuzzle {
  id: string;
  date: string;
  difficulty: 'easy' | 'medium' | 'hard';
  initial: (CellValue)[][]; // 9x9 grid, null for empty cells
  solution: number[][]; // 9x9 grid with all values filled
}

export interface SudokuGameState {
  puzzle: SudokuPuzzle;
  grid: SudokuGrid;
  selectedCell: { row: number; col: number } | null;
  isNotesMode: boolean;
  isComplete: boolean;
  startTime: number;
  endTime: number | null;
  mistakes: number;
}
