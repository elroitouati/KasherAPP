import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CaptureButton } from '../components/CaptureButton';
import { CaptureReview } from '../components/CaptureReview';
import { ResultCard, type Current } from '../components/ResultCard';
import { IconButton } from '../components/IconButton';
import { BackIcon, TorchIcon } from '../components/icons';
import { LiveVerdict } from '../components/LiveVerdict';
import { PermissionGate } from '../components/PermissionGate';
import { ProductResult } from '../components/ProductResult';
import { ScanFrame, type FrameRect } from '../components/ScanFrame';
import { Txt } from '../components/Txt';
import { GUIDANCE_TEXT, StabilityTracker, textSimilarity, type ScanState } from '../scanner/analysis';
import { isValidBarcode, normalizeBarcode } from '../data/barcode';
import { BarcodeCamera } from '../scanner/BarcodeCamera';
import { hasLiveOcr, ScannerCamera } from '../scanner/ScannerCamera';
import type { LiveReading, ScannerCameraHandle } from '../scanner/types';
import { color, font, radius, risk, size, space } from '../theme/tokens';

type Mode = 'label' | 'barcode';

const IDLE_SCAN: ScanState = { guidance: 'point', progress: 0, locked: false, hasIngredients: false, text: '' };
const TOP_BAR = 56;
/** Below this similarity to the label in the card, the camera is looking at a new product. */
const NEW_PRODUCT_SIMILARITY = 0.5;

export default function ScanScreen() {
  return (
    <PermissionGate>
      <Scanner />
    </PermissionGate>
  );
}

