import { useState, useCallback, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { getRandomCrosswordPuzzle } from '@/data/games/crossword-puzzles';
import { generateCrosswordPuzzle } from '@/services/llm';
import {
  getWordCells,
  findClueForCell,
  getNextCell,
  getPrevCell,
  isPuzzleComplete,
  createEmptyGrid,
} from '@/utils/games/crossword-logic';
import type {
  CrosswordPuzzle,
  CrosswordGameState,
  CrosswordStats,
  ClueDirection,
  Clue,
  GameStatus,
} from '@/types/games';

const STORAGE_KEY_STATE = 'crossword_game_state';
const STORAGE_KEY_STATS = 'crossword_statistics';

const initialStats: CrosswordStats = {
  puzzlesCompleted: 0,
  averageTime: 0,
  bestTime: 0,
};

const MAX_HINTS = 3;

export function useCrosswordGame() {
  const [puzzle, setPuzzle] = useState<CrosswordPuzzle | null>(null);
  const [userGrid, setUserGrid] = useState<string[][]>([]);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [direction, setDirection] = useState<ClueDirection>('across');
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
  const [isLoaded, setIsLoaded] = useState(false);
  const [stats, setStats] = useState<CrosswordStats>(initialStats);
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);

  const hintsRemaining = MAX_HINTS - hintsUsed;

  // Load game state from storage
  useEffect(() => {
    const loadGame = async () => {
      try {
        const [stateJson, statsJson] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY_STATE),
          AsyncStorage.getItem(STORAGE_KEY_STATS),
        ]);

        if (statsJson) {
          const savedStats = JSON.parse(statsJson);
          setStats({
            puzzlesCompleted: savedStats.puzzlesCompleted ?? 0,
            averageTime: savedStats.averageTime ?? 0,
            bestTime: savedStats.bestTime ?? 0,
          });
        }

        if (stateJson) {
          const savedState = JSON.parse(stateJson);
          // Load saved game if still in progress
          if (savedState.gameStatus === 'playing') {
            setPuzzle(savedState.puzzle);
            setUserGrid(savedState.userGrid);
            setSelectedCell(savedState.selectedCell);
            setDirection(savedState.direction);
            setGameStatus(savedState.gameStatus);
            setStartTime(savedState.startTime);
            setElapsedTime(savedState.elapsedTime);
            setHintsUsed(savedState.hintsUsed ?? 0);
          } else {
            // Previous game was finished, show the completed board
            setPuzzle(savedState.puzzle);
            setUserGrid(savedState.userGrid);
            setGameStatus(savedState.gameStatus);
            setElapsedTime(savedState.elapsedTime);
            setHintsUsed(savedState.hintsUsed ?? 0);
          }
        } else {
          // No saved state, start fresh
          const newPuzzle = getRandomCrosswordPuzzle();
          setPuzzle(newPuzzle);
          setUserGrid(createEmptyGrid(newPuzzle.size.rows, newPuzzle.size.cols));
          setStartTime(Date.now());
        }
      } catch (error) {
        console.error('Failed to load game state:', error);
        const newPuzzle = getRandomCrosswordPuzzle();
        setPuzzle(newPuzzle);
        setUserGrid(createEmptyGrid(newPuzzle.size.rows, newPuzzle.size.cols));
        setStartTime(Date.now());
      } finally {
        setIsLoaded(true);
      }
    };

    loadGame();
  }, []);

  // Timer
  useEffect(() => {
    if (!isLoaded || gameStatus !== 'playing' || !startTime) return;

    const interval = setInterval(() => {
      setElapsedTime(Date.now() - startTime);
    }, 1000);

    return () => clearInterval(interval);
  }, [isLoaded, gameStatus, startTime]);

  // Save game state to storage
  useEffect(() => {
    if (!isLoaded || !puzzle) return;

    const saveGame = async () => {
      const state = {
        puzzle,
        userGrid,
        selectedCell,
        direction,
        revealedCells: [],
        checkedCells: {},
        gameStatus,
        startTime,
        elapsedTime,
        hintsUsed,
      };

      try {
        await AsyncStorage.setItem(STORAGE_KEY_STATE, JSON.stringify(state));
      } catch (error) {
        console.error('Failed to save game state:', error);
      }
    };

    saveGame();
  }, [userGrid, selectedCell, direction, gameStatus, isLoaded, puzzle, startTime, elapsedTime, hintsUsed]);

  // Get highlighted cells (cells in the same word as selected cell)
  const highlightedCells = useMemo(() => {
    const cells = new Set<string>();
    if (!puzzle || !selectedCell) return cells;

    const clue = findClueForCell(puzzle, selectedCell.row, selectedCell.col, direction);
    if (clue) {
      const wordCells = getWordCells(puzzle, clue.startRow, clue.startCol, direction);
      wordCells.forEach(({ row, col }) => {
        cells.add(`${row},${col}`);
      });
    }

    return cells;
  }, [puzzle, selectedCell, direction]);

  // Get active clue
  const activeClue = useMemo(() => {
    if (!puzzle || !selectedCell) return null;
    return findClueForCell(puzzle, selectedCell.row, selectedCell.col, direction);
  }, [puzzle, selectedCell, direction]);

  // Save stats to storage
  const saveStats = useCallback(async (newStats: CrosswordStats) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(newStats));
    } catch (error) {
      console.error('Failed to save stats:', error);
    }
  }, []);

  // Handle cell press
  const onCellPress = useCallback(
    (row: number, col: number) => {
      if (!puzzle || gameStatus !== 'playing') return;

      const cell = puzzle.grid[row][col];
      if (cell.isBlack) return;

      // If pressing the same cell, toggle direction
      if (selectedCell?.row === row && selectedCell?.col === col) {
        setDirection((prev) => (prev === 'across' ? 'down' : 'across'));
      } else {
        setSelectedCell({ row, col });
      }

      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {
        // Haptics may not be available
      }
    },
    [puzzle, selectedCell, gameStatus]
  );

  // Handle letter input
  const onKeyPress = useCallback(
    (key: string) => {
      if (!puzzle || !selectedCell || gameStatus !== 'playing') return;

      const letter = key.toUpperCase();
      if (!/^[A-Z]$/.test(letter)) return;

      // Update the cell
      setUserGrid((prev) => {
        const newGrid = prev.map((row) => [...row]);
        newGrid[selectedCell.row][selectedCell.col] = letter;
        return newGrid;
      });

      // Move to next cell
      const nextCell = getNextCell(puzzle, selectedCell.row, selectedCell.col, direction);
      if (nextCell) {
        setSelectedCell(nextCell);
      }

      // Check for completion
      setTimeout(() => {
        setUserGrid((currentGrid) => {
          if (isPuzzleComplete(puzzle, currentGrid)) {
            setGameStatus('won');
            try {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (e) {
              // Haptics may not be available
            }

            const newStats: CrosswordStats = {
              puzzlesCompleted: stats.puzzlesCompleted + 1,
              averageTime: Math.round(
                (stats.averageTime * stats.puzzlesCompleted + elapsedTime) /
                  (stats.puzzlesCompleted + 1)
              ),
              bestTime:
                stats.bestTime === 0
                  ? elapsedTime
                  : Math.min(stats.bestTime, elapsedTime),
            };
            setStats(newStats);
            saveStats(newStats);
          }
          return currentGrid;
        });
      }, 100);
    },
    [puzzle, selectedCell, direction, gameStatus, stats, elapsedTime, saveStats]
  );

  // Handle backspace
  const onBackspace = useCallback(() => {
    if (!puzzle || !selectedCell || gameStatus !== 'playing') return;

    const currentLetter = userGrid[selectedCell.row]?.[selectedCell.col];

    if (currentLetter) {
      // Clear current cell
      setUserGrid((prev) => {
        const newGrid = prev.map((row) => [...row]);
        newGrid[selectedCell.row][selectedCell.col] = '';
        return newGrid;
      });
    } else {
      // Move to previous cell and clear it
      const prevCell = getPrevCell(puzzle, selectedCell.row, selectedCell.col, direction);
      if (prevCell) {
        setSelectedCell(prevCell);
        setUserGrid((prev) => {
          const newGrid = prev.map((row) => [...row]);
          newGrid[prevCell.row][prevCell.col] = '';
          return newGrid;
        });
      }
    }
  }, [puzzle, selectedCell, direction, userGrid, gameStatus]);

  // Handle clue press
  const onCluePress = useCallback(
    (clue: Clue) => {
      if (gameStatus !== 'playing') return;
      setSelectedCell({ row: clue.startRow, col: clue.startCol });
      setDirection(clue.direction);
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {
        // Haptics may not be available
      }
    },
    [gameStatus]
  );

  // Use a hint - reveal the current selected cell
  const useHint = useCallback(() => {
    if (!puzzle || !selectedCell || gameStatus !== 'playing' || hintsUsed >= MAX_HINTS) {
      return;
    }

    const cell = puzzle.grid[selectedCell.row][selectedCell.col];
    if (cell.isBlack) return;

    const correctLetter = cell.letter;
    const currentLetter = userGrid[selectedCell.row]?.[selectedCell.col];

    // If already correct, find another cell to reveal
    if (currentLetter === correctLetter) {
      // Find next empty or incorrect cell in the current word
      const clue = findClueForCell(puzzle, selectedCell.row, selectedCell.col, direction);
      if (clue) {
        const wordCells = getWordCells(puzzle, clue.startRow, clue.startCol, direction);
        for (const { row, col } of wordCells) {
          const cellLetter = puzzle.grid[row][col].letter;
          const userLetter = userGrid[row]?.[col];
          if (userLetter !== cellLetter) {
            setUserGrid((prev) => {
              const newGrid = prev.map((r) => [...r]);
              newGrid[row][col] = cellLetter;
              return newGrid;
            });
            setSelectedCell({ row, col });
            setHintsUsed((prev) => prev + 1);

            try {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            } catch (e) {
              // Haptics may not be available
            }
            return;
          }
        }
      }
      return;
    }

    // Reveal the current cell
    setUserGrid((prev) => {
      const newGrid = prev.map((r) => [...r]);
      newGrid[selectedCell.row][selectedCell.col] = correctLetter;
      return newGrid;
    });
    setHintsUsed((prev) => prev + 1);

    // Move to next cell
    const nextCell = getNextCell(puzzle, selectedCell.row, selectedCell.col, direction);
    if (nextCell) {
      setSelectedCell(nextCell);
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {
      // Haptics may not be available
    }

    // Check for completion
    setTimeout(() => {
      setUserGrid((currentGrid) => {
        if (isPuzzleComplete(puzzle, currentGrid)) {
          setGameStatus('won');
          try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } catch (e) {
            // Haptics may not be available
          }

          const newStats: CrosswordStats = {
            puzzlesCompleted: stats.puzzlesCompleted + 1,
            averageTime: Math.round(
              (stats.averageTime * stats.puzzlesCompleted + elapsedTime) /
                (stats.puzzlesCompleted + 1)
            ),
            bestTime:
              stats.bestTime === 0
                ? elapsedTime
                : Math.min(stats.bestTime, elapsedTime),
          };
          setStats(newStats);
          saveStats(newStats);
        }
        return currentGrid;
      });
    }, 100);
  }, [puzzle, selectedCell, direction, gameStatus, hintsUsed, userGrid, stats, elapsedTime, saveStats]);

  // Start a new game with static puzzle
  const startNewGame = useCallback(() => {
    const newPuzzle = getRandomCrosswordPuzzle();
    setPuzzle(newPuzzle);
    setUserGrid(createEmptyGrid(newPuzzle.size.rows, newPuzzle.size.cols));
    setSelectedCell(null);
    setDirection('across');
    setGameStatus('playing');
    setStartTime(Date.now());
    setElapsedTime(0);
    setHintsUsed(0);
  }, []);

  // Generate a new AI puzzle
  const generateAIPuzzle = useCallback(async () => {
    setIsGenerating(true);
    try {
      const aiPuzzle = await generateCrosswordPuzzle();
      if (aiPuzzle) {
        setPuzzle(aiPuzzle);
        setUserGrid(createEmptyGrid(aiPuzzle.size.rows, aiPuzzle.size.cols));
        setSelectedCell(null);
        setDirection('across');
        setGameStatus('playing');
        setStartTime(Date.now());
        setElapsedTime(0);
        setHintsUsed(0);
      } else {
        // Fallback to static puzzle if AI fails
        const newPuzzle = getRandomCrosswordPuzzle();
        setPuzzle(newPuzzle);
        setUserGrid(createEmptyGrid(newPuzzle.size.rows, newPuzzle.size.cols));
        setSelectedCell(null);
        setDirection('across');
        setGameStatus('playing');
        setStartTime(Date.now());
        setElapsedTime(0);
        setHintsUsed(0);
      }
    } catch (error) {
      console.error('Failed to generate AI puzzle:', error);
      // Fallback to static puzzle
      const newPuzzle = getRandomCrosswordPuzzle();
      setPuzzle(newPuzzle);
      setUserGrid(createEmptyGrid(newPuzzle.size.rows, newPuzzle.size.cols));
      setSelectedCell(null);
      setDirection('across');
      setGameStatus('playing');
      setStartTime(Date.now());
      setElapsedTime(0);
      setHintsUsed(0);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  // Quit the current game
  const quitGame = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY_STATE);
      const newPuzzle = getRandomCrosswordPuzzle();
      setPuzzle(newPuzzle);
      setUserGrid(createEmptyGrid(newPuzzle.size.rows, newPuzzle.size.cols));
      setSelectedCell(null);
      setDirection('across');
      setGameStatus('playing');
      setStartTime(Date.now());
      setElapsedTime(0);
      setHintsUsed(0);
    } catch (error) {
      console.error('Failed to quit game:', error);
    }
  }, []);

  // Format time
  const formattedTime = useMemo(() => {
    const totalSeconds = Math.floor(elapsedTime / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [elapsedTime]);

  return {
    puzzle,
    userGrid,
    selectedCell,
    direction,
    highlightedCells,
    activeClue,
    gameStatus,
    isLoaded,
    isGenerating,
    stats,
    formattedTime,
    hintsRemaining,
    onCellPress,
    onKeyPress,
    onBackspace,
    onCluePress,
    startNewGame,
    generateAIPuzzle,
    quitGame,
    useHint,
  };
}
