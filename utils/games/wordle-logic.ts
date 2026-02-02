import type { LetterState } from '@/types/games';
import { WORDLE_ANSWERS } from '@/data/games/wordle-answers';
import { isValidWord as checkDictionary } from '@/data/games/wordle-dictionary';

export { isValidWord } from '@/data/games/wordle-dictionary';

/**
 * Evaluates a guess against the target word
 * Returns an array of states for each letter position
 */
export function evaluateGuess(guess: string, target: string): LetterState[] {
  const guessUpper = guess.toUpperCase();
  const targetUpper = target.toUpperCase();
  const result: LetterState[] = Array(5).fill('absent');
  const targetLetters = targetUpper.split('');
  const guessLetters = guessUpper.split('');

  // First pass: mark correct positions (green)
  for (let i = 0; i < 5; i++) {
    if (guessLetters[i] === targetLetters[i]) {
      result[i] = 'correct';
      targetLetters[i] = '#'; // Mark as used
      guessLetters[i] = '*'; // Mark as matched
    }
  }

  // Second pass: mark present letters (yellow)
  for (let i = 0; i < 5; i++) {
    if (guessLetters[i] === '*') continue; // Already matched
    const targetIndex = targetLetters.indexOf(guessLetters[i]);
    if (targetIndex !== -1) {
      result[i] = 'present';
      targetLetters[targetIndex] = '#'; // Mark as used
    }
  }

  return result;
}

/**
 * Updates keyboard state based on a new guess evaluation
 * Correct > Present > Absent (only upgrades, never downgrades)
 */
export function updateKeyboardState(
  currentState: Record<string, LetterState>,
  guess: string,
  evaluation: LetterState[]
): Record<string, LetterState> {
  const newState = { ...currentState };
  const guessUpper = guess.toUpperCase();

  for (let i = 0; i < guessUpper.length; i++) {
    const letter = guessUpper[i];
    const newEval = evaluation[i];
    const existing = newState[letter];

    // Priority: correct > present > absent
    if (
      !existing ||
      (existing === 'absent' && newEval !== 'absent') ||
      (existing === 'present' && newEval === 'correct')
    ) {
      newState[letter] = newEval;
    }
  }

  return newState;
}

/**
 * Gets a random word for the game
 * Optionally excludes recently used words to avoid immediate repeats
 */
export function getRandomWord(excludeWords: string[] = []): string {
  const available = WORDLE_ANSWERS.filter(w => !excludeWords.includes(w));
  const pool = available.length > 0 ? available : WORDLE_ANSWERS;
  return pool[Math.floor(Math.random() * pool.length)];
}
