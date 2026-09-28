import { StyleSheet, Text, type TextProps } from 'react-native';

import { color, font, size } from '../theme/tokens';

type Variant = 'body' | 'label' | 'title' | 'caption';

type Props = TextProps & {
  variant?: Variant;
  /** Latin label text (OCR) reads left-to-right; everything else is Hebrew RTL. */
  latin?: boolean;
};

/**
 * Base text. Alignment is left to the platform ("auto") with an explicit
 * writing direction, so Hebrew aligns right both in Expo Go (LTR runtime) and
 * in the dev build (forced RTL) without hand-swapping left/right.
 */
export function Txt({ variant = 'body', latin, style, ...rest }: Props) {
  return (
    <Text
      {...rest}
      style={[styles.base, styles[variant], { writingDirection: latin ? 'ltr' : 'rtl' }, style]}
    />
  );
}

const styles = StyleSheet.create({
  base: { color: color.text1, fontFamily: font.regular, letterSpacing: 0 },
  body: { fontSize: size.body, lineHeight: Math.round(size.body * 1.55) },
  label: { fontSize: size.xs, lineHeight: 18, fontFamily: font.bold, color: color.text2 },
  caption: { fontSize: size.sm, lineHeight: 22, color: color.text2 },
  title: { fontSize: size.lg, lineHeight: 26, fontFamily: font.bold },
});
