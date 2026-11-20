import Phaser from 'phaser';
import { render } from 'phaser-jsx';

import { Shop as SupplyShop } from '../components';
import { KEY, LEVELS } from '../constants';
import { createBackgroundTexture } from '../utils';

export class Shop extends Phaser.Scene {
  private level = 0;

  constructor() {
    super(KEY.SCENE.SHOP);
  }

  init({ level = 0 }: { level?: number } = {}) {
    this.level = LEVELS[level] ? level : 0;
  }

  create() {
    const background = createBackgroundTexture(this);
    this.add.image(0, 0, background.key).setOrigin(0);

    render(
      <SupplyShop
        level={this.level}
        onNext={() => {
          this.scene.start(KEY.SCENE.GAME, { level: this.level + 1 });
        }}
      />,
      this,
    );
  }
}
