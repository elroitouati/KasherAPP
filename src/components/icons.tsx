import Svg, { Path } from 'react-native-svg';

type P = { size?: number; color: string };

/** Flashlight — torch toggle. `on` fills the beam. */
export function TorchIcon({ size = 24, color, on }: P & { on?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M7 2h10v4l-3 4v11a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V10L7 6V2Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
        fill={on ? color : 'none'}
      />
      <Path d="M7 6h10" stroke={on ? '#0B0D12' : color} strokeWidth={1.8} />
      <Path d="M12 13v3" stroke={on ? '#0B0D12' : color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}
