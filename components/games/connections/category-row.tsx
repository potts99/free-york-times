import { Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { useGameColors } from '@/hooks/games/use-game-colors';
import type { SolvedCategory, CategoryColor } from '@/types/games';
import { ANIMATIONS } from '@/constants/games/animations';

interface CategoryRowProps {
  category: SolvedCategory;
  index: number;
  animateIn?: boolean;
}

export function CategoryRow({
  category,
  index,
  animateIn = false,
}: CategoryRowProps) {
  const colors = useGameColors();
  const opacity = useSharedValue(animateIn ? 0 : 1);
  const translateY = useSharedValue(animateIn ? 20 : 0);

  const getCategoryColor = (color: CategoryColor) => {
    switch (color) {
      case 'yellow':
        return colors.categoryYellow;
      case 'green':
        return colors.categoryGreen;
      case 'blue':
        return colors.categoryBlue;
      case 'purple':
        return colors.categoryPurple;
    }
  };

  useEffect(() => {
    if (animateIn) {
      const delay = index * 100;
      opacity.value = withDelay(delay, withTiming(1, { duration: ANIMATIONS.CATEGORY_REVEAL_DURATION }));
      translateY.value = withDelay(delay, withTiming(0, { duration: ANIMATIONS.CATEGORY_REVEAL_DURATION }));
    }
  }, [animateIn, index, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: getCategoryColor(category.color) },
        animatedStyle,
      ]}
    >
      <Text style={[styles.name, { color: colors.categoryText }]}>
        {category.name}
      </Text>
      <Text style={[styles.words, { color: colors.categoryText }]}>
        {category.words.join(', ')}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  name: {
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  words: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});
