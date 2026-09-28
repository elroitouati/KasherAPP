/**
 * Dev-build camera: VisionCamera v5 + ML Kit text recognition in a frame
 * processor. Never import this file statically — it needs native modules that
 * Expo Go doesn't have. `ScannerCamera` requires it lazily.
 */
import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import {
  Camera,
  useCameraDevice,
  useFrameOutput,
  usePhotoOutput,
  type Frame,
} from 'react-native-vision-camera';
import {
  PhotoRecognizer,
  useTextRecognition,
  type Text as OcrText,
} from 'react-native-vision-camera-ocr-plus';
import { createSynchronizable, scheduleOnRN } from 'react-native-worklets';

import { hasIngredientsHeader, pickBestReading } from './analysis';
import type { CapturedPhoto, LiveReading, ScannerCameraHandle, ScannerCameraProps } from './types';

/** Live OCR cadence. */
const TICK_MS = 300;

const PHOTO_ORIENTATIONS = ['portrait', 'landscapeRight', 'landscapeLeft'] as const;

function toFileUri(path: string): string {
  return path.startsWith('file://') ? path : `file://${path}`;
}

/** OCR a still photo; if the upright read has no ingredient list, retry rotated ±90°. */
async function recognizePhoto(uri: string): Promise<string> {
  const results: { text: string }[] = [];
  for (const orientation of PHOTO_ORIENTATIONS) {
    try {
      const r = await PhotoRecognizer({ uri, orientation });
      results.push({ text: r.resultText ?? '' });
      if (hasIngredientsHeader(r.resultText ?? '')) break;
    } catch {
      // A failed orientation is not fatal — the others may still read.
    }
  }
  return pickBestReading(results)?.text ?? '';
}

export const LiveCamera = forwardRef<ScannerCameraHandle, ScannerCameraProps>(function LiveCamera(
  { active, torch, onReading, onError },
  ref,
) {
  const device = useCameraDevice('back');
  const photoOutput = usePhotoOutput({ qualityPrioritization: 'quality' });
  const { scanText } = useTextRecognition({ language: 'latin', frameSkipThreshold: 1 });

  // Last time (ms) a reading was sent to JS — shared with the frame-processor thread.
  const [lastSent] = useState(() => createSynchronizable(0));

  // Stable JS-side receiver so the worklet isn't re-installed on every render.
  const onReadingRef = useRef(onReading);
  onReadingRef.current = onReading;
  const emit = useCallback((r: LiveReading) => onReadingRef.current?.(r), []);

  const onFrame = useCallback(
    (frame: Frame) => {
      'worklet';
      const now = Date.now();
      if (now - lastSent.getDirty() >= TICK_MS) {
        // Non-blocking: schedules OCR on this frame, returns the previous tick's result.
        const result = scanText(frame) as OcrText;
        lastSent.setBlocking(now);
        const longSide = Math.max(frame.width, frame.height);
        const heights: number[] = [];
        for (const b of result.blocks ?? []) {
          for (const l of b.lines ?? []) heights.push(l.lineFrame.height);
        }
        heights.sort((a, b) => a - b);
        const median = heights.length ? heights[Math.floor(heights.length / 2)] : 0;
        scheduleOnRN(emit, {
          text: result.resultText ?? '',
          lineHeightRatio: median > 0 && longSide > 0 ? median / longSide : null,
        });
      }
      frame.dispose();
    },
    [scanText, lastSent, emit],
  );

  const frameOutput = useFrameOutput({
    pixelFormat: 'rgb', // required by ML Kit on Android
    onFrame,
    onFrameDropped: () => {}, // dropping frames while ML Kit is busy is expected
  });

  useImperativeHandle(ref, () => ({
    async capture(): Promise<CapturedPhoto> {
      const photo = await photoOutput.capturePhoto({ flashMode: 'off' }, {});
      try {
        const uri = toFileUri(await photo.saveToTemporaryFileAsync());
        const text = await recognizePhoto(uri);
        return { uri, text };
      } finally {
        photo.dispose();
      }
    },
  }));

  if (device == null) return null;

  return (
    <Camera
      style={StyleSheet.absoluteFill}
      device={device}
      isActive={active}
      outputs={[photoOutput, frameOutput]}
      torchMode={torch && device.hasTorch ? 'on' : 'off'}
      enableNativeTapToFocusGesture
      enableNativeZoomGesture
      resizeMode="cover"
      onError={(e) => onError?.(e.message)}
    />
  );
});
