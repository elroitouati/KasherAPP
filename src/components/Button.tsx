import { Pressable, StyleSheet } from 'react-native';

import { color, font, radius, size } from '../theme/tokens';
import { Txt } from './Txt';

type Props = {
  label: string;
  onPress: () => void;
  kind?: 'primary' | 'secondary';
};

export function Button({ label, onPress, kind = 'primary' }: Props) {
  const primary = kind === 'primary';
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.btn,
        primary ? styles.primary : styles.secondary,
        pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
      ]}
    >
      <Txt style={[styles.label, { color: primary ? color.onBrand : color.text1 }]}>{label}</Txt>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    minHeight: 52,
    borderRadius: radius.md,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: { backgroundColor: color.brand },
  secondary: { backgroundColor: color.surface2, borderWidth: 1, borderColor: color.border },
  label: { fontFamily: font.bold, fontSize: size.body, lineHeight: 20 },
});
