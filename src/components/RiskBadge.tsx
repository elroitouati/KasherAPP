import { StyleSheet, View } from 'react-native';

import { levelName, type RiskLevel } from '../kashrut/engine';
import { color, font, radius, risk, size, space } from '../theme/tokens';
import { Txt } from './Txt';

type Props = {
  /** null = cannot determine. */
  level: RiskLevel | null;
  /** One short line under the level name. */
  detail?: string;
  compact?: boolean;
};

/** Level chip: coloured dot + level name, optional one-line reason. */
export function RiskBadge({ level, detail, compact }: Props) {
  const tint = level == null ? color.text3 : risk[level];
  return (
    <View style={styles.row} accessibilityRole="text" accessibilityLabel={`${levelName(level)}. ${detail ?? ''}`}>
      <View style={[styles.dot, { backgroundColor: tint }]} />
      <View style={styles.textCol}>
        <Txt style={[styles.name, compact && styles.nameCompact, { color: level == null ? color.text2 : tint }]}>
          {levelName(level)}
        </Txt>
        {detail ? (
          <Txt variant="caption" numberOfLines={1}>
            {detail}
          </Txt>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  dot: { width: 14, height: 14, borderRadius: radius.pill },
  textCol: { flex: 1 },
  name: { fontFamily: font.black, fontSize: size.xl, lineHeight: 30 },
  nameCompact: { fontSize: size.lg, lineHeight: 26 },
});
