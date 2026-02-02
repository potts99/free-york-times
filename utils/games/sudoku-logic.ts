import { CellValue, SudokuCell, SudokuGrid, SudokuPuzzle } from '@/types/games/sudoku';

export type SudokuDifficulty = 'easy' | 'medium' | 'hard';

export function createGridFromPuzzle(puzzle: SudokuPuzzle): SudokuGrid {
  return puzzle.initial.map((row) =>
    row.map((value) => ({
      value: value as CellValue,
      isGiven: value !== null,
      notes: new Set<number>(),
      isError: false,
    }))
  );
}

export function isValidPlacement(
  grid: SudokuGrid,
  row: number,
  col: number,
  value: number
): boolean {
  // Check row
  for (let c = 0; c < 9; c++) {
    if (c !== col && grid[row][c].value === value) {
      return false;
    }
  }

  // Check column
  for (let r = 0; r < 9; r++) {
    if (r !== row && grid[r][col].value === value) {
      return false;
    }
  }

  // Check 3x3 box
  const boxStartRow = Math.floor(row / 3) * 3;
  const boxStartCol = Math.floor(col / 3) * 3;
  for (let r = boxStartRow; r < boxStartRow + 3; r++) {
    for (let c = boxStartCol; c < boxStartCol + 3; c++) {
      if (r !== row && c !== col && grid[r][c].value === value) {
        return false;
      }
    }
  }

  return true;
}

export function checkForErrors(grid: SudokuGrid): SudokuGrid {
  const newGrid = grid.map((row) =>
    row.map((cell) => ({ ...cell, notes: new Set(cell.notes) }))
  );

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const cell = newGrid[row][col];
      if (cell.value !== null && !cell.isGiven) {
        cell.isError = !isValidPlacement(newGrid, row, col, cell.value);
      } else {
        cell.isError = false;
      }
    }
  }

  return newGrid;
}

export function isGridComplete(grid: SudokuGrid): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const cell = grid[row][col];
      if (cell.value === null || cell.isError) {
        return false;
      }
    }
  }
  return true;
}

export function isSolutionCorrect(grid: SudokuGrid, puzzle: SudokuPuzzle): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col].value !== puzzle.solution[row][col]) {
        return false;
      }
    }
  }
  return true;
}

export function getRelatedCells(row: number, col: number): { row: number; col: number }[] {
  const related: { row: number; col: number }[] = [];

  // Same row
  for (let c = 0; c < 9; c++) {
    if (c !== col) related.push({ row, col: c });
  }

  // Same column
  for (let r = 0; r < 9; r++) {
    if (r !== row) related.push({ row: r, col });
  }

  // Same 3x3 box
  const boxStartRow = Math.floor(row / 3) * 3;
  const boxStartCol = Math.floor(col / 3) * 3;
  for (let r = boxStartRow; r < boxStartRow + 3; r++) {
    for (let c = boxStartCol; c < boxStartCol + 3; c++) {
      if (r !== row && c !== col) {
        // Avoid duplicates from row/col
        const alreadyAdded = related.some((cell) => cell.row === r && cell.col === c);
        if (!alreadyAdded) {
          related.push({ row: r, col: c });
        }
      }
    }
  }

  return related;
}

export function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// ============================================
// Sudoku Puzzle Generator
// ============================================

type Grid = (number | null)[][];

/**
 * Check if placing a number at a position is valid (for generation)
 */
function isValidForGeneration(grid: Grid, row: number, col: number, num: number): boolean {
  // Check row
  for (let c = 0; c < 9; c++) {
    if (grid[row][c] === num) return false;
  }

  // Check column
  for (let r = 0; r < 9; r++) {
    if (grid[r][col] === num) return false;
  }

  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (grid[r][c] === num) return false;
    }
  }

  return true;
}

/**
 * Shuffle an array in place (Fisher-Yates)
 */
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Generate a complete solved Sudoku grid using backtracking
 */
function generateSolvedGrid(): number[][] {
  const grid: Grid = Array(9).fill(null).map(() => Array(9).fill(null));

  function solve(row: number, col: number): boolean {
    if (row === 9) return true;
    if (col === 9) return solve(row + 1, 0);
    if (grid[row][col] !== null) return solve(row, col + 1);

    const numbers = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    for (const num of numbers) {
      if (isValidForGeneration(grid, row, col, num)) {
        grid[row][col] = num;
        if (solve(row, col + 1)) return true;
        grid[row][col] = null;
      }
    }
    return false;
  }

  solve(0, 0);
  return grid as number[][];
}

/**
 * Count the number of solutions for a puzzle (stops at 2)
 */
function countSolutions(grid: Grid, limit: number = 2): number {
  let count = 0;

  function solve(row: number, col: number): boolean {
    if (count >= limit) return true;
    if (row === 9) {
      count++;
      return count >= limit;
    }
    if (col === 9) return solve(row + 1, 0);
    if (grid[row][col] !== null) return solve(row, col + 1);

    for (let num = 1; num <= 9; num++) {
      if (isValidForGeneration(grid, row, col, num)) {
        grid[row][col] = num;
        if (solve(row, col + 1) && count >= limit) {
          grid[row][col] = null;
          return true;
        }
        grid[row][col] = null;
      }
    }
    return false;
  }

  solve(0, 0);
  return count;
}

/**
 * Create a puzzle by removing cells from a solved grid
 * while ensuring unique solution
 */
function createPuzzleFromSolution(
  solution: number[][],
  difficulty: 'easy' | 'medium' | 'hard'
): (number | null)[][] {
  // Target number of cells to remove based on difficulty
  const targetRemoval = {
    easy: 35,    // ~46 given cells
    medium: 45,  // ~36 given cells
    hard: 55,    // ~26 given cells
  };

  const puzzle: Grid = solution.map(row => [...row]);
  const positions = shuffle(
    Array.from({ length: 81 }, (_, i) => ({ row: Math.floor(i / 9), col: i % 9 }))
  );

  let removed = 0;
  const target = targetRemoval[difficulty];

  for (const { row, col } of positions) {
    if (removed >= target) break;

    const backup = puzzle[row][col];
    puzzle[row][col] = null;

    // Check if puzzle still has unique solution
    const testGrid = puzzle.map(r => [...r]);
    if (countSolutions(testGrid, 2) !== 1) {
      // Multiple solutions, restore the cell
      puzzle[row][col] = backup;
    } else {
      removed++;
    }
  }

  return puzzle;
}

/**
 * Generate a new Sudoku puzzle with the specified difficulty
 */
export function generateSudokuPuzzle(
  difficulty: SudokuDifficulty = 'medium'
): SudokuPuzzle {
  const solution = generateSolvedGrid();
  const initial = createPuzzleFromSolution(solution, difficulty);

  return {
    id: `generated-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    date: new Date().toISOString().split('T')[0],
    difficulty,
    initial: initial as CellValue[][],
    solution,
  };
}
