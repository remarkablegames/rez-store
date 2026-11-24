import Phaser from 'phaser';

import { LAYOUT, PUZZLE, PUZZLE_GRID } from '../constants';
import type {
  PhotoTextures,
  PuzzleConfig,
  PuzzlePieceLayout,
  PuzzleTuning,
} from '../types';
import {
  createPuzzlePieces,
  createPuzzleSlots,
  getPuzzleTuning,
  UiSound,
} from '../utils';

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
  anchored: boolean;
  moved: boolean;
  turn: number;
  spin: number;
  anchorTween?: Phaser.Tweens.Tween;
  rotationTween?: Phaser.Tweens.Tween;
  dragOffsetX: number;
  dragOffsetY: number;
}

export class TornPuzzle {
  private readonly scene: Phaser.Scene;
  private readonly pieces: PuzzlePieceView[] = [];
  private readonly uiSound: UiSound;
  private readonly onComplete: () => void;
  private readonly onProgress?: (placed: number, total: number) => void;
  private readonly tuning: PuzzleTuning;
  private readonly rotationEnabled: boolean;
  private readonly guide?: Phaser.GameObjects.Image;
  private readonly dragPointers = new Set<number>();
  private peekTimer?: Phaser.Time.TimerEvent;
  private placedCount = 0;
  private completed = false;

  constructor(scene: Phaser.Scene, options: TornPuzzleOptions) {
    this.scene = scene;
    this.onComplete = options.onComplete;
    this.onProgress = options.onProgress;
    this.tuning = getPuzzleTuning(options.config);
    this.rotationEnabled = this.tuning.rotationShare > 0;
    this.uiSound = new UiSound(scene);

    if (this.tuning.guideAlpha > 0 || this.tuning.guidePeekAlpha > 0) {
      this.guide = scene.add
        .image(LAYOUT.PHOTO.X, LAYOUT.PHOTO.Y, options.textures.aged.key)
        .setAlpha(this.tuning.guideAlpha);
    }

    const layouts = createPuzzlePieces(
      scene,
      options.textures,
      options.config,
      options.seed,
      this.tuning,
    );
    const { columns, rows } = PUZZLE_GRID[options.config.pieces];
    const slots = createPuzzleSlots(columns, rows, options.seed, this.tuning);

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
        anchored: false,
        moved: false,
        turn: slot.turn,
        spin: slot.rotation,
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
      image.on('dragend', (pointer: Phaser.Input.Pointer) => {
        this.handleDragEnd(view, pointer);
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

    this.dragPointers.add(pointer.id);
    view.moved = false;
    this.scene.children.bringToTop(view.image);
    view.dragOffsetX = view.image.x - pointer.worldX;
    view.dragOffsetY = view.image.y - pointer.worldY;
    this.syncGuide();
    this.uiSound.play('select');
  }

  private handleDrag(
    view: PuzzlePieceView,
    pointer: Phaser.Input.Pointer,
  ): void {
    if (view.placed || this.completed) {
      return;
    }

    if (!view.moved) {
      if (pointer.getDistance() <= PUZZLE.TAP_DISTANCE) {
        return;
      }

      view.moved = true;
    }

    if (view.anchorTween) {
      view.anchorTween.stop();
      view.anchorTween = undefined;
      view.anchored = false;
    }

    const position = this.clampPosition(
      view.image,
      pointer.worldX + view.dragOffsetX,
      pointer.worldY + view.dragOffsetY,
    );
    view.image.setPosition(position.x, position.y);
  }

  private handleDragEnd(
    view: PuzzlePieceView,
    pointer: Phaser.Input.Pointer,
  ): void {
    this.dragPointers.delete(pointer.id);

    if (view.placed || this.completed) {
      this.syncGuide();
      return;
    }

    const tapped = !view.moved;

    if (this.rotationEnabled && tapped && view.turn) {
      this.turn(view, 1);
      return;
    }

    const distance = Phaser.Math.Distance.Between(
      view.image.x,
      view.image.y,
      view.layout.targetX,
      view.layout.targetY,
    );

    if (distance <= this.tuning.snapDistance) {
      if (!this.rotationEnabled || !view.turn) {
        this.snap(view);
      } else {
        this.anchor(view);
      }
    }

    this.syncGuide();
  }

  private turn(view: PuzzlePieceView, direction: 1 | -1): void {
    if (view.placed || this.completed) {
      return;
    }

    view.rotationTween?.stop();
    view.turn = (view.turn + direction + 4) % 4;
    view.spin += (direction * Math.PI) / 2;

    view.rotationTween = this.scene.tweens.add({
      targets: view.image,
      rotation: view.spin,
      duration: PUZZLE.ROTATION_DURATION,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        view.image.setRotation(Phaser.Math.Angle.Wrap(view.image.rotation));
        view.spin = view.image.rotation;
        view.rotationTween = undefined;
      },
    });

    this.uiSound.play('click');

    const snapped = !view.turn ? this.trySnap(view) : false;

    if (!snapped) {
      this.peekGuide();
    }
  }

  private trySnap(view: PuzzlePieceView): boolean {
    if (!this.rotationEnabled || view.turn) {
      return false;
    }

    const distance = Phaser.Math.Distance.Between(
      view.image.x,
      view.image.y,
      view.layout.targetX,
      view.layout.targetY,
    );

    if (distance <= this.tuning.snapDistance) {
      this.snap(view);
      return true;
    }

    return false;
  }

  private anchor(view: PuzzlePieceView): void {
    if (view.anchored) {
      return;
    }

    view.anchored = true;
    view.anchorTween = this.scene.tweens.add({
      targets: view.image,
      x: view.layout.targetX,
      y: view.layout.targetY,
      duration: 150,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        view.anchorTween = undefined;
      },
    });

    this.uiSound.play('click');
  }

