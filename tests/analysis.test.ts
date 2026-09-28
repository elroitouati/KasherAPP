import { describe, expect, it } from 'vitest';
import {
  StabilityTracker,
  findIngredientsHeader,
  hasIngredientsHeader,
  pickBestReading,
  textSimilarity,
} from '../src/scanner/analysis';

const LABEL =
  'INGREDIENTI: farina di grano tenero, zucchero, burro, uova, sale, agenti lievitanti';

describe('ingredient header detection', () => {
  it.each([
    'INGREDIENTI: farina',
    'Ingredients: sugar',
    'Zutaten: Zucker',
    'Ingrédients : sucre',
    'רכיבים: סוכר',
  ])('finds %s', (t) => expect(hasIngredientsHeader(t)).toBe(true));

  it('does not fire on unrelated text', () => {
    expect(hasIngredientsHeader('Valori nutrizionali per 100 g')).toBe(false);
  });

  it('returns the header offset', () => {
    expect(findIngredientsHeader('Biscotti. INGREDIENTI: farina')).toBe(10);
  });
});

describe('textSimilarity', () => {
  it('is 1 for identical text and tolerant to OCR noise', () => {
    expect(textSimilarity(LABEL, LABEL)).toBe(1);
    expect(textSimilarity(LABEL, LABEL.replace('zucchero', 'zucchcro'))).toBeGreaterThan(0.8);
  });
  it('is low for different text', () => {
    expect(textSimilarity(LABEL, 'Valori nutrizionali energia grassi')).toBeLessThan(0.2);
  });
});

describe('StabilityTracker', () => {
  const read = (text: string, at: number, lineHeightRatio: number | null = 0.03) => ({
    text,
    at,
    lineHeightRatio,
  });

  it('asks to point at a label when nothing is read', () => {
    const t = new StabilityTracker();
    expect(t.push(read('', 0)).guidance).toBe('point');
  });

  it('asks to get closer for small text', () => {
    const t = new StabilityTracker();
    expect(t.push(read(LABEL, 0, 0.005)).guidance).toBe('closer');
    expect(t.push(read('INGR farina', 0)).guidance).toBe('closer');
  });

  it('asks to hold steady while text changes, then counts down to capture', () => {
    const t = new StabilityTracker({ captureAfterMs: 1200, lockAfterMs: 500 });
    expect(t.push(read(LABEL, 0)).guidance).toBe('steady');
    const mid = t.push(read(LABEL, 600));
    expect(mid.guidance).toBe('focusing');
    expect(mid.locked).toBe(true);
    expect(mid.progress).toBeCloseTo(0.5);
    const done = t.push(read(LABEL, 1300));
    expect(done.guidance).toBe('ready');
    expect(done.progress).toBe(1);
  });

  it('restarts the countdown when the view jumps', () => {
    const t = new StabilityTracker();
    t.push(read(LABEL, 0));
    t.push(read(LABEL, 900));
    const s = t.push(read('Valori nutrizionali medi per 100 g energia grassi carboidrati', 1000));
    expect(s.guidance).toBe('steady');
    expect(s.progress).toBe(0);
  });

  it('never auto-captures steady text without an ingredient list', () => {
    const t = new StabilityTracker();
    const text = 'Valori nutrizionali medi per 100 g energia grassi carboidrati proteine';
    t.push(read(text, 0));
    const s = t.push(read(text, 5000));
    expect(s.guidance).toBe('find-ingredients');
    expect(s.locked).toBe(true);
    expect(s.progress).toBe(0);
  });
});

describe('pickBestReading (rotated photos)', () => {
  it('prefers the orientation that found the ingredient list', () => {
    const best = pickBestReading([
      { orientation: 'portrait', text: 'l1 ||| ;:' },
      { orientation: 'landscapeRight', text: LABEL },
      { orientation: 'landscapeLeft', text: 'lorem ipsum dolor sit amet consectetur adipiscing' },
    ]);
    expect(best?.orientation).toBe('landscapeRight');
  });
});
