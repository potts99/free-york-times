import type { StreakData, StreakHistoryEntry, GameType } from '@/types/games/streak';

/**
 * Get the current date as a YYYY-MM-DD string in the user's local timezone.
 * Using 'en-CA' locale gives us the ISO format consistently.
 */
export function getLocalDateString(date: Date = new Date()): string {
  return date.toLocaleDateString('en-CA');
}

/**
 * Calculate the new streak value based on when the user last played.
 *
 * Rules:
 * - First play ever: streak = 1
 * - Same day as last play: no change (isNewDay = false)
 * - Consecutive day (played yesterday): increment streak
 * - Missed one or more days: reset streak to 1
 */
export function calculateNewStreak(
  currentStreak: number,
  lastPlayedDate: string | null,
  today: string
): { newStreak: number; isNewDay: boolean } {
  // First time playing ever
  if (!lastPlayedDate) {
    return { newStreak: 1, isNewDay: true };
  }

  // Already played today - no streak change
  if (lastPlayedDate === today) {
    return { newStreak: currentStreak, isNewDay: false };
  }

  // Calculate days between last play and today
  const lastDate = new Date(lastPlayedDate + 'T00:00:00');
  const todayDate = new Date(today + 'T00:00:00');
  const diffTime = todayDate.getTime() - lastDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    // Consecutive day - increment streak
    return { newStreak: currentStreak + 1, isNewDay: true };
  } else if (diffDays > 1) {
    // Missed one or more days - reset to 1
    return { newStreak: 1, isNewDay: true };
  } else {
    // diffDays <= 0 shouldn't happen if lastPlayedDate !== today, but handle gracefully
    return { newStreak: currentStreak, isNewDay: false };
  }
}

/**
 * Update the streak history with a new game played today.
 * Keeps only the last 30 days of history to prevent unbounded growth.
 */
export function updateStreakHistory(
  history: StreakHistoryEntry[],
  today: string,
  gameType: GameType
): StreakHistoryEntry[] {
  const existingEntry = history.find((entry) => entry.date === today);

  let updatedHistory: StreakHistoryEntry[];

  if (existingEntry) {
    // Update existing entry for today
    updatedHistory = history.map((entry) => {
      if (entry.date === today) {
        const gamesPlayed = entry.gamesPlayed.includes(gameType)
          ? entry.gamesPlayed
          : [...entry.gamesPlayed, gameType];
        return { ...entry, gamesPlayed };
      }
      return entry;
    });
  } else {
    // Add new entry for today
    updatedHistory = [...history, { date: today, gamesPlayed: [gameType] }];
  }

  // Keep only last 30 days of history
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const cutoffDate = getLocalDateString(thirtyDaysAgo);

  return updatedHistory.filter((entry) => entry.date >= cutoffDate);
}

/**
 * Process a game completion and return the updated streak data.
 */
export function processGameCompletion(
  currentData: StreakData,
  gameType: GameType
): { updatedData: StreakData; isNewDay: boolean } {
  const today = getLocalDateString();
  const { newStreak, isNewDay } = calculateNewStreak(
    currentData.currentStreak,
    currentData.lastPlayedDate,
    today
  );

  if (!isNewDay) {
    // Still update history to track which games were played
    const updatedHistory = updateStreakHistory(
      currentData.streakHistory,
      today,
      gameType
    );
    return {
      updatedData: { ...currentData, streakHistory: updatedHistory },
      isNewDay: false,
    };
  }

  const updatedHistory = updateStreakHistory(
    currentData.streakHistory,
    today,
    gameType
  );

  return {
    updatedData: {
      currentStreak: newStreak,
      maxStreak: Math.max(newStreak, currentData.maxStreak),
      lastPlayedDate: today,
      streakHistory: updatedHistory,
    },
    isNewDay: true,
  };
}

/**
 * Check if the user has played today.
 */
export function hasPlayedToday(lastPlayedDate: string | null): boolean {
  if (!lastPlayedDate) return false;
  return lastPlayedDate === getLocalDateString();
}

/**
 * Check if the streak is at risk (hasn't played today and played yesterday).
 */
export function isStreakAtRisk(
  currentStreak: number,
  lastPlayedDate: string | null
): boolean {
  if (currentStreak === 0 || !lastPlayedDate) return false;

  const today = getLocalDateString();
  if (lastPlayedDate === today) return false; // Already played today

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterday);

  return lastPlayedDate === yesterdayStr;
}
