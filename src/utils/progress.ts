import type { GradeLetter, JobAward, JobRecord, Progress } from '../types';

const STORAGE_KEY = 'org.remarkablegames.rez-store';
const VALID_GRADES: readonly GradeLetter[] = ['S', 'A', 'B', 'C', 'D', 'F'];

/**
 * Load progress.
 */
export function loadProgress(): Progress {
  if (typeof localStorage === 'undefined') {
    return createEmptyProgress();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return createEmptyProgress();
    }

    const parsed: unknown = JSON.parse(raw);

    return validateProgress(parsed) ? parsed : createEmptyProgress();
  } catch {
    return createEmptyProgress();
  }
}

/**
 * Check if progress exists.
 */
export function hasSavedProgress(): boolean {
  if (typeof localStorage === 'undefined') {
    return false;
  }

  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return false;
  }

  try {
    return validateProgress(JSON.parse(raw));
  } catch {
    return false;
  }
}

/**
 * Reset progress.
 */
export function resetProgress(): void {
  saveProgress(createEmptyProgress());
}

/**
 * Record job result.
 */
export function recordJob(
  level: number,
  overall: number,
  payout: number,
  grade: GradeLetter,
  colorTarget?: number,
): JobAward {
  const progress = loadProgress();
  const key = String(level);
  const previous = progress.best[key];
  const previousPayout = previous?.payout ?? 0;
  const earned = Math.max(0, payout - previousPayout);
  const isBest =
    previous?.colorTarget === undefined ||
    (previous.colorTarget === colorTarget &&
      (payout > previous.payout ||
        (payout === previous.payout && overall > previous.overall)));
  const best =
    previous && !isBest ? previous : { overall, payout, grade, colorTarget };
  const next: Progress = {
    ...progress,
    wallet: progress.wallet + earned,
    best: { ...progress.best, [key]: best },
  };

  saveProgress(next);

  return {
    earned,
    bestPayout: Math.max(previousPayout, payout),
    wallet: next.wallet,
    isBest,
  };
}

/**
 * Create empty progress.
 */
function createEmptyProgress(): Progress {
  return {
    version: 1,
    wallet: 0,
    best: {},
  };
}

/**
 * Save progress.
 */
function saveProgress(progress: Progress): void {
  if (typeof localStorage === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    return;
  }
}

/**
 * Validate progress.
 */
function validateProgress(value: unknown): value is Progress {
  if (!isRecord(value)) {
    return false;
  }

  if (
    value.version !== 1 ||
    typeof value.wallet !== 'number' ||
    !Number.isFinite(value.wallet)
  ) {
    return false;
  }

  if (!isRecord(value.best)) {
    return false;
  }

  return Object.values(value.best).every(isJobRecord);
}

/**
 * Check job record.
 */
function isJobRecord(value: unknown): value is JobRecord {
  if (!isRecord(value)) {
    return false;
  }

  const { grade } = value;

  return (
    typeof value.overall === 'number' &&
    Number.isFinite(value.overall) &&
    typeof value.payout === 'number' &&
    Number.isFinite(value.payout) &&
    typeof grade === 'string' &&
    VALID_GRADES.some((letter) => letter === grade)
  );
}

/**
 * Check record.
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
