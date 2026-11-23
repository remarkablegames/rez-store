import type { DirtProfile, SurfaceResult } from '../types';
import { clampBinary } from './math';

export const DIRT_ZONE_COLUMNS = 6;
export const DIRT_ZONE_ROWS = 4;

/** Hidden score weight for the resistant, set-in grime layer. */
export const SET_IN_GRIME_WEIGHT = 4;

export interface DirtLayer {
  context: CanvasRenderingContext2D;
  weight?: number;
}

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

/**
 * Combine the initial density of multiple grime layers.
 */
export function combineDirtProfiles(
  ...profiles: readonly DirtProfile[]
): DirtProfile {
  const zones = new Array<number>(DIRT_ZONE_COLUMNS * DIRT_ZONE_ROWS).fill(0);
  let total = 0;

  for (const profile of profiles) {
    total += profile.total;

    for (let index = 0; index < zones.length; index++) {
      zones[index] += profile.zones[index];
    }
  }

  return {
    total,
    zones,
    columns: DIRT_ZONE_COLUMNS,
    rows: DIRT_ZONE_ROWS,
  };
}

/**
 * Scale a profile for hidden scoring without changing its visual density.
 */
export function scaleDirtProfile(
  profile: DirtProfile,
  weight: number,
): DirtProfile {
  return {
    total: profile.total * weight,
    zones: profile.zones.map((value) => value * weight),
    columns: profile.columns,
    rows: profile.rows,
  };
}

export function measureSurface(
  layers: readonly DirtLayer[],
  initial: DirtProfile,
  damage = 0,
  damageZones: number[] = [],
): SurfaceResult {
  const residual = combineDirtProfiles(
    ...layers.map(({ context, weight = 1 }) =>
      scaleDirtProfile(measureDirt(context), weight),
    ),
  );
  const cleanliness =
    initial.total > 0 ? clampBinary(1 - residual.total / initial.total) : 1;
  const zones = residual.zones.map((value, index) => {
    const initialZone = initial.zones[index] ?? 0;

    return initialZone > 0 ? clampBinary(value / initialZone) : 0;
  });

  return {
    cleanliness,
    damage,
    damageZones,
    zones,
    columns: initial.columns,
    rows: initial.rows,
  };
}

/**
 * Sample average grime opacity into a coarse grid for stamp feedback.
 */
export function buildDirtCells(
  context: CanvasRenderingContext2D,
  columns: number,
  rows: number,
  cellSize: number,
): Float32Array {
  const { height, width } = context.canvas;
  const { data } = context.getImageData(0, 0, width, height);
  const cells = new Float32Array(columns * rows);

  for (let y = 0; y < height; y++) {
    const row = Math.min(rows - 1, Math.floor(y / cellSize));
    const rowOffset = row * columns;

    for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * 4 + 3];

      if (alpha > 0) {
        cells[rowOffset + Math.min(columns - 1, Math.floor(x / cellSize))] +=
          alpha;
      }
    }
  }

  const cellAlpha = cellSize * cellSize * 255;

  for (let index = 0; index < cells.length; index++) {
    cells[index] = clampBinary(cells[index] / cellAlpha);
  }

  return cells;
}
