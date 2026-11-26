import Phaser from 'phaser';
import { Container, Rectangle, render, Text } from 'phaser-jsx';

import { KEY, LEVELS, THEME } from '../constants';
import {
  createBackgroundTexture,
  createPhotoFrame,
  createPhotoTextures,
  getCoverLayout,
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
    const layout = getCoverLayout(this.scale.width, this.scale.height);

    const background = createBackgroundTexture(this, {
      width: this.scale.width,
      height: this.scale.height,
      glow: {
        x: layout.FRAME_X,
        y: layout.FRAME_Y - 30,
        radius: layout.FRAME_WIDTH * 0.8,
      },
      panelGlow: null,
    });
    this.add.image(0, 0, background.key).setOrigin(0);

    const textures = createPhotoTextures(this, level, 'cover');
    const frame = this.add.container(layout.FRAME_X, layout.FRAME_Y);
    frame.setRotation(-0.025);
    frame.add(
      createPhotoFrame(this, {
        x: 0,
        y: 0,
        width: layout.FRAME_WIDTH,
        height: layout.FRAME_HEIGHT,
        border: layout.FRAME_BORDER,
      }),
    );
    frame.add(
      this.add
        .image(0, 0, textures.clean.key)
        .setDisplaySize(layout.FRAME_WIDTH, layout.FRAME_HEIGHT),
    );

    render(
      <Container x={layout.TITLE_X} y={layout.TITLE_Y}>
        <Text
          x={0}
          y={0}
          text="REZ STORE"
          style={{
            fontFamily: THEME.FONT.SERIF,
            fontSize: layout.TITLE_SIZE,
            color: THEME.TEXT_COLOR.CREAM,
            padding: { bottom: 2 },
          }}
          originX={0}
        />

        <Text
          x={0}
          y={layout.SUBTITLE_Y}
          text="Photo Repair Shop"
          style={{
            fontFamily: THEME.FONT.SERIF,
            fontSize: layout.SUBTITLE_SIZE,
            color: THEME.TEXT_COLOR.GOLD,
            padding: { bottom: 2 },
          }}
          originX={0}
        />

        <Rectangle
          x={0}
          y={layout.DIVIDER_Y}
          width={layout.DIVIDER_WIDTH}
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
