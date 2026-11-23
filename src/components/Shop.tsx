import { Arc, Rectangle, Text, useState } from 'phaser-jsx';

import {
  BRUSH_ORDER,
  BRUSH_UPGRADES,
  BRUSHES,
  INSPECT_TOOL,
  LAYOUT,
  LEVELS,
  SHOP_COLORS,
  THEME,
} from '../constants';
import type { Brush, BrushId, ColorAxis, Progress } from '../types';
import {
  buyBrush,
  buyBrushUpgrade,
  buyColor,
  buyInspect,
  equipBrush,
  getBrush,
  loadProgress,
} from '../utils';
import { BrushIcon } from './BrushIcon';
import { Button } from './Button';

const MARGIN = 72;
const CENTER_X = LAYOUT.GAME.WIDTH / 2;
const EARNINGS_X = LAYOUT.GAME.WIDTH - MARGIN;
const CARD = {
  WIDTH: 155,
  HEIGHT: 392,
  TOP: 182,
  GAP: 10,
  PADDING: 16,
} as const;

const PREVIEW_Y = CARD.TOP + 226;
const PRICE_LABEL_Y = CARD.TOP + 278;
const PRICE_VALUE_Y = CARD.TOP + 292;
const ACTION_Y = CARD.TOP + 350;

interface ShopProps {
  level: number;
  onNext: () => void;
}

