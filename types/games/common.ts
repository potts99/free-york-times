export type GameStatus = 'playing' | 'won' | 'lost';

export type LetterState = 'correct' | 'present' | 'absent';

export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  lastPlayed: string | null;
}
