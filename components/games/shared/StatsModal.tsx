import { View, Text, Modal, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useGameColors } from '@/hooks/games/use-game-colors';

interface StatItem {
  label: string;
  value: string | number;
}

interface StreakInfo {
  current: number;
  max: number;
}

interface StatsModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  stats: StatItem[];
  distribution?: {
    label: string;
    data: { key: string; count: number; highlight?: boolean }[];
  };
  streak?: StreakInfo;
}

export function StatsModal({
  visible,
  onClose,
  title,
  stats,
  distribution,
  streak,
}: StatsModalProps) {
  const colors = useGameColors();

  // Find max for distribution bar scaling
  const maxCount = distribution
    ? Math.max(...distribution.data.map(d => d.count), 1)
    : 1;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.container, { backgroundColor: colors.surface }]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              {title}
            </Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Text style={[styles.closeIcon, { color: colors.textSecondary }]}>
                ✕
              </Text>
            </Pressable>
          </View>

          <ScrollView style={styles.content}>
            {/* Streak Section */}
            {streak && streak.current > 0 && (
              <View style={styles.streakSection}>
                <View style={styles.streakItem}>
                  <Text style={[styles.streakValue, { color: '#f5793a' }]}>
                    {streak.current}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                    Current{'\n'}Streak
                  </Text>
                </View>
                <View style={styles.streakItem}>
                  <Text style={[styles.streakValue, { color: colors.textPrimary }]}>
                    {streak.max}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                    Best{'\n'}Streak
                  </Text>
                </View>
              </View>
            )}

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              {stats.map((stat, index) => (
                <View key={index} style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                    {stat.value}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                    {stat.label}
                  </Text>
                </View>
              ))}
            </View>

            {/* Distribution (e.g., guess distribution for Wordle) */}
            {distribution && (
              <View style={styles.distributionContainer}>
                <Text style={[styles.distributionTitle, { color: colors.textPrimary }]}>
                  {distribution.label}
                </Text>
                {distribution.data.map((item) => (
                  <View key={item.key} style={styles.distributionRow}>
                    <Text style={[styles.distributionKey, { color: colors.textPrimary }]}>
                      {item.key}
                    </Text>
                    <View style={styles.distributionBarContainer}>
                      <View
                        style={[
                          styles.distributionBar,
                          {
                            width: `${Math.max((item.count / maxCount) * 100, 8)}%`,
                            backgroundColor: item.highlight ? '#6aaa64' : colors.textSecondary,
                          },
                        ]}
                      >
                        <Text style={styles.distributionCount}>{item.count}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  streakSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  streakItem: {
    alignItems: 'center',
  },
  streakValue: {
    fontSize: 36,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
    minWidth: 70,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 4,
  },
  distributionContainer: {
    marginTop: 8,
  },
  distributionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  distributionKey: {
    width: 16,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
  },
  distributionBarContainer: {
    flex: 1,
  },
  distributionBar: {
    minHeight: 24,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
  },
  distributionCount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