export function Shop({ level, onNext }: ShopProps) {
  const [progress, setProgress] = useState<Progress>(loadProgress());
  const nextLevelIndex = (level + 1) % LEVELS.length;
  const nextLevel = LEVELS[nextLevelIndex];
  const nextJob = String(nextLevelIndex + 1).padStart(2, '0');

  const handleBrushAction = (brush: Brush): void => {
    const next = progress.brushes.includes(brush.id)
      ? equipBrush(brush.id)
      : buyBrush(brush.id);

    if (next) {
      setProgress(next);
    }
  };

  const handleBrushUpgrade = (brushId: BrushId): void => {
    const next = buyBrushUpgrade(brushId);

    if (next) {
      setProgress(next);
    }
  };

  const handleInspectAction = (): void => {
    const next = buyInspect();

    if (next) {
      setProgress(next);
    }
  };

  const handleColorAction = (axis: ColorAxis): void => {
    const next = buyColor(axis);

    if (next) {
      setProgress(next);
    }
  };

  const shopItems = [
    ...BRUSH_ORDER.map((brushId) => {
      const brush = BRUSHES[brushId];
      const owned = progress.brushes.includes(brushId);
      const currentLevel = progress.brushLevels[brushId];
      const tiers = BRUSH_UPGRADES[brushId];
      const canUpgrade = currentLevel < tiers.length;
      const nextTier = canUpgrade ? tiers[currentLevel] : undefined;

      return {
        kind: 'brush' as const,
        brush,
        owned,
        currentLevel,
        nextTier,
      };
    }),
    ...SHOP_COLORS.map((upgrade) => ({ kind: 'color' as const, upgrade })),
    { kind: 'inspect' as const, upgrade: INSPECT_TOOL },
  ];

  const cardLeft =
    (LAYOUT.GAME.WIDTH -
      (CARD.WIDTH * shopItems.length + CARD.GAP * (shopItems.length - 1))) /
    2;

  return (
    <>
      <Text
        x={MARGIN}
        y={52}
        text="REZ STORE  /  WORKSHOP"
        style={{
          fontFamily: THEME.FONT.MONO,
          fontSize: 14,
          color: THEME.TEXT_COLOR.GOLD,
          letterSpacing: 3,
        }}
      />

      <Text
        x={MARGIN}
        y={72}
        text="Workshop Tools"
        style={{
          fontFamily: THEME.FONT.SERIF,
          fontSize: 40,
          color: THEME.TEXT_COLOR.CREAM,
          padding: { bottom: 1 },
        }}
      />

      <Text
        x={MARGIN}
        y={124}
        text="Workbench equipment."
        style={{
          fontFamily: THEME.FONT.SANS,
          fontSize: 14,
          color: THEME.TEXT_COLOR.MUTED,
        }}
      />

      <Text
        x={EARNINGS_X}
        y={55}
        text="EARNINGS"
        originX={1}
        style={{
          fontFamily: THEME.FONT.MONO,
          fontSize: 12,
          color: THEME.TEXT_COLOR.GOLD,
          letterSpacing: 1.5,
        }}
      />

      <Text
        x={EARNINGS_X}
        y={80}
        text={`$${String(progress.earnings)}`}
        originX={1}
        style={{
          fontFamily: THEME.FONT.SERIF,
          fontSize: 34,
          color: THEME.TEXT_COLOR.CREAM,
        }}
      />

      <Rectangle
        x={MARGIN}
        y={156}
        width={LAYOUT.GAME.WIDTH - MARGIN * 2}
        height={1}
        originX={0}
        originY={0.5}
        fillColor={THEME.SHAPE_COLOR.DIVIDER}
        fillAlpha={0.28}
      />

      {shopItems.map((item, index) => {
        const x = cardLeft + index * (CARD.WIDTH + CARD.GAP);

        if (item.kind === 'brush') {
          const brush = item.brush;
          const owned = item.owned;
          const equipped = progress.equippedBrush === brush.id;
          const nextTier = item.nextTier;

          if (!owned) {
            return (
              <ShopCard
                key={brush.id}
                x={x}
                kind="BRUSH"
                name={brush.name}
                trait={brush.trait}
                description={brush.description}
                price={brush.price}
                owned={false}
                buttonLabel={`BUY $${String(brush.price)}`}
                disabled={progress.earnings < brush.price}
                brush={brush}
                onAction={() => {
                  handleBrushAction(brush);
                }}
              />
            );
          }

          if (nextTier) {
            const effectiveBrush = getBrush(brush.id, progress);
            return (
              <ShopCard
                key={`${brush.id}-upgrade`}
                x={x}
                kind="BRUSH UPGRADE"
                name={nextTier.name ?? brush.name}
                trait={nextTier.trait ?? brush.trait}
                description={nextTier.description ?? brush.description}
                price={nextTier.price}
                owned={true}
                buttonLabel={`UPGRADE $${String(nextTier.price)}`}
                disabled={progress.earnings < nextTier.price}
                brush={effectiveBrush}
                onAction={() => {
                  handleBrushUpgrade(brush.id);
                }}
              />
            );
          }

          const effectiveBrush = getBrush(brush.id, progress);
          return (
            <ShopCard
              key={brush.id}
              x={x}
              kind="BRUSH UPGRADE"
              name={brush.name}
              trait={brush.trait}
              description={brush.description}
              price={brush.price}
              owned={true}
              buttonLabel={equipped ? 'EQUIPPED' : 'EQUIP'}
              disabled={equipped}
              brush={effectiveBrush}
              onAction={() => {
                handleBrushAction(brush);
              }}
            />
          );
        }

        if (item.kind === 'color') {
          const upgrade = item.upgrade;
          const owned = progress.colors.includes(upgrade.axis);

          return (
            <ShopCard
              key={upgrade.axis}
              x={x}
              kind="COLOR UPGRADE"
              name={upgrade.name}
              trait={upgrade.trait}
              description={upgrade.description}
              price={upgrade.price}
              owned={owned}
              buttonLabel={owned ? 'OWNED' : `BUY $${String(upgrade.price)}`}
              disabled={owned || progress.earnings < upgrade.price}
              onAction={() => {
                handleColorAction(upgrade.axis);
              }}
            />
          );
        }

        const upgrade = item.upgrade;
        const owned = progress.inspect;

        return (
          <ShopCard
            key={upgrade.id}
            x={x}
            kind="TOOL UPGRADE"
            name={upgrade.name}
            trait={upgrade.trait}
            description={upgrade.description}
            price={upgrade.price}
            owned={owned}
            buttonLabel={owned ? 'INSTALLED' : `BUY $${String(upgrade.price)}`}
            disabled={owned || progress.earnings < upgrade.price}
            onAction={handleInspectAction}
          />
        );
      })}

      <Text
        x={CENTER_X}
        y={616}
        text={`NEXT UP  /  JOB NO. ${nextJob}  ${nextLevel.title.toUpperCase()}`}
        originX={0.5}
        style={{
          fontFamily: THEME.FONT.MONO,
          fontSize: 12,
          color: THEME.TEXT_COLOR.FAINT,
          letterSpacing: 0.5,
        }}
      />

      <Button x={CENTER_X} y={680} width={280} height={46} onClick={onNext}>
        START NEXT JOB
      </Button>
    </>
  );
}

interface ShopCardProps {
  x: number;
  kind: string;
  name: string;
  trait: string;
  description: string;
  price: number;
  owned: boolean;
  buttonLabel: string;
  disabled: boolean;
  brush?: Brush;
  onAction: () => void;
}

