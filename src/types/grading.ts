export type GradeLetter = 'S' | 'A' | 'B' | 'C' | 'D' | 'F';

export interface JobReport {
  /** Surface cleanliness (0–1). */
  surface: number;
  /** Color accuracy (0–1). */
  color: number;
  /** Weighted overall score (0–1). */
  overall: number;
  grade: GradeLetter;
  timeSeconds: number;
  /** Remaining grime per inspection zone (0–1). */
  zones: number[];
  zoneColumns: number;
  zoneRows: number;
  /** Value of this delivery before the best-score rule. */
  payout: number;
  /** Cash added to earnings by this delivery. */
  earned: number;
  bestPayout: number;
  earnings: number;
  note: string;
}
