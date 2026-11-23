import { GRADING, THEME } from '../constants';
import type { ColorAxis, ColorValue, GradeLetter } from '../types';
import { clampBinary } from './math';

export function getColorAccuracy(
  value: ColorValue,
  target: ColorValue,
  colorAxes: ColorAxis[] = ['temperature', 'tint'],
): number {
  const temperature = getAxisAccuracy(value.temperature, target.temperature);
  const tint = getAxisAccuracy(value.tint, target.tint);

  if (!colorAxes.length) {
    return 1;
  }

  if (colorAxes.length === 1 && colorAxes[0] === 'temperature') {
    return temperature;
  }

  return clampBinary((temperature + tint) / 2);
}

export function getOverall(
  surface: number,
  color: number,
  damage: number,
  colorWeight = GRADING.COLOR_WEIGHT,
): number {
  const surfaceWeight = 1 - colorWeight;
  const base = surface * surfaceWeight + color * colorWeight;

  return clampBinary(base - damage * GRADING.DAMAGE_WEIGHT);
}

export function getGrade(overall: number): GradeLetter {
  return GRADING.GRADES.find(({ minimum }) => overall >= minimum)?.grade ?? 'F';
}

export function getPayout(fee: number, overall: number): number {
  return Math.round(fee * overall * overall);
}

export function getClientNote(
  surface: number,
  color: number,
  damage: number,
  colorOffset: ColorValue,
): string {
  switch (true) {
    case damage >= 0.35:
      return 'The print is visibly damaged where it was over-scrubbed.';

    case damage >= 0.14:
      return 'Faint abrasion marks show where the print was over-scrubbed.';

    case surface < 0.6:
      return 'The print is thick with dust.';

    case surface < 0.78:
      return 'A decent pass, but grime still clings to the print.';

    case surface < 0.9:
      return 'Lovely work. Only a few specks remain.';

    case color < 0.55:
      return getColorNote(colorOffset);

    case color < 0.8:
      return 'A careful restoration. The tint is just slightly off.';

    case surface < 0.96:
      return 'Beautifully restored. Only the closest inspection reveals a bit of dust.';

    case damage >= 0.03:
      return 'A strong restoration, though close inspection reveals light abrasion.';

    default:
      return 'The client is delighted. A flawless restoration.';
  }
}

const GRIME_CLEAN = 0x26313a;

/**
 * Blue ramp for missed grime, matching the inspection overlay.
 */
export function getGrimeColor(value: number): number {
  return mixColor(
    GRIME_CLEAN,
    THEME.SHAPE_COLOR.INSPECT_GRIME,
    clampBinary(value),
  );
}

function getAxisAccuracy(value: number, target: number): number {
  return clampBinary(1 - Math.abs(value - target) / GRADING.COLOR_TOLERANCE);
}

function getColorNote(offset: ColorValue): string {
  if (Math.abs(offset.tint) > Math.abs(offset.temperature)) {
    return offset.tint < 0
      ? 'The surface is clean, but the print is too magenta.'
      : 'The surface is clean, but the print is too green.';
  }

  return offset.temperature < 0
    ? 'The surface is clean, but the skin tones are still too warm.'
    : 'The surface is clean, but the print is cold and blue.';
}

function mixColor(from: number, to: number, amount: number): number {
  const fromRed = (from >> 16) & 0xff;
  const fromGreen = (from >> 8) & 0xff;
  const fromBlue = from & 0xff;
  const toRed = (to >> 16) & 0xff;
  const toGreen = (to >> 8) & 0xff;
  const toBlue = to & 0xff;

  return (
    (Math.round(fromRed + (toRed - fromRed) * amount) << 16) |
    (Math.round(fromGreen + (toGreen - fromGreen) * amount) << 8) |
    Math.round(fromBlue + (toBlue - fromBlue) * amount)
  );
}
