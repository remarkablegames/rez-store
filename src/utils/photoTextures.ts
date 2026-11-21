import Phaser from 'phaser';

import { KEY, LAYOUT } from '../constants';
import type { Grime, Level, PhotoTextures } from '../types';
import { createCanvasTexture } from './canvasTexture';
import { rgba } from './color';
import {
  buildDirtCells,
  combineDirtProfiles,
  measureDirt,
  scaleDirtProfile,
  SET_IN_GRIME_WEIGHT,
} from './dirt';
import { createRandom } from './math';

const CELL_SIZE = 16;
const DUST_COLORS = ['#e8ddc8', '#d5c7ac', '#a99b84', '#837866'] as const;

const GRIME = {
  DUST_CLUSTERS: 84,
  DUST_SPECKS_MIN: 10,
  DUST_SPECKS_MAX: 22,
  EDGE_CLUSTERS: 36,
  SMUDGES: 16,
  HAIRS: 8,
  HAZE_BLOOMS: 22,
  HAZE_LIGHT_PATCHES: 12,
  HAZE_GRAIN: 3200,
} as const;

const SET_IN_GRIME = {
  CLUMPS: 18,
  STAINS: 6,
  SCRATCHES: 20,
  CREASES: 3,
  FOXING: 36,
} as const;

type Random = Phaser.Math.RandomDataGenerator;

export function createPhotoTextures(
  scene: Phaser.Scene,
  level: Level,
  grimeSeed: string,
): PhotoTextures {
  const image = getPhotoSource(scene, level.image);
  const focusY = level.focusY ?? 0.5;

  const clean = createCanvasTexture(
    scene,
    KEY.TEXTURE.PHOTO_CLEAN,
    LAYOUT.PHOTO.WIDTH,
    LAYOUT.PHOTO.HEIGHT,
  );
  drawCleanPhoto(clean.context, image, focusY);
  clean.refresh();

  const aged = createCanvasTexture(
    scene,
    KEY.TEXTURE.PHOTO_AGED,
    LAYOUT.PHOTO.WIDTH,
    LAYOUT.PHOTO.HEIGHT,
  );
  drawAgedPhoto(aged.context, image, focusY);
  aged.refresh();

  const grime = createCanvasTexture(
    scene,
    KEY.TEXTURE.PHOTO_GRIME,
    LAYOUT.PHOTO.WIDTH,
    LAYOUT.PHOTO.HEIGHT,
  );
  drawLooseGrime(grime.context, level.grime, grimeSeed);
  grime.refresh();

  const setIn = createCanvasTexture(
    scene,
    KEY.TEXTURE.PHOTO_GRIME_DEEP,
    LAYOUT.PHOTO.WIDTH,
    LAYOUT.PHOTO.HEIGHT,
  );
  drawSetInGrime(setIn.context, level.grime, `${grimeSeed}:set-in`);
  setIn.refresh();

  const damage = createCanvasTexture(
    scene,
    KEY.TEXTURE.PHOTO_DAMAGE,
    LAYOUT.PHOTO.WIDTH,
    LAYOUT.PHOTO.HEIGHT,
  );

  const columns = Math.ceil(LAYOUT.PHOTO.WIDTH / CELL_SIZE);
  const rows = Math.ceil(LAYOUT.PHOTO.HEIGHT / CELL_SIZE);
  const dirt = combineDirtProfiles(
    measureDirt(grime.context),
    scaleDirtProfile(measureDirt(setIn.context), SET_IN_GRIME_WEIGHT),
  );

  return {
    clean,
    aged,
    grime,
    setIn,
    damage,
    columns,
    rows,
    cellSize: CELL_SIZE,
    dirt,
    looseCells: buildDirtCells(grime.context, columns, rows, CELL_SIZE),
    setInCells: buildDirtCells(setIn.context, columns, rows, CELL_SIZE),
  };
}

