import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import { SudokuDifficulty } from '@/utils/games/sudoku-logic';

const STORAGE_KEY = 'app_settings';

export type ThemeMode = 'system' | 'light' | 'dark';
export type { SudokuDifficulty };

export interface AppSettings {
  theme: ThemeMode;
  hapticsEnabled: boolean;
  sudokuDifficulty: SudokuDifficulty;
  wordleHardMode: boolean;
}

const defaultSettings: AppSettings = {
  theme: 'system',
  hapticsEnabled: true,
  sudokuDifficulty: 'medium',
  wordleHardMode: false,
};

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);
  const systemColorScheme = useSystemColorScheme();

  // Load settings from storage
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setSettings({ ...defaultSettings, ...parsed });
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadSettings();
  }, []);

  // Save settings to storage
  const saveSettings = useCallback(async (newSettings: AppSettings) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }, []);

  // Update a single setting
  const updateSetting = useCallback(
    <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
      const newSettings = { ...settings, [key]: value };
      saveSettings(newSettings);
    },
    [settings, saveSettings]
  );

  // Get the effective color scheme based on settings
  const effectiveColorScheme = settings.theme === 'system'
    ? systemColorScheme ?? 'light'
    : settings.theme;

  return {
    settings,
    isLoaded,
    updateSetting,
    effectiveColorScheme,
  };
}
