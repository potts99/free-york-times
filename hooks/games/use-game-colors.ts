import { GameColors, type GameColorScheme } from '@/constants/games/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useGameColors(): GameColorScheme {
  const colorScheme = useColorScheme() ?? 'light';
  return GameColors[colorScheme];
}
