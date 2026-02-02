import { Stack } from 'expo-router';

export default function GamesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="wordle" />
      <Stack.Screen name="crossword" />
      <Stack.Screen name="connections" />
      <Stack.Screen name="sudoku" />
    </Stack>
  );
}
