import Phaser from 'phaser';

import { KEY, LAYOUT, PUZZLE, PUZZLE_GRID } from '../constants';
import type {
  PhotoTextures,
  PuzzleBounds,
  PuzzleConfig,
  PuzzlePieceLayout,
  PuzzlePoint,
  PuzzleSlot,
} from '../types';
import { createCanvasTexture } from './canvasTexture';
import { createRandom } from './math';

type Random = Phaser.Math.RandomDataGenerator;
type EdgeAxis = 'horizontal' | 'vertical';
type EdgeGrid = PuzzlePoint[][][];

interface PhotoSources {
  photo: HTMLCanvasElement;
  grime: HTMLCanvasElement;
  setIn: HTMLCanvasElement;
  offsetX: number;
  offsetY: number;
}

/**
 * Bake each torn piece into its own texture.
 */
export function createPuzzlePieces(
  scene: Phaser.Scene,
  textures: PhotoTextures,
  config: PuzzleConfig,
  seed: string,
): PuzzlePieceLayout[] {
  clearPuzzleTextures(scene);

  const { columns, rows } = PUZZLE_GRID[config.pieces];
  const layouts = createPuzzleLayouts(columns, rows, seed);
  const photo = textures.aged.context.canvas;
  const grime = textures.grime.context.canvas;
  const setIn = textures.setIn.context.canvas;

  layouts.forEach((layout, index) => {
    const padding = PUZZLE.PADDING;
    const width = Math.ceil(layout.bounds.width + padding * 2);
    const height = Math.ceil(layout.bounds.height + padding * 2);
    const textureKey = `${KEY.TEXTURE.PHOTO_PIECE}-${String(index)}`;
    const texture = createCanvasTexture(scene, textureKey, width, height);
    const context = texture.context;
    const points = layout.points.map((point) => ({
      x: point.x - layout.bounds.x + padding,
      y: point.y - layout.bounds.y + padding,
    }));

    drawPieceShadow(context, points);
    drawPiecePhoto(context, points, {
      photo,
      grime,
      setIn,
      offsetX: padding - layout.bounds.x,
      offsetY: padding - layout.bounds.y,
    });
    drawPieceEdge(context, points);

    texture.refresh();
    layout.textureKey = textureKey;
    layout.hitArea = points;
  });

  return layouts;
}

/**
 * Scatter pieces over the photo in a shuffled grid.
 */
export function createPuzzleSlots(
  columns: number,
  rows: number,
  seed: string,
): PuzzleSlot[] {
  const random = createRandom(`${seed}:slots`);
  const total = columns * rows;
  const offset = total > 1 ? random.between(1, total - 1) : 0;
  const cellWidth = LAYOUT.PHOTO.WIDTH / columns;
  const cellHeight = LAYOUT.PHOTO.HEIGHT / rows;
  const left = LAYOUT.PHOTO.X - LAYOUT.PHOTO.WIDTH / 2;
  const top = LAYOUT.PHOTO.Y - LAYOUT.PHOTO.HEIGHT / 2;
  const slots: PuzzleSlot[] = [];

  for (let index = 0; index < total; index++) {
    const slotIndex = (index + offset) % total;
    const column = slotIndex % columns;
    const row = Math.floor(slotIndex / columns);

    slots.push({
      x:
        left +
        (column + 0.5) * cellWidth +
        random.realInRange(-PUZZLE.START_JITTER, PUZZLE.START_JITTER),
      y:
        top +
        (row + 0.5) * cellHeight +
        random.realInRange(-PUZZLE.START_JITTER, PUZZLE.START_JITTER),
      rotation: random.realInRange(
        -PUZZLE.START_ROTATION,
        PUZZLE.START_ROTATION,
      ),
    });
  }

  return slots;
}

function clearPuzzleTextures(scene: Phaser.Scene): void {
  const prefix = `${KEY.TEXTURE.PHOTO_PIECE}-`;

  for (const key of scene.textures.getTextureKeys()) {
    if (key.startsWith(prefix)) {
      scene.textures.remove(key);
    }
  }
}

