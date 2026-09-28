export type CapturedPhoto = {
  /** file:// URI of the full-resolution photo. */
  uri: string;
  /** Best OCR text for the photo, or null when OCR is unavailable (Expo Go). */
  text: string | null;
};

export type LiveReading = {
  text: string;
  lineHeightRatio: number | null;
};

/** Imperative handle shared by both camera implementations. */
export type ScannerCameraHandle = {
  capture: () => Promise<CapturedPhoto>;
};

export type ScannerCameraProps = {
  active: boolean;
  torch: boolean;
  /** Called ~every 300ms with the live OCR reading. Never called in Expo Go. */
  onReading?: (r: LiveReading) => void;
  onError?: (message: string) => void;
};
