import type { ColorAxis } from '../types/config';

export interface ColorUpgrade {
  axis: ColorAxis;
  name: string;
  trait: string;
  description: string;
  price: number;
}

export const COLORS: Record<ColorAxis, ColorUpgrade> = {
  temperature: {
    axis: 'temperature',
    name: 'Temperature',
    trait: 'COLOR BALANCE',
    description: 'Slide between warm versus cool tones.',
    price: 100,
  },
  tint: {
    axis: 'tint',
    name: 'Tint',
    trait: 'COLOR BALANCE',
    description: 'Slide between magenta versus green tones.',
    price: 150,
  },
};

export const SHOP_COLORS = [COLORS.temperature, COLORS.tint] as const;
