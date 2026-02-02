import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useGameColors } from '@/hooks/games/use-game-colors';

interface GameHeaderProps {
  title: string;
  subtitle?: string;
  rightAction?: {
    label: string;
    onPress: () => void;
  };
  onStatsPress?: () => void;
}

export function GameHeader({ title, subtitle, rightAction, onStatsPress }: GameHeaderProps) {
  const colors = useGameColors();
  const router = useRouter();

  return (
    <View style={[styles.container, { borderBottomColor: colors.border }]}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Text style={[styles.backIcon, { color: colors.textPrimary }]}>&#x2190;</Text>
      </Pressable>

      <View style={styles.titleContainer}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
        )}
      </View>

      <View style={styles.rightButtons}>
        {onStatsPress && (
          <Pressable onPress={onStatsPress} style={styles.rightButton}>
            <Text style={[styles.statsIcon, { color: colors.textSecondary }]}>
              &#x1F4CA;
            </Text>
          </Pressable>
        )}
        {rightAction ? (
          <Pressable onPress={rightAction.onPress} style={styles.rightButton}>
            <Text style={[styles.rightButtonText, { color: colors.textSecondary }]}>
              {rightAction.label}
            </Text>
          </Pressable>
        ) : !onStatsPress ? (
          <View style={styles.rightPlaceholder} />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 24,
    fontWeight: '300',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  rightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightPlaceholder: {
    width: 40,
  },
  rightButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsIcon: {
    fontSize: 18,
  },
});
