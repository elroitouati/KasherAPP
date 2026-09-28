import type { ReactNode } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { color, hit, radius } from '../theme/tokens';

type Props = {
  onPress: () => void;
  label: string;
  selected?: boolean;
  children: ReactNode;
};

export function IconButton({ onPress, label, selected, children }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      hitSlop={4}
      style={({ pressed }) => [
        styles.btn,
        selected && styles.selected,
        pressed && { transform: [{ scale: 0.94 }] },
      ]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: hit,
    height: hit,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.surfaceScrim,
    borderWidth: 1,
    borderColor: color.border,
  },
  selected: { backgroundColor: color.text1, borderColor: color.text1 },
});
