import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { color, locked } from '../theme/tokens';

const SIZE = 80;
const STROKE = 4;
const R = (SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * R;

type Props = {
  /** 0..1 — how close the scanner is to auto-capture. */
  progress: number;
  busy?: boolean;
  onPress: () => void;
};

/** Shutter with a progress ring that fills as the ingredient list holds steady. */
export function CaptureButton({ progress, busy, onPress }: Props) {
  const p = Math.max(0, Math.min(1, progress));
  return (
    <Pressable
      onPress={onPress}
      disabled={busy}
      accessibilityRole="button"
      accessibilityLabel="צלם את התווית"
      accessibilityState={{ busy }}
      style={({ pressed }) => [styles.wrap, pressed && { transform: [{ scale: 0.95 }] }]}
    >
      <Svg width={SIZE} height={SIZE} style={StyleSheet.absoluteFill}>
        <Circle cx={SIZE / 2} cy={SIZE / 2} r={R} stroke={color.borderStrong} strokeWidth={STROKE} fill="none" />
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          stroke={locked}
          strokeWidth={STROKE}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${CIRC} ${CIRC}`}
          strokeDashoffset={CIRC * (1 - p)}
          // Start at 12 o'clock.
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
        />
      </Svg>
      <View style={[styles.core, busy && styles.coreBusy]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' },
  core: { width: SIZE - 20, height: SIZE - 20, borderRadius: SIZE, backgroundColor: color.text1 },
  coreBusy: { opacity: 0.4 },
});
