import type { RestoreStage } from './restoreStage';

export interface HudController {
  setStage: (stage: RestoreStage) => void;
  setProgress: (progress: number) => void;
  setColorProgress: (progress: number) => void;
  setElapsed: (seconds: number) => void;
}
