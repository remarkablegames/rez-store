import Phaser from 'phaser';
import { Container, Rectangle, render, Text } from 'phaser-jsx';

import { KEY, LAYOUT, LEVELS, THEME } from '../constants';
import {
  createBackgroundTexture,
  createPhotoFrame,
  createPhotoTextures,
  getQuery,
  loadPhoto,
} from '../utils';

export class Cover extends Phaser.Scene {
  private level = 0;

  constructor() {
    super(KEY.SCENE.COVER);
  }

  init() {
    const index = getQuery().level ?? 0;
    this.level = LEVELS[index] ? index : 0;
  }

  preload() {
    loadPhoto(this, LEVELS[this.level].image);
  }

  create() {
    const level = LEVELS[this.level];

    const background = createBackgroundTexture(this, {
      width: LAYOUT.COVER.WIDTH,
      height: LAYOUT.COVER.HEIGHT,
      glow: {
        x: LAYOUT.COVER.FRAME_X,
        y: LAYOUT.COVER.FRAME_Y - 30,
      },
      panelGlow: null,
    });
    this.add.image(0, 0, background.key).setOrigin(0);

    const textures = createPhotoTextures(this, level, 'cover');
    const frame = this.add.container(
      LAYOUT.COVER.FRAME_X,
      LAYOUT.COVER.FRAME_Y,
    );
    frame.setRotation(-0.025);
    frame.add(
      createPhotoFrame(this, {
        x: 0,
        y: 0,
        width: LAYOUT.PHOTO.WIDTH,
        height: LAYOUT.PHOTO.HEIGHT,
        border: LAYOUT.COVER.FRAME_BORDER,
      }),
    );
    frame.add(this.add.image(0, 0, textures.clean.key));

    render(
      <Container x={LAYOUT.COVER.TITLE_X} y={LAYOUT.COVER.TITLE_Y}>
        <Text
          x={0}
          y={0}
          text="REZ STORE"
          style={{
            fontFamily: THEME.FONT.SERIF,
            fontSize: 72,
            color: THEME.TEXT_COLOR.CREAM,
            padding: { bottom: 2 },
          }}
          originX={0}
        />

        <Text
          x={0}
          y={104}
          text="Photo Repair Shop"
          style={{
            fontFamily: THEME.FONT.SERIF,
            fontSize: 48,
            color: THEME.TEXT_COLOR.GOLD,
            padding: { bottom: 2 },
          }}
          originX={0}
        />

        <Rectangle
          x={0}
          y={176}
          width={140}
          height={2}
          fillColor={THEME.SHAPE_COLOR.GOLD}
          fillAlpha={0.55}
          originX={0}
          originY={0.5}
        />
      </Container>,
      this,
    );

    this.input.keyboard?.on('keydown-S', () => {
      this.game.renderer.snapshot((snapshot) => {
        if (!(snapshot instanceof HTMLImageElement)) {
          return;
        }

        const link = document.createElement('a');
        link.href = snapshot.src;
        link.download = 'rez-store.png';
        document.body.append(link);
        link.click();
        link.remove();
      });
    });
  }
}
