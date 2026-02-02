import type { Category, ConnectionsPuzzle } from '@/types/games';

export interface GuessResult {
  correct: boolean;
  category?: Category;
  isOneAway: boolean;
}

/**
 * Check if selected words match any category
 */
export function checkGuess(
  selectedWords: string[],
  categories: Category[]
): GuessResult {
  if (selectedWords.length !== 4) {
    return { correct: false, isOneAway: false };
  }

  for (const category of categories) {
    const matches = selectedWords.filter((word) =>
      category.words.includes(word)
    ).length;

    if (matches === 4) {
      return { correct: true, category, isOneAway: false };
    }

    if (matches === 3) {
      return { correct: false, isOneAway: true };
    }
  }

  return { correct: false, isOneAway: false };
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
export function shuffleWords<T>(words: T[]): T[] {
  const shuffled = [...words];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get all words from a puzzle in shuffled order
 */
export function getShuffledWords(puzzle: ConnectionsPuzzle): string[] {
  const allWords = puzzle.categories.flatMap((cat) => cat.words);
  return shuffleWords(allWords);
}

/**
 * Get remaining unsolved categories
 */
export function getRemainingCategories(
  puzzle: ConnectionsPuzzle,
  solvedCategoryNames: string[]
): Category[] {
  return puzzle.categories.filter(
    (cat) => !solvedCategoryNames.includes(cat.name)
  );
}
