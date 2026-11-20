import Phaser from 'phaser';

import { LAYOUT } from '../constants';
import type {
  Brush,
  Level,
  PhotoTextures,
  RestoreStage,
  SurfaceResult,
} from '../types';
import {
  createLampGlowTexture,
  createParticles,
  createPhotoTextures,
  measureSurface,
  ScratchSound,
} from '../utils';

const DUST_PUFF_INTERVAL = 80;
const TEXTURE_REFRESH_INTERVAL = 34;
const MAX_COOL_CAST = 0.55;
const COOL_CAST_COLOR = 0x6f8fb8;

interface PhotoRestorerOptions {
  level: Level;
  grimeSeed: string;
  brush: Brush;
  lamp: boolean;
}

export class PhotoRestorer {
  private readonly scene: Phaser.Scene;
  private readonly level: Level;
  private readonly photoTextures: PhotoTextures;
  private readonly agedImage: Phaser.GameObjects.Image;
  private readonly colorCast: Phaser.GameObjects.Rectangle;
  private readonly lampGlow?: Phaser.GameObjects.Image;
  private readonly brushCursor: Phaser.GameObjects.Arc;
  private readonly cleanedCells = new Set<number>();
  private readonly x: number;
  private readonly y: number;
  private brush: Brush;
  private stage: RestoreStage = 'clean';
  private isScrubbing = false;
  private lastPoint: Phaser.Math.Vector2 | null = null;
  private grimeNeedsRefresh = false;
  private lastTextureRefresh = 0;
  private lastDustPuff = 0;
  private pointerOverPhotoFrame = false;
  private readonly scratchSound: ScratchSound;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    options: PhotoRestorerOptions,
  ) {
    this.scene = scene;
    this.level = options.level;
    this.x = x;
    this.y = y;
    this.brush = options.brush;
    this.photoTextures = createPhotoTextures(
      scene,
      options.level,
      options.grimeSeed,
    );

    scene.add.image(x, y, this.photoTextures.clean.key);
    this.agedImage = scene.add.image(x, y, this.photoTextures.aged.key);
    scene.add.image(x, y, this.photoTextures.grime.key);

    if (options.lamp) {
      const lampTexture = createLampGlowTexture(scene);
      this.lampGlow = scene.add.image(x, y, lampTexture.key).setAlpha(0.9);
    }

    this.colorCast = scene.add
      .rectangle(
        x,
        y,
        LAYOUT.PHOTO.WIDTH,
        LAYOUT.PHOTO.HEIGHT,
        COOL_CAST_COLOR,
        1,
      )
      .setAlpha(0)
      .setVisible(false);
    this.brushCursor = scene.add
      .circle(x, y, this.brush.radius, 0xffffff, 0.045)
      .setStrokeStyle(2, 0xffffff, 0.78)
      .setVisible(false);

    this.scratchSound = new ScratchSound(scene);

    scene.input.setDefaultCursor('default');
    scene.input.on('pointerdown', this.handlePointerDown);
    scene.input.on('pointermove', this.handlePointerMove);
    scene.input.on('pointerup', this.handlePointerUp);
  }

  setBrush(brush: Brush): void {
    this.brush = brush;
    this.brushCursor.setRadius(brush.radius);
  }

  setColorValue(value: number): void {
    if (this.stage !== 'color') {
      return;
    }

    const target = Phaser.Math.Clamp(this.level.colorTarget ?? 0.5, 0.1, 0.9);
    const next = Phaser.Math.Clamp(value, 0, 1);

    if (next <= target) {
      this.agedImage.setAlpha(1 - next / target);
      this.colorCast.setAlpha(0);
      return;
    }

    this.agedImage.setAlpha(0);
    this.colorCast.setAlpha(((next - target) / (1 - target)) * MAX_COOL_CAST);
  }

  commitSurface(): SurfaceResult | null {
    if (this.stage !== 'clean') {
      return null;
    }

    const result = measureSurface(
      this.photoTextures.grime.context,
      this.photoTextures.dirt,
    );

    this.stage = 'color';
    this.isScrubbing = false;
    this.lastPoint = null;
    this.pointerOverPhotoFrame = false;
    this.brushCursor.setVisible(false);
    this.lampGlow?.setVisible(false);
    this.scene.input.setDefaultCursor('default');
    this.colorCast.setVisible(true);

    return result;
  }

  finishColor(): boolean {
    if (this.stage !== 'color') {
      return false;
    }

    this.stage = 'complete';

    return true;
  }

  private readonly handlePointerDown = (
    pointer: Phaser.Input.Pointer,
  ): void => {
    if (this.stage !== 'clean' || pointer.button !== 0) {
      return;
    }

    const point = this.toLocal(pointer);

    if (!this.isInside(point)) {
      return;
    }

    this.isScrubbing = true;
    this.lastPoint = point;
    this.stamp(point.x, point.y);
  };

  private readonly handlePointerMove = (
    pointer: Phaser.Input.Pointer,
  ): void => {
    if (!this.isScrubbing || this.stage !== 'clean' || !pointer.isDown) {
      return;
    }

    const point = this.toLocal(pointer);
    const previous = this.lastPoint;
    this.lastPoint = point;

    if (!previous) {
      this.stamp(point.x, point.y);
      return;
    }

    const deltaX = point.x - previous.x;
    const deltaY = point.y - previous.y;
    const distance = Math.hypot(deltaX, deltaY);
    const steps = Math.max(1, Math.ceil(distance / (this.brush.radius * 0.22)));

    for (let step = 1; step <= steps; step++) {
      const progress = step / steps;
      this.stamp(
        previous.x + deltaX * progress,
        previous.y + deltaY * progress,
      );
    }
  };

  private readonly handlePointerUp = (): void => {
    this.isScrubbing = false;
    this.lastPoint = null;
  };

  private toLocal(pointer: Phaser.Input.Pointer): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(
      pointer.x - this.x + LAYOUT.PHOTO.WIDTH / 2,
      pointer.y - this.y + LAYOUT.PHOTO.HEIGHT / 2,
    );
  }

  /**
   * Whether cursor is inside photo frame and white border.
   */
  private isInside(point: Phaser.Math.Vector2): boolean {
    const b = LAYOUT.PHOTO.BORDER;

    return (
      point.x >= -b &&
      point.y >= -b &&
      point.x <= LAYOUT.PHOTO.WIDTH + b &&
      point.y <= LAYOUT.PHOTO.HEIGHT + b
    );
  }

  private stamp(localX: number, localY: number): void {
    if (this.stage !== 'clean') {
      return;
    }

    const { edge, radius } = this.brush;

    if (
      localX < -radius ||
      localX > LAYOUT.PHOTO.WIDTH + radius ||
      localY < -radius ||
      localY > LAYOUT.PHOTO.HEIGHT + radius
    ) {
      return;
    }

    const hadGrime = this.hasDirtyCellNear(localX, localY);
    const { context } = this.photoTextures.grime;
    const gradient = context.createRadialGradient(
      localX,
      localY,
      0,
      localX,
      localY,
      radius,
    );
    gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
    gradient.addColorStop(edge, 'rgba(0, 0, 0, 0.96)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    context.save();
    context.globalCompositeOperation = 'destination-out';
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(localX, localY, radius, 0, Math.PI * 2);
    context.fill();
    context.restore();

    this.grimeNeedsRefresh = true;
    this.markCleanedCells(localX, localY);

    if (hadGrime) {
      this.spawnDust(localX, localY);
    }

    this.scratchSound.play(hadGrime);
  }

  private hasDirtyCellNear(localX: number, localY: number): boolean {
    const { cellSize, columns, dirtyCells, rows } = this.photoTextures;
    const reach = this.brush.radius * 0.72;
    const minColumn = Math.max(0, Math.floor((localX - reach) / cellSize));
    const maxColumn = Math.min(
      columns - 1,
      Math.floor((localX + reach) / cellSize),
    );
    const minRow = Math.max(0, Math.floor((localY - reach) / cellSize));
    const maxRow = Math.min(rows - 1, Math.floor((localY + reach) / cellSize));

    for (let row = minRow; row <= maxRow; row++) {
      for (let column = minColumn; column <= maxColumn; column++) {
        const index = row * columns + column;

        if (dirtyCells.has(index) && !this.cleanedCells.has(index)) {
          return true;
        }
      }
    }

    return false;
  }

  private markCleanedCells(localX: number, localY: number): void {
    const { cellSize, columns, dirtyCells, rows } = this.photoTextures;
    const reach = this.brush.radius * 0.8;
    const reachSquared = reach * reach;
    const minColumn = Math.max(0, Math.floor((localX - reach) / cellSize));
    const maxColumn = Math.min(
      columns - 1,
      Math.floor((localX + reach) / cellSize),
    );
    const minRow = Math.max(0, Math.floor((localY - reach) / cellSize));
    const maxRow = Math.min(rows - 1, Math.floor((localY + reach) / cellSize));

    for (let row = minRow; row <= maxRow; row++) {
      for (let column = minColumn; column <= maxColumn; column++) {
        const index = row * columns + column;

        if (!dirtyCells.has(index) || this.cleanedCells.has(index)) {
          continue;
        }

        const deltaX = (column + 0.5) * cellSize - localX;
        const deltaY = (row + 0.5) * cellSize - localY;

        if (deltaX * deltaX + deltaY * deltaY <= reachSquared) {
          this.cleanedCells.add(index);
        }
      }
    }
  }

  private spawnDust(localX: number, localY: number): void {
    const now = this.scene.time.now;

    if (now - this.lastDustPuff < DUST_PUFF_INTERVAL) {
      return;
    }

    this.lastDustPuff = now;

    const worldX = this.x - LAYOUT.PHOTO.WIDTH / 2 + localX;
    const worldY = this.y - LAYOUT.PHOTO.HEIGHT / 2 + localY;

    createParticles(this.scene, {
      count: 2,
      x: worldX,
      y: worldY,
      spreadX: 10,
      spreadY: 8,
      color: 0xe1d2b5,
      radiusRange: [1, 2.6],
      alphaRange: [0.25, 0.5],
      durationRange: [350, 650],
      delayRange: [0, 0],
      driftXRange: [-12, 12],
      driftYRange: [-34, -14],
    });
  }

  /**
   * Update lifecycle.
   */
  update(): void {
    const pointer = this.scene.input.activePointer;

    if (this.isScrubbing && !pointer.isDown) {
      this.isScrubbing = false;
      this.lastPoint = null;
    }

    const localPoint = this.toLocal(pointer);
    const overPhotoFrame = this.stage === 'clean' && this.isInside(localPoint);

    if (overPhotoFrame !== this.pointerOverPhotoFrame) {
      this.pointerOverPhotoFrame = overPhotoFrame;
      this.scene.input.setDefaultCursor(overPhotoFrame ? 'none' : 'default');
    }

    this.brushCursor.setVisible(overPhotoFrame);

    if (overPhotoFrame) {
      this.brushCursor.setPosition(pointer.x, pointer.y);
    }

    if (
      this.grimeNeedsRefresh &&
      this.scene.time.now - this.lastTextureRefresh >= TEXTURE_REFRESH_INTERVAL
    ) {
      this.photoTextures.grime.refresh();
      this.grimeNeedsRefresh = false;
      this.lastTextureRefresh = this.scene.time.now;
    }
  }
}
