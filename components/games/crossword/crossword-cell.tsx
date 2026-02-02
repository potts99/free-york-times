import { Text, StyleSheet, Pressable, View } from 'react-native';
import { useGameColors } from '@/hooks/games/use-game-colors';
import type { CrosswordCell as CrosswordCellType } from '@/types/games';

interface CrosswordCellProps {
  cell: CrosswordCellType;
  userLetter: string;
  isSelected: boolean;
  isHighlighted: boolean;
  onPress: () => void;
  size: number;
}

export function CrosswordCell({
  cell,
  userLetter,
  isSelected,
  isHighlighted,
  onPress,
  size,
}: CrosswordCellProps) {
  const colors = useGameColors();

  if (cell.isBlack) {
    return (
      <View
        style={[
          styles.cell,
          {
            width: size,
            height: size,
            backgroundColor: colors.textPrimary,
          },
        ]}
      />
    );
  }

  const backgroundColor = isSelected
    ? colors.selectedCell
    : isHighlighted
    ? colors.highlightedWord
    : colors.cellBackground;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.cell,
        {
          width: size,
          height: size,
          backgroundColor,
          borderColor: colors.cellBorder,
        },
      ]}
    >
      {cell.number && (
        <Text style={[styles.number, { color: colors.textPrimary }]}>
          {cell.number}
        </Text>
      )}
      <Text style={[styles.letter, { color: colors.textPrimary }]}>
        {userLetter}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cell: {
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  number: {
    position: 'absolute',
    top: 2,
    left: 3,
    fontSize: 9,
    fontWeight: '500',
  },
  letter: {
    fontSize: 20,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});
