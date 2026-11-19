import Phaser from 'phaser';
import { render } from 'phaser-jsx';

import { Chrome, Flash, Hud, Stamp } from '../components';
import { KEY, LAYOUT, LEVELS } from '../constants';
import { PhotoRestorer } from '../gameobjects';
import type { HudController, JobReport, SurfaceResult } from '../types';
import {
  createBackgroundTexture,
  createParticles,
  createRandom,
  getClientNote,
  getColorAccuracy,
  getGrade,
  getOverall,
  getPayout,
  loadProgress,
  recordJob,
} from '../utils';

export class Game extends Phaser.Scene {
  private restorer?: PhotoRestorer;
  private hud?: HudController;
  private startedAt = 0;
  private level = 0;
  private grimeSeed = '';
  private colorTarget = 0;
  private surface: SurfaceResult | null = null;
  private colorValue = 0;

  constructor() {
    super(KEY.SCENE.GAME);
  }

  init({
    level = 0,
    grimeSeed = Phaser.Math.RND.uuid(),
  }: {
    level?: number;
    grimeSeed?: string;
  } = {}) {
    this.level = LEVELS[level] ? level : 0;
    this.grimeSeed = grimeSeed;
    this.colorTarget = createRandom(grimeSeed).realInRange(0.35, 0.65);
  }

  create() {
    this.startedAt = this.time.now;
    this.hud = undefined;
    this.surface = null;
    this.colorValue = 0;

    const level = LEVELS[this.level];
    const progress = loadProgress();
    const best = progress.best[String(this.level)];

    const background = createBackgroundTexture(this);
    this.add.image(0, 0, background.key).setOrigin(0);

    render(<Chrome level={this.level} title={level.title} />, this);
    this.createPhotoFrame();
    this.createHudPanel();

    this.restorer = new PhotoRestorer(this, LAYOUT.PHOTO.X, LAYOUT.PHOTO.Y, {
      level: { ...level, colorTarget: this.colorTarget },
      grimeSeed: this.grimeSeed,
    });

    render(
      <Hud
        level={level}
        levelIndex={this.level}
        wallet={progress.wallet}
        bestPayout={best?.payout ?? 0}
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
      />,
      this,
    );
  }

  private handleContinue(): void {
    const surface = this.restorer?.commitSurface();

    if (!surface) {
      return;
    }

    this.surface = surface;
    this.hud?.setStage('color');
  }

  private handleDeliver(): void {
    if (!this.restorer?.finishColor()) {
      return;
    }

    const level = LEVELS[this.level];
    const surface = this.surface?.cleanliness ?? 0;
    const color = getColorAccuracy(this.colorValue, this.colorTarget);
    const overall = getOverall(surface, color);
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
    const report: JobReport = {
      surface,
      color,
      overall,
      grade,
      timeSeconds: elapsedSeconds,
      zones: this.surface?.zones ?? [],
      zoneColumns: this.surface?.columns ?? 0,
      zoneRows: this.surface?.rows ?? 0,
      payout,
      earned: award.earned,
      bestPayout: award.bestPayout,
      wallet: award.wallet,
      note: getClientNote(surface, color, this.colorValue - this.colorTarget),
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
