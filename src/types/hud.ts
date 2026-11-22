import type { JobReport } from './grading';
import type { RestoreStage } from './restoreStage';

export interface HudController {
  setStage: (stage: RestoreStage) => void;
  setReport: (report: JobReport) => void;
  setPuzzleProgress: (placed: number, total: number) => void;
}
