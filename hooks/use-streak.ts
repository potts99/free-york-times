import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StreakData, GameType } from '@/types/games/streak';
import { STREAK_STORAGE_KEY, DEFAULT_STREAK_DATA } from '@/types/games/streak';
import {
  processGameCompletion,
  hasPlayedToday,
  isStreakAtRisk,
} from '@/utils/games/streak-logic';

export interface UseStreakReturn {
  currentStreak: number;
  maxStreak: number;
  lastPlayedDate: string | null;
  hasPlayedToday: boolean;
  isStreakAtRisk: boolean;
  recordGamePlayed: (gameType: GameType) => Promise<void>;
  isLoaded: boolean;
}

export function useStreak(): UseStreakReturn {
  const [streakData, setStreakData] = useState<StreakData>(DEFAULT_STREAK_DATA);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load streak data on mount
  useEffect(() => {
    loadStreakData();
  }, []);

  const loadStreakData = async () => {
    try {
      const stored = await AsyncStorage.getItem(STREAK_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as StreakData;
        setStreakData(parsed);
      }
    } catch (error) {
      console.error('Failed to load streak data:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const saveStreakData = async (data: StreakData) => {
    try {
      await AsyncStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save streak data:', error);
    }
  };

  const recordGamePlayed = useCallback(
    async (gameType: GameType) => {
      const { updatedData } = processGameCompletion(streakData, gameType);

      setStreakData(updatedData);
      await saveStreakData(updatedData);
    },
    [streakData]
  );

  return {
    currentStreak: streakData.currentStreak,
    maxStreak: streakData.maxStreak,
    lastPlayedDate: streakData.lastPlayedDate,
    hasPlayedToday: hasPlayedToday(streakData.lastPlayedDate),
    isStreakAtRisk: isStreakAtRisk(
      streakData.currentStreak,
      streakData.lastPlayedDate
    ),
    recordGamePlayed,
    isLoaded,
  };
}
