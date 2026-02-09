import { useState, useCallback, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SudokuGameState, SudokuGrid, CellValue } from '@/types/games/sudoku';
import {
  createGridFromPuzzle,
  checkForErrors,
  isGridComplete,
  isSolutionCorrect,
  generateSudokuPuzzle,
  SudokuDifficulty,
} from '@/utils/games/sudoku-logic';
import { useSettings } from '@/hooks/use-settings';
import type { GameType } from '@/types/games/streak';

const STORAGE_KEY = 'sudoku-game-state';
const MAX_HINTS = 3;

interface UseSudokuGameOptions {
  onGameComplete?: (gameType: GameType) => void;
}

export function useSudokuGame(options: UseSudokuGameOptions = {}) {
  const { onGameComplete } = options;
  const hasRecordedCompletion = useRef(false);
  const { settings } = useSettings();
  const [gameState, setGameState] = useState<SudokuGameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hintsUsed, setHintsUsed] = useState(0);

  const hintsRemaining = MAX_HINTS - hintsUsed;

  // Load game state
  useEffect(() => {
    loadGameState();
  }, []);

  const loadGameState = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Restore Set objects for notes
        parsed.grid = parsed.grid.map((row: any[]) =>
          row.map((cell: any) => ({
            ...cell,
            notes: new Set(cell.notes || []),
          }))
        );

        // Load saved game (either in progress or completed)
        setGameState(parsed);
        setHintsUsed(parsed.hintsUsed ?? 0);
        setIsLoading(false);
        return;
      }
    } catch (e) {
      console.error('Failed to load sudoku state:', e);
    }

    // Start new game with generated puzzle using default difficulty from settings
    const puzzle = generateSudokuPuzzle(settings.sudokuDifficulty);
    const newState: SudokuGameState = {
      puzzle,
      grid: createGridFromPuzzle(puzzle),
      selectedCell: null,
      isNotesMode: false,
      isComplete: false,
      startTime: Date.now(),
      endTime: null,
      mistakes: 0,
    };
    setGameState(newState);
    setIsLoading(false);
  };

  const saveGameState = async (state: SudokuGameState, hints?: number) => {
    try {
      // Convert Sets to arrays for JSON serialization
      const toSave = {
        ...state,
        hintsUsed: hints ?? hintsUsed,
        grid: state.grid.map((row) =>
          row.map((cell) => ({
            ...cell,
            notes: Array.from(cell.notes),
          }))
        ),
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {
      console.error('Failed to save sudoku state:', e);
    }
  };

  const selectCell = useCallback((row: number, col: number) => {
    setGameState((prev) => {
      if (!prev || prev.isComplete) return prev;
      const newState = { ...prev, selectedCell: { row, col } };
      return newState;
    });
  }, []);

  const enterNumber = useCallback((num: number) => {
    setGameState((prev) => {
      if (!prev || !prev.selectedCell || prev.isComplete) return prev;

      const { row, col } = prev.selectedCell;
      const cell = prev.grid[row][col];

      if (cell.isGiven) return prev;

      const newGrid: SudokuGrid = prev.grid.map((r) =>
        r.map((c) => ({ ...c, notes: new Set(c.notes) }))
      );

      if (prev.isNotesMode) {
        // Toggle note
        const notes = newGrid[row][col].notes;
        if (notes.has(num)) {
          notes.delete(num);
        } else {
          notes.add(num);
        }
        newGrid[row][col].value = null;
      } else {
        // Enter number
        newGrid[row][col].value = num as CellValue;
        newGrid[row][col].notes.clear();
      }

      const checkedGrid = checkForErrors(newGrid);
      const isComplete = isGridComplete(checkedGrid) && isSolutionCorrect(checkedGrid, prev.puzzle);

      // Record game completion for streak tracking
      if (isComplete && !hasRecordedCompletion.current && onGameComplete) {
        hasRecordedCompletion.current = true;
        onGameComplete('sudoku');
      }

      const newState: SudokuGameState = {
        ...prev,
        grid: checkedGrid,
        isComplete,
        endTime: isComplete ? Date.now() : null,
      };

      saveGameState(newState);
      return newState;
    });
  }, [onGameComplete]);

  const clearCell = useCallback(() => {
    setGameState((prev) => {
      if (!prev || !prev.selectedCell || prev.isComplete) return prev;

      const { row, col } = prev.selectedCell;
      const cell = prev.grid[row][col];

      if (cell.isGiven) return prev;

      const newGrid: SudokuGrid = prev.grid.map((r) =>
        r.map((c) => ({ ...c, notes: new Set(c.notes) }))
      );

      newGrid[row][col].value = null;
      newGrid[row][col].notes.clear();
      newGrid[row][col].isError = false;

      const newState = { ...prev, grid: newGrid };
      saveGameState(newState);
      return newState;
    });
  }, []);

  const toggleNotesMode = useCallback(() => {
    setGameState((prev) => {
      if (!prev) return prev;
      return { ...prev, isNotesMode: !prev.isNotesMode };
    });
  }, []);

  // Use a hint - reveals the correct number for the selected cell
  const useHint = useCallback(() => {
    setGameState((prev) => {
      if (!prev || prev.isComplete || hintsUsed >= MAX_HINTS) return prev;

      // If a cell is selected and it's not given, fill it with the solution
      if (prev.selectedCell) {
        const { row, col } = prev.selectedCell;
        const cell = prev.grid[row][col];

        if (!cell.isGiven && cell.value !== prev.puzzle.solution[row][col]) {
          const newGrid: SudokuGrid = prev.grid.map((r) =>
            r.map((c) => ({ ...c, notes: new Set(c.notes) }))
          );

          newGrid[row][col].value = prev.puzzle.solution[row][col] as CellValue;
          newGrid[row][col].notes.clear();
          newGrid[row][col].isError = false;

          const checkedGrid = checkForErrors(newGrid);
          const isComplete = isGridComplete(checkedGrid) && isSolutionCorrect(checkedGrid, prev.puzzle);

          // Record game completion for streak tracking
          if (isComplete && !hasRecordedCompletion.current && onGameComplete) {
            hasRecordedCompletion.current = true;
            onGameComplete('sudoku');
          }

          const newHintsUsed = hintsUsed + 1;
          setHintsUsed(newHintsUsed);

          const newState: SudokuGameState = {
            ...prev,
            grid: checkedGrid,
            isComplete,
            endTime: isComplete ? Date.now() : null,
          };

          saveGameState(newState, newHintsUsed);
          return newState;
        }
      }

      // If no cell selected or cell already correct, find any empty or incorrect cell
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          const cell = prev.grid[r][c];
          if (!cell.isGiven && cell.value !== prev.puzzle.solution[r][c]) {
            const newGrid: SudokuGrid = prev.grid.map((row) =>
              row.map((cell) => ({ ...cell, notes: new Set(cell.notes) }))
            );

            newGrid[r][c].value = prev.puzzle.solution[r][c] as CellValue;
            newGrid[r][c].notes.clear();
            newGrid[r][c].isError = false;

            const checkedGrid = checkForErrors(newGrid);
            const isComplete = isGridComplete(checkedGrid) && isSolutionCorrect(checkedGrid, prev.puzzle);

            // Record game completion for streak tracking
            if (isComplete && !hasRecordedCompletion.current && onGameComplete) {
              hasRecordedCompletion.current = true;
              onGameComplete('sudoku');
            }

            const newHintsUsed = hintsUsed + 1;
            setHintsUsed(newHintsUsed);

            const newState: SudokuGameState = {
              ...prev,
              grid: checkedGrid,
              selectedCell: { row: r, col: c },
              isComplete,
              endTime: isComplete ? Date.now() : null,
            };

            saveGameState(newState, newHintsUsed);
            return newState;
          }
        }
      }

      return prev;
    });
  }, [hintsUsed, onGameComplete]);

  const startNewGame = useCallback((difficulty?: SudokuDifficulty) => {
    const puzzleDifficulty = difficulty || settings.sudokuDifficulty;
    const puzzle = generateSudokuPuzzle(puzzleDifficulty);
    const newState: SudokuGameState = {
      puzzle,
      grid: createGridFromPuzzle(puzzle),
      selectedCell: null,
      isNotesMode: false,
      isComplete: false,
      startTime: Date.now(),
      endTime: null,
      mistakes: 0,
    };
    setGameState(newState);
    setHintsUsed(0);
    hasRecordedCompletion.current = false;
    saveGameState(newState, 0);
  }, [settings.sudokuDifficulty]);

  const quitGame = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      const puzzle = generateSudokuPuzzle(settings.sudokuDifficulty);
      const newState: SudokuGameState = {
        puzzle,
        grid: createGridFromPuzzle(puzzle),
        selectedCell: null,
        isNotesMode: false,
        isComplete: false,
        startTime: Date.now(),
        endTime: null,
        mistakes: 0,
      };
      setGameState(newState);
      setHintsUsed(0);
      hasRecordedCompletion.current = false;
    } catch (e) {
      console.error('Failed to quit sudoku game:', e);
    }
  }, [settings.sudokuDifficulty]);

  return {
    gameState,
    isLoading,
    hintsRemaining,
    selectCell,
    enterNumber,
    clearCell,
    toggleNotesMode,
    startNewGame,
    quitGame,
    useHint,
  };
}
