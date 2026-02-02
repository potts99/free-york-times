import { Text, StyleSheet, Pressable, useWindowDimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { useGameColors } from '@/hooks/games/use-game-colors';

interface WordTileProps {
  word: string;
  isSelected: boolean;
  isHinted?: boolean;
  onPress: () => void;
  disabled?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function WordTile({
  word,
  isSelected,
  isHinted = false,
  onPress,
  disabled = false,
}: WordTileProps) {
  const colors = useGameColors();
  const { width } = useWindowDimensions();
  const scale = useSharedValue(1);

  // Calculate tile size: 4 tiles per row with gaps
  const tileSize = (width - 32 - 24) / 4; // 32 padding, 24 total gap (8*3)

  useEffect(() => {
    scale.value = withSpring(isSelected ? 0.95 : 1, {
      damping: 15,
      stiffness: 300,
    });
  }, [isSelected, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      disabled={disabled}
      style={[
        styles.tile,
        {
          width: tileSize,
          height: tileSize * 0.65,
          backgroundColor: isHinted
            ? '#ba81c5'
            : isSelected
              ? colors.connectionsTileSelected
              : colors.connectionsTile,
        },
        animatedStyle,
        disabled && styles.disabled,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: isHinted
              ? '#FFFFFF'
              : isSelected
                ? colors.connectionsTileSelectedText
                : colors.connectionsTileText,
            fontSize: word.length > 8 ? 11 : 13,
          },
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
      >
        {word}
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  text: {
    fontWeight: '800',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  disabled: {
    opacity: 0.5,
  },
});