function createPuzzleLayouts(
  columns: number,
  rows: number,
  seed: string,
): PuzzlePieceLayout[] {
  const random = createRandom(`${seed}:puzzle`);
  const cellWidth = LAYOUT.PHOTO.WIDTH / columns;
  const cellHeight = LAYOUT.PHOTO.HEIGHT / rows;
  const jitter = Math.min(
    PUZZLE.MAX_EDGE_JITTER,
    Math.min(cellWidth, cellHeight) * PUZZLE.EDGE_JITTER,
  );
  const corners = createCorners(
    columns,
    rows,
    cellWidth,
    cellHeight,
    jitter,
    random,
  );
  const verticalEdges = createVerticalEdges(
    columns,
    rows,
    corners,
    cellWidth,
    jitter,
    random,
  );
  const horizontalEdges = createHorizontalEdges(
    columns,
    rows,
    corners,
    cellHeight,
    jitter,
    random,
  );
  const left = LAYOUT.PHOTO.X - LAYOUT.PHOTO.WIDTH / 2;
  const top = LAYOUT.PHOTO.Y - LAYOUT.PHOTO.HEIGHT / 2;
  const layouts: PuzzlePieceLayout[] = [];

  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      const points = createPiecePolygon(
        verticalEdges,
        horizontalEdges,
        column,
        row,
      );
      const bounds = getBounds(points);

      layouts.push({
        points,
        bounds,
        targetX: left + bounds.x + bounds.width / 2,
        targetY: top + bounds.y + bounds.height / 2,
        textureKey: '',
        hitArea: [],
      });
    }
  }

  return layouts;
}

function createCorners(
  columns: number,
  rows: number,
  cellWidth: number,
  cellHeight: number,
  jitter: number,
  random: Random,
): PuzzlePoint[][] {
  const corners: PuzzlePoint[][] = [];

  for (let row = 0; row <= rows; row++) {
    const rowCorners: PuzzlePoint[] = [];
    const isOuterRow = row === 0 || row === rows;

    for (let column = 0; column <= columns; column++) {
      const isOuterColumn = column === 0 || column === columns;

      rowCorners.push({
        x:
          column * cellWidth +
          (isOuterColumn ? 0 : random.realInRange(-jitter, jitter)),
        y:
          row * cellHeight +
          (isOuterRow ? 0 : random.realInRange(-jitter, jitter)),
      });
    }

    corners.push(rowCorners);
  }

  return corners;
}

function createVerticalEdges(
  columns: number,
  rows: number,
  corners: PuzzlePoint[][],
  cellWidth: number,
  jitter: number,
  random: Random,
): EdgeGrid {
  const edges: EdgeGrid = [];

  for (let column = 0; column <= columns; column++) {
    const columnEdges: PuzzlePoint[][] = [];
    const isOuter = column === 0 || column === columns;

    for (let row = 0; row < rows; row++) {
      const start = corners[row][column];
      const end = corners[row + 1][column];

      columnEdges.push(
        isOuter
          ? [start, end]
          : createEdge(start, end, 'vertical', cellWidth, jitter, random),
      );
    }

    edges.push(columnEdges);
  }

  return edges;
}

function createHorizontalEdges(
  columns: number,
  rows: number,
  corners: PuzzlePoint[][],
  cellHeight: number,
  jitter: number,
  random: Random,
): EdgeGrid {
  const edges: EdgeGrid = [];

  for (let row = 0; row <= rows; row++) {
    const rowEdges: PuzzlePoint[][] = [];
    const isOuter = row === 0 || row === rows;

    for (let column = 0; column < columns; column++) {
      const start = corners[row][column];
      const end = corners[row][column + 1];

      rowEdges.push(
        isOuter
          ? [start, end]
          : createEdge(start, end, 'horizontal', cellHeight, jitter, random),
      );
    }

    edges.push(rowEdges);
  }

  return edges;
}

