export type BrushId = 'basic' | 'wide' | 'detail';

export interface Brush {
  id: BrushId;
  name: string;
  shortName: string;
  trait: string;
  description: string;

  /** Brush radius in pixels. */
  radius: number;

  /** Fraction of the radius that erases at full strength before the soft falloff. */
  edge: number;

  /** Fraction of set-in grime removed per stamp at full pressure (0-1). */
  strength: number;

  /** Relative risk of abrading the print when over-scrubbing. */
  abrasion: number;

  /** Bristle width used by the brush icon. */
  bristleWidth: number;

  /** Cost in the supply shop. The default brush is free. */
  price: number;
}

/** A single upgrade tier for a brush. Omitted fields inherit the base brush stat. */
export interface BrushUpgradeTier {
  level: number;
  price: number;
  name?: string;
  trait?: string;
  description?: string;
  radius?: number;
  edge?: number;
  strength?: number;
  abrasion?: number;
  bristleWidth?: number;
}
