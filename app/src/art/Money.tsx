import React from 'react';
import Svg, { Circle, Defs, Ellipse, G, Line, LinearGradient, Path, Rect, Stop, Text as T } from 'react-native-svg';
import { KRW_COINS, KRW_NOTES } from '@kotoventure/shared';

/**
 * Detailed Korean banknotes & coins (current series) at TRUE relative size.
 * Layout follows the real notes: watermark area left, portrait right, numerals top-left / bottom-right,
 * "한국은행" on the front, "THE BANK OF KOREA" on the back, per-note hologram & back artwork.
 * Every note carries a SAMPLE/견본 stamp so it can never be mistaken for real money.
 */

/** pixels per millimetre for a given on-screen width of the largest note (₩50,000 = 154 mm). */
export const mmScale = (largestNoteWidthPx: number) => largestNoteWidthPx / 154;

const txt = (x: number, y: number, s: string, size: number, fill: string, weight: any = '800', anchor: any = 'middle', extra: any = {}) => (
  <T x={x} y={y} fontSize={size} fill={fill} fontWeight={weight} textAnchor={anchor} {...extra}>
    {s}
  </T>
);

function Portrait({ value, x, y }: { value: number; x: number; y: number }) {
  // simple respectful busts; hats/hair differ per person
  const skin = '#EED7BE';
  const robe = { 1000: '#2F4F6F', 5000: '#6B3A1E', 10000: '#2E4A33', 50000: '#7A5A16' }[value as 1000];
  return (
    <G transform={`translate(${x},${y})`}>
      <Ellipse cx="0" cy="0" rx="17" ry="21" fill="#FFFFFF" opacity={0.45} />
      <Path d="M-16 20 Q-15 6 0 5 Q15 6 16 20 Z" fill={robe} />
      <Path d="M-4 6 L0 13 L4 6" stroke="#FFFFFF" strokeWidth="1.4" fill="none" />
      <Ellipse cx="0" cy="-4" rx="7.5" ry="9" fill={skin} />
      {value === 50000 ? (
        <G>
          <Path d="M-8 -6 Q-8 -15 0 -15 Q8 -15 8 -6 Q4 -11 0 -11 Q-4 -11 -8 -6Z" fill="#2B2B2B" />
          <Ellipse cx="0" cy="3.5" rx="0" ry="0" />
          <Path d="M-7 -6 Q-11 2 -6 8" stroke="#2B2B2B" strokeWidth="2.4" fill="none" />
          <Path d="M7 -6 Q11 2 6 8" stroke="#2B2B2B" strokeWidth="2.4" fill="none" />
        </G>
      ) : value === 10000 ? (
        <G>
          {/* ikseongwan crown */}
          <Path d="M-8 -9 L-8 -16 Q0 -20 8 -16 L8 -9 Z" fill="#1F1F1F" />
          <Rect x="-11" y="-16" width="4" height="3" rx="1" fill="#1F1F1F" />
          <Rect x="7" y="-16" width="4" height="3" rx="1" fill="#1F1F1F" />
          <Path d="M-3 4 Q0 7 3 4" stroke="#3B3B3B" strokeWidth="1" fill="none" />
          <Path d="M-2 5 L-1 10 M2 5 L1 10" stroke="#3B3B3B" strokeWidth="0.8" />
        </G>
      ) : (
        <G>
          {/* scholar's black hat (bokgeon/gat) and beard */}
          <Path d="M-8 -8 Q-7 -18 0 -18 Q7 -18 8 -8 Z" fill="#1F1F1F" />
          <Path d="M-3 3 Q0 11 3 3" fill="#3B3B3B" />
        </G>
      )}
      <Circle cx="-2.8" cy="-4" r="0.9" fill="#3B2A1A" />
      <Circle cx="2.8" cy="-4" r="0.9" fill="#3B2A1A" />
    </G>
  );
}

