import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COUNTRIES, getCountry, type Country } from '../abroad/countries';
import { Button } from '../components/Button';
import { IconButton } from '../components/IconButton';
import { BackIcon } from '../components/icons';
import { Txt } from '../components/Txt';
import { updateSettings, useSettings } from '../data/settings';
import { deletePack, downloadPack, packInfo, type PackInfo } from '../data/store';
import type { RiskLevel } from '../kashrut/engine';
import { color, font, radius, risk, size, space } from '../theme/tokens';

const PACK_SIZE = 1000;

export default function AbroadScreen() {
  const insets = useSafeAreaInsets();
  const { country: countryId } = useSettings();
  const country = getCountry(countryId);

  return (
    <View style={styles.screen}>
      <View style={[styles.topBar, { paddingTop: insets.top + space[2] }]}>
        <IconButton label="חזרה" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}>
          <BackIcon color={color.text1} />
        </IconButton>
        <Txt variant="title">{'מצב חו"ל'}</Txt>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + space[8] }]}>
        <Txt style={styles.lead}>
          {country ? `מה לחפש בתוויות ובמסעדות ב${country.name}.` : 'לאן אתה נוסע? נציג את המילים והמנות שכדאי להכיר, ונוריד מוצרים לשימוש בלי אינטרנט.'}
        </Txt>

        <View style={styles.chips} accessibilityRole="radiogroup">
          {COUNTRIES.map((c) => {
            const on = c.id === countryId;
            return (
              <Pressable
                key={c.id}
                onPress={() => updateSettings({ country: on ? null : c.id })}
                accessibilityRole="radio"
                accessibilityState={{ checked: on }}
                style={[styles.chip, on && styles.chipOn]}
              >
                <Txt style={[styles.chipText, on && styles.chipTextOn]}>{c.name}</Txt>
              </Pressable>
            );
          })}
        </View>

        {country && <CountryGuide country={country} />}
      </ScrollView>
    </View>
  );
}

function CountryGuide({ country }: { country: Country }) {
  return (
    <>
      <OfflinePack key={country.id} country={country} />

      <Txt style={styles.h2}>{`מילים על התווית (${country.language})`}</Txt>
      <View style={styles.card}>
        {country.words.map((w) => (
          <Line key={w.term} level={w.level} term={w.term} he={w.he} />
        ))}
      </View>

      <Txt style={styles.h2}>במסעדה</Txt>
      <View style={styles.card}>
        {country.dishes.map((d) => (
          <Line key={d.name} level={d.level} term={d.name} he={d.he} />
        ))}
      </View>

      <Txt style={styles.h2}>טיפים</Txt>
      <View style={styles.tips}>
        {country.tips.map((t) => (
          <View key={t} style={styles.tip}>
            <View style={styles.tipDot} />
            <Txt style={styles.tipText}>{t}</Txt>
          </View>
        ))}
      </View>
    </>
  );
}

function Line({ level, term, he }: { level: RiskLevel; term: string; he: string }) {
  return (
    <View style={styles.line}>
      <View style={[styles.dot, { backgroundColor: risk[level] }]} />
      <View style={styles.lineText}>
        <Txt latin style={styles.term}>
          {term}
        </Txt>
        <Txt variant="caption">{he}</Txt>
      </View>
    </View>
  );
}

type PackState =
  | { kind: 'loading' }
  | { kind: 'none' }
  | { kind: 'ready'; info: PackInfo }
  | { kind: 'downloading'; done: number }
  | { kind: 'error' };

