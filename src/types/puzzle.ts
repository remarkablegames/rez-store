export type PuzzlePieceCount = 4 | 6 | 8 | 9 | 12 | 15 | 16 | 20;

export type PuzzleDifficulty =
  'gentle' | 'standard' | 'tricky' | 'hard' | 'expert';

export interface PuzzleConfig {
  /** Number of torn pieces to reassemble. */
  pieces: PuzzlePieceCount;

  /** Tip shown while reassembling the photo. */
  tip?: string;

  /** Difficulty tuning preset. Defaults to `gentle`. */
  difficulty?: PuzzleDifficulty;
}

export interface PuzzleTuning {
  /** Completed photo alpha while idle. */
  guideAlpha: number;

  /** Completed photo alpha while dragging a piece. */
  guidePeekAlpha: number;

  /** Spawn scatter as a fraction of cell size. */
  scatter: number;

  /** Maximum spawn scatter in pixels. */
  maxScatter: number;

  /** Snap radius in pixels. */
  snapDistance: number;

  /** Share of pieces that start rotated (0-1). */
  rotationShare: number;

  /** Tear jitter as a fraction of cell size. */
  edgeJitter: number;
}

export interface PuzzlePoint {
  x: number;
  y: number;
}

export interface PuzzleBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PuzzlePieceLayout {
  /** Polygon in photo-local coordinates. */
  points: PuzzlePoint[];

  /** Bounds of the piece in photo-local coordinates. */
  bounds: PuzzleBounds;

  /** World position the piece snaps to. */
  targetX: number;
  targetY: number;

  /** Baked texture key. */
  textureKey: string;

  /** Polygon in texture-local coordinates, used for hit testing. */
  hitArea: PuzzlePoint[];
}

/** Quarter turns from upright (0-3). */
export type PuzzleTurn = 0 | 1 | 2 | 3;

export interface PuzzleSlot {
  x: number;
  y: number;
  rotation: number;
  turn: PuzzleTurn;
}