function FrontMotif({ value, dark }: { value: number; dark: string }) {
  switch (value) {
    case 1000: // Myeongnyundang hall + plum blossom
      return (
        <G opacity={0.55}>
          <Path d="M44 46 Q56 40 68 46 L66 48 L46 48 Z" fill={dark} />
          <Rect x="47" y="48" width="18" height="8" fill="none" stroke={dark} strokeWidth="0.8" />
          <Path d="M30 58 Q40 46 52 42" stroke={dark} strokeWidth="0.9" fill="none" />
          {[[38, 50], [44, 45], [50, 43]].map(([x, y]) => <Circle key={x} cx={x} cy={y} r="1.6" fill="#FFFFFF" stroke={dark} strokeWidth="0.4" />)}
        </G>
      );
    case 5000: // Ojukheon & black bamboo
      return (
        <G opacity={0.55}>
          {[40, 46, 52].map((x) => <Line key={x} x1={x} y1="58" x2={x + 2} y2="30" stroke={dark} strokeWidth="1.3" />)}
          <Path d="M48 36 l6 -3 M42 42 l-5 -2 M54 46 l6 -2" stroke={dark} strokeWidth="1" />
          <Path d="M58 52 Q66 47 74 52 L72 54 L60 54 Z" fill={dark} />
        </G>
      );
    case 10000: // sun, moon and five peaks screen
      return (
        <G opacity={0.55}>
          <Path d="M32 58 L38 44 L44 52 L50 38 L56 52 L62 44 L68 58 Z" fill="none" stroke={dark} strokeWidth="1" />
          <Circle cx="38" cy="34" r="3" fill="#E5383B" opacity={0.7} />
          <Circle cx="62" cy="34" r="3" fill="#FFFFFF" stroke={dark} strokeWidth="0.6" />
          {[0, 1, 2, 3].map((i) => <Line key={i} x1="74" y1={30 + i * 6} x2="80" y2={30 + i * 6} stroke={dark} strokeWidth="0.6" />)}
        </G>
      );
    default: // 50000: ink grapes & eggplant embroidery
      return (
        <G opacity={0.6}>
          <Path d="M36 30 Q50 34 60 44" stroke={dark} strokeWidth="1" fill="none" />
          {[[44, 38], [47, 42], [43, 43], [46, 46], [50, 46], [48, 50]].map(([x, y], i) => <Circle key={i} cx={x} cy={y} r="2" fill={dark} opacity={0.7} />)}
          <Path d="M56 50 Q60 44 66 48 Q66 56 58 56 Z" fill="#7C3AED" opacity={0.5} />
        </G>
      );
  }
}

function BackArt({ value, dark }: { value: number; dark: string }) {
  switch (value) {
    case 1000: // Gyesang Jeonggeo-do – house in the mountains by Jeong Seon
      return (
        <G>
          <Path d="M20 60 L34 34 L44 48 L56 28 L70 50 L80 40 L96 60 Z" fill={dark} opacity={0.35} />
          <Path d="M50 54 L56 50 L62 54 Z" fill={dark} />
          <Rect x="52" y="54" width="8" height="5" fill="#FFFFFF" stroke={dark} strokeWidth="0.6" />
          {[30, 74, 86].map((x) => <Path key={x} d={`M${x} 60 l2 -8 l2 8`} fill={dark} opacity={0.6} />)}
        </G>
      );
    case 5000: // Chochungdo – watermelon & cockscomb
      return (
        <G>
          <Ellipse cx="44" cy="54" rx="13" ry="8" fill="#1E5631" opacity={0.6} />
          {[36, 42, 48].map((x) => <Path key={x} d={`M${x} 47 Q${x + 2} 54 ${x} 61`} stroke="#0B3D1E" strokeWidth="1" fill="none" />)}
          <Line x1="68" y1="62" x2="68" y2="34" stroke="#2F6B2F" strokeWidth="1.4" />
          <Path d="M62 34 Q68 22 74 34 Q68 38 62 34Z" fill="#C0392B" opacity={0.75} />
          <Path d="M80 48 l4 -3 l1 4z" fill={dark} />
        </G>
      );
    case 10000: // Honcheonsigye & Bohyunsan telescope
      return (
        <G>
          <Circle cx="44" cy="44" r="13" fill="none" stroke={dark} strokeWidth="1.2" />
          <Ellipse cx="44" cy="44" rx="13" ry="5" fill="none" stroke={dark} strokeWidth="0.9" transform="rotate(-25 44 44)" />
          <Ellipse cx="44" cy="44" rx="5" ry="13" fill="none" stroke={dark} strokeWidth="0.9" />
          <Circle cx="44" cy="44" r="3" fill={dark} />
          <Line x1="44" y1="57" x2="44" y2="62" stroke={dark} strokeWidth="2" />
          <Path d="M66 62 L66 50 Q74 40 82 50 L82 62 Z" fill={dark} opacity={0.4} />
          <Line x1="74" y1="46" x2="80" y2="38" stroke={dark} strokeWidth="1.2" />
          {Array.from({ length: 8 }).map((_, i) => <Circle key={i} cx={20 + i * 10} cy={22 + (i % 3) * 3} r="0.8" fill={dark} />)}
        </G>
      );
    default: // Wolmaedo (plum & moon) + Pungjukdo (bamboo)
      return (
        <G>
          <Circle cx="38" cy="32" r="8" fill="#FFFFFF" opacity={0.8} />
          <Path d="M24 62 Q34 46 44 40 Q50 36 56 30" stroke={dark} strokeWidth="1.4" fill="none" />
          {[[34, 50], [42, 42], [50, 36], [30, 56]].map(([x, y], i) => <Circle key={i} cx={x} cy={y} r="1.8" fill="#FFFFFF" stroke={dark} strokeWidth="0.5" />)}
          {[68, 74].map((x) => <Line key={x} x1={x} y1="62" x2={x + 3} y2="26" stroke={dark} strokeWidth="1.2" />)}
          <Path d="M71 34 l10 -2 M72 42 l10 0 M75 30 l8 -5 M73 50 l9 2" stroke={dark} strokeWidth="1" />
        </G>
      );
  }
}

