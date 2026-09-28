import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CaptureButton } from '../components/CaptureButton';
import { CaptureReview } from '../components/CaptureReview';
import { IconButton } from '../components/IconButton';
import { LiveVerdict } from '../components/LiveVerdict';
import { TorchIcon } from '../components/icons';
import { PermissionGate } from '../components/PermissionGate';
import { ScanFrame, type FrameRect } from '../components/ScanFrame';
import { Txt } from '../components/Txt';
import { GUIDANCE_TEXT, StabilityTracker, type ScanState } from '../scanner/analysis';
import { hasLiveOcr, ScannerCamera } from '../scanner/ScannerCamera';
import type { CapturedPhoto, LiveReading, ScannerCameraHandle } from '../scanner/types';
import { color, font, radius, risk, size, space } from '../theme/tokens';

const IDLE_SCAN: ScanState = { guidance: 'point', progress: 0, locked: false, hasIngredients: false, text: '' };
const TOP_BAR = 56;

export default function ScannerScreen() {
  return (
    <PermissionGate>
      <Scanner />
    </PermissionGate>
  );
}

function Scanner() {
  const insets = useSafeAreaInsets();
  const { width: W, height: H } = useWindowDimensions();

  const camera = useRef<ScannerCameraHandle>(null);
  const [tracker] = useState(() => new StabilityTracker());
  const capturing = useRef(false);

  const [scan, setScan] = useState<ScanState>(IDLE_SCAN);
  const [torch, setTorch] = useState(false);
  const [busy, setBusy] = useState(false);
  const [captured, setCaptured] = useState<CapturedPhoto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [foreground, setForeground] = useState(true);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => setForeground(s === 'active'));
    return () => sub.remove();
  }, []);

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

  // Scan window: full width minus gutters, a little taller than wide.
  const frameW = W - space[6] * 2;
  const frameH = Math.min(frameW * 1.1, H * 0.46);
  const rect: FrameRect = {
    x: (W - frameW) / 2,
    y: insets.top + TOP_BAR + space[12] + space[4],
    width: frameW,
    height: frameH,
  };

  const guidance = !hasLiveOcr ? 'צלם את רשימת הרכיבים' : GUIDANCE_TEXT[scan.guidance];
  const showLiveText = hasLiveOcr && scan.text.length > 0;

  return (
    <View style={styles.screen}>
      <ScannerCamera
        ref={camera}
        active={foreground && captured == null}
        torch={torch}
        onReading={onReading}
        onError={() => setError('המצלמה לא זמינה כרגע. סגור אפליקציות אחרות שמשתמשות בה ונסה שוב.')}
      />

      <ScanFrame rect={rect} isLocked={scan.locked} />

      {/* Top bar: title at the start (right), torch at the end (left). */}
      <View style={[styles.topBar, { top: insets.top }]}>
        <View style={styles.titleBlock}>
          <Txt variant="title">בודק כשרות</Txt>
          {!hasLiveOcr && <Txt variant="label">Expo Go · סריקה חיה כבויה</Txt>}
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

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + space[6] }]}>
        <CaptureButton progress={scan.progress} busy={busy} onPress={() => capture(false)} />
      </View>

      {captured && <CaptureReview photo={captured} onDone={() => setCaptured(null)} />}
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
  titleBlock: { gap: 0 },
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
  bottomBar: { position: 'absolute', start: 0, end: 0, bottom: 0, alignItems: 'center' },
});
