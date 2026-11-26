import { LAYOUT } from '../constants';
import type { CoverLayout } from '../types';

export function getCoverLayout(width: number, height: number): CoverLayout {
  return (
    LAYOUT.COVERS.find(
      (layout) => layout.WIDTH === width && layout.HEIGHT === height,
    ) ?? LAYOUT.COVER_WIDE
  );
}
