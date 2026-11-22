import type { Level } from '../types';
import { IMAGE } from './key';

export const LEVELS: Level[] = [
  // 0
  {
    image: IMAGE.SMILING_GIRL,
    title: 'The Smiling Girl',
    fee: 50,
    abrasion: 0,
    tip: 'Hover over the picture and press and drag to clear the dust.',
    grime: { haze: 0.18, density: 1.5 },
  },

  // 1
  {
    image: IMAGE.HANDS_TOGETHER,
    title: 'Our Hands Together',
    fee: 70,
    focusY: 0.55,
    abrasion: 0,
    grime: { haze: 0.22, density: 1.8 },
  },

  // 2
  {
    image: IMAGE.TODDLER_IN_PLAYGROUND,
    title: 'Playing in the Playground',
    fee: 90,
    abrasion: 0,
    grime: { haze: 0.26, density: 2.0 },
  },

  // 3
  {
    image: IMAGE.WHITE_DAFFODIL,
    title: 'White Daffodil Flower',
    fee: 110,
    abrasion: 0.25,
    tip: 'Go easy—hard scrubbing can damage the print.',
    grime: { haze: 0.28, density: 2.1 },
  },

  // 4
  {
    image: IMAGE.BOY_DIVING_INTO_POOL,
    title: 'Diving into the Swimming Pool',
    fee: 130,
    focusY: 0.35,
    abrasion: 0.5,
    tip: 'Over-scrubbing leaves marks on delicate prints.',
    grime: { haze: 0.3, density: 2.2 },
  },

  // 5
  {
    image: IMAGE.WOMAN_TAKING_PICTURE,
    title: 'Say Cheese!',
    fee: 150,
    abrasion: 1,
    tip: 'Hard scrubbing damages the print. Use lighter pressure.',
    grime: { haze: 0.32, density: 2.3 },
  },

  // 6
  {
    image: IMAGE.MAN_ON_SOFA,
    title: 'Sitting on the Sofa',
    fee: 170,
    grime: { haze: 0.34, density: 2.4 },
  },

  // 7
  {
    image: IMAGE.GUITARIST,
    title: 'Street Guitarist',
    fee: 190,
    grime: { haze: 0.36, density: 2.5 },
  },

  // 8
  {
    image: IMAGE.STREET_VIEW_AT_SUNSET,
    title: 'Sunset Street',
    fee: 210,
    grime: { haze: 0.38, density: 2.6 },
  },

  // 9
  {
    image: IMAGE.BIKING_ON_BEACH,
    title: 'Biking on the Beach',
    fee: 230,
    focusY: 0.45,
    grime: { haze: 0.4, density: 2.7 },
  },

  // 10
  {
    image: IMAGE.PADDLEBOARDER,
    title: 'Paddleboarding',
    fee: 250,
    focusY: 0.4,
    tip: 'Balance the temperature until skin tones feel natural.',
    grime: { haze: 0.42, density: 2.8 },
  },

  // 11
  {
    image: IMAGE.WOMAN_IN_POOL,
    title: 'Taking a Pic from the Pool',
    fee: 270,
    focusY: 0.4,
    grime: { haze: 0.44, density: 2.9 },
  },

  // 12
  {
    image: IMAGE.WEDDING_RING,
    title: 'Wedding Ring',
    fee: 290,
    abrasion: 1.5,
    tip: 'This delicate keepsake bruises under hard scrubbing.',
    grime: { haze: 0.46, density: 3.0 },
  },

  // 13
  {
    image: IMAGE.BONSAI_TREE,
    title: 'Bonsai Tree',
    fee: 310,
    grime: { haze: 0.48, density: 3.1 },
  },

  // 14
  {
    image: IMAGE.CAT_ON_SOFA,
    title: 'Cat on the Sofa',
    fee: 330,
    grime: { haze: 0.5, density: 3.2 },
  },

  // 15
  {
    image: IMAGE.DOG_SLEEPING_ON_COUCH,
    title: 'Napping Dog',
    fee: 350,
    tip: 'Adjust both temperature and tint for a natural look.',
    grime: { haze: 0.5, density: 3.3 },
  },

  // 16
  {
    image: IMAGE.BABY_SUCKING_ON_THUMB,
    title: 'Baby Boy',
    fee: 370,
    abrasion: 1.5,
    tip: 'A precious portrait... go easy on the brush.',
    grime: { haze: 0.5, density: 3.4 },
  },

  // 17
  {
    image: IMAGE.KOI_FISH,
    title: 'Koi Fish in a Pond',
    fee: 390,
    focusY: 0.45,
    grime: { haze: 0.5, density: 3.5 },
  },

  // 18
  {
    image: IMAGE.SWIMMING_TURTLE,
    title: 'Swimming Turtle',
    fee: 410,
    focusY: 0.5,
    grime: { haze: 0.5, density: 3.5 },
  },

  // 19
  {
    image: IMAGE.GRADUATION,
    title: 'Graduation',
    fee: 430,
    grime: { haze: 0.5, density: 3.5 },
  },

  // 20
  {
    image: IMAGE.TORTOISE_ON_SIDEWALK,
    title: 'Tortoise on the Sidewalk',
    fee: 450,
    focusY: 0.6,
    grime: { haze: 0.5, density: 3.5 },
  },

  // 21
  {
    image: IMAGE.CRASHING_WAVES,
    title: 'Sandy Toes and Salty Air',
    fee: 470,
    grime: { haze: 0.5, density: 3.5 },
  },

  // 22
  {
    image: IMAGE.SANDPIPERS_ON_BEACH,
    title: 'Birds at the Beach',
    fee: 490,
    grime: { haze: 0.5, density: 3.5 },
  },

  // 23
  {
    image: IMAGE.SURFING,
    title: 'Catching Waves',
    fee: 510,
    focusY: 0.35,
    grime: { haze: 0.5, density: 3.5 },
  },

  // 24
  {
    image: IMAGE.BOAT_IN_RIVER,
    title: 'Sailing in the River',
    fee: 530,
    grime: { haze: 0.5, density: 3.5 },
  },

  // 25
  {
    image: IMAGE.WINDING_BOARDWALK,
    title: 'Winding Road',
    fee: 550,
    abrasion: 1.25,
    grime: { haze: 0.5, density: 3.5 },
  },

  // 26
  {
    image: IMAGE.RED_FIRE_HYDRANT,
    title: 'Red Fire Hydrant',
    fee: 570,
    abrasion: 1.25,
    grime: { haze: 0.5, density: 3.5 },
  },

  // 27
  {
    image: IMAGE.TRAFFIC_LIGHTS,
    title: 'Going through Traffic',
    fee: 590,
    abrasion: 1.25,
    grime: { haze: 0.5, density: 3.5 },
  },

  // 28
  {
    image: IMAGE.HIGHWAY_EXIT,
    title: 'Highway Exit 276',
    fee: 610,
    abrasion: 1.25,
    grime: { haze: 0.5, density: 3.5 },
  },

  // 29
  {
    image: IMAGE.THE_ORANGE_SHOP,
    title: 'The Orange Shop',
    fee: 630,
    abrasion: 1.25,
    grime: { haze: 0.5, density: 3.5 },
  },

  // 30
  {
    image: IMAGE.DUCK_CROSSING_SIGN,
    title: 'Duck Crossing Sign',
    fee: 650,
    abrasion: 1.5,
    grime: { haze: 0.5, density: 3.5 },
  },

  // 31
  {
    image: IMAGE.SNOWY_DAY,
    title: 'Snowy Day',
    fee: 670,
    abrasion: 1.5,
    grime: { haze: 0.5, density: 3.5 },
  },

  // 32
  {
    image: IMAGE.PEOPLE_ON_SNOWY_SIDEWALK,
    title: 'Winter Stroll',
    fee: 690,
    abrasion: 1.5,
    grime: { haze: 0.5, density: 3.5 },
  },

  // 33
  {
    image: IMAGE.PERSON_IN_FOREST,
    title: 'Enjoying the Nature',
    fee: 710,
    focusY: 0.45,
    abrasion: 1.5,
    grime: { haze: 0.5, density: 3.5 },
  },

  // 34
  {
    image: IMAGE.PHOTOGRAPHER_IN_SNOW,
    title: 'Christmas Photo',
    fee: 730,
    abrasion: 1.5,
    grime: { haze: 0.5, density: 3.5 },
  },

  // 35
  {
    image: IMAGE.SAXOPHONIST,
    title: 'Making Music',
    fee: 770,
    abrasion: 1.5,
    grime: { haze: 0.5, density: 3.5 },
  },

  // 36
  {
    image: IMAGE.RAINBOW,
    title: 'Rainbow in the Sky',
    fee: 750,
    abrasion: 1.5,
    grime: { haze: 0.5, density: 3.5 },
  },
] as const;
