import { Easing } from 'react-native-reanimated';

export const ANIMATIONS = {
  // Wordle tile flip
  TILE_FLIP_DURATION: 500,
  TILE_FLIP_DELAY: 150,

  // Letter entry pop
  LETTER_POP_SCALE: 1.1,
  LETTER_POP_DURATION: 100,

  // Invalid word shake
  SHAKE_DURATION: 400,
  SHAKE_DISTANCE: 6,
  SHAKE_COUNT: 3,

  // Win celebration bounce
  BOUNCE_DURATION: 150,
  BOUNCE_DELAY: 150,
  BOUNCE_HEIGHT: -15,

  // Connections tile
  TILE_SELECT_SCALE: 0.97,
  TILE_SELECT_DURATION: 100,
  CATEGORY_REVEAL_DURATION: 400,

  // Crossword
  CELL_HIGHLIGHT_DURATION: 150,

  // Common spring config
  SPRING_CONFIG: {
    damping: 15,
    stiffness: 150,
  },

  // Easing functions
  EASING: {
    flip: Easing.bezier(0.4, 0.0, 0.2, 1),
    bounce: Easing.bounce,
    ease: Easing.ease,
  },
} as const;
