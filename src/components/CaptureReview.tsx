import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { analyzeLabel } from '../kashrut/engine';
import type { CapturedPhoto } from '../scanner/types';
import { color, radius, space } from '../theme/tokens';
import { Button } from './Button';
import { ResultView } from './ResultView';
import { Txt } from './Txt';

type Props = { photo: CapturedPhoto; onDone: () => void; onHome: () => void };

/**
 * Result for a photographed label (dictionary verdict). The gauge screen
 * (step 3) will replace the badge at the top.
 */
export function CaptureReview({ photo, onDone, onHome }: Props) {
  const insets = useSafeAreaInsets();
  const empty = photo.text != null && photo.text.trim().length === 0;
  const result = photo.text && !empty ? analyzeLabel(photo.text) : null;

  return (
    <View style={[styles.screen, { paddingTop: insets.top + space[4], paddingBottom: insets.bottom + space[4] }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Txt variant="title">התווית צולמה</Txt>

        {result ? (
          <ResultView
            level={result.level}
            status={result.status}
            findings={result.findings}
            traces={result.traces}
            notes={result.notes}
            source="נבדק במילון בלבד"
            text={photo.text}
            textFindings={[...result.findings, ...result.traces]}
            textTitle="טקסט שנקרא מהתמונה"
          />
        ) : (
          <View style={styles.card}>
            <Txt style={styles.muted}>
              {photo.text == null
                ? 'ב-Expo Go אין זיהוי טקסט על המכשיר. בגרסה המותקנת הטקסט נקרא כאן.'
                : 'לא נקרא טקסט. קרב את הטלפון לרשימת הרכיבים וצלם שוב.'}
            </Txt>
          </View>
        )}

        <Image source={{ uri: photo.uri }} style={styles.photo} resizeMode="cover" accessibilityLabel="התמונה שצולמה" />
      </ScrollView>
      <View style={styles.actions}>
        <Button label="סרוק מוצר הבא" onPress={onDone} />
        <Button label="חזרה למסך הבית" kind="secondary" onPress={onHome} />
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
  },
  muted: { color: color.text2 },
  actions: { paddingHorizontal: space[5], paddingTop: space[3], gap: space[2] },
});
