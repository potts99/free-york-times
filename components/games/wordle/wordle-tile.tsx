import { Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withDelay,
  withSequence,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { useGameColors } from '@/hooks/games/use-game-colors';
import type { TileState } from '@/types/games';
import { ANIMATIONS } from '@/constants/games/animations';

interface WordleTileProps {
  letter: string;
  state: TileState;
  position: number;
  isRevealing?: boolean;
  shouldBounce?: boolean;
  onRevealComplete?: () => void;
}

export function WordleTile({
  letter,
  state,
  position,
  isRevealing = false,
  shouldBounce = false,
  onRevealComplete,
}: WordleTileProps) {
  const colors = useGameColors();
  const rotateX = useSharedValue(0);
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const hasFlipped = useSharedValue(false);

  // Get background color based on state
  const getBackgroundColor = () => {
    switch (state) {
      case 'correct':
        return colors.correct;
      case 'present':
        return colors.present;
      case 'absent':
        return colors.absent;
      default:
        return colors.tileBackground;
    }
  };

  // Get border color based on state
  const getBorderColor = () => {
    if (state === 'tbd') {
      return colors.tileBorderFilled;
    }
    if (state === 'empty') {
      return colors.tileBorder;
    }
    return 'transparent';
  };

  // Pop animation when letter is typed
  useEffect(() => {
    if (letter && state === 'tbd') {
      scale.value = withSequence(
        withTiming(ANIMATIONS.LETTER_POP_SCALE, { duration: ANIMATIONS.LETTER_POP_DURATION }),
        withTiming(1, { duration: ANIMATIONS.LETTER_POP_DURATION })
      );
    }
  }, [letter, state, scale]);

  // Flip animation when revealing
  useEffect(() => {
    if (isRevealing && !hasFlipped.value) {
      const delay = position * ANIMATIONS.TILE_FLIP_DELAY;

      rotateX.value = withDelay(
        delay,
        withSequence(
          withTiming(90, {
            duration: ANIMATIONS.TILE_FLIP_DURATION / 2,
            easing: ANIMATIONS.EASING.flip,
          }),
          withTiming(0, {
            duration: ANIMATIONS.TILE_FLIP_DURATION / 2,
            easing: ANIMATIONS.EASING.flip,
          })
        )
      );

      // Mark as flipped and call completion callback
      hasFlipped.value = true;
      if (onRevealComplete && position === 4) {
        setTimeout(() => {
          onRevealComplete();
        }, delay + ANIMATIONS.TILE_FLIP_DURATION);
      }
    }
  }, [isRevealing, hasFlipped, onRevealComplete, position, rotateX]);

  // Bounce animation on win
  useEffect(() => {
    if (shouldBounce) {
      const delay = position * ANIMATIONS.BOUNCE_DELAY;
      translateY.value = withDelay(
        delay,
        withSequence(
          withTiming(ANIMATIONS.BOUNCE_HEIGHT, { duration: ANIMATIONS.BOUNCE_DURATION }),
          withTiming(0, { duration: ANIMATIONS.BOUNCE_DURATION })
        )
      );
    }
  }, [shouldBounce, position, translateY]);

  // Pre-compute colors for the worklet
  const backgroundColor = getBackgroundColor();
  const tileBackground = colors.tileBackground;

  const animatedStyle = useAnimatedStyle(() => {
    // Calculate if we're in the second half of the flip (showing colored side)
    const isShowingBack = rotateX.value > 45;
    const isColored = state === 'correct' || state === 'present' || state === 'absent';

    return {
      transform: [
        { perspective: 1000 },
        { rotateX: `${rotateX.value}deg` },
        { scale: scale.value },
        { translateY: translateY.value },
      ],
      backgroundColor: isShowingBack || isColored ? backgroundColor : tileBackground,
    };
  }, [state, backgroundColor, tileBackground]);

  return (
    <Animated.View
      style={[
        styles.tile,
        { borderColor: getBorderColor() },
        animatedStyle,
      ]}
    >
      <Text
        style={[
          styles.letter,
          {
            color:
              state === 'correct' || state === 'present' || state === 'absent'
                ? '#ffffff'
                : colors.tileText,
          },
        ]}
      >
        {letter}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: 62,
    height: 62,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  letter: {
    fontSize: 32,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
