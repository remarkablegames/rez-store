import type { GradeLetter } from './grading';

export interface JobRecord {
  overall: number;
  payout: number;
  grade: GradeLetter;
}

export interface PlayerProgress {
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
