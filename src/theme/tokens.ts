/**
 * Design tokens — "instrument" direction.
 * The UI itself is neutral graphite; the only saturated colour on screen is the
 * risk scale. Every colour, size and duration in the app comes from here.
 */
export const color = {
  bg: '#0B0D12',
  surface1: 'rgba(255,255,255,0.04)',
  surface2: 'rgba(255,255,255,0.07)',
  surfaceScrim: 'rgba(11,13,18,0.72)',
  border: 'rgba(255,255,255,0.10)',
  borderStrong: 'rgba(255,255,255,0.16)',
  text1: '#F4F6F8',
  text2: 'rgba(244,246,248,0.68)',
  text3: 'rgba(244,246,248,0.44)',
  /** Frame corners while searching — deliberately colourless. */
  idle: 'rgba(244,246,248,0.85)',
} as const;

/** Risk scale 0–4. Index = level. Green → red, tuned for dark backgrounds. */
export const risk = ['#34C77B', '#A3D14B', '#F2C230', '#F28A2E', '#EF4A52'] as const;
export type RiskLevel = 0 | 1 | 2 | 3 | 4;

/** Colour used when the scanner is locked on steady text. */
export const locked = risk[0];

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
