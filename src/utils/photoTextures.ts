import Phaser from 'phaser';

import { KEY, LAYOUT } from '../constants';
import type { PhotoTextures } from '../types';
import { createCanvasTexture } from './canvasTexture';

const CELL_SIZE = 16;
const DIRT_ALPHA_THRESHOLD = 18;
const DUST_COLORS = ['#e8ddc8', '#d5c7ac', '#a99b84', '#837866'] as const;

type Random = Phaser.Math.RandomDataGenerator;

export function createPhotoTextures(scene: Phaser.Scene): PhotoTextures {
  const image = getPhotoSource(scene);

  const clean = createCanvasTexture(
    scene,
    KEY.TEXTURE.PHOTO_CLEAN,
    LAYOUT.PHOTO.WIDTH,
    LAYOUT.PHOTO.HEIGHT,
  );
  drawCleanPhoto(clean.context, image);
  clean.refresh();

  const aged = createCanvasTexture(
    scene,
    KEY.TEXTURE.PHOTO_AGED,
    LAYOUT.PHOTO.WIDTH,
    LAYOUT.PHOTO.HEIGHT,
  );
  drawAgedPhoto(aged.context, image);
  aged.refresh();

  const grime = createCanvasTexture(
    scene,
    KEY.TEXTURE.PHOTO_GRIME,
    LAYOUT.PHOTO.WIDTH,
    LAYOUT.PHOTO.HEIGHT,
  );
  drawGrime(grime.context);
  grime.refresh();

  const { columns, dirtyCells, rows } = buildDirtyMask(grime.context);

  return {
    clean,
    aged,
    grime,
    dirtyCells,
    columns,
    rows,
    cellSize: CELL_SIZE,
  };
}

function getPhotoSource(scene: Phaser.Scene): HTMLImageElement {
  const source = scene.textures.get(KEY.IMAGE.SMILING_GIRL).getSourceImage();

  if (!(source instanceof HTMLImageElement)) {
    throw new Error('The photograph source must be an HTML image');
  }

  return source;
}

function createRandom(): Random {
  return new Phaser.Math.RandomDataGenerator([Phaser.Math.RND.uuid()]);
}

function drawBaseImage(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  grade: (data: Uint8ClampedArray) => void,
): void {
  context.clearRect(0, 0, LAYOUT.PHOTO.WIDTH, LAYOUT.PHOTO.HEIGHT);
  context.save();
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(image, 0, 0, LAYOUT.PHOTO.WIDTH, LAYOUT.PHOTO.HEIGHT);
  context.restore();

  const imageData = context.getImageData(
    0,
    0,
    LAYOUT.PHOTO.WIDTH,
    LAYOUT.PHOTO.HEIGHT,
  );
  grade(imageData.data);
  context.putImageData(imageData, 0, 0);
}

function drawCleanPhoto(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
): void {
  drawBaseImage(context, image, (data) => {
    for (let index = 0; index < data.length; index += 4) {
      const red = data[index];
      const green = data[index + 1];
      const blue = data[index + 2];
      const gray = red * 0.299 + green * 0.587 + blue * 0.114;

      data[index] = clampChannel(
        (gray + (red - gray) * 1.11 - 128) * 1.04 + 128 + 3,
      );
      data[index + 1] = clampChannel(
        (gray + (green - gray) * 1.11 - 128) * 1.04 + 128 + 2,
      );
      data[index + 2] = clampChannel(
        (gray + (blue - gray) * 1.09 - 128) * 1.04 + 128 + 6,
      );
    }
  });
}

function drawAgedPhoto(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
): void {
  drawBaseImage(context, image, (data) => {
    for (let index = 0; index < data.length; index += 4) {
      const red = data[index];
      const green = data[index + 1];
      const blue = data[index + 2];

      const sepiaRed = red * 0.393 + green * 0.769 + blue * 0.189;
      const sepiaGreen = red * 0.349 + green * 0.686 + blue * 0.168;
      const sepiaBlue = red * 0.272 + green * 0.534 + blue * 0.131;

      const agedRed = red + (sepiaRed - red) * 0.62;
      const agedGreen = green + (sepiaGreen - green) * 0.62;
      const agedBlue = blue + (sepiaBlue - blue) * 0.62;

      data[index] = clampChannel(((agedRed - 128) * 0.92 + 128 + 10) * 0.9);
      data[index + 1] = clampChannel(
        ((agedGreen - 128) * 0.92 + 128 + 4) * 0.88,
      );
      data[index + 2] = clampChannel(
        ((agedBlue - 128) * 0.92 + 128 - 8) * 0.82,
      );
    }
  });

  addAgedFinish(context);
}

