import { Rectangle, Text, useState } from 'phaser-jsx';

import { THEME } from '../constants';

interface ButtonProps {
  x: number;
  y: number;
  width: number;
  height: number;
  children: string;
  onClick: () => void;
}

export function Button({
  x,
  y,
  width,
  height,
  children,
  onClick,
}: ButtonProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <>
      <Rectangle
        x={x}
        y={y}
        width={width}
        height={height}
        originX={0.5}
        originY={0.5}
        fillColor={
          hovered ? THEME.SHAPE_COLOR.GOLD_HOVER : THEME.SHAPE_COLOR.GOLD
        }
        input={{ useHandCursor: true }}
        onPointerOver={() => {
          setHovered(true);
        }}
        onPointerOut={() => {
          setHovered(false);
        }}
        onPointerUp={onClick}
      />

      <Text
        x={x}
        y={y}
        text={children}
        style={{
          fontFamily: THEME.FONT.MONO,
          fontSize: 12,
          color: THEME.TEXT_COLOR.DARK,
          letterSpacing: 0.5,
        }}
        originX={0.5}
        originY={0.5}
      />
    </>
  );
}
