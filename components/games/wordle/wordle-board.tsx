import { View, StyleSheet } from 'react-native';
import { WordleRow } from './wordle-row';
import { MAX_GUESSES } from '@/types/games';

interface WordleBoardProps {
  guesses: string[];
  currentGuess: string;
  targetWord: string;
  currentRow: number;
  isRevealing: boolean;
  revealingRow: number;
  shouldShake: boolean;
  shouldBounce: boolean;
  onRevealComplete: () => void;
}

export function WordleBoard({
  guesses,
  currentGuess,
  targetWord,
  currentRow,
  isRevealing,
  revealingRow,
  shouldShake,
  shouldBounce,
  onRevealComplete,
}: WordleBoardProps) {
  return (
    <View style={styles.board}>
      {Array.from({ length: MAX_GUESSES }).map((_, rowIndex) => {
        // Determine what to display in this row
        const isSubmitted = rowIndex < guesses.length;
        const isCurrent = rowIndex === currentRow;
        const guess = isSubmitted
          ? guesses[rowIndex]
          : isCurrent
          ? currentGuess
          : '';

        return (
          <WordleRow
            key={rowIndex}
            guess={guess}
            targetWord={targetWord}
            isSubmitted={isSubmitted}
            isRevealing={isRevealing && rowIndex === revealingRow}
            isCurrent={isCurrent}
            shouldShake={shouldShake && isCurrent}
            shouldBounce={shouldBounce && isSubmitted && guesses[rowIndex] === targetWord}
            onRevealComplete={rowIndex === revealingRow ? onRevealComplete : undefined}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    gap: 5,
    alignItems: 'center',
  },
});