function addAgedFinish(context: CanvasRenderingContext2D): void {
  const random = createRandom();
  context.save();

  // Uneven yellowing across the print.
  for (let index = 0; index < 9; index++) {
    const x = random.between(0, LAYOUT.PHOTO.WIDTH);
    const y = random.between(0, LAYOUT.PHOTO.HEIGHT);
    const radius = random.between(50, 170);
    const alpha = random.realInRange(0.02, 0.07);
    const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, `rgba(122, 82, 35, ${String(alpha)})`);
    gradient.addColorStop(1, 'rgba(122, 82, 35, 0)');
    context.fillStyle = gradient;
    context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }

  const vignette = context.createRadialGradient(
    LAYOUT.PHOTO.WIDTH / 2,
    LAYOUT.PHOTO.HEIGHT / 2,
    LAYOUT.PHOTO.HEIGHT * 0.28,
    LAYOUT.PHOTO.WIDTH / 2,
    LAYOUT.PHOTO.HEIGHT / 2,
    LAYOUT.PHOTO.WIDTH * 0.72,
  );
  vignette.addColorStop(0, 'rgba(25, 16, 8, 0)');
  vignette.addColorStop(0.7, 'rgba(25, 16, 8, 0.12)');
  vignette.addColorStop(1, 'rgba(25, 16, 8, 0.55)');
  context.fillStyle = vignette;
  context.fillRect(0, 0, LAYOUT.PHOTO.WIDTH, LAYOUT.PHOTO.HEIGHT);

  // Fine grain in the emulsion.
  for (let index = 0; index < 2400; index++) {
    const x = random.between(0, LAYOUT.PHOTO.WIDTH - 1);
    const y = random.between(0, LAYOUT.PHOTO.HEIGHT - 1);
    const alpha = random.realInRange(0.015, 0.06);
    context.fillStyle =
      random.frac() > 0.45
        ? `rgba(255, 241, 210, ${String(alpha)})`
        : `rgba(36, 25, 14, ${String(alpha)})`;
    context.fillRect(x, y, 1, 1);
  }

  context.restore();
}

function drawGrime(context: CanvasRenderingContext2D): void {
  context.clearRect(0, 0, LAYOUT.PHOTO.WIDTH, LAYOUT.PHOTO.HEIGHT);
  context.save();

  const random = createRandom();
  drawDust(context, random);
  drawSmudges(context, random);
  drawStains(context, random);
  drawScratches(context, random);
  drawHairs(context, random);
  drawCreases(context, random);
  drawFoxing(context, random);

  context.restore();
}

function drawDust(context: CanvasRenderingContext2D, random: Random): void {
  for (let index = 0; index < 55; index++) {
    const centerX = random.between(-12, LAYOUT.PHOTO.WIDTH + 12);
    const centerY = random.between(-12, LAYOUT.PHOTO.HEIGHT + 12);
    const spread = random.realInRange(8, 52);
    const count = random.between(8, 18);

    for (let speck = 0; speck < count; speck++) {
      const angle = random.realInRange(0, Math.PI * 2);
      const distance = Math.sqrt(random.frac()) * spread;
      drawDustSpeck(
        context,
        random,
        centerX + Math.cos(angle) * distance,
        centerY + Math.sin(angle) * distance,
      );
    }
  }

  // Extra dust gathering around the edges of the print.
  for (let index = 0; index < 28; index++) {
    const edge = index % 4;
    let centerX = random.between(0, LAYOUT.PHOTO.WIDTH);
    let centerY = random.between(0, LAYOUT.PHOTO.HEIGHT);

    if (edge === 0) {
      centerY = random.between(0, 46);
    } else if (edge === 1) {
      centerX = random.between(LAYOUT.PHOTO.WIDTH - 46, LAYOUT.PHOTO.WIDTH);
    } else if (edge === 2) {
      centerY = random.between(LAYOUT.PHOTO.HEIGHT - 46, LAYOUT.PHOTO.HEIGHT);
    } else {
      centerX = random.between(0, 46);
    }

    for (let speck = 0; speck < 6; speck++) {
      drawDustSpeck(
        context,
        random,
        centerX + random.realInRange(-22, 22),
        centerY + random.realInRange(-22, 22),
      );
    }
  }

  context.globalAlpha = 1;
}