function getPhotoSource(
  scene: Phaser.Scene,
  imageKey: string,
): HTMLImageElement {
  const source = scene.textures.get(imageKey).getSourceImage();

  if (!(source instanceof HTMLImageElement)) {
    throw new Error('The photograph source must be an HTML image');
  }

  return source;
}

function drawBaseImage(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  focusY: number,
  grade: (data: Uint8ClampedArray) => void,
): void {
  context.clearRect(0, 0, LAYOUT.PHOTO.WIDTH, LAYOUT.PHOTO.HEIGHT);
  context.save();
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';

  const scale = Math.max(
    LAYOUT.PHOTO.WIDTH / image.naturalWidth,
    LAYOUT.PHOTO.HEIGHT / image.naturalHeight,
  );
  const cropWidth = LAYOUT.PHOTO.WIDTH / scale;
  const cropHeight = LAYOUT.PHOTO.HEIGHT / scale;
  const cropX = (image.naturalWidth - cropWidth) / 2;
  const cropY =
    (image.naturalHeight - cropHeight) * Math.min(1, Math.max(0, focusY));

  context.drawImage(
    image,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    LAYOUT.PHOTO.WIDTH,
    LAYOUT.PHOTO.HEIGHT,
  );
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
  focusY: number,
): void {
  drawBaseImage(context, image, focusY, (data) => {
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
  focusY: number,
): void {
  drawBaseImage(context, image, focusY, (data) => {
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
    gradient.addColorStop(0, rgba(122, 82, 35, alpha));
    gradient.addColorStop(1, rgba(122, 82, 35, 0));
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
  vignette.addColorStop(0, rgba(25, 16, 8, 0));
  vignette.addColorStop(0.7, rgba(25, 16, 8, 0.12));
  vignette.addColorStop(1, rgba(25, 16, 8, 0.55));
  context.fillStyle = vignette;
  context.fillRect(0, 0, LAYOUT.PHOTO.WIDTH, LAYOUT.PHOTO.HEIGHT);

  // Fine grain in the emulsion.
  for (let index = 0; index < 2400; index++) {
    const x = random.between(0, LAYOUT.PHOTO.WIDTH - 1);
    const y = random.between(0, LAYOUT.PHOTO.HEIGHT - 1);
    const alpha = random.realInRange(0.015, 0.06);
    context.fillStyle =
      random.frac() > 0.45
        ? rgba(255, 241, 210, alpha)
        : rgba(36, 25, 14, alpha);
    context.fillRect(x, y, 1, 1);
  }

  context.restore();
}

function drawLooseGrime(
  context: CanvasRenderingContext2D,
  config: Grime,
  seed: string,
): void {
  context.clearRect(0, 0, LAYOUT.PHOTO.WIDTH, LAYOUT.PHOTO.HEIGHT);
  context.save();

  const random = createRandom(seed);
  drawHaze(context, random, config.haze);
  drawDust(context, random, config.density);
  drawSmudges(context, random, config.density);
  drawHairs(context, random, config.density);

  context.restore();
}

function drawSetInGrime(
  context: CanvasRenderingContext2D,
  config: Grime,
  seed: string,
): void {
  context.clearRect(0, 0, LAYOUT.PHOTO.WIDTH, LAYOUT.PHOTO.HEIGHT);
  context.save();

  const random = createRandom(seed);
  const density = Math.max(0.4, config.density * 0.65);

  drawSetInClumps(context, random, density);
  drawStains(context, random, density);
  drawScratches(context, random, density);
  drawCreases(context, random, density);
  drawFoxing(context, random, density);

  context.restore();
}

function drawHaze(
  context: CanvasRenderingContext2D,
  random: Random,
  opacity: number,
): void {
  if (opacity <= 0) {
    return;
  }

  context.save();

  // A translucent film of dust covers the entire print.
  context.fillStyle = rgba(82, 69, 50, opacity);
  context.fillRect(0, 0, LAYOUT.PHOTO.WIDTH, LAYOUT.PHOTO.HEIGHT);

  // Uneven darker blooms where grime has settled.
  for (let index = 0; index < GRIME.HAZE_BLOOMS; index++) {
    const x = random.between(0, LAYOUT.PHOTO.WIDTH);
    const y = random.between(0, LAYOUT.PHOTO.HEIGHT);
    const radius = random.between(90, 280);
    const alpha = random.realInRange(opacity * 0.4, opacity * 1.15);
    const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, rgba(44, 34, 22, alpha));
    gradient.addColorStop(0.62, rgba(44, 34, 22, alpha * 0.55));
    gradient.addColorStop(1, rgba(44, 34, 22, 0));
    context.fillStyle = gradient;
    context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }

  // Lighter dusty patches break up the film.
  for (let index = 0; index < GRIME.HAZE_LIGHT_PATCHES; index++) {
    const x = random.between(0, LAYOUT.PHOTO.WIDTH);
    const y = random.between(0, LAYOUT.PHOTO.HEIGHT);
    const radius = random.between(50, 180);
    const alpha = random.realInRange(0.015, 0.05);
    const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, rgba(226, 213, 184, alpha));
    gradient.addColorStop(1, rgba(226, 213, 184, 0));
    context.fillStyle = gradient;
    context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }

  // Fine grit across every pixel so the whole print reads as dirty.
  for (let index = 0; index < GRIME.HAZE_GRAIN; index++) {
    const x = random.between(0, LAYOUT.PHOTO.WIDTH - 1);
    const y = random.between(0, LAYOUT.PHOTO.HEIGHT - 1);
    const alpha = random.realInRange(0.015, 0.08);
    context.fillStyle =
      random.frac() > 0.6
        ? rgba(229, 218, 192, alpha)
        : rgba(45, 35, 23, alpha * 1.2);
    context.fillRect(x, y, 1, 1);
  }

  context.restore();
}

function drawDust(
  context: CanvasRenderingContext2D,
  random: Random,
  density: number,
): void {
  const clusters = scaleCount(GRIME.DUST_CLUSTERS, density);

  for (let index = 0; index < clusters; index++) {
    const centerX = random.between(-12, LAYOUT.PHOTO.WIDTH + 12);
    const centerY = random.between(-12, LAYOUT.PHOTO.HEIGHT + 12);
    const spread = random.realInRange(8, 52);
    const count = random.between(GRIME.DUST_SPECKS_MIN, GRIME.DUST_SPECKS_MAX);

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
  const edgeClusters = scaleCount(GRIME.EDGE_CLUSTERS, density);

  for (let index = 0; index < edgeClusters; index++) {
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

function drawSmudges(
  context: CanvasRenderingContext2D,
  random: Random,
  density: number,
): void {
  const count = scaleCount(GRIME.SMUDGES, density);

  for (let index = 0; index < count; index++) {
    const x = random.between(30, LAYOUT.PHOTO.WIDTH - 30);
    const y = random.between(30, LAYOUT.PHOTO.HEIGHT - 30);
    const radius = random.realInRange(28, 110);
    const alpha = random.realInRange(0.035, 0.1);
    const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, rgba(72, 58, 40, alpha));
    gradient.addColorStop(0.55, rgba(72, 58, 40, alpha * 0.6));
    gradient.addColorStop(1, rgba(72, 58, 40, 0));
    context.fillStyle = gradient;
    context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }
}

function drawSetInClumps(
  context: CanvasRenderingContext2D,
  random: Random,
  density: number,
): void {
  const count = scaleCount(SET_IN_GRIME.CLUMPS, density);

  for (let index = 0; index < count; index++) {
    const x = random.between(0, LAYOUT.PHOTO.WIDTH);
    const y = random.between(0, LAYOUT.PHOTO.HEIGHT);
    const radius = random.realInRange(7, 26);
    const alpha = random.realInRange(0.12, 0.32);
    const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, rgba(48, 34, 20, alpha));
    gradient.addColorStop(0.55, rgba(48, 34, 20, alpha * 0.7));
    gradient.addColorStop(1, rgba(48, 34, 20, 0));
    context.fillStyle = gradient;
    context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }
}

function drawStains(
  context: CanvasRenderingContext2D,
  random: Random,
  density: number,
): void {
  const count = scaleCount(SET_IN_GRIME.STAINS, density);

  for (let index = 0; index < count; index++) {
    const x = random.between(70, LAYOUT.PHOTO.WIDTH - 70);
    const y = random.between(70, LAYOUT.PHOTO.HEIGHT - 70);
    const radius = random.realInRange(22, 65);
    const alpha = random.realInRange(0.12, 0.28);
    const squash = random.realInRange(0.72, 1.28);

    context.save();
    context.translate(x, y);
    context.scale(squash, 1);

    const wash = context.createRadialGradient(0, 0, 0, 0, 0, radius);
    wash.addColorStop(0, rgba(96, 64, 32, 0.08));
    wash.addColorStop(0.72, rgba(96, 64, 32, 0.14));
    wash.addColorStop(1, rgba(96, 64, 32, 0));
    context.fillStyle = wash;
    context.beginPath();
    context.arc(0, 0, radius, 0, Math.PI * 2);
    context.fill();

    context.strokeStyle = rgba(102, 69, 32, alpha);
    context.lineWidth = random.realInRange(1, 2.6);
    context.beginPath();
    context.arc(0, 0, radius, 0, Math.PI * 2);
    context.stroke();

    context.strokeStyle = rgba(102, 69, 32, alpha * 0.45);
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
  density: number,
): void {
  context.lineCap = 'round';

  const count = scaleCount(SET_IN_GRIME.SCRATCHES, density);

  for (let index = 0; index < count; index++) {
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

    context.strokeStyle = rgba(58, 46, 31, alpha);
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

    context.strokeStyle = rgba(255, 246, 224, alpha + 0.12);
    context.lineWidth = Math.max(0.5, width * 0.75);
    context.beginPath();
    context.moveTo(startX, startY);
    context.quadraticCurveTo(controlX, controlY, endX, endY);
    context.stroke();
  }
}

function drawHairs(
  context: CanvasRenderingContext2D,
  random: Random,
  density: number,
): void {
  context.lineCap = 'round';

  const count = scaleCount(GRIME.HAIRS, density);

  for (let index = 0; index < count; index++) {
    const startX = random.between(0, LAYOUT.PHOTO.WIDTH);
    const startY = random.between(0, LAYOUT.PHOTO.HEIGHT);
    const endX = startX + random.realInRange(-120, 120);
    const endY = startY + random.realInRange(-120, 120);

    context.strokeStyle = rgba(48, 38, 25, random.realInRange(0.16, 0.33));
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

function drawCreases(
  context: CanvasRenderingContext2D,
  random: Random,
  density: number,
): void {
  const count = scaleCount(SET_IN_GRIME.CREASES, density);

  for (let index = 0; index < count; index++) {
    const x = random.between(
      LAYOUT.PHOTO.WIDTH * 0.2,
      LAYOUT.PHOTO.WIDTH * 0.8,
    );
    const drift = random.realInRange(-80, 80);
    const alpha = random.realInRange(0.1, 0.18);

    context.strokeStyle = rgba(60, 46, 28, alpha);
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

    context.strokeStyle = rgba(255, 242, 218, alpha * 0.7);
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

function drawFoxing(
  context: CanvasRenderingContext2D,
  random: Random,
  density: number,
): void {
  const count = scaleCount(SET_IN_GRIME.FOXING, density);

  for (let index = 0; index < count; index++) {
    const x = random.between(0, LAYOUT.PHOTO.WIDTH);
    const y = random.between(0, LAYOUT.PHOTO.HEIGHT);
    const radius = random.realInRange(0.5, 2.2);
    const alpha = random.realInRange(0.15, 0.4);
    context.fillStyle = rgba(105, 58, 26, alpha);
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
  }
}

function scaleCount(base: number, density: number): number {
  return Math.max(1, Math.round(base * density));
}

function clampChannel(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}
