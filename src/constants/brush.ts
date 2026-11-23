import type { Brush, BrushId, BrushUpgradeTier } from '../types';

export const BRUSHES: Record<BrushId, Brush> = {
  basic: {
    id: 'basic',
    name: 'Basic',
    shortName: 'BASIC',
    trait: 'BALANCED\nSTR 50',
    description: 'A middle ground for dust and smudges.',
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
    trait: 'BROAD & SOFT\nSTR 22',
    description: 'A wide, gentle head for clearing loose dust.',
    radius: 56,
    edge: 0.5,
    strength: 0.22,
    abrasion: 0.35,
    bristleWidth: 18,
    price: 90,
  },

  detail: {
    id: 'detail',
    name: 'Detail Tip',
    shortName: 'DETAIL',
    trait: 'FINE & FIRM\nSTR 85',
    description: 'A narrow, firm tip with the power to lift set-in grime.',
    radius: 18,
    edge: 0.78,
    strength: 0.85,
    abrasion: 0.85,
    bristleWidth: 6,
    price: 140,
  },
};

export const BRUSH_UPGRADES: Record<BrushId, BrushUpgradeTier[]> = {
  basic: [
    {
      level: 1,
      name: 'Basic 1',
      trait: 'BALANCED\nSTR 55',
      description: 'Slightly larger head with gentler bristles.',
      price: 130,
      radius: 43,
      strength: 0.55,
      abrasion: 0.55,
    },

    {
      level: 2,
      name: 'Basic 2',
      trait: 'BALANCED\nSTR 60',
      description: 'Broader reach, softer on delicate prints.',
      price: 320,
      radius: 50,
      strength: 0.6,
      abrasion: 0.45,
    },

    {
      level: 3,
      name: 'Basic 3',
      trait: 'BALANCED\nSTR 65',
      description: 'Capacious and forgiving on any print.',
      price: 625,
      radius: 58,
      strength: 0.65,
      abrasion: 0.4,
    },
  ],

  wide: [
    {
      level: 1,
      name: 'Wide Head 1',
      trait: 'BROAD & SOFT\nSTR 26',
      description: 'Expanded sweep for faster dust clearing.',
      price: 190,
      radius: 67,
      strength: 0.26,
      abrasion: 0.3,
    },

    {
      level: 2,
      name: 'Wide Head 2',
      trait: 'BROAD & SOFT\nSTR 30',
      description: 'Max coverage with minimal abrasion risk.',
      price: 440,
      radius: 78,
      strength: 0.3,
      abrasion: 0.25,
    },

    {
      level: 3,
      name: 'Wide Head 3',
      trait: 'BROAD & SOFT\nSTR 34',
      description: 'Covers a large area with one sweep.',
      price: 750,
      radius: 90,
      strength: 0.34,
      abrasion: 0.22,
    },
  ],

  detail: [
    {
      level: 1,
      name: 'Detail Tip 1',
      trait: 'FINE & FIRM\nSTR 95',
      description: 'Finer point with more lifting power.',
      price: 225,
      radius: 22,
      strength: 0.95,
      abrasion: 0.78,
    },

    {
      level: 2,
      name: 'Detail Tip 2',
      trait: 'FINE & FIRM\nSTR 105',
      description: 'Sharper tip, reduced abrasion on clean areas.',
      price: 500,
      radius: 26,
      strength: 1.05,
      abrasion: 0.68,
    },

    {
      level: 3,
      name: 'Detail Tip 3',
      trait: 'FINE & FIRM\nSTR 115',
      description: 'Pierces set-in grime with surgical precision.',
      price: 875,
      radius: 30,
      strength: 1.15,
      abrasion: 0.58,
    },
  ],
};

export const BRUSH_ORDER: readonly BrushId[] = ['basic', 'wide', 'detail'];

export const BASIC_BRUSH_ID: BrushId = 'basic';

export const SHOP_BRUSHES: readonly Brush[] = [BRUSHES.wide, BRUSHES.detail];
