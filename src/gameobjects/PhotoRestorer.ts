import Phaser from 'phaser';

import { LAYOUT, THEME } from '../constants';
import type {
  Brush,
  ColorValue,
  Level,
  PhotoTextures,
  RestoreStage,
  SurfaceResult,
} from '../types';
import {
  clampBinary,
  createParticles,
  createPhotoTextures,
  measureSurface,
  rgba,
  ScratchSound,
  SET_IN_GRIME_WEIGHT,
} from '../utils';

const DUST_PUFF_INTERVAL = 80;
const TEXTURE_REFRESH_INTERVAL = 34;
const INSPECTION_REFRESH_INTERVAL = 160;
const MAX_COOL_CAST = 0.55;
const MAX_TINT_CAST = 0.32;
const COOL_CAST_COLOR = 0x6f8fb8;
const DEFAULT_COLOR_TARGET: ColorValue = { temperature: 0.5, tint: 0.5 };
const OVERSCRUB_THRESHOLD = 0.045;
const DAMAGE_INTERVAL = 70;
const DAMAGE_PER_STAMP = 0.05;
const DAMAGE_FULL_CELL_FRACTION = 0.1;

interface PhotoRestorerOptions {
  level: Level;
  grimeSeed: string;
  brush: Brush;
  inspect: boolean;
}

export class PhotoRestorer {
  private readonly scene: Phaser.Scene;
  private readonly level: Level;
  private readonly photoTextures: PhotoTextures;
  private readonly agedImage: Phaser.GameObjects.Image;
  private readonly colorCast: Phaser.GameObjects.Rectangle;
  private readonly tintCast: Phaser.GameObjects.Rectangle;
  private readonly inspection: Phaser.GameObjects.Graphics;
  private readonly brushCursor: Phaser.GameObjects.Arc;
  private readonly looseCells: Float32Array;
  private readonly setInCells: Float32Array;
  private readonly damageCells: Float32Array;
  private readonly x: number;
  private readonly y: number;
  private brush: Brush;
  private readonly inspect: boolean;
  private stage: RestoreStage = 'clean';
  private isScrubbing = false;
  private inspecting = false;
  private lastPoint: Phaser.Math.Vector2 | null = null;
  private grimeNeedsRefresh = false;
  private damageNeedsRefresh = false;
  private lastTextureRefresh = 0;
  private lastInspectionRefresh = 0;
  private lastDustPuff = 0;
  private lastDamageStamp = 0;
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
    this.inspect = options.inspect;
    this.photoTextures = createPhotoTextures(
      scene,
      options.level,
      options.grimeSeed,
    );
    this.looseCells = this.photoTextures.looseCells;
    this.setInCells = this.photoTextures.setInCells;
    this.damageCells = new Float32Array(
      this.photoTextures.columns * this.photoTextures.rows,
    );

    scene.add.image(x, y, this.photoTextures.clean.key);
    this.agedImage = scene.add.image(x, y, this.photoTextures.aged.key);
    scene.add.image(x, y, this.photoTextures.setIn.key);
    scene.add.image(x, y, this.photoTextures.grime.key);
    scene.add.image(x, y, this.photoTextures.damage.key);

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
    this.tintCast = scene.add
      .rectangle(
        x,
        y,
        LAYOUT.PHOTO.WIDTH,
        LAYOUT.PHOTO.HEIGHT,
        THEME.SHAPE_COLOR.TINT_MAGENTA,
        1,
      )
      .setAlpha(0)
      .setVisible(false);
    this.inspection = scene.add.graphics().setVisible(false);
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