/** Download the country's most-scanned products for barcode lookups without internet. */
function OfflinePack({ country }: { country: Country }) {
  const [state, setState] = useState<PackState>({ kind: 'loading' });

  useEffect(() => {
    let alive = true;
    packInfo(country.id).then((info) => alive && setState(info ? { kind: 'ready', info } : { kind: 'none' }));
    return () => {
      alive = false;
    };
  }, [country.id]);

  const download = useCallback(async () => {
    setState({ kind: 'downloading', done: 0 });
    try {
      const info = await downloadPack(country.id, country.offTag, PACK_SIZE, (done) =>
        setState({ kind: 'downloading', done }),
      );
      setState({ kind: 'ready', info });
    } catch {
      setState({ kind: 'error' });
    }
  }, [country]);

  const remove = () => {
    deletePack(country.id);
    setState({ kind: 'none' });
  };

  return (
    <View style={[styles.card, styles.offline]}>
      <Txt style={styles.cardTitle}>בלי אינטרנט</Txt>
      <Txt variant="caption">
        סריקת רשימת רכיבים עובדת תמיד — המילון נמצא בטלפון. כדי לסרוק גם ברקודים בלי אינטרנט, הורד מראש את המוצרים
        הנפוצים.
      </Txt>

      {state.kind === 'loading' && <View style={styles.skel} />}

      {state.kind === 'none' && (
        <Button label={`הורד ${PACK_SIZE.toLocaleString('he-IL')} מוצרים נפוצים מ${country.name}`} onPress={download} />
      )}

      {state.kind === 'downloading' && (
        <View style={styles.progressWrap} accessibilityLabel={`הורדו ${state.done} מתוך ${PACK_SIZE}`}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.max(4, (state.done / PACK_SIZE) * 100)}%` }]} />
          </View>
          <Txt variant="caption">{`מוריד… ${state.done.toLocaleString('he-IL')} מתוך ${PACK_SIZE.toLocaleString('he-IL')}`}</Txt>
        </View>
      )}

      {state.kind === 'ready' && (
        <>
          <Txt style={styles.ready}>
            {`✓ ${state.info.count.toLocaleString('he-IL')} מוצרים שמורים בטלפון · ${new Date(state.info.downloadedAt).toLocaleDateString('he-IL')}`}
          </Txt>
          <View style={styles.row}>
            <View style={styles.flex}>
              <Button label="עדכן" kind="secondary" onPress={download} />
            </View>
            <View style={styles.flex}>
              <Button label="מחק" kind="secondary" onPress={remove} />
            </View>
          </View>
        </>
      )}

      {state.kind === 'error' && (
        <>
          <Txt variant="caption" style={{ color: risk[3] }}>
            ההורדה נכשלה — צריך חיבור לאינטרנט, או שהמאגר עמוס כרגע. נסה שוב בעוד דקה.
          </Txt>
          <Button label="נסה שוב" kind="secondary" onPress={download} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.bg },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: space[3], paddingHorizontal: space[5], paddingBottom: space[2] },
  content: { paddingHorizontal: space[5], paddingTop: space[4], gap: space[5] },
  lead: { fontSize: 17, lineHeight: 27, color: color.text2 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
  chip: {
    minHeight: 44,
    paddingHorizontal: space[4],
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: color.borderStrong,
    justifyContent: 'center',
  },
  chipOn: { backgroundColor: color.brand, borderColor: color.brand },
  chipText: { fontFamily: font.bold, fontSize: size.body, lineHeight: 22 },
  chipTextOn: { color: color.onBrand },
  h2: { fontFamily: font.black, fontSize: size.xl, lineHeight: 30 },
  card: {
    backgroundColor: color.surface1,
    borderColor: color.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: space[4],
    gap: space[3],
  },
  offline: { borderColor: color.borderStrong },
  cardTitle: { fontFamily: font.bold, fontSize: size.lg, lineHeight: 26 },
  line: { flexDirection: 'row', gap: space[3], alignItems: 'flex-start' },
  dot: { width: 10, height: 10, borderRadius: radius.pill, marginTop: 8 },
  lineText: { flex: 1 },
  term: { fontFamily: font.bold, textAlign: 'right' },
  tips: { gap: space[3] },
  tip: { flexDirection: 'row', gap: space[3], alignItems: 'flex-start' },
  tipDot: { width: 6, height: 6, borderRadius: radius.pill, backgroundColor: color.brand, marginTop: 10 },
  tipText: { flex: 1 },
  skel: { height: 52, borderRadius: radius.md, backgroundColor: color.surface2 },
  progressWrap: { gap: space[2] },
  progressTrack: { height: 8, borderRadius: radius.pill, backgroundColor: color.surface2, overflow: 'hidden' },
  progressFill: { height: 8, borderRadius: radius.pill, backgroundColor: color.brand },
  ready: { color: color.brand, fontFamily: font.bold },
  row: { flexDirection: 'row', gap: space[2] },
  flex: { flex: 1 },
});
