import {
  BRUSH_ORDER,
  BRUSHES,
  DEFAULT_BRUSH_ID,
  INSPECT_TOOL,
} from '../constants';
import type {
  Brush,
  BrushId,
  ColorValue,
  GradeLetter,
  JobAward,
  JobRecord,
  Progress,
} from '../types';

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

    return parseProgress(parsed) ?? createEmptyProgress();
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
    return parseProgress(JSON.parse(raw)) !== null;
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
  colorTarget?: ColorValue,
): JobAward {
  const progress = loadProgress();
  const key = String(level);
  const previous = progress.best[key];
  const previousPayout = previous?.payout ?? 0;
  const earned = Math.max(0, payout - previousPayout);
  const targetsMatch =
    previous?.colorTarget !== undefined &&
    previous.tintTarget !== undefined &&
    previous.colorTarget === colorTarget?.temperature &&
    previous.tintTarget === colorTarget.tint;
  const isBest =
    previous?.colorTarget === undefined ||
    (targetsMatch &&
      (payout > previous.payout ||
        (payout === previous.payout && overall > previous.overall)));
  const record: JobRecord = {
    overall,
    payout,
    grade,
    colorTarget: colorTarget?.temperature,
    tintTarget: colorTarget?.tint,
  };
  const best = previous && !isBest ? previous : record;
  const next: Progress = {
    ...progress,
    level: level + 1,
    earnings: progress.earnings + earned,
    best: { ...progress.best, [key]: best },
  };

  saveProgress(next);

  return {
    earned,
    bestPayout: Math.max(previousPayout, payout),
    earnings: next.earnings,
    isBest,
  };
}

/**
 * Buy a brush.
 */
export function buyBrush(brushId: BrushId): Progress | null {
  const brush = BRUSHES[brushId];

  if (brush.price <= 0) {
    return null;
  }

  const progress = loadProgress();

  if (progress.brushes.includes(brushId) || progress.earnings < brush.price) {
    return null;
  }

  const next: Progress = {
    ...progress,
    earnings: progress.earnings - brush.price,
    brushes: [...progress.brushes, brushId],
    equippedBrush: brushId,
  };

  saveProgress(next);

  return next;
}

/**
 * Equip an owned brush.
 */
export function equipBrush(brushId: BrushId): Progress | null {
  const progress = loadProgress();

  if (!progress.brushes.includes(brushId)) {
    return null;
  }

  if (progress.equippedBrush === brushId) {
    return progress;
  }

  const next: Progress = { ...progress, equippedBrush: brushId };

  saveProgress(next);

  return next;
}

/**
 * Buy the inspect tool.
 */
export function buyInspect(): Progress | null {
  const progress = loadProgress();

  if (progress.inspect || progress.earnings < INSPECT_TOOL.price) {
    return null;
  }

  const next: Progress = {
    ...progress,
    earnings: progress.earnings - INSPECT_TOOL.price,
    inspect: true,
  };

  saveProgress(next);

  return next;
}

/**
 * Get owned brushes in catalog order.
 */
export function getOwnedBrushes(progress: Progress): Brush[] {
  return BRUSH_ORDER.filter((brushId) =>
    progress.brushes.includes(brushId),
  ).map((brushId) => BRUSHES[brushId]);
}

/**
 * Parse a saved progress record, migrating the original format.
 */
function parseProgress(value: unknown): Progress | null {
  if (!isRecord(value)) {
    return null;
  }

  const base = parseBase(value);

  if (!base) {
    return null;
  }

  const brushes = normalizeBrushes(value.brushes);
  const rawEquipped: unknown = value.equippedBrush;
  const equippedBrush: BrushId =
    isBrushId(rawEquipped) && brushes.includes(rawEquipped)
      ? rawEquipped
      : DEFAULT_BRUSH_ID;

  return {
    version: 1,
    level: Number(value.level) || 0,
    ...base,
    brushes,
    equippedBrush,
    inspect: value.inspect === true,
  };
}

/**
 * Parse earnings and best-score records shared by all save versions.
 */
function parseBase(
  value: Record<string, unknown>,
): Pick<Progress, 'earnings' | 'best'> | null {
  const { earnings } = value;

  if (typeof earnings !== 'number' || !Number.isFinite(earnings)) {
    return null;
  }

  const best = parseBest(value.best);

  if (!best) {
    return null;
  }

  return { earnings, best };
}

/**
 * Parse best-score records.
 */
function parseBest(value: unknown): Partial<Record<string, JobRecord>> | null {
  if (!isRecord(value)) {
    return null;
  }

  const best: Partial<Record<string, JobRecord>> = {};

  for (const [key, record] of Object.entries(value)) {
    if (!isJobRecord(record)) {
      return null;
    }

    best[key] = record;
  }

  return best;
}

/**
 * Normalize owned brushes, always keeping the standard brush.
 */
function normalizeBrushes(value: unknown): BrushId[] {
  const brushes: BrushId[] = [DEFAULT_BRUSH_ID];

  if (!Array.isArray(value)) {
    return brushes;
  }

  for (const entry of value) {
    if (
      typeof entry === 'string' &&
      isBrushId(entry) &&
      !brushes.includes(entry)
    ) {
      brushes.push(entry);
    }
  }

  return brushes;
}

/**
 * Check brush ID.
 */
function isBrushId(value: unknown): value is BrushId {
  return (
    typeof value === 'string' &&
    BRUSH_ORDER.some((brushId) => brushId === value)
  );
}

/**
 * Create empty progress.
 */
function createEmptyProgress(): Progress {
  return {
    version: 1,
    level: 0,
    earnings: 0,
    best: {},
    brushes: [DEFAULT_BRUSH_ID],
    equippedBrush: DEFAULT_BRUSH_ID,
    inspect: false,
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
