/**
 * Web = design preview only. There is no native OCR in the browser, so we reuse
 * the Expo Go camera. With `?demo=1` a sample label is fed through the live
 * pipeline (and attached to the captured photo) so the live tag, countdown and
 * result states can be previewed.
 */
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

import { ExpoGoCamera } from './ExpoGoCamera';
import type { ScannerCameraHandle, ScannerCameraProps } from './types';

const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
const demo = params?.has('demo') ?? false;

const SAMPLES: Record<string, string> = {
  '1': 'Crostatina albicocca. INGREDIENTI: farina di grano tenero, zucchero, burro (latte), uova, gelatina, sciroppo di glucosio, emulsionante: E471, sale. Può contenere crostacei. Valori nutrizionali',
  pork: 'INGREDIENTI: mozzarella (latte, sale, caglio), prosciutto cotto (carne di suino, sale, destrosio), funghi porcini, olive.',
  cut: 'INGREDIENTI: farina di grano tenero, zucchero, olio di girasole, sciroppo di glu',
};
const SAMPLE = SAMPLES[params?.get('demo') ?? '1'] ?? SAMPLES['1'];

export const hasLiveOcr = demo;

export const ScannerCamera = forwardRef<ScannerCameraHandle, ScannerCameraProps>((props, ref) => {
  const { onReading, active } = props;
  const inner = useRef<ScannerCameraHandle>(null);

  useImperativeHandle(ref, () => ({
    async capture() {
      const photo = await inner.current!.capture();
      return demo ? { ...photo, text: SAMPLE } : photo;
    },
  }));

  useEffect(() => {
    if (!demo || !active) return;
    const id = setInterval(() => onReading?.({ text: SAMPLE, lineHeightRatio: 0.03 }), 300);
    return () => clearInterval(id);
  }, [onReading, active]);

  return <ExpoGoCamera {...props} ref={inner} />;
});
ScannerCamera.displayName = 'ScannerCamera';
