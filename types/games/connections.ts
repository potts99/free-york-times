import type { GameStatus } from './common';

export type CategoryDifficulty = 1 | 2 | 3 | 4;
export type CategoryColor = 'yellow' | 'green' | 'blue' | 'purple';

export interface Category {
  name: string;
  words: string[];
  difficulty: CategoryDifficulty;
  color: CategoryColor;
}

export interface ConnectionsPuzzle {
  id: string;
  date: string;
  categories: [Category, Category, Category, Category];
}

export interface SolvedCategory extends Category {
  solvedAt: number;
}

export interface ConnectionsGameState {
  puzzle: ConnectionsPuzzle;
  remainingWords: string[];
  selectedWords: string[];
  solvedCategories: SolvedCategory[];
  mistakesRemaining: number;
  gameStatus: GameStatus;
}

export interface ConnectionsStats {
  gamesPlayed: number;
  gamesWon: number;
  perfectGames: number;
}

export const MAX_MISTAKES = 4;
export const WORDS_PER_CATEGORY = 4;
export const TOTAL_CATEGORIES = 4;