function Scanner() {
  const insets = useSafeAreaInsets();
  const { width: W, height: H } = useWindowDimensions();
  const params = useLocalSearchParams<{ mode?: string; code?: string }>();

  const camera = useRef<ScannerCameraHandle>(null);
  const [tracker] = useState(() => new StabilityTracker());
  const capturing = useRef(false);
  /** Text of the label currently shown in the result card — the same label is not re-captured. */
  const lockedText = useRef<string | null>(null);
  const nextId = useRef(1);

  // A link like kashercheck://scan?code=8000500310427 opens a product directly.
  const initialCode = params.code && isValidBarcode(params.code) ? normalizeBarcode(params.code) : null;

  const [mode, setMode] = useState<Mode>(params.mode === 'barcode' || initialCode ? 'barcode' : 'label');
  const [scan, setScan] = useState<ScanState>(IDLE_SCAN);
  const [torch, setTorch] = useState(false);
  const [busy, setBusy] = useState(false);
  /** The last product scanned — shown as a card over the live camera. */
  const [current, setCurrent] = useState<Current | null>(initialCode ? { kind: 'product', code: initialCode, id: 0 } : null);
  /** Full-screen details for `current` (pauses the camera). */
  const [detail, setDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [foreground, setForeground] = useState(true);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => setForeground(s === 'active'));
    return () => sub.remove();
  }, []);

  const goHome = useCallback(() => (router.canGoBack() ? router.back() : router.replace('/')), []);

  const switchMode = (m: Mode) => {
    if (m === mode) return;
    Haptics.selectionAsync().catch(() => {});
    tracker.reset();
    lockedText.current = null;
    setScan(IDLE_SCAN);
    setError(null);
    setCurrent(null);
    setDetail(false);
    setMode(m);
  };

  /** Capture the label in full resolution; the camera keeps running. */
  const capture = useCallback(
    async (auto: boolean) => {
      if (capturing.current || !camera.current) return;
      capturing.current = true;
      setBusy(true);
      setError(null);
      Haptics.notificationAsync(
        auto ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning,
      ).catch(() => {});
      const liveText = tracker.lastText;
      try {
        const photo = await camera.current.capture();
        // If the full photo read less than the live stream, keep the live text.
        const text = photo.text && photo.text.length >= liveText.length * 0.6 ? photo.text : liveText || photo.text;
        const shown = { ...photo, text };
        lockedText.current = text ?? liveText;
        setCurrent({ kind: 'label', photo: shown, id: nextId.current++ });
      } catch {
        setError('הצילום נכשל. תחזיק את הטלפון יציב ונסה שוב.');
      } finally {
        tracker.reset();
        setScan(IDLE_SCAN);
        capturing.current = false;
        setBusy(false);
      }
    },
    [tracker],
  );

  const onReading = useCallback(
    (r: LiveReading) => {
      if (capturing.current) return;
      const next = tracker.push({ ...r, at: Date.now() });
      // Still looking at the label already shown in the card → don't capture it again.
      const same = lockedText.current != null && textSimilarity(next.text, lockedText.current) >= NEW_PRODUCT_SIMILARITY;
      if (same) {
        setScan({ ...next, progress: 0, guidance: next.guidance === 'point' ? 'point' : 'shown' });
        return;
      }
      setScan(next);
      if (next.guidance === 'ready') capture(true);
    },
    [tracker, capture],
  );

  const onCode = useCallback((code: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setCurrent({ kind: 'product', code, id: nextId.current++ });
  }, []);

  // Label: tall window for an ingredient list. Barcode: wide, short window.
  const frameW = W - space[6] * 2;
  const frameH = mode === 'label' ? Math.min(frameW * 1.05, H * 0.42) : frameW * 0.55;
  const rect: FrameRect = {
    x: (W - frameW) / 2,
    y: insets.top + TOP_BAR + space[12] + space[4],
    width: frameW,
    height: frameH,
  };

  const cameraActive = foreground && !detail;

  const guidance =
    mode === 'barcode'
      ? current
        ? 'כוון לברקוד של המוצר הבא'
        : 'כוון את הברקוד לתוך המסגרת'
      : !hasLiveOcr
        ? 'צלם את רשימת הרכיבים'
        : scan.guidance === 'shown'
          ? 'התוצאה למטה — עבור למוצר הבא'
          : GUIDANCE_TEXT[scan.guidance];
  // Live tag only for a label that isn't the one already in the card.
  const showLiveText = mode === 'label' && hasLiveOcr && scan.text.length > 0 && scan.guidance !== 'shown';

  return (
    <View style={styles.screen}>
      {mode === 'label' ? (
        <ScannerCamera
          ref={camera}
          active={cameraActive}
          torch={torch}
          onReading={onReading}
          onError={() => setError('המצלמה לא זמינה כרגע. סגור אפליקציות אחרות שמשתמשות בה ונסה שוב.')}
        />
      ) : (
        <BarcodeCamera
          active={cameraActive}
          torch={torch}
          onCode={onCode}
          resetKey={0}
          onError={() => setError('המצלמה לא זמינה כרגע. נסה שוב.')}
        />
      )}

      <ScanFrame rect={rect} isLocked={mode === 'label' && scan.locked && scan.guidance !== 'shown'} />

      {/* Top bar: back + title at the start (right), torch at the end (left). */}
      <View style={[styles.topBar, { top: insets.top }]}>
        <View style={styles.titleRow}>
          <IconButton label="חזרה למסך הבית" onPress={goHome}>
            <BackIcon color={color.text1} />
          </IconButton>
          <View>
            <Txt variant="title">{mode === 'label' ? 'סריקת תווית' : 'סריקת ברקוד'}</Txt>
            {mode === 'label' && !hasLiveOcr && <Txt variant="label">Expo Go · סריקה חיה כבויה</Txt>}
          </View>
        </View>
        <IconButton label={torch ? 'כבה פנס' : 'הדלק פנס'} selected={torch} onPress={() => setTorch((t) => !t)}>
          <TorchIcon color={torch ? color.bg : color.text1} on={torch} />
        </IconButton>
      </View>

      {/* Guidance sits directly above the scan window. */}
      <View style={[styles.guidanceRow, { top: rect.y - space[12] }]} pointerEvents="none">
        <View style={[styles.pill, error != null && styles.pillError]} accessibilityLiveRegion="polite">
          <Txt style={styles.pillText}>{error ?? guidance}</Txt>
        </View>
      </View>

      {/* Live risk tag for what the camera sees right now. */}
      {showLiveText && !current && (
        <View style={[styles.livePanel, { top: rect.y + rect.height + space[3] }]} pointerEvents="none">
          <LiveVerdict text={scan.text} />
        </View>
      )}

      {mode === 'barcode' && !current && (
        <View style={[styles.livePanel, { top: rect.y + rect.height + space[4] }]} pointerEvents="none">
          <Txt variant="caption" style={styles.hint}>
            כל מוצר שתכוון אליו ייבדק מיד. בלי אינטרנט — נחפש במוצרים שהורדו.
          </Txt>
        </View>
      )}

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + space[4] }]}>
        {/* The last product scanned. The camera keeps scanning — the next product replaces it. */}
        {/* While a new label is being read, its live tag takes the card's slot. */}
        {current && (
          <View style={styles.cardWrap}>
            {showLiveText ? (
              <View pointerEvents="none">
                <LiveVerdict text={scan.text} compact />
              </View>
            ) : (
              <ResultCard current={current} onOpen={() => setDetail(true)} />
            )}
          </View>
        )}
        {mode === 'label' && <CaptureButton progress={scan.progress} busy={busy} onPress={() => capture(false)} />}
        <ModeSwitch mode={mode} onChange={switchMode} />
      </View>

      {detail && current?.kind === 'label' && (
        <CaptureReview photo={current.photo} onDone={() => setDetail(false)} onHome={goHome} />
      )}
      {detail && current?.kind === 'product' && (
        <ProductResult
          key={current.code}
          code={current.code}
          onNext={() => setDetail(false)}
          onScanLabel={() => switchMode('label')}
          onHome={goHome}
        />
      )}
    </View>
  );
}