function drawDustSpeck(
  context: CanvasRenderingContext2D,
  random: Random,
  x: number,
  y: number,
): void {
  const radius = random.realInRange(0.35, 1.6);
  const color = DUST_COLORS[random.between(0, DUST_COLORS.length - 1)];
  context.globalAlpha = random.realInRange(0.2, 0.75);
  context.fillStyle = color;
  context.beginPath();
  context.arc(x, y, radius, 0, Math.PI * 2);
  context.fill();
}

function drawSmudges(context: CanvasRenderingContext2D, random: Random): void {
  for (let index = 0; index < 11; index++) {
    const x = random.between(30, LAYOUT.PHOTO.WIDTH - 30);
    const y = random.between(30, LAYOUT.PHOTO.HEIGHT - 30);
    const radius = random.realInRange(28, 110);
    const alpha = random.realInRange(0.035, 0.1);
    const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, `rgba(72, 58, 40, ${String(alpha)})`);
    gradient.addColorStop(0.55, `rgba(72, 58, 40, ${String(alpha * 0.6)})`);
    gradient.addColorStop(1, 'rgba(72, 58, 40, 0)');
    context.fillStyle = gradient;
    context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }
}

function drawStains(context: CanvasRenderingContext2D, random: Random): void {
  for (let index = 0; index < 4; index++) {
    const x = random.between(70, LAYOUT.PHOTO.WIDTH - 70);
    const y = random.between(70, LAYOUT.PHOTO.HEIGHT - 70);
    const radius = random.realInRange(22, 65);
    const alpha = random.realInRange(0.12, 0.28);
    const squash = random.realInRange(0.72, 1.28);

    context.save();
    context.translate(x, y);
    context.scale(squash, 1);

    const wash = context.createRadialGradient(0, 0, 0, 0, 0, radius);
    wash.addColorStop(0, 'rgba(112, 82, 44, 0.015)');
    wash.addColorStop(0.72, 'rgba(112, 82, 44, 0.035)');
    wash.addColorStop(1, 'rgba(112, 82, 44, 0)');
    context.fillStyle = wash;
    context.beginPath();
    context.arc(0, 0, radius, 0, Math.PI * 2);
    context.fill();

    context.strokeStyle = `rgba(102, 69, 32, ${String(alpha)})`;
    context.lineWidth = random.realInRange(1, 2.6);
    context.beginPath();
    context.arc(0, 0, radius, 0, Math.PI * 2);
    context.stroke();

    context.strokeStyle = `rgba(102, 69, 32, ${String(alpha * 0.45)})`;
    context.lineWidth = random.realInRange(0.6, 1.4);
    context.beginPath();
    context.arc(
      random.realInRange(-5, 5),
      random.realInRange(-5, 5),
      radius * random.realInRange(0.7, 0.88),
      0,
      Math.PI * 2,
    );
    context.stroke();

    context.restore();
  }
}

function drawScratches(
  context: CanvasRenderingContext2D,
  random: Random,
): void {
  context.lineCap = 'round';

  for (let index = 0; index < 16; index++) {
    const startX = random.between(-30, LAYOUT.PHOTO.WIDTH + 30);
    const startY = random.between(-30, LAYOUT.PHOTO.HEIGHT + 30);
    const angle = random.realInRange(0, Math.PI * 2);
    const length = random.realInRange(40, 220);
    const endX = startX + Math.cos(angle) * length;
    const endY = startY + Math.sin(angle) * length;
    const bend = random.realInRange(-35, 35);
    const controlX = (startX + endX) / 2 - Math.sin(angle) * bend;
    const controlY = (startY + endY) / 2 + Math.cos(angle) * bend;
    const alpha = random.realInRange(0.12, 0.34);
    const width = random.realInRange(0.6, 1.5);

    context.strokeStyle = `rgba(58, 46, 31, ${String(alpha)})`;
    context.lineWidth = width;
    context.beginPath();
    context.moveTo(startX + 0.8, startY + 0.8);
    context.quadraticCurveTo(
      controlX + 0.8,
      controlY + 0.8,
      endX + 0.8,
      endY + 0.8,
    );
    context.stroke();

    context.strokeStyle = `rgba(255, 246, 224, ${String(alpha + 0.12)})`;
    context.lineWidth = Math.max(0.5, width * 0.75);
    context.beginPath();
    context.moveTo(startX, startY);
    context.quadraticCurveTo(controlX, controlY, endX, endY);
    context.stroke();
  }
}

