import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import {
  getRandomWord,
  isValidWord,
  evaluateGuess,
  updateKeyboardState,
} from '@/utils/games/wordle-logic';
import type { WordleGameState, WordleStats, LetterState, GameStatus } from '@/types/games';
import { WORD_LENGTH, MAX_GUESSES } from '@/types/games';

const STORAGE_KEY_STATE = 'wordle_game_state';
const STORAGE_KEY_STATS = 'wordle_statistics';

const initialStats: WordleStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  guessDistribution: [0, 0, 0, 0, 0, 0],
};

const MAX_HINTS = 2;

export function useWordleGame() {
  const [targetWord, setTargetWord] = useState<string>('');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
  const [letterStates, setLetterStates] = useState<Record<string, LetterState>>({});
  const [isRevealing, setIsRevealing] = useState(false);
  const [revealingRow, setRevealingRow] = useState(-1);
  const [shouldShake, setShouldShake] = useState(false);
  const [shouldBounce, setShouldBounce] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [stats, setStats] = useState<WordleStats>(initialStats);
  const [message, setMessage] = useState<string | null>(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [revealedHints, setRevealedHints] = useState<number[]>([]);

  const currentRow = guesses.length;
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
          // Ensure stats have the correct shape (handles migration from old format)
          setStats({
            gamesPlayed: savedStats.gamesPlayed ?? 0,
            gamesWon: savedStats.gamesWon ?? 0,
            guessDistribution: Array.isArray(savedStats.guessDistribution)
              ? savedStats.guessDistribution
              : [0, 0, 0, 0, 0, 0],
          });
        }

        if (stateJson) {
          const savedState = JSON.parse(stateJson);
          // Load saved game if it's still in progress
          if (savedState.gameStatus === 'playing') {
            setTargetWord(savedState.targetWord);
            setGuesses(savedState.guesses);
            setCurrentGuess(savedState.currentGuess);
            setGameStatus(savedState.gameStatus);
            setLetterStates(savedState.letterStates);
            setHintsUsed(savedState.hintsUsed ?? 0);
            setRevealedHints(savedState.revealedHints ?? []);
          } else {
            // Previous game was finished, show the completed board
            setTargetWord(savedState.targetWord);
            setGuesses(savedState.guesses);
            setGameStatus(savedState.gameStatus);
            setLetterStates(savedState.letterStates);
            setHintsUsed(savedState.hintsUsed ?? 0);
            setRevealedHints(savedState.revealedHints ?? []);
          }
        } else {
          // No saved state, start fresh
          setTargetWord(getRandomWord());
        }
      } catch (error) {
        console.error('Failed to load game state:', error);
        setTargetWord(getRandomWord());
      } finally {
        setIsLoaded(true);
      }
    };

    loadGame();
  }, []);

  // Save game state to storage
  useEffect(() => {
    if (!isLoaded || !targetWord) return;

    const saveGame = async () => {
      const state = {
        targetWord,
        guesses,
        currentGuess,
        gameStatus,
        letterStates,
        currentRow,
        isRevealing,
        hintsUsed,
        revealedHints,
      };

      try {
        await AsyncStorage.setItem(STORAGE_KEY_STATE, JSON.stringify(state));
      } catch (error) {
        console.error('Failed to save game state:', error);
      }
    };

    saveGame();
  }, [guesses, currentGuess, gameStatus, letterStates, isLoaded, targetWord, hintsUsed, revealedHints]);

  // Save stats to storage
  const saveStats = useCallback(async (newStats: WordleStats) => {
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

  // Handle key press
  const onKeyPress = useCallback(
    (key: string) => {
      if (gameStatus !== 'playing' || isRevealing) return;

      if (currentGuess.length < WORD_LENGTH) {
        setCurrentGuess((prev) => prev + key);
      }
    },
    [currentGuess, gameStatus, isRevealing]
  );

  // Handle backspace
  const onBackspace = useCallback(() => {
    if (gameStatus !== 'playing' || isRevealing) return;

    setCurrentGuess((prev) => prev.slice(0, -1));
  }, [gameStatus, isRevealing]);

  // Handle enter
  const onEnter = useCallback(() => {
    if (gameStatus !== 'playing' || isRevealing) return;

    // Check word length
    if (currentGuess.length !== WORD_LENGTH) {
      setShouldShake(true);
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } catch (e) {
        // Haptics may not be available
      }
      showMessage('Not enough letters');
      setTimeout(() => setShouldShake(false), 500);
      return;
    }

    // Check if valid word
    if (!isValidWord(currentGuess)) {
      setShouldShake(true);
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } catch (e) {
        // Haptics may not be available
      }
      showMessage('Not in word list');
      setTimeout(() => setShouldShake(false), 500);
      return;
    }

    // Submit the guess
    const evaluation = evaluateGuess(currentGuess, targetWord);
    const newLetterStates = updateKeyboardState(letterStates, currentGuess, evaluation);

    setIsRevealing(true);
    setRevealingRow(currentRow);
    setLetterStates(newLetterStates);
    setGuesses((prev) => [...prev, currentGuess.toUpperCase()]);
    setCurrentGuess('');
  }, [currentGuess, gameStatus, isRevealing, letterStates, targetWord, currentRow, showMessage]);

  // Use a hint - reveals one letter position
  const useHint = useCallback(() => {
    if (gameStatus !== 'playing' || hintsUsed >= MAX_HINTS || isRevealing) {
      return;
    }

    // Find positions that haven't been revealed yet (either by guessing correctly or by hint)
    const revealedByGuess = new Set<number>();
    guesses.forEach((guess) => {
      for (let i = 0; i < guess.length; i++) {
        if (guess[i] === targetWord[i]) {
          revealedByGuess.add(i);
        }
      }
    });

    // Get available positions (not already revealed by guess or hint)
    const availablePositions: number[] = [];
    for (let i = 0; i < WORD_LENGTH; i++) {
      if (!revealedByGuess.has(i) && !revealedHints.includes(i)) {
        availablePositions.push(i);
      }
    }

    if (availablePositions.length === 0) {
      showMessage('No hints available');
      return;
    }

    // Pick a random position to reveal
    const randomIndex = Math.floor(Math.random() * availablePositions.length);
    const positionToReveal = availablePositions[randomIndex];
    const revealedLetter = targetWord[positionToReveal];

    setRevealedHints((prev) => [...prev, positionToReveal]);
    setHintsUsed((prev) => prev + 1);
    showMessage(`Position ${positionToReveal + 1}: ${revealedLetter}`);

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {
      // Haptics may not be available
    }
  }, [gameStatus, hintsUsed, isRevealing, guesses, targetWord, revealedHints, showMessage]);

  // Start a new game
  const startNewGame = useCallback(() => {
    setTargetWord(getRandomWord());
    setGuesses([]);
    setCurrentGuess('');
    setGameStatus('playing');
    setLetterStates({});
    setIsRevealing(false);
    setRevealingRow(-1);
    setShouldShake(false);
    setShouldBounce(false);
    setHintsUsed(0);
    setRevealedHints([]);
  }, []);

  // Quit the current game
  const quitGame = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY_STATE);
      setTargetWord(getRandomWord());
      setGuesses([]);
      setCurrentGuess('');
      setGameStatus('playing');
      setLetterStates({});
      setIsRevealing(false);
      setRevealingRow(-1);
      setShouldShake(false);
      setShouldBounce(false);
      setHintsUsed(0);
      setRevealedHints([]);
    } catch (error) {
      console.error('Failed to quit game:', error);
    }
  }, []);

  // Handle reveal complete
  const onRevealComplete = useCallback(() => {
    setIsRevealing(false);
    setRevealingRow(-1);

    const lastGuess = guesses[guesses.length - 1];

    // Check for win
    if (lastGuess === targetWord) {
      setGameStatus('won');
      setShouldBounce(true);
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (e) {
        // Haptics may not be available
      }

      const guessNumber = guesses.length;
      const currentDistribution = Array.isArray(stats.guessDistribution)
        ? stats.guessDistribution
        : [0, 0, 0, 0, 0, 0];
      const newStats: WordleStats = {
        gamesPlayed: (stats.gamesPlayed ?? 0) + 1,
        gamesWon: (stats.gamesWon ?? 0) + 1,
        guessDistribution: currentDistribution.map((count, i) =>
          i === guessNumber - 1 ? count + 1 : count
        ) as WordleStats['guessDistribution'],
      };
      setStats(newStats);
      saveStats(newStats);

      const messages = ['Genius!', 'Magnificent!', 'Impressive!', 'Splendid!', 'Great!', 'Phew!'];
      showMessage(messages[guessNumber - 1] || 'Nice!', 2000);
      return;
    }

    // Check for loss
    if (guesses.length >= MAX_GUESSES) {
      setGameStatus('lost');
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } catch (e) {
        // Haptics may not be available
      }

      const newStats: WordleStats = {
        gamesPlayed: (stats.gamesPlayed ?? 0) + 1,
        gamesWon: stats.gamesWon ?? 0,
        guessDistribution: Array.isArray(stats.guessDistribution)
          ? stats.guessDistribution
          : [0, 0, 0, 0, 0, 0],
      };
      setStats(newStats);
      saveStats(newStats);

      showMessage(targetWord, 3000);
    }
  }, [guesses, targetWord, stats, saveStats, showMessage]);

  return {
    targetWord,
    guesses,
    currentGuess,
    gameStatus,
    letterStates,
    isRevealing,
    revealingRow,
    shouldShake,
    shouldBounce,
    isLoaded,
    stats,
    message,
    currentRow,
    hintsRemaining,
    revealedHints,
    onKeyPress,
    onBackspace,
    onEnter,
    onRevealComplete,
    startNewGame,
    quitGame,
    useHint,
  };
}