function Hologram({ value }: { value: number }) {
  if (value === 1000) return null;
  return (
    <G>
      <Defs>
        <LinearGradient id={`holo${value}`} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#E0F2FE" />
          <Stop offset="0.5" stopColor="#F5D0FE" />
          <Stop offset="1" stopColor="#FEF9C3" />
        </LinearGradient>
      </Defs>
      {value === 5000 && <Circle cx="12" cy="48" r="6" fill={`url(#holo${value})`} stroke="#94A3B8" strokeWidth="0.4" />}
      {value === 10000 && <Rect x="6" y="42" width="11" height="11" fill={`url(#holo${value})`} stroke="#94A3B8" strokeWidth="0.4" />}
      {value === 50000 && <Rect x="22" y="2" width="5" height="64" fill={`url(#holo${value})`} stroke="#94A3B8" strokeWidth="0.4" />}
    </G>
  );
}

/** A banknote drawn in its own mm coordinate system (width × 68). */
export function Banknote({ value, side = 'front', width }: { value: number; side?: 'front' | 'back'; width: number }) {
  const n = KRW_NOTES.find((x) => x.value === value) ?? KRW_NOTES[0];
  const [w, h] = n.sizeMm;
  const s = w / 100; // horizontal stretch so art scales with the note length
  const num = value.toLocaleString('en-US').replace(/,/g, '');
  return (
    <Svg width={width} height={(width * h) / w} viewBox={`0 0 ${w} ${h}`}>
      <Rect x="0" y="0" width={w} height={h} rx="2" fill={n.color} stroke={n.dark} strokeWidth="0.8" />
      {/* guilloche-like fine lines */}
      {Array.from({ length: 9 }).map((_, i) => (
        <Path key={i} d={`M0 ${8 + i * 6} Q${w / 4} ${2 + i * 6} ${w / 2} ${8 + i * 6} T${w} ${8 + i * 6}`} stroke={n.dark} strokeWidth="0.25" opacity={0.25} fill="none" />
      ))}
      <Rect x="3" y="3" width={w - 6} height={h - 6} rx="1.5" fill="none" stroke={n.dark} strokeWidth="0.5" opacity={0.6} />
      {side === 'front' ? (
        <G>
          {/* watermark window (left) */}
          <Ellipse cx={value === 50000 ? 14 : 24} cy="34" rx="10" ry="13" fill="#FFFFFF" opacity={0.55} />
          <Hologram value={value} />
          <G transform={`scale(${s},1)`}>
            <FrontMotif value={value} dark={n.dark} />
          </G>
          <Portrait value={value} x={w - 32} y={34} />
          {txt(7, 14, num, 10, n.dark, '900', 'start')}
          {txt(w - 7, h - 7, num, 8, n.dark, '900', 'end')}
          {txt(w / 2 - 6, 13, '한국은행', 6.5, n.dark, '900')}
          {txt(w / 2 - 6, h - 8, n.ko, 8, n.dark, '900')}
          {txt(w - 10, 13, 'AA 1234567 A', 3.6, '#B91C1C', '700', 'end')}
        </G>
      ) : (
        <G>
          <G transform={`scale(${s},1)`}>
            <BackArt value={value} dark={n.dark} />
          </G>
          {txt(w - 8, 15, num, 11, n.dark, '900', 'end')}
          {txt(10, h - 8, 'THE BANK OF KOREA', 4.6, n.dark, '900', 'start')}
          {txt(w - 8, h - 8, num, 6, n.dark, '900', 'end')}
        </G>
      )}
      {/* SAMPLE stamp – never real money */}
      <G transform={`rotate(-14 ${w / 2} ${h / 2})`} opacity={0.82}>
        <Rect x={w / 2 - 26} y={h / 2 - 5.5} width="52" height="11" rx="2" fill="#FFFFFF" />
        {txt(w / 2, h / 2 + 3, 'SAMPLE · 견본', 7.5, '#E5383B', '900')}
      </G>
    </Svg>
  );
}