function createEdge(
  start: PuzzlePoint,
  end: PuzzlePoint,
  axis: EdgeAxis,
  cellSize: number,
  jitter: number,
  random: Random,
): PuzzlePoint[] {
  const points: PuzzlePoint[] = [start];
  const limit = cellSize * 0.35;

  for (let index = 1; index < PUZZLE.EDGE_SEGMENTS; index++) {
    const progress = index / PUZZLE.EDGE_SEGMENTS;
    const x = start.x + (end.x - start.x) * progress;
    const y = start.y + (end.y - start.y) * progress;

    if (axis === 'vertical') {
      points.push({
        x: Phaser.Math.Clamp(
          x + random.realInRange(-jitter, jitter),
          x - limit,
          x + limit,
        ),
        y,
      });
    } else {
      points.push({
        x,
        y: Phaser.Math.Clamp(
          y + random.realInRange(-jitter, jitter),
          y - limit,
          y + limit,
        ),
      });
    }
  }

  points.push(end);

  return points;
}

function createPiecePolygon(
  verticalEdges: EdgeGrid,
  horizontalEdges: EdgeGrid,
  column: number,
  row: number,
): PuzzlePoint[] {
  const top = horizontalEdges[row][column];
  const right = verticalEdges[column + 1][row];
  const bottom = horizontalEdges[row + 1][column];
  const left = verticalEdges[column][row];

  return [
    ...top,
    ...right.slice(1),
    ...bottom.slice().reverse().slice(1),
    ...left.slice().reverse().slice(1, -1),
  ];
}

function getBounds(points: PuzzlePoint[]): PuzzleBounds {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const point of points) {
    minX = Math.min(minX, point.x);
    minY = Math.min(minY, point.y);
    maxX = Math.max(maxX, point.x);
    maxY = Math.max(maxY, point.y);
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

function drawPieceShadow(
  context: CanvasRenderingContext2D,
  points: PuzzlePoint[],
): void {
  context.save();
  context.fillStyle = '#000000';
  context.shadowColor = PUZZLE.SHADOW_COLOR;
  context.shadowBlur = PUZZLE.SHADOW_BLUR;
  context.shadowOffsetX = PUZZLE.SHADOW_OFFSET_X;
  context.shadowOffsetY = PUZZLE.SHADOW_OFFSET_Y;
  tracePolygon(context, points);
  context.fill();
  context.restore();
}

function drawPiecePhoto(
  context: CanvasRenderingContext2D,
  points: PuzzlePoint[],
  sources: PhotoSources,
): void {
  context.save();
  tracePolygon(context, points);
  context.clip();
  context.drawImage(sources.photo, sources.offsetX, sources.offsetY);
  context.drawImage(sources.setIn, sources.offsetX, sources.offsetY);
  context.drawImage(sources.grime, sources.offsetX, sources.offsetY);
  context.restore();
}

function drawPieceEdge(
  context: CanvasRenderingContext2D,
  points: PuzzlePoint[],
): void {
  context.save();
  context.lineCap = 'round';
  context.lineJoin = 'round';

  tracePolygon(context, points);
  context.strokeStyle = PUZZLE.EDGE_OUTLINE_COLOR;
  context.lineWidth = PUZZLE.EDGE_OUTLINE_WIDTH;
  context.stroke();

  tracePolygon(context, points);
  context.strokeStyle = PUZZLE.EDGE_COLOR;
  context.lineWidth = PUZZLE.EDGE_WIDTH;
  context.stroke();

  context.restore();
}

function tracePolygon(
  context: CanvasRenderingContext2D,
  points: PuzzlePoint[],
): void {
  const first = points[0];

  context.beginPath();
  context.moveTo(first.x, first.y);

  for (let index = 1; index < points.length; index++) {
    const point = points[index];
    context.lineTo(point.x, point.y);
  }

  context.closePath();
}
