/**
 * Kashrut scanning engine (animal origin only).
 *
 *   scanIngredients(text)  – treat `text` as an ingredient list → level 0–4
 *   analyzeLabel(ocrText)  – full label: finds the ingredient list, separates
 *                            "may contain" traces, applies the accuracy rules
 *                            (no list → undetermined, cut-off list → ≥2)
 *
 * The final level is the highest level of a real ingredient. Traces never count.
 * Meat + milk only adds a note.
 */
import {
  DAIRY_TERMS,
  DICT,
  KOSHER_MEAT_TERMS,
  LEVEL_NAMES,
  NEGATION_AFTER,
  NEGATION_BEFORE,
  TRACE_MARKERS,
  type Entry,
  type RiskLevel,
} from './dict';
import { normalize, normalizeTerm, originalSlice, type Normalized } from './normalize';

export type { RiskLevel } from './dict';
export { LEVEL_NAMES } from './dict';

export type Finding = {
  entryId: string;
  level: RiskLevel;
  /** Hebrew explanation. */
  reason: string;
  /** The word(s) exactly as printed on the label. */
  term: string;
  /** Range in the original text. */
  start: number;
  end: number;
  /** Inside a "may contain" / traces statement. */
  trace: boolean;
};

export type ScanResult = {
  level: RiskLevel;
  /** Real ingredients only, highest level first. */
  findings: Finding[];
  /** Hits inside "may contain" statements — shown separately, never counted. */
  traces: Finding[];
  notes: string[];
};

export type LabelStatus =
  | 'ok'
  /** No ingredient list found. `level` is null unless something was flagged anyway. */
  | 'no-ingredients'
  /** The list looks cut off or unreadable — level raised to at least 2. */
  | 'incomplete';

export type LabelResult = Omit<ScanResult, 'level'> & {
  status: LabelStatus;
  /** null = cannot determine (never "clean" on text we didn't read). */
  level: RiskLevel | null;
  /** The ingredient list as read (original text), or the whole text if no header. */
  ingredientsText: string;
  /** Offset of `ingredientsText` in the analysed text. */
  ingredientsOffset: number;
};

export const MEAT_AND_MILK_NOTE = 'המוצר מכיל בשר וחלב יחד (לידיעה בלבד — לא משנה את הרמה)';

// ── Compilation ──────────────────────────────────────────────────────────────

type Compiled = { entry: Entry; re: RegExp };

const HEBREW = /[֐-׿]/u;
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function compileTerm(raw: string): RegExp {
  const words = normalizeTerm(raw).split(' ');
  const body = words
    .map((w) => {
      const lead = w.startsWith('*');
      const trail = w.endsWith('*');
      const core = w.replace(/^\*|\*$/g, '');
      return `${lead ? '\\p{L}*' : ''}${esc(core)}${trail ? '\\p{L}*' : ''}`;
    })
    .join('[\\s-]+');
  // Hebrew: allow attached prefixes (ו/ה/ב/ל/מ/ש/כ) — "וג'לטין", "משומן".
  const prefix = HEBREW.test(raw) ? '(?:[ובהלמשכ]{1,2})?' : '';
  return new RegExp(`(?<![\\p{L}\\p{N}])${prefix}${body}(?![\\p{L}\\p{N}])`, 'gu');
}

const COMPILED: Compiled[] = DICT.flatMap((entry) =>
  Object.values(entry.terms)
    .flat()
    .map((t) => ({ entry, re: compileTerm(t as string) })),
);
const DAIRY_RE = DAIRY_TERMS.map(compileTerm);
const KOSHER_MEAT_RE = KOSHER_MEAT_TERMS.map(compileTerm);
const TRACE_RE = TRACE_MARKERS.map(compileTerm);

// ── Helpers ──────────────────────────────────────────────────────────────────

type Range = { start: number; end: number };

/** Segment = one ingredient: split on , ; : and sentence-ending dots. Brackets stay inside. */
function segmentAt(text: string, pos: number): Range {
  const isBreak = (i: number) => {
    const c = text[i];
    if (c === ',' || c === ';' || c === ':') return true;
    if (c === '.') return i + 1 >= text.length || text[i + 1] === ' ';
    return false;
  };
  let s = pos;
  while (s > 0 && !isBreak(s - 1)) s--;
  let e = pos;
  while (e < text.length && !isBreak(e)) e++;
  return { start: s, end: e };
}

/** Words after a hit, up to the next conjunction ("gelatina bovina e suina" → "bovina"). */
const CONJUNCTION = /\s(?:e|ed|and|und|et|y|o|or|oder|ou|ו)\s/u;

