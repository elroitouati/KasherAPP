import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton } from '../components/IconButton';
import { BackIcon, CheckIcon, CrossIcon } from '../components/icons';
import { RiskScale } from '../components/RiskScale';
import { Txt } from '../components/Txt';
import type { RiskLevel } from '../kashrut/engine';
import { color, font, radius, risk, size, space } from '../theme/tokens';

type Row = { title: string; examples: string; level: RiskLevel };

const FLAGGED: Row[] = [
  { title: 'חזיר וכל מוצריו', examples: 'maiale, suino, prosciutto, strutto, bacon, Schwein', level: 4 },
  { title: 'פירות ים, סרטנים ורכיכות', examples: 'gamberi, cozze, calamari, polpo, shrimp', level: 4 },
  { title: 'דגים בלי סנפיר וקשקשת', examples: 'צלופח, שפמנון ופנגסיוס, כריש, דג חרב, חדקן וקוויאר, רנה פסקטריצ׳ה', level: 4 },
  { title: 'בעלי חיים לא כשרים', examples: 'ארנב, סוס, חמור, גמל, בת יענה, צפרדעים, חלזונות', level: 4 },
  { title: 'חרקים וקרמין', examples: 'E120, cocciniglia, carminio, insetti', level: 4 },
  { title: 'ג׳לטין וקולגן בלי מקור, שומן מן החי', examples: 'gelatina, E441, grassi animali, pepsina, E542', level: 3 },
  { title: 'נקניקים וסורימי', examples: 'salame, mortadella, wurstel, surimi', level: 3 },
  { title: 'בשר או דג בלי סוג, ביצי דגים', examples: 'carne, pesce, uova di pesce, E920', level: 2 },
  { title: 'מתחלבים ומשפרי טעם', examples: 'E471, E631, E627, שלאק, ג׳לטין בקר או דגים', level: 1 },
];

const NOT_CHECKED = ['הכשר ותעודת כשרות', 'שחיטה', 'כלים ומטבח משותף', '"עלול להכיל" ועקבות', 'יין', 'קיבה בגבינה'];

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.screen}>
      <View style={[styles.topBar, { paddingTop: insets.top + space[2] }]}>
        <IconButton label="חזרה" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}>
          <BackIcon color={color.text1} />
        </IconButton>
        <Txt variant="title">מה בודקים</Txt>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + space[8] }]}>
        <Txt style={styles.lead}>
          הבדיקה היא לפי מקור מן החי בלבד: אנחנו מחפשים רכיבים שמגיעים מבעלי חיים לא כשרים. בשר מחיה כשרה ודגים כשרים — בסדר.
        </Txt>

        <View style={styles.card}>
          <Txt variant="label">הרמות</Txt>
          <RiskScale long />
          <Txt variant="caption">הרמה הסופית היא הרמה הגבוהה ביותר של רכיב אמיתי ברשימה.</Txt>
        </View>

        <Txt style={styles.h2}>מה מסומן</Txt>
        <View style={styles.list}>
          {FLAGGED.map((r) => (
            <View key={r.title} style={styles.row}>
              <View style={[styles.levelChip, { borderColor: risk[r.level] }]}>
                <Txt style={[styles.levelNum, { color: risk[r.level] }]}>{r.level}</Txt>
              </View>
              <View style={styles.rowText}>
                <Txt style={styles.rowTitle}>{r.title}</Txt>
                <Txt variant="caption">{r.examples}</Txt>
              </View>
            </View>
          ))}
        </View>

        <Txt style={styles.h2}>מה לא בודקים</Txt>
        <View style={styles.card}>
          {NOT_CHECKED.map((t) => (
            <View key={t} style={styles.notRow}>
              <CrossIcon color={color.text3} size={18} />
              <Txt style={styles.notText}>{t}</Txt>
            </View>
          ))}
        </View>

        <View style={styles.notRow}>
          <CheckIcon color={color.brand} size={18} />
          <Txt variant="caption" style={styles.notText}>
            בשר וחלב יחד מקבלים הערה בלבד — זה לא משנה את הרמה.
          </Txt>
        </View>

        <View style={[styles.card, styles.warn]}>
          <Txt style={styles.rowTitle}>חשוב לדעת</Txt>
          <Txt variant="caption">
            {'"נקי" אומר שלא מצאנו רכיב מבעל חיים לא כשר ברשימה שנקראה — הוא לא אומר שהמוצר כשר. הבדיקה אינה תחליף להכשר ולפסק הלכה. אם חלק מהרשימה לא נקרא, לא נכריז "נקי".'}
          </Txt>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.bg },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: space[3], paddingHorizontal: space[5], paddingBottom: space[2] },
  content: { paddingHorizontal: space[5], paddingTop: space[4], gap: space[5] },
  lead: { fontSize: 17, lineHeight: 27, color: color.text2 },
  h2: { fontFamily: font.black, fontSize: size.xl, lineHeight: 30 },
  card: {
    backgroundColor: color.surface1,
    borderColor: color.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: space[4],
    gap: space[3],
  },
  warn: { borderColor: risk[2] },
  list: { gap: space[2] },
  row: {
    flexDirection: 'row',
    gap: space[3],
    alignItems: 'center',
    backgroundColor: color.surface1,
    borderRadius: radius.md,
    padding: space[3],
  },
  levelChip: { width: 36, height: 36, borderRadius: radius.pill, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  levelNum: { fontFamily: font.black, fontSize: size.body, lineHeight: 20 },
  rowText: { flex: 1, gap: 2 },
  rowTitle: { fontFamily: font.bold },
  notRow: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  notText: { flex: 1 },
});
