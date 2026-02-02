import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { WordleTile } from './wordle-tile';
import { evaluateGuess } from '@/utils/games/wordle-logic';
import type { TileState } from '@/types/games';
import { ANIMATIONS } from '@/constants/games/animations';
import { WORD_LENGTH } from '@/types/games';

interface WordleRowProps {
  guess: string;
  targetWord: string;
  isSubmitted: boolean;
  isRevealing: boolean;
  isCurrent: boolean;
  shouldShake?: boolean;
  shouldBounce?: boolean;
  onRevealComplete?: () => void;
}

export function WordleRow({
  guess,
  targetWord,
  isSubmitted,
  isRevealing,
  isCurrent,
  shouldShake = false,
  shouldBounce = false,
  onRevealComplete,
}: WordleRowProps) {
  const translateX = useSharedValue(0);

  // Get evaluation for submitted guesses
  const evaluation = isSubmitted ? evaluateGuess(guess, targetWord) : null;

  // Shake animation for invalid word
  useEffect(() => {
    if (shouldShake) {
      translateX.value = withSequence(
        withTiming(-ANIMATIONS.SHAKE_DISTANCE, { duration: ANIMATIONS.SHAKE_DURATION / 8 }),
        withTiming(ANIMATIONS.SHAKE_DISTANCE, { duration: ANIMATIONS.SHAKE_DURATION / 8 }),
        withTiming(-ANIMATIONS.SHAKE_DISTANCE, { duration: ANIMATIONS.SHAKE_DURATION / 8 }),
        withTiming(ANIMATIONS.SHAKE_DISTANCE, { duration: ANIMATIONS.SHAKE_DURATION / 8 }),
        withTiming(-ANIMATIONS.SHAKE_DISTANCE, { duration: ANIMATIONS.SHAKE_DURATION / 8 }),
        withTiming(ANIMATIONS.SHAKE_DISTANCE, { duration: ANIMATIONS.SHAKE_DURATION / 8 }),
        withTiming(0, { duration: ANIMATIONS.SHAKE_DURATION / 8 })
      );
    }
  }, [shouldShake, translateX]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  // Get tile state for each position
  const getTileState = (index: number): TileState => {
    if (isSubmitted && evaluation) {
      return evaluation[index];
    }
    if (guess[index]) {
      return 'tbd';
    }
    return 'empty';
  };

  return (
    <Animated.View style={[styles.row, animatedStyle]}>
      {Array.from({ length: WORD_LENGTH }).map((_, index) => (
        <WordleTile
          key={index}
          letter={guess[index] || ''}
          state={getTileState(index)}
          position={index}
          isRevealing={isRevealing}
          shouldBounce={shouldBounce}
          onRevealComplete={index === WORD_LENGTH - 1 ? onRevealComplete : undefined}
        />
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 5,
  },
});
