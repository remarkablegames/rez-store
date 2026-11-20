import { Arc, Rectangle, Text, useState } from 'phaser-jsx';

import { LAYOUT, LEVELS, SHOP_BRUSHES, THEME, WORK_LAMP } from '../constants';
import type { Brush, Progress } from '../types';
import { buyBrush, buyLamp, equipBrush, loadProgress } from '../utils';
import { BrushIcon } from './BrushIcon';
import { Button } from './Button';

const MARGIN = 72;
const CENTER_X = LAYOUT.GAME.WIDTH / 2;
const EARNINGS_X = LAYOUT.GAME.WIDTH - MARGIN;
const CARD = {
  WIDTH: 280,
  HEIGHT: 392,
  TOP: 182,
  GAP: 28,
  PADDING: 20,
} as const;

const CARD_LEFT = (LAYOUT.GAME.WIDTH - (CARD.WIDTH * 3 + CARD.GAP * 2)) / 2;
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
  const nextMemory = String(nextLevelIndex + 1).padStart(3, '0');

  const handleBrushAction = (brush: Brush): void => {
    const next = progress.brushes.includes(brush.id)
      ? equipBrush(brush.id)
      : buyBrush(brush.id);

    if (next) {
      setProgress(next);
    }
  };

  const handleLampAction = (): void => {
    const next = buyLamp();

    if (next) {
      setProgress(next);
    }
  };

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

      {SHOP_BRUSHES.map((brush, index) => {
        const owned = progress.brushes.includes(brush.id);
        const equipped = progress.equippedBrush === brush.id;

        return (
          <ShopCard
            x={CARD_LEFT + index * (CARD.WIDTH + CARD.GAP)}
            kind="BRUSH UPGRADE"
            name={brush.name}
            trait={brush.trait}
            description={brush.description}
            price={brush.price}
            owned={owned}
            badge={equipped ? 'EQUIPPED' : null}
            buttonLabel={
              owned
                ? equipped
                  ? 'EQUIPPED'
                  : 'EQUIP'
                : `BUY $${String(brush.price)}`
            }
            disabled={equipped || (!owned && progress.earnings < brush.price)}
            brush={brush}
            onAction={() => {
              handleBrushAction(brush);
            }}
          />
        );
      })}

      <ShopCard
        x={CARD_LEFT + 2 * (CARD.WIDTH + CARD.GAP)}
        kind="WORKSHOP UPGRADE"
        name={WORK_LAMP.name}
        trait={WORK_LAMP.trait}
        description={WORK_LAMP.description}
        price={WORK_LAMP.price}
        owned={progress.lamp}
        badge={progress.lamp ? 'INSTALLED' : null}
        buttonLabel={
          progress.lamp ? 'INSTALLED' : `BUY $${String(WORK_LAMP.price)}`
        }
        disabled={progress.lamp || progress.earnings < WORK_LAMP.price}
        onAction={handleLampAction}
      />

      <Text
        x={CENTER_X}
        y={616}
        text={`NEXT UP  /  JOB NO. ${nextMemory}  ${nextLevel.title.toUpperCase()}`}
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
  badge: string | null;
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
  badge,
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

      {badge && (
        <Text
          x={x + CARD.WIDTH - CARD.PADDING}
          y={CARD.TOP + 20}
          text={badge}
          originX={1}
          style={{
            fontFamily: THEME.FONT.MONO,
            fontSize: 12,
            color: THEME.TEXT_COLOR.GOLD,
            letterSpacing: 1,
          }}
        />
      )}

      <Text
        x={x + CARD.PADDING}
        y={CARD.TOP + 40}
        text={name}
        style={{
          fontFamily: THEME.FONT.SERIF,
          fontSize: 26,
          color: THEME.TEXT_COLOR.CREAM,
        }}
      />

      <Text
        x={x + CARD.PADDING}
        y={CARD.TOP + 78}
        text={trait}
        style={{
          fontFamily: THEME.FONT.MONO,
          fontSize: 12,
          color: THEME.TEXT_COLOR.GOLD,
          letterSpacing: 1.5,
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
            fillColor={THEME.SHAPE_COLOR.LAMP}
            fillAlpha={0.07}
          />

          <Arc
            x={centerX}
            y={PREVIEW_Y}
            radius={28}
            fillColor={THEME.SHAPE_COLOR.LAMP}
            fillAlpha={0.14}
          />

          <Arc
            x={centerX}
            y={PREVIEW_Y}
            radius={13}
            fillColor={THEME.SHAPE_COLOR.CREAM}
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
