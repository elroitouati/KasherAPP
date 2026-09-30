import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Lookup } from '../data/store';
import { useProduct } from '../data/useProduct';
import { color, font, radius, size, space } from '../theme/tokens';
import { Button } from './Button';
import { ResultView } from './ResultView';
import { Txt } from './Txt';

type Props = {
  code: string;
  onNext: () => void;
  onScanLabel: () => void;
  onHome: () => void;
};

const SOURCE: Record<NonNullable<Lookup['source']>, string> = {
  online: 'מהמאגר הפתוח Open Food Facts',
  cache: 'מהמאגר (נשמר בטלפון)',
  pack: 'ממוצרים שהורדו לשימוש בלי אינטרנט',
};

/** Product found by barcode → verdict from the open database. */
export function ProductResult({ code, onNext, onScanLabel, onHome }: Props) {
  const insets = useSafeAreaInsets();
  const { lookup, verdict } = useProduct(code);
  const p = lookup?.product ?? null;

  return (
    <View style={[styles.screen, { paddingTop: insets.top + space[4], paddingBottom: insets.bottom + space[4] }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Txt variant="label" latin style={styles.code}>
          {code}
        </Txt>

        {lookup == null && <Skeleton />}

        {lookup && !p && (
          <View style={styles.card}>
            <Txt variant="title">{lookup.offline ? 'אין חיבור לאינטרנט' : 'המוצר לא נמצא במאגר'}</Txt>
            <Txt style={styles.muted}>
              {lookup.offline
                ? 'המוצר לא נמצא גם במוצרים שהורדו לטלפון. צלם את רשימת הרכיבים — הבדיקה במילון עובדת גם בלי אינטרנט.'
                : 'צלם את רשימת הרכיבים על האריזה ונבדוק אותה ישירות.'}
            </Txt>
          </View>
        )}

        {p && verdict && lookup?.source && (
          <>
            <View style={styles.product}>
              {p.image ? <Image source={{ uri: p.image }} style={styles.thumb} accessibilityLabel="תמונת המוצר" /> : null}
              <View style={styles.productText}>
                <Txt latin style={styles.name} numberOfLines={3}>
                  {p.name || 'מוצר ללא שם'}
                </Txt>
                {p.brands ? (
                  <Txt latin variant="caption" numberOfLines={1}>
                    {p.brands}
                  </Txt>
                ) : null}
              </View>
            </View>

            <ResultView
              level={verdict.level}
              status={verdict.status === 'ok' ? 'ok' : 'no-ingredients'}
              findings={verdict.findings}
              traces={verdict.traces}
              notes={verdict.notes}
              source={SOURCE[lookup.source]}
              text={verdict.text}
              textFindings={verdict.textFindings}
              detail={
                verdict.level == null
                  ? 'אין במאגר רשימת רכיבים למוצר הזה — צלם את התווית'
                  : verdict.status === 'tags-only' && verdict.findings.length === 0
                    ? 'לפי רשימה מקוצרת — מומלץ לצלם את התווית לאימות'
                    : undefined
              }
            />
            <Txt variant="caption" style={styles.muted}>
              המידע במאגר נכתב ע״י משתמשים ועלול להיות לא מעודכן. אם יש ספק — צלם את התווית שבידך.
            </Txt>
          </>
        )}
      </ScrollView>

      <View style={styles.actions}>
        <Button label="חזרה לסריקה" onPress={onNext} />
        <View style={styles.row}>
          <View style={styles.flex}>
            <Button label="צלם את התווית" kind="secondary" onPress={onScanLabel} />
          </View>
          <View style={styles.flex}>
            <Button label="למסך הבית" kind="secondary" onPress={onHome} />
          </View>
        </View>
      </View>
    </View>
  );
}

/** Loading: shaped like the real result. */
function Skeleton() {
  return (
    <View style={styles.skel} accessibilityLabel="מחפש את המוצר במאגר">
      <View style={styles.product}>
        <View style={[styles.thumb, styles.block]} />
        <View style={styles.productText}>
          <View style={[styles.block, { height: 20, width: '70%' }]} />
          <View style={[styles.block, { height: 14, width: '40%' }]} />
        </View>
      </View>
      <View style={[styles.block, { height: 140, borderRadius: radius.lg }]} />
      <Txt variant="caption" style={styles.muted}>
        מחפש במאגר…
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: color.bg },
  content: { paddingHorizontal: space[5], gap: space[4], paddingBottom: space[6] },
  code: { color: color.text3, textAlign: 'right' },
  product: { flexDirection: 'row', gap: space[4], alignItems: 'center' },
  thumb: { width: 72, height: 72, borderRadius: radius.md, backgroundColor: color.text1 },
  productText: { flex: 1, gap: space[1] },
  name: { fontFamily: font.black, fontSize: size.lg, lineHeight: 26, textAlign: 'right' },
  card: {
    backgroundColor: color.surface1,
    borderColor: color.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: space[4],
    gap: space[2],
  },
  muted: { color: color.text2 },
  skel: { gap: space[4] },
  block: { backgroundColor: color.surface2, borderRadius: radius.sm },
  actions: { paddingHorizontal: space[5], paddingTop: space[3], gap: space[2] },
  row: { flexDirection: 'row', gap: space[2] },
  flex: { flex: 1 },
});
