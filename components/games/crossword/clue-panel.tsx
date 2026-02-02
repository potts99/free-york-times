import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useGameColors } from '@/hooks/games/use-game-colors';
import type { Clue, ClueDirection } from '@/types/games';

interface CluePanelProps {
  clues: Clue[];
  direction: ClueDirection;
  activeClueNumber: number | null;
  onCluePress: (clue: Clue) => void;
}

export function CluePanel({
  clues,
  direction,
  activeClueNumber,
  onCluePress,
}: CluePanelProps) {
  const colors = useGameColors();

  return (
    <View style={styles.container}>
      <Text style={[styles.header, { color: colors.textPrimary }]}>
        {direction === 'across' ? 'ACROSS' : 'DOWN'}
      </Text>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {clues.map((clue) => (
          <Pressable
            key={clue.number}
            onPress={() => onCluePress(clue)}
            style={[
              styles.clueItem,
              {
                backgroundColor:
                  activeClueNumber === clue.number
                    ? colors.highlightedWord
                    : 'transparent',
              },
            ]}
          >
            <Text style={[styles.clueNumber, { color: colors.textPrimary }]}>
              {clue.number}.
            </Text>
            <Text
              style={[styles.clueText, { color: colors.textPrimary }]}
              numberOfLines={2}
            >
              {clue.text}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  scrollView: {
    flex: 1,
  },
  clueItem: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 4,
    gap: 8,
  },
  clueNumber: {
    fontSize: 14,
    fontWeight: '600',
    width: 24,
  },
  clueText: {
    fontSize: 14,
    flex: 1,
  },
});
