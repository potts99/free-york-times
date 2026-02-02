import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useGameColors } from '@/hooks/games/use-game-colors';

interface SudokuKeypadProps {
  onNumberPress: (num: number) => void;
  onClearPress: () => void;
  onNotesToggle: () => void;
  onHintPress?: () => void;
  isNotesMode: boolean;
  disabled?: boolean;
  hintsRemaining?: number;
}

export function SudokuKeypad({
  onNumberPress,
  onClearPress,
  onNotesToggle,
  onHintPress,
  isNotesMode,
  disabled,
  hintsRemaining = 0,
}: SudokuKeypadProps) {
  const colors = useGameColors();

  return (
    <View style={styles.container}>
      <View style={styles.numbersRow}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <Pressable
            key={num}
            onPress={() => !disabled && onNumberPress(num)}
            style={({ pressed }) => [
              styles.numberButton,
              { backgroundColor: colors.keyBackground },
              pressed && styles.pressed,
              disabled && styles.disabled,
            ]}
          >
            <Text style={[styles.numberText, { color: colors.keyText }]}>{num}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.actionsRow}>
        <Pressable
          onPress={() => !disabled && onClearPress()}
          style={({ pressed }) => [
            styles.actionButton,
            { backgroundColor: colors.keyBackground },
            pressed && styles.pressed,
            disabled && styles.disabled,
          ]}
        >
          <Text style={[styles.actionText, { color: colors.keyText }]}>Clear</Text>
        </Pressable>
        <Pressable
          onPress={() => !disabled && onNotesToggle()}
          style={({ pressed }) => [
            styles.actionButton,
            {
              backgroundColor: isNotesMode ? colors.present : colors.keyBackground,
            },
            pressed && styles.pressed,
            disabled && styles.disabled,
          ]}
        >
          <Text
            style={[styles.actionText, { color: isNotesMode ? '#fff' : colors.keyText }]}
          >
            Notes
          </Text>
        </Pressable>
        {onHintPress && (
          <Pressable
            onPress={() => !disabled && hintsRemaining > 0 && onHintPress()}
            style={({ pressed }) => [
              styles.actionButton,
              {
                backgroundColor: hintsRemaining > 0 ? colors.present : colors.absent,
              },
              pressed && styles.pressed,
              (disabled || hintsRemaining <= 0) && styles.disabled,
            ]}
          >
            <Text style={[styles.actionText, { color: '#fff' }]}>
              Hint ({hintsRemaining})
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    paddingHorizontal: 16,
  },
  numbersRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  numberButton: {
    width: 36,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    fontSize: 22,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  actionButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.5,
  },
});
