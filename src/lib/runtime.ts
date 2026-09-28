import Constants, { ExecutionEnvironment } from 'expo-constants';

/**
 * Expo Go only ships Expo's bundled native modules, so VisionCamera + ML Kit
 * (live on-device OCR) are unavailable there. We fall back to expo-camera.
 */
export const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
