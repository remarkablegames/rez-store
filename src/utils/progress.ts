import {
  BRUSH_ORDER,
  BRUSH_UPGRADES,
  BRUSHES,
  COLORS,
  DEFAULT_BRUSH_ID,
  INSPECT_TOOL,
} from '../constants';
import type {
  Brush,
  BrushId,
  BrushUpgradeTier,
  ColorAxis,
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
 * Set earnings (for query-string debug overrides).
 */
export function saveEarnings(earnings: number): void {
  const progress = loadProgress();
  const next: Progress = { ...progress, earnings };
  saveProgress(next);
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
 * Get the effective brush for a given brush id, merging base stats with the
 * active upgrade tier from progress. Missing tier fields fall back to base.
 */
export function getBrush(brushId: BrushId, progress: Progress): Brush {
  const base = BRUSHES[brushId];
  const tier = getBrushUpgradeTier(brushId, progress);

  return {
    ...base,
    ...(tier ? { ...tier, id: brushId } : {}),
    id: brushId,
  };
}

/**
 * Get the active upgrade tier for a brush, or undefined if none applied.
 */
function getBrushUpgradeTier(
  brushId: BrushId,
  progress: Progress,
): BrushUpgradeTier | undefined {
  const tiers = BRUSH_UPGRADES[brushId];
  const level = progress.brushLevels[brushId];

  if (level <= 0 || level > tiers.length) {
    return undefined;
  }

  return tiers[level - 1];
}

/**
 * Buy the next upgrade tier for an owned brush.
 */
export function buyBrushUpgrade(brushId: BrushId): Progress | null {
  const progress = loadProgress();

  if (!progress.brushes.includes(brushId)) {
    return null;
  }

  const tiers = BRUSH_UPGRADES[brushId];
  const currentLevel = progress.brushLevels[brushId];

  if (currentLevel >= tiers.length) {
    return null;
  }

  const tier = tiers[currentLevel];

  if (progress.earnings < tier.price) {
    return null;
  }

  const brushLevels: Record<BrushId, number> = { ...progress.brushLevels };
  brushLevels[brushId] = currentLevel + 1;

  const next: Progress = {
    ...progress,
    earnings: progress.earnings - tier.price,
    brushLevels,
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
 * Buy a color axis unlock (temperature or tint).
 */
export function buyColor(axis: ColorAxis): Progress | null {
  const upgrade = COLORS[axis];

  const progress = loadProgress();

  if (progress.colors.includes(axis) || progress.earnings < upgrade.price) {
    return null;
  }

  const next: Progress = {
    ...progress,
    earnings: progress.earnings - upgrade.price,
    colors: [...progress.colors, axis],
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

  const rawLevels: unknown = value.brushLevels;
  const brushLevels: Record<BrushId, number> =
    isRecord(rawLevels) && !Array.isArray(rawLevels)
      ? (Object.fromEntries(
          BRUSH_ORDER.map((brushId) => {
            const raw = rawLevels[brushId];
            return typeof raw === 'number' && Number.isFinite(raw)
              ? [brushId, raw]
              : [brushId, 0];
          }),
        ) as Record<BrushId, number>)
      : { default: 0, wide: 0, detail: 0 };

  const rawColors: unknown = value.colors;
  const colors: ColorAxis[] =
    Array.isArray(rawColors) &&
    rawColors.every((c): c is ColorAxis => c === 'temperature' || c === 'tint')
      ? rawColors
      : [];

  return {
    version: 1,
    level: Number(value.level) || 0,
    ...base,
    brushes,
    equippedBrush,
    brushLevels,
    colors,
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
 * Normalize owned brushes, always keeping the default brush.
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
    brushLevels: { default: 0, wide: 0, detail: 0 },
    colors: [],
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
