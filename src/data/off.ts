/**
 * Open Food Facts — open product database, looked up by barcode.
 * Data is crowd-sourced: we always tell the user it came from the database
 * and not from the label in their hand.
 */

export type ProductText = { lang: string; text: string };

export type Product = {
  code: string;
  name: string;
  brands?: string;
  image?: string;
  /** Full ingredient lists as printed, per language (online lookups only). */
  texts: ProductText[];
  /** Canonical ingredient tags ("en:pork-gelatin") — offline packs carry only these. */
  tags: string[];
  /** OFF analysis tags ("en:vegan", "en:non-vegan", …). */
  analysis: string[];
  fetchedAt: number;
};

const UA = 'KasherCheck/0.2 (Android; https://github.com/elroitouati/KasherAPP)';
const LANGS = ['he', 'it', 'en', 'fr', 'de', 'es'] as const;

export class OfflineError extends Error {
  constructor() {
    super('offline');
  }
}

async function getJson(url: string, timeoutMs: number): Promise<unknown> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' }, signal: ctrl.signal });
    if (!res.ok) throw new Error(`http-${res.status}`);
    return await res.json();
  } catch (e) {
    if (e instanceof Error && e.message.startsWith('http-')) throw e;
    throw new OfflineError();
  } finally {
    clearTimeout(timer);
  }
}

type RawProduct = Record<string, unknown>;

const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : undefined);
const strList = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);

export function parseProduct(raw: RawProduct, code: string): Product {
  const texts: ProductText[] = [];
  const seen = new Set<string>();
  const add = (lang: string, v: unknown) => {
    const t = str(v);
    if (t && !seen.has(t)) {
      seen.add(t);
      texts.push({ lang, text: t });
    }
  };
  // The product's own language first — that is what is printed on the pack.
  add(str(raw.lang) ?? 'xx', raw.ingredients_text);
  for (const l of LANGS) add(l, raw[`ingredients_text_${l}`]);

  const brands = Array.isArray(raw.brands) ? strList(raw.brands).join(', ') : str(raw.brands);
  return {
    code,
    name: str(raw.product_name_he) ?? str(raw.product_name) ?? str(raw.product_name_it) ?? str(raw.product_name_en) ?? '',
    brands,
    image: str(raw.image_front_small_url),
    texts,
    tags: strList(raw.ingredients_tags),
    analysis: strList(raw.ingredients_analysis_tags),
    fetchedAt: Date.now(),
  };
}

const PRODUCT_FIELDS = [
  'code',
  'product_name',
  'product_name_he',
  'product_name_it',
  'product_name_en',
  'brands',
  'image_front_small_url',
  'lang',
  'ingredients_text',
  ...LANGS.map((l) => `ingredients_text_${l}`),
  'ingredients_tags',
  'ingredients_analysis_tags',
].join(',');

/** null = not in the database. Throws OfflineError when there is no connection. */
export async function fetchProduct(code: string): Promise<Product | null> {
  const data = (await getJson(
    `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}?fields=${PRODUCT_FIELDS}`,
    9000,
  )) as { status?: number; product?: RawProduct };
  if (!data || data.status === 0 || !data.product) return null;
  return parseProduct(data.product, code);
}

/**
 * The most-scanned products sold in a country (for the offline pack).
 * Uses the OFF search service, which returns ingredient tags but not full text.
 */
export async function fetchPopularProducts(
  countryTag: string,
  total: number,
  onProgress?: (done: number) => void,
): Promise<Product[]> {
  const pageSize = 100;
  const pages = Math.ceil(total / pageSize);
  const fields = 'code,product_name,brands,lang,ingredients_tags,ingredients_analysis_tags';
  const out: Product[] = [];
  for (let page = 1; page <= pages; page++) {
    const q = encodeURIComponent(`countries_tags:"${countryTag}"`);
    const data = (await getJson(
      `https://search.openfoodfacts.org/search?q=${q}&sort_by=-unique_scans_n&page_size=${pageSize}&page=${page}&fields=${fields}`,
      20000,
    )) as { hits?: RawProduct[] };
    for (const h of data.hits ?? []) {
      const code = str(h.code);
      if (code) out.push(parseProduct(h, code));
    }
    onProgress?.(Math.min(out.length, total));
    if ((data.hits ?? []).length < pageSize) break;
  }
  return out.slice(0, total);
}
