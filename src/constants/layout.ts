export const GAME = {
  WIDTH: 1024,
  HEIGHT: 768,
} as const;

export const COVER = {
  WIDTH: 1280,
  HEIGHT: 720,
  FRAME_X: 400,
  FRAME_Y: 360,
  FRAME_BORDER: 28,
  TITLE_X: 800,
  TITLE_Y: 272,
} as const;

export const PHOTO = {
  X: 392,
  Y: 400,
  WIDTH: 640,
  HEIGHT: 570,
  BORDER: 16,
} as const;

export const HUD = {
  X: 760,
  Y: 100,
  WIDTH: 232,
  HEIGHT: 600,
  PADDING: 20,
  CONTENT_X: 780,
  CONTENT_Y: 120,
  CONTENT_WIDTH: 192,
} as const;

export const COLOR_SLIDER = {
  TEMPERATURE_Y: 324,
  TINT_Y: 396,
  TRACK_HEIGHT: 6,
  HIT_HEIGHT: 40,
  KNOB_WIDTH: 12,
  KNOB_HEIGHT: 26,
} as const;
