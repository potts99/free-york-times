import { llmService } from './llm-service';
import type { ConnectionsPuzzle, Category, CategoryDifficulty, CategoryColor } from '@/types/games/connections';

const DIFFICULTY_COLORS: Record<CategoryDifficulty, CategoryColor> = {
  1: 'yellow',
  2: 'green',
  3: 'blue',
  4: 'purple',
};

const CONNECTIONS_PROMPT = `You are a puzzle creator for a word association game called Connections.
Create 4 groups of 4 words each. Each group shares a common theme.
Rules:
- Use single words only (no phrases)
- Words should be 3-8 letters
- Themes should range from easy (obvious category) to hard (wordplay/puns)
- Make sure no word could fit in multiple groups

Output format (JSON only, no explanation):
{
  "categories": [
    {"name": "Theme name", "words": ["WORD1", "WORD2", "WORD3", "WORD4"], "difficulty": 1},
    {"name": "Theme name", "words": ["WORD1", "WORD2", "WORD3", "WORD4"], "difficulty": 2},
    {"name": "Theme name", "words": ["WORD1", "WORD2", "WORD3", "WORD4"], "difficulty": 3},
    {"name": "Theme name", "words": ["WORD1", "WORD2", "WORD3", "WORD4"], "difficulty": 4}
  ]
}

Generate a new Connections puzzle:`;

interface GeneratedCategory {
  name: string;
  words: string[];
  difficulty: CategoryDifficulty;
}

interface GeneratedConnectionsData {
  categories: GeneratedCategory[];
}

