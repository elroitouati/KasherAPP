import { useEffect, useState } from 'react';

import { analyzeProduct, type ProductVerdict } from '../kashrut/product';
import { lookupProduct, type Lookup } from './store';

// Session memo so the live card and the details screen share one lookup.
const memo = new Map<string, Promise<Lookup>>();

function lookupOnce(code: string): Promise<Lookup> {
  let p = memo.get(code);
  if (!p) {
    p = lookupProduct(code);
    memo.set(code, p);
    // Don't memoise "offline" misses — retry next time.
    p.then((l) => {
      if (!l.product && l.offline) memo.delete(code);
    });
  }
  return p;
}

export type ProductState = { lookup: Lookup | null; verdict: ProductVerdict | null };

/** Look a barcode up once and analyse it. `lookup` is null while loading. */
export function useProduct(code: string): ProductState {
  const [lookup, setLookup] = useState<Lookup | null>(null);
  useEffect(() => {
    let alive = true;
    lookupOnce(code).then((l) => alive && setLookup(l));
    return () => {
      alive = false;
    };
  }, [code]);
  const verdict = lookup?.product ? analyzeProduct(lookup.product) : null;
  return { lookup, verdict };
}
