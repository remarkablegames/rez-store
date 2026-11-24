import { Fragment, Rectangle, Text } from 'phaser-jsx';

import { LAYOUT, THEME } from '../constants';

interface ChromeProps {
  level: number;
  title: string;
}

export function Chrome({ level, title }: ChromeProps) {
  const left = LAYOUT.PHOTO.X - LAYOUT.PHOTO.WIDTH / 2;
  const jobLabel = [
    `JOB NO. ${String(level + 1).padStart(2, '0')}`,
    title.toUpperCase(),
  ].join('  /  ');

  return (
    <Fragment>
      <Text
        x={left}
        y={28}
        text="REZ STORE"
        style={{
          fontFamily: THEME.FONT.MONO,
          fontSize: 14,
          color: THEME.TEXT_COLOR.GOLD,
          letterSpacing: 4,
        }}
      />

      <Text
        x={left}
        y={44}
        text="Photo Repair Shop"
        style={{
          fontFamily: THEME.FONT.SERIF,
          fontSize: 32,
          color: THEME.TEXT_COLOR.CREAM,
          padding: { bottom: 1 },
        }}
      />

      <Rectangle
        x={left}
        y={90}
        width={48}
        height={2}
        fillColor={THEME.SHAPE_COLOR.GOLD}
        fillAlpha={0.55}
        originX={0}
        originY={0.5}
      />

      <Text
        x={LAYOUT.PHOTO.X}
        y={LAYOUT.PHOTO.Y + LAYOUT.PHOTO.HEIGHT / 2 + LAYOUT.PHOTO.BORDER + 20}
        text={jobLabel}
        style={{
          fontFamily: THEME.FONT.MONO,
          fontSize: 14,
          color: THEME.TEXT_COLOR.MUTED,
          letterSpacing: 1.5,
        }}
        originX={0.5}
        originY={0}
      />
    </Fragment>
  );
}
