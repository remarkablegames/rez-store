import Phaser from 'phaser';
import { Rectangle, Text, useState } from 'phaser-jsx';

import { LAYOUT } from '../constants';
import type { HudController, RestoreStage } from '../types';
import { formatElapsed } from '../utils';

const FONT = {
  MONO: '"Courier New", Courier, monospace',
  SANS: 'Helvetica, Arial, sans-serif',
  SERIF: 'Georgia, "Times New Roman", serif',
} as const;

const TEXT_COLOR = {
  CREAM: '#f1e6d2',
  MUTED: '#a99b86',
  GOLD: '#c8a566',
  FAINT: '#807460',
  DARK: '#1a1510',
} as const;

const SHAPE_COLOR = {
  GOLD: 0xc8a566,
  GOLD_HOVER: 0xe1c489,
  TRACK: 0x352c22,
  KNOB: 0xf2e4c6,
  DIVIDER: 0x9a8157,
} as const;

interface StageCopy {
  step: string;
  title: string;
  instruction: string;
  metricLabel: string;
  tip: string;
  log: readonly [string, string, string];
}

const COPY: Record<RestoreStage, StageCopy> = {
  clean: {
    step: 'STEP 01 / SURFACE',
    title: 'Surface Cleaning',
    instruction:
      'Press and drag across the photograph to sweep away dust, smudges, and scratches.',
    metricLabel: 'SURFACE CLEANED',
    tip: 'Broad, overlapping strokes work best.',
    log: ['DUST & DEBRIS', 'SURFACE SMUDGES', 'PAPER ABRASIONS'],
  },
  color: {
    step: 'STEP 02 / COLOR',
    title: 'Color Recovery',
    instruction:
      'Drag the slider to wash the sepia away and bring the photograph back to life.',
    metricLabel: 'COLOR RECOVERED',
    tip: 'Slide until the skin tones feel natural.',
    log: ['SEPIA CAST', 'FADED TONES', 'EDGE VIGNETTE'],
  },
  complete: {
    step: 'RESTORATION DONE',
    title: 'Restored',
    instruction:
      'The dust is gone. The color has returned. A memory, made whole.',
    metricLabel: 'TIME TO RESTORE',
    tip: '',
    log: ['SURFACE CLEAN', 'COLOR RECOVERED', 'MEMORY ARCHIVED'],
  },
};

interface HudProps {
  onReady: (controller: HudController) => void;
  onColorChange: (progress: number) => void;
  onRestart: () => void;
}

