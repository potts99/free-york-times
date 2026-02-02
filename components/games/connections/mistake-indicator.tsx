import { View, StyleSheet } from 'react-native';
import { useGameColors } from '@/hooks/games/use-game-colors';
import { MAX_MISTAKES } from '@/types/games';

interface MistakeIndicatorProps {
  mistakesRemaining: number;
}

export function MistakeIndicator({ mistakesRemaining }: MistakeIndicatorProps) {
  const colors = useGameColors();

  return (
    <View style={styles.container}>
      {Array.from({ length: MAX_MISTAKES }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            {
              backgroundColor:
                index < mistakesRemaining
                  ? colors.textPrimary
                  : colors.border,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
