import { Share, Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';

export interface ShareResult {
  success: boolean;
  method: 'share' | 'clipboard';
}

/**
 * Share results using platform-appropriate method.
 * On native (iOS/Android): Uses the system share sheet
 * On web: Copies to clipboard
 *
 * @param text The text to share
 * @returns Object indicating success and method used
 */
export async function shareResults(text: string): Promise<ShareResult> {
  try {
    if (Platform.OS === 'web') {
      // Web: Use clipboard
      await Clipboard.setStringAsync(text);
      return { success: true, method: 'clipboard' };
    } else {
      // Native: Use share sheet
      const result = await Share.share({
        message: text,
      });

      if (result.action === Share.sharedAction) {
        return { success: true, method: 'share' };
      } else if (result.action === Share.dismissedAction) {
        // User dismissed the share sheet - still counts as handled
        return { success: false, method: 'share' };
      }

      return { success: true, method: 'share' };
    }
  } catch (error) {
    console.error('Failed to share:', error);

    // Fallback to clipboard if share fails
    try {
      await Clipboard.setStringAsync(text);
      return { success: true, method: 'clipboard' };
    } catch (clipboardError) {
      console.error('Failed to copy to clipboard:', clipboardError);
      return { success: false, method: 'clipboard' };
    }
  }
}

/**
 * Copy text directly to clipboard.
 *
 * @param text The text to copy
 * @returns Boolean indicating success
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await Clipboard.setStringAsync(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}
