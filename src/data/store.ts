/**
 * Local storage: looked-up products (AsyncStorage) and per-country offline
 * packs (JSON files in the document directory).
 * Lookup order: device cache → online → offline pack.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { File, Paths } from 'expo-file-system';

import { fetchPopularProducts, fetchProduct, OfflineError, type Product } from './off';

export type ProductSource = 'online' | 'cache' | 'pack';
export type Lookup = { product: Product | null; source: ProductSource | null; offline: boolean };

const productKey = (code: string) => `product:${code}`;

async function readCache(code: string): Promise<Product | null> {
  try {
    const raw = await AsyncStorage.getItem(productKey(code));
    return raw ? (JSON.parse(raw) as Product) : null;
  } catch {
    return null;
  }
}

async function writeCache(p: Product): Promise<void> {
  try {
    await AsyncStorage.setItem(productKey(p.code), JSON.stringify(p));
  } catch {
    // Cache is best-effort.
  }
}

// ── Offline packs ────────────────────────────────────────────────────────────

export type PackInfo = { countryId: string; count: number; downloadedAt: number };
type PackFile = PackInfo & { products: Product[] };

const packFile = (countryId: string) => new File(Paths.document, `pack-${countryId}.json`);
const loaded = new Map<string, Map<string, Product>>();

async function loadPack(countryId: string): Promise<Map<string, Product> | null> {
  const hit = loaded.get(countryId);
  if (hit) return hit;
  try {
    const f = packFile(countryId);
    if (!f.exists) return null;
    const data = JSON.parse(await f.text()) as PackFile;
    const map = new Map(data.products.map((p) => [p.code, p]));
    loaded.set(countryId, map);
    return map;
  } catch {
    return null;
  }
}

export async function packInfo(countryId: string): Promise<PackInfo | null> {
  try {
    const f = packFile(countryId);
    if (!f.exists) return null;
    const data = JSON.parse(await f.text()) as PackFile;
    return { countryId: data.countryId, count: data.count, downloadedAt: data.downloadedAt };
  } catch {
    return null;
  }
}

export async function downloadPack(
  countryId: string,
  offTag: string,
  total: number,
  onProgress?: (done: number) => void,
): Promise<PackInfo> {
  const products = await fetchPopularProducts(offTag, total, onProgress);
  const info: PackInfo = { countryId, count: products.length, downloadedAt: Date.now() };
  const f = packFile(countryId);
  if (f.exists) f.delete();
  f.create();
  f.write(JSON.stringify({ ...info, products } satisfies PackFile));
  loaded.set(countryId, new Map(products.map((p) => [p.code, p])));
  return info;
}

export function deletePack(countryId: string): void {
  const f = packFile(countryId);
  if (f.exists) f.delete();
  loaded.delete(countryId);
}

const PACK_COUNTRIES = ['it', 'fr', 'de', 'es', 'gb', 'us'];

async function findInPacks(code: string): Promise<Product | null> {
  for (const c of PACK_COUNTRIES) {
    const p = (await loadPack(c))?.get(code);
    if (p) return p;
  }
  return null;
}

// ── Lookup ───────────────────────────────────────────────────────────────────

export async function lookupProduct(code: string): Promise<Lookup> {
  const cached = await readCache(code);
  if (cached) return { product: cached, source: 'cache', offline: false };
  try {
    const online = await fetchProduct(code);
    if (online) {
      await writeCache(online);
      return { product: online, source: 'online', offline: false };
    }
    const packed = await findInPacks(code);
    return { product: packed, source: packed ? 'pack' : null, offline: false };
  } catch (e) {
    const packed = await findInPacks(code);
    return { product: packed, source: packed ? 'pack' : null, offline: e instanceof OfflineError };
  }
}
