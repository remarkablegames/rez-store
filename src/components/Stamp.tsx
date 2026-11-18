import Phaser from 'phaser';
import { Text, useEffect, useRef, useScene } from 'phaser-jsx';

import { LAYOUT } from '../constants';

const FONT = {
  SERIF: 'Georgia, "Times New Roman", serif',
} as const;

export function Stamp() {
  const ref = useRef<Phaser.GameObjects.Text>();
  const scene = useScene();

  useEffect(() => {
    scene.tweens.add({
      targets: ref.current,
      alpha: 0.85,
      scale: 1,
      duration: 450,
      ease: 'Back.easeOut',
    });
  }, []);

  return (
    <Text
      x={LAYOUT.PHOTO.X + LAYOUT.PHOTO.WIDTH / 2 - 26}
      y={LAYOUT.PHOTO.Y + LAYOUT.PHOTO.HEIGHT / 2 - 24}
      text="RESTORED"
      style={{
        fontFamily: FONT.SERIF,
        fontSize: 24,
        color: '#a8402f',
        stroke: '#a8402f',
        strokeThickness: 1,
        letterSpacing: 3,
      }}
      originX={1}
      originY={1}
      angle={-7}
      alpha={0}
      scale={1.5}
      ref={ref}
    />
  );
}
