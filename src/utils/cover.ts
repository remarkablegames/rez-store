import { LAYOUT } from '../constants';

const COVER_LAYOUTS = [LAYOUT.COVER, LAYOUT.COVER_COMPACT] as const;

export type CoverLayout = (typeof COVER_LAYOUTS)[number];

export function getCoverLayout(width: number, height: number): CoverLayout {
  return (
    COVER_LAYOUTS.find(
      (layout) => layout.WIDTH === width && layout.HEIGHT === height,
    ) ?? LAYOUT.COVER
  );
}
