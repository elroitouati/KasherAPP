import { describe, expect, it } from 'vitest';

import { parseProduct, type Product } from '../src/data/off';
import { analyzeProduct, tagsToText } from '../src/kashrut/product';
import { EXPLAIN } from '../src/kashrut/explain';
import { DICT } from '../src/kashrut/dict';

const product = (over: Partial<Product>): Product => ({
  code: '1',
  name: 'x',
  texts: [],
  tags: [],
  analysis: [],
  fetchedAt: 0,
  ...over,
});

describe('analyzeProduct', () => {
  it('takes the highest level across all language versions', () => {
    const r = analyzeProduct(
      product({
        texts: [
          { lang: 'it', text: 'zucchero, gelatina bovina' },
          { lang: 'en', text: 'sugar, pork gelatine' },
        ],
      }),
    );
    expect(r.level).toBe(4);
    expect(r.status).toBe('ok');
    expect(r.text).toBe('zucchero, gelatina bovina');
    expect(r.textFindings.map((f) => f.term)).toEqual(['gelatina']);
  });

  it('reads canonical tags from offline packs', () => {
    expect(tagsToText(['en:sugar', 'en:pork-gelatin'])).toBe('sugar, pork gelatin');
    const r = analyzeProduct(product({ tags: ['en:sugar', 'en:pork-gelatin', 'it:strutto'] }));
    expect(r.level).toBe(4);
    expect(r.status).toBe('tags-only');
  });

  it('no ingredient data → cannot determine (unless tagged vegan)', () => {
    expect(analyzeProduct(product({})).level).toBeNull();
    expect(analyzeProduct(product({ analysis: ['en:vegan'] })).level).toBe(0);
  });

  it('dedupes the same finding from several languages', () => {
    const r = analyzeProduct(
      product({ texts: [{ lang: 'it', text: 'surimi, sale' }, { lang: 'en', text: 'surimi, salt' }] }),
    );
    expect(r.findings).toHaveLength(1);
  });
});

describe('parseProduct', () => {
  it('puts the product-language list first and drops duplicates', () => {
    const p = parseProduct(
      {
        lang: 'it',
        product_name: 'Biscotti',
        ingredients_text: 'farina, strutto',
        ingredients_text_it: 'farina, strutto',
        ingredients_text_en: 'flour, lard',
        ingredients_tags: ['en:flour'],
      },
      '800',
    );
    expect(p.texts).toEqual([
      { lang: 'it', text: 'farina, strutto' },
      { lang: 'en', text: 'flour, lard' },
    ]);
    expect(p.name).toBe('Biscotti');
  });
});

describe('explanations', () => {
  it('every flagged dictionary entry has an explanation', () => {
    const missing = DICT.filter((e) => e.level > 0 && !EXPLAIN[e.id]).map((e) => e.id);
    expect(missing).toEqual([]);
  });
});
