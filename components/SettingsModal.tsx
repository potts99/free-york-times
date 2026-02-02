import { View, Text, Modal, StyleSheet, Pressable, Switch, ScrollView } from 'react-native';
import { useSettings, ThemeMode, SudokuDifficulty } from '@/hooks/use-settings';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

const DIFFICULTY_OPTIONS: { value: SudokuDifficulty; label: string; description: string }[] = [
  { value: 'easy', label: 'Easy', description: '~38 clues' },
  { value: 'medium', label: 'Medium', description: '~30 clues' },
  { value: 'hard', label: 'Hard', description: '~24 clues' },
];

export function SettingsModal({ visible, onClose }: SettingsModalProps) {
  const { settings, updateSetting } = useSettings();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={styles.container}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Settings</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeIcon}>✕</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.content}>
            {/* Theme Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Appearance</Text>
              <View style={styles.optionGroup}>
                {THEME_OPTIONS.map((option) => (
                  <Pressable
                    key={option.value}
                    style={[
                      styles.optionButton,
                      settings.theme === option.value && styles.optionButtonActive,
                    ]}
                    onPress={() => updateSetting('theme', option.value)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        settings.theme === option.value && styles.optionTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Sudoku Difficulty Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sudoku Default Difficulty</Text>
              <View style={styles.optionGroup}>
                {DIFFICULTY_OPTIONS.map((option) => (
                  <Pressable
                    key={option.value}
                    style={[
                      styles.optionButton,
                      settings.sudokuDifficulty === option.value && styles.optionButtonActive,
                    ]}
                    onPress={() => updateSetting('sudokuDifficulty', option.value)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        settings.sudokuDifficulty === option.value && styles.optionTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Toggle Settings */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Game Options</Text>

              <View style={styles.toggleRow}>
                <View style={styles.toggleInfo}>
                  <Text style={styles.toggleLabel}>Haptic Feedback</Text>
                  <Text style={styles.toggleDescription}>
                    Vibrate on key presses and game events
                  </Text>
                </View>
                <Switch
                  value={settings.hapticsEnabled}
                  onValueChange={(value) => updateSetting('hapticsEnabled', value)}
                  trackColor={{ false: '#ccc', true: '#6aaa64' }}
                  thumbColor="#fff"
                />
              </View>

              <View style={styles.toggleRow}>
                <View style={styles.toggleInfo}>
                  <Text style={styles.toggleLabel}>Wordle Hard Mode</Text>
                  <Text style={styles.toggleDescription}>
                    Must use revealed hints in subsequent guesses
                  </Text>
                </View>
                <Switch
                  value={settings.wordleHardMode}
                  onValueChange={(value) => updateSetting('wordleHardMode', value)}
                  trackColor={{ false: '#ccc', true: '#6aaa64' }}
                  thumbColor="#fff"
                />
              </View>
            </View>

            {/* About Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.aboutText}>Free York Games v1.0.0</Text>
              <Text style={styles.aboutText}>A collection of daily puzzle games</Text>
            </View>
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
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1b',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 18,
    fontWeight: '600',
    color: '#787c7e',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#787c7e',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  optionGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f6f7f8',
    alignItems: 'center',
  },
  optionButtonActive: {
    backgroundColor: '#1a1a1b',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1b',
  },
  optionTextActive: {
    color: '#fff',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  toggleInfo: {
    flex: 1,
    marginRight: 16,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1b',
  },
  toggleDescription: {
    fontSize: 13,
    color: '#787c7e',
    marginTop: 2,
  },
  aboutText: {
    fontSize: 14,
    color: '#787c7e',
    marginBottom: 4,
  },
});
