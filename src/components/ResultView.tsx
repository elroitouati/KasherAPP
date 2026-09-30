import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { summarize, type Finding, type LabelStatus, type RiskLevel } from '../kashrut/engine';
import { color, font, radius, risk, space } from '../theme/tokens';
import { ExplainSheet } from './ExplainSheet';
import { HighlightedText } from './HighlightedText';
import { InfoIcon } from './icons';
import { RiskBadge } from './RiskBadge';
import { Txt } from './Txt';

type Props = {
  level: RiskLevel | null;
  status: LabelStatus;
  findings: Finding[];
  traces: Finding[];
  notes: string[];
  /** Where the verdict came from ("נבדק במילון בלבד", "מהמאגר הפתוח"…). */
  source: string;
  /** Ingredient text to show with highlights (offsets must match `textFindings`). */
  text?: string | null;
  textFindings?: Finding[];
  textTitle?: string;
  /** Override for the one-line reason under the level. */
  detail?: string;
};

/** Verdict + tappable findings (each opens an explanation) + the text as read. */
export function ResultView({ level, status, findings, traces, notes, source, text, textFindings, textTitle, detail }: Props) {
  const [open, setOpen] = useState<Finding | null>(null);

  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <RiskBadge level={level} detail={detail ?? summarize({ level, status, findings })} />

        {findings.length > 0 && (
          <View style={styles.list}>
            {findings.map((f, i) => (
              <FindingRow key={`${f.entryId}-${i}`} f={f} onPress={() => setOpen(f)} />
            ))}
          </View>
        )}

        {traces.length > 0 && (
          <View style={styles.traces}>
            <Txt variant="label">{'עקבות ("עלול להכיל") — לא נספרים'}</Txt>
            <View style={styles.traceRow}>
              {traces.map((t, i) => (
                <Pressable key={i} onPress={() => setOpen(t)} accessibilityRole="button" style={styles.traceChip}>
                  <Txt latin variant="caption">
                    {t.term}
                  </Txt>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {notes.map((n) => (
          <Txt key={n} variant="caption">
            {n}
          </Txt>
        ))}
        <Txt variant="caption" style={styles.source}>
          {source} · בדיקה לפי מקור מן החי, לא תחליף להכשר
        </Txt>
      </View>

      {text ? (
        <View style={styles.card}>
          <Txt variant="label">{textTitle ?? 'רשימת הרכיבים'}</Txt>
          <HighlightedText text={text} findings={textFindings ?? []} style={styles.text} />
        </View>
      ) : null}

      <ExplainSheet finding={open} onClose={() => setOpen(null)} />
    </View>
  );
}

function FindingRow({ f, onPress }: { f: Finding; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityHint="פותח הסבר על הרכיב"
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: color.surface2 }]}
    >
      <View style={[styles.bar, { backgroundColor: risk[f.level] }]} />
      <View style={styles.rowText}>
        <Txt latin style={styles.term} numberOfLines={1}>
          {f.term}
        </Txt>
        <Txt variant="caption" numberOfLines={2}>
          {f.reason}
        </Txt>
      </View>
      <InfoIcon color={color.text3} size={20} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space[4] },
  card: {
    backgroundColor: color.surface1,
    borderColor: color.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: space[4],
    gap: space[3],
  },
  list: { gap: space[2] },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    minHeight: 56,
    paddingVertical: space[2],
    paddingHorizontal: space[3],
    borderRadius: radius.md,
    backgroundColor: color.surface1,
  },
  bar: { width: 4, alignSelf: 'stretch', borderRadius: radius.pill },
  rowText: { flex: 1 },
  term: { fontFamily: font.bold, textAlign: 'right' },
  traces: { gap: space[2] },
  traceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
  traceChip: {
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: radius.pill,
    paddingHorizontal: space[3],
    paddingVertical: space[1],
    minHeight: 32,
    justifyContent: 'center',
  },
  source: { color: color.text3 },
  text: { fontSize: 15, lineHeight: 22 },
});
