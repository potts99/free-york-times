export interface StreakHistoryEntry {
  date: string; // "YYYY-MM-DD" in local timezone
  gamesPlayed: string[]; // ['wordle', 'connections', etc.]
}

export interface StreakData {
  currentStreak: number;
  maxStreak: number;
  lastPlayedDate: string | null; // "YYYY-MM-DD" in local timezone
  streakHistory: StreakHistoryEntry[];
}

export type GameType = 'wordle' | 'connections' | 'crossword' | 'sudoku';

export const STREAK_STORAGE_KEY = 'app_streak_data';

export const DEFAULT_STREAK_DATA: StreakData = {
  currentStreak: 0,
  maxStreak: 0,
  lastPlayedDate: null,
  streakHistory: [],
};
