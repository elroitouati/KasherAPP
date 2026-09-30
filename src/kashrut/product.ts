/**
 * Verdict for a product from the barcode database. Every language version of
 * the ingredient list is scanned and the highest level wins. Offline-pack
 * products carry only canonical English ingredient tags — those are scanned
 * as a list too, and marked as such.
 */
import type { Product } from '../data/off';
import { scanIngredients, type Finding, type RiskLevel } from './engine';

export type ProductVerdict = {
  /** null = no ingredient data — cannot determine. */
  level: RiskLevel | null;
  status: 'ok' | 'tags-only' | 'no-ingredients';
  findings: Finding[];
  traces: Finding[];
  notes: string[];
  /** The list shown to the user (product language), with its own highlight offsets. */
  text: string | null;
  textFindings: Finding[];
};

/** "en:pork-gelatin" → "pork gelatin" */
export function tagsToText(tags: string[]): string {
  return tags.map((t) => t.replace(/^[a-z]{2}:/, '').replace(/-/g, ' ')).join(', ');
}

const maxLevel = (fs: Finding[]) => fs.reduce<RiskLevel>((m, f) => (f.level > m ? f.level : m), 0);

function uniqueFindings(fs: Finding[]): Finding[] {
  const seen = new Set<string>();
  return fs
    .filter((f) => {
      const k = `${f.entryId}|${f.term.toLowerCase()}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .sort((a, b) => b.level - a.level);
}

export function analyzeProduct(p: Product): ProductVerdict {
  const vegan = p.analysis.includes('en:vegan');

  if (p.texts.length > 0) {
    const scans = p.texts.map((t) => scanIngredients(t.text));
    const findings = uniqueFindings(scans.flatMap((s) => s.findings));
    const traces = uniqueFindings(scans.flatMap((s) => s.traces));
    const notes = [...new Set(scans.flatMap((s) => s.notes))];
    const primary = scans[0];
    return {
      level: maxLevel(findings),
      status: 'ok',
      findings,
      traces,
      notes,
      text: p.texts[0].text,
      textFindings: [...primary.findings, ...primary.traces],
    };
  }

  if (p.tags.length > 0) {
    const s = scanIngredients(tagsToText(p.tags));
    return {
      level: s.findings.length === 0 && vegan ? 0 : s.level,
      status: 'tags-only',
      findings: s.findings,
      traces: s.traces,
      notes: s.notes,
      text: null,
      textFindings: [],
    };
  }

  return {
    level: vegan ? 0 : null,
    status: 'no-ingredients',
    findings: [],
    traces: [],
    notes: [],
    text: null,
    textFindings: [],
  };
}
