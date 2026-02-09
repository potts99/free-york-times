import { useState, useCallback, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { getRandomConnectionsPuzzle } from '@/data/games/connections-puzzles';
import { checkGuess, shuffleWords, getShuffledWords } from '@/utils/games/connections-logic';
import { generateConnectionsPuzzle } from '@/services/llm';
import type {
  ConnectionsGameState,
  ConnectionsStats,
  ConnectionsPuzzle,
  SolvedCategory,
  GameStatus,
} from '@/types/games';
import { MAX_MISTAKES, WORDS_PER_CATEGORY } from '@/types/games';
import type { GameType } from '@/types/games/streak';

const STORAGE_KEY_STATE = 'connections_game_state';
const STORAGE_KEY_STATS = 'connections_statistics';

const initialStats: ConnectionsStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  perfectGames: 0,
};

const MAX_HINTS = 2;

interface UseConnectionsGameOptions {
  onGameComplete?: (gameType: GameType) => void;
}

export function useConnectionsGame(options: UseConnectionsGameOptions = {}) {
  const { onGameComplete } = options;
  const hasRecordedCompletion = useRef(false);
  const [puzzle, setPuzzle] = useState<ConnectionsPuzzle | null>(null);
  const [remainingWords, setRemainingWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [solvedCategories, setSolvedCategories] = useState<SolvedCategory[]>([]);
  const [mistakesRemaining, setMistakesRemaining] = useState(MAX_MISTAKES);
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
  const [isLoaded, setIsLoaded] = useState(false);
  const [stats, setStats] = useState<ConnectionsStats>(initialStats);
  const [message, setMessage] = useState<string | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [hintedWord, setHintedWord] = useState<string | null>(null);

  const hintsRemaining = MAX_HINTS - hintsUsed;

  // Load game state from storage
  useEffect(() => {
    const loadGame = async () => {
      try {
        const [stateJson, statsJson] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY_STATE),
          AsyncStorage.getItem(STORAGE_KEY_STATS),
        ]);

        if (statsJson) {
          const savedStats = JSON.parse(statsJson);
          setStats({
            gamesPlayed: savedStats.gamesPlayed ?? 0,
            gamesWon: savedStats.gamesWon ?? 0,
            perfectGames: savedStats.perfectGames ?? 0,
          });
        }

        if (stateJson) {
          const savedState = JSON.parse(stateJson);
          // Load saved game if still in progress
          if (savedState.gameStatus === 'playing') {
            setPuzzle(savedState.puzzle);
            setRemainingWords(savedState.remainingWords);
            setSelectedWords(savedState.selectedWords);
            setSolvedCategories(savedState.solvedCategories);
            setMistakesRemaining(savedState.mistakesRemaining);
            setGameStatus(savedState.gameStatus);
            setHintsUsed(savedState.hintsUsed ?? 0);
          } else {
            // Previous game was finished, show the completed board
            setPuzzle(savedState.puzzle);
            setSolvedCategories(savedState.solvedCategories);
            setRemainingWords([]);
            setGameStatus(savedState.gameStatus);
            setMistakesRemaining(savedState.mistakesRemaining);
            setHintsUsed(savedState.hintsUsed ?? 0);
          }
        } else {
          // No saved state, start fresh
          const newPuzzle = getRandomConnectionsPuzzle();
          setPuzzle(newPuzzle);
          setRemainingWords(getShuffledWords(newPuzzle));
        }
      } catch (error) {
        console.error('Failed to load game state:', error);
        const newPuzzle = getRandomConnectionsPuzzle();
        setPuzzle(newPuzzle);
        setRemainingWords(getShuffledWords(newPuzzle));
      } finally {
        setIsLoaded(true);
      }
    };

    loadGame();
  }, []);

  // Save game state to storage
  useEffect(() => {
    if (!isLoaded || !puzzle) return;

    const saveGame = async () => {
      const state = {
        puzzle,
        remainingWords,
        selectedWords,
        solvedCategories,
        mistakesRemaining,
        gameStatus,
        hintsUsed,
      };

      try {
        await AsyncStorage.setItem(STORAGE_KEY_STATE, JSON.stringify(state));
      } catch (error) {
        console.error('Failed to save game state:', error);
      }
    };

    saveGame();
  }, [remainingWords, selectedWords, solvedCategories, mistakesRemaining, gameStatus, isLoaded, puzzle, hintsUsed]);

  // Save stats to storage
  const saveStats = useCallback(async (newStats: ConnectionsStats) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(newStats));
    } catch (error) {
      console.error('Failed to save stats:', error);
    }
  }, []);

  // Show temporary message
  const showMessage = useCallback((msg: string, duration = 1500) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), duration);
  }, []);

  // Handle word selection
  const onWordPress = useCallback(
    (word: string) => {
      if (gameStatus !== 'playing' || isRevealing) return;

      setSelectedWords((prev) => {
        if (prev.includes(word)) {
          // Deselect
          return prev.filter((w) => w !== word);
        }
        if (prev.length >= WORDS_PER_CATEGORY) {
          // Already have 4 selected
          return prev;
        }
        // Select
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (e) {
          // Haptics may not be available
        }
        return [...prev, word];
      });
    },
    [gameStatus, isRevealing]
  );

  // Handle submit
  const onSubmit = useCallback(() => {
    if (gameStatus !== 'playing' || selectedWords.length !== WORDS_PER_CATEGORY || !puzzle) {
      return;
    }

    // Get remaining (unsolved) categories
    const solvedNames = solvedCategories.map((c) => c.name);
    const remainingCategories = puzzle.categories.filter(
      (c) => !solvedNames.includes(c.name)
    );

    const result = checkGuess(selectedWords, remainingCategories);

    if (result.correct && result.category) {
      // Correct guess!
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (e) {
        // Haptics may not be available
      }
      setIsRevealing(true);

      const solvedCategory: SolvedCategory = {
        ...result.category,
        solvedAt: Date.now(),
      };

      setSolvedCategories((prev) => [...prev, solvedCategory]);
      setRemainingWords((prev) =>
        prev.filter((w) => !result.category!.words.includes(w))
      );
      setSelectedWords([]);

      setTimeout(() => {
        setIsRevealing(false);

        // Check for win
        if (solvedCategories.length + 1 === puzzle.categories.length) {
          setGameStatus('won');
          const isPerfect = mistakesRemaining === MAX_MISTAKES;

          const newStats: ConnectionsStats = {
            gamesPlayed: stats.gamesPlayed + 1,
            gamesWon: stats.gamesWon + 1,
            perfectGames: isPerfect ? stats.perfectGames + 1 : stats.perfectGames,
          };
          setStats(newStats);
          saveStats(newStats);

          // Record game completion for streak tracking
          if (!hasRecordedCompletion.current && onGameComplete) {
            hasRecordedCompletion.current = true;
            onGameComplete('connections');
          }

          showMessage(isPerfect ? 'Perfect!' : 'You won!', 2000);
        }
      }, 500);
    } else {
      // Wrong guess
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } catch (e) {
        // Haptics may not be available
      }

      if (result.isOneAway) {
        showMessage('One away!');
      }

      const newMistakes = mistakesRemaining - 1;
      setMistakesRemaining(newMistakes);
      setSelectedWords([]);

      if (newMistakes === 0) {
        // Game over - reveal remaining categories
        setGameStatus('lost');

        const newStats: ConnectionsStats = {
          ...stats,
          gamesPlayed: stats.gamesPlayed + 1,
        };
        setStats(newStats);
        saveStats(newStats);

        // Reveal all remaining categories
        const remaining = puzzle.categories.filter(
          (c) => !solvedNames.includes(c.name)
        );
        const revealedCategories: SolvedCategory[] = remaining.map((c) => ({
          ...c,
          solvedAt: Date.now(),
        }));
        setSolvedCategories((prev) => [...prev, ...revealedCategories]);
        setRemainingWords([]);

        showMessage('Better luck next time!', 2000);
      }
    }
  }, [
    gameStatus,
    selectedWords,
    puzzle,
    solvedCategories,
    mistakesRemaining,
    stats,
    saveStats,
    showMessage,
    isRevealing,
    onGameComplete,
  ]);

  // Handle shuffle
  const onShuffle = useCallback(() => {
    if (gameStatus !== 'playing') return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {
      // Haptics may not be available
    }
    setRemainingWords((prev) => shuffleWords(prev));
  }, [gameStatus]);

  // Handle deselect all
  const onDeselectAll = useCallback(() => {
    setSelectedWords([]);
  }, []);

  // Use a hint - highlights one word from an unsolved category
  const useHint = useCallback(() => {
    if (!puzzle || gameStatus !== 'playing' || hintsUsed >= MAX_HINTS) {
      return;
    }

    // Find unsolved categories
    const solvedNames = solvedCategories.map((c) => c.name);
    const unsolvedCategories = puzzle.categories.filter(
      (c) => !solvedNames.includes(c.name)
    );

    if (unsolvedCategories.length === 0) return;

    // Get the easiest unsolved category (lowest difficulty)
    const easiestCategory = unsolvedCategories.reduce((prev, curr) =>
      curr.difficulty < prev.difficulty ? curr : prev
    );

    // Find a word from this category that's still in remaining words
    const hintWord = easiestCategory.words.find((w) =>
      remainingWords.includes(w)
    );

    if (hintWord) {
      setHintedWord(hintWord);
      setHintsUsed((prev) => prev + 1);
      showMessage(`"${hintWord}" is in the ${easiestCategory.difficulty === 1 ? 'yellow' : easiestCategory.difficulty === 2 ? 'green' : easiestCategory.difficulty === 3 ? 'blue' : 'purple'} category`, 3000);

      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {
        // Haptics may not be available
      }

      // Clear the hint highlight after a delay
      setTimeout(() => {
        setHintedWord(null);
      }, 3000);
    }
  }, [puzzle, gameStatus, hintsUsed, solvedCategories, remainingWords, showMessage]);

  // Start a new game
  const startNewGame = useCallback(() => {
    const newPuzzle = getRandomConnectionsPuzzle();
    setPuzzle(newPuzzle);
    setRemainingWords(getShuffledWords(newPuzzle));
    setSelectedWords([]);
    setSolvedCategories([]);
    setMistakesRemaining(MAX_MISTAKES);
    setGameStatus('playing');
    setIsRevealing(false);
    setHintsUsed(0);
    setHintedWord(null);
    hasRecordedCompletion.current = false;
  }, []);

  // Quit the current game
  const quitGame = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY_STATE);
      const newPuzzle = getRandomConnectionsPuzzle();
      setPuzzle(newPuzzle);
      setRemainingWords(getShuffledWords(newPuzzle));
      setSelectedWords([]);
      setSolvedCategories([]);
      setMistakesRemaining(MAX_MISTAKES);
      setGameStatus('playing');
      setIsRevealing(false);
      setHintsUsed(0);
      setHintedWord(null);
      hasRecordedCompletion.current = false;
    } catch (error) {
      console.error('Failed to quit game:', error);
    }
  }, []);

  // Start a new AI-generated game
  const startAIGame = useCallback(async () => {
    setIsGenerating(true);
    try {
      const aiPuzzle = await generateConnectionsPuzzle();
      if (aiPuzzle) {
        setPuzzle(aiPuzzle);
        setRemainingWords(getShuffledWords(aiPuzzle));
        setSelectedWords([]);
        setSolvedCategories([]);
        setMistakesRemaining(MAX_MISTAKES);
        setGameStatus('playing');
        setIsRevealing(false);
        setHintsUsed(0);
        setHintedWord(null);
        hasRecordedCompletion.current = false;
      } else {
        // Fallback to random puzzle if AI fails
        showMessage('AI unavailable, using random puzzle');
        startNewGame();
      }
    } catch (error) {
      console.error('Failed to generate AI puzzle:', error);
      showMessage('AI unavailable, using random puzzle');
      startNewGame();
    } finally {
      setIsGenerating(false);
    }
  }, [startNewGame, showMessage]);

  return {
    puzzle,
    remainingWords,
    selectedWords,
    solvedCategories,
    mistakesRemaining,
    gameStatus,
    isLoaded,
    stats,
    message,
    isRevealing,
    hintsRemaining,
    hintedWord,
    onWordPress,
    onSubmit,
    onShuffle,
    onDeselectAll,
    startNewGame,
    startAIGame,
    quitGame,
    isGenerating,
    useHint,
  };
}
