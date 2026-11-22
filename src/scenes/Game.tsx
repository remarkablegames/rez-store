import Phaser from 'phaser';
import { render } from 'phaser-jsx';

import { Chrome, Flash, Hud, Stamp } from '../components';
import { BRUSHES, GRADING, KEY, LAYOUT, LEVELS } from '../constants';
import { PhotoRestorer, TornPuzzle } from '../gameobjects';
import type {
  ColorAxis,
  ColorValue,
  HudController,
  JobReport,
  SurfaceResult,
} from '../types';
import {
  createBackgroundTexture,
  createParticles,
  createPhotoTextures,
  createRandom,
  equipBrush,
  getClientNote,
  getColorAccuracy,
  getGrade,
  getOverall,
  getOwnedBrushes,
  getPayout,
  loadPhoto,
  loadProgress,
  recordJob,
} from '../utils';

export class Game extends Phaser.Scene {
  private restorer?: PhotoRestorer;
  private hud?: HudController;
  private colorTarget: ColorValue = { temperature: 0.5, tint: 0.5 };
  private colors: ColorAxis[] = [];
  private surface?: SurfaceResult;
  private startedAt = 0;
  private level = 0;
  private grimeSeed = '';
  private colorValue: ColorValue = { temperature: 0, tint: 0 };

  constructor() {
    super(KEY.SCENE.GAME);
  }

  /**
   * Initialize game.
   */
  init({ level = 0, grimeSeed = Phaser.Math.RND.uuid() }) {
    this.level = LEVELS[level] ? level : 0;
    this.grimeSeed = grimeSeed;

    const progress = loadProgress();
    this.colors = progress.colors;

    const random = createRandom(grimeSeed);
    this.colorTarget = {
      temperature: random.realInRange(0.35, 0.65),
      tint: random.realInRange(0.35, 0.65),
    };
  }

  /**
   * Preload photo if not cached.
   */
  preload() {
    loadPhoto(this, LEVELS[this.level].image);
  }

  /**
   * Create game.
   */
  create() {
    this.startedAt = this.time.now;
    this.restorer = undefined;
    this.hud = undefined;
    this.surface = undefined;
    this.colorValue = { temperature: 0, tint: 0 };

    const level = LEVELS[this.level];
    const progress = loadProgress();
    const best = progress.best[String(this.level)];

    const nextLevel = LEVELS[this.level + 1];
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (nextLevel) {
      loadPhoto(this, nextLevel.image);
    }

    const background = createBackgroundTexture(this);
    this.add.image(0, 0, background.key).setOrigin(0);

    render(<Chrome level={this.level} title={level.title} />, this);
    this.createPhotoFrame();
    this.createHudPanel();

    const textures = createPhotoTextures(this, level, this.grimeSeed);
    const startRestoration = () => {
      this.restorer = new PhotoRestorer(this, LAYOUT.PHOTO.X, LAYOUT.PHOTO.Y, {
        level,
        colorAxes: this.colors,
        colorTarget: this.colorTarget,
        textures,
        brush: BRUSHES[progress.equippedBrush],
        inspect: progress.inspect,
      });
      this.hud?.setStage('clean');
    };

    if (level.puzzle) {
      new TornPuzzle(this, {
        textures,
        config: level.puzzle,
        seed: this.grimeSeed,
        onProgress: (placed, total) => {
          this.hud?.setPuzzleProgress(placed, total);
        },
        onComplete: startRestoration,
      });
    } else {
      startRestoration();
    }

    render(
      <Hud
        level={level}
        levelIndex={this.level}
        earnings={progress.earnings}
        bestPayout={best?.payout ?? 0}
        brushes={getOwnedBrushes(progress)}
        equippedBrush={progress.equippedBrush}
        colors={this.colors}
        inspect={progress.inspect}
        onReady={(controller) => {
          this.hud = controller;
        }}
        onColorChange={(value) => {
          this.colorValue = value;
          this.restorer?.setColorValue(value);
        }}
        onContinue={() => {
          this.handleContinue();
        }}
        onDeliver={() => {
          this.handleDeliver();
        }}
        onNext={() => {
          this.scene.start(KEY.SCENE.GAME, { level: this.level + 1 });
        }}
        onShop={() => {
          this.scene.start(KEY.SCENE.SHOP, { level: this.level });
        }}
        onBrushChange={(brush) => {
          equipBrush(brush.id);
          this.restorer?.setBrush(brush);
        }}
        onInspectChange={(inspecting) => {
          this.restorer?.setInspecting(inspecting);
        }}
      />,
      this,
    );
  }

  private handleContinue(): void {
    const surface = this.restorer?.commitSurface();

    if (!surface) {
      return;
    }

    const isColorDisabled = !this.colors.length;

    this.surface = surface;
    if (!isColorDisabled) {
      this.hud?.setStage('color');
    }
    this.restorer?.setColorValue(this.colorValue);
  }

