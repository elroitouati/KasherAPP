import { router } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { IconButton } from '../components/IconButton';
import { BarcodeIcon, GlobeIcon, InfoIcon, ScanIcon } from '../components/icons';
import { RiskScale } from '../components/RiskScale';
import { Txt } from '../components/Txt';
import { getCountry } from '../abroad/countries';
import { useSettings } from '../data/settings';
import { color, font, radius, size, space } from '../theme/tokens';

const LOGO = require('../../assets/brand/logo-256.png');

/** Home: who we are, how to read a result, one big action — scan. */
export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const country = getCountry(useSettings().country);

  return (
    <View style={styles.screen}>
      <Glow />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + space[4] }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Brand row: logo + name at the start (right), info at the end (left). */}
        <View style={styles.brandRow}>
          <View style={styles.brand}>
            <Image source={LOGO} style={styles.logo} accessibilityIgnoresInvertColors accessibilityLabel="לוגו בודק כשרות" />
            <View>
              <Txt variant="title">בודק כשרות</Txt>
              <Txt variant="caption">סורק רכיבים מן החי בתוויות מזון</Txt>
            </View>
          </View>
          <IconButton label="מה בודקים" onPress={() => router.push('/about')}>
            <InfoIcon color={color.text1} />
          </IconButton>
        </View>

        {/* Hero, framed by the logo's scan corners. */}
        <View style={styles.hero}>
          <Corner pos="ts" />
          <Corner pos="te" />
          <Corner pos="bs" />
          <Corner pos="be" />
          <Txt style={styles.headline}>מה יש בתווית?</Txt>
          <Txt style={styles.lead}>
            מכוונים את המצלמה לרשימת הרכיבים, ואנחנו מסמנים חזיר, פירות ים, דגים בלי קשקשים, חרקים ושאר רכיבים מבעלי חיים
            לא כשרים — ישר מהאריזה, גם בשפה זרה.
          </Txt>
        </View>

        <View style={styles.tiles}>
          <Tile
            icon={<BarcodeIcon color={color.brand} size={26} />}
            title="סריקת ברקוד"
            sub="לפי מאגר מוצרים"
            onPress={() => router.push('/scan?mode=barcode')}
          />
          <Tile
            icon={<GlobeIcon color={color.brand} size={26} />}
            title={'מצב חו"ל'}
            sub={country ? `${country.name} · מילים ומנות` : 'בחר מדינה'}
            onPress={() => router.push('/abroad')}
          />
        </View>

        <View style={styles.card}>
          <Txt variant="label">איך קוראים את התוצאה</Txt>
          <RiskScale />
          <Txt variant="caption">
            {'הרמה נקבעת לפי הרכיב המסוכן ביותר ברשימה. "עלול להכיל" לא נספר.'}
          </Txt>
        </View>

        <View style={styles.tip}>
          <ScanIcon color={color.brand} size={20} />
          <Txt variant="caption" style={styles.tipText}>
            כוון לכותרת של רשימת הרכיבים והחזק יציב — הצילום אוטומטי.
          </Txt>
        </View>
      </ScrollView>

      {/* The one primary action, in the thumb zone. */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + space[4] }]}>
        <Pressable
          onPress={() => router.push('/scan')}
          accessibilityRole="button"
          accessibilityLabel="סרוק מוצר"
          style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
        >
          <ScanIcon color={color.onBrand} size={28} />
          <Txt style={styles.ctaText}>סרוק מוצר</Txt>
        </Pressable>
        <View style={styles.footNote}>
          <Txt variant="caption" style={styles.disclaimer}>
            בדיקה לפי מקור מן החי בלבד, לא תחליף להכשר.
          </Txt>
          <Pressable onPress={() => router.push('/about')} accessibilityRole="link" hitSlop={10}>
            <Txt variant="caption" style={styles.link}>
              מה בודקים?
            </Txt>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function Tile({ icon, title, sub, onPress }: { icon: React.ReactNode; title: string; sub: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${sub}`}
      style={({ pressed }) => [styles.tile, pressed && { backgroundColor: color.surface2 }]}
    >
      {icon}
      <Txt style={styles.tileTitle}>{title}</Txt>
      <Txt variant="caption" numberOfLines={1}>
        {sub}
      </Txt>
    </Pressable>
  );
}

/** Soft light from the top-start corner, like the highlight on the logo. */
function Glow() {
  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <RadialGradient id="g" cx="85%" cy="0%" rx="90%" ry="55%" fx="85%" fy="0%">
          <Stop offset="0" stopColor={color.bgGlow} stopOpacity={0.9} />
          <Stop offset="1" stopColor={color.bg} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill="url(#g)" />
    </Svg>
  );
}

const C = 26;
const T = 4;
/** One scan corner; ts = top-start (right), be = bottom-end (left). */
function Corner({ pos }: { pos: 'ts' | 'te' | 'bs' | 'be' }) {
  const top = pos[0] === 't';
  const start = pos[1] === 's';
  return (
    <View
      pointerEvents="none"
      style={[
        styles.corner,
        top ? { top: 0, borderTopWidth: T } : { bottom: 0, borderBottomWidth: T },
        start ? { start: 0, borderStartWidth: T } : { end: 0, borderEndWidth: T },
        top && start && { borderTopStartRadius: radius.md },
        top && !start && { borderTopEndRadius: radius.md },
        !top && start && { borderBottomStartRadius: radius.md },
        !top && !start && { borderBottomEndRadius: radius.md },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.bg },
  content: { paddingHorizontal: space[5], paddingBottom: space[6], gap: space[6] },
  brandRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: space[3], flexShrink: 1 },
  logo: { width: 52, height: 52, borderRadius: radius.md },
  hero: { paddingVertical: space[6], paddingHorizontal: space[5], gap: space[3] },
  corner: { position: 'absolute', width: C, height: C, borderColor: color.brand },
  headline: { fontFamily: font.black, fontSize: size.hero, lineHeight: 52 },
  lead: { fontSize: 17, lineHeight: 27, color: color.text2 },
  card: {
    backgroundColor: color.surface1,
    borderColor: color.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: space[4],
    gap: space[3],
  },
  tiles: { flexDirection: 'row', gap: space[3] },
  tile: {
    flex: 1,
    minHeight: 112,
    padding: space[4],
    gap: space[1],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: color.border,
    backgroundColor: color.surface1,
  },
  tileTitle: { fontFamily: font.bold, fontSize: size.body, lineHeight: 22, marginTop: space[2] },
  tip: { flexDirection: 'row', gap: space[3], alignItems: 'flex-start', paddingHorizontal: space[1] },
  tipText: { flex: 1 },
  footer: { paddingHorizontal: space[5], paddingTop: space[3], gap: space[3], alignItems: 'stretch' },
  cta: {
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: color.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[3],
  },
  ctaPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  ctaText: { fontFamily: font.black, fontSize: size.lg, lineHeight: 26, color: color.onBrand },
  footNote: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', columnGap: space[2] },
  disclaimer: { color: color.text3 },
  link: { color: color.brand, fontFamily: font.bold },
});