function contextOf(text: string, start: number, end: number) {
  const seg = segmentAt(text, start);
  let after = text.slice(end, Math.min(seg.end, end + 40));
  const conj = CONJUNCTION.exec(after);
  if (conj) after = after.slice(0, conj.index);
  const beforeAll = text.slice(seg.start, start);
  // Only the single word directly before (adjective-first: "beef gelatin", "turkey ham").
  const prevWord = /(\S+)\s*$/u.exec(beforeAll)?.[1] ?? '';
  const negationWindow = beforeAll.slice(-24);
  let ws = start;
  while (ws > 0 && /\p{L}/u.test(text[ws - 1])) ws--;
  let we = end;
  while (we < text.length && /\p{L}/u.test(text[we])) we++;
  return { after, prevWord, negationWindow, word: text.slice(ws, we) };
}

function traceRanges(text: string): Range[] {
  const out: Range[] = [];
  for (const re of TRACE_RE) {
    re.lastIndex = 0;
    for (let m = re.exec(text); m; m = re.exec(text)) {
      let e = m.index + m[0].length;
      while (e < text.length && !(text[e] === '.' && (e + 1 >= text.length || text[e + 1] === ' '))) e++;
      out.push({ start: m.index, end: e });
    }
  }
  return out;
}

const within = (r: Range, outer: Range) => r.start >= outer.start && r.end <= outer.end;
const overlaps = (a: Range, b: Range) => a.start < b.end && b.start < a.end;

function matchAll(re: RegExp, text: string): Range[] {
  const out: Range[] = [];
  re.lastIndex = 0;
  for (let m = re.exec(text); m; m = re.exec(text)) out.push({ start: m.index, end: m.index + m[0].length });
  return out;
}

// ── Scanning ─────────────────────────────────────────────────────────────────

type RawHit = Range & { entry: Entry; level: RiskLevel; reason: string };

function rawHits(n: Normalized): { hits: RawHit[]; safe: Range[] } {
  const text = n.text;
  const hits: RawHit[] = [];
  const safe: Range[] = [];

  for (const { entry, re } of COMPILED) {
    for (const r of matchAll(re, text)) {
      if (entry.level === 0) {
        safe.push(r);
        continue;
      }
      const ctx = contextOf(text, r.start, r.end);
      if (NEGATION_BEFORE.test(ctx.negationWindow) || NEGATION_AFTER.test(ctx.after)) continue;

      let level: RiskLevel | null = entry.level;
      let reason = entry.reason;
      for (const q of entry.qualifiers ?? []) {
        if (q.re.test(ctx.after) || q.re.test(ctx.prevWord) || q.re.test(ctx.word)) {
          level = q.level;
          reason = q.reason ?? entry.reason;
          break;
        }
      }
      if (level == null || level === 0) continue;
      hits.push({ ...r, entry, level, reason });
    }
  }
  return { hits, safe };
}

/**
 * Resolve overlapping hits:
 *  1. the most specific phrase wins — a hit inside a longer hit is dropped
 *     ("pesce spada" beats "pesce", "gelatina di pesce" beats "pesce");
 *  2. for partial overlaps the higher level wins.
 */
function dedupe(hits: RawHit[]): RawHit[] {
  const covered = (h: RawHit) =>
    hits.some((o) => o !== h && o.start <= h.start && o.end >= h.end && o.end - o.start > h.end - h.start);
  const specific = hits.filter((h) => !covered(h));
  const sorted = [...specific].sort((a, b) => b.level - a.level || b.end - b.start - (a.end - a.start));
  const kept: RawHit[] = [];
  for (const h of sorted) {
    if (!kept.some((k) => overlaps(k, h))) kept.push(h);
  }
  return kept;
}

function scanNormalized(n: Normalized, range: Range = { start: 0, end: n.text.length }): ScanResult {
  const { hits, safe } = rawHits(n);
  const traces = traceRanges(n.text);
  const inRange = (r: Range) => r.start >= range.start && r.end <= range.end;

  const kept = dedupe(hits.filter((h) => inRange(h) && !safe.some((s) => within(h, s))));
  const toFinding = (h: RawHit): Finding => ({
    entryId: h.entry.id,
    level: h.level,
    reason: h.reason,
    term: originalSlice(n, h.start, h.end),
    start: n.map[h.start],
    end: n.map[h.end - 1] + 1,
    trace: traces.some((t) => within(h, t)),
  });

  const all = kept.map(toFinding).sort((a, b) => b.level - a.level || a.start - b.start);
  const findings = all.filter((f) => !f.trace);
  const traceFindings = all.filter((f) => f.trace);
  const level = findings.reduce<RiskLevel>((m, f) => (f.level > m ? f.level : m), 0);

  // Meat + milk note (real ingredients only, never changes the level).
  const outsideTraces = (r: Range) => inRange(r) && !traces.some((t) => within(r, t)) && !safe.some((s) => within(r, s));
  const hasDairy = DAIRY_RE.some((re) => matchAll(re, n.text).some(outsideTraces));
  const hasMeat =
    KOSHER_MEAT_RE.some((re) => matchAll(re, n.text).some(outsideTraces)) ||
    findings.some((f) => f.entryId === 'meat-unspecified' || f.entryId === 'sausage');
  const notes = hasDairy && hasMeat ? [MEAT_AND_MILK_NOTE] : [];

  return { level, findings, traces: traceFindings, notes };
}

