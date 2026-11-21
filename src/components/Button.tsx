import { Rectangle, Text, useState } from 'phaser-jsx';

import { THEME } from '../constants';
import { useUiSound } from '../hooks';

type ButtonVariant = 'primary' | 'secondary';

interface ButtonProps {
  x: number;
  y: number;
  width: number;
  height: number;
  children: string;
  onClick: () => void;
  variant?: ButtonVariant;
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

  return (
    <>
      <Rectangle
        x={x}
        y={y}
        width={width}
        height={height}
        originX={0.5}
        originY={0.5}
        fillColor={getFillColor(variant, hovered, disabled)}
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
          color: getTextColor(variant, disabled),
          letterSpacing: 0.5,
        }}
        originX={0.5}
        originY={0.5}
      />
    </>
  );
}

function getFillColor(
  variant: ButtonVariant,
  hovered: boolean,
  disabled: boolean,
): number {
  if (disabled) {
    return THEME.SHAPE_COLOR.BUTTON_DARK;
  }

  if (variant === 'secondary') {
    return hovered
      ? THEME.SHAPE_COLOR.BUTTON_DARK_HOVER
      : THEME.SHAPE_COLOR.BUTTON_DARK;
  }

  return hovered ? THEME.SHAPE_COLOR.GOLD_HOVER : THEME.SHAPE_COLOR.GOLD;
}

function getTextColor(variant: ButtonVariant, disabled: boolean): string {
  if (disabled) {
    return THEME.TEXT_COLOR.FAINT;
  }

  return variant === 'secondary'
    ? THEME.TEXT_COLOR.CREAM
    : THEME.TEXT_COLOR.DARK;
}
