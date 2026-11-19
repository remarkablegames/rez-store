export interface DirtProfile {
  total: number;
  zones: number[];
  columns: number;
  rows: number;
}

export interface SurfaceResult {
  /** Weighted proportion of the original grime that was removed (0–1). */
  cleanliness: number;
  /** Proportion of original grime still remaining in each inspection zone. */
  zones: number[];
  columns: number;
  rows: number;
}