/** Segmented control: ingredient list ↔ barcode. */
function ModeSwitch({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  const opts: { id: Mode; label: string }[] = [
    { id: 'label', label: 'רשימת רכיבים' },
    { id: 'barcode', label: 'ברקוד' },
  ];
  return (
    <View style={styles.switch} accessibilityRole="tablist">
      {opts.map((o) => {
        const on = o.id === mode;
        return (
          <Pressable
            key={o.id}
            onPress={() => onChange(o.id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            style={[styles.switchOpt, on && styles.switchOn]}
          >
            <Txt style={[styles.switchText, on && styles.switchTextOn]}>{o.label}</Txt>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.bg },
  topBar: {
    position: 'absolute',
    start: space[5],
    end: space[5],
    height: TOP_BAR,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  guidanceRow: { position: 'absolute', start: 0, end: 0, alignItems: 'center' },
  pill: {
    backgroundColor: color.surfaceScrim,
    borderColor: color.border,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: space[5],
    paddingVertical: space[2],
    maxWidth: '90%',
  },
  pillError: { borderColor: risk[4] },
  pillText: { fontFamily: font.bold, fontSize: size.body, lineHeight: 22, textAlign: 'center' },
  livePanel: { position: 'absolute', start: space[6], end: space[6] },
  hint: {
    textAlign: 'center',
    backgroundColor: color.surfaceScrim,
    borderRadius: radius.md,
    padding: space[3],
    overflow: 'hidden',
  },
  bottomBar: { position: 'absolute', start: 0, end: 0, bottom: 0, alignItems: 'center', gap: space[4] },
  cardWrap: { alignSelf: 'stretch', paddingHorizontal: space[5] },
  switch: {
    flexDirection: 'row',
    backgroundColor: color.surfaceScrim,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: color.border,
    padding: 4,
  },
  switchOpt: { minHeight: 44, paddingHorizontal: space[5], borderRadius: radius.pill, justifyContent: 'center' },
  switchOn: { backgroundColor: color.text1 },
  switchText: { fontFamily: font.bold, fontSize: size.sm, lineHeight: 20, color: color.text2 },
  switchTextOn: { color: color.bg },
});
