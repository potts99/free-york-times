import type { GameStatus, LetterState } from './common';

export type TileState = 'empty' | 'tbd' | 'correct' | 'present' | 'absent';

export interface WordleGameState {
  targetWord: string;
  guesses: string[];
  currentGuess: string;
  gameStatus: GameStatus;
  letterStates: Record<string, LetterState>;
  currentRow: number;
  isRevealing: boolean;
}

export interface WordleStats {
  gamesPlayed: number;
  gamesWon: number;
  guessDistribution: [number, number, number, number, number, number];
}

export const WORD_LENGTH = 5;
export const MAX_GUESSES = 6;
