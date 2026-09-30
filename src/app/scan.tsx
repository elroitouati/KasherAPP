import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CaptureButton } from '../components/CaptureButton';
import { CaptureReview } from '../components/CaptureReview';
import { IconButton } from '../components/IconButton';
import { BackIcon, TorchIcon } from '../components/icons';
import { LiveVerdict } from '../components/LiveVerdict';
import { PermissionGate } from '../components/PermissionGate';
import { ProductResult } from '../components/ProductResult';
import { ScanFrame, type FrameRect } from '../components/ScanFrame';
import { Txt } from '../components/Txt';
import { GUIDANCE_TEXT, StabilityTracker, type ScanState } from '../scanner/analysis';
import { isValidBarcode, normalizeBarcode } from '../data/barcode';
import { BarcodeCamera } from '../scanner/BarcodeCamera';
import { hasLiveOcr, ScannerCamera } from '../scanner/ScannerCamera';
import type { CapturedPhoto, LiveReading, ScannerCameraHandle } from '../scanner/types';
import { color, font, radius, risk, size, space } from '../theme/tokens';

type Mode = 'label' | 'barcode';

const IDLE_SCAN: ScanState = { guidance: 'point', progress: 0, locked: false, hasIngredients: false, text: '' };
const TOP_BAR = 56;

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

  const [mode, setMode] = useState<Mode>(params.mode === 'barcode' || params.code ? 'barcode' : 'label');
  const [scan, setScan] = useState<ScanState>(IDLE_SCAN);
  const [torch, setTorch] = useState(false);
  const [busy, setBusy] = useState(false);
  const [captured, setCaptured] = useState<CapturedPhoto | null>(null);
  // A link like kashercheck://scan?code=8000500310427 opens a product directly.
  const [productCode, setProductCode] = useState<string | null>(
    params.code && isValidBarcode(params.code) ? normalizeBarcode(params.code) : null,
  );
  const [barcodeReset, setBarcodeReset] = useState(0);
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
    setScan(IDLE_SCAN);
    setError(null);
    setMode(m);
  };

  const capture = useCallback(
    async (auto: boolean) => {
      if (capturing.current || !camera.current) return;
      capturing.current = true;
      setBusy(true);
      setError(null);
      Haptics.notificationAsync(
        auto ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning,
      ).catch(() => {});
      try {
        const photo = await camera.current.capture();
        setCaptured(photo);
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
      setScan(next);
      if (next.guidance === 'ready') capture(true);
    },
    [tracker, capture],
  );

  const onCode = useCallback((code: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setProductCode(code);
  }, []);

  // Label: tall window for an ingredient list. Barcode: wide, short window.
  const frameW = W - space[6] * 2;
  const frameH = mode === 'label' ? Math.min(frameW * 1.1, H * 0.46) : frameW * 0.55;
  const rect: FrameRect = {
    x: (W - frameW) / 2,
    y: insets.top + TOP_BAR + space[12] + space[4],
    width: frameW,
    height: frameH,
  };

  const overlayOpen = captured != null || productCode != null;
  const cameraActive = foreground && !overlayOpen;

  const guidance =
    mode === 'barcode'
      ? 'כוון את הברקוד לתוך המסגרת'
      : !hasLiveOcr
        ? 'צלם את רשימת הרכיבים'
        : GUIDANCE_TEXT[scan.guidance];
  const showLiveText = mode === 'label' && hasLiveOcr && scan.text.length > 0;

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
          resetKey={barcodeReset}
          onError={() => setError('המצלמה לא זמינה כרגע. נסה שוב.')}
        />
      )}

      <ScanFrame rect={rect} isLocked={mode === 'label' && scan.locked} />

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

      {/* Live risk tag from the dictionary, updated on every OCR tick. */}
      {showLiveText && (
        <View style={[styles.livePanel, { top: rect.y + rect.height + space[3] }]} pointerEvents="none">
          <LiveVerdict text={scan.text} />
        </View>
      )}

      {mode === 'barcode' && (
        <View style={[styles.livePanel, { top: rect.y + rect.height + space[4] }]} pointerEvents="none">
          <Txt variant="caption" style={styles.hint}>
            נחפש את המוצר במאגר הפתוח ונבדוק את רשימת הרכיבים שלו. בלי אינטרנט — נחפש במוצרים שהורדו.
          </Txt>
        </View>
      )}

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + space[4] }]}>
        {mode === 'label' ? (
          <CaptureButton progress={scan.progress} busy={busy} onPress={() => capture(false)} />
        ) : (
          <View style={styles.shutterSpacer} />
        )}
        <ModeSwitch mode={mode} onChange={switchMode} />
      </View>

      {captured && <CaptureReview photo={captured} onDone={() => setCaptured(null)} onHome={goHome} />}
      {productCode && (
        <ProductResult
          key={productCode}
          code={productCode}
          onNext={() => {
            setProductCode(null);
            setBarcodeReset((n) => n + 1);
          }}
          onScanLabel={() => {
            setProductCode(null);
            setBarcodeReset((n) => n + 1);
            switchMode('label');
          }}
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
  shutterSpacer: { height: 80 },
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
