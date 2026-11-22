export type PuzzlePieceCount = 4 | 6 | 8 | 9 | 12 | 15 | 16;

export interface PuzzleConfig {
  /** Number of torn pieces to reassemble. */
  pieces: PuzzlePieceCount;

  /** Tip shown while reassembling the photo. */
  tip?: string;
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

export interface PuzzleSlot {
  x: number;
  y: number;
  rotation: number;
}