export function Hud({ onReady, onColorChange, onRestart }: HudProps) {
  const [stage, setStage] = useState<RestoreStage>('clean');
  const [progress, setProgress] = useState(0);
  const [colorProgress, setColorProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [draggingSlider, setDraggingSlider] = useState(false);
  const [buttonHovered, setButtonHovered] = useState(false);

  onReady({ setStage, setProgress, setColorProgress, setElapsed });

  const copy = COPY[stage];
  const isClean = stage === 'clean';
  const isColor = stage === 'color';
  const isComplete = stage === 'complete';
  const displayedProgress = isColor ? colorProgress : progress;
  const metricText = isComplete
    ? formatElapsed(elapsed)
    : `${String(Math.round(displayedProgress * 100))}%`;

  const updateColorFromPointer = (pointer: Phaser.Input.Pointer): void => {
    const value = Phaser.Math.Clamp(
      (pointer.x - LAYOUT.HUD.CONTENT_X) / LAYOUT.HUD.CONTENT_WIDTH,
      0,
      1,
    );
    setColorProgress(value);
    onColorChange(value);
  };

  const finishColorDrag = (): void => {
    if (colorProgress >= 0.95) {
      setColorProgress(1);
      onColorChange(1);
    }
    setDraggingSlider(false);
  };

  return (
    <>
      <Text
        x={LAYOUT.HUD.CONTENT_X}
        y={124}
        text={copy.step}
        style={{
          fontFamily: FONT.MONO,
          fontSize: 14,
          color: TEXT_COLOR.GOLD,
          letterSpacing: 2,
        }}
      />

      <Text
        x={LAYOUT.HUD.CONTENT_X}
        y={142}
        text={copy.title}
        style={{
          fontFamily: FONT.SERIF,
          fontSize: isComplete ? 34 : 24,
          color: TEXT_COLOR.CREAM,
          padding: { bottom: 1 },
        }}
      />

      <Text
        x={LAYOUT.HUD.CONTENT_X}
        y={188}
        text={copy.instruction}
        style={{
          fontFamily: FONT.SANS,
          fontSize: 14,
          color: TEXT_COLOR.MUTED,
          lineSpacing: 5,
          wordWrap: { width: LAYOUT.HUD.CONTENT_WIDTH },
        }}
      />

      <Rectangle
        x={LAYOUT.HUD.CONTENT_X}
        y={280}
        width={LAYOUT.HUD.CONTENT_WIDTH}
        height={1}
        originX={0}
        originY={0.5}
        fillColor={SHAPE_COLOR.DIVIDER}
        fillAlpha={0.28}
      />

      <Text
        x={LAYOUT.HUD.CONTENT_X}
        y={298}
        text={metricText}
        style={{
          fontFamily: FONT.SERIF,
          fontSize: isComplete ? 42 : 46,
          color: TEXT_COLOR.CREAM,
        }}
      />

      <Text
        x={LAYOUT.HUD.CONTENT_X}
        y={360}
        text={copy.metricLabel}
        style={{
          fontFamily: FONT.MONO,
          fontSize: 12,
          color: TEXT_COLOR.GOLD,
          letterSpacing: 2,
        }}
      />

      <Rectangle
        x={LAYOUT.HUD.CONTENT_X}
        y={386}
        width={LAYOUT.HUD.CONTENT_WIDTH}
        height={6}
        originX={0}
        originY={0.5}
        fillColor={SHAPE_COLOR.TRACK}
        visible={isClean}
      />

      <Rectangle
        x={LAYOUT.HUD.CONTENT_X}
        y={386}
        width={LAYOUT.HUD.CONTENT_WIDTH}
        height={6}
        originX={0}
        originY={0.5}
        fillColor={SHAPE_COLOR.GOLD}
        scaleX={progress}
        visible={isClean}
      />

      <Rectangle
        x={LAYOUT.HUD.CONTENT_X}
        y={LAYOUT.COLOR_SLIDER.Y}
        width={LAYOUT.HUD.CONTENT_WIDTH}
        height={LAYOUT.COLOR_SLIDER.TRACK_HEIGHT}
        originX={0}
        originY={0.5}
        fillColor={SHAPE_COLOR.TRACK}
        visible={isColor}
      />

      <Rectangle
        x={LAYOUT.HUD.CONTENT_X}
        y={LAYOUT.COLOR_SLIDER.Y}
        width={LAYOUT.HUD.CONTENT_WIDTH}
        height={LAYOUT.COLOR_SLIDER.TRACK_HEIGHT}
        originX={0}
        originY={0.5}
        fillColor={SHAPE_COLOR.GOLD}
        scaleX={colorProgress}
        visible={isColor}
      />

      <Rectangle
        x={LAYOUT.HUD.CONTENT_X + LAYOUT.HUD.CONTENT_WIDTH * colorProgress}
        y={LAYOUT.COLOR_SLIDER.Y}
        width={LAYOUT.COLOR_SLIDER.KNOB_WIDTH}
        height={LAYOUT.COLOR_SLIDER.KNOB_HEIGHT}
        originX={0.5}
        originY={0.5}
        fillColor={SHAPE_COLOR.KNOB}
        visible={isColor}
      />

      <Rectangle
        x={LAYOUT.HUD.CONTENT_X + LAYOUT.HUD.CONTENT_WIDTH / 2}
        y={LAYOUT.COLOR_SLIDER.Y}
        width={LAYOUT.HUD.CONTENT_WIDTH + 24}
        height={LAYOUT.COLOR_SLIDER.HIT_HEIGHT}
        originX={0.5}
        originY={0.5}
        fillColor={0xffffff}
        fillAlpha={0.001}
        visible={isColor}
        input={{ cursor: 'ew-resize' }}
        onPointerDown={(pointer) => {
          setDraggingSlider(true);
          updateColorFromPointer(pointer);
        }}
        onPointerMove={(pointer) => {
          if (draggingSlider) {
            updateColorFromPointer(pointer);
          }
        }}
        onPointerUp={() => {
          finishColorDrag();
        }}
        onPointerUpOutside={() => {
          finishColorDrag();
        }}
      />

      <Text
        x={LAYOUT.HUD.CONTENT_X}
        y={LAYOUT.COLOR_SLIDER.Y + 20}
        text="FADED"
        style={{
          fontFamily: FONT.MONO,
          fontSize: 12,
          color: TEXT_COLOR.FAINT,
          letterSpacing: 1,
        }}
        visible={isColor}
      />

      <Text
        x={LAYOUT.HUD.CONTENT_X + LAYOUT.HUD.CONTENT_WIDTH}
        y={LAYOUT.COLOR_SLIDER.Y + 20}
        text="VIVID"
        style={{
          fontFamily: FONT.MONO,
          fontSize: 12,
          color: TEXT_COLOR.FAINT,
          letterSpacing: 1,
        }}
        originX={1}
        visible={isColor}
      />

      <Text
        x={LAYOUT.HUD.CONTENT_X}
        y={440}
        text={copy.tip}
        style={{
          fontFamily: FONT.SANS,
          fontSize: 14,
          color: TEXT_COLOR.FAINT,
          fontStyle: 'italic',
          lineSpacing: 4,
          wordWrap: { width: LAYOUT.HUD.CONTENT_WIDTH },
        }}
        visible={!isComplete}
      />

      <Rectangle
        x={LAYOUT.HUD.CONTENT_X}
        y={490}
        width={LAYOUT.HUD.CONTENT_WIDTH}
        height={1}
        originX={0}
        originY={0.5}
        fillColor={SHAPE_COLOR.DIVIDER}
        fillAlpha={0.2}
      />

      <Text
        x={LAYOUT.HUD.CONTENT_X}
        y={504}
        text="RESTORATION LOG"
        style={{
          fontFamily: FONT.MONO,
          fontSize: 12,
          color: TEXT_COLOR.GOLD,
          letterSpacing: 2,
        }}
      />

      {copy.log.map((_, index) => {
        const y = 528 + index * 22;

        return (
          <Rectangle
            x={LAYOUT.HUD.CONTENT_X + 2}
            y={y + 4}
            width={4}
            height={4}
            originX={0}
            originY={0}
            fillColor={SHAPE_COLOR.GOLD}
            fillAlpha={isComplete ? 0.8 : 0.45}
          />
        );
      })}

      {copy.log.map((line, index) => (
        <Text
          x={LAYOUT.HUD.CONTENT_X + 14}
          y={528 + index * 22}
          text={line}
          style={{
            fontFamily: FONT.MONO,
            fontSize: 12,
            color: TEXT_COLOR.MUTED,
            letterSpacing: 1,
          }}
        />
      ))}

      <Text
        x={LAYOUT.HUD.CONTENT_X + LAYOUT.HUD.CONTENT_WIDTH / 2}
        y={672}
        text="REZ STORE  /  PHOTO LAB"
        style={{
          fontFamily: FONT.MONO,
          fontSize: 12,
          color: TEXT_COLOR.FAINT,
          letterSpacing: 1.5,
        }}
        originX={0.5}
      />

      <Rectangle
        x={LAYOUT.HUD.CONTENT_X + LAYOUT.HUD.CONTENT_WIDTH / 2}
        y={622}
        width={LAYOUT.HUD.CONTENT_WIDTH}
        height={44}
        originX={0.5}
        originY={0.5}
        fillColor={buttonHovered ? SHAPE_COLOR.GOLD_HOVER : SHAPE_COLOR.GOLD}
        visible={isComplete}
        input={{ useHandCursor: true }}
        onPointerOver={() => {
          setButtonHovered(true);
        }}
        onPointerOut={() => {
          setButtonHovered(false);
        }}
        onPointerUp={onRestart}
      />

      <Text
        x={LAYOUT.HUD.CONTENT_X + LAYOUT.HUD.CONTENT_WIDTH / 2}
        y={622}
        text="RESTORE ANOTHER"
        style={{
          fontFamily: FONT.MONO,
          fontSize: 12,
          color: TEXT_COLOR.DARK,
          letterSpacing: 1.5,
        }}
        originX={0.5}
        originY={0.5}
        visible={isComplete}
      />
    </>
  );
}
