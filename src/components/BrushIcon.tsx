import { Container, Rectangle } from 'phaser-jsx';

import { THEME } from '../constants';
import type { Brush } from '../types';

const HANDLE_WIDTH = 10;
const HANDLE_HEIGHT = 34;
const FERRULE_HEIGHT = 6;
const BRISTLE_HEIGHT = 16;
const FERRULE_MIN_WIDTH = 16;

interface BrushIconProps {
  x: number;
  y: number;
  brush: Brush;
  scale?: number;
}

export function BrushIcon({ x, y, brush, scale = 1 }: BrushIconProps) {
  const bristleWidth = brush.bristleWidth * scale;
  const handleWidth = HANDLE_WIDTH * scale;
  const handleHeight = HANDLE_HEIGHT * scale;
  const ferruleHeight = FERRULE_HEIGHT * scale;
  const bristleHeight = BRISTLE_HEIGHT * scale;
  const ferruleWidth = Math.max(bristleWidth, FERRULE_MIN_WIDTH * scale);
  const top = -(handleHeight + ferruleHeight + bristleHeight) / 2;

  return (
    <Container x={x} y={y}>
      <Rectangle
        x={0}
        y={top}
        width={handleWidth}
        height={handleHeight}
        originX={0.5}
        originY={0}
        fillColor={THEME.SHAPE_COLOR.GOLD}
        fillAlpha={0.5}
      />

      <Rectangle
        x={0}
        y={top + handleHeight}
        width={ferruleWidth}
        height={ferruleHeight}
        originX={0.5}
        originY={0}
        fillColor={THEME.SHAPE_COLOR.GOLD}
      />

      <Rectangle
        x={0}
        y={top + handleHeight + ferruleHeight}
        width={bristleWidth}
        height={bristleHeight}
        originX={0.5}
        originY={0}
        fillColor={THEME.SHAPE_COLOR.CREAM}
        fillAlpha={0.72}
      />
    </Container>
  );
}
