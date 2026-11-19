import Phaser from 'phaser';

interface ParticleOptions {
  count: number;
  x: number;
  y: number;
  spreadX?: number;
  spreadY?: number;
  color?: number | ((index: number) => number);
  radiusRange?: [number, number];
  alphaRange?: [number, number];
  durationRange?: [number, number];
  delayRange?: [number, number];
  driftXRange?: [number, number];
  driftYRange?: [number, number];
  ease?: string;
}

export function createParticles(
  scene: Phaser.Scene,
  {
    count,
    x,
    y,
    spreadX = 30,
    spreadY = 30,
    color = 0xc8a566,
    radiusRange = [1, 3],
    alphaRange = [0.3, 0.8],
    durationRange = [700, 1400],
    delayRange = [0, 250],
    driftXRange = [-40, 40],
    driftYRange = [-110, -40],
    ease = 'Quad.easeOut',
  }: ParticleOptions,
): void {
  for (let index = 0; index < count; index++) {
    const particleColor = typeof color === 'function' ? color(index) : color;

    const particle = scene.add.circle(
      Phaser.Math.Between(x - spreadX, x + spreadX),
      Phaser.Math.Between(y - spreadY, y + spreadY),
      Phaser.Math.FloatBetween(radiusRange[0], radiusRange[1]),
      particleColor,
      Phaser.Math.FloatBetween(alphaRange[0], alphaRange[1]),
    );

    scene.tweens.add({
      targets: particle,
      alpha: 0,
      x: particle.x + Phaser.Math.Between(driftXRange[0], driftXRange[1]),
      y: particle.y + Phaser.Math.Between(driftYRange[0], driftYRange[1]),
      duration: Phaser.Math.Between(durationRange[0], durationRange[1]),
      delay: Phaser.Math.Between(delayRange[0], delayRange[1]),
      ease,
      onComplete: () => {
        particle.destroy();
      },
    });
  }
}
