import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ConnectionsBoard, MistakeIndicator } from '@/components/games/connections';
import { GameHeader, ShareButton } from '@/components/games/shared';
import { useConnectionsGame } from '@/hooks/games/use-connections-game';
import { useGameColors } from '@/hooks/games/use-game-colors';
import { useStreak } from '@/hooks/use-streak';
import { WORDS_PER_CATEGORY } from '@/types/games';
import { generateConnectionsShareText } from '@/utils/games/share-logic';

export default function ConnectionsScreen() {
  const colors = useGameColors();
  const router = useRouter();
  const { currentStreak, recordGamePlayed } = useStreak();

  const {
    remainingWords,
    selectedWords,
    solvedCategories,
    mistakesRemaining,
    gameStatus,
    isLoaded,
    message,
    isRevealing,
    hintsRemaining,
    hintedWord,
    onWordPress,
    onSubmit,
    onShuffle,
    startNewGame,
    quitGame,
    useHint,
  } = useConnectionsGame({
    onGameComplete: recordGamePlayed,
  });

  const [shareMessage, setShareMessage] = useState<string | null>(null);

  // Generate share text when game is won
  const shareText = useMemo(() => {
    if (gameStatus !== 'won') return '';
    return generateConnectionsShareText(solvedCategories, currentStreak);
  }, [gameStatus, solvedCategories, currentStreak]);

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

  if (!isLoaded) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.surface }]} edges={['top']}>
        <GameHeader title="Connections" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.textPrimary} />
        </View>
      </SafeAreaView>
    );
  }

  const canSubmit = selectedWords.length === WORDS_PER_CATEGORY && gameStatus === 'playing';

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.surface }]}
      edges={['top', 'bottom']}
    >
      <GameHeader
        title="Connections"
        rightAction={
          gameStatus === 'playing' && solvedCategories.length > 0
            ? { label: 'Quit', onPress: handleQuit }
            : undefined
        }
      />

      {/* Message Toast */}
      {message && (
        <View style={[styles.messageContainer, { backgroundColor: colors.textPrimary }]}>
          <Text style={[styles.messageText, { color: colors.surface }]}>{message}</Text>
        </View>
      )}

      {/* Instructions */}
      <Text style={[styles.instructionText, { color: colors.textSecondary }]}>
        Create four groups of four!
      </Text>

      {/* Game Board */}
      <View style={styles.boardContainer}>
        <ConnectionsBoard
          remainingWords={remainingWords}
          selectedWords={selectedWords}
          solvedCategories={solvedCategories}
          onWordPress={onWordPress}
          disabled={gameStatus !== 'playing' || isRevealing}
          hintedWord={hintedWord}
        />
      </View>

      {/* Bottom section */}
      <View style={styles.bottomSection}>
        {/* Mistakes remaining */}
        <View style={styles.mistakesContainer}>
          <Text style={[styles.mistakesLabel, { color: colors.textSecondary }]}>
            Mistakes remaining:
          </Text>
          <MistakeIndicator mistakesRemaining={mistakesRemaining} />
        </View>

        {/* Action buttons */}
        <View style={styles.buttonsContainer}>
          <Pressable
            onPress={onShuffle}
            disabled={gameStatus !== 'playing'}
            style={({ pressed }) => [
              styles.button,
              styles.outlineButton,
              { borderColor: colors.textPrimary },
              pressed && styles.buttonPressed,
              gameStatus !== 'playing' && styles.buttonDisabled,
            ]}
          >
            <Text style={[styles.buttonText, { color: colors.textPrimary }]}>Shuffle</Text>
          </Pressable>

          <Pressable
            onPress={useHint}
            disabled={gameStatus !== 'playing' || hintsRemaining <= 0}
            style={({ pressed }) => [
              styles.button,
              styles.outlineButton,
              { borderColor: hintsRemaining > 0 ? '#ba81c5' : colors.absent },
              pressed && styles.buttonPressed,
              (gameStatus !== 'playing' || hintsRemaining <= 0) && styles.buttonDisabled,
            ]}
          >
            <Text style={[styles.buttonText, { color: hintsRemaining > 0 ? '#ba81c5' : colors.absent }]}>
              Hint ({hintsRemaining})
            </Text>
          </Pressable>

          <Pressable
            onPress={onSubmit}
            disabled={!canSubmit}
            style={({ pressed }) => [
              styles.button,
              styles.solidButton,
              { backgroundColor: colors.textPrimary },
              pressed && styles.buttonPressed,
              !canSubmit && styles.buttonDisabled,
            ]}
          >
            <Text style={[styles.buttonText, { color: colors.surface }]}>Submit</Text>
          </Pressable>
        </View>

        {/* Share Message Toast */}
        {shareMessage && (
          <View style={[styles.shareMessageContainer, { backgroundColor: '#ba81c5' }]}>
            <Text style={styles.shareMessageText}>{shareMessage}</Text>
          </View>
        )}

        {/* End Game Buttons */}
        {gameStatus !== 'playing' && (
          <View style={styles.endGameContainer}>
            {gameStatus === 'won' && (
              <ShareButton
                shareText={shareText}
                onShareComplete={handleShareComplete}
              />
            )}
            <TouchableOpacity
              style={[styles.newGameButton, { backgroundColor: '#ba81c5' }]}
              onPress={startNewGame}
            >
              <Text style={styles.newGameText}>New Game</Text>
            </TouchableOpacity>
          </View>
        )}
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
  instructionText: {
    fontSize: 15,
    textAlign: 'center',
    paddingVertical: 16,
  },
  boardContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  bottomSection: {
    paddingBottom: 20,
  },
  mistakesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  mistakesLabel: {
    fontSize: 14,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineButton: {
    borderWidth: 1.5,
    backgroundColor: 'transparent',
  },
  solidButton: {},
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  messageContainer: {
    position: 'absolute',
    top: 120,
    alignSelf: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    zIndex: 100,
  },
  messageText: {
    fontSize: 15,
    fontWeight: '700',
  },
  endGameContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingTop: 16,
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
    bottom: 100,
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
