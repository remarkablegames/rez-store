import type { BrushId } from './brush';
import type { ColorAxis } from './config';
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
  brushLevels: Record<BrushId, number>;
  colors: ColorAxis[];
  inspect: boolean;
}

export interface JobAward {
  earned: number;
  bestPayout: number;
  earnings: number;
  isBest: boolean;
}
