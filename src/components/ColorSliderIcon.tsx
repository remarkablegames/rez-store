import Phaser from 'phaser';
import { Container, Rectangle } from 'phaser-jsx';

import { LAYOUT, THEME } from '../constants';
import type { ColorAxis } from '../types';

const TRACK_WIDTH = 96;
const TRACK_HEIGHT = LAYOUT.COLOR_SLIDER.TRACK_HEIGHT;
const KNOB_WIDTH = LAYOUT.COLOR_SLIDER.KNOB_WIDTH;
const KNOB_HEIGHT = LAYOUT.COLOR_SLIDER.KNOB_HEIGHT;
const SEGMENTS = 16;

const AXIS_GRADIENTS: Record<ColorAxis, readonly number[]> = {
  temperature: createGradient(THEME.SHAPE_COLOR.HEATMAP_DIRT, 0x6f8fb8),
  tint: createGradient(
    THEME.SHAPE_COLOR.TINT_MAGENTA,
    THEME.SHAPE_COLOR.TINT_GREEN,
  ),
};

interface ColorSliderIconProps {
  x: number;
  y: number;
  axis: ColorAxis;
}

export function ColorSliderIcon({ x, y, axis }: ColorSliderIconProps) {
  const colors = AXIS_GRADIENTS[axis];
  const segmentWidth = TRACK_WIDTH / SEGMENTS;

  return (
    <Container x={x} y={y}>
      {colors.map((color, index) => (
        <Rectangle
          key={index}
          x={-TRACK_WIDTH / 2 + index * segmentWidth}
          y={-TRACK_HEIGHT / 2}
          width={segmentWidth}
          height={TRACK_HEIGHT}
          originX={0}
          originY={0}
          fillColor={color}
          fillAlpha={0.9}
        />
      ))}

      <Rectangle
        x={0}
        y={0}
        width={KNOB_WIDTH}
        height={KNOB_HEIGHT}
        originX={0.5}
        originY={0.5}
        fillColor={THEME.SHAPE_COLOR.KNOB}
      />
    </Container>
  );
}

function createGradient(from: number, to: number): number[] {
  const fromColor = Phaser.Display.Color.ValueToColor(from);
  const toColor = Phaser.Display.Color.ValueToColor(to);

  return Array.from({ length: SEGMENTS }, (_, index) => {
    const color = Phaser.Display.Color.Interpolate.ColorWithColor(
      fromColor,
      toColor,
      SEGMENTS - 1,
      index,
    );

    return Phaser.Display.Color.GetColor(color.r, color.g, color.b);
  });
}
