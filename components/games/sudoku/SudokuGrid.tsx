import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SudokuGrid as SudokuGridType } from '@/types/games/sudoku';
import { useGameColors } from '@/hooks/games/use-game-colors';

interface SudokuGridProps {
  grid: SudokuGridType;
  selectedCell: { row: number; col: number } | null;
  onCellPress: (row: number, col: number) => void;
  cellSize: number;
}

export function SudokuGrid({ grid, selectedCell, onCellPress, cellSize }: SudokuGridProps) {
  const colors = useGameColors();

  const getCellStyle = (row: number, col: number) => {
    const cell = grid[row][col];
    const isSelected = selectedCell?.row === row && selectedCell?.col === col;
    const isSameRow = selectedCell?.row === row;
    const isSameCol = selectedCell?.col === col;
    const isSameBox =
      selectedCell &&
      Math.floor(row / 3) === Math.floor(selectedCell.row / 3) &&
      Math.floor(col / 3) === Math.floor(selectedCell.col / 3);
    const isSameValue =
      selectedCell &&
      cell.value !== null &&
      grid[selectedCell.row][selectedCell.col].value === cell.value;

    let backgroundColor = colors.cellBackground;
    if (isSelected) {
      backgroundColor = colors.selectedCell;
    } else if (isSameValue) {
      backgroundColor = colors.highlightedWord;
    } else if (isSameRow || isSameCol || isSameBox) {
      backgroundColor = colors.surfaceSecondary;
    }

    return {
      backgroundColor,
      borderRightWidth: (col + 1) % 3 === 0 && col < 8 ? 2 : 1,
      borderBottomWidth: (row + 1) % 3 === 0 && row < 8 ? 2 : 1,
    };
  };

  return (
    <View style={[styles.grid, { borderColor: colors.cellBorder }]}>
      {grid.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((cell, colIndex) => (
            <Pressable
              key={colIndex}
              onPress={() => onCellPress(rowIndex, colIndex)}
              style={[
                styles.cell,
                {
                  width: cellSize,
                  height: cellSize,
                  borderColor: colors.cellBorder,
                },
                getCellStyle(rowIndex, colIndex),
              ]}
            >
              {cell.value !== null ? (
                <Text
                  style={[
                    styles.cellValue,
                    {
                      color: cell.isGiven
                        ? colors.textPrimary
                        : cell.isError
                        ? '#dc3545'
                        : '#4a90d9',
                    },
                  ]}
                >
                  {cell.value}
                </Text>
              ) : cell.notes.size > 0 ? (
                <View style={styles.notesContainer}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <Text
                      key={num}
                      style={[
                        styles.noteText,
                        { color: colors.textSecondary },
                        !cell.notes.has(num) && styles.noteHidden,
                      ]}
                    >
                      {num}
                    </Text>
                  ))}
                </View>
              ) : null}
            </Pressable>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    borderWidth: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
  },
  cellValue: {
    fontSize: 24,
    fontWeight: '600',
  },
  notesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    height: '100%',
    padding: 1,
  },
  noteText: {
    width: '33.33%',
    height: '33.33%',
    fontSize: 9,
    textAlign: 'center',
  },
  noteHidden: {
    opacity: 0,
  },
});
