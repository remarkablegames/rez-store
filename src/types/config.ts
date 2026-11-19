export interface Grime {
  /** Opacity (0–1) of the all-over dust film. */
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

  /**
   * Hidden neutral point (0–1) on the development slider. Values below it are
   * too warm, values above it are too cool.
   */
  colorTarget?: number;

  /** Maximum payout for a perfect restoration. */
  fee: number;

  grime: Grime;
}
