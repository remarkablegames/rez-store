import Phaser from 'phaser';

import { LAYOUT, PUZZLE, PUZZLE_GRID } from '../constants';
import type { PhotoTextures, PuzzleConfig, PuzzlePieceLayout } from '../types';
import { createPuzzlePieces, createPuzzleSlots, UiSound } from '../utils';

interface TornPuzzleOptions {
  textures: PhotoTextures;
  config: PuzzleConfig;
  seed: string;
  onProgress?: (placed: number, total: number) => void;
  onComplete: () => void;
}

interface PuzzlePieceView {
  image: Phaser.GameObjects.Image;
  layout: PuzzlePieceLayout;
  placed: boolean;
  dragOffsetX: number;
  dragOffsetY: number;
}

export class TornPuzzle {
  private readonly scene: Phaser.Scene;
  private readonly pieces: PuzzlePieceView[] = [];
  private readonly uiSound: UiSound;
  private readonly onComplete: () => void;
  private readonly onProgress?: (placed: number, total: number) => void;
  private placedCount = 0;
  private completed = false;

  constructor(scene: Phaser.Scene, options: TornPuzzleOptions) {
    this.scene = scene;
    this.onComplete = options.onComplete;
    this.onProgress = options.onProgress;
    this.uiSound = new UiSound(scene);

    scene.add
      .image(LAYOUT.PHOTO.X, LAYOUT.PHOTO.Y, options.textures.aged.key)
      .setAlpha(PUZZLE.GHOST_ALPHA);

    const layouts = createPuzzlePieces(
      scene,
      options.textures,
      options.config,
      options.seed,
    );
    const { columns, rows } = PUZZLE_GRID[options.config.pieces];
    const slots = createPuzzleSlots(columns, rows, options.seed);

    layouts.forEach((layout, index) => {
      const slot = slots[index];
      const image = scene.add
        .image(slot.x, slot.y, layout.textureKey)
        .setScale(PUZZLE.START_SCALE)
        .setRotation(slot.rotation);

      this.constrain(image);

      image.setInteractive({
        hitArea: new Phaser.Geom.Polygon(layout.hitArea),
        hitAreaCallback: (
          polygon: Phaser.Geom.Polygon,
          x: number,
          y: number,
        ): boolean => Phaser.Geom.Polygon.Contains(polygon, x, y),
        draggable: true,
        useHandCursor: true,
      });

      const view: PuzzlePieceView = {
        image,
        layout,
        placed: false,
        dragOffsetX: 0,
        dragOffsetY: 0,
      };
      this.pieces.push(view);

      image.on('dragstart', (pointer: Phaser.Input.Pointer) => {
        this.handleDragStart(view, pointer);
      });
      image.on('drag', (pointer: Phaser.Input.Pointer) => {
        if (pointer.isDown) {
          this.handleDrag(view, pointer);
        }
      });
      image.on('dragend', () => {
        this.handleDragEnd(view);
      });
    });

    this.onProgress?.(0, layouts.length);
  }

  private handleDragStart(
    view: PuzzlePieceView,
    pointer: Phaser.Input.Pointer,
  ): void {
    if (view.placed || this.completed) {
      return;
    }

    this.scene.children.bringToTop(view.image);
    view.dragOffsetX = view.image.x - pointer.worldX;
    view.dragOffsetY = view.image.y - pointer.worldY;
    this.uiSound.play('select');
  }

  private handleDrag(
    view: PuzzlePieceView,
    pointer: Phaser.Input.Pointer,
  ): void {
    if (view.placed || this.completed) {
      return;
    }

    const position = this.clampPosition(
      view.image,
      pointer.worldX + view.dragOffsetX,
      pointer.worldY + view.dragOffsetY,
    );
    view.image.setPosition(position.x, position.y);
  }

  private handleDragEnd(view: PuzzlePieceView): void {
    if (view.placed || this.completed) {
      return;
    }

    const distance = Phaser.Math.Distance.Between(
      view.image.x,
      view.image.y,
      view.layout.targetX,
      view.layout.targetY,
    );

    if (distance <= PUZZLE.SNAP_DISTANCE) {
      this.snap(view);
    }
  }

  private snap(view: PuzzlePieceView): void {
    view.placed = true;
    view.image.disableInteractive();

    this.scene.tweens.add({
      targets: view.image,
      x: view.layout.targetX,
      y: view.layout.targetY,
      scale: 1,
      rotation: 0,
      duration: 180,
      ease: 'Cubic.easeOut',
    });

    this.uiSound.play('drop');
    this.placedCount++;
    this.onProgress?.(this.placedCount, this.pieces.length);

    if (this.placedCount === this.pieces.length) {
      this.complete();
    }
  }

  private complete(): void {
    if (this.completed) {
      return;
    }

    this.completed = true;
    this.uiSound.play('success');

    this.scene.time.delayedCall(240, () => {
      this.onComplete();
      this.flash();
    });
  }

  private flash(): void {
    const flash = this.scene.add
      .rectangle(
        LAYOUT.PHOTO.X,
        LAYOUT.PHOTO.Y,
        LAYOUT.PHOTO.WIDTH,
        LAYOUT.PHOTO.HEIGHT,
        0xfff2d6,
        1,
      )
      .setAlpha(0)
      .setDepth(1000);

    this.scene.tweens.add({
      targets: flash,
      alpha: { from: 0, to: 0.85 },
      duration: 90,
      yoyo: true,
      hold: 50,
      ease: 'Quad.easeOut',
      onComplete: () => {
        flash.destroy();
      },
    });
  }

  private constrain(image: Phaser.GameObjects.Image): void {
    const position = this.clampPosition(image, image.x, image.y);
    image.setPosition(position.x, position.y);
  }

  private clampPosition(
    image: Phaser.GameObjects.Image,
    x: number,
    y: number,
  ): { x: number; y: number } {
    const cos = Math.abs(Math.cos(image.rotation));
    const sin = Math.abs(Math.sin(image.rotation));
    const halfWidth =
      (image.width * image.scaleX * cos + image.height * image.scaleY * sin) /
      2;
    const halfHeight =
      (image.width * image.scaleX * sin + image.height * image.scaleY * cos) /
      2;

    return {
      x: Phaser.Math.Clamp(
        x,
        halfWidth + PUZZLE.PLAY_MARGIN,
        LAYOUT.HUD.X - halfWidth - PUZZLE.PLAY_MARGIN,
      ),
      y: Phaser.Math.Clamp(
        y,
        PUZZLE.HEADER_BOTTOM + halfHeight,
        LAYOUT.GAME.HEIGHT - halfHeight - PUZZLE.PLAY_MARGIN,
      ),
    };
  }
}
