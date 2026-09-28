import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { analyzeLabel, summarize } from '../kashrut/engine';
import { color, radius, size, space } from '../theme/tokens';
import { HighlightedText } from './HighlightedText';
import { RiskBadge } from './RiskBadge';

type Props = { text: string };

/**
 * Live risk tag under the scan window: the dictionary verdict for what the
 * camera sees right now, plus the ingredient text with flagged words coloured.
 */
export function LiveVerdict({ text }: Props) {
  const flat = useMemo(() => text.replace(/\n/g, ' '), [text]); // same length → offsets stay valid
  const result = useMemo(() => analyzeLabel(flat), [flat]);

  // Show the ingredient list from its header; shift findings accordingly.
  const offset = result.ingredientsOffset;
  const snippet = flat.slice(offset);
  const marks = [...result.findings, ...result.traces].map((f) => ({ ...f, start: f.start - offset, end: f.end - offset }));

  const detail =
    result.status === 'incomplete' && result.findings.length === 0
      ? 'הרשימה חתוכה — צלם את ההמשך'
      : summarize(result);

  return (
    <View style={styles.panel}>
      <RiskBadge level={result.level} detail={detail} compact />
      <HighlightedText text={snippet} findings={marks} numberOfLines={3} style={styles.text} />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: color.surfaceScrim,
    borderColor: color.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: space[4],
    gap: space[2],
  },
  text: { fontSize: size.xs, lineHeight: 18, color: color.text2 },
});
