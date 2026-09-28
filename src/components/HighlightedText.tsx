import type { StyleProp, TextStyle } from 'react-native';

import type { Finding } from '../kashrut/engine';
import { color, font, risk } from '../theme/tokens';
import { Txt } from './Txt';

type Props = {
  text: string;
  /** Findings with offsets into `text`. Traces are drawn muted and struck through. */
  findings: Finding[];
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
};

/** The label text as read, with every flagged word coloured by its level. */
export function HighlightedText({ text, findings, style, numberOfLines }: Props) {
  const marks = [...findings]
    .filter((f) => f.start >= 0 && f.end <= text.length)
    .sort((a, b) => a.start - b.start);
  const parts: React.ReactNode[] = [];
  let pos = 0;
  marks.forEach((f, i) => {
    if (f.start < pos) return; // overlapping — already drawn
    if (f.start > pos) parts.push(text.slice(pos, f.start));
    parts.push(
      <Txt
        key={i}
        latin
        style={
          f.trace
            ? { color: color.text3, textDecorationLine: 'line-through' }
            : { color: risk[f.level], fontFamily: font.bold }
        }
      >
        {text.slice(f.start, f.end)}
      </Txt>,
    );
    pos = f.end;
  });
  if (pos < text.length) parts.push(text.slice(pos));

  return (
    <Txt latin selectable numberOfLines={numberOfLines} style={style}>
      {parts}
    </Txt>
  );
}