  private snap(view: PuzzlePieceView): void {
    view.rotationTween?.stop();
    view.rotationTween = undefined;
    view.anchorTween?.stop();
    view.anchorTween = undefined;
    view.placed = true;
    view.anchored = false;
    view.turn = 0;
    view.spin = 0;
    view.image.disableInteractive();

    // Keep the snap tween on the shortest path from the current angle.
    view.image.setRotation(Phaser.Math.Angle.Wrap(view.image.rotation));
    this.scene.tweens.killTweensOf(view.image);

    this.scene.tweens.add({
      targets: view.image,
      x: view.layout.targetX,
      y: view.layout.targetY,
      scale: 1,
      rotation: 0,
      duration: 180,
      ease: 'Cubic.easeOut',
    });

    // Keep unsolved pieces above solved pieces so they stay visible and grabbable.
    this.pieces.forEach((piece) => {
      if (!piece.placed) {
        this.scene.children.bringToTop(piece.image);
      }
    });

    this.uiSound.play('drop');
    this.placedCount++;
    this.onProgress?.(this.placedCount, this.pieces.length);

    if (this.placedCount === this.pieces.length) {
      this.complete();
    }

    this.syncGuide();
  }

  private complete(): void {
    if (this.completed) {
      return;
    }

    this.completed = true;

    this.scene.time.delayedCall(240, () => {
      this.uiSound.play('shutter');
      this.flash();
      this.onComplete();
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

  /**
   * Show the photo while dragging a piece.
   */
  private syncGuide(): void {
    const peek = this.dragPointers.size > 0;

    this.setGuideAlpha(
      peek ? this.tuning.guidePeekAlpha : this.tuning.guideAlpha,
      peek ? PUZZLE.GUIDE_FADE_IN : PUZZLE.GUIDE_FADE_OUT,
    );
  }

  /**
   * Briefly show the photo after turning a piece so it can be checked.
   */
  private peekGuide(): void {
    if (!this.guide) {
      return;
    }

    this.peekTimer?.remove(false);
    this.setGuideAlpha(this.tuning.guidePeekAlpha, PUZZLE.GUIDE_FADE_IN);
    this.peekTimer = this.scene.time.delayedCall(PUZZLE.GUIDE_PEEK_HOLD, () => {
      this.peekTimer = undefined;
      this.syncGuide();
    });
  }

  private setGuideAlpha(alpha: number, duration: number): void {
    if (!this.guide || this.guide.alpha === alpha) {
      return;
    }

    this.scene.tweens.killTweensOf(this.guide);
    this.scene.tweens.add({
      targets: this.guide,
      alpha,
      duration,
      ease: 'Sine.easeOut',
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
