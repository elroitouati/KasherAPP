import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { color, locked, motion, radius } from '../theme/tokens';

export type FrameRect = { x: number; y: number; width: number; height: number };

type Props = {
  rect: FrameRect;
  /** Steady, readable text → corners turn green. */
  isLocked: boolean;
};

const CORNER = 28;
const THICK = 4;

/**
 * Dimmed mask with a clear window and four corner brackets. The brackets are
 * the only element that changes colour — white while searching, green when
 * the text in the window is steady.
 */
export function ScanFrame({ rect, isLocked }: Props) {
  const [t] = useState(() => new Animated.Value(0));
  const [borderColor] = useState(() =>
    t.interpolate({ inputRange: [0, 1], outputRange: [color.idle, locked] }),
  );

  useEffect(() => {
    Animated.timing(t, {
      toValue: isLocked ? 1 : 0,
      duration: motion.fade,
      easing: Easing.bezier(0.2, 0, 0, 1),
      useNativeDriver: false,
    }).start();
  }, [isLocked, t]);

  const { x, y, width, height } = rect;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {/* mask: top / bottom / sides */}
      <View style={[styles.scrim, { top: 0, left: 0, right: 0, height: y }]} />
      <View style={[styles.scrim, { top: y + height, left: 0, right: 0, bottom: 0 }]} />
      <View style={[styles.scrim, { top: y, left: 0, width: x, height }]} />
      <View style={[styles.scrim, { top: y, left: x + width, right: 0, height }]} />

      <View style={{ position: 'absolute', left: x, top: y, width, height }}>
        <Animated.View style={[styles.corner, styles.tl, { borderColor }]} />
        <Animated.View style={[styles.corner, styles.tr, { borderColor }]} />
        <Animated.View style={[styles.corner, styles.bl, { borderColor }]} />
        <Animated.View style={[styles.corner, styles.br, { borderColor }]} />
      </View>
    </View>
  );
}

// The frame is symmetric, so physical left/right are fine here.
const styles = StyleSheet.create({
  scrim: { position: 'absolute', backgroundColor: 'rgba(11,13,18,0.55)' },
  corner: { position: 'absolute', width: CORNER, height: CORNER },
  tl: { top: 0, left: 0, borderTopWidth: THICK, borderLeftWidth: THICK, borderTopLeftRadius: radius.lg },
  tr: { top: 0, right: 0, borderTopWidth: THICK, borderRightWidth: THICK, borderTopRightRadius: radius.lg },
  bl: { bottom: 0, left: 0, borderBottomWidth: THICK, borderLeftWidth: THICK, borderBottomLeftRadius: radius.lg },
  br: { bottom: 0, right: 0, borderBottomWidth: THICK, borderRightWidth: THICK, borderBottomRightRadius: radius.lg },
});
