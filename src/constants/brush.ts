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

    {
      level: 4,
      name: 'Basic 4',
      trait: 'BALANCED\nSTR 70',
      description: 'Broader and kinder to faded ink.',
      price: 1050,
      radius: 66,
      strength: 0.7,
      abrasion: 0.35,
    },

    {
      level: 5,
      name: 'Basic 5',
      trait: 'BALANCED\nSTR 75',
      description: 'Near-full coverage with a forgiving touch.',
      price: 1600,
      radius: 74,
      strength: 0.75,
      abrasion: 0.32,
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
      description: 'Larger coverage with lower abrasion risk.',
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

    {
      level: 4,
      name: 'Wide Head 4',
      trait: 'BROAD & SOFT\nSTR 38',
      description: 'Wider sweeps with barely any abrasion risk.',
      price: 1150,
      radius: 102,
      strength: 0.38,
      abrasion: 0.2,
    },

    {
      level: 5,
      name: 'Wide Head 5',
      trait: 'BROAD & SOFT\nSTR 42',
      description: 'Maximum dust-clearing coverage.',
      price: 1700,
      radius: 114,
      strength: 0.42,
      abrasion: 0.18,
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
      description: 'Sharper tip with reduced abrasion.',
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

    {
      level: 4,
      name: 'Detail Tip 4',
      trait: 'FINE & FIRM\nSTR 125',
      description: 'Surgical point that lifts deep-set stains.',
      price: 1300,
      radius: 34,
      strength: 1.25,
      abrasion: 0.5,
    },

    {
      level: 5,
      name: 'Detail Tip 5',
      trait: 'FINE & FIRM\nSTR 135',
      description: 'The sharpest tip against the toughest grime.',
      price: 1900,
      radius: 38,
      strength: 1.35,
      abrasion: 0.44,
    },
  ],
};

export const BRUSH_ORDER: readonly BrushId[] = ['basic', 'wide', 'detail'];

export const BASIC_BRUSH_ID: BrushId = 'basic';

export const SHOP_BRUSHES: readonly Brush[] = [BRUSHES.wide, BRUSHES.detail];
