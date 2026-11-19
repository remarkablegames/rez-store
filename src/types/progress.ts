import type { GradeLetter } from './grading';

export interface JobRecord {
  overall: number;
  payout: number;
  grade: GradeLetter;
  colorTarget?: number;
}

export interface Progress {
  version: 1;
  wallet: number;
  best: Partial<Record<string, JobRecord>>;
}

export interface JobAward {
  earned: number;
  bestPayout: number;
  wallet: number;
  isBest: boolean;
}
