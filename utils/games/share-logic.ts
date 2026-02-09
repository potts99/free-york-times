import type { LetterState } from '@/types/games';
import type { SolvedCategory } from '@/types/games';

/**
 * Generate shareable text for a Wordle game result.
 *
 * Example output:
 * Free York Wordle 🔥7
 * 4/6
 *
 * ⬛⬛🟨⬛⬛
 * ⬛🟩⬛⬛🟨
 * 🟩🟩🟩⬛🟩
 * 🟩🟩🟩🟩🟩
 */
export function generateWordleShareText(
  guesses: string[],
  targetWord: string,
  streak: number,
  won: boolean
): string {
  const streakText = streak > 0 ? ` 🔥${streak}` : '';
  const header = `Free York Wordle${streakText}\n`;
  const result = won ? `${guesses.length}/6\n\n` : `X/6\n\n`;

  const grid = guesses
    .map((guess) => {
      return guess
        .split('')
        .map((letter, i) => {
          const upperLetter = letter.toUpperCase();
          const targetLetter = targetWord[i].toUpperCase();
          if (upperLetter === targetLetter) return '🟩';
          if (targetWord.toUpperCase().includes(upperLetter)) return '🟨';
          return '⬛';
        })
        .join('');
    })
    .join('\n');

  return `${header}${result}${grid}`;
}

/**
 * Generate shareable text for a Connections game result.
 *
 * Example output:
 * Free York Connections 🔥5
 * 🟨🟨🟨🟨
 * 🟩🟩🟩🟩
 * 🟦🟦🟦🟦
 * 🟪🟪🟪🟪
 */
export function generateConnectionsShareText(
  solvedCategories: SolvedCategory[],
  streak: number
): string {
  const colorMap: Record<number, string> = {
    1: '🟨', // yellow - easiest
    2: '🟩', // green
    3: '🟦', // blue
    4: '🟪', // purple - hardest
  };

  const streakText = streak > 0 ? ` 🔥${streak}` : '';
  const header = `Free York Connections${streakText}\n`;

  // Sort by solved order and generate grid
  const grid = [...solvedCategories]
    .sort((a, b) => (a.solvedAt || 0) - (b.solvedAt || 0))
    .map((cat) => (colorMap[cat.difficulty] || '⬜').repeat(4))
    .join('\n');

  return `${header}${grid}`;
}

/**
 * Format milliseconds as M:SS string.
 */
function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Generate shareable text for a Crossword game result.
 *
 * Example output:
 * Free York Mini 🔥7
 * Time: 3:45
 */
export function generateCrosswordShareText(
  elapsedTime: number,
  streak: number
): string {
  const streakText = streak > 0 ? ` 🔥${streak}` : '';
  const timeStr = formatTime(elapsedTime);

  return `Free York Mini${streakText}\nTime: ${timeStr}`;
}

/**
 * Generate shareable text for a Sudoku game result.
 *
 * Example output:
 * Free York Sudoku (Medium) 🔥2
 * Time: 12:34
 * No hints used
 */
export function generateSudokuShareText(
  difficulty: string,
  elapsedTime: number,
  hintsUsed: number,
  streak: number
): string {
  const streakText = streak > 0 ? ` 🔥${streak}` : '';
  const timeStr = formatTime(elapsedTime);
  const diffLabel = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  const hintText =
    hintsUsed === 0
      ? 'No hints used'
      : `${hintsUsed} hint${hintsUsed > 1 ? 's' : ''} used`;

  return `Free York Sudoku (${diffLabel})${streakText}\nTime: ${timeStr}\n${hintText}`;
}
