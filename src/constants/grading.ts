import type { GradeLetter } from '../types';

export const COLOR_WEIGHT = 0.32;
export const DAMAGE_WEIGHT = 0.35;
export const COLOR_TOLERANCE = 0.4;

/** Any cell/zone with damage above this threshold is shown as abrasion. */
export const DAMAGE_THRESHOLD = 0.05;

export const GRADES: readonly { minimum: number; grade: GradeLetter }[] = [
  { minimum: 0.95, grade: 'S' },
  { minimum: 0.88, grade: 'A' },
  { minimum: 0.78, grade: 'B' },
  { minimum: 0.68, grade: 'C' },
  { minimum: 0.55, grade: 'D' },
];
