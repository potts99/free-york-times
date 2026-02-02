import type { CrosswordPuzzle, Clue, ClueDirection } from '@/types/games';

/**
 * Get cells that belong to a word starting at a given position
 */
export function getWordCells(
  puzzle: CrosswordPuzzle,
  row: number,
  col: number,
  direction: ClueDirection
): Array<{ row: number; col: number }> {
  const cells: Array<{ row: number; col: number }> = [];
  let r = row;
  let c = col;

  while (
    r >= 0 &&
    r < puzzle.size.rows &&
    c >= 0 &&
    c < puzzle.size.cols &&
    !puzzle.grid[r][c].isBlack
  ) {
    cells.push({ row: r, col: c });
    if (direction === 'across') {
      c++;
    } else {
      r++;
    }
  }

  return cells;
}

/**
 * Find the clue that a cell belongs to in a given direction
 */
export function findClueForCell(
  puzzle: CrosswordPuzzle,
  row: number,
  col: number,
  direction: ClueDirection
): Clue | null {
  const clues = puzzle.clues[direction];

  for (const clue of clues) {
    const cells = getWordCells(puzzle, clue.startRow, clue.startCol, direction);
    const belongsToClue = cells.some((c) => c.row === row && c.col === col);
    if (belongsToClue) {
      return clue;
    }
  }

  return null;
}

/**
 * Get the starting cell of the word containing a given cell
 */
export function getWordStart(
  puzzle: CrosswordPuzzle,
  row: number,
  col: number,
  direction: ClueDirection
): { row: number; col: number } {
  let r = row;
  let c = col;

  if (direction === 'across') {
    while (c > 0 && !puzzle.grid[r][c - 1].isBlack) {
      c--;
    }
  } else {
    while (r > 0 && !puzzle.grid[r - 1][c].isBlack) {
      r--;
    }
  }

  return { row: r, col: c };
}

/**
 * Get the next cell in a direction
 */
export function getNextCell(
  puzzle: CrosswordPuzzle,
  row: number,
  col: number,
  direction: ClueDirection
): { row: number; col: number } | null {
  let r = row;
  let c = col;

  if (direction === 'across') {
    c++;
    if (c >= puzzle.size.cols || puzzle.grid[r][c].isBlack) {
      return null;
    }
  } else {
    r++;
    if (r >= puzzle.size.rows || puzzle.grid[r][c].isBlack) {
      return null;
    }
  }

  return { row: r, col: c };
}

/**
 * Get the previous cell in a direction
 */
export function getPrevCell(
  puzzle: CrosswordPuzzle,
  row: number,
  col: number,
  direction: ClueDirection
): { row: number; col: number } | null {
  let r = row;
  let c = col;

  if (direction === 'across') {
    c--;
    if (c < 0 || puzzle.grid[r][c].isBlack) {
      return null;
    }
  } else {
    r--;
    if (r < 0 || puzzle.grid[r][c].isBlack) {
      return null;
    }
  }

  return { row: r, col: c };
}

/**
 * Check if a word is complete and correct
 */
export function checkWord(
  puzzle: CrosswordPuzzle,
  userGrid: string[][],
  clue: Clue
): boolean {
  const cells = getWordCells(puzzle, clue.startRow, clue.startCol, clue.direction);

  for (let i = 0; i < cells.length; i++) {
    const { row, col } = cells[i];
    const userLetter = userGrid[row][col];
    const correctLetter = puzzle.grid[row][col].letter;

    if (!userLetter || userLetter !== correctLetter) {
      return false;
    }
  }

  return true;
}

/**
 * Check if the entire puzzle is complete
 */
export function isPuzzleComplete(
  puzzle: CrosswordPuzzle,
  userGrid: string[][]
): boolean {
  for (let r = 0; r < puzzle.size.rows; r++) {
    for (let c = 0; c < puzzle.size.cols; c++) {
      const cell = puzzle.grid[r][c];
      if (!cell.isBlack) {
        if (userGrid[r][c] !== cell.letter) {
          return false;
        }
      }
    }
  }
  return true;
}

/**
 * Create an empty user grid
 */
export function createEmptyGrid(rows: number, cols: number): string[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => '')
  );
}
