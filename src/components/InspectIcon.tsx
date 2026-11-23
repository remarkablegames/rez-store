import { Container, Rectangle } from 'phaser-jsx';

import { THEME } from '../constants';

const COLUMNS = 6;
const ROWS = 4;
const CELL = 12;
const GAP = 2;
const GRID_WIDTH = COLUMNS * CELL + (COLUMNS - 1) * GAP;
const GRID_HEIGHT = ROWS * CELL + (ROWS - 1) * GAP;

// Miniature version of the in-game inspection map.
const GRIME = [
  [0, 0.15, 0.5, 0.75, 0.3, 0],
  [0.1, 0.45, 0.85, 1, 0.6, 0.15],
  [0, 0.2, 0.55, 0.7, 0.25, 0],
  [0, 0, 0, 0, 0, 0],
] as const;

const DAMAGE = [
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0.3, 0, 0],
  [0, 0, 0, 0.55, 0.3, 0],
] as const;

const ZONES = GRIME.flatMap((row, rowIndex) =>
  row.map((grime, column) => ({
    grime,
    damage: DAMAGE[rowIndex]?.[column] ?? 0,
    column,
    row: rowIndex,
  })),
);

interface InspectIconProps {
  x: number;
  y: number;
}

export function InspectIcon({ x, y }: InspectIconProps) {
  return (
    <Container x={x} y={y}>
      <Rectangle
        x={0}
        y={0}
        width={GRID_WIDTH + 12}
        height={GRID_HEIGHT + 12}
        originX={0.5}
        originY={0.5}
        fillColor={THEME.SHAPE_COLOR.CREAM}
        fillAlpha={0.04}
      />

      {ZONES.map(({ grime, damage, column, row }) => {
        return (
          <Rectangle
            key={`${String(row)}-${String(column)}`}
            x={-GRID_WIDTH / 2 + column * (CELL + GAP)}
            y={-GRID_HEIGHT / 2 + row * (CELL + GAP)}
            width={CELL}
            height={CELL}
            originX={0}
            originY={0}
            fillColor={
              damage > 0
                ? THEME.SHAPE_COLOR.HEATMAP_DIRT
                : grime > 0
                  ? THEME.SHAPE_COLOR.INSPECT_GRIME
                  : THEME.SHAPE_COLOR.TRACK
            }
            fillAlpha={
              damage > 0
                ? 0.2 + damage * 0.55
                : grime > 0
                  ? 0.18 + grime * 0.45
                  : 0.55
            }
          />
        );
      })}
    </Container>
  );
}
