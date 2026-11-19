import { Fragment, Rectangle, Text } from 'phaser-jsx';

import { LAYOUT } from '../constants';

const FONT = {
  MONO: '"Courier New", Courier, monospace',
  SERIF: 'Georgia, "Times New Roman", serif',
} as const;

const TEXT_COLOR = {
  GOLD: '#c8a566',
  CREAM: '#f1e6d2',
  MUTED: '#897b66',
} as const;

interface ChromeProps {
  level: number;
  title: string;
}

export function Chrome({ level, title }: ChromeProps) {
  const left = LAYOUT.PHOTO.X - LAYOUT.PHOTO.WIDTH / 2;
  const memoryLabel = [
    `MEMORY NO. ${String(level + 1).padStart(3, '0')}`,
    title.toUpperCase(),
  ].join('  /  ');

  return (
    <Fragment>
      <Text
        x={left}
        y={28}
        text="REZ STORE"
        style={{
          fontFamily: FONT.MONO,
          fontSize: 14,
          color: TEXT_COLOR.GOLD,
          letterSpacing: 4,
        }}
      />

      <Text
        x={left}
        y={44}
        text="Photo Repair"
        style={{
          fontFamily: FONT.SERIF,
          fontSize: 32,
          color: TEXT_COLOR.CREAM,
          padding: { bottom: 1 },
        }}
      />

      <Rectangle
        x={left}
        y={90}
        width={48}
        height={2}
        fillColor={0xc8a566}
        fillAlpha={0.55}
        originX={0}
        originY={0.5}
      />

      <Text
        x={LAYOUT.PHOTO.X}
        y={LAYOUT.PHOTO.Y + LAYOUT.PHOTO.HEIGHT / 2 + LAYOUT.PHOTO.BORDER + 20}
        text={memoryLabel}
        style={{
          fontFamily: FONT.MONO,
          fontSize: 14,
          color: TEXT_COLOR.MUTED,
          letterSpacing: 1.5,
        }}
        originX={0.5}
        originY={0}
      />
    </Fragment>
  );
}
