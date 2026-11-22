import type { PuzzlePieceCount } from '../types';

export const PUZZLE = {
  PADDING: 10,
  EDGE_COLOR: '#efe5cf',
  EDGE_WIDTH: 2.5,
  EDGE_OUTLINE_COLOR: 'rgba(70, 55, 36, 0.45)',
  EDGE_OUTLINE_WIDTH: 4,
  SHADOW_COLOR: 'rgba(0, 0, 0, 0.35)',
  SHADOW_BLUR: 5,
  SHADOW_OFFSET_X: 2,
  SHADOW_OFFSET_Y: 3,
  SNAP_DISTANCE: 32,
  GHOST_ALPHA: 0.1,
  START_JITTER: 20,
  START_ROTATION: 0.1,
  START_SCALE: 0.9,
  EDGE_SEGMENTS: 12,
  EDGE_JITTER: 0.08,
  MAX_EDGE_JITTER: 12,
  PLAY_MARGIN: 8,
  HEADER_BOTTOM: 96,
} as const;

export const PUZZLE_GRID: Record<
  PuzzlePieceCount,
  { columns: number; rows: number }
> = {
  4: { columns: 2, rows: 2 },
  6: { columns: 3, rows: 2 },
  8: { columns: 4, rows: 2 },
  9: { columns: 3, rows: 3 },
  12: { columns: 4, rows: 3 },
  15: { columns: 5, rows: 3 },
  16: { columns: 4, rows: 4 },
};

export const PUZZLE_TIP = 'The picture will guide you.';
