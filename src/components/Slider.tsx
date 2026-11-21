import Phaser from 'phaser';
import { Rectangle, Text } from 'phaser-jsx';

import { LAYOUT, THEME } from '../constants';
import { useUiSound } from '../hooks';

interface SliderProps {
  y: number;
  label: string;
  lowLabel: string;
  highLabel: string;
  value: number;
  onChange: (value: number) => void;
}

export function Slider({
  y,
  label,
  lowLabel,
  highLabel,
  value,
  onChange,
}: SliderProps) {
  const uiSound = useUiSound();

  const updateFromPointer = (pointer: Phaser.Input.Pointer): void => {
    const next = Phaser.Math.Clamp(
      (pointer.x - LAYOUT.HUD.CONTENT_X) / LAYOUT.HUD.CONTENT_WIDTH,
      0,
      1,
    );

    onChange(next);
  };

  return (
    <>
      <Text
        x={LAYOUT.HUD.CONTENT_X}
        y={y - 28}
        text={label}
        style={{
          fontFamily: THEME.FONT.MONO,
          fontSize: 12,
          color: THEME.TEXT_COLOR.GOLD,
          letterSpacing: 1.5,
        }}
      />

      <Rectangle
        x={LAYOUT.HUD.CONTENT_X}
        y={y}
        width={LAYOUT.HUD.CONTENT_WIDTH}
        height={LAYOUT.COLOR_SLIDER.TRACK_HEIGHT}
        originX={0}
        originY={0.5}
        fillColor={THEME.SHAPE_COLOR.TRACK}
      />

      <Rectangle
        x={LAYOUT.HUD.CONTENT_X}
        y={y}
        width={LAYOUT.HUD.CONTENT_WIDTH}
        height={LAYOUT.COLOR_SLIDER.TRACK_HEIGHT}
        originX={0}
        originY={0.5}
        fillColor={THEME.SHAPE_COLOR.GOLD}
        scaleX={value}
      />

      <Rectangle
        x={LAYOUT.HUD.CONTENT_X + LAYOUT.HUD.CONTENT_WIDTH * value}
        y={y}
        width={LAYOUT.COLOR_SLIDER.KNOB_WIDTH}
        height={LAYOUT.COLOR_SLIDER.KNOB_HEIGHT}
        originX={0.5}
        originY={0.5}
        fillColor={THEME.SHAPE_COLOR.KNOB}
      />

      <Rectangle
        x={LAYOUT.HUD.CONTENT_X + LAYOUT.HUD.CONTENT_WIDTH / 2}
        y={y}
        width={LAYOUT.HUD.CONTENT_WIDTH + 24}
        height={LAYOUT.COLOR_SLIDER.HIT_HEIGHT}
        originX={0.5}
        originY={0.5}
        fillColor={0xffffff}
        fillAlpha={0.001}
        input={{ draggable: true, cursor: 'ew-resize' }}
        onPointerDown={(pointer) => {
          updateFromPointer(pointer);
          uiSound.play('drop');
        }}
        onDrag={(pointer) => {
          updateFromPointer(pointer);
        }}
      />

      <Text
        x={LAYOUT.HUD.CONTENT_X}
        y={y + 16}
        text={lowLabel}
        style={{
          fontFamily: THEME.FONT.MONO,
          fontSize: 12,
          color: THEME.TEXT_COLOR.FAINT,
          letterSpacing: 1,
        }}
      />

      <Text
        x={LAYOUT.HUD.CONTENT_X + LAYOUT.HUD.CONTENT_WIDTH}
        y={y + 16}
        text={highLabel}
        style={{
          fontFamily: THEME.FONT.MONO,
          fontSize: 12,
          color: THEME.TEXT_COLOR.FAINT,
          letterSpacing: 1,
        }}
        originX={1}
        originY={0}
      />
    </>
  );
}
