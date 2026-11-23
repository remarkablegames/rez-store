import { Container, Rectangle, Text, useEffect } from 'phaser-jsx';

import { LAYOUT, THEME } from '../constants';
import { useUiSound } from '../hooks';
import type { GradeLetter, JobReport } from '../types';
import { formatElapsed, getHeatColor } from '../utils';
import { Button } from './Button';

const HEATMAP_CELL = 22;
const HEATMAP_GAP = 2;
const HEATMAP_START_Y = 406;

interface GradeReportProps {
  report: JobReport;
  onNext: () => void;
  onShop: () => void;
}

export function GradeReport({ report, onNext, onShop }: GradeReportProps) {
  const uiSound = useUiSound();

  useEffect(() => {
    switch (report.grade) {
      case 'S':
      case 'A':
      case 'B':
        uiSound.play('success');
        break;

      case 'C':
      case 'D':
      case 'F':
        uiSound.play('fail');
        break;
    }
  }, []);

  const gridWidth =
    report.zoneColumns > 0
      ? report.zoneColumns * (HEATMAP_CELL + HEATMAP_GAP) - HEATMAP_GAP
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

      <ReportRow label="SURFACE" y={232} value={percent(report.surface)} />
      <ReportRow label="COLOR" y={254} value={percent(report.color)} />
      <ReportRow
        label="ABRASION"
        y={276}
        value={report.damage < 0.005 ? 'NONE' : percent(report.damage)}
      />
      <ReportRow
        label="TIME"
        y={298}
        value={formatElapsed(report.timeSeconds)}
      />

      <Rectangle
        x={LAYOUT.HUD.CONTENT_X}
        y={318}
        width={LAYOUT.HUD.CONTENT_WIDTH}
        height={1}
        originX={0}
        originY={0.5}
        fillColor={THEME.SHAPE_COLOR.DIVIDER}
        fillAlpha={0.2}
      />

      <Text
        x={LAYOUT.HUD.CONTENT_X}
        y={330}
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
        y={386}
        text="MISSED GRIME"
        style={{
          fontFamily: THEME.FONT.MONO,
          fontSize: 12,
          color: THEME.TEXT_COLOR.GOLD,
          letterSpacing: 1.5,
        }}
      />

      <Container x={gridX} y={HEATMAP_START_Y}>
        {report.zones.map((value, index) => {
          const column = index % report.zoneColumns;
          const row = Math.floor(index / report.zoneColumns);

          return (
            <Rectangle
              key={index}
              x={column * (HEATMAP_CELL + HEATMAP_GAP)}
              y={row * (HEATMAP_CELL + HEATMAP_GAP)}
              width={HEATMAP_CELL}
              height={HEATMAP_CELL}
              originX={0}
              originY={0}
              fillColor={getHeatColor(value)}
              fillAlpha={0.95}
            />
          );
        })}
      </Container>

      <Rectangle
        x={LAYOUT.HUD.CONTENT_X}
        y={512}
        width={LAYOUT.HUD.CONTENT_WIDTH}
        height={1}
        originX={0}
        originY={0.5}
        fillColor={THEME.SHAPE_COLOR.DIVIDER}
        fillAlpha={0.28}
      />

      <Text
        x={LAYOUT.HUD.CONTENT_X}
        y={524}
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
        y={538}
        text={earnedValue}
        style={{
          fontFamily: THEME.FONT.SERIF,
          fontSize: 26,
          color: THEME.TEXT_COLOR.CREAM,
        }}
      />

      <Text
        x={LAYOUT.HUD.CONTENT_X}
        y={576}
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
        y={590}
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
