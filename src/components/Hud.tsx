import { Rectangle, Text, useState } from 'phaser-jsx';

import { BRUSHES, LAYOUT, THEME } from '../constants';
import { useUiSound } from '../hooks';
import type {
  Brush,
  BrushId,
  ColorValue,
  HudController,
  JobReport,
  Level,
  RestoreStage,
} from '../types';
import { BrushPicker } from './BrushPicker';
import { Button } from './Button';
import { GradeReport } from './GradeReport';
import { Slider } from './Slider';

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
    instruction: 'Lift the dust and remove the grime.',
    tip: 'Trust your eye.',
  },
  color: {
    step: 'COLOR',
    title: 'Color Balance',
    instruction:
      'Balance the temperature and tint until the skin tones feel natural.',
    tip: 'Skin tones are the giveaway.',
  },
};

const BRUSH_TIPS: Record<BrushId, string> = {
  standard: 'Steady pressure. Set-in grime needs another pass.',
  wide: 'Sweep the loose dust, then switch to a firmer tip.',
  detail: 'Firm strokes lift set-in grime. Do not linger on clean areas.',
};

interface HudProps {
  level: Level;
  levelIndex: number;
  earnings: number;
  bestPayout: number;
  brushes: Brush[];
  equippedBrush: BrushId;
  onReady: (controller: HudController) => void;
  onColorChange: (value: ColorValue) => void;
  onContinue: () => void;
  onDeliver: () => void;
  onNext: () => void;
  onShop: () => void;
  onBrushChange: (brush: Brush) => void;
  onInspectChange: (inspecting: boolean) => void;
}

export function Hud({
  level,
  levelIndex,
  earnings,
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
  onInspectChange,
}: HudProps) {
  const [stage, setStage] = useState<RestoreStage>('clean');
  const [report, setReport] = useState<JobReport | null>(null);
  const [colorValue, setColorValue] = useState<ColorValue>({
    temperature: 0,
    tint: 0,
  });
  const [selectedBrush, setSelectedBrush] = useState<BrushId>(equippedBrush);
  const [inspecting, setInspecting] = useState(false);
  const uiSound = useUiSound();

  onReady({ setStage, setReport });

  const isClean = stage === 'clean';
  const isColor = stage === 'color';
  const isComplete = stage === 'complete';
  const copy = COPY[isClean ? 'clean' : 'color'];
  const jobNumber = String(levelIndex + 1).padStart(2, '0');
  const step = `JOB ${jobNumber} / ${copy.step}`;
  const activeBrush =
    brushes.find((brush) => brush.id === selectedBrush) ?? BRUSHES.standard;
  const tip = isClean
    ? inspecting
      ? 'Blue cells are missed grime. Red marks are abrasion.'
      : BRUSH_TIPS[activeBrush.id]
    : copy.tip;

  const selectBrush = (brush: Brush): void => {
    setSelectedBrush(brush.id);
    onBrushChange(brush);
  };

  const updateTemperature = (temperature: number): void => {
    const next = { ...colorValue, temperature };

    setColorValue(next);
    onColorChange(next);
  };

  const updateTint = (tint: number): void => {
    const next = { ...colorValue, tint };

    setColorValue(next);
    onColorChange(next);
  };

  const toggleInspection = (): void => {
    const next = !inspecting;

    setInspecting(next);
    onInspectChange(next);
    uiSound.play('select');
  };

  const continueToColor = (): void => {
    if (inspecting) {
      setInspecting(false);
      onInspectChange(false);
    }

    onContinue();
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

      {isClean && (
        <Button
          x={LAYOUT.HUD.CONTENT_X + LAYOUT.HUD.CONTENT_WIDTH - 45}
          y={292}
          width={90}
          height={24}
          onClick={toggleInspection}
          variant="secondary"
        >
          {inspecting ? 'HIDE MAP' : 'INSPECT'}
        </Button>
      )}

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
            text={`${activeBrush.name.toUpperCase()} · R${String(
              activeBrush.radius,
            )} · STR ${String(Math.round(activeBrush.strength * 100))}`}
            style={{
              fontFamily: THEME.FONT.MONO,
              fontSize: 12,
              color: THEME.TEXT_COLOR.CREAM,
              letterSpacing: 0.5,
            }}
          />
        </>
      )}

      {isColor && (
        <>
          <Slider
            y={LAYOUT.COLOR_SLIDER.TEMPERATURE_Y}
            label="TEMPERATURE"
            lowLabel="WARM"
            highLabel="COOL"
            value={colorValue.temperature}
            onChange={updateTemperature}
          />

          <Slider
            y={LAYOUT.COLOR_SLIDER.TINT_Y}
            label="TINT"
            lowLabel="MAGENTA"
            highLabel="GREEN"
            value={colorValue.tint}
            onChange={updateTint}
          />
        </>
      )}

      <Text
        x={LAYOUT.HUD.CONTENT_X}
        y={isClean ? 386 : 436}
        text={tip}
        style={{
          fontFamily: THEME.FONT.SANS,
          fontSize: 13,
          color: THEME.TEXT_COLOR.FAINT,
          fontStyle: 'italic',
          lineSpacing: 3,
          padding: { bottom: 4 },
          wordWrap: { width: LAYOUT.HUD.CONTENT_WIDTH },
        }}
        visible={!isComplete}
      />

      <Rectangle
        x={LAYOUT.HUD.CONTENT_X}
        y={474}
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
        y={486}
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
        y={500}
        text={`$${String(level.fee)}`}
        style={{
          fontFamily: THEME.FONT.SERIF,
          fontSize: 28,
          color: THEME.TEXT_COLOR.CREAM,
        }}
        visible={!isComplete}
      />

      <Text
        x={LAYOUT.HUD.CONTENT_X}
        y={544}
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
        y={560}
        text={`$${String(earnings)}`}
        style={{
          fontFamily: THEME.FONT.SERIF,
          fontSize: 22,
          color: THEME.TEXT_COLOR.CREAM,
        }}
        visible={!isComplete}
      />

      <Text
        x={LAYOUT.HUD.CONTENT_X}
        y={590}
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
          onClick={isClean ? continueToColor : onDeliver}
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
