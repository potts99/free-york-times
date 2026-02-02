import { View, StyleSheet } from 'react-native';
import { WordTile } from './word-tile';
import { CategoryRow } from './category-row';
import type { SolvedCategory } from '@/types/games';

interface ConnectionsBoardProps {
  remainingWords: string[];
  selectedWords: string[];
  solvedCategories: SolvedCategory[];
  onWordPress: (word: string) => void;
  disabled?: boolean;
  hintedWord?: string | null;
}

export function ConnectionsBoard({
  remainingWords,
  selectedWords,
  solvedCategories,
  onWordPress,
  disabled = false,
  hintedWord,
}: ConnectionsBoardProps) {
  return (
    <View style={styles.container}>
      {/* Solved categories */}
      <View style={styles.categoriesContainer}>
        {solvedCategories.map((category, index) => (
          <CategoryRow
            key={category.name}
            category={category}
            index={index}
            animateIn={false}
          />
        ))}
      </View>

      {/* Remaining words grid */}
      <View style={styles.grid}>
        {remainingWords.map((word) => (
          <WordTile
            key={word}
            word={word}
            isSelected={selectedWords.includes(word)}
            isHinted={word === hintedWord}
            onPress={() => onWordPress(word)}
            disabled={disabled}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 8,
  },
  categoriesContainer: {
    gap: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
});
