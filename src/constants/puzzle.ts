import type {
  PuzzleDifficulty,
  PuzzlePieceCount,
  PuzzleTuning,
} from '../types';

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
  GUIDE_FADE_IN: 120,
  GUIDE_FADE_OUT: 160,
  GUIDE_PEEK_HOLD: 600,
  START_ROTATION: 0.1,
  START_SCALE: 0.9,
  EDGE_SEGMENTS: 12,
  CORNER_JITTER: 0.08,
  MAX_CORNER_JITTER: 12,
  MAX_EDGE_JITTER: 20,
  TAP_DISTANCE: 6,
  ROTATION_DURATION: 130,
  PLAY_MARGIN: 8,
  HEADER_BOTTOM: 96,
} as const;

export const PUZZLE_DIFFICULTY: Record<PuzzleDifficulty, PuzzleTuning> = {
  gentle: {
    guideAlpha: 0.1,
    guidePeekAlpha: 0.1,
    scatter: 0.07,
    maxScatter: 20,
    snapDistance: 32,
    rotationShare: 0,
    edgeJitter: 0.045,
  },
  standard: {
    guideAlpha: 0,
    guidePeekAlpha: 0.2,
    scatter: 0.28,
    maxScatter: 48,
    snapDistance: 28,
    rotationShare: 0,
    edgeJitter: 0.1,
  },
  tricky: {
    guideAlpha: 0,
    guidePeekAlpha: 0.16,
    scatter: 0.32,
    maxScatter: 52,
    snapDistance: 26,
    rotationShare: 0.5,
    edgeJitter: 0.12,
  },
  hard: {
    guideAlpha: 0,
    guidePeekAlpha: 0.1,
    scatter: 0.34,
    maxScatter: 56,
    snapDistance: 25,
    rotationShare: 0.75,
    edgeJitter: 0.14,
  },
  expert: {
    guideAlpha: 0,
    guidePeekAlpha: 0,
    scatter: 0.34,
    maxScatter: 56,
    snapDistance: 24,
    rotationShare: 1,
    edgeJitter: 0.14,
  },
};

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
  20: { columns: 5, rows: 4 },
};

export const PUZZLE_TIP = 'The picture will guide you.';
