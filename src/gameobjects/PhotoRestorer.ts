import Phaser from 'phaser';

import { LAYOUT } from '../constants';
import type { Level, PhotoTextures, RestoreStage } from '../types';
import { createPhotoTextures } from '../utils';

const BRUSH_RADIUS = 36;
const CLEAN_COMPLETE_THRESHOLD = 0.94;
const DUST_PUFF_INTERVAL = 80;
const GRIME_FADE_DURATION = 600;
const TEXTURE_REFRESH_INTERVAL = 34;

interface PhotoRestorerCallbacks {
  onProgress: (progress: number) => void;
  onCleanComplete: () => void;
  onComplete: () => void;
}

interface PhotoRestorerOptions {
  callbacks: PhotoRestorerCallbacks;
  level: Level;
}

export class PhotoRestorer {
  private readonly scene: Phaser.Scene;
  private readonly callbacks: PhotoRestorerCallbacks;
  private readonly photoTextures: PhotoTextures;
  private readonly agedImage: Phaser.GameObjects.Image;
  private readonly grimeImage: Phaser.GameObjects.Image;
  private readonly brushCursor: Phaser.GameObjects.Arc;
  private readonly cleanedCells = new Set<number>();
  private readonly x: number;
  private readonly y: number;
  private stage: RestoreStage = 'clean';
  private destroyed = false;
  private isScrubbing = false;
  private lastPoint: Phaser.Math.Vector2 | null = null;
  private grimeNeedsRefresh = false;
  private lastTextureRefresh = 0;
  private lastDustPuff = 0;
  private lastReportedPercent = -1;
  private pointerOverPhoto = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    options: PhotoRestorerOptions,
  ) {
    this.scene = scene;
    this.callbacks = options.callbacks;
    this.x = x;
    this.y = y;
    this.photoTextures = createPhotoTextures(scene, options.level);

    scene.add.image(x, y, this.photoTextures.clean.key);
    this.agedImage = scene.add.image(x, y, this.photoTextures.aged.key);
    this.grimeImage = scene.add.image(x, y, this.photoTextures.grime.key);
    this.brushCursor = scene.add
      .circle(x, y, BRUSH_RADIUS, 0xffffff, 0.045)
      .setStrokeStyle(2, 0xffffff, 0.78)
      .setVisible(false);

    scene.input.setDefaultCursor('default');
    scene.input.on('pointerdown', this.handlePointerDown);
    scene.input.on('pointermove', this.handlePointerMove);
    scene.input.on('pointerup', this.handlePointerUp);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.handleShutdown);

    if (this.photoTextures.dirtyCells.size === 0) {
      this.completeCleaning();
    }
  }

  setColorProgress(value: number): void {
    if (this.stage !== 'color') {
      return;
    }

    const progress = Phaser.Math.Clamp(value, 0, 1);
    this.agedImage.setAlpha(1 - progress);

    if (progress >= 0.99) {
      this.finishRestoration();
    }
  }

  destroy(): void {
    if (this.destroyed) {
      return;
    }

    this.destroyed = true;
    this.stage = 'complete';
    this.isScrubbing = false;
    this.lastPoint = null;
    this.scene.input.off('pointerdown', this.handlePointerDown);
    this.scene.input.off('pointermove', this.handlePointerMove);
    this.scene.input.off('pointerup', this.handlePointerUp);
    this.scene.events.off(Phaser.Scenes.Events.SHUTDOWN, this.handleShutdown);
    this.scene.input.setDefaultCursor('default');
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
    const steps = Math.max(1, Math.ceil(distance / (BRUSH_RADIUS * 0.22)));

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

  private readonly handleShutdown = (): void => {
    this.destroy();
  };

  private toLocal(pointer: Phaser.Input.Pointer): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(
      pointer.x - this.x + LAYOUT.PHOTO.WIDTH / 2,
      pointer.y - this.y + LAYOUT.PHOTO.HEIGHT / 2,
    );
  }

  private isInside(point: Phaser.Math.Vector2): boolean {
    return (
      point.x >= 0 &&
      point.y >= 0 &&
      point.x <= LAYOUT.PHOTO.WIDTH &&
      point.y <= LAYOUT.PHOTO.HEIGHT
    );
  }

  private stamp(localX: number, localY: number): void {
    if (this.stage !== 'clean') {
      return;
    }

    if (
      localX < -BRUSH_RADIUS ||
      localX > LAYOUT.PHOTO.WIDTH + BRUSH_RADIUS ||
      localY < -BRUSH_RADIUS ||
      localY > LAYOUT.PHOTO.HEIGHT + BRUSH_RADIUS
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
      BRUSH_RADIUS,
    );
    gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
    gradient.addColorStop(0.58, 'rgba(0, 0, 0, 0.96)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    context.save();
    context.globalCompositeOperation = 'destination-out';
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(localX, localY, BRUSH_RADIUS, 0, Math.PI * 2);
    context.fill();
    context.restore();

    this.grimeNeedsRefresh = true;

    const cleanedBefore = this.cleanedCells.size;
    this.markCleanedCells(localX, localY);

    if (this.cleanedCells.size !== cleanedBefore) {
      this.reportProgress();

      if (hadGrime) {
        this.spawnDust(localX, localY);
      }
    }
  }

  private hasDirtyCellNear(localX: number, localY: number): boolean {
    const { cellSize, columns, dirtyCells, rows } = this.photoTextures;
    const reach = BRUSH_RADIUS * 0.72;
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
    const reach = BRUSH_RADIUS * 0.8;
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

  private reportProgress(): void {
    const total = this.photoTextures.dirtyCells.size;

    if (total === 0) {
      this.callbacks.onProgress(1);
      this.completeCleaning();
      return;
    }

    const rawProgress = this.cleanedCells.size / total;
    const visibleProgress = Math.min(1, rawProgress / CLEAN_COMPLETE_THRESHOLD);
    const percent = Math.round(visibleProgress * 100);

    if (percent !== this.lastReportedPercent) {
      this.lastReportedPercent = percent;
      this.callbacks.onProgress(visibleProgress);
    }

    if (rawProgress >= CLEAN_COMPLETE_THRESHOLD) {
      this.completeCleaning();
    }
  }

  private completeCleaning(): void {
    if (this.stage !== 'clean') {
      return;
    }

    this.stage = 'color';
    this.isScrubbing = false;
    this.lastPoint = null;
    this.pointerOverPhoto = false;
    this.brushCursor.setVisible(false);
    this.scene.input.setDefaultCursor('default');
    this.callbacks.onProgress(1);
    this.callbacks.onCleanComplete();

    this.scene.tweens.add({
      targets: this.grimeImage,
      alpha: 0,
      duration: GRIME_FADE_DURATION,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        this.grimeImage.setVisible(false);
      },
    });
  }

  private finishRestoration(): void {
    if (this.stage !== 'color') {
      return;
    }

    this.stage = 'complete';
    this.agedImage.setAlpha(0);
    this.callbacks.onComplete();
  }

  private spawnDust(localX: number, localY: number): void {
    const now = this.scene.time.now;

    if (now - this.lastDustPuff < DUST_PUFF_INTERVAL) {
      return;
    }

    this.lastDustPuff = now;

    const worldX = this.x - LAYOUT.PHOTO.WIDTH / 2 + localX;
    const worldY = this.y - LAYOUT.PHOTO.HEIGHT / 2 + localY;

    for (let index = 0; index < 2; index++) {
      const particle = this.scene.add.circle(
        worldX + Phaser.Math.Between(-10, 10),
        worldY + Phaser.Math.Between(-8, 8),
        Phaser.Math.FloatBetween(1, 2.6),
        0xe1d2b5,
        Phaser.Math.FloatBetween(0.25, 0.5),
      );

      this.scene.tweens.add({
        targets: particle,
        alpha: 0,
        x: particle.x + Phaser.Math.Between(-12, 12),
        y: particle.y - Phaser.Math.Between(14, 34),
        duration: Phaser.Math.Between(350, 650),
        ease: 'Quad.easeOut',
        onComplete: () => {
          particle.destroy();
        },
      });
    }
  }

  /**
   * Update lifecycle
   */
  update(): void {
    if (this.destroyed) {
      return;
    }

    const pointer = this.scene.input.activePointer;

    if (this.isScrubbing && !pointer.isDown) {
      this.isScrubbing = false;
      this.lastPoint = null;
    }

    const localPoint = this.toLocal(pointer);
    const overPhoto = this.stage === 'clean' && this.isInside(localPoint);

    if (overPhoto !== this.pointerOverPhoto) {
      this.pointerOverPhoto = overPhoto;
      this.scene.input.setDefaultCursor(overPhoto ? 'none' : 'default');
    }

    this.brushCursor.setVisible(overPhoto);

    if (overPhoto) {
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
