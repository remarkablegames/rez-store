import type { Brush, BrushId } from '../types';

export const BRUSHES: Record<BrushId, Brush> = {
  standard: {
    id: 'standard',
    name: 'Standard Brush',
    shortName: 'STANDARD',
    trait: 'BALANCED · STR 50',
    description:
      'The reliable workshop brush. A steady middle ground for dust and smudges.',
    radius: 36,
    edge: 0.58,
    strength: 0.5,
    abrasion: 0.65,
    bristleWidth: 10,
    price: 0,
  },
  wide: {
    id: 'wide',
    name: 'Wide Head',
    shortName: 'WIDE',
    trait: 'BROAD & SOFT · STR 28',
    description:
      'A broad, gentle head for clearing loose dust in a hurry. Too soft for set-in grime; finish with a firmer tip.',
    radius: 56,
    edge: 0.5,
    strength: 0.28,
    abrasion: 0.35,
    bristleWidth: 18,
    price: 70,
  },
  detail: {
    id: 'detail',
    name: 'Detail Tip',
    shortName: 'DETAIL',
    trait: 'FINE & FIRM · STR 85',
    description:
      'A firm, narrow tip with the power to lift set-in grime from corners and edges. Don’t linger on clean areas.',
    radius: 18,
    edge: 0.78,
    strength: 0.85,
    abrasion: 1.1,
    bristleWidth: 6,
    price: 110,
  },
};

export const BRUSH_ORDER: readonly BrushId[] = ['standard', 'wide', 'detail'];

export const DEFAULT_BRUSH_ID: BrushId = 'standard';

export const SHOP_BRUSHES: readonly Brush[] = [BRUSHES.wide, BRUSHES.detail];
