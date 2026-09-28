/**
 * Expo Go camera: expo-camera preview + manual capture. Expo Go has no
 * on-device OCR, so there are no live readings here — the captured photo is
 * checked later by Claude (step 4).
 */
import { CameraView } from 'expo-camera';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import { StyleSheet } from 'react-native';

import type { CapturedPhoto, ScannerCameraHandle, ScannerCameraProps } from './types';

export const ExpoGoCamera = forwardRef<ScannerCameraHandle, ScannerCameraProps>(
  function ExpoGoCamera({ active, torch, onError }, ref) {
    const camera = useRef<CameraView>(null);

    useImperativeHandle(ref, () => ({
      async capture(): Promise<CapturedPhoto> {
        const photo = await camera.current?.takePictureAsync({ quality: 0.9, skipProcessing: false });
        if (!photo) throw new Error('camera-not-ready');
        return { uri: photo.uri, text: null };
      },
    }));

    return (
      <CameraView
        ref={camera}
        style={StyleSheet.absoluteFill}
        facing="back"
        active={active}
        enableTorch={torch}
        autofocus="on"
        onMountError={(e) => onError?.(e.message)}
      />
    );
  },
);
