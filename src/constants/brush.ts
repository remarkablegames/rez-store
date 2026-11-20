import type { Brush, BrushId } from '../types';

export const BRUSHES: Record<BrushId, Brush> = {
  standard: {
    id: 'standard',
    name: 'Standard Brush',
    shortName: 'STANDARD',
    trait: 'BALANCED',
    description:
      'The reliable workshop brush. A steady middle ground for dust and smudges.',
    radius: 36,
    edge: 0.58,
    bristleWidth: 10,
    price: 0,
  },
  wide: {
    id: 'wide',
    name: 'Wide Head',
    shortName: 'WIDE',
    trait: 'BROAD & SOFT',
    description:
      'A broad head for clearing haze in a hurry. The soft edge leaves a fine film for the detail tip to finish.',
    radius: 56,
    edge: 0.5,
    bristleWidth: 18,
    price: 70,
  },
  detail: {
    id: 'detail',
    name: 'Detail Tip',
    shortName: 'DETAIL',
    trait: 'FINE & FIRM',
    description: 'A firm, narrow tip for corners, edges, and stubborn specks.',
    radius: 18,
    edge: 0.78,
    bristleWidth: 6,
    price: 110,
  },
};

export const BRUSH_ORDER: readonly BrushId[] = ['standard', 'wide', 'detail'];

export const DEFAULT_BRUSH_ID: BrushId = 'standard';

export const SHOP_BRUSHES: readonly Brush[] = [BRUSHES.wide, BRUSHES.detail];