/** A coin at true size: pass the same px/mm scale used for notes. */
export function Coin({ value, side = 'front', pxPerMm }: { value: number; side?: 'front' | 'back'; pxPerMm: number }) {
  const c = KRW_COINS.find((x) => x.value === value) ?? KRW_COINS[0];
  const d = c.diameterMm * pxPerMm;
  const ink = value === 10 ? '#7C4A21' : '#4B5563';
  return (
    <Svg width={d} height={d} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="48" fill={c.color} stroke={ink} strokeWidth="2" />
      {value !== 10 && Array.from({ length: 60 }).map((_, i) => (
        <Line key={i} x1={50 + 46 * Math.cos((i / 60) * 6.283)} y1={50 + 46 * Math.sin((i / 60) * 6.283)} x2={50 + 49 * Math.cos((i / 60) * 6.283)} y2={50 + 49 * Math.sin((i / 60) * 6.283)} stroke={ink} strokeWidth="1" opacity={0.5} />
      ))}
      <Circle cx="50" cy="50" r="40" fill="none" stroke={ink} strokeWidth="1" opacity={0.6} />
      {side === 'back' ? (
        <G>
          {txt(50, 58, String(value), value >= 100 ? 26 : 30, ink, '900')}
          {txt(50, 26, '한국은행', 9, ink, '800')}
          {txt(50, 80, '2024', 9, ink, '800')}
        </G>
      ) : value === 10 ? (
        <G stroke={ink} strokeWidth="2" fill="none">
          {/* Dabotap pagoda */}
          <Path d="M36 74 L64 74 M40 74 L40 64 L60 64 L60 74 M38 64 L62 64 M42 64 L42 54 L58 54 L58 64 M40 54 L60 54 M44 54 L46 44 L54 44 L56 54 M44 44 L56 44 M47 44 L48 36 L52 36 L53 44 M50 36 L50 24" />
          {txt(50, 90, '10', 10, ink, '900')}
        </G>
      ) : value === 50 ? (
        <G stroke={ink} strokeWidth="2" fill="none">
          {/* ear of rice */}
          <Path d="M46 82 Q50 50 60 22" />
          {[0, 1, 2, 3, 4, 5].map((i) => <Ellipse key={i} cx={52 + i * 1.6 + (i % 2 ? 6 : -4)} cy={70 - i * 8} rx="4" ry="2" transform={`rotate(${i % 2 ? -30 : 30} ${52 + i * 1.6} ${70 - i * 8})`} />)}
        </G>
      ) : value === 100 ? (
        <G>
          {/* Admiral Yi Sun-sin */}
          <Ellipse cx="50" cy="46" rx="13" ry="16" fill="none" stroke={ink} strokeWidth="2" />
          <Path d="M36 40 Q50 22 64 40 L60 32 Q50 24 40 32 Z" fill={ink} opacity={0.8} />
          <Path d="M43 54 Q50 66 57 54" fill={ink} opacity={0.6} />
          <Path d="M30 84 Q32 66 50 64 Q68 66 70 84" fill="none" stroke={ink} strokeWidth="2" />
        </G>
      ) : (
        <G stroke={ink} strokeWidth="2" fill="none">
          {/* crane in flight */}
          <Path d="M20 50 Q40 30 50 46 Q60 30 82 40 Q64 44 56 52 Q52 60 44 58 Q36 60 20 50Z" />
          <Path d="M56 52 L80 64" />
          <Circle cx="77" cy="40" r="2" fill={ink} />
        </G>
      )}
    </Svg>
  );
}

/** Info text for the note/coin, used by the money explorer. */
export const noteInfo = (value: number) => KRW_NOTES.find((n) => n.value === value);
export const coinInfo = (value: number) => KRW_COINS.find((c) => c.value === value);
