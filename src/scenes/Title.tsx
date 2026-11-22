import Phaser from 'phaser';
import { Container, Rectangle, render, Text } from 'phaser-jsx';

import { Button } from '../components';
import { KEY, LAYOUT, THEME } from '../constants';
import {
  getQuery,
  hasSavedProgress,
  loadProgress,
  resetProgress,
} from '../utils';
import { Music } from './Music';

export class Title extends Phaser.Scene {
  constructor() {
    super(KEY.SCENE.TITLE);
  }

  private startMusic() {
    const musicScene = this.scene.get(KEY.SCENE.MUSIC) as unknown as Music;
    void musicScene.musicManager?.play();
  }

  create() {
    const centerX = LAYOUT.GAME.WIDTH / 2;
    const centerY = LAYOUT.GAME.HEIGHT / 2;
    const hasSave = hasSavedProgress();
    const query = getQuery();

    render(
      <Container x={centerX} y={centerY}>
        <Text
          x={0}
          y={-170}
          text="REZ STORE"
          style={{
            fontFamily: THEME.FONT.MONO,
            fontSize: 24,
            color: THEME.TEXT_COLOR.GOLD,
            letterSpacing: 6,
          }}
          originX={0.5}
        />

        <Text
          x={0}
          y={-125}
          text="Photo Repair"
          style={{
            fontFamily: THEME.FONT.SERIF,
            fontSize: 48,
            color: THEME.TEXT_COLOR.CREAM,
            padding: { bottom: 1 },
          }}
          originX={0.5}
        />

        <Rectangle
          x={0}
          y={-75}
          width={140}
          height={2}
          fillColor={THEME.SHAPE_COLOR.GOLD}
          fillAlpha={0.55}
          originX={0.5}
          originY={0.5}
        />

        {hasSave ? (
          <>
            <Button
              x={0}
              y={30}
              width={260}
              height={44}
              onClick={() => {
                this.startMusic();
                this.scene.start(KEY.SCENE.GAME, {
                  level: query.level ?? loadProgress().level,
                });
              }}
            >
              CONTINUE
            </Button>

            <Button
              x={0}
              y={88}
              width={260}
              height={44}
              onClick={() => {
                this.startMusic();
                resetProgress();
                this.scene.start(KEY.SCENE.GAME, { level: 0 });
              }}
              variant="secondary"
            >
              RESTART
            </Button>
          </>
        ) : (
          <Button
            x={0}
            y={59}
            width={260}
            height={44}
            onClick={() => {
              this.startMusic();
              this.scene.start(KEY.SCENE.GAME, { level: query.level ?? 0 });
            }}
          >
            PLAY
          </Button>
        )}
      </Container>,
      this,
    );
  }
}
