import type { PuzzleConfig } from './puzzle';

export type ColorAxis = 'temperature' | 'tint';

export interface Grime {
  /** Opacity (0-1) of the all-over dust film. */
  haze: number;

  /** Multiplier for dust clusters, smudges, stains, and scratches. */
  density: number;
}

export interface Level {
  image: string;

  /** Job name shown in the workbench. */
  title: string;

  /**
   * Vertical focal point (0 = top, 1 = bottom) used when the image is cover-cropped to the photo frame.
   */
  focusY?: number;

  /** Maximum payout for a perfect restoration. */
  fee: number;

  /**
   * Multiplier (0-1) applied to brush abrasion on this level.
   * 0 disables over-scrub damage entirely; defaults to 1 (full abrasion).
   */
  abrasion?: number;

  /** Tip shown during inspection when abrasion is relevant to this level. */
  tip?: string;

  /** Torn-photo reassembly stage. Omit to skip reassembly. */
  puzzle?: PuzzleConfig;

  grime: Grime;
}
