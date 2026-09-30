import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LEVEL_NAMES, type Finding } from '../kashrut/engine';
import { explain } from '../kashrut/explain';
import { color, font, radius, risk, size, space } from '../theme/tokens';
import { Button } from './Button';
import { Txt } from './Txt';

type Props = { finding: Finding | null; onClose: () => void };

/** Bottom sheet: what a flagged ingredient is, why it has its level, what to do. */
export function ExplainSheet({ finding, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const e = finding ? explain(finding.entryId) : null;
  return (
    <Modal visible={finding != null} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="סגור" />
      {finding && (
        // Modals render outside the root view, so they need their own RTL direction.
        <View style={[styles.sheet, { paddingBottom: insets.bottom + space[4], direction: 'rtl' }]}>
          <View style={styles.handle} />
          <ScrollView contentContainerStyle={styles.body}>
            <View style={styles.head}>
              <View style={[styles.chip, { borderColor: risk[finding.level] }]}>
                <Txt style={[styles.chipText, { color: risk[finding.level] }]}>{LEVEL_NAMES[finding.level]}</Txt>
              </View>
              {finding.trace && (
                <Txt variant="label" style={{ color: color.text3 }}>
                  בעקבות בלבד — לא נספר
                </Txt>
              )}
            </View>
            <Txt latin style={styles.term}>
              {finding.term}
            </Txt>
            <Txt style={styles.reason}>{finding.reason}</Txt>

            {e && (
              <>
                <Section title="מה זה">{e.what}</Section>
                <Section title="למה הרמה הזאת">{e.why}</Section>
                {e.tip && <Section title="מה אפשר לעשות">{e.tip}</Section>}
              </>
            )}
          </ScrollView>
          <View style={styles.actions}>
            <Button label="הבנתי" onPress={onClose} />
          </View>
        </View>
      )}
    </Modal>
  );
}

function Section({ title, children }: { title: string; children: string }) {
  return (
    <View style={styles.section}>
      <Txt variant="label">{title}</Txt>
      <Txt>{children}</Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(2,10,30,0.6)' },
  sheet: {
    backgroundColor: color.sheet,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderColor: color.border,
    borderWidth: 1,
    maxHeight: '80%',
  },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: radius.pill, backgroundColor: color.borderStrong, marginTop: space[3] },
  body: { padding: space[5], gap: space[3] },
  head: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  chip: { borderWidth: 1.5, borderRadius: radius.pill, paddingHorizontal: space[3], paddingVertical: 2 },
  chipText: { fontFamily: font.bold, fontSize: size.xs, lineHeight: 18 },
  term: { fontFamily: font.black, fontSize: size.xxl, lineHeight: 40, textAlign: 'right' },
  reason: { fontFamily: font.bold, color: color.text2 },
  section: { gap: space[1], paddingTop: space[2] },
  actions: { paddingHorizontal: space[5] },
});