/** Scan text that is (only) an ingredient list. */
export function scanIngredients(text: string): ScanResult {
  return scanNormalized(normalize(text));
}

// ── Whole-label analysis ─────────────────────────────────────────────────────

/** Headers that open an ingredient list. Runs on the original (un-normalised) OCR text. */
const INGREDIENT_HEADER =
  /(^|[^\p{L}])(ingredienti|ingredients?|zutaten|ingr[ée]dients|ingredientes|ingredi[ëe]nten|sk[łl]adniki|složení|zloženie|összetevők)(?![\p{L}])|רכיבים/iu;

export function findIngredientsHeader(text: string): number {
  const m = INGREDIENT_HEADER.exec(text);
  if (!m) return -1;
  return m.index + (m[1]?.length ?? 0);
}

/** Where the ingredient list ends: nutrition table, storage, best-before, net weight… */
const LIST_END =
  /valori nutrizionali|dichiarazione nutrizionale|informazioni nutrizionali|nutrition(?:al)? (?:facts|information|declaration)|typical values|nährwert|nahrwert|valeurs nutritionnelles|déclaration nutritionnelle|información nutricional|informacion nutricional|valores nutricionales|ערכים תזונתיים|ערך תזונתי|conservare|da consumarsi|store in|keep refrigerated|best before|kühl lagern|mindestens haltbar|à conserver|a conserver|à consommer|conservar en|consumir preferentemente|peso netto|net weight|nettogewicht|poids net|peso neto/iu;

export function analyzeLabel(ocrText: string): LabelResult {
  const header = findIngredientsHeader(ocrText);

  if (header === -1) {
    const scan = scanIngredients(ocrText);
    const flagged = scan.findings.length > 0;
    return {
      ...scan,
      status: 'no-ingredients',
      // Something non-kosher is printed (e.g. "prosciutto" on the front) — report it; otherwise undetermined.
      level: flagged ? scan.level : null,
      ingredientsText: ocrText,
      ingredientsOffset: 0,
    };
  }

  // Ingredient list: from the header to the first end marker (or the end of the text).
  const afterHeader = ocrText.slice(header);
  const endMatch = LIST_END.exec(afterHeader.slice(5));
  const listEnd = endMatch ? header + 5 + endMatch.index : ocrText.length;
  const ingredientsText = ocrText.slice(header, listEnd);

  const scan = scanIngredients(ingredientsText);
  const findings = scan.findings.map((f) => ({ ...f, start: f.start + header, end: f.end + header }));
  const traces = scan.traces.map((f) => ({ ...f, start: f.start + header, end: f.end + header }));

  const complete = isListComplete(ingredientsText, endMatch != null);
  const level: RiskLevel = complete ? scan.level : (Math.max(scan.level, 2) as RiskLevel);

  return {
    level,
    findings,
    traces,
    notes: scan.notes,
    status: complete ? 'ok' : 'incomplete',
    ingredientsText,
    ingredientsOffset: header,
  };
}

/**
 * Heuristic: is the ingredient list fully in view? A list is complete when it
 * is followed by another label section, or ends a sentence / a traces
 * statement, with balanced brackets and enough text after the header.
 */
export function isListComplete(list: string, followedByOtherSection: boolean): boolean {
  const body = list.replace(INGREDIENT_HEADER, '').trim();
  const letters = (body.match(/\p{L}/gu) ?? []).length;
  if (letters < 12) return false;
  const open = (body.match(/[([]/g) ?? []).length;
  const close = (body.match(/[)\]]/g) ?? []).length;
  if (open > close) return false;
  if (followedByOtherSection) return true;
  if (/[.!]\s*$/.test(body)) return true;
  // A list that runs into a traces statement ("… Può contenere latte") ended on its own.
  const n = normalize(body).text;
  return TRACE_RE.some((re) => {
    re.lastIndex = 0;
    return re.test(n);
  });
}

/** Hebrew one-liner for the result: why this level. */
export function summarize(r: { level: RiskLevel | null; status: LabelStatus; findings: Finding[] }): string {
  if (r.level == null) return 'לא נמצאה רשימת רכיבים — צלם אותה כדי לקבוע';
  const top = r.findings[0];
  if (top) return `${top.reason} (${top.term})`;
  if (r.status === 'incomplete') return 'חלק מרשימת הרכיבים לא נקרא — צלם את ההמשך';
  return 'לא נמצאו רכיבים מבעלי חיים לא כשרים';
}

export function levelName(level: RiskLevel | null): string {
  return level == null ? 'לא ניתן לקבוע' : LEVEL_NAMES[level];
}
