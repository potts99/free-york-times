import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { WordleGameState, ConnectionsGameState, CrosswordGameState, SudokuGameState } from '@/types/games';

export interface ActiveGame {
  id: string;
  type: 'wordle' | 'connections' | 'crossword' | 'sudoku';
  title: string;
  progress: string;
  href: string;
  backgroundColor: string;
  startedAt: string;
}

const WORDLE_STORAGE_KEY = 'wordle_game_state';
const CONNECTIONS_STORAGE_KEY = 'connections_game_state';
const CROSSWORD_STORAGE_KEY = 'crossword_game_state';
const SUDOKU_STORAGE_KEY = 'sudoku-game-state';

export function useActiveGames() {
  const [activeGames, setActiveGames] = useState<ActiveGame[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadActiveGames = useCallback(async () => {
    try {
      const games: ActiveGame[] = [];

      // Fetch all game states in parallel
      const [wordleJson, connectionsJson, crosswordJson, sudokuJson] = await Promise.all([
        AsyncStorage.getItem(WORDLE_STORAGE_KEY),
        AsyncStorage.getItem(CONNECTIONS_STORAGE_KEY),
        AsyncStorage.getItem(CROSSWORD_STORAGE_KEY),
        AsyncStorage.getItem(SUDOKU_STORAGE_KEY),
      ]);

      // Check Wordle
      if (wordleJson) {
        try {
          const state: WordleGameState = JSON.parse(wordleJson);
          if (state.gameStatus === 'playing' && state.guesses.length > 0) {
            games.push({
              id: 'wordle',
              type: 'wordle',
              title: 'Wordle',
              progress: `${state.guesses.length}/6 guesses`,
              href: '/games/wordle',
              backgroundColor: '#6aaa64',
              startedAt: new Date().toISOString(),
            });
          }
        } catch (e) {
          console.error('Failed to parse Wordle state:', e);
        }
      }

      // Check Connections
      if (connectionsJson) {
        try {
          const state: ConnectionsGameState = JSON.parse(connectionsJson);
          if (state.gameStatus === 'playing' && state.solvedCategories.length > 0) {
            games.push({
              id: 'connections',
              type: 'connections',
              title: 'Connections',
              progress: `${state.solvedCategories.length}/4 groups found`,
              href: '/games/connections',
              backgroundColor: '#ba9bd9',
              startedAt: new Date().toISOString(),
            });
          }
        } catch (e) {
          console.error('Failed to parse Connections state:', e);
        }
      }

      // Check Crossword
      if (crosswordJson) {
        try {
          const state: CrosswordGameState = JSON.parse(crosswordJson);
          if (state.gameStatus === 'playing') {
            // Count filled cells
            const filledCells = state.userGrid.flat().filter(c => c !== '').length;
            const totalCells = state.puzzle.grid.flat().filter(c => !c.isBlack).length;
            if (filledCells > 0) {
              const percentComplete = Math.round((filledCells / totalCells) * 100);
              games.push({
                id: 'crossword',
                type: 'crossword',
                title: 'Crossword',
                progress: `${percentComplete}% complete`,
                href: '/games/crossword',
                backgroundColor: '#4a90d9',
                startedAt: new Date().toISOString(),
              });
            }
          }
        } catch (e) {
          console.error('Failed to parse Crossword state:', e);
        }
      }

      // Check Sudoku
      if (sudokuJson) {
        try {
          const state: SudokuGameState = JSON.parse(sudokuJson);
          if (!state.isComplete) {
            // Count filled cells (non-given cells that have values)
            const filledCells = state.grid.flat().filter(c => !c.isGiven && c.value !== null).length;
            if (filledCells > 0) {
              const totalEmpty = state.grid.flat().filter(c => !c.isGiven).length;
              const percentComplete = Math.round((filledCells / totalEmpty) * 100);
              games.push({
                id: 'sudoku',
                type: 'sudoku',
                title: 'Sudoku',
                progress: `${percentComplete}% complete`,
                href: '/games/sudoku',
                backgroundColor: '#f5793a',
                startedAt: new Date().toISOString(),
              });
            }
          }
        } catch (e) {
          console.error('Failed to parse Sudoku state:', e);
        }
      }

      setActiveGames(games);
    } catch (error) {
      console.error('Failed to load active games:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const quitGame = useCallback(async (gameType: string) => {
    try {
      switch (gameType) {
        case 'wordle':
          await AsyncStorage.removeItem(WORDLE_STORAGE_KEY);
          break;
        case 'connections':
          await AsyncStorage.removeItem(CONNECTIONS_STORAGE_KEY);
          break;
        case 'crossword':
          await AsyncStorage.removeItem(CROSSWORD_STORAGE_KEY);
          break;
        case 'sudoku':
          await AsyncStorage.removeItem(SUDOKU_STORAGE_KEY);
          break;
      }

      // Reload active games list
      await loadActiveGames();
    } catch (error) {
      console.error('Failed to quit game:', error);
    }
  }, [loadActiveGames]);

  useEffect(() => {
    loadActiveGames();
  }, [loadActiveGames]);

  return {
    activeGames,
    isLoaded,
    refresh: loadActiveGames,
    quitGame,
  };
}