export async function generateConnectionsPuzzle(): Promise<ConnectionsPuzzle | null> {
  try {
    if (!llmService.isReady()) {
      await llmService.initialize();
    }

    const response = await llmService.generate(CONNECTIONS_PROMPT, 600);

    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in LLM response:', response);
      return null;
    }

    const data: GeneratedConnectionsData = JSON.parse(jsonMatch[0]);

    // Validate the data
    if (!data.categories || data.categories.length !== 4) {
      console.error('Invalid categories count:', data);
      return null;
    }

    for (const cat of data.categories) {
      if (!cat.words || cat.words.length !== 4 || !cat.name) {
        console.error('Invalid category:', cat);
        return null;
      }
    }

    // Convert to ConnectionsPuzzle format
    const categories = data.categories.map((cat): Category => ({
      name: cat.name.toUpperCase(),
      words: cat.words.map(w => w.toUpperCase()),
      difficulty: cat.difficulty as CategoryDifficulty,
      color: DIFFICULTY_COLORS[cat.difficulty as CategoryDifficulty],
    }));

    // Sort by difficulty
    categories.sort((a, b) => a.difficulty - b.difficulty);

    return {
      id: `ai-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      date: new Date().toISOString().split('T')[0],
      categories: categories as [Category, Category, Category, Category],
    };
  } catch (error) {
    console.error('Failed to generate Connections puzzle:', error);
    return null;
  }
}

const CROSSWORD_CLUE_PROMPT = `Generate a short, clever crossword clue for the word "{WORD}".
Rules:
- Clue should be 3-8 words
- Can use wordplay, puns, or definitions
- Don't include the answer in the clue

Output only the clue, nothing else:`;

export async function generateCrosswordClue(word: string): Promise<string | null> {
  try {
    if (!llmService.isReady()) {
      await llmService.initialize();
    }

    const prompt = CROSSWORD_CLUE_PROMPT.replace('{WORD}', word.toUpperCase());
    const response = await llmService.generate(prompt, 50);

    // Clean up the response
    const clue = response
      .replace(/^["']|["']$/g, '') // Remove quotes
      .replace(/^\d+\.\s*/, '') // Remove numbering
      .trim();

    return clue || null;
  } catch (error) {
    console.error('Failed to generate clue for', word, error);
    return null;
  }
}

export async function generateMultipleClues(
  words: string[]
): Promise<Record<string, string>> {
  const clues: Record<string, string> = {};

  for (const word of words) {
    const clue = await generateCrosswordClue(word);
    if (clue) {
      clues[word.toUpperCase()] = clue;
    }
  }

  return clues;
}

// Crossword puzzle generation
import type { CrosswordPuzzle, CrosswordCell, Clue } from '@/types/games/crossword';

const CROSSWORD_PUZZLE_PROMPT = `You are a crossword puzzle creator. Create a valid 5x5 mini crossword puzzle.

CRITICAL RULES:
1. Every letter must form a valid English word both ACROSS and DOWN
2. All words must be common English words (no proper nouns, abbreviations, or obscure words)
3. Words should be 3-5 letters
4. Provide clever, concise clues (3-8 words each)

Output format (JSON only, no explanation):
{
  "grid": [
    ["S","T","A","R","E"],
    ["L","I","N","E","S"],
    ["A","N","G","E","L"],
    ["T","E","N","T","S"],
    ["E","S","T","S","S"]
  ],
  "across": [
    {"number": 1, "clue": "Look fixedly", "answer": "STARE"},
    {"number": 2, "clue": "Cables", "answer": "LINES"},
    {"number": 3, "clue": "Heavenly being", "answer": "ANGEL"},
    {"number": 4, "clue": "Camping shelters", "answer": "TENTS"},
    {"number": 5, "clue": "Direction suffix", "answer": "ESTSS"}
  ],
  "down": [
    {"number": 1, "clue": "Roofing material", "answer": "SLATE"},
    {"number": 2, "clue": "Small pieces", "answer": "TINES"},
    {"number": 3, "clue": "Regions", "answer": "ANGET"},
    {"number": 4, "clue": "Speed", "answer": "RENTS"},
    {"number": 5, "clue": "East directions", "answer": "ESLTS"}
  ]
}

Generate a NEW valid 5x5 mini crossword puzzle:`;

interface GeneratedCrosswordData {
  grid: string[][];
  across: Array<{ number: number; clue: string; answer: string }>;
  down: Array<{ number: number; clue: string; answer: string }>;
}

export async function generateCrosswordPuzzle(): Promise<CrosswordPuzzle | null> {
  try {
    if (!llmService.isReady()) {
      await llmService.initialize();
    }

    const response = await llmService.generate(CROSSWORD_PUZZLE_PROMPT, 1000);

    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in LLM response:', response);
      return null;
    }

    const data: GeneratedCrosswordData = JSON.parse(jsonMatch[0]);

    // Validate the data
    if (!data.grid || data.grid.length !== 5 || !data.across || !data.down) {
      console.error('Invalid crossword data:', data);
      return null;
    }

    // Validate grid dimensions
    for (const row of data.grid) {
      if (row.length !== 5) {
        console.error('Invalid row length in grid');
        return null;
      }
    }

    // Build the CrosswordPuzzle format
    const grid: CrosswordCell[][] = [];
    let clueNumber = 1;
    const clueNumbers: { row: number; col: number; number: number }[] = [];

    // First pass: identify where clue numbers go
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        const letter = data.grid[row][col];
        if (letter && letter !== '.') {
          // Check if this is the start of an across or down word
          const startsAcross = col === 0 || data.grid[row][col - 1] === '.';
          const startsDown = row === 0 || data.grid[row - 1][col] === '.';

          if (startsAcross || startsDown) {
            clueNumbers.push({ row, col, number: clueNumber });
            clueNumber++;
          }
        }
      }
    }

    // Build grid with numbers
    for (let row = 0; row < 5; row++) {
      const gridRow: CrosswordCell[] = [];
      for (let col = 0; col < 5; col++) {
        const letter = data.grid[row][col];
        const isBlack = letter === '.';
        const clueEntry = clueNumbers.find(c => c.row === row && c.col === col);

        gridRow.push({
          letter: isBlack ? null : letter.toUpperCase(),
          number: clueEntry?.number,
          isBlack,
        });
      }
      grid.push(gridRow);
    }

    // Build clues
    const acrossClues: Clue[] = data.across.map((c, i) => ({
      number: i + 1,
      text: c.clue,
      answer: c.answer.toUpperCase(),
      startRow: i,
      startCol: 0,
      length: 5,
      direction: 'across' as const,
    }));

    const downClues: Clue[] = data.down.map((c, i) => ({
      number: i + 1,
      text: c.clue,
      answer: c.answer.toUpperCase(),
      startRow: 0,
      startCol: i,
      length: 5,
      direction: 'down' as const,
    }));

    return {
      id: `ai-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      date: new Date().toISOString().split('T')[0],
      title: 'AI Mini Crossword',
      author: 'AI Generated',
      size: { rows: 5, cols: 5 },
      grid,
      clues: {
        across: acrossClues,
        down: downClues,
      },
    };
  } catch (error) {
    console.error('Failed to generate Crossword puzzle:', error);
    return null;
  }
}
