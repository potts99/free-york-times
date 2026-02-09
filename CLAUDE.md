# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## App Info

- **Name**: Infinite Mini
- **Bundle ID**: `com.infinitemini.app`
- **EAS Project**: `@potts99/free-york-times`

## Commands

```bash
npm run start      # Start Expo dev server (Expo Go - limited features)
npm run ios        # Build and run on iOS simulator (native build required for LLM)
npm run android    # Build and run on Android emulator (native build required for LLM)
npm run web        # Run in web browser
npm run lint       # Run ESLint
npx expo prebuild  # Generate native iOS/Android projects
```

## EAS Build & Update

```bash
eas build --platform ios --profile preview    # Build iOS for internal testing
eas build --platform ios --profile production # Build iOS for App Store
eas update --channel preview                  # Push OTA update to preview builds
eas update --channel production               # Push OTA update to production builds
```

Build profiles are configured in `eas.json` with corresponding update channels:
- `development` → `development` channel (simulator builds)
- `preview` → `preview` channel (internal device testing)
- `production` → `production` channel (App Store releases)

## Tech Stack

- **Expo 54** with React Native 0.81.5 and React 19.1.0
- **TypeScript** with strict mode enabled
- **Expo Router** for file-based navigation
- **React Native Reanimated 4.x** for animations
- **AsyncStorage** for game state persistence
- **llama.rn** for local LLM inference (AI puzzle generation)
- **expo-file-system** for model storage
- **expo-updates** for OTA updates via EAS
- Targets iOS, Android, and Web

## Architecture

This is a NYT-style games app with four games: Wordle, Connections, Crossword, and Sudoku.

### Directory Structure

- `app/` - Expo Router screens
  - `(tabs)/` - Bottom tab navigation (Games hub at index)
  - `games/` - Stack navigator containing game screens
- `components/games/` - Game UI components organized by game (`wordle/`, `connections/`, `crossword/`, `sudoku/`, `shared/`)
- `hooks/games/` - Game state hooks (one per game, e.g., `use-wordle-game.ts`)
- `hooks/` - Root-level hooks (`use-llm.ts`, `use-color-scheme.ts`, `use-settings.ts`)
- `utils/games/` - Pure game logic functions (validation, evaluation, puzzle generation)
- `types/games/` - TypeScript interfaces per game
- `data/games/` - Puzzle data (word lists, puzzle definitions)
- `constants/games/` - Colors and animation timing configs
- `services/llm/` - Local LLM integration for AI puzzle generation

### Game Implementation Pattern

Each game follows this pattern:
1. **Screen** (`app/games/<game>.tsx`) - Renders UI, uses the game hook
2. **Hook** (`hooks/games/use-<game>-game.ts`) - Manages state, persistence, game actions
3. **Logic** (`utils/games/<game>-logic.ts`) - Pure functions for game rules
4. **Types** (`types/games/<game>.ts`) - TypeScript definitions
5. **Data** (`data/games/<game>-*.ts`) - Puzzle/word data
6. **Components** (`components/games/<game>/`) - UI components

### Path Aliases

Use `@/*` to import from project root (configured in tsconfig.json):
```typescript
import { useCrosswordGame } from '@/hooks/games/use-crossword-game';
```

### Theme Support

Games use `useGameColors()` hook which returns colors adapted for light/dark mode. Color constants are in `constants/games/colors.ts`.

## Games

### Wordle
- 5-letter word guessing game with 6 attempts
- **14,855 words** in dictionary (comprehensive English 5-letter words)
- Random word selection for infinite replayability
- Stats modal with games played, win %, and guess distribution
- **2 hints per game** - reveals a random unrevealed letter position
- State: guesses, tile states (correct/present/absent), keyboard state
- Storage key: `wordle_game_state`

### Connections
- Group 16 words into 4 categories of 4 words each
- Categories have difficulty levels (1-4) mapped to colors (yellow, green, blue, purple)
- Supports AI-generated puzzles via local LLM
- **2 hints per game** - highlights a word and reveals its category color
- Storage key: `connections_game_state`

### Crossword
- Classic crossword puzzle with clues
- Grid-based input with across/down navigation
- Supports AI-generated puzzles via local LLM
- **3 hints per game** - reveals the letter for the current cell
- Storage key: `crossword_game_state`

### Sudoku
- 9x9 number puzzle with difficulty levels (easy, medium, hard)
- **Procedural puzzle generation** - infinite unique puzzles
- Difficulty picker when starting new game (Easy ~38 clues, Medium ~30, Hard ~24)
- Supports notes mode for candidates
- **3 hints per game** - fills the correct number for selected cell
- Storage key: `sudoku-game-state`

## Puzzle Generation

