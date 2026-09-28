import { forwardRef } from 'react';

import { isExpoGo } from '../lib/runtime';
import type { ScannerCameraHandle, ScannerCameraProps } from './types';

type CameraComponent = React.ForwardRefExoticComponent<
  ScannerCameraProps & React.RefAttributes<ScannerCameraHandle>
>;

// Required lazily: LiveCamera pulls in VisionCamera/ML Kit native modules,
// which would crash on import inside Expo Go.
/* eslint-disable @typescript-eslint/no-require-imports */
const Impl: CameraComponent = isExpoGo
  ? require('./ExpoGoCamera').ExpoGoCamera
  : require('./LiveCamera').LiveCamera;
/* eslint-enable @typescript-eslint/no-require-imports */

/** Live OCR camera in a dev build; plain camera with manual capture in Expo Go. */
export const ScannerCamera = forwardRef<ScannerCameraHandle, ScannerCameraProps>((props, ref) => (
  <Impl {...props} ref={ref} />
));
ScannerCamera.displayName = 'ScannerCamera';

/** Whether live on-device OCR is available in this runtime. */
export const hasLiveOcr = !isExpoGo;
