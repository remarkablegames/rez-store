import { Rectangle, Text, useState } from 'phaser-jsx';

import {
  BRUSH_ORDER,
  BRUSH_UPGRADES,
  BRUSHES,
  COLOR_TIERS,
  INSPECT_TIERS,
  LAYOUT,
  LEVELS,
  THEME,
} from '../constants';
import type { Brush, BrushId, ColorAxis, Progress } from '../types';
import {
  buyBrush,
  buyBrushUpgrade,
  buyColorTier,
  buyInspectTier,
  equipBrush,
  getBrush,
  loadProgress,
} from '../utils';
import { BrushIcon } from './BrushIcon';
import { Button } from './Button';
import { ColorSliderIcon } from './ColorSliderIcon';
import { InspectIcon } from './InspectIcon';

const MARGIN = 72;
const CENTER_X = LAYOUT.GAME.WIDTH / 2;
const EARNINGS_X = LAYOUT.GAME.WIDTH - MARGIN;
const CARD = {
  WIDTH: 190,
  HEIGHT: 392,
  TOP: 182,
  GAP: 10,
  PADDING: 16,
} as const;

const PREVIEW_Y = CARD.TOP + 226;
const PRICE_LABEL_Y = CARD.TOP + 278;
const PRICE_VALUE_Y = CARD.TOP + 292;
const ACTION_BUTTON_Y = CARD.TOP + 352;

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
    const next = buyInspectTier();

    if (next) {
      setProgress(next);
    }
  };

  const handleColorAction = (): void => {
    const next = buyColorTier();

    if (next) {
      setProgress(next);
    }
  };

  const inspectOwned = progress.inspect.length >= INSPECT_TIERS.length;
  const nextInspectTier = INSPECT_TIERS.find(
    (tier) => !progress.inspect.includes(tier.id.split('-')[1]),
  );

  const colorOwned = progress.colors.length >= COLOR_TIERS.length;
  const nextColorTierItem = COLOR_TIERS.find(
    (tier) => !progress.colors.includes(tier.axis),
  );

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
    {
      kind: 'color' as const,
      tier: nextColorTierItem,
      owned: colorOwned,
    },
    {
      kind: 'inspect' as const,
      tier: nextInspectTier,
      owned: inspectOwned,
    },
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
                x={x}
                kind="BRUSH"
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
              x={x}
              kind="BRUSH"
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
          const tier = item.tier;
          const owned = item.owned;

          if (!tier) {
            return null;
          }

          return (
            <ShopCard
              x={x}
              kind="COLOR"
              name={tier.name}
              trait={tier.trait}
              description={tier.description}
              price={tier.price}
              owned={owned}
              buttonLabel={owned ? 'OWNED' : `BUY $${String(tier.price)}`}
              disabled={owned || progress.earnings < tier.price}
              colorAxis={tier.axis}
              onAction={handleColorAction}
            />
          );
        }

        const tier = item.tier;
        const owned = item.owned;

        if (!tier) {
          return null;
        }

        return (
          <ShopCard
            x={x}
            kind="TOOL"
            name={tier.name}
            trait={tier.trait}
            description={tier.description}
            price={tier.price}
            owned={owned}
            buttonLabel={owned ? 'INSTALLED' : `BUY $${String(tier.price)}`}
            disabled={owned || progress.earnings < tier.price}
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
  colorAxis?: ColorAxis;
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
  colorAxis,
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
      ) : colorAxis ? (
        <ColorSliderIcon x={centerX} y={PREVIEW_Y} axis={colorAxis} />
      ) : (
        <InspectIcon x={centerX} y={PREVIEW_Y} />
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
        y={ACTION_BUTTON_Y}
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
