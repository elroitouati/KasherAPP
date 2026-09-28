/**
 * Text normalisation for matching, with an index map back to the original
 * label text so every finding can quote the exact word printed on the pack.
 *
 *  - lower-case, accents stripped (gélatine → gelatine, würstel → wurstel)
 *  - ß → ss, œ → oe, æ → ae, Hebrew geresh/gershayim and curly quotes → ' "
 *  - E-numbers collapsed: "E 471", "E-471", "e471" → "e471"
 *  - runs of whitespace (incl. newlines) → one space
 */

export type Normalized = {
  /** Normalised text used for matching. */
  text: string;
  /** map[i] = index in the original string of normalised char i. */
  map: number[];
  /** The original string. */
  source: string;
};

const SPECIAL: Record<string, string> = {
  ß: 'ss',
  œ: 'oe',
  æ: 'ae',
  ø: 'o',
  ł: 'l',
  đ: 'd',
  ı: 'i',
  '׳': "'",
  '’': "'",
  '‘': "'",
  '`': "'",
  '´': "'",
  '״': '"',
  '“': '"',
  '”': '"',
  '–': '-',
  '—': '-',
  '‐': '-',
};

function foldChar(ch: string): string {
  const lower = ch.toLowerCase();
  if (SPECIAL[lower] != null) return SPECIAL[lower];
  // Strip combining marks (accents, Hebrew niqqud).
  return lower.normalize('NFD').replace(/[̀-֑ͯ-ׇ]/g, '');
}

export function normalize(source: string): Normalized {
  let text = '';
  const map: number[] = [];
  let lastWasSpace = true;

  for (let i = 0; i < source.length; i++) {
    const folded = foldChar(source[i]);
    for (const c of folded) {
      if (/\s/.test(c)) {
        if (lastWasSpace) continue;
        text += ' ';
        map.push(i);
        lastWasSpace = true;
      } else {
        text += c;
        map.push(i);
        lastWasSpace = false;
      }
    }
  }
  // Trim trailing space.
  if (text.endsWith(' ')) {
    text = text.slice(0, -1);
    map.pop();
  }

  // Collapse E-numbers: "e 471" / "e-471" → "e471".
  const collapsed = collapseENumbers(text, map);
  return { text: collapsed.text, map: collapsed.map, source };
}

function collapseENumbers(text: string, map: number[]): { text: string; map: number[] } {
  const re = /(?<![\p{L}\p{N}])e[ -]{1,2}(?=\d{3,4}[a-z]?(?![\p{L}\p{N}]))/gu;
  let out = '';
  const outMap: number[] = [];
  let last = 0;
  for (let m = re.exec(text); m != null; m = re.exec(text)) {
    out += text.slice(last, m.index) + 'e';
    outMap.push(...map.slice(last, m.index), map[m.index]);
    last = m.index + m[0].length;
  }
  out += text.slice(last);
  outMap.push(...map.slice(last));
  return { text: out, map: outMap };
}

/** Normalise a dictionary term the same way as label text (no index map needed). */
export function normalizeTerm(term: string): string {
  return normalize(term).text;
}

/** Original label text for a normalised [start, end) range. */
export function originalSlice(n: Normalized, start: number, end: number): string {
  if (start >= end || start >= n.map.length) return '';
  const from = n.map[start];
  const to = n.map[Math.min(end, n.map.length) - 1] + 1;
  return n.source.slice(from, to);
}
