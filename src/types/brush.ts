export type BrushId = 'standard' | 'wide' | 'detail';

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

  /** Bristle width used by the brush icon. */
  bristleWidth: number;

  /** Cost in the supply shop. The standard brush is free. */
  price: number;
}
