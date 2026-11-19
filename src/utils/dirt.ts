import type { DirtProfile, SurfaceResult } from '../types';
import { clampBinary } from '../utils';

export const DIRT_ZONE_COLUMNS = 6;
export const DIRT_ZONE_ROWS = 4;

export function measureDirt(context: CanvasRenderingContext2D): DirtProfile {
  const { height, width } = context.canvas;
  const { data } = context.getImageData(0, 0, width, height);
  const zones = new Array<number>(DIRT_ZONE_COLUMNS * DIRT_ZONE_ROWS).fill(0);
  let total = 0;

  for (let y = 0; y < height; y++) {
    const row = Math.min(
      DIRT_ZONE_ROWS - 1,
      Math.floor((y / height) * DIRT_ZONE_ROWS),
    );
    const rowOffset = row * DIRT_ZONE_COLUMNS;

    for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * 4 + 3];

      if (alpha === 0) {
        continue;
      }

      const column = Math.min(
        DIRT_ZONE_COLUMNS - 1,
        Math.floor((x / width) * DIRT_ZONE_COLUMNS),
      );

      total += alpha;
      zones[rowOffset + column] += alpha;
    }
  }

  return {
    total,
    zones,
    columns: DIRT_ZONE_COLUMNS,
    rows: DIRT_ZONE_ROWS,
  };
}

export function measureSurface(
  context: CanvasRenderingContext2D,
  initial: DirtProfile,
): SurfaceResult {
  const residual = measureDirt(context);
  const cleanliness =
    initial.total > 0 ? clampBinary(1 - residual.total / initial.total) : 1;
  const zones = residual.zones.map((value, index) => {
    const initialZone = initial.zones[index] ?? 0;

    return initialZone > 0 ? clampBinary(value / initialZone) : 0;
  });

  return {
    cleanliness,
    zones,
    columns: initial.columns,
    rows: initial.rows,
  };
}
