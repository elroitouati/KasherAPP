/**
 * One icon family: 24-grid, 1.8 stroke, round caps/joins.
 * Direction-aware icons (back) are drawn for RTL: "back" points right.
 */
import Svg, { Circle, Path } from 'react-native-svg';

import { color as tokens } from '../theme/tokens';

type P = { size?: number; color: string };

const stroke = { strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

/** Flashlight — torch toggle. `on` fills the body. */
export function TorchIcon({ size = 24, color, on }: P & { on?: boolean }) {
  const cut = on ? tokens.text1 : color;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M7 2h10v4l-3 4v11a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V10L7 6V2Z" stroke={color} {...stroke} fill={on ? color : 'none'} />
      <Path d="M7 6h10" stroke={cut} {...stroke} />
      <Path d="M12 13v3" stroke={cut} {...stroke} />
    </Svg>
  );
}

/** Scan corners with a reading line — the logo's motif. */
export function ScanIcon({ size = 24, color }: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 8V5a2 2 0 0 1 2-2h3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M8 21H5a2 2 0 0 1-2-2v-3" stroke={color} {...stroke} strokeWidth={2.2} />
      <Path d="M7 12h10" stroke={color} {...stroke} strokeWidth={2.2} />
    </Svg>
  );
}

/** Back — points right in RTL. */
export function BackIcon({ size = 24, color }: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 5l7 7-7 7" stroke={color} {...stroke} strokeWidth={2.2} />
    </Svg>
  );
}

export function InfoIcon({ size = 24, color }: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={color} {...stroke} />
      <Path d="M12 11v6" stroke={color} {...stroke} />
      <Circle cx={12} cy={7.6} r={1.1} fill={color} />
    </Svg>
  );
}

export function CheckIcon({ size = 20, color }: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 12.5l4.5 4.5L19 7.5" stroke={color} {...stroke} strokeWidth={2.4} />
    </Svg>
  );
}

export function CrossIcon({ size = 20, color }: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M7 7l10 10M17 7L7 17" stroke={color} {...stroke} strokeWidth={2.2} />
    </Svg>
  );
}

/** Barcode — vertical bars inside scan corners. */
export function BarcodeIcon({ size = 24, color }: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" stroke={color} {...stroke} />
      <Path d="M7 8v8M10 8v8M13 8v8M17 8v8" stroke={color} {...stroke} />
    </Svg>
  );
}

export function GlobeIcon({ size = 24, color }: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={color} {...stroke} />
      <Path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z" stroke={color} {...stroke} />
    </Svg>
  );
}
