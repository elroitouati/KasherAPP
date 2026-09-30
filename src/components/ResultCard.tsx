import { useEffect, useMemo, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';

import { useProduct } from '../data/useProduct';
import { analyzeLabel, levelName, summarize, type RiskLevel } from '../kashrut/engine';
import type { CapturedPhoto } from '../scanner/types';
import { color, font, motion, radius, risk, size, space } from '../theme/tokens';
import { BackIcon } from './icons';
import { Txt } from './Txt';

export type Current = { kind: 'label'; photo: CapturedPhoto; id: number } | { kind: 'product'; code: string; id: number };

type Props = { current: Current; onOpen: () => void };

/**
 * Compact verdict for the product just scanned, floating over the live camera.
 * Scanning continues underneath — the next product replaces it.
 */
export function ResultCard({ current, onOpen }: Props) {
  const [t] = useState(() => new Animated.Value(0));
  useEffect(() => {
    t.setValue(0);
    Animated.timing(t, { toValue: 1, duration: motion.fade, easing: Easing.bezier(0.2, 0, 0, 1), useNativeDriver: true }).start();
  }, [current.id, t]);

  return (
    <Animated.View
      style={{
        opacity: t,
        transform: [{ translateY: t.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
      }}
    >
      {current.kind === 'label' ? (
        <LabelCard photo={current.photo} onOpen={onOpen} />
      ) : (
        <ProductCard code={current.code} onOpen={onOpen} />
      )}
    </Animated.View>
  );
}

function LabelCard({ photo, onOpen }: { photo: CapturedPhoto; onOpen: () => void }) {
  const r = useMemo(() => (photo.text?.trim() ? analyzeLabel(photo.text) : null), [photo.text]);
  if (!r) return <Shell level={null} title="צולם" sub={photo.text == null ? 'פתח לפרטים' : 'לא נקרא טקסט — קרב את הטלפון'} onOpen={onOpen} />;
  return <Shell level={r.level} title={levelName(r.level)} sub={summarize(r)} onOpen={onOpen} />;
}

function ProductCard({ code, onOpen }: { code: string; onOpen: () => void }) {
  const { lookup, verdict } = useProduct(code);
  if (!lookup) return <Shell level={null} title="מחפש במאגר…" sub={code} loading onOpen={onOpen} />;
  const p = lookup.product;
  if (!p) {
    return (
      <Shell
        level={null}
        title={lookup.offline ? 'אין חיבור לאינטרנט' : 'המוצר לא נמצא במאגר'}
        sub="צלם את רשימת הרכיבים"
        onOpen={onOpen}
      />
    );
  }
  const level = verdict?.level ?? null;
  return <Shell level={level} title={levelName(level)} sub={p.name || code} latinSub onOpen={onOpen} />;
}

function Shell({
  level,
  title,
  sub,
  latinSub,
  loading,
  onOpen,
}: {
  level: RiskLevel | null;
  title: string;
  sub: string;
  latinSub?: boolean;
  loading?: boolean;
  onOpen: () => void;
}) {
  const tint = level == null ? color.text3 : risk[level];
  return (
    <Pressable
      onPress={onOpen}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${sub}. פתח פרטים`}
      style={({ pressed }) => [styles.card, { borderColor: tint }, pressed && { opacity: 0.9 }]}
    >
      <View style={[styles.stripe, { backgroundColor: tint }, loading && styles.loading]} />
      <View style={styles.text}>
        <Txt style={[styles.title, { color: level == null ? color.text1 : tint }]} numberOfLines={1}>
          {title}
        </Txt>
        <Txt variant="caption" latin={latinSub} numberOfLines={1} style={latinSub ? styles.latin : undefined}>
          {sub}
        </Txt>
      </View>
      <View style={styles.more}>
        <Txt variant="label">פרטים</Txt>
        {/* "forward" in RTL points left: mirror the back chevron. */}
        <View style={styles.flip}>
          <BackIcon color={color.text2} size={18} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    minHeight: 72,
    paddingVertical: space[3],
    paddingStart: space[3],
    paddingEnd: space[4],
    borderRadius: radius.lg,
    borderWidth: 1.5,
    backgroundColor: color.sheet,
  },
  stripe: { width: 6, alignSelf: 'stretch', borderRadius: radius.pill },
  loading: { opacity: 0.4 },
  text: { flex: 1 },
  title: { fontFamily: font.black, fontSize: size.lg, lineHeight: 26 },
  latin: { textAlign: 'right' },
  more: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  flip: { transform: [{ scaleX: -1 }] },
});
