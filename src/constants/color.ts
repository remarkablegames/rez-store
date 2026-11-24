import type { ColorAxis } from '../types';

export interface ColorTier {
  axis: ColorAxis;
  name: string;
  trait: string;
  description: string;
  price: number;
}

export const COLOR_TIERS: ColorTier[] = [
  {
    axis: 'temperature',
    name: 'Temperature',
    trait: 'COLOR BALANCE',
    description: 'Slide between warm versus cool tones.',
    price: 125,
  },

  {
    axis: 'tint',
    name: 'Tint',
    trait: 'COLOR BALANCE',
    description: 'Slide between magenta versus green tones.',
    price: 190,
  },
] as const;
