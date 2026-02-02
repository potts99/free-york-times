import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useGameColors } from '@/hooks/games/use-game-colors';
import type { LetterState } from '@/types/games';

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK'],
];

interface GameKeyboardProps {
  onKeyPress: (key: string) => void;
  onEnter: () => void;
  onBackspace: () => void;
  letterStates?: Record<string, LetterState>;
  disabled?: boolean;
}

export function GameKeyboard({
  onKeyPress,
  onEnter,
  onBackspace,
  letterStates = {},
  disabled = false,
}: GameKeyboardProps) {
  const colors = useGameColors();

  const handlePress = (key: string) => {
    if (disabled) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (key === 'ENTER') {
      onEnter();
    } else if (key === 'BACK') {
      onBackspace();
    } else {
      onKeyPress(key);
    }
  };

  const getKeyStyle = (key: string) => {
    const state = letterStates[key];
    if (!state) {
      return { backgroundColor: colors.keyBackground };
    }
    switch (state) {
      case 'correct':
        return { backgroundColor: colors.correct };
      case 'present':
        return { backgroundColor: colors.present };
      case 'absent':
        return { backgroundColor: colors.absent };
    }
  };

  const getKeyTextColor = (key: string) => {
    const state = letterStates[key];
    if (state) {
      return '#ffffff';
    }
    return colors.keyText;
  };

  return (
    <View style={styles.container}>
      {KEYBOARD_ROWS.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((key) => {
            const isSpecial = key === 'ENTER' || key === 'BACK';
            return (
              <Pressable
                key={key}
                onPress={() => handlePress(key)}
                disabled={disabled}
                style={({ pressed }) => [
                  styles.key,
                  isSpecial && styles.specialKey,
                  getKeyStyle(key),
                  pressed && styles.keyPressed,
                  disabled && styles.keyDisabled,
                ]}
              >
                <Text
                  style={[
                    styles.keyText,
                    isSpecial && styles.specialKeyText,
                    { color: getKeyTextColor(key) },
                  ]}
                >
                  {key === 'BACK' ? '⌫' : key}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
    gap: 6,
  },
  key: {
    minWidth: 32,
    height: 58,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  specialKey: {
    minWidth: 56,
    paddingHorizontal: 12,
  },
  keyPressed: {
    opacity: 0.7,
  },
  keyDisabled: {
    opacity: 0.5,
  },
  keyText: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  specialKeyText: {
    fontSize: 12,
  },
});
