import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { CrosswordCell } from './crossword-cell';
import type { CrosswordPuzzle } from '@/types/games';

interface CrosswordGridProps {
  puzzle: CrosswordPuzzle;
  userGrid: string[][];
  selectedCell: { row: number; col: number } | null;
  highlightedCells: Set<string>;
  onCellPress: (row: number, col: number) => void;
}

export function CrosswordGrid({
  puzzle,
  userGrid,
  selectedCell,
  highlightedCells,
  onCellPress,
}: CrosswordGridProps) {
  const { width: windowWidth } = useWindowDimensions();

  // Calculate cell size based on screen width and grid size
  const padding = 16;
  const maxGridWidth = windowWidth - padding * 2;
  const cellSize = Math.floor(maxGridWidth / puzzle.size.cols);

  return (
    <View style={styles.container}>
      {puzzle.grid.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((cell, colIndex) => (
            <CrosswordCell
              key={`${rowIndex}-${colIndex}`}
              cell={cell}
              userLetter={userGrid[rowIndex]?.[colIndex] || ''}
              isSelected={
                selectedCell?.row === rowIndex && selectedCell?.col === colIndex
              }
              isHighlighted={highlightedCells.has(`${rowIndex},${colIndex}`)}
              onPress={() => onCellPress(rowIndex, colIndex)}
              size={cellSize}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
  },
});
