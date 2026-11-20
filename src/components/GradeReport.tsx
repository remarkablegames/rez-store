import Phaser from 'phaser';
import { Rectangle, Text } from 'phaser-jsx';

import { LAYOUT, THEME } from '../constants';
import type { GradeLetter, JobReport } from '../types';
import { formatElapsed } from '../utils';
import { Button } from './Button';

const HEAT_CELL = 22;
const HEAT_GAP = 2;
const HEAT_START_Y = 398;

interface GradeReportProps {
  report: JobReport;
  onNext: () => void;
  onShop: () => void;
}

export function GradeReport({ report, onNext, onShop }: GradeReportProps) {
  const gridWidth =
    report.zoneColumns > 0
      ? report.zoneColumns * (HEAT_CELL + HEAT_GAP) - HEAT_GAP
      : 0;
  const gridX =
    LAYOUT.HUD.CONTENT_X + (LAYOUT.HUD.CONTENT_WIDTH - gridWidth) / 2;
  const earnedLabel = report.earned > 0 ? 'EARNED' : 'NO IMPROVEMENT';
  const earnedValue = report.earned > 0 ? `+$${String(report.earned)}` : '$0';

  return (
    <>
      <Text
        x={LAYOUT.HUD.CONTENT_X}
        y={124}
        text="CLIENT REPORT"
        style={{
          fontFamily: THEME.FONT.MONO,
          fontSize: 14,
          color: THEME.TEXT_COLOR.GOLD,
          letterSpacing: 2,
        }}
      />

      <Text
        x={LAYOUT.HUD.CONTENT_X}
        y={140}
        text={report.grade}
        style={{
          fontFamily: THEME.FONT.SERIF,
          fontSize: 64,
          color: gradeColor(report.grade),
        }}
      />

      <Text
        x={LAYOUT.HUD.CONTENT_X + 74}
        y={164}
        text="OVERALL"
        style={{
          fontFamily: THEME.FONT.MONO,
          fontSize: 12,
          color: THEME.TEXT_COLOR.GOLD,
          letterSpacing: 1.5,
        }}
      />

      <Text
        x={LAYOUT.HUD.CONTENT_X + 74}
        y={174}
        text={String(Math.round(report.overall * 100))}
        style={{
          fontFamily: THEME.FONT.SERIF,
          fontSize: 24,
          color: THEME.TEXT_COLOR.CREAM,
        }}
      />

      <Rectangle
        x={LAYOUT.HUD.CONTENT_X}
        y={222}
        width={LAYOUT.HUD.CONTENT_WIDTH}
        height={1}
        originX={0}
        originY={0.5}
        fillColor={THEME.SHAPE_COLOR.DIVIDER}
        fillAlpha={0.28}
      />

      <ReportRow label="SURFACE" y={236} value={percent(report.surface)} />
      <ReportRow label="COLOR" y={260} value={percent(report.color)} />
      <ReportRow
        label="TIME"
        y={284}
        value={formatElapsed(report.timeSeconds)}
      />

      <Rectangle
        x={LAYOUT.HUD.CONTENT_X}
        y={306}
        width={LAYOUT.HUD.CONTENT_WIDTH}
        height={1}
        originX={0}
        originY={0.5}
        fillColor={THEME.SHAPE_COLOR.DIVIDER}
        fillAlpha={0.2}
      />

      <Text
        x={LAYOUT.HUD.CONTENT_X}
        y={320}
        text={report.note}
        style={{
          fontFamily: THEME.FONT.SANS,
          fontSize: 12,
          color: THEME.TEXT_COLOR.MUTED,
          fontStyle: 'italic',
          lineSpacing: 4,
          wordWrap: { width: LAYOUT.HUD.CONTENT_WIDTH },
        }}
      />

      <Text
        x={LAYOUT.HUD.CONTENT_X}
        y={380}
        text="MISSED GRIME"
        style={{
          fontFamily: THEME.FONT.MONO,
          fontSize: 12,
          color: THEME.TEXT_COLOR.GOLD,
          letterSpacing: 1.5,
        }}
      />

      {report.zones.map((value, index) => {
        const column = index % report.zoneColumns;
        const row = Math.floor(index / report.zoneColumns);

        return (
          <Rectangle
            x={gridX + column * (HEAT_CELL + HEAT_GAP)}
            y={HEAT_START_Y + row * (HEAT_CELL + HEAT_GAP)}
            width={HEAT_CELL}
            height={HEAT_CELL}
            originX={0}
            originY={0}
            fillColor={heatColor(value)}
            fillAlpha={0.95}
          />
        );
      })}

      <Rectangle
        x={LAYOUT.HUD.CONTENT_X}
        y={514}
        width={LAYOUT.HUD.CONTENT_WIDTH}
        height={1}
        originX={0}
        originY={0.5}
        fillColor={THEME.SHAPE_COLOR.DIVIDER}
        fillAlpha={0.28}
      />

      <Text
        x={LAYOUT.HUD.CONTENT_X}
        y={526}
        text={earnedLabel}
        style={{
          fontFamily: THEME.FONT.MONO,
          fontSize: 12,
          color: THEME.TEXT_COLOR.GOLD,
          letterSpacing: 1.5,
        }}
      />

      <Text
        x={LAYOUT.HUD.CONTENT_X}
        y={542}
        text={earnedValue}
        style={{
          fontFamily: THEME.FONT.SERIF,
          fontSize: 26,
          color: THEME.TEXT_COLOR.CREAM,
        }}
      />

      <Text
        x={LAYOUT.HUD.CONTENT_X}
        y={578}
        text={
          report.bestPayout > 0
            ? `BEST $${String(report.bestPayout)}`
            : 'BEST —'
        }
        style={{
          fontFamily: THEME.FONT.MONO,
          fontSize: 12,
          color: THEME.TEXT_COLOR.MUTED,
          letterSpacing: 0.5,
        }}
      />

      <Text
        x={LAYOUT.HUD.CONTENT_X}
        y={592}
        text={`EARNINGS $${String(report.earnings)}`}
        style={{
          fontFamily: THEME.FONT.MONO,
          fontSize: 12,
          color: THEME.TEXT_COLOR.MUTED,
          letterSpacing: 0.5,
        }}
      />

      <Button
        x={LAYOUT.HUD.CONTENT_X + LAYOUT.HUD.CONTENT_WIDTH / 4}
        y={638}
        width={LAYOUT.HUD.CONTENT_WIDTH / 2 - 4}
        height={44}
        onClick={onShop}
        variant="secondary"
      >
        SHOP
      </Button>

      <Button
        x={LAYOUT.HUD.CONTENT_X + (LAYOUT.HUD.CONTENT_WIDTH * 3) / 4}
        y={638}
        width={LAYOUT.HUD.CONTENT_WIDTH / 2 - 4}
        height={44}
        onClick={onNext}
      >
        NEXT JOB
      </Button>
    </>
  );
}

