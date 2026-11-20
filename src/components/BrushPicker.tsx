import { Rectangle, Text } from 'phaser-jsx';

import { LAYOUT, THEME } from '../constants';
import { useUiSound } from '../hooks';
import type { Brush, BrushId } from '../types';

const GAP = 6;

interface BrushPickerProps {
  brushes: Brush[];
  selected: BrushId;
  onSelect: (brush: Brush) => void;
}

export function BrushPicker({ brushes, selected, onSelect }: BrushPickerProps) {
  const width =
    (LAYOUT.HUD.CONTENT_WIDTH - GAP * (brushes.length - 1)) / brushes.length;

  return (
    <>
      {brushes.map((brush, index) => (
        <BrushOption
          brush={brush}
          x={LAYOUT.HUD.CONTENT_X + index * (width + GAP)}
          width={width}
          active={brush.id === selected}
          onSelect={onSelect}
        />
      ))}
    </>
  );
}

interface BrushOptionProps {
  brush: Brush;
  x: number;
  width: number;
  active: boolean;
  onSelect: (brush: Brush) => void;
}

function BrushOption({ brush, x, width, active, onSelect }: BrushOptionProps) {
  const uiSound = useUiSound();

  return (
    <>
      <Rectangle
        x={x}
        y={316}
        width={width}
        height={30}
        originX={0}
        originY={0}
        fillColor={
          active ? THEME.SHAPE_COLOR.GOLD : THEME.SHAPE_COLOR.BUTTON_DARK
        }
        input={{ useHandCursor: true }}
        onPointerUp={() => {
          onSelect(brush);
          uiSound.play('select');
        }}
      />

      <Text
        x={x + width / 2}
        y={331}
        text={brush.shortName}
        originX={0.5}
        originY={0.5}
        style={{
          fontFamily: THEME.FONT.MONO,
          fontSize: 12,
          color: active ? THEME.TEXT_COLOR.DARK : THEME.TEXT_COLOR.MUTED,
          letterSpacing: 0.5,
        }}
      />
    </>
  );
}
