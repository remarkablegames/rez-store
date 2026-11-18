import Phaser from 'phaser';
import { render } from 'phaser-jsx';

import { Hud } from '../components';
import { KEY, LAYOUT, LEVELS } from '../constants';
import { PhotoRestorer } from '../gameobjects';
import type { HudController } from '../types';
import { createBackgroundTexture } from '../utils';

export class Game extends Phaser.Scene {
  private restorer?: PhotoRestorer;
  private hud?: HudController;
  private startedAt = 0;
  private level = 0;

  constructor() {
    super(KEY.SCENE.GAME);
  }

  init({ level = 0 }) {
    this.level = LEVELS[level] ? level : 0;
  }

  create() {
    this.startedAt = this.time.now;
    this.hud = undefined;

    const background = createBackgroundTexture(this);
    this.add.image(0, 0, background.key).setOrigin(0);

    this.createChrome();
    this.createPhotoFrame();
    this.createHudPanel();

    this.restorer = new PhotoRestorer(this, LAYOUT.PHOTO.X, LAYOUT.PHOTO.Y, {
      imageKey: LEVELS[this.level],
      callbacks: {
        onProgress: (progress) => {
          this.hud?.setProgress(progress);
        },
        onCleanComplete: () => {
          this.hud?.setStage('color');
        },
        onComplete: () => {
          this.handleComplete();
        },
      },
    });

    render(
      <Hud
        onReady={(controller) => {
          this.hud = controller;
        }}
        onColorChange={(value) => {
          this.restorer?.setColorProgress(value);
        }}
        onRestart={() => {
          this.scene.start(KEY.SCENE.GAME, { level: this.level + 1 });
        }}
      />,
      this,
    );
  }

  private handleComplete(): void {
    const elapsedSeconds = Math.max(
      0,
      Math.round((this.time.now - this.startedAt) / 1000),
    );

    this.hud?.setElapsed(elapsedSeconds);
    this.hud?.setStage('complete');
    this.playCompletionEffects();
  }

  private createChrome(): void {
    const left = LAYOUT.PHOTO.X - LAYOUT.PHOTO.WIDTH / 2;

    this.add.text(left, 28, 'REZ STORE', {
      fontFamily: '"Courier New", Courier, monospace',
      fontSize: 14,
      color: '#c8a566',
      letterSpacing: 4,
    });

    this.add.text(left, 44, 'Photograph Restoration', {
      fontFamily: 'Georgia, "Times New Roman", serif',
      fontSize: 32,
      color: '#f1e6d2',
      padding: { bottom: 1 },
    });

    this.add.rectangle(left, 90, 48, 2, 0xc8a566, 0.55).setOrigin(0, 0.5);

    this.add
      .text(
        LAYOUT.PHOTO.X,
        LAYOUT.PHOTO.Y + LAYOUT.PHOTO.HEIGHT / 2 + LAYOUT.PHOTO.BORDER + 20,
        `MEMORY NO. ${String(this.level + 1).padStart(3, '0')}   /   HANDLE WITH CARE`,
        {
          fontFamily: '"Courier New", Courier, monospace',
          fontSize: 14,
          color: '#897b66',
          letterSpacing: 1.5,
        },
      )
      .setOrigin(0.5, 0);
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
    const stamp = this.add
      .text(
        LAYOUT.PHOTO.X + LAYOUT.PHOTO.WIDTH / 2 - 26,
        LAYOUT.PHOTO.Y + LAYOUT.PHOTO.HEIGHT / 2 - 24,
        'RESTORED',
        {
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontSize: 24,
          color: '#a8402f',
          stroke: '#a8402f',
          strokeThickness: 1,
          letterSpacing: 3,
        },
      )
      .setOrigin(1, 1)
      .setAngle(-7)
      .setAlpha(0)
      .setScale(1.5);

    this.tweens.add({
      targets: stamp,
      alpha: 0.85,
      scale: 1,
      duration: 450,
      ease: 'Back.easeOut',
    });

    const flash = this.add.rectangle(
      LAYOUT.PHOTO.X,
      LAYOUT.PHOTO.Y,
      LAYOUT.PHOTO.WIDTH,
      LAYOUT.PHOTO.HEIGHT,
      0xffe6b0,
      0.16,
    );

    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 650,
      ease: 'Quad.easeOut',
      onComplete: () => {
        flash.destroy();
      },
    });

    for (let index = 0; index < 28; index++) {
      const particle = this.add.circle(
        Phaser.Math.Between(
          LAYOUT.PHOTO.X - LAYOUT.PHOTO.WIDTH / 2 - 30,
          LAYOUT.PHOTO.X + LAYOUT.PHOTO.WIDTH / 2 + 30,
        ),
        Phaser.Math.Between(
          LAYOUT.PHOTO.Y - LAYOUT.PHOTO.HEIGHT / 2 - 30,
          LAYOUT.PHOTO.Y + LAYOUT.PHOTO.HEIGHT / 2 + 30,
        ),
        Phaser.Math.FloatBetween(1, 3),
        index % 3 === 0 ? 0xffe6b0 : 0xc8a566,
        Phaser.Math.FloatBetween(0.3, 0.8),
      );

      this.tweens.add({
        targets: particle,
        alpha: 0,
        x: particle.x + Phaser.Math.Between(-40, 40),
        y: particle.y - Phaser.Math.Between(40, 110),
        duration: Phaser.Math.Between(700, 1400),
        delay: Phaser.Math.Between(0, 250),
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
  update() {
    this.restorer?.update();
  }
}
