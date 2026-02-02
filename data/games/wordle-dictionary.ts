import { WORDLE_ANSWERS_SET } from './wordle-answers';

// The dictionary is now the same as the answers list (14,855 words)
// All words can be both valid guesses and potential answers
export const WORDLE_DICTIONARY: Set<string> = WORDLE_ANSWERS_SET;

export function isValidWord(word: string): boolean {
  return WORDLE_DICTIONARY.has(word.toUpperCase());
}
