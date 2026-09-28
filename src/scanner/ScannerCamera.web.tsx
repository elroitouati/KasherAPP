/**
 * Web = design preview only. There is no native OCR in the browser, so we reuse
 * the Expo Go camera. With `?demo=1` a sample label is fed through the live
 * pipeline so the steady / countdown states can be previewed.
 */
import { forwardRef, useEffect } from 'react';

import { ExpoGoCamera } from './ExpoGoCamera';
import type { ScannerCameraHandle, ScannerCameraProps } from './types';

const demo = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('demo');

const SAMPLE =
  'INGREDIENTI: farina di grano tenero, zucchero, burro (latte), uova, gelatina, sciroppo di glucosio, emulsionante: E471, sale. Può contenere crostacei.';

export const hasLiveOcr = demo;

export const ScannerCamera = forwardRef<ScannerCameraHandle, ScannerCameraProps>((props, ref) => {
  const { onReading, active } = props;
  useEffect(() => {
    if (!demo || !active) return;
    const id = setInterval(() => onReading?.({ text: SAMPLE, lineHeightRatio: 0.03 }), 300);
    return () => clearInterval(id);
  }, [onReading, active]);
  return <ExpoGoCamera {...props} ref={ref} />;
});
ScannerCamera.displayName = 'ScannerCamera';
