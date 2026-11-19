import type { GradeLetter } from '../types';
import { clampBinary } from '../utils';

const SURFACE_WEIGHT = 0.7;
const COLOR_WEIGHT = 0.3;
const COLOR_TOLERANCE = 0.4;

const GRADES: readonly { minimum: number; grade: GradeLetter }[] = [
  { minimum: 0.95, grade: 'S' },
  { minimum: 0.88, grade: 'A' },
  { minimum: 0.78, grade: 'B' },
  { minimum: 0.68, grade: 'C' },
  { minimum: 0.55, grade: 'D' },
];

export function getColorAccuracy(value: number, target: number): number {
  return clampBinary(1 - Math.abs(value - target) / COLOR_TOLERANCE);
}

export function getOverall(surface: number, color: number): number {
  return clampBinary(surface * SURFACE_WEIGHT + color * COLOR_WEIGHT);
}

export function getGrade(overall: number): GradeLetter {
  return GRADES.find(({ minimum }) => overall >= minimum)?.grade ?? 'F';
}

export function getPayout(fee: number, overall: number): number {
  return Math.round(fee * overall * overall);
}

export function getClientNote(
  surface: number,
  color: number,
  colorOffset: number,
): string {
  if (surface < 0.6) {
    return 'The print is still thick with dust.';
  }

  if (surface < 0.78) {
    return 'A decent pass, but the corners still hold dust and grime.';
  }

  if (surface < 0.9) {
    return 'Lovely work. A few stubborn specks remain.';
  }

  if (color < 0.55) {
    return colorOffset < 0
      ? 'The surface is clean, but the skin tones are still too warm.'
      : 'The surface is clean, but the print is cold and blue.';
  }

  if (color < 0.8) {
    return 'A careful restoration. The tint is just slightly off.';
  }

  if (surface < 0.96) {
    return 'Beautifully restored. Only the closest inspection reveals some dust.';
  }

  return 'The client is delighted. A flawless restoration.';
}
