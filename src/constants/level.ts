import type { Level } from '../types';
import { IMAGE } from './key';

export const LEVELS: Level[] = [
  // 0
  {
    image: IMAGE.SMILING_GIRL,
    title: 'The Smiling Girl',
    fee: 40,
    tip: 'Hover over the photo. Press and drag to clear the dust.',
    grime: { haze: 0.25, density: 1.8 },
  },

  // 1
  {
    image: IMAGE.HANDS_TOGETHER,
    title: 'Our Hands Together',
    fee: 56,
    focusY: 0.55,
    tip: 'Wipe away the dust to recover this picture.',
    grime: { haze: 0.27, density: 2.0 },
  },

  // 2
  {
    image: IMAGE.TODDLER_IN_PLAYGROUND,
    title: 'Playing in the Playground',
    fee: 72,
    tip: 'Scrub to clear the dust and grime.',
    grime: { haze: 0.29, density: 2.2 },
  },

  // 3
  {
    image: IMAGE.WHITE_DAFFODIL,
    title: 'White Daffodil Flower',
    fee: 88,
    tip: 'Brush away the dirt.',
    grime: { haze: 0.31, density: 2.4 },
  },

  // 4
  {
    image: IMAGE.BOY_DIVING_INTO_POOL,
    title: 'Diving into the Swimming Pool',
    fee: 104,
    focusY: 0.35,
    tip: 'Scrub away!',
    grime: { haze: 0.33, density: 2.6 },
  },

  // 5
  {
    image: IMAGE.WOMAN_TAKING_PICTURE,
    title: 'Say Cheese!',
    fee: 120,
    abrasion: 0.21,
    tip: 'Over-scrubbing damages this picture.',
    grime: { haze: 0.35, density: 2.8 },
  },

  // 6
  {
    image: IMAGE.MAN_ON_SOFA,
    title: 'Sitting on the Sofa',
    fee: 136,
    abrasion: 0.25,
    tip: 'Be careful not to over-scrub this print.',
    puzzle: {
      pieces: 4,
      tip: 'The photo came in torn. Rebuild it before cleaning.',
    },
    grime: { haze: 0.37, density: 3.0 },
  },

  // 7
  {
    image: IMAGE.GUITARIST,
    title: 'Street Guitarist',
    fee: 152,
    abrasion: 0.29,
    tip: 'Be mindful of over-scrubbing.',
    puzzle: {
      pieces: 4,
      tip: 'Stitch the photo together before cleaning.',
    },
    grime: { haze: 0.39, density: 3.2 },
  },

  // 8
  {
    image: IMAGE.STREET_VIEW_AT_SUNSET,
    title: 'Sunset Street',
    fee: 168,
    abrasion: 0.33,
    tip: 'Too much scrubbing can damage the photo.',
    puzzle: { pieces: 4 },
    grime: { haze: 0.41, density: 3.4 },
  },

  // 9
  {
    image: IMAGE.BIKING_ON_BEACH,
    title: 'Biking on the Beach',
    fee: 184,
    abrasion: 0.38,
    tip: 'Scrub carefully.',
    focusY: 0.45,
    puzzle: { pieces: 4 },
    grime: { haze: 0.43, density: 3.6 },
  },

  // 10
  {
    image: IMAGE.PADDLEBOARDER,
    title: 'Paddleboarding',
    fee: 200,
    abrasion: 0.42,
    focusY: 0.4,
    tip: 'Scrub gently.',
    puzzle: {
      pieces: 6,
      difficulty: 'standard',
      tip: 'The guide appears only while you’re dragging.',
    },
    grime: { haze: 0.45, density: 3.8 },
  },

  // 11
  {
    image: IMAGE.WOMAN_IN_POOL,
    title: 'Pool Pic',
    fee: 216,
    abrasion: 0.46,
    focusY: 0.4,
    tip: 'Scrub lightly',
    puzzle: { pieces: 6, difficulty: 'standard' },
    grime: { haze: 0.47, density: 4.0 },
  },

  // 12
  {
    image: IMAGE.WEDDING_RING,
    title: 'Wedding Ring',
    fee: 232,
    abrasion: 0.5,
    tip: 'This delicate keepsake bruises under hard scrubbing.',
    puzzle: { pieces: 6, difficulty: 'standard' },
    grime: { haze: 0.49, density: 4.2 },
  },

  // 13
  {
    image: IMAGE.BONSAI_TREE,
    title: 'Bonsai Tree',
    fee: 248,
    abrasion: 0.54,
    tip: 'Use a gentle touch.',
    puzzle: { pieces: 6, difficulty: 'standard' },
    grime: { haze: 0.51, density: 4.4 },
  },

  // 14
  {
    image: IMAGE.CAT_ON_SOFA,
    title: 'Cat on the Sofa',
    fee: 264,
    abrasion: 0.58,
    tip: 'Be gentle when scrubbing.',
    puzzle: { pieces: 8, difficulty: 'standard' },
    grime: { haze: 0.53, density: 4.6 },
  },

  // 15
  {
    image: IMAGE.DOG_SLEEPING_ON_COUCH,
    title: 'Napping Dog',
    fee: 280,
    abrasion: 0.63,
    tip: 'Avoid scrubbing too hard.',
    puzzle: { pieces: 8, difficulty: 'standard' },
    grime: { haze: 0.55, density: 4.8 },
  },

  // 16
  {
    image: IMAGE.BABY_SUCKING_ON_THUMB,
    title: 'Baby Boy',
    fee: 296,
    abrasion: 0.67,
    tip: 'A precious portrait... go easy on the brush.',
    puzzle: { pieces: 8, difficulty: 'standard' },
    grime: { haze: 0.57, density: 5.0 },
  },

  // 17
  {
    image: IMAGE.KOI_FISH,
    title: 'Koi Fish in a Pond',
    fee: 312,
    abrasion: 0.71,
    focusY: 0.45,
    tip: 'Don’t scrub too much.',
    puzzle: { pieces: 8, difficulty: 'standard' },
    grime: { haze: 0.58, density: 5.0 },
  },

  // 18
  {
    image: IMAGE.SWIMMING_TURTLE,
    title: 'Swimming Turtle',
    fee: 328,
    abrasion: 0.75,
    focusY: 0.5,
    tip: 'Don’t over-scrub.',
    puzzle: { pieces: 9, difficulty: 'standard' },
    grime: { haze: 0.59, density: 5.0 },
  },

  // 19
  {
    image: IMAGE.GRADUATION,
    title: 'Graduation',
    fee: 344,
    abrasion: 0.79,
    tip: 'Take care not to scrub too vigorously.',
    puzzle: { pieces: 9, difficulty: 'standard' },
    grime: { haze: 0.6, density: 5.0 },
  },

  // 20
  {
    image: IMAGE.TORTOISE_ON_SIDEWALK,
    title: 'Tortoise on the Sidewalk',
    fee: 360,
    abrasion: 0.83,
    focusY: 0.6,
    tip: 'This print scratches easily... use a light touch.',
    puzzle: { pieces: 9, difficulty: 'standard' },
    grime: { haze: 0.6, density: 5.0 },
  },

  // 21
  {
    image: IMAGE.CRASHING_WAVES,
    title: 'Sandy Toes and Salty Air',
    fee: 376,
    abrasion: 0.88,
    tip: 'Clean it with gentle strokes.',
    puzzle: { pieces: 9, difficulty: 'standard' },
    grime: { haze: 0.6, density: 5.0 },
  },

  // 22
  {
    image: IMAGE.SANDPIPERS_ON_BEACH,
    title: 'Birds at the Beach',
    fee: 392,
    abrasion: 0.92,
    tip: 'Use only light pressure.',
    puzzle: {
      pieces: 12,
      difficulty: 'tricky',
      tip: 'Some pieces are rotated. Tap a piece to turn it. Right-click reverses.',
    },
    grime: { haze: 0.6, density: 5.0 },
  },

  // 23
  {
    image: IMAGE.SURFING,
    title: 'Catching Waves',
    fee: 408,
    abrasion: 0.96,
    tip: 'Scrub gently.',
    focusY: 0.35,
    puzzle: { pieces: 12, difficulty: 'tricky' },
    grime: { haze: 0.62, density: 5.2 },
  },

  // 24
  {
    image: IMAGE.BOAT_IN_RIVER,
    title: 'Sailing in the River',
    fee: 424,
    abrasion: 1,
    tip: 'Hard scrubbing leaves deep scratches on this print.',
    puzzle: { pieces: 12, difficulty: 'tricky' },
    grime: { haze: 0.64, density: 5.6 },
  },

  // 25
  {
    image: IMAGE.WINDING_BOARDWALK,
    title: 'Winding Road',
    fee: 440,
    abrasion: 1.04,
    tip: 'Scrub lightly.',
    puzzle: { pieces: 12, difficulty: 'tricky' },
    grime: { haze: 0.66, density: 5.8 },
  },

  // 26
  {
    image: IMAGE.RED_FIRE_HYDRANT,
    title: 'Red Fire Hydrant',
    fee: 456,
    abrasion: 1.08,
    tip: 'Avoid over-scrubbing.',
    puzzle: { pieces: 12, difficulty: 'tricky' },
    grime: { haze: 0.68, density: 6.0 },
  },

  // 27
  {
    image: IMAGE.TRAFFIC_LIGHTS,
    title: 'Going through Traffic',
    fee: 472,
    abrasion: 1.13,
    tip: 'Don’t over-scrub.',
    puzzle: {
      pieces: 15,
      difficulty: 'hard',
      tip: 'The guide appears while you drag or turn a piece.',
    },
    grime: { haze: 0.7, density: 6.0 },
  },

  // 28
  {
    image: IMAGE.HIGHWAY_EXIT,
    title: 'Highway Exit 276',
    fee: 488,
    abrasion: 1.17,
    tip: 'Don’t scrub too hard.',
    puzzle: { pieces: 15, difficulty: 'hard' },
    grime: { haze: 0.72, density: 6.0 },
  },

  // 29
  {
    image: IMAGE.THE_ORANGE_SHOP,
    title: 'The Orange Shop',
    fee: 504,
    abrasion: 1.21,
    tip: 'Use a gentle touch.',
    puzzle: { pieces: 15, difficulty: 'hard' },
    grime: { haze: 0.74, density: 6.0 },
  },

  // 30
  {
    image: IMAGE.DUCK_CROSSING_SIGN,
    title: 'Duck Crossing Sign',
    fee: 520,
    abrasion: 1.25,
    tip: 'Delicate surface: scrub gently.',
    puzzle: { pieces: 15, difficulty: 'hard' },
    grime: { haze: 0.76, density: 6.0 },
  },

  // 31
  {
    image: IMAGE.SNOWY_DAY,
    title: 'Snowy Day',
    fee: 536,
    abrasion: 1.29,
    tip: 'Scrub lightly.',
    puzzle: { pieces: 15, difficulty: 'hard' },
    grime: { haze: 0.78, density: 6.0 },
  },

  // 32
  {
    image: IMAGE.PEOPLE_ON_SNOWY_SIDEWALK,
    title: 'Winter Stroll',
    fee: 552,
    abrasion: 1.33,
    tip: 'Don’t over-scrub.',
    puzzle: { pieces: 16, difficulty: 'hard' },
    grime: { haze: 0.8, density: 6.0 },
  },

  // 33
  {
    image: IMAGE.PERSON_IN_FOREST,
    title: 'Enjoying the Nature',
    fee: 568,
    abrasion: 1.38,
    tip: 'Be gentle.',
    focusY: 0.45,
    puzzle: { pieces: 16, difficulty: 'hard' },
    grime: { haze: 0.82, density: 6.0 },
  },

  // 34
  {
    image: IMAGE.PHOTOGRAPHER_IN_SNOW,
    title: 'Christmas Photo',
    fee: 584,
    abrasion: 1.42,
    tip: 'Use light pressure.',
    puzzle: { pieces: 16, difficulty: 'hard' },
    grime: { haze: 0.84, density: 6.0 },
  },

  // 35
  {
    image: IMAGE.SAXOPHONIST,
    title: 'Making Music',
    fee: 616,
    abrasion: 1.46,
    tip: 'Don’t scrub too vigorously.',
    puzzle: {
      pieces: 20,
      difficulty: 'expert',
      tip: 'No guide now. Start with the torn edges.',
    },
    grime: { haze: 0.87, density: 6.0 },
  },

  // 36
  {
    image: IMAGE.RAINBOW,
    title: 'Rainbow in the Sky',
    fee: 600,
    abrasion: 1.5,
    tip: 'Don’t scrub too hard.',
    puzzle: {
      pieces: 20,
      difficulty: 'expert',
      tip: 'Final picture...',
    },
    grime: { haze: 0.9, density: 6.0 },
  },
] as const;
