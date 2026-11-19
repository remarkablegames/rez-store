import type {
  GradeLetter,
  JobAward,
  JobRecord,
  PlayerProgress,
} from '../types';

const STORAGE_KEY = 'org.remarkablegames.rez-store';
const VALID_GRADES: readonly GradeLetter[] = ['S', 'A', 'B', 'C', 'D', 'F'];

export function loadProgress(): PlayerProgress {
  if (typeof localStorage === 'undefined') {
    return createEmptyProgress();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return createEmptyProgress();
    }

    const parsed: unknown = JSON.parse(raw);

    return isPlayerProgress(parsed) ? parsed : createEmptyProgress();
  } catch {
    return createEmptyProgress();
  }
}

export function recordJob(
  level: number,
  overall: number,
  payout: number,
  grade: GradeLetter,
): JobAward {
  const progress = loadProgress();
  const key = String(level);
  const previous = progress.best[key];
  const previousPayout = previous?.payout ?? 0;
  const earned = Math.max(0, payout - previousPayout);
  const isBest =
    !previous ||
    payout > previous.payout ||
    (payout === previous.payout && overall > previous.overall);
  const best = previous && !isBest ? previous : { overall, payout, grade };
  const next: PlayerProgress = {
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

function createEmptyProgress(): PlayerProgress {
  return {
    version: 1,
    wallet: 0,
    best: {},
  };
}

function saveProgress(progress: PlayerProgress): void {
  if (typeof localStorage === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    return;
  }
}

function isPlayerProgress(value: unknown): value is PlayerProgress {
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