  setColorValue(value: ColorValue): void {
    if (this.stage !== 'color') {
      return;
    }

    if (!this.level.colorAxes?.length) {
      return;
    }

    const target = this.level.colorTarget ?? DEFAULT_COLOR_TARGET;
    const temperatureTarget = Phaser.Math.Clamp(target.temperature, 0.1, 0.9);
    const tintTarget = Phaser.Math.Clamp(target.tint, 0.1, 0.9);
    const temperature = Phaser.Math.Clamp(value.temperature, 0, 1);
    const tint = Phaser.Math.Clamp(value.tint, 0, 1);

    if (temperature <= temperatureTarget) {
      const warmth =
        temperatureTarget > 0
          ? (temperatureTarget - temperature) / temperatureTarget
          : 1;

      this.agedImage.setAlpha(warmth);
      this.colorCast.setAlpha(0);
    } else {
      const cool =
        temperatureTarget < 1
          ? (temperature - temperatureTarget) / (1 - temperatureTarget)
          : 1;

      this.agedImage.setAlpha(0);
      this.colorCast.setAlpha(cool * MAX_COOL_CAST);
    }

    const tintOffset = tint - tintTarget;

    if (Math.abs(tintOffset) < 0.005) {
      this.tintCast.setAlpha(0);
      return;
    }

    const tintStrength =
      tintOffset < 0
        ? tintTarget > 0
          ? -tintOffset / tintTarget
          : 1
        : tintTarget < 1
          ? tintOffset / (1 - tintTarget)
          : 1;

    this.tintCast
      .setFillStyle(
        tintOffset < 0
          ? THEME.SHAPE_COLOR.TINT_MAGENTA
          : THEME.SHAPE_COLOR.TINT_GREEN,
      )
      .setAlpha(Phaser.Math.Clamp(tintStrength, 0, 1) * MAX_TINT_CAST);
  }

  setInspecting(inspecting: boolean): void {
    if (this.stage !== 'clean' || !this.inspect) {
      return;
    }

    this.inspecting = inspecting;
    this.inspection.setVisible(inspecting);

    if (!inspecting) {
      this.inspection.clear();
      return;
    }

    this.refreshInspection();
    this.lastInspectionRefresh = this.scene.time.now;
  }