function ShopCard({
  x,
  kind,
  name,
  trait,
  description,
  price,
  owned,
  buttonLabel,
  disabled,
  brush,
  onAction,
}: ShopCardProps) {
  const centerX = x + CARD.WIDTH / 2;

  return (
    <>
      <Rectangle
        x={x}
        y={CARD.TOP}
        width={CARD.WIDTH}
        height={CARD.HEIGHT}
        originX={0}
        originY={0}
        fillColor={0x14110d}
        fillAlpha={0.92}
      />

      <Rectangle
        x={x}
        y={CARD.TOP}
        width={CARD.WIDTH}
        height={2}
        originX={0}
        originY={0}
        fillColor={THEME.SHAPE_COLOR.GOLD}
        fillAlpha={owned ? 0.9 : 0.35}
      />

      <Text
        x={x + CARD.PADDING}
        y={CARD.TOP + 20}
        text={kind}
        style={{
          fontFamily: THEME.FONT.MONO,
          fontSize: 12,
          color: THEME.TEXT_COLOR.GOLD,
          letterSpacing: 1.5,
        }}
      />

      <Text
        x={x + CARD.PADDING}
        y={CARD.TOP + 40}
        text={name}
        style={{
          fontFamily: THEME.FONT.SERIF,
          fontSize: 18,
          color: THEME.TEXT_COLOR.CREAM,
          wordWrap: { width: CARD.WIDTH - CARD.PADDING * 2 },
        }}
      />

      <Text
        x={x + CARD.PADDING}
        y={CARD.TOP + 70}
        text={trait}
        style={{
          fontFamily: THEME.FONT.MONO,
          fontSize: 12,
          color: THEME.TEXT_COLOR.GOLD,
          letterSpacing: 1.5,
          wordWrap: { width: CARD.WIDTH - CARD.PADDING * 2 },
        }}
      />

      <Rectangle
        x={x + CARD.PADDING}
        y={CARD.TOP + 102}
        width={CARD.WIDTH - CARD.PADDING * 2}
        height={1}
        originX={0}
        originY={0.5}
        fillColor={THEME.SHAPE_COLOR.DIVIDER}
        fillAlpha={0.22}
      />

      <Text
        x={x + CARD.PADDING}
        y={CARD.TOP + 116}
        text={description}
        style={{
          fontFamily: THEME.FONT.SANS,
          fontSize: 13,
          color: THEME.TEXT_COLOR.MUTED,
          lineSpacing: 5,
          wordWrap: { width: CARD.WIDTH - CARD.PADDING * 2 },
        }}
      />

      {brush ? (
        <BrushIcon x={centerX} y={PREVIEW_Y} brush={brush} scale={1.5} />
      ) : (
        <>
          <Arc
            x={centerX}
            y={PREVIEW_Y}
            radius={44}
            fillColor={THEME.SHAPE_COLOR.CREAM}
            fillAlpha={0.07}
          />

          <Arc
            x={centerX}
            y={PREVIEW_Y}
            radius={28}
            fillColor={THEME.SHAPE_COLOR.CREAM}
            fillAlpha={0.14}
          />

          <Arc
            x={centerX}
            y={PREVIEW_Y}
            radius={13}
            fillColor={THEME.SHAPE_COLOR.GOLD}
            fillAlpha={0.5}
          />

          <Rectangle
            x={centerX + 18}
            y={PREVIEW_Y + 18}
            width={14}
            height={6}
            originX={0}
            originY={0.5}
            fillColor={THEME.SHAPE_COLOR.GOLD}
            fillAlpha={0.5}
          />
        </>
      )}

      <Text
        x={x + CARD.PADDING}
        y={PRICE_LABEL_Y}
        text={owned ? 'STATUS' : 'PRICE'}
        style={{
          fontFamily: THEME.FONT.MONO,
          fontSize: 12,
          color: THEME.TEXT_COLOR.GOLD,
          letterSpacing: 1.5,
        }}
      />

      <Text
        x={x + CARD.PADDING}
        y={PRICE_VALUE_Y}
        text={owned ? 'OWNED' : `$${String(price)}`}
        style={{
          fontFamily: THEME.FONT.SERIF,
          fontSize: 28,
          color: owned ? THEME.TEXT_COLOR.GOLD : THEME.TEXT_COLOR.CREAM,
        }}
      />

      <Button
        x={centerX}
        y={ACTION_Y}
        width={CARD.WIDTH - CARD.PADDING * 2}
        height={40}
        onClick={onAction}
        disabled={disabled}
      >
        {buttonLabel}
      </Button>
    </>
  );
}