  private handleDeliver(): void {
    const level = LEVELS[this.level];
    const isColorDisabled = !this.colors.length;

    if (isColorDisabled) {
      const committedSurface = this.restorer?.commitSurface();
      if (!committedSurface) {
        return;
      }
      this.surface = committedSurface;
    } else if (!this.restorer?.finishColor()) {
      return;
    }

    const surface = this.surface?.cleanliness ?? 0;
    const damage = this.surface?.damage ?? 0;
    const colorWeight = isColorDisabled ? 0 : GRADING.COLOR_WEIGHT;

    const color = isColorDisabled
      ? 1
      : getColorAccuracy(this.colorValue, this.colorTarget, this.colors);

    const overall = getOverall(surface, color, damage, colorWeight);
    const grade = getGrade(overall);
    const payout = getPayout(level.fee, overall);
    const award = recordJob(
      this.level,
      overall,
      payout,
      grade,
      this.colorTarget,
    );

    const elapsedSeconds = Math.max(
      0,
      Math.round((this.time.now - this.startedAt) / 1000),
    );

    const colorOffset: ColorValue = {
      temperature: isColorDisabled
        ? 0
        : this.colorValue.temperature - this.colorTarget.temperature,
      tint: isColorDisabled ? 0 : this.colorValue.tint - this.colorTarget.tint,
    };

    const report: JobReport = {
      surface,
      color,
      damage,
      overall,
      grade,
      timeSeconds: elapsedSeconds,
      zones: this.surface?.zones ?? [],
      zoneColumns: this.surface?.columns ?? 0,
      zoneRows: this.surface?.rows ?? 0,
      payout,
      earned: award.earned,
      bestPayout: award.bestPayout,
      earnings: award.earnings,
      note: getClientNote(surface, color, damage, colorOffset),
    };

    this.hud?.setReport(report);
    this.hud?.setStage('complete');

    if (overall >= 0.88) {
      this.playCompletionEffects();
    }
  }

  private createPhotoFrame(): void {
    const frameX =
      LAYOUT.PHOTO.X - LAYOUT.PHOTO.WIDTH / 2 - LAYOUT.PHOTO.BORDER;
    const frameY =
      LAYOUT.PHOTO.Y - LAYOUT.PHOTO.HEIGHT / 2 - LAYOUT.PHOTO.BORDER;
    const frameWidth = LAYOUT.PHOTO.WIDTH + LAYOUT.PHOTO.BORDER * 2;
    const frameHeight = LAYOUT.PHOTO.HEIGHT + LAYOUT.PHOTO.BORDER * 2;
    const frame = this.add.graphics();

    frame.fillStyle(0x000000, 0.22);
    frame.fillRoundedRect(frameX + 12, frameY + 16, frameWidth, frameHeight, 6);

    frame.fillStyle(0x000000, 0.32);
    frame.fillRoundedRect(frameX + 6, frameY + 8, frameWidth, frameHeight, 5);

    frame.fillStyle(0xefe5cf, 1);
    frame.fillRoundedRect(frameX, frameY, frameWidth, frameHeight, 3);

    frame.lineStyle(1, 0x8f836d, 0.65);
    frame.strokeRect(
      LAYOUT.PHOTO.X - LAYOUT.PHOTO.WIDTH / 2,
      LAYOUT.PHOTO.Y - LAYOUT.PHOTO.HEIGHT / 2,
      LAYOUT.PHOTO.WIDTH,
      LAYOUT.PHOTO.HEIGHT,
    );
  }

  private createHudPanel(): void {
    const panel = this.add.graphics();

    panel.fillStyle(0x14110d, 0.86);
    panel.fillRoundedRect(
      LAYOUT.HUD.X,
      LAYOUT.HUD.Y,
      LAYOUT.HUD.WIDTH,
      LAYOUT.HUD.HEIGHT,
      10,
    );

    panel.lineStyle(1, 0x9a8157, 0.35);
    panel.strokeRoundedRect(
      LAYOUT.HUD.X,
      LAYOUT.HUD.Y,
      LAYOUT.HUD.WIDTH,
      LAYOUT.HUD.HEIGHT,
      10,
    );

    panel.lineStyle(1, 0xffffff, 0.04);
    panel.strokeRoundedRect(
      LAYOUT.HUD.X + 1,
      LAYOUT.HUD.Y + 1,
      LAYOUT.HUD.WIDTH - 2,
      LAYOUT.HUD.HEIGHT - 2,
      9,
    );

    panel.fillStyle(0xc8a566, 0.55);
    panel.fillRect(LAYOUT.HUD.X + LAYOUT.HUD.PADDING, LAYOUT.HUD.Y + 16, 28, 2);
  }

  private playCompletionEffects(): void {
    render(
      <>
        <Stamp />
        <Flash />
      </>,
      this,
    );

    createParticles(this, {
      count: 28,
      x: LAYOUT.PHOTO.X,
      y: LAYOUT.PHOTO.Y,
      spreadX: LAYOUT.PHOTO.WIDTH / 2 + 30,
      spreadY: LAYOUT.PHOTO.HEIGHT / 2 + 30,
      color: (index) => (index % 3 === 0 ? 0xffe6b0 : 0xc8a566),
    });
  }

  /**
   * Update lifecycle.
   */
  update() {
    this.restorer?.update();
  }
}
