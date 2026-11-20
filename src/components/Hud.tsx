import Phaser from 'phaser';
import { Rectangle, Text, useState } from 'phaser-jsx';

import { BRUSHES, LAYOUT, THEME } from '../constants';
import type {
  Brush,
  BrushId,
  HudController,
  JobReport,
  Level,
  RestoreStage,
} from '../types';
import { BrushPicker } from './BrushPicker';
import { Button } from './Button';
import { GradeReport } from './GradeReport';

interface StageCopy {
  step: string;
  title: string;
  instruction: string;
  tip: string;
}

const COPY: Record<'clean' | 'color', StageCopy> = {
  clean: {
    step: 'SURFACE',
    title: 'Surface Cleaning',
    instruction: 'Clean until the photo looks clear to you.',
    tip: 'Trust your eye.',
  },
  color: {
    step: 'COLOR',
    title: 'Color Balance',
    instruction: 'Balance the tint until the skin tones feel natural.',
    tip: 'Skin tones are the giveaway.',
  },
};

const BRUSH_TIPS: Record<BrushId, string> = {
  standard: 'Trust your eye.',
  wide: 'Sweep broadly, then finish the edges.',
  detail: 'Firm strokes for corners and edges.',
};

interface HudProps {
  level: Level;
  levelIndex: number;
  wallet: number;
  bestPayout: number;
  brushes: Brush[];
  equippedBrush: BrushId;
  onReady: (controller: HudController) => void;
  onColorChange: (value: number) => void;
  onContinue: () => void;
  onDeliver: () => void;
  onNext: () => void;
  onShop: () => void;
  onBrushChange: (brush: Brush) => void;
}

