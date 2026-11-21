import type { BrushId } from './brush';
import type { GradeLetter } from './grading';

export interface JobRecord {
  overall: number;
  payout: number;
  grade: GradeLetter;
  colorTarget?: number;
  tintTarget?: number;
}

export interface Progress {
  version: 1;
  level: number;
  earnings: number;
  best: Partial<Record<string, JobRecord>>;
  brushes: BrushId[];
  equippedBrush: BrushId;
  lamp: boolean;
}

export interface JobAward {
  earned: number;
  bestPayout: number;
  earnings: number;
  isBest: boolean;
}