### Sudoku (Local Algorithm)
Sudoku puzzles are generated locally using backtracking:
```typescript
import { generateSudokuPuzzle } from '@/utils/games/sudoku-logic';
const puzzle = generateSudokuPuzzle('medium'); // 'easy' | 'medium' | 'hard'
```

### AI Generation (Local LLM)
Connections and Crossword puzzles can be generated using a local LLM (DeepSeek-R1-Distill-Qwen-1.5B):
```typescript
import { generateConnectionsPuzzle, generateCrosswordPuzzle } from '@/services/llm';

const connectionsPuzzle = await generateConnectionsPuzzle();
const crosswordPuzzle = await generateCrosswordPuzzle();
```

**Note:** LLM features require a native build (`npm run ios` or `npm run android`), not Expo Go. First use downloads the model (~1.1GB).

## LLM Service

Located in `services/llm/`:
- `llm-service.ts` - Model download, loading, and inference
- `puzzle-generator.ts` - Prompts for Connections and crossword clues
- Uses llama.rn with DeepSeek-R1-Distill-Qwen-1.5B (Q4_K_M GGUF)

```typescript
import { llmService } from '@/services/llm';

// Initialize (downloads model on first use)
await llmService.initialize();

// Generate text
const response = await llmService.generate(prompt, maxTokens);

// Check status
llmService.getState(); // { status, progress, error }
```

## Animation Constants

Located in `constants/games/animations.ts`:
- `TILE_FLIP_DURATION`: 500ms
- `TILE_FLIP_DELAY`: 150ms (stagger between tiles)
- `BOUNCE_DURATION`: 150ms
- `LETTER_POP_SCALE`: 1.1
- `SHAKE_DURATION`: 400ms

## Active Games Tracking

The home screen shows in-progress games via `use-active-games.ts` hook:
- Checks AsyncStorage for all game states
- Shows progress (e.g., "3/6 guesses", "50% complete")
- Supports quit functionality for each game type

## State Persistence

All games persist state to AsyncStorage:
- Game state saved after each action
- Loads saved game on app open
- Stats tracked separately (games played, won, etc.)
- `startNewGame()` and `quitGame()` functions to manage state

## Settings

App settings are managed via `hooks/use-settings.ts` and displayed in `components/SettingsModal.tsx`.

Available settings:
- **Theme**: System / Light / Dark
- **Haptics**: Enable/disable haptic feedback
- **Sudoku Difficulty**: Default difficulty for new games (easy/medium/hard)
- **Wordle Hard Mode**: Must use revealed hints in subsequent guesses

Storage key: `app_settings`

```typescript
import { useSettings } from '@/hooks/use-settings';

const { settings, updateSetting, effectiveColorScheme } = useSettings();
updateSetting('sudokuDifficulty', 'hard');
```

## Hint System

All games include a limited hint system that resets on new game:

| Game | Hints | Behavior |
|------|-------|----------|
| Wordle | 2 | Reveals a random unrevealed letter position |
| Connections | 2 | Highlights word and shows category color |
| Crossword | 3 | Reveals letter for current/next cell |
| Sudoku | 3 | Fills correct number for selected cell |

Hints are persisted with game state and tracked via `hintsUsed` / `hintsRemaining`.

## Shared Components

Located in `components/games/shared/`:
- `GameHeader` - Title, subtitle, stats button, quit action
- `GameKeyboard` - QWERTY keyboard for Wordle/Crossword
- `StatsModal` - Reusable stats display with distribution chart
- `ShareButton` - Share results button with platform-specific behavior

## Daily Streaks

Cross-game streak tracking via `hooks/use-streak.ts`:
- Playing any game counts toward daily streak
- Streak increments when playing on consecutive days
- Resets to 1 if a day is missed
- Displayed on home screen and in share text

```typescript
import { useStreak } from '@/hooks/use-streak';

const { currentStreak, maxStreak, recordGamePlayed } = useStreak();
await recordGamePlayed('wordle'); // Call on game completion
```

Storage key: `app_streak_data`

## Share Results

Each game has share functionality via `utils/games/share-logic.ts`:
- Generates emoji-based share text (like NYT games)
- Includes streak count in share text
- Uses native share sheet on iOS/Android, clipboard on web

```typescript
import { generateWordleShareText } from '@/utils/games/share-logic';
import { shareResults } from '@/utils/share';

const text = generateWordleShareText(guesses, targetWord, streak, won);
await shareResults(text);
```

## Building

### Development (Expo Go)
```bash
npm run start
```
Note: LLM features won't work in Expo Go.

### Native Build (required for LLM)
```bash
npx expo prebuild                    # Generate native projects
npm run ios                          # Build and run iOS
npm run android                      # Build and run Android
```

If pod install fails with encoding error:
```bash
cd ios && LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 pod install --repo-update
```
