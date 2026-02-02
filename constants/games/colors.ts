export const GameColors = {
  light: {
    // Wordle tile states
    correct: '#6aaa64',
    present: '#c9b458',
    absent: '#787c7e',

    // Tile appearance
    tileBorder: '#d3d6da',
    tileBorderFilled: '#878a8c',
    tileBackground: '#ffffff',
    tileText: '#1a1a1b',

    // Keyboard
    keyBackground: '#d3d6da',
    keyText: '#1a1a1b',

    // Connections categories
    categoryYellow: '#f9df6d',
    categoryGreen: '#a0c35a',
    categoryBlue: '#b0c4ef',
    categoryPurple: '#ba81c5',
    categoryText: '#1a1a1b',

    // Connections tile
    connectionsTile: '#efefe6',
    connectionsTileSelected: '#5a594e',
    connectionsTileText: '#1a1a1b',
    connectionsTileSelectedText: '#ffffff',

    // Crossword
    cellBorder: '#000000',
    cellBackground: '#ffffff',
    selectedCell: '#ffda00',
    highlightedWord: '#a7d8ff',
    incorrectCell: '#ffcccc',
    correctCell: '#c8e6c9',

    // General
    surface: '#ffffff',
    surfaceSecondary: '#f5f5f5',
    border: '#d3d6da',
    textPrimary: '#1a1a1b',
    textSecondary: '#787c7e',
  },
  dark: {
    // Wordle tile states
    correct: '#538d4e',
    present: '#b59f3b',
    absent: '#3a3a3c',

    // Tile appearance
    tileBorder: '#3a3a3c',
    tileBorderFilled: '#565758',
    tileBackground: '#121213',
    tileText: '#ffffff',

    // Keyboard
    keyBackground: '#818384',
    keyText: '#ffffff',

    // Connections categories
    categoryYellow: '#d4b82e',
    categoryGreen: '#7eb82a',
    categoryBlue: '#6b8ed6',
    categoryPurple: '#9b5ba5',
    categoryText: '#1a1a1b',

    // Connections tile
    connectionsTile: '#5a594e',
    connectionsTileSelected: '#efefe6',
    connectionsTileText: '#ffffff',
    connectionsTileSelectedText: '#1a1a1b',

    // Crossword
    cellBorder: '#565656',
    cellBackground: '#121213',
    selectedCell: '#b5a200',
    highlightedWord: '#3a5a7c',
    incorrectCell: '#5c2a2a',
    correctCell: '#2a5c2a',

    // General
    surface: '#121213',
    surfaceSecondary: '#1a1a1b',
    border: '#3a3a3c',
    textPrimary: '#ffffff',
    textSecondary: '#818384',
  },
};

export type GameColorScheme = typeof GameColors.light;
