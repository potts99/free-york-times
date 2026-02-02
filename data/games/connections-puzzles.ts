import type { ConnectionsPuzzle } from '@/types/games';

export const CONNECTIONS_PUZZLES: ConnectionsPuzzle[] = [
  {
    id: '1',
    date: '2024-01-01',
    categories: [
      {
        name: 'FRUITS',
        words: ['APPLE', 'BANANA', 'ORANGE', 'GRAPE'],
        difficulty: 1,
        color: 'yellow',
      },
      {
        name: 'PLANETS',
        words: ['MARS', 'VENUS', 'SATURN', 'JUPITER'],
        difficulty: 2,
        color: 'green',
      },
      {
        name: 'CARD GAMES',
        words: ['POKER', 'BRIDGE', 'HEARTS', 'SPADES'],
        difficulty: 3,
        color: 'blue',
      },
      {
        name: '_____ KING',
        words: ['BURGER', 'LION', 'DRAG', 'RODEO'],
        difficulty: 4,
        color: 'purple',
      },
    ],
  },
  {
    id: '2',
    date: '2024-01-02',
    categories: [
      {
        name: 'TYPES OF DANCE',
        words: ['SALSA', 'TANGO', 'WALTZ', 'SWING'],
        difficulty: 1,
        color: 'yellow',
      },
      {
        name: 'COFFEE DRINKS',
        words: ['LATTE', 'MOCHA', 'ESPRESSO', 'AMERICANO'],
        difficulty: 2,
        color: 'green',
      },
      {
        name: 'MOVIE GENRES',
        words: ['HORROR', 'COMEDY', 'DRAMA', 'ACTION'],
        difficulty: 3,
        color: 'blue',
      },
      {
        name: 'WORDS AFTER "HALF"',
        words: ['TIME', 'BAKED', 'HEARTED', 'PIPE'],
        difficulty: 4,
        color: 'purple',
      },
    ],
  },
  {
    id: '3',
    date: '2024-01-03',
    categories: [
      {
        name: 'BODY PARTS',
        words: ['HEAD', 'HAND', 'FOOT', 'KNEE'],
        difficulty: 1,
        color: 'yellow',
      },
      {
        name: 'COLORS',
        words: ['BLUE', 'GREEN', 'YELLOW', 'PURPLE'],
        difficulty: 2,
        color: 'green',
      },
      {
        name: 'MUSIC INSTRUMENTS',
        words: ['PIANO', 'GUITAR', 'DRUMS', 'VIOLIN'],
        difficulty: 3,
        color: 'blue',
      },
      {
        name: '_____ BALL',
        words: ['BASKET', 'FOOT', 'BASE', 'VOLLEY'],
        difficulty: 4,
        color: 'purple',
      },
    ],
  },
  {
    id: '4',
    date: '2024-01-04',
    categories: [
      {
        name: 'WEATHER',
        words: ['SUNNY', 'RAINY', 'CLOUDY', 'WINDY'],
        difficulty: 1,
        color: 'yellow',
      },
      {
        name: 'EMOTIONS',
        words: ['HAPPY', 'SAD', 'ANGRY', 'SCARED'],
        difficulty: 2,
        color: 'green',
      },
      {
        name: 'BREAKFAST FOODS',
        words: ['PANCAKE', 'WAFFLE', 'BACON', 'EGGS'],
        difficulty: 3,
        color: 'blue',
      },
      {
        name: 'FAMOUS MICHAELS',
        words: ['JORDAN', 'JACKSON', 'SCOTT', 'PHELPS'],
        difficulty: 4,
        color: 'purple',
      },
    ],
  },
  {
    id: '5',
    date: '2024-01-05',
    categories: [
      {
        name: 'SHAPES',
        words: ['CIRCLE', 'SQUARE', 'TRIANGLE', 'DIAMOND'],
        difficulty: 1,
        color: 'yellow',
      },
      {
        name: 'METALS',
        words: ['GOLD', 'SILVER', 'BRONZE', 'COPPER'],
        difficulty: 2,
        color: 'green',
      },
      {
        name: 'SPICES',
        words: ['PEPPER', 'GINGER', 'CUMIN', 'BASIL'],
        difficulty: 3,
        color: 'blue',
      },
      {
        name: 'WORDS BEFORE "HOUSE"',
        words: ['WHITE', 'GREEN', 'FIRE', 'POWER'],
        difficulty: 4,
        color: 'purple',
      },
    ],
  },
  {
    id: '6',
    date: '2024-01-06',
    categories: [
      {
        name: 'ANIMALS',
        words: ['TIGER', 'EAGLE', 'SHARK', 'WOLF'],
        difficulty: 1,
        color: 'yellow',
      },
      {
        name: 'VEGETABLES',
        words: ['CARROT', 'BROCCOLI', 'SPINACH', 'CELERY'],
        difficulty: 2,
        color: 'green',
      },
      {
        name: 'CAR BRANDS',
        words: ['HONDA', 'TOYOTA', 'FORD', 'TESLA'],
        difficulty: 3,
        color: 'blue',
      },
      {
        name: '_____ STONE',
        words: ['ROLLING', 'MILE', 'KEY', 'YELLOW'],
        difficulty: 4,
        color: 'purple',
      },
    ],
  },
  {
    id: '7',
    date: '2024-01-07',
    categories: [
      {
        name: 'SEASONS',
        words: ['SPRING', 'SUMMER', 'FALL', 'WINTER'],
        difficulty: 1,
        color: 'yellow',
      },
      {
        name: 'OCEAN CREATURES',
        words: ['WHALE', 'DOLPHIN', 'OCTOPUS', 'STARFISH'],
        difficulty: 2,
        color: 'green',
      },
      {
        name: 'SOCIAL MEDIA',
        words: ['TWITTER', 'FACEBOOK', 'INSTAGRAM', 'SNAPCHAT'],
        difficulty: 3,
        color: 'blue',
      },
      {
        name: 'DOUBLE LETTERS',
        words: ['BALLOON', 'COOKIE', 'PEPPER', 'BUTTER'],
        difficulty: 4,
        color: 'purple',
      },
    ],
  },
];

export function getRandomConnectionsPuzzle(excludeIds: string[] = []): ConnectionsPuzzle {
  const available = CONNECTIONS_PUZZLES.filter(p => !excludeIds.includes(p.id));
  const pool = available.length > 0 ? available : CONNECTIONS_PUZZLES;
  return pool[Math.floor(Math.random() * pool.length)];
}