export function Hud({
  level,
  levelIndex,
  wallet,
  bestPayout,
  brushes,
  equippedBrush,
  onReady,
  onColorChange,
  onContinue,
  onDeliver,
  onNext,
  onShop,
  onBrushChange,
}: HudProps) {
  const [stage, setStage] = useState<RestoreStage>('clean');
  const [report, setReport] = useState<JobReport | null>(null);
  const [colorValue, setColorValue] = useState(0);
  const [draggingSlider, setDraggingSlider] = useState(false);
  const [selectedBrush, setSelectedBrush] = useState<BrushId>(equippedBrush);

  onReady({ setStage, setReport });

  const isClean = stage === 'clean';
  const isColor = stage === 'color';
  const isComplete = stage === 'complete';
  const copy = COPY[isClean ? 'clean' : 'color'];
  const jobNumber = String(levelIndex + 1).padStart(2, '0');
  const step = `JOB ${jobNumber} / ${copy.step}`;
  const activeBrush =
    brushes.find((brush) => brush.id === selectedBrush) ?? BRUSHES.standard;
  const tip = isClean ? BRUSH_TIPS[activeBrush.id] : copy.tip;

  const selectBrush = (brush: Brush): void => {
    setSelectedBrush(brush.id);
    onBrushChange(brush);
  };

  const updateColorFromPointer = (pointer: Phaser.Input.Pointer): void => {
    const value = Phaser.Math.Clamp(
      (pointer.x - LAYOUT.HUD.CONTENT_X) / LAYOUT.HUD.CONTENT_WIDTH,
      0,
      1,
    );

    setColorValue(value);
    onColorChange(value);
  };

  const finishColorDrag = (): void => {
    setDraggingSlider(false);
  };

  return (
    <>
      <Text
        x={LAYOUT.HUD.CONTENT_X}
        y={124}
        text={step}
        style={{
          fontFamily: THEME.FONT.MONO,
          fontSize: 14,
          color: THEME.TEXT_COLOR.GOLD,
          letterSpacing: 2,
        }}
        visible={!isComplete}
      />

      <Text
        x={LAYOUT.HUD.CONTENT_X}
        y={142}
        text={copy.title}
        style={{
          fontFamily: THEME.FONT.SERIF,
          fontSize: 24,
          color: THEME.TEXT_COLOR.CREAM,
          padding: { bottom: 1 },
        }}
        visible={!isComplete}
      />

      <Text
        x={LAYOUT.HUD.CONTENT_X}
        y={188}
        text={copy.instruction}
        style={{
          fontFamily: THEME.FONT.SANS,
          fontSize: 14,
          color: THEME.TEXT_COLOR.MUTED,
          lineSpacing: 5,
          wordWrap: { width: LAYOUT.HUD.CONTENT_WIDTH },
        }}
        visible={!isComplete}
      />

      <Rectangle
        x={LAYOUT.HUD.CONTENT_X}
        y={280}
        width={LAYOUT.HUD.CONTENT_WIDTH}
        height={1}
        originX={0}
        originY={0.5}
        fillColor={THEME.SHAPE_COLOR.DIVIDER}
        fillAlpha={0.28}
        visible={!isComplete}
      />

      <Text
        x={LAYOUT.HUD.CONTENT_X}
        y={298}
        text="YOUR TOOL"
        style={{
          fontFamily: THEME.FONT.MONO,
          fontSize: 12,
          color: THEME.TEXT_COLOR.GOLD,
          letterSpacing: 1.5,
        }}
        visible={isClean}
      />

      {isClean && brushes.length === 1 && (
        <>
          <Rectangle
            x={LAYOUT.HUD.CONTENT_X}
            y={320}
            width={28}
            height={28}
            originX={0}
            originY={0}
            fillColor={THEME.SHAPE_COLOR.BUTTON_DARK}
          />

          <Rectangle
            x={LAYOUT.HUD.CONTENT_X + 7}
            y={327}
            width={14}
            height={14}
            originX={0}
            originY={0}
            fillColor={THEME.SHAPE_COLOR.GOLD}
            fillAlpha={0.35}
          />

          <Text
            x={LAYOUT.HUD.CONTENT_X + 40}
            y={320}
            text={activeBrush.name.toUpperCase()}
            style={{
              fontFamily: THEME.FONT.MONO,
              fontSize: 12,
              color: THEME.TEXT_COLOR.CREAM,
              letterSpacing: 0.5,
            }}
          />
        </>
      )}

      {isClean && brushes.length > 1 && (
        <>
          <BrushPicker
            brushes={brushes}
            selected={selectedBrush}
            onSelect={selectBrush}
          />

          <Text
            x={LAYOUT.HUD.CONTENT_X}
            y={356}
            text={`${activeBrush.name.toUpperCase()} · R${String(activeBrush.radius)}`}
            style={{
              fontFamily: THEME.FONT.MONO,
              fontSize: 12,
              color: THEME.TEXT_COLOR.CREAM,
              letterSpacing: 0.5,
            }}
          />
        </>
      )}

      <Text
        x={LAYOUT.HUD.CONTENT_X}
        y={298}
        text="DEVELOPMENT"
        style={{
          fontFamily: THEME.FONT.MONO,
          fontSize: 12,
          color: THEME.TEXT_COLOR.GOLD,
          letterSpacing: 1.5,
        }}
        visible={isColor}
      />

      <Rectangle
        x={LAYOUT.HUD.CONTENT_X}
        y={LAYOUT.COLOR_SLIDER.Y}
        width={LAYOUT.HUD.CONTENT_WIDTH}
        height={LAYOUT.COLOR_SLIDER.TRACK_HEIGHT}
        originX={0}
        originY={0.5}
        fillColor={THEME.SHAPE_COLOR.TRACK}
        visible={isColor}
      />

      <Rectangle
        x={LAYOUT.HUD.CONTENT_X}
        y={LAYOUT.COLOR_SLIDER.Y}
        width={LAYOUT.HUD.CONTENT_WIDTH}
        height={LAYOUT.COLOR_SLIDER.TRACK_HEIGHT}
        originX={0}
        originY={0.5}
        fillColor={THEME.SHAPE_COLOR.GOLD}
        scaleX={colorValue}
        visible={isColor}
      />

      <Rectangle
        x={LAYOUT.HUD.CONTENT_X + LAYOUT.HUD.CONTENT_WIDTH * colorValue}
        y={LAYOUT.COLOR_SLIDER.Y}
        width={LAYOUT.COLOR_SLIDER.KNOB_WIDTH}
        height={LAYOUT.COLOR_SLIDER.KNOB_HEIGHT}
        originX={0.5}
        originY={0.5}
        fillColor={THEME.SHAPE_COLOR.KNOB}
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
        text="TOO WARM"
        style={{
          fontFamily: THEME.FONT.MONO,
          fontSize: 12,
          color: THEME.TEXT_COLOR.FAINT,
          letterSpacing: 1,
        }}
        visible={isColor}
      />

      <Text
        x={LAYOUT.HUD.CONTENT_X + LAYOUT.HUD.CONTENT_WIDTH}
        y={LAYOUT.COLOR_SLIDER.Y + 20}
        text="TOO COOL"
        style={{
          fontFamily: THEME.FONT.MONO,
          fontSize: 12,
          color: THEME.TEXT_COLOR.FAINT,
          letterSpacing: 1,
        }}
        originX={1}
        visible={isColor}
      />

      <Text
        x={LAYOUT.HUD.CONTENT_X}
        y={isClean ? 386 : 404}
        text={tip}
        style={{
          fontFamily: THEME.FONT.SANS,
          fontSize: 13,
          color: THEME.TEXT_COLOR.FAINT,
          fontStyle: 'italic',
          lineSpacing: 3,
          wordWrap: { width: LAYOUT.HUD.CONTENT_WIDTH },
        }}
        visible={!isComplete}
      />

      <Rectangle
        x={LAYOUT.HUD.CONTENT_X}
        y={440}
        width={LAYOUT.HUD.CONTENT_WIDTH}
        height={1}
        originX={0}
        originY={0.5}
        fillColor={THEME.SHAPE_COLOR.DIVIDER}
        fillAlpha={0.2}
        visible={!isComplete}
      />

      <Text
        x={LAYOUT.HUD.CONTENT_X}
        y={452}
        text="JOB FEE"
        style={{
          fontFamily: THEME.FONT.MONO,
          fontSize: 12,
          color: THEME.TEXT_COLOR.GOLD,
          letterSpacing: 1.5,
        }}
        visible={!isComplete}
      />

      <Text
        x={LAYOUT.HUD.CONTENT_X}
        y={468}
        text={`$${String(level.fee)}`}
        style={{
          fontFamily: THEME.FONT.SERIF,
          fontSize: 30,
          color: THEME.TEXT_COLOR.CREAM,
        }}
        visible={!isComplete}
      />

      <Text
        x={LAYOUT.HUD.CONTENT_X}
        y={534}
        text="EARNINGS"
        style={{
          fontFamily: THEME.FONT.MONO,
          fontSize: 12,
          color: THEME.TEXT_COLOR.GOLD,
          letterSpacing: 1.5,
        }}
        visible={!isComplete}
      />

      <Text
        x={LAYOUT.HUD.CONTENT_X}
        y={550}
        text={`$${String(wallet)}`}
        style={{
          fontFamily: THEME.FONT.SERIF,
          fontSize: 22,
          color: THEME.TEXT_COLOR.CREAM,
        }}
        visible={!isComplete}
      />

      <Text
        x={LAYOUT.HUD.CONTENT_X}
        y={580}
        text={bestPayout > 0 ? `BEST $${String(bestPayout)}` : 'FIRST DELIVERY'}
        style={{
          fontFamily: THEME.FONT.MONO,
          fontSize: 12,
          color: THEME.TEXT_COLOR.FAINT,
          letterSpacing: 0.5,
        }}
        visible={!isComplete}
      />

      {!isComplete && (
        <Button
          x={LAYOUT.HUD.CONTENT_X + LAYOUT.HUD.CONTENT_WIDTH / 2}
          y={638}
          width={LAYOUT.HUD.CONTENT_WIDTH}
          height={44}
          onClick={isClean ? onContinue : onDeliver}
        >
          {isClean ? 'CONTINUE TO COLOR' : 'DELIVER PHOTO'}
        </Button>
      )}

      {isComplete && report && (
        <GradeReport report={report} onNext={onNext} onShop={onShop} />
      )}
    </>
  );
}
