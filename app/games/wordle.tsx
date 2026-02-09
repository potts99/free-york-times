import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { WordleBoard } from '@/components/games/wordle';
import { GameKeyboard, GameHeader, StatsModal, ShareButton } from '@/components/games/shared';
import { useWordleGame } from '@/hooks/games/use-wordle-game';
import { useGameColors } from '@/hooks/games/use-game-colors';
import { useStreak } from '@/hooks/use-streak';
import { generateWordleShareText } from '@/utils/games/share-logic';

export default function WordleScreen() {
  const colors = useGameColors();
  const router = useRouter();
  const { currentStreak, maxStreak, recordGamePlayed } = useStreak();

  const {
    guesses,
    currentGuess,
    targetWord,
    gameStatus,
    letterStates,
    isRevealing,
    revealingRow,
    shouldShake,
    shouldBounce,
    isLoaded,
    message,
    currentRow,
    stats,
    hintsRemaining,
    onKeyPress,
    onBackspace,
    onEnter,
    onRevealComplete,
    startNewGame,
    quitGame,
    useHint,
  } = useWordleGame({
    onGameComplete: recordGamePlayed,
  });

  const [showStats, setShowStats] = useState(false);
  const [shareMessage, setShareMessage] = useState<string | null>(null);

  // Generate share text when game is complete
  const shareText = useMemo(() => {
    if (gameStatus === 'playing' || !targetWord) return '';
    return generateWordleShareText(guesses, targetWord, currentStreak, gameStatus === 'won');
  }, [gameStatus, guesses, targetWord, currentStreak]);

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

  if (!isLoaded || !targetWord) {
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
        title="Wordle"
        rightAction={
          gameStatus === 'playing' && guesses.length > 0
            ? { label: 'Quit', onPress: handleQuit }
            : undefined
        }
        onStatsPress={() => setShowStats(true)}
      />

      {/* Stats Modal */}
      <StatsModal
        visible={showStats}
        onClose={() => setShowStats(false)}
        title="Statistics"
        streak={{ current: currentStreak, max: maxStreak }}
        stats={[
          { label: 'Played', value: stats.gamesPlayed },
          {
            label: 'Win %',
            value: stats.gamesPlayed > 0
              ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
              : 0,
          },
        ]}
        distribution={{
          label: 'Guess Distribution',
          data: (stats.guessDistribution || [0, 0, 0, 0, 0, 0]).map((count, i) => ({
            key: String(i + 1),
            count,
            highlight: gameStatus === 'won' && guesses.length === i + 1,
          })),
        }}
      />

      {/* Dev Mode: Show target word */}
      {__DEV__ && (
        <Text style={[styles.devWord, { color: colors.textSecondary }]}>
          DEV: {targetWord}
        </Text>
      )}

      {/* Message Toast */}
      {message && (
        <View style={[styles.messageContainer, { backgroundColor: colors.textPrimary }]}>
          <Text style={[styles.messageText, { color: colors.surface }]}>{message}</Text>
        </View>
      )}

      {/* Game Board */}
      <View style={styles.boardContainer}>
        <WordleBoard
          guesses={guesses}
          currentGuess={currentGuess}
          targetWord={targetWord}
          currentRow={currentRow}
          isRevealing={isRevealing}
          revealingRow={revealingRow}
          shouldShake={shouldShake}
          shouldBounce={shouldBounce}
          onRevealComplete={onRevealComplete}
        />
      </View>

      {/* Hint Button */}
      {gameStatus === 'playing' && guesses.length > 0 && (
        <View style={styles.hintContainer}>
          <TouchableOpacity
            style={[
              styles.hintButton,
              { backgroundColor: hintsRemaining > 0 ? colors.present : colors.absent },
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

      {/* Share Message Toast */}
      {shareMessage && (
        <View style={[styles.shareMessageContainer, { backgroundColor: colors.correct }]}>
          <Text style={styles.shareMessageText}>{shareMessage}</Text>
        </View>
      )}

      {/* End Game Buttons */}
      {gameStatus !== 'playing' && (
        <View style={styles.endGameContainer}>
          <ShareButton
            shareText={shareText}
            onShareComplete={handleShareComplete}
          />
          <TouchableOpacity
            style={[styles.newGameButton, { backgroundColor: colors.textPrimary }]}
            onPress={startNewGame}
          >
            <Text style={styles.newGameText}>New Game</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Keyboard */}
      <GameKeyboard
        onKeyPress={onKeyPress}
        onEnter={onEnter}
        onBackspace={onBackspace}
        letterStates={letterStates}
        disabled={gameStatus !== 'playing' || isRevealing}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  boardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageContainer: {
    position: 'absolute',
    top: 60,
    left: '50%',
    transform: [{ translateX: -75 }],
    width: 150,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
    zIndex: 100,
    alignItems: 'center',
  },
  messageText: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  endGameContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  newGameButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  newGameText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  shareMessageContainer: {
    position: 'absolute',
    bottom: 180,
    left: '50%',
    transform: [{ translateX: -80 }],
    width: 160,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    zIndex: 100,
    alignItems: 'center',
  },
  shareMessageText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  devWord: {
    textAlign: 'center',
    fontSize: 12,
    paddingVertical: 4,
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
});
