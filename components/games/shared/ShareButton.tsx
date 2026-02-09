import { Pressable, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import * as Haptics from 'expo-haptics';
import { useGameColors } from '@/hooks/games/use-game-colors';
import { shareResults, ShareResult } from '@/utils/share';

interface ShareButtonProps {
  shareText: string;
  onShareComplete?: (result: ShareResult) => void;
  disabled?: boolean;
}

export function ShareButton({
  shareText,
  onShareComplete,
  disabled = false,
}: ShareButtonProps) {
  const colors = useGameColors();
  const [isSharing, setIsSharing] = useState(false);

  const handlePress = async () => {
    if (disabled || isSharing) return;

    setIsSharing(true);
    try {
      const result = await shareResults(shareText);

      if (result.success) {
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {
          // Haptics may not be available
        }
      }

      onShareComplete?.(result);
    } catch (error) {
      console.error('Share failed:', error);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Pressable
      style={[
        styles.button,
        { backgroundColor: colors.correct },
        disabled && styles.disabled,
      ]}
      onPress={handlePress}
      disabled={disabled || isSharing}
    >
      {isSharing ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <Text style={styles.text}>Share</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    minWidth: 100,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  disabled: {
    opacity: 0.5,
  },
});