  commitSurface(): SurfaceResult | null {
    if (this.stage !== 'clean') {
      return null;
    }

    const result = measureSurface(
      [
        { context: this.photoTextures.grime.context },
        {
          context: this.photoTextures.setIn.context,
          weight: SET_IN_GRIME_WEIGHT,
        },
      ],
      this.photoTextures.dirt,
      this.getDamage(),
    );

    const isColorDisabled = !this.level.colorAxes?.length;

    this.stage = isColorDisabled ? 'complete' : 'color';
    this.isScrubbing = false;
    this.lastPoint = null;
    this.pointerOverPhotoFrame = false;
    this.inspecting = false;
    this.inspection.clear().setVisible(false);
    this.brushCursor.setVisible(false);
    this.scene.input.setDefaultCursor('default');

    if (!isColorDisabled) {
      this.colorCast.setVisible(true);
      this.tintCast.setVisible(true);
    }

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
    if (this.stage !== 'clean' || pointer.button !== 0 || this.inspecting) {
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
    if (
      !this.isScrubbing ||
      this.stage !== 'clean' ||
      !pointer.isDown ||
      this.inspecting
    ) {
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

    const { radius } = this.brush;

    if (
      localX < -radius ||
      localX > LAYOUT.PHOTO.WIDTH + radius ||
      localY < -radius ||
      localY > LAYOUT.PHOTO.HEIGHT + radius
    ) {
      return;
    }

    const remaining = this.getMaxGrimeNear(localX, localY);

    this.eraseLayer(this.photoTextures.grime.context, localX, localY, 1);
    this.eraseLayer(
      this.photoTextures.setIn.context,
      localX,
      localY,
      this.brush.strength,
    );
    this.removeGrimeFromCells(localX, localY);

    this.grimeNeedsRefresh = true;

    if (remaining < OVERSCRUB_THRESHOLD) {
      this.applyOverScrub(localX, localY);
    } else {
      this.spawnDust(localX, localY);
    }

    this.scratchSound.play(remaining >= OVERSCRUB_THRESHOLD);
  }

  private eraseLayer(
    context: CanvasRenderingContext2D,
    localX: number,
    localY: number,
    opacity: number,
  ): void {
    const { edge, radius } = this.brush;
    const gradient = context.createRadialGradient(
      localX,
      localY,
      0,
      localX,
      localY,
      radius,
    );

    gradient.addColorStop(0, rgba(0, 0, 0, opacity));
    gradient.addColorStop(edge, rgba(0, 0, 0, opacity * 0.96));
    gradient.addColorStop(1, rgba(0, 0, 0, 0));

    context.save();
    context.globalCompositeOperation = 'destination-out';
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(localX, localY, radius, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }

  private getMaxGrimeNear(localX: number, localY: number): number {
    const { cellSize, columns, rows } = this.photoTextures;
    const reach = Math.max(8, this.brush.radius * 0.55);
    const reachSquared = reach * reach;
    const minColumn = Math.max(0, Math.floor((localX - reach) / cellSize));
    const maxColumn = Math.min(
      columns - 1,
      Math.floor((localX + reach) / cellSize),
    );
    const minRow = Math.max(0, Math.floor((localY - reach) / cellSize));
    const maxRow = Math.min(rows - 1, Math.floor((localY + reach) / cellSize));
    let remaining = 0;

    for (let row = minRow; row <= maxRow; row++) {
      for (let column = minColumn; column <= maxColumn; column++) {
        const deltaX = (column + 0.5) * cellSize - localX;
        const deltaY = (row + 0.5) * cellSize - localY;

        if (deltaX * deltaX + deltaY * deltaY > reachSquared) {
          continue;
        }

        const index = row * columns + column;
        remaining = Math.max(
          remaining,
          this.looseCells[index] + this.setInCells[index],
        );
      }
    }

    return remaining;
  }

  private removeGrimeFromCells(localX: number, localY: number): void {
    const { cellSize, columns, rows } = this.photoTextures;
    const { radius } = this.brush;
    const radiusSquared = radius * radius;
    const minColumn = Math.max(0, Math.floor((localX - radius) / cellSize));
    const maxColumn = Math.min(
      columns - 1,
      Math.floor((localX + radius) / cellSize),
    );
    const minRow = Math.max(0, Math.floor((localY - radius) / cellSize));
    const maxRow = Math.min(rows - 1, Math.floor((localY + radius) / cellSize));

    for (let row = minRow; row <= maxRow; row++) {
      for (let column = minColumn; column <= maxColumn; column++) {
        const deltaX = (column + 0.5) * cellSize - localX;
        const deltaY = (row + 0.5) * cellSize - localY;
        const distanceSquared = deltaX * deltaX + deltaY * deltaY;

        if (distanceSquared > radiusSquared) {
          continue;
        }

        const falloff = this.getStampFalloff(distanceSquared);
        const index = row * columns + column;

        this.looseCells[index] = Math.max(
          0,
          this.looseCells[index] * (1 - falloff),
        );
        this.setInCells[index] = Math.max(
          0,
          this.setInCells[index] * (1 - falloff * this.brush.strength),
        );
      }
    }
  }

  private getStampFalloff(distanceSquared: number): number {
    const { edge, radius } = this.brush;
    const distance = Math.sqrt(distanceSquared);
    const fullStrength = radius * edge;

    if (distance <= fullStrength) {
      return 1;
    }

    return Math.max(0, (radius - distance) / (radius - fullStrength));
  }

  private applyOverScrub(localX: number, localY: number): void {
    const now = this.scene.time.now;

    if (now - this.lastDamageStamp < DAMAGE_INTERVAL) {
      return;
    }

    if ((this.level.abrasion ?? 1) <= 0) {
      return;
    }

    this.lastDamageStamp = now;

    const { cellSize, columns, rows } = this.photoTextures;
    const radius = this.brush.radius * 0.8;
    const radiusSquared = radius * radius;
    const minColumn = Math.max(0, Math.floor((localX - radius) / cellSize));
    const maxColumn = Math.min(
      columns - 1,
      Math.floor((localX + radius) / cellSize),
    );
    const minRow = Math.max(0, Math.floor((localY - radius) / cellSize));
    const maxRow = Math.min(rows - 1, Math.floor((localY + radius) / cellSize));
    const amount =
      DAMAGE_PER_STAMP * this.brush.abrasion * (this.level.abrasion ?? 1);

    for (let row = minRow; row <= maxRow; row++) {
      for (let column = minColumn; column <= maxColumn; column++) {
        const deltaX = (column + 0.5) * cellSize - localX;
        const deltaY = (row + 0.5) * cellSize - localY;
        const distanceSquared = deltaX * deltaX + deltaY * deltaY;

        if (distanceSquared > radiusSquared) {
          continue;
        }

        const index = row * columns + column;
        const falloff = this.getStampFalloff(distanceSquared);

        this.damageCells[index] = clampBinary(
          this.damageCells[index] + amount * falloff,
        );
      }
    }

    this.drawAbrasion(localX, localY);
    this.damageNeedsRefresh = true;
  }

  private drawAbrasion(localX: number, localY: number): void {
    const context = this.photoTextures.damage.context;
    const random = Phaser.Math.RND;

    context.save();
    context.lineCap = 'round';

    for (let index = 0; index < 2; index++) {
      const angle = random.realInRange(0, Math.PI * 2);
      const length = random.realInRange(5, 16);
      const startX = localX + random.realInRange(-7, 7);
      const startY = localY + random.realInRange(-7, 7);
      const endX = startX + Math.cos(angle) * length;
      const endY = startY + Math.sin(angle) * length;
      const bend = random.realInRange(-4, 4);

      context.strokeStyle = rgba(255, 247, 227, random.realInRange(0.12, 0.24));
      context.lineWidth = random.realInRange(0.5, 1.1);
      context.beginPath();
      context.moveTo(startX, startY);
      context.quadraticCurveTo(
        (startX + endX) / 2 - Math.sin(angle) * bend,
        (startY + endY) / 2 + Math.cos(angle) * bend,
        endX,
        endY,
      );
      context.stroke();
    }

    context.restore();
  }

  private getDamage(): number {
    let total = 0;

    for (const value of this.damageCells) {
      total += value;
    }

    return clampBinary(
      total / (this.damageCells.length * DAMAGE_FULL_CELL_FRACTION),
    );
  }

  private refreshInspection(): void {
    const surface = measureSurface(
      [
        { context: this.photoTextures.grime.context },
        {
          context: this.photoTextures.setIn.context,
          weight: SET_IN_GRIME_WEIGHT,
        },
      ],
      this.photoTextures.dirt,
    );
    const left = this.x - LAYOUT.PHOTO.WIDTH / 2;
    const top = this.y - LAYOUT.PHOTO.HEIGHT / 2;
    const zoneWidth = LAYOUT.PHOTO.WIDTH / surface.columns;
    const zoneHeight = LAYOUT.PHOTO.HEIGHT / surface.rows;

    this.inspection.clear();

    for (let index = 0; index < surface.zones.length; index++) {
      const remaining = surface.zones[index] ?? 0;

      if (remaining <= 0.01) {
        continue;
      }

      const column = index % surface.columns;
      const row = Math.floor(index / surface.columns);

      this.inspection.fillStyle(
        THEME.SHAPE_COLOR.INSPECT_GRIME,
        0.08 + remaining * 0.32,
      );
      this.inspection.fillRect(
        left + column * zoneWidth,
        top + row * zoneHeight,
        zoneWidth - 1,
        zoneHeight - 1,
      );
    }

    const { cellSize, columns, rows } = this.photoTextures;

    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        const damage = this.damageCells[row * columns + column];

        if (damage <= 0.04) {
          continue;
        }

        this.inspection.fillStyle(
          THEME.SHAPE_COLOR.HEAT_DIRT,
          Math.min(0.55, 0.12 + damage * 0.5),
        );
        this.inspection.fillRect(
          left + column * cellSize,
          top + row * cellSize,
          cellSize - 1,
          cellSize - 1,
        );
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
      this.scene.input.setDefaultCursor(
        this.inspecting || !overPhotoFrame ? 'default' : 'none',
      );
    }

    this.brushCursor.setVisible(overPhotoFrame && !this.inspecting);

    if (overPhotoFrame) {
      this.brushCursor.setPosition(pointer.x, pointer.y);
    }

    const now = this.scene.time.now;

    if (
      (this.grimeNeedsRefresh || this.damageNeedsRefresh) &&
      now - this.lastTextureRefresh >= TEXTURE_REFRESH_INTERVAL
    ) {
      if (this.grimeNeedsRefresh) {
        this.photoTextures.grime.refresh();
        this.photoTextures.setIn.refresh();
      }

      if (this.damageNeedsRefresh) {
        this.photoTextures.damage.refresh();
      }

      this.grimeNeedsRefresh = false;
      this.damageNeedsRefresh = false;
      this.lastTextureRefresh = now;
    }

    if (
      this.inspecting &&
      now - this.lastInspectionRefresh >= INSPECTION_REFRESH_INTERVAL
    ) {
      this.refreshInspection();
      this.lastInspectionRefresh = now;
    }
  }
}
