/**
 * Design tokens — taken from the logo: deep navy, white, scan-corner green.
 * Navy is the ground, green is the one action colour; beyond that the only
 * saturated colour on screen is the risk scale. Every colour, size and duration in the app comes from here.
 */
export const color = {
  /** Deep navy from the bottom of the logo. */
  bg: '#041A4E',
  /** Lighter navy from the logo's top-left highlight — used for the hero glow only. */
  bgGlow: '#0B4AA6',
  surface1: 'rgba(255,255,255,0.06)',
  surface2: 'rgba(255,255,255,0.10)',
  surfaceScrim: 'rgba(4,26,78,0.78)',
  border: 'rgba(255,255,255,0.12)',
  borderStrong: 'rgba(255,255,255,0.20)',
  text1: '#F4F7FC',
  text2: 'rgba(244,247,252,0.74)',
  text3: 'rgba(244,247,252,0.50)',
  /** Frame corners while searching — deliberately colourless. */
  idle: 'rgba(244,247,252,0.85)',
  /** Brand green — the scan-corner green of the logo. Primary action + "locked". */
  brand: '#5FE36A',
  /** Text on brand green. */
  onBrand: '#041A4E',
} as const;

/** Risk scale 0–4. Index = level. Green → red, tuned for dark backgrounds. */
export const risk = ['#34C77B', '#A3D14B', '#F2C230', '#F28A2E', '#EF4A52'] as const;
export type RiskLevel = 0 | 1 | 2 | 3 | 4;

/** Colour used when the scanner is locked on steady text — the logo's scan-corner green. */
export const locked = color.brand;

export const font = {
  regular: 'Heebo_400Regular',
  bold: 'Heebo_700Bold',
  black: 'Heebo_800ExtraBold',
} as const;

/** Type scale (px). Hebrew body never below 16. */
export const size = { xs: 13, sm: 15, body: 16, lg: 20, xl: 24, xxl: 32, hero: 44 } as const;

export const space = { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48 } as const;

export const radius = { sm: 8, md: 12, lg: 20, xl: 24, pill: 999 } as const;

export const motion = { press: 140, fade: 220, sheet: 320 } as const;

/** Minimum touch target (Android). */
export const hit = 48;