function drawHairs(context: CanvasRenderingContext2D, random: Random): void {
  context.lineCap = 'round';

  for (let index = 0; index < 6; index++) {
    const startX = random.between(0, LAYOUT.PHOTO.WIDTH);
    const startY = random.between(0, LAYOUT.PHOTO.HEIGHT);
    const endX = startX + random.realInRange(-120, 120);
    const endY = startY + random.realInRange(-120, 120);

    context.strokeStyle = `rgba(48, 38, 25, ${String(
      random.realInRange(0.16, 0.33),
    )})`;
    context.lineWidth = random.realInRange(0.6, 1.1);
    context.beginPath();
    context.moveTo(startX, startY);
    context.bezierCurveTo(
      startX + random.realInRange(-50, 50),
      startY + random.realInRange(-50, 50),
      endX + random.realInRange(-50, 50),
      endY + random.realInRange(-50, 50),
      endX,
      endY,
    );
    context.stroke();
  }
}

function drawCreases(context: CanvasRenderingContext2D, random: Random): void {
  for (let index = 0; index < 2; index++) {
    const x = random.between(
      LAYOUT.PHOTO.WIDTH * 0.2,
      LAYOUT.PHOTO.WIDTH * 0.8,
    );
    const drift = random.realInRange(-80, 80);
    const alpha = random.realInRange(0.1, 0.18);

    context.strokeStyle = `rgba(60, 46, 28, ${String(alpha)})`;
    context.lineWidth = 2.4;
    context.beginPath();
    context.moveTo(x, -10);
    context.quadraticCurveTo(
      x + drift,
      LAYOUT.PHOTO.HEIGHT / 2,
      x + drift * 0.4,
      LAYOUT.PHOTO.HEIGHT + 10,
    );
    context.stroke();

    context.strokeStyle = `rgba(255, 242, 218, ${String(alpha * 0.7)})`;
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(x + 1.5, -10);
    context.quadraticCurveTo(
      x + drift + 1.5,
      LAYOUT.PHOTO.HEIGHT / 2,
      x + drift * 0.4 + 1.5,
      LAYOUT.PHOTO.HEIGHT + 10,
    );
    context.stroke();
  }
}

function drawFoxing(context: CanvasRenderingContext2D, random: Random): void {
  for (let index = 0; index < 28; index++) {
    const x = random.between(0, LAYOUT.PHOTO.WIDTH);
    const y = random.between(0, LAYOUT.PHOTO.HEIGHT);
    const radius = random.realInRange(0.5, 2.2);
    const alpha = random.realInRange(0.15, 0.4);
    context.fillStyle = `rgba(105, 58, 26, ${String(alpha)})`;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
  }
}

function buildDirtyMask(context: CanvasRenderingContext2D): {
  columns: number;
  dirtyCells: Set<number>;
  rows: number;
} {
  const columns = Math.ceil(LAYOUT.PHOTO.WIDTH / CELL_SIZE);
  const rows = Math.ceil(LAYOUT.PHOTO.HEIGHT / CELL_SIZE);
  const dirtyCells = new Set<number>();
  const { data } = context.getImageData(
    0,
    0,
    LAYOUT.PHOTO.WIDTH,
    LAYOUT.PHOTO.HEIGHT,
  );

  for (let y = 0; y < LAYOUT.PHOTO.HEIGHT; y++) {
    const rowOffset = Math.floor(y / CELL_SIZE) * columns;

    for (let x = 0; x < LAYOUT.PHOTO.WIDTH; x++) {
      const alpha = data[(y * LAYOUT.PHOTO.WIDTH + x) * 4 + 3];

      if (alpha > DIRT_ALPHA_THRESHOLD) {
        dirtyCells.add(rowOffset + Math.floor(x / CELL_SIZE));
      }
    }
  }

  return { columns, dirtyCells, rows };
}

function clampChannel(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}
