import type { Level } from '../types';
import { IMAGE } from './key';

export const LEVELS: Level[] = [
  // 0
  {
    image: IMAGE.SMILING_GIRL,
    title: 'The Smiling Girl',
    fee: 140,
    grime: { haze: 0.18, density: 1.5 },
  },

  // 1
  {
    image: IMAGE.HANDS_TOGETHER,
    title: 'Our Hands Together',
    fee: 180,
    focusY: 0.55,
    grime: { haze: 0.22, density: 1.8 },
  },
] as const;
