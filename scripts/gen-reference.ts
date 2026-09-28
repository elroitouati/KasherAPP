/// <reference types="node" />
/**
 * Generates docs/ingredients-reference.md from the dictionary.
 * Run: npm run docs:dict
 */
import { writeFileSync } from 'node:fs';

import { DICT, LEVEL_NAMES, TRACE_MARKERS, type Lang } from '../src/kashrut/dict';

const LANGS: [Lang, string][] = [
  ['it', 'איטלקית'],
  ['en', 'אנגלית'],
  ['de', 'גרמנית'],
  ['fr', 'צרפתית'],
  ['es', 'ספרדית'],
  ['he', 'עברית'],
];

const lines: string[] = [];
let total = 0;
for (const e of DICT) for (const l of Object.values(e.terms)) total += (l as string[]).length;

lines.push('# מילון רכיבים — בודק כשרות', '');
lines.push('> קובץ זה נוצר אוטומטית מ-`src/kashrut/dict.ts` (`npm run docs:dict`). אל תערוך ידנית.', '');
lines.push(`**${DICT.length} קבוצות · ${total} מונחים · 6 שפות**`, '');
lines.push('## הסטנדרט', '');
lines.push('כשרות לפי מקור החי בלבד. מסמנים רק רכיבים מבעלי חיים לא כשרים. לא נבדקים: הכשר, שחיטה, כלים/מטבח משותף, "עלול להכיל", יין, קיבה בגבינה. בשר מחיה כשרה ודגים כשרים — בסדר. בשר + חלב — הערה בלבד.', '');
lines.push('## רמות', '');
lines.push('| רמה | שם |', '|---|---|');
for (const [k, v] of Object.entries(LEVEL_NAMES)) lines.push(`| ${k} | ${v} |`);
lines.push('', 'הרמה הסופית = הרמה הגבוהה ביותר של רכיב אמיתי. ממצאים בתוך הצהרת עקבות לא נספרים.', '');
lines.push('## תחביר מונחים', '');
lines.push('- `word` — מילה שלמה · `word*` — מתחיל ב… · `*word` — מסתיים ב… (מילים מורכבות בגרמנית) · מילים עם רווח — רצף מילים');
lines.push('- **מסייגים (qualifiers)**: המילים שמיד לפני/אחרי הממצא (באותו רכיב) יכולות לשנות את הרמה. למשל `gelatina bovina` → 1, `prosciutto di tacchino` → 0.');
lines.push('- **ביטויים בטוחים** (רמה 0): ממצא שנמצא כולו בתוך ביטוי בטוח נמחק. למשל `funghi porcini`, `burro di cacao`, `locust bean gum`.');
lines.push('- **הביטוי הספציפי מנצח**: `pesce spada` גובר על `pesce`.', '');

for (const e of DICT) {
  lines.push(`## ${e.level === 0 ? 'ביטויים בטוחים' : `${e.reason}`} — רמה ${e.level} \`${e.id}\``, '');
  if (e.level !== 0) lines.push(`קבוצה: ${e.group}`, '');
  lines.push('| שפה | מונחים |', '|---|---|');
  for (const [lang, name] of LANGS) {
    const t = e.terms[lang];
    if (t?.length) lines.push(`| ${name} | ${t.map((x) => `\`${x}\``).join(' · ')} |`);
  }
  if (e.qualifiers?.length) {
    lines.push('', '**מסייגים:**', '');
    for (const q of e.qualifiers) {
      const lvl = q.level == null ? 'לא ממצא' : `רמה ${q.level}`;
      lines.push(`- ${q.reason ?? ''} → ${lvl}: \`${q.re.source.slice(0, 140)}${q.re.source.length > 140 ? '…' : ''}\``);
    }
  }
  lines.push('');
}

lines.push('## סמני עקבות', '');
lines.push(TRACE_MARKERS.map((m) => `\`${m}\``).join(' · '), '');

writeFileSync(new URL('../docs/ingredients-reference.md', import.meta.url), lines.join('\n'));
console.log(`wrote docs/ingredients-reference.md (${DICT.length} entries, ${total} terms)`);
