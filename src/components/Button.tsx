import { Rectangle, Text, useState } from 'phaser-jsx';

import { THEME } from '../constants';
import { useUiSound } from '../hooks';

interface ButtonProps {
  x: number;
  y: number;
  width: number;
  height: number;
  children: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export function Button({
  x,
  y,
  width,
  height,
  children,
  onClick,
  variant = 'primary',
  disabled = false,
}: ButtonProps) {
  const [hovered, setHovered] = useState(false);
  const uiSound = useUiSound();
  const isSecondary = variant === 'secondary';
  const fillColor = disabled
    ? THEME.SHAPE_COLOR.BUTTON_DARK
    : isSecondary
      ? hovered
        ? THEME.SHAPE_COLOR.BUTTON_DARK_HOVER
        : THEME.SHAPE_COLOR.BUTTON_DARK
      : hovered
        ? THEME.SHAPE_COLOR.GOLD_HOVER
        : THEME.SHAPE_COLOR.GOLD;
  const textColor = disabled
    ? THEME.TEXT_COLOR.FAINT
    : isSecondary
      ? THEME.TEXT_COLOR.CREAM
      : THEME.TEXT_COLOR.DARK;

  return (
    <>
      <Rectangle
        x={x}
        y={y}
        width={width}
        height={height}
        originX={0.5}
        originY={0.5}
        fillColor={fillColor}
        input={{
          useHandCursor: !disabled,
          cursor: disabled ? 'not-allowed' : undefined,
        }}
        onPointerOver={() => {
          if (!disabled) {
            setHovered(true);
            uiSound.play('hover');
          }
        }}
        onPointerOut={() => {
          setHovered(false);
        }}
        onPointerUp={() => {
          if (!disabled) {
            onClick();
            uiSound.play('click');
          }
        }}
      />

      <Text
        x={x}
        y={y}
        text={children}
        style={{
          fontFamily: THEME.FONT.MONO,
          fontSize: 12,
          color: textColor,
          letterSpacing: 0.5,
        }}
        originX={0.5}
        originY={0.5}
      />
    </>
  );
}
