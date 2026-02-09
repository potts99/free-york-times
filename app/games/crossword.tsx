import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CrosswordGrid, CluePanel } from '@/components/games/crossword';
import { GameKeyboard, GameHeader, ShareButton } from '@/components/games/shared';
import { useCrosswordGame } from '@/hooks/games/use-crossword-game';
import { useGameColors } from '@/hooks/games/use-game-colors';
import { useStreak } from '@/hooks/use-streak';
import { generateCrosswordShareText } from '@/utils/games/share-logic';

export default function CrosswordScreen() {
  const colors = useGameColors();
  const router = useRouter();
  const { currentStreak, recordGamePlayed } = useStreak();

  const {
    puzzle,
    userGrid,
    selectedCell,
    direction,
    highlightedCells,
    activeClue,
    gameStatus,
    isLoaded,
    isGenerating,
    formattedTime,
    hintsRemaining,
    onCellPress,
    onKeyPress,
    onBackspace,
    onCluePress,
    startNewGame,
    generateAIPuzzle,
    quitGame,
    useHint,
  } = useCrosswordGame({
    onGameComplete: recordGamePlayed,
  });

  const [shareMessage, setShareMessage] = useState<string | null>(null);

  // Parse elapsed time from formatted string for share text
  const elapsedTimeMs = useMemo(() => {
    const parts = formattedTime.split(':');
    const minutes = parseInt(parts[0] || '0', 10);
    const seconds = parseInt(parts[1] || '0', 10);
    return (minutes * 60 + seconds) * 1000;
  }, [formattedTime]);

  // Generate share text when game is won
  const shareText = useMemo(() => {
    if (gameStatus !== 'won') return '';
    return generateCrosswordShareText(elapsedTimeMs, currentStreak);
  }, [gameStatus, elapsedTimeMs, currentStreak]);

  const handleShareComplete = (result: { success: boolean; method: string }) => {
    if (result.success) {
      setShareMessage(result.method === 'clipboard' ? 'Copied to clipboard!' : 'Shared!');
      setTimeout(() => setShareMessage(null), 2000);
    }
  };

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

  // Check if any cells have been filled in
  const hasProgress = userGrid.some(row => row.some(cell => cell !== ''));

  if (!isLoaded || !puzzle) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <ActivityIndicator size="large" color={colors.textPrimary} />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.surface }]}
      edges={['top', 'bottom']}
    >
      <GameHeader
        title="The Mini"
        subtitle={formattedTime}
        rightAction={
          gameStatus === 'playing' && hasProgress
            ? { label: 'Quit', onPress: handleQuit }
            : undefined
        }
      />

      {/* Grid */}
      <View style={styles.gridContainer}>
        <CrosswordGrid
          puzzle={puzzle}
          userGrid={userGrid}
          selectedCell={selectedCell}
          highlightedCells={highlightedCells}
          onCellPress={onCellPress}
        />
      </View>

      {/* Share Message Toast */}
      {shareMessage && (
        <View style={[styles.shareMessageContainer, { backgroundColor: '#4a90d9' }]}>
          <Text style={styles.shareMessageText}>{shareMessage}</Text>
        </View>
      )}

      {/* Win message & New Game buttons */}
      {gameStatus === 'won' && (
        <View style={styles.winContainer}>
          <Text style={[styles.winText, { color: colors.textPrimary }]}>
            Completed in {formattedTime}!
          </Text>
          <View style={styles.buttonRow}>
            <ShareButton
              shareText={shareText}
              onShareComplete={handleShareComplete}
            />
            <TouchableOpacity
              style={[styles.newGameButton, { backgroundColor: '#4a90d9' }]}
              onPress={startNewGame}
            >
              <Text style={styles.newGameText}>New Puzzle</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.newGameButton, { backgroundColor: '#6a5acd' }]}
              onPress={generateAIPuzzle}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.newGameText}>AI Puzzle</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* AI Generation Loading */}
      {isGenerating && gameStatus === 'playing' && (
        <View style={styles.generatingContainer}>
          <ActivityIndicator size="large" color="#6a5acd" />
          <Text style={[styles.generatingText, { color: colors.textPrimary }]}>
            Generating AI puzzle...
          </Text>
        </View>
      )}

      {/* Active Clue */}
      {activeClue && gameStatus === 'playing' && (
        <View style={[styles.activeClueContainer, { backgroundColor: colors.surfaceSecondary }]}>
          <Text style={[styles.activeClueNumber, { color: colors.textPrimary }]}>
            {activeClue.number} {direction === 'across' ? 'A' : 'D'}
          </Text>
          <Text style={[styles.activeClueText, { color: colors.textPrimary }]}>
            {activeClue.text}
          </Text>
        </View>
      )}

      {/* Clue Panels */}
      {gameStatus === 'playing' && (
        <View style={styles.cluesContainer}>
          <CluePanel
            clues={puzzle.clues.across}
            direction="across"
            activeClueNumber={direction === 'across' ? activeClue?.number ?? null : null}
            onCluePress={onCluePress}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <CluePanel
            clues={puzzle.clues.down}
            direction="down"
            activeClueNumber={direction === 'down' ? activeClue?.number ?? null : null}
            onCluePress={onCluePress}
          />
        </View>
      )}

      {/* Hint Button */}
      {gameStatus === 'playing' && selectedCell && (
        <View style={styles.hintContainer}>
          <TouchableOpacity
            style={[
              styles.hintButton,
              { backgroundColor: hintsRemaining > 0 ? '#4a90d9' : colors.absent },
            ]}
            onPress={useHint}
            disabled={hintsRemaining <= 0}
          >
            <Text style={styles.hintText}>
              Hint ({hintsRemaining})
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Keyboard */}
      <View style={styles.keyboardContainer}>
        <GameKeyboard
          onKeyPress={onKeyPress}
          onEnter={() => {}}
          onBackspace={onBackspace}
          disabled={gameStatus !== 'playing'}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gridContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  activeClueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
    gap: 12,
  },
  activeClueNumber: {
    fontSize: 16,
    fontWeight: '700',
    minWidth: 40,
  },
  activeClueText: {
    fontSize: 16,
    flex: 1,
  },
  cluesContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
  },
  divider: {
    width: 1,
  },
  keyboardContainer: {
    paddingBottom: 8,
  },
  winContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 16,
  },
  winText: {
    fontSize: 18,
    fontWeight: '700',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  newGameButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newGameText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  generatingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  generatingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  hintContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  hintButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  hintText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  shareMessageContainer: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    zIndex: 100,
  },
  shareMessageText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
