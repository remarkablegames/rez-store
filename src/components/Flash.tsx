import Phaser from 'phaser';
import { Rectangle, useEffect, useRef, useScene } from 'phaser-jsx';

import { LAYOUT } from '../constants';

export function Flash() {
  const ref = useRef<Phaser.GameObjects.Rectangle>();
  const scene = useScene();

  useEffect(() => {
    scene.tweens.add({
      targets: ref.current,
      alpha: 0,
      duration: 650,
      ease: 'Quad.easeOut',
      onComplete: () => {
        ref.current?.destroy();
      },
    });
  }, []);

  return (
    <Rectangle
      x={LAYOUT.PHOTO.X}
      y={LAYOUT.PHOTO.Y}
      width={LAYOUT.PHOTO.WIDTH}
      height={LAYOUT.PHOTO.HEIGHT}
      fillColor={0xffe6b0}
      fillAlpha={0.16}
      originX={0.5}
      originY={0.5}
      ref={ref}
    />
  );
}
