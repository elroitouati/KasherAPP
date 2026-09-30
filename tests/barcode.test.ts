import { describe, expect, it } from 'vitest';

import { isValidBarcode, normalizeBarcode } from '../src/data/barcode';

describe('barcode', () => {
  it.each(['8000500310427', '3017620425035', '5449000054227', '96385074', '036000291452'])('%s is valid', (c) =>
    expect(isValidBarcode(c)).toBe(true),
  );
  it.each(['8000500310428', '12345', 'abc', '800050031042'])('%s is invalid', (c) => expect(isValidBarcode(c)).toBe(false));
  it('pads UPC-A to EAN-13', () => expect(normalizeBarcode('036000291452')).toBe('0036000291452'));
});