interface ReportRowProps {
  label: string;
  value: string;
  y: number;
}

function ReportRow({ label, value, y }: ReportRowProps) {
  return (
    <>
      <Text
        x={LAYOUT.HUD.CONTENT_X}
        y={y}
        text={label}
        style={{
          fontFamily: THEME.FONT.MONO,
          fontSize: 12,
          color: THEME.TEXT_COLOR.GOLD,
          letterSpacing: 1.5,
        }}
      />
      <Text
        x={LAYOUT.HUD.CONTENT_X + LAYOUT.HUD.CONTENT_WIDTH}
        y={y + 4}
        text={value}
        style={{
          fontFamily: THEME.FONT.SERIF,
          fontSize: 18,
          color: THEME.TEXT_COLOR.CREAM,
        }}
        originX={1}
      />
    </>
  );
}

function percent(value: number): string {
  return `${String(Math.round(value * 100))}%`;
}

function gradeColor(grade: GradeLetter): string {
  if (grade === 'S' || grade === 'A') {
    return THEME.TEXT_COLOR.GOLD;
  }

  if (grade === 'B') {
    return THEME.TEXT_COLOR.CREAM;
  }

  if (grade === 'F') {
    return THEME.TEXT_COLOR.RUST;
  }

  return THEME.TEXT_COLOR.MUTED;
}

function heatColor(value: number): number {
  const clamped = Phaser.Math.Clamp(value, 0, 1);
  const from =
    clamped <= 0.5 ? THEME.SHAPE_COLOR.HEAT_CLEAN : THEME.SHAPE_COLOR.HEAT_MID;
  const to =
    clamped <= 0.5 ? THEME.SHAPE_COLOR.HEAT_MID : THEME.SHAPE_COLOR.HEAT_DIRT;
  const local = clamped <= 0.5 ? clamped * 2 : (clamped - 0.5) * 2;
  const fromRed = (from >> 16) & 0xff;
  const fromGreen = (from >> 8) & 0xff;
  const fromBlue = from & 0xff;
  const toRed = (to >> 16) & 0xff;
  const toGreen = (to >> 8) & 0xff;
  const toBlue = to & 0xff;

  return (
    (Math.round(Phaser.Math.Linear(fromRed, toRed, local)) << 16) |
    (Math.round(Phaser.Math.Linear(fromGreen, toGreen, local)) << 8) |
    Math.round(Phaser.Math.Linear(fromBlue, toBlue, local))
  );
}
