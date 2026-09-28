import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { CapturedPhoto } from '../scanner/types';
import { color, radius, space } from '../theme/tokens';
import { Button } from './Button';
import { Txt } from './Txt';

type Props = { photo: CapturedPhoto; onDone: () => void };

/**
 * Step-1 stand-in for the result screen: shows the full-resolution photo and
 * the text ML Kit read from it. Replaced by the gauge screen in step 3.
 */
export function CaptureReview({ photo, onDone }: Props) {
  const insets = useSafeAreaInsets();
  const empty = photo.text != null && photo.text.trim().length === 0;

  return (
    <View style={[styles.screen, { paddingTop: insets.top + space[4], paddingBottom: insets.bottom + space[4] }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Txt variant="title">התווית צולמה</Txt>
        <Image source={{ uri: photo.uri }} style={styles.photo} resizeMode="cover" accessibilityIgnoresInvertColors />

        <View style={styles.card}>
          <Txt variant="label">טקסט שנקרא מהתמונה המלאה</Txt>
          {photo.text == null ? (
            <Txt style={styles.muted}>
              ב-Expo Go אין זיהוי טקסט על המכשיר. בגרסת הפיתוח הטקסט נקרא כאן, ובשלב 4 התמונה תיבדק גם ע״י Claude.
            </Txt>
          ) : empty ? (
            <Txt style={styles.muted}>לא נקרא טקסט. קרב את הטלפון לרשימת הרכיבים וצלם שוב.</Txt>
          ) : (
            <Txt latin selectable style={styles.ocr}>
              {photo.text}
            </Txt>
          )}
        </View>
      </ScrollView>
      <View style={styles.actions}>
        <Button label="סרוק מוצר הבא" onPress={onDone} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: color.bg },
  content: { paddingHorizontal: space[5], gap: space[4], paddingBottom: space[6] },
  photo: { width: '100%', aspectRatio: 3 / 4, borderRadius: radius.lg, backgroundColor: color.surface1 },
  card: {
    backgroundColor: color.surface1,
    borderColor: color.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: space[4],
    gap: space[2],
  },
  muted: { color: color.text2 },
  ocr: { fontSize: 15, lineHeight: 22 },
  actions: { paddingHorizontal: space[5], paddingTop: space[3] },
});
