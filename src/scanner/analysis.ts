/**
 * Pure helpers for the live scanner: ingredient-list detection, frame-to-frame
 * text stability and the guidance message shown to the user.
 * No React / native imports here — everything is unit-tested with vitest.
 */

import { findIngredientsHeader } from '../kashrut/engine';

export { findIngredientsHeader };

export function normalizeOcr(text: string): string {
  return text.replace(/[ \t]+/g, ' ').replace(/\s*\n\s*/g, '\n').trim();
}

export function hasIngredientsHeader(text: string): boolean {
  return findIngredientsHeader(text) !== -1;
}

export function letterCount(text: string): number {
  const m = text.match(/\p{L}/gu);
  return m ? m.length : 0;
}

function tokens(text: string): Set<string> {
  const out = new Set<string>();
  for (const w of text.toLowerCase().split(/[^\p{L}\p{N}]+/u)) {
    if (w.length >= 2) out.add(w);
  }
  return out;
}

/** Jaccard similarity of the word sets of two OCR readings (0..1). */
export function textSimilarity(a: string, b: string): number {
  const ta = tokens(a);
  const tb = tokens(b);
  if (ta.size === 0 && tb.size === 0) return 1;
  if (ta.size === 0 || tb.size === 0) return 0;
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter++;
  return inter / (ta.size + tb.size - inter);
}

export type Guidance =
  | 'point' // no text in view
  | 'closer' // text too small / too little
  | 'steady' // text is changing between frames
  | 'find-ingredients' // steady text, but no ingredient header
  | 'focusing' // steady on an ingredient list, counting down to capture
  | 'ready'; // stable long enough → capture

export const GUIDANCE_TEXT: Record<Guidance, string> = {
  point: 'כוון את המצלמה לרשימת הרכיבים',
  closer: 'קרב את הטלפון',
  steady: 'תחזיק יציב',
  'find-ingredients': 'לא רואה רשימת רכיבים — הזז את המצלמה',
  focusing: 'מתמקד…',
  ready: 'מצלם…',
};

export type FrameReading = {
  text: string;
  /** Median OCR line height divided by the long side of the frame, or null if unknown. */
  lineHeightRatio: number | null;
  /** Timestamp in ms. */
  at: number;
};

export type ScanState = {
  guidance: Guidance;
  /** 0..1 progress towards auto-capture (only moves while an ingredient list is steady). */
  progress: number;
  /** Text has stayed steady long enough to call the frame "locked". */
  locked: boolean;
  hasIngredients: boolean;
  text: string;
};

export type StabilityOptions = {
  /** How long an ingredient list must stay steady before auto-capture. */
  captureAfterMs: number;
  /** How long any text must stay steady before the frame turns green. */
  lockAfterMs: number;
  /** Minimum similarity between consecutive readings to count as steady. */
  minSimilarity: number;
  /** Below this many letters we ask the user to get closer. */
  minLetters: number;
  /** Below this line-height ratio the text is too small to read reliably. */
  minLineHeightRatio: number;
};

export const DEFAULT_STABILITY: StabilityOptions = {
  captureAfterMs: 1200,
  lockAfterMs: 300,
  minSimilarity: 0.6,
  minLetters: 24,
  minLineHeightRatio: 0.014,
};

const IDLE: ScanState = {
  guidance: 'point',
  progress: 0,
  locked: false,
  hasIngredients: false,
  text: '',
};

/**
 * Tracks consecutive OCR readings and decides when the view is steady enough
 * to auto-capture. Feed it one reading per OCR tick (~300ms).
 */
export class StabilityTracker {
  private prev: string | null = null;
  private steadySince: number | null = null;
  private opts: StabilityOptions;

  constructor(opts: Partial<StabilityOptions> = {}) {
    this.opts = { ...DEFAULT_STABILITY, ...opts };
  }

  reset(): void {
    this.prev = null;
    this.steadySince = null;
  }

  push(r: FrameReading): ScanState {
    const text = normalizeOcr(r.text);
    const letters = letterCount(text);
    const hasIngredients = hasIngredientsHeader(text);

    if (letters < 4) {
      this.reset();
      return { ...IDLE, text };
    }

    const tooSmall = r.lineHeightRatio != null && r.lineHeightRatio < this.opts.minLineHeightRatio;
    if (letters < this.opts.minLetters || tooSmall) {
      this.prev = text;
      this.steadySince = null;
      return { guidance: 'closer', progress: 0, locked: false, hasIngredients, text };
    }

    const similar = this.prev != null && textSimilarity(this.prev, text) >= this.opts.minSimilarity;
    this.prev = text;
    if (!similar || this.steadySince == null) {
      this.steadySince = r.at;
      return { guidance: 'steady', progress: 0, locked: false, hasIngredients, text };
    }

    const elapsed = r.at - this.steadySince;
    const locked = elapsed >= this.opts.lockAfterMs;
    if (!hasIngredients) {
      return { guidance: 'find-ingredients', progress: 0, locked, hasIngredients, text };
    }
    const progress = Math.min(1, elapsed / this.opts.captureAfterMs);
    return {
      guidance: progress >= 1 ? 'ready' : 'focusing',
      progress,
      locked,
      hasIngredients,
      text,
    };
  }
}

/** Score an OCR reading: an ingredient header wins, then the amount of text read. */
export function scoreReading(text: string): number {
  return (hasIngredientsHeader(text) ? 10_000 : 0) + letterCount(text);
}

/** Pick the best of several OCR attempts (e.g. the same photo at 0°/90°/270°). */
export function pickBestReading<T extends { text: string }>(readings: T[]): T | null {
  let best: T | null = null;
  let bestScore = -1;
  for (const r of readings) {
    const s = scoreReading(r.text);
    if (s > bestScore) {
      best = r;
      bestScore = s;
    }
  }
  return best;
}
