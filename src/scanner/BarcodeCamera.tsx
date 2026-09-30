/**
 * Barcode mode: expo-camera's built-in scanner (works in Expo Go and in the
 * installed app). Reports each valid product barcode once until `reset` changes.
 */
import { CameraView, type BarcodeScanningResult } from 'expo-camera';
import { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';

import { isValidBarcode, normalizeBarcode } from '../data/barcode';

type Props = {
  active: boolean;
  torch: boolean;
  onCode: (code: string) => void;
  /** Change this to allow the same code to be reported again. */
  resetKey: number;
  onError?: (message: string) => void;
};

export function BarcodeCamera({ active, torch, onCode, resetKey, onError }: Props) {
  const last = useRef<string | null>(null);
  useEffect(() => {
    last.current = null;
  }, [resetKey]);

  const onScanned = ({ data }: BarcodeScanningResult) => {
    const code = data.trim();
    if (!isValidBarcode(code) || last.current === code) return;
    last.current = code;
    onCode(normalizeBarcode(code));
  };

  return (
    <CameraView
      style={StyleSheet.absoluteFill}
      facing="back"
      active={active}
      enableTorch={torch}
      autofocus="on"
      barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e'] }}
      onBarcodeScanned={active ? onScanned : undefined}
      onMountError={(e) => onError?.(e.message)}
    />
  );
}
