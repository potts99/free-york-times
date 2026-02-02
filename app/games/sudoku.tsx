import { useState } from 'react';
import { View, Text, StyleSheet, useWindowDimensions, ActivityIndicator, Alert, TouchableOpacity, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSudokuGame } from '@/hooks/games/use-sudoku-game';
import { useGameColors } from '@/hooks/games/use-game-colors';
import { SudokuGrid } from '@/components/games/sudoku/SudokuGrid';
import { SudokuKeypad } from '@/components/games/sudoku/SudokuKeypad';
import { GameHeader } from '@/components/games/shared';
import { formatTime, SudokuDifficulty } from '@/utils/games/sudoku-logic';

const DIFFICULTY_OPTIONS: { value: SudokuDifficulty; label: string; clues: string }[] = [
  { value: 'easy', label: 'Easy', clues: '~38 clues' },
  { value: 'medium', label: 'Medium', clues: '~30 clues' },
  { value: 'hard', label: 'Hard', clues: '~24 clues' },
];

export default function SudokuScreen() {
  const colors = useGameColors();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [showDifficultyPicker, setShowDifficultyPicker] = useState(false);
  const {
    gameState,
    isLoading,
    hintsRemaining,
    selectCell,
    enterNumber,
    clearCell,
    toggleNotesMode,
    startNewGame,
    quitGame,
    useHint,
  } = useSudokuGame();

  const handleNewGame = (difficulty: SudokuDifficulty) => {
    startNewGame(difficulty);
    setShowDifficultyPicker(false);
  };

  const gridSize = Math.min(width - 32, 360);
  const cellSize = gridSize / 9;

  const handleQuit = () => {
    Alert.alert(
      'Quit Game',
      'Are you sure you want to quit? Your progress will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Quit',
          style: 'destructive',
          onPress: async () => {
            await quitGame();
            router.back();
          },
        },
      ]
    );
  };

  if (isLoading || !gameState) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.surface }]} edges={['top']}>
        <GameHeader title="Sudoku" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.textPrimary} />
        </View>
      </SafeAreaView>
    );
  }

  const elapsedTime = gameState.endTime
    ? gameState.endTime - gameState.startTime
    : Date.now() - gameState.startTime;

  const difficultyLabel = gameState.puzzle.difficulty.charAt(0).toUpperCase() +
    gameState.puzzle.difficulty.slice(1);

  // Check if any progress has been made
  const hasProgress = gameState.grid.some(row =>
    row.some(cell => !cell.isGiven && (cell.value !== null || cell.notes.size > 0))
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.surface }]} edges={['top', 'bottom']}>
      <GameHeader
        title="Sudoku"
        subtitle={difficultyLabel}
        rightAction={
          !gameState.isComplete && hasProgress
            ? { label: 'Quit', onPress: handleQuit }
            : undefined
        }
      />

      {gameState.isComplete && (
        <View style={[styles.completeBanner, { backgroundColor: colors.correct }]}>
          <Text style={styles.completeText}>Puzzle Complete!</Text>
          <Text style={styles.completeTime}>{formatTime(elapsedTime)}</Text>
        </View>
      )}

      <View style={styles.gridContainer}>
        <SudokuGrid
          grid={gameState.grid}
          selectedCell={gameState.selectedCell}
          onCellPress={selectCell}
          cellSize={cellSize}
        />
      </View>

      {/* New Game / Difficulty Picker */}
      {gameState.isComplete && (
        <View style={styles.newGameContainer}>
          {showDifficultyPicker ? (
            <View style={styles.difficultyPicker}>
              <Text style={[styles.difficultyTitle, { color: colors.textPrimary }]}>
                Select Difficulty
              </Text>
              <View style={styles.difficultyOptions}>
                {DIFFICULTY_OPTIONS.map((option) => (
                  <Pressable
                    key={option.value}
                    style={[
                      styles.difficultyOption,
                      { backgroundColor: colors.keyBackground },
                    ]}
                    onPress={() => handleNewGame(option.value)}
                  >
                    <Text style={[styles.difficultyLabel, { color: colors.textPrimary }]}>
                      {option.label}
                    </Text>
                    <Text style={[styles.difficultyClues, { color: colors.textSecondary }]}>
                      {option.clues}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.newGameButton, { backgroundColor: '#f5793a' }]}
              onPress={() => setShowDifficultyPicker(true)}
            >
              <Text style={styles.newGameText}>New Game</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <View style={styles.keypadContainer}>
        <SudokuKeypad
          onNumberPress={enterNumber}
          onClearPress={clearCell}
          onNotesToggle={toggleNotesMode}
          onHintPress={useHint}
          isNotesMode={gameState.isNotesMode}
          disabled={gameState.isComplete}
          hintsRemaining={hintsRemaining}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeBanner: {
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  completeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  completeTime: {
    color: '#fff',
    fontSize: 14,
    marginTop: 4,
  },
  gridContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  keypadContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 24,
  },
  newGameContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  newGameButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  newGameText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  difficultyPicker: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  difficultyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  difficultyOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  difficultyOption: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 90,
  },
  difficultyLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  difficultyClues: {
    fontSize: 11,
    marginTop: 2,
  },
});
