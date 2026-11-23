import type { Level } from '../types';
import { IMAGE } from './key';

export const LEVELS: Level[] = [
  // 0
  {
    image: IMAGE.SMILING_GIRL,
    title: 'The Smiling Girl',
    fee: 40,
    abrasion: 0,
    tip: 'Hover over the picture and press and drag to clear the dust.',
    grime: { haze: 0.25, density: 1.8 },
  },

  // 1
  {
    image: IMAGE.HANDS_TOGETHER,
    title: 'Our Hands Together',
    fee: 56,
    focusY: 0.55,
    abrasion: 0,
    tip: 'Clear the dust to recover this photo.',
    grime: { haze: 0.27, density: 2.0 },
  },

  // 2
  {
    image: IMAGE.TODDLER_IN_PLAYGROUND,
    title: 'Playing in the Playground',
    fee: 72,
    abrasion: 0,
    grime: { haze: 0.29, density: 2.2 },
  },

  // 3
  {
    image: IMAGE.WHITE_DAFFODIL,
    title: 'White Daffodil Flower',
    fee: 88,
    abrasion: 0.25,
    tip: 'Be careful... hard scrubbing can damage the print.',
    grime: { haze: 0.31, density: 2.4 },
  },

  // 4
  {
    image: IMAGE.BOY_DIVING_INTO_POOL,
    title: 'Diving into the Swimming Pool',
    fee: 104,
    focusY: 0.35,
    abrasion: 0.5,
    tip: 'Over-scrubbing leaves scratches on delicate prints.',
    grime: { haze: 0.33, density: 2.6 },
  },

  // 5
  {
    image: IMAGE.WOMAN_TAKING_PICTURE,
    title: 'Say Cheese!',
    fee: 120,
    abrasion: 1,
    tip: 'Hard scrubbing damages this print.',
    grime: { haze: 0.35, density: 2.8 },
  },

  // 6
  {
    image: IMAGE.MAN_ON_SOFA,
    title: 'Sitting on the Sofa',
    fee: 136,
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
    puzzle: { pieces: 4 },
    grime: { haze: 0.41, density: 3.4 },
  },

  // 9
  {
    image: IMAGE.BIKING_ON_BEACH,
    title: 'Biking on the Beach',
    fee: 184,
    focusY: 0.45,
    puzzle: { pieces: 4 },
    grime: { haze: 0.43, density: 3.6 },
  },

  // 10
  {
    image: IMAGE.PADDLEBOARDER,
    title: 'Paddleboarding',
    fee: 200,
    focusY: 0.4,
    tip: 'Balance the temperature until skin tones feel natural.',
    puzzle: {
      pieces: 6,
      tip: 'There are more pieces to put back together.',
    },
    grime: { haze: 0.45, density: 3.8 },
  },

  // 11
  {
    image: IMAGE.WOMAN_IN_POOL,
    title: 'Taking a Pic from the Pool',
    fee: 216,
    focusY: 0.4,
    puzzle: { pieces: 6 },
    grime: { haze: 0.47, density: 4.0 },
  },

  // 12
  {
    image: IMAGE.WEDDING_RING,
    title: 'Wedding Ring',
    fee: 232,
    abrasion: 1.5,
    tip: 'This delicate keepsake bruises under hard scrubbing.',
    puzzle: { pieces: 6 },
    grime: { haze: 0.49, density: 4.2 },
  },

  // 13
  {
    image: IMAGE.BONSAI_TREE,
    title: 'Bonsai Tree',
    fee: 248,
    puzzle: { pieces: 6 },
    grime: { haze: 0.51, density: 4.4 },
  },

  // 14
  {
    image: IMAGE.CAT_ON_SOFA,
    title: 'Cat on the Sofa',
    fee: 264,
    puzzle: { pieces: 8 },
    grime: { haze: 0.53, density: 4.6 },
  },

  // 15
  {
    image: IMAGE.DOG_SLEEPING_ON_COUCH,
    title: 'Napping Dog',
    fee: 280,
    tip: 'Adjust both temperature and tint for a natural look.',
    puzzle: { pieces: 8 },
    grime: { haze: 0.55, density: 4.8 },
  },

  // 16
  {
    image: IMAGE.BABY_SUCKING_ON_THUMB,
    title: 'Baby Boy',
    fee: 296,
    abrasion: 1.5,
    tip: 'A precious portrait... go easy on the brush.',
    puzzle: { pieces: 8 },
    grime: { haze: 0.57, density: 5.0 },
  },

  // 17
  {
    image: IMAGE.KOI_FISH,
    title: 'Koi Fish in a Pond',
    fee: 312,
    focusY: 0.45,
    puzzle: { pieces: 8 },
    grime: { haze: 0.58, density: 5.0 },
  },

  // 18
  {
    image: IMAGE.SWIMMING_TURTLE,
    title: 'Swimming Turtle',
    fee: 328,
    focusY: 0.5,
    puzzle: { pieces: 9 },
    grime: { haze: 0.59, density: 5.0 },
  },

  // 19
  {
    image: IMAGE.GRADUATION,
    title: 'Graduation',
    fee: 344,
    puzzle: { pieces: 9 },
    grime: { haze: 0.6, density: 5.0 },
  },

  // 20
  {
    image: IMAGE.TORTOISE_ON_SIDEWALK,
    title: 'Tortoise on the Sidewalk',
    fee: 360,
    focusY: 0.6,
    puzzle: { pieces: 9 },
    grime: { haze: 0.6, density: 5.0 },
  },

  // 21
  {
    image: IMAGE.CRASHING_WAVES,
    title: 'Sandy Toes and Salty Air',
    fee: 376,
    puzzle: { pieces: 9 },
    grime: { haze: 0.6, density: 5.0 },
  },

  // 22
  {
    image: IMAGE.SANDPIPERS_ON_BEACH,
    title: 'Birds at the Beach',
    fee: 392,
    puzzle: {
      pieces: 12,
      tip: 'Take your time to piece them together.',
    },
    grime: { haze: 0.6, density: 5.0 },
  },

  // 23
  {
    image: IMAGE.SURFING,
    title: 'Catching Waves',
    fee: 408,
    focusY: 0.35,
    puzzle: { pieces: 12 },
    grime: { haze: 0.62, density: 5.2 },
  },

  // 24
  {
    image: IMAGE.BOAT_IN_RIVER,
    title: 'Sailing in the River',
    fee: 424,
    puzzle: { pieces: 12 },
    grime: { haze: 0.64, density: 5.6 },
  },

  // 25
  {
    image: IMAGE.WINDING_BOARDWALK,
    title: 'Winding Road',
    fee: 440,
    abrasion: 1.25,
    puzzle: { pieces: 12 },
    grime: { haze: 0.66, density: 5.8 },
  },

  // 26
  {
    image: IMAGE.RED_FIRE_HYDRANT,
    title: 'Red Fire Hydrant',
    fee: 456,
    abrasion: 1.25,
    puzzle: { pieces: 12 },
    grime: { haze: 0.68, density: 6.0 },
  },

  // 27
  {
    image: IMAGE.TRAFFIC_LIGHTS,
    title: 'Going through Traffic',
    fee: 472,
    abrasion: 1.25,
    puzzle: { pieces: 15 },
    grime: { haze: 0.7, density: 6.0 },
  },

  // 28
  {
    image: IMAGE.HIGHWAY_EXIT,
    title: 'Highway Exit 276',
    fee: 488,
    abrasion: 1.25,
    puzzle: { pieces: 15 },
    grime: { haze: 0.72, density: 6.0 },
  },

  // 29
  {
    image: IMAGE.THE_ORANGE_SHOP,
    title: 'The Orange Shop',
    fee: 504,
    abrasion: 1.25,
    puzzle: { pieces: 15 },
    grime: { haze: 0.74, density: 6.0 },
  },

  // 30
  {
    image: IMAGE.DUCK_CROSSING_SIGN,
    title: 'Duck Crossing Sign',
    fee: 520,
    abrasion: 1.5,
    puzzle: { pieces: 15 },
    grime: { haze: 0.76, density: 6.0 },
  },

  // 31
  {
    image: IMAGE.SNOWY_DAY,
    title: 'Snowy Day',
    fee: 536,
    abrasion: 1.5,
    puzzle: { pieces: 15 },
    grime: { haze: 0.78, density: 6.0 },
  },

  // 32
  {
    image: IMAGE.PEOPLE_ON_SNOWY_SIDEWALK,
    title: 'Winter Stroll',
    fee: 552,
    abrasion: 1.5,
    puzzle: { pieces: 16 },
    grime: { haze: 0.8, density: 6.0 },
  },

  // 33
  {
    image: IMAGE.PERSON_IN_FOREST,
    title: 'Enjoying the Nature',
    fee: 568,
    focusY: 0.45,
    abrasion: 1.5,
    puzzle: { pieces: 16 },
    grime: { haze: 0.82, density: 6.0 },
  },

  // 34
  {
    image: IMAGE.PHOTOGRAPHER_IN_SNOW,
    title: 'Christmas Photo',
    fee: 584,
    abrasion: 1.5,
    puzzle: { pieces: 16 },
    grime: { haze: 0.84, density: 6.0 },
  },

  // 35
  {
    image: IMAGE.SAXOPHONIST,
    title: 'Making Music',
    fee: 616,
    abrasion: 1.5,
    puzzle: { pieces: 16 },
    grime: { haze: 0.87, density: 6.0 },
  },

  // 36
  {
    image: IMAGE.RAINBOW,
    title: 'Rainbow in the Sky',
    fee: 600,
    abrasion: 1.5,
    puzzle: {
      pieces: 16,
      tip: 'Last photo...',
    },
    grime: { haze: 0.9, density: 6.0 },
  },
] as const;
