export interface Grime {
  /** Opacity (0–1) of the all-over dust film. */
  haze: number;

  /** Multiplier for dust clusters, smudges, stains, and scratches. */
  density: number;
}

export interface Level {
  image: string;

  /**
   * Vertical focal point (0 = top, 1 = bottom) used when the image is cover-cropped to the photo frame.
   */
  focusY?: number;

  grime: Grime;
}
