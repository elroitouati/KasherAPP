import { useCameraPermissions } from 'expo-camera';
import type { ReactNode } from 'react';
import { Linking, StyleSheet, View } from 'react-native';

import { color, space } from '../theme/tokens';
import { Button } from './Button';
import { Txt } from './Txt';

/** Renders children only once camera permission is granted. */
export function PermissionGate({ children }: { children: ReactNode }) {
  const [permission, request] = useCameraPermissions();

  if (!permission) return <View style={styles.screen} />;
  if (permission.granted) return <>{children}</>;

  const blocked = !permission.canAskAgain;
  return (
    <View style={styles.screen}>
      <View style={styles.body}>
        <Txt variant="title" style={styles.heading}>
          צריך גישה למצלמה
        </Txt>
        <Txt style={styles.copy}>
          הסורק קורא את רשימת הרכיבים ישירות מהאריזה ומסמן רכיבים מבעלי חיים לא כשרים.
        </Txt>
      </View>
      <Button
        label={blocked ? 'פתח את ההגדרות' : 'אפשר גישה למצלמה'}
        onPress={() => (blocked ? Linking.openSettings() : request())}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: color.bg,
    padding: space[5],
    justifyContent: 'flex-end',
    gap: space[8],
    paddingBottom: space[12],
  },
  body: { gap: space[3] },
  heading: { fontSize: 32, lineHeight: 40 },
  copy: { color: color.text2 },
});
