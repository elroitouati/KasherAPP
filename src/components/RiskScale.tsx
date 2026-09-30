import { StyleSheet, View } from 'react-native';

import { LEVEL_NAMES, type RiskLevel } from '../kashrut/engine';
import { color, font, radius, risk, space } from '../theme/tokens';
import { Txt } from './Txt';

const LEVELS: RiskLevel[] = [0, 1, 2, 3, 4];
const SHORT: Record<RiskLevel, string> = { 0: 'נקי', 1: 'נמוך', 2: 'בינוני', 3: 'גבוה', 4: 'לא כשר' };

type Props = {
  /** Highlight one level (the result); others dim. */
  active?: RiskLevel | null;
  /** Full names ("סיכון נמוך") instead of short ones. */
  long?: boolean;
};

/**
 * The 0–4 scale as five segments, green at the start (right) to red at the end
 * (left) — the same direction the result gauge sweeps.
 */
export function RiskScale({ active, long }: Props) {
  return (
    <View style={styles.wrap} accessibilityRole="image" accessibilityLabel="סולם רמות: נקי, סיכון נמוך, בינוני, גבוה, לא כשר">
      <View style={styles.bar}>
        {LEVELS.map((l) => (
          <View
            key={l}
            style={[
              styles.seg,
              { backgroundColor: risk[l] },
              active != null && active !== l && styles.dim,
              active === l && styles.activeSeg,
            ]}
          />
        ))}
      </View>
      <View style={styles.labels}>
        {LEVELS.map((l) => (
          <Txt
            key={l}
            variant="label"
            numberOfLines={1}
            style={[styles.label, active === l && { color: risk[l], fontFamily: font.black }]}
          >
            {long ? LEVEL_NAMES[l] : SHORT[l]}
          </Txt>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space[2] },
  bar: { flexDirection: 'row', gap: 4, height: 10 },
  seg: { flex: 1, borderRadius: radius.pill },
  dim: { opacity: 0.25 },
  activeSeg: { transform: [{ scaleY: 1.5 }] },
  labels: { flexDirection: 'row', gap: 4 },
  label: { flex: 1, textAlign: 'center', color: color.text2 },
});
