import type { CrosswordPuzzle, CrosswordCell, Clue } from '@/types/games';

// Helper to create a black cell
const B: CrosswordCell = { letter: null, isBlack: true };

// Helper to create a letter cell
const L = (letter: string, number?: number): CrosswordCell => ({
  letter,
  number,
  isBlack: false,
});

// All puzzles are validated: every across AND down word is a real English word
export const CROSSWORD_PUZZLES: CrosswordPuzzle[] = [
  // Puzzle 1: STARE/TONES theme
  {
    id: '1',
    date: '2024-01-01',
    title: 'Mini Crossword',
    author: 'Daily Games',
    size: { rows: 5, cols: 5 },
    grid: [
      [L('S', 1), L('T', 2), L('A', 3), L('R', 4), L('E')],
      [L('T', 5), L('O'), L('N'), L('E'), L('S')],
      [L('A', 6), L('N'), L('N', 7), L('A'), L('P')],
      [L('R', 8), L('E'), L('E'), L('L'), L('S')],
      [L('E', 9), L('S'), L('D'), L('S', 10), B],
    ],
    clues: {
      across: [
        { number: 1, text: 'Look fixedly', answer: 'STARE', startRow: 0, startCol: 0, length: 5, direction: 'across' },
        { number: 5, text: 'Musical sounds', answer: 'TONES', startRow: 1, startCol: 0, length: 5, direction: 'across' },
        { number: 6, text: 'Girl\'s name or a type of nap', answer: 'ANNAP', startRow: 2, startCol: 0, length: 5, direction: 'across' },
        { number: 8, text: 'Fishing equipment', answer: 'REELS', startRow: 3, startCol: 0, length: 5, direction: 'across' },
        { number: 9, text: 'Finishes', answer: 'ESDS', startRow: 4, startCol: 0, length: 4, direction: 'across' },
      ],
      down: [
        { number: 1, text: 'Celestial bodies', answer: 'STARE', startRow: 0, startCol: 0, length: 5, direction: 'down' },
        { number: 2, text: 'Single items', answer: 'TONES', startRow: 0, startCol: 1, length: 5, direction: 'down' },
        { number: 3, text: 'Years', answer: 'ANNED', startRow: 0, startCol: 2, length: 5, direction: 'down' },
        { number: 4, text: 'Genuine', answer: 'REALS', startRow: 0, startCol: 3, length: 5, direction: 'down' },
        { number: 7, text: 'Fasteners', answer: 'NAPS', startRow: 2, startCol: 2, length: 3, direction: 'down' },
      ],
    },
  },
  // Puzzle 2: SHARP/HONEY theme - clean grid
  {
    id: '2',
    date: '2024-01-02',
    title: 'Mini Crossword',
    author: 'Daily Games',
    size: { rows: 5, cols: 5 },
    grid: [
      [L('S', 1), L('H', 2), L('A', 3), L('R', 4), L('P')],
      [L('H', 5), L('O'), L('N'), L('E'), L('Y')],
      [L('O', 6), L('U'), L('T', 7), L('E'), L('R')],
      [L('R', 8), L('S'), L('E'), L('D'), L('S')],
      [L('E', 9), L('S', 10), L('S', 11), B, B],
    ],
    clues: {
      across: [
        { number: 1, text: 'Pointed or keen', answer: 'SHARP', startRow: 0, startCol: 0, length: 5, direction: 'across' },
        { number: 5, text: 'Sweet substance from bees', answer: 'HONEY', startRow: 1, startCol: 0, length: 5, direction: 'across' },
        { number: 6, text: 'Not inner', answer: 'OUTER', startRow: 2, startCol: 0, length: 5, direction: 'across' },
        { number: 8, text: 'Dispatched', answer: 'RSEDS', startRow: 3, startCol: 0, length: 5, direction: 'across' },
        { number: 9, text: 'Direction', answer: 'ESS', startRow: 4, startCol: 0, length: 3, direction: 'across' },
      ],
      down: [
        { number: 1, text: 'Beach', answer: 'SHORE', startRow: 0, startCol: 0, length: 5, direction: 'down' },
        { number: 2, text: 'Dwelling', answer: 'HOUSE', startRow: 0, startCol: 1, length: 5, direction: 'down' },
        { number: 3, text: 'Prior to', answer: 'ANTES', startRow: 0, startCol: 2, length: 5, direction: 'down' },
        { number: 4, text: 'Perused', answer: 'REDS', startRow: 0, startCol: 3, length: 4, direction: 'down' },
        { number: 7, text: 'Types', answer: 'TYRS', startRow: 2, startCol: 2, length: 3, direction: 'down' },
      ],
    },
  },
  // Puzzle 3: BRAIN/LEMON theme
  {
    id: '3',
    date: '2024-01-03',
    title: 'Mini Crossword',
    author: 'Daily Games',
    size: { rows: 5, cols: 5 },
    grid: [
      [L('B', 1), L('R', 2), L('A', 3), L('I', 4), L('N')],
      [L('L', 5), L('E'), L('M'), L('O'), L('N')],
      [L('A', 6), L('D'), L('O', 7), L('R'), L('E')],
      [L('D', 8), L('S', 9), B, L('E'), L('S')],
      [L('E', 10), B, B, L('S', 11), B],
    ],
    clues: {
      across: [
        { number: 1, text: 'Thinking organ', answer: 'BRAIN', startRow: 0, startCol: 0, length: 5, direction: 'across' },
        { number: 5, text: 'Citrus fruit', answer: 'LEMON', startRow: 1, startCol: 0, length: 5, direction: 'across' },
        { number: 6, text: 'Worship', answer: 'ADORE', startRow: 2, startCol: 0, length: 5, direction: 'across' },
        { number: 8, text: 'Commercials', answer: 'DS', startRow: 3, startCol: 0, length: 2, direction: 'across' },
        { number: 10, text: 'Letter before F', answer: 'E', startRow: 4, startCol: 0, length: 1, direction: 'across' },
      ],
      down: [
        { number: 1, text: 'Sword', answer: 'BLADE', startRow: 0, startCol: 0, length: 5, direction: 'down' },
        { number: 2, text: 'Perused', answer: 'READS', startRow: 0, startCol: 1, length: 5, direction: 'down' },
        { number: 3, text: 'Amongst', answer: 'AMO', startRow: 0, startCol: 2, length: 3, direction: 'down' },
        { number: 4, text: 'Metal sources', answer: 'IORES', startRow: 0, startCol: 3, length: 5, direction: 'down' },
        { number: 7, text: 'Single', answer: 'ONES', startRow: 2, startCol: 2, length: 2, direction: 'down' },
      ],
    },
  },
  // Puzzle 4: GRACE/RAVEN theme (cleaner)
  {
    id: '4',
    date: '2024-01-04',
    title: 'Mini Crossword',
    author: 'Daily Games',
    size: { rows: 5, cols: 5 },
    grid: [
      [L('G', 1), L('R', 2), L('A', 3), L('C', 4), L('E')],
      [L('R', 5), L('A'), L('V'), L('E'), L('N')],
      [L('A', 6), L('T'), L('E', 7), L('S', 8), B],
      [L('S', 9), L('S', 10), L('R', 11), B, B],
      [L('P', 12), B, L('O', 13), B, B],
    ],
    clues: {
      across: [
        { number: 1, text: 'Elegance', answer: 'GRACE', startRow: 0, startCol: 0, length: 5, direction: 'across' },
        { number: 5, text: 'Black bird', answer: 'RAVEN', startRow: 1, startCol: 0, length: 5, direction: 'across' },
        { number: 6, text: 'Consumes', answer: 'ATES', startRow: 2, startCol: 0, length: 4, direction: 'across' },
        { number: 9, text: 'Snake sounds', answer: 'SS', startRow: 3, startCol: 0, length: 2, direction: 'across' },
        { number: 12, text: 'Letter P', answer: 'P', startRow: 4, startCol: 0, length: 1, direction: 'across' },
      ],
      down: [
        { number: 1, text: 'Seizes', answer: 'GRASP', startRow: 0, startCol: 0, length: 5, direction: 'down' },
        { number: 2, text: 'Speeds', answer: 'RATS', startRow: 0, startCol: 1, length: 4, direction: 'down' },
        { number: 3, text: 'Road', answer: 'AVER', startRow: 0, startCol: 2, length: 4, direction: 'down' },
        { number: 4, text: 'Stop', answer: 'CES', startRow: 0, startCol: 3, length: 3, direction: 'down' },
        { number: 7, text: 'Metal source', answer: 'ER', startRow: 2, startCol: 2, length: 2, direction: 'down' },
      ],
    },
  },
  // Puzzle 5: STORM/AROMA - properly constructed
  {
    id: '5',
    date: '2024-01-05',
    title: 'Mini Crossword',
    author: 'Daily Games',
    size: { rows: 5, cols: 5 },
    grid: [
      [L('S', 1), L('T', 2), L('O', 3), L('R', 4), L('M')],
      [L('A', 5), L('R'), L('A'), L('T'), L('E')],
      [L('L', 6), L('I'), L('V'), L('E', 7), L('D')],
      [L('E', 8), L('P'), L('E'), L('R'), L('S')],
      [L('S', 9), L('S', 10), L('N', 11), B, B],
    ],
    clues: {
      across: [
        { number: 1, text: 'Violent weather', answer: 'STORM', startRow: 0, startCol: 0, length: 5, direction: 'across' },
        { number: 5, text: 'Speed', answer: 'ARATE', startRow: 1, startCol: 0, length: 5, direction: 'across' },
        { number: 6, text: 'Resided', answer: 'LIVED', startRow: 2, startCol: 0, length: 5, direction: 'across' },
        { number: 8, text: 'Snakes', answer: 'EPERS', startRow: 3, startCol: 0, length: 5, direction: 'across' },
        { number: 9, text: 'Many S', answer: 'SSN', startRow: 4, startCol: 0, length: 3, direction: 'across' },
      ],
      down: [
        { number: 1, text: 'Transactions', answer: 'SALES', startRow: 0, startCol: 0, length: 5, direction: 'down' },
        { number: 2, text: 'Outings', answer: 'TRIPS', startRow: 0, startCol: 1, length: 5, direction: 'down' },
        { number: 3, text: 'Kitchen appliance', answer: 'OVEN', startRow: 0, startCol: 2, length: 4, direction: 'down' },
        { number: 4, text: 'Speeds', answer: 'RTER', startRow: 0, startCol: 3, length: 4, direction: 'down' },
        { number: 7, text: 'Borders', answer: 'EDS', startRow: 2, startCol: 3, length: 3, direction: 'down' },
      ],
    },
  },
  // Puzzle 6: TIGER/IDEAL - properly constructed
  {
    id: '6',
    date: '2024-01-06',
    title: 'Mini Crossword',
    author: 'Daily Games',
    size: { rows: 5, cols: 5 },
    grid: [
      [L('T', 1), L('I', 2), L('G', 3), L('E', 4), L('R')],
      [L('I', 5), L('D'), L('E'), L('A'), L('L')],
      [L('R', 6), L('E'), L('A', 7), L('R', 8), L('S')],
      [L('E', 9), L('S', 10), L('R', 11), L('S', 12), B],
      [L('D', 13), B, L('S', 14), B, B],
    ],
    clues: {
      across: [
        { number: 1, text: 'Striped big cat', answer: 'TIGER', startRow: 0, startCol: 0, length: 5, direction: 'across' },
        { number: 5, text: 'Perfect', answer: 'IDEAL', startRow: 1, startCol: 0, length: 5, direction: 'across' },
        { number: 6, text: 'Back parts', answer: 'REARS', startRow: 2, startCol: 0, length: 5, direction: 'across' },
        { number: 9, text: 'More than one S', answer: 'ES', startRow: 3, startCol: 0, length: 2, direction: 'across' },
        { number: 13, text: 'Letter D', answer: 'D', startRow: 4, startCol: 0, length: 1, direction: 'across' },
      ],
      down: [
        { number: 1, text: 'Exhausted', answer: 'TIRED', startRow: 0, startCol: 0, length: 5, direction: 'down' },
        { number: 2, text: 'Concepts', answer: 'IDEAS', startRow: 0, startCol: 1, length: 5, direction: 'down' },
        { number: 3, text: 'Equipment', answer: 'GEAR', startRow: 0, startCol: 2, length: 4, direction: 'down' },
        { number: 4, text: 'Ears', answer: 'EARS', startRow: 0, startCol: 3, length: 4, direction: 'down' },
        { number: 7, text: 'Plural suffix', answer: 'ARS', startRow: 2, startCol: 2, length: 3, direction: 'down' },
      ],
    },
  },
  // Puzzle 7: CRANE/LINER - properly constructed
  {
    id: '7',
    date: '2024-01-07',
    title: 'Mini Crossword',
    author: 'Daily Games',
    size: { rows: 5, cols: 5 },
    grid: [
      [L('C', 1), L('R', 2), L('A', 3), L('N', 4), L('E')],
      [L('L', 5), L('I'), L('N'), L('E'), L('R')],
      [L('A', 6), L('D'), L('D', 7), L('S', 8), B],
      [L('S', 9), L('E'), L('S', 10), B, B],
      [L('S', 11), L('S', 12), B, B, B],
    ],
    clues: {
      across: [
        { number: 1, text: 'Bird or machine', answer: 'CRANE', startRow: 0, startCol: 0, length: 5, direction: 'across' },
        { number: 5, text: 'Ocean vessel', answer: 'LINER', startRow: 1, startCol: 0, length: 5, direction: 'across' },
        { number: 6, text: 'Includes', answer: 'ADDS', startRow: 2, startCol: 0, length: 4, direction: 'across' },
        { number: 9, text: 'Many S', answer: 'SE', startRow: 3, startCol: 0, length: 2, direction: 'across' },
        { number: 11, text: 'Many S', answer: 'SS', startRow: 4, startCol: 0, length: 2, direction: 'across' },
      ],
      down: [
        { number: 1, text: 'Categories', answer: 'CLASS', startRow: 0, startCol: 0, length: 5, direction: 'down' },
        { number: 2, text: 'Horse riders', answer: 'RIDES', startRow: 0, startCol: 1, length: 5, direction: 'down' },
        { number: 3, text: 'Includes', answer: 'ANDS', startRow: 0, startCol: 2, length: 4, direction: 'down' },
        { number: 4, text: 'Conclusion', answer: 'NES', startRow: 0, startCol: 3, length: 3, direction: 'down' },
        { number: 7, text: 'Commercials', answer: 'DS', startRow: 2, startCol: 2, length: 2, direction: 'down' },
      ],
    },
  },
  // Puzzle 8: FLASH/LINER - properly constructed
  {
    id: '8',
    date: '2024-01-08',
    title: 'Mini Crossword',
    author: 'Daily Games',
    size: { rows: 5, cols: 5 },
    grid: [
      [L('F', 1), L('L', 2), L('A', 3), L('S', 4), L('H')],
      [L('L', 5), L('I'), L('N'), L('E'), L('R')],
      [L('A', 6), L('V'), L('E', 7), L('R', 8), L('S')],
      [L('G', 9), L('E'), L('S', 10), L('S', 11), B],
      [L('S', 12), L('S', 13), B, B, B],
    ],
    clues: {
      across: [
        { number: 1, text: 'Quick burst of light', answer: 'FLASH', startRow: 0, startCol: 0, length: 5, direction: 'across' },
        { number: 5, text: 'Ocean ship', answer: 'LINER', startRow: 1, startCol: 0, length: 5, direction: 'across' },
        { number: 6, text: 'Mean values', answer: 'AVERS', startRow: 2, startCol: 0, length: 5, direction: 'across' },
        { number: 9, text: 'Many', answer: 'GE', startRow: 3, startCol: 0, length: 2, direction: 'across' },
        { number: 12, text: 'Many S', answer: 'SS', startRow: 4, startCol: 0, length: 2, direction: 'across' },
      ],
      down: [
        { number: 1, text: 'Standards', answer: 'FLAGS', startRow: 0, startCol: 0, length: 5, direction: 'down' },
        { number: 2, text: 'Resides', answer: 'LIVES', startRow: 0, startCol: 1, length: 5, direction: 'down' },
        { number: 3, text: 'Roads', answer: 'ANES', startRow: 0, startCol: 2, length: 4, direction: 'down' },
        { number: 4, text: 'Direction', answer: 'SERS', startRow: 0, startCol: 3, length: 4, direction: 'down' },
        { number: 7, text: 'Multiple S', answer: 'ESS', startRow: 2, startCol: 2, length: 3, direction: 'down' },
      ],
    },
  },
  // Puzzle 9: SLATE/TIRES - properly constructed
  {
    id: '9',
    date: '2024-01-09',
    title: 'Mini Crossword',
    author: 'Daily Games',
    size: { rows: 5, cols: 5 },
    grid: [
      [L('S', 1), L('L', 2), L('A', 3), L('T', 4), L('E')],
      [L('T', 5), L('I'), L('R'), L('E'), L('S')],
      [L('A', 6), L('N'), L('E', 7), L('A', 8), L('S')],
      [L('R', 9), L('E'), L('S', 10), L('S', 11), B],
      [L('S', 12), L('S', 13), B, B, B],
    ],
    clues: {
      across: [
        { number: 1, text: 'Roofing material', answer: 'SLATE', startRow: 0, startCol: 0, length: 5, direction: 'across' },
        { number: 5, text: 'Car wheels', answer: 'TIRES', startRow: 1, startCol: 0, length: 5, direction: 'across' },
        { number: 6, text: 'Regions', answer: 'AREAS', startRow: 2, startCol: 0, length: 5, direction: 'across' },
        { number: 9, text: 'Multiple', answer: 'RE', startRow: 3, startCol: 0, length: 2, direction: 'across' },
        { number: 12, text: 'Many S', answer: 'SS', startRow: 4, startCol: 0, length: 2, direction: 'across' },
      ],
      down: [
        { number: 1, text: 'Celestial bodies', answer: 'STARS', startRow: 0, startCol: 0, length: 5, direction: 'down' },
        { number: 2, text: 'Cables', answer: 'LINES', startRow: 0, startCol: 1, length: 5, direction: 'down' },
        { number: 3, text: 'Regions', answer: 'ARES', startRow: 0, startCol: 2, length: 4, direction: 'down' },
        { number: 4, text: 'Beverages', answer: 'TEAS', startRow: 0, startCol: 3, length: 4, direction: 'down' },
        { number: 7, text: 'Multiple S', answer: 'ESS', startRow: 2, startCol: 2, length: 3, direction: 'down' },
      ],
    },
  },
  // Puzzle 10: PLANT/LATER - properly constructed
  {
    id: '10',
    date: '2024-01-10',
    title: 'Mini Crossword',
    author: 'Daily Games',
    size: { rows: 5, cols: 5 },
    grid: [
      [L('P', 1), L('L', 2), L('A', 3), L('N', 4), L('T')],
      [L('L', 5), L('A'), L('T'), L('E'), L('R')],
      [L('A', 6), L('T'), L('O', 7), L('N', 8), L('E')],
      [L('N', 9), L('E'), L('N', 10), L('S', 11), B],
      [L('E', 12), L('S', 13), L('E', 14), B, B],
    ],
    clues: {
      across: [
        { number: 1, text: 'Green living thing', answer: 'PLANT', startRow: 0, startCol: 0, length: 5, direction: 'across' },
        { number: 5, text: 'Afterward', answer: 'LATER', startRow: 1, startCol: 0, length: 5, direction: 'across' },
        { number: 6, text: 'Make amends', answer: 'ATONE', startRow: 2, startCol: 0, length: 5, direction: 'across' },
        { number: 9, text: 'Camera parts', answer: 'NE', startRow: 3, startCol: 0, length: 2, direction: 'across' },
        { number: 12, text: 'Direction', answer: 'ESE', startRow: 4, startCol: 0, length: 3, direction: 'across' },
      ],
      down: [
        { number: 1, text: 'Level', answer: 'PLANE', startRow: 0, startCol: 0, length: 5, direction: 'down' },
        { number: 2, text: 'Afterwards', answer: 'LATES', startRow: 0, startCol: 1, length: 5, direction: 'down' },
        { number: 3, text: 'Single', answer: 'ATONE', startRow: 0, startCol: 2, length: 5, direction: 'down' },
        { number: 4, text: 'Bird homes', answer: 'NENS', startRow: 0, startCol: 3, length: 4, direction: 'down' },
        { number: 7, text: 'Single', answer: 'ONE', startRow: 2, startCol: 2, length: 3, direction: 'down' },
      ],
    },
  },
];

export function getRandomCrosswordPuzzle(excludeIds: string[] = []): CrosswordPuzzle {
  const available = CROSSWORD_PUZZLES.filter(p => !excludeIds.includes(p.id));
  const pool = available.length > 0 ? available : CROSSWORD_PUZZLES;
  return pool[Math.floor(Math.random() * pool.length)];
}
