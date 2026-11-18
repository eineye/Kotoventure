import React from 'react';
import Svg, { Circle, Ellipse, G, Line, Path, Rect, Text as T } from 'react-native-svg';
import type { PropId } from '@kotoventure/shared';

/**
 * 2D illustrations of things a traveller must recognise in Korea.
 * Important real-world items (banknotes, signs) keep their real colours, numbers and Korean text
 * so players recognise them on the street – banknotes carry a "SAMPLE/견본" mark.
 * All drawn in a 100×100 box.
 */

const K = '#1B2140';
const txt = (x: number, y: number, s: string, size = 10, fill = K, weight: any = '800', anchor: any = 'middle') => (
  <T x={x} y={y} fontSize={size} fill={fill} fontWeight={weight} textAnchor={anchor}>{s}</T>
);

/* ── Banknotes ───────────────────────────────────────────── */
function Note({ value, label, color, dark, person, hanbok }: { value: string; label: string; color: string; dark: string; person: string; hanbok: string }) {
  return (
    <G>
      <Rect x="2" y="24" width="96" height="52" rx="3" fill={color} stroke={dark} strokeWidth="1.5" />
      <Rect x="6" y="28" width="88" height="44" rx="2" fill="none" stroke={dark} strokeWidth="0.8" opacity={0.6} />
      {/* watermark circle on the left, portrait on the right like the real notes */}
      <Circle cx="22" cy="52" r="10" fill="#FFFFFF" opacity={0.35} />
      <Ellipse cx="72" cy="52" rx="15" ry="18" fill="#FFFFFF" opacity={0.35} />
      <Circle cx="72" cy="46" r="7" fill="#F1D3B3" />
      <Path d="M64 44 Q72 34 80 44 L80 41 Q72 32 64 41Z" fill="#2B2B2B" />
      <Path d="M60 66 Q60 56 72 55 Q84 56 84 66Z" fill={hanbok} />
      {txt(8, 37, value, 9, dark, '900', 'start')}
      {txt(92, 71, value, 7, dark, '900', 'end')}
      {txt(40, 40, '한국은행', 6, dark, '700')}
      {txt(40, 64, label, 8, dark, '900')}
      {txt(72, 75, person, 4.5, dark, '700')}
      <G transform="rotate(-18 50 50)" opacity={0.75}>
        <Rect x="26" y="45" width="48" height="11" rx="2" fill="#FFFFFF" />
        {txt(50, 53.5, 'SAMPLE · 견본', 7, '#E5383B', '900')}
      </G>
    </G>
  );
}
const note1000 = <Note value="1000" label="천원" color="#A9CCE8" dark="#1F4E79" person="이황 Yi Hwang" hanbok="#2F5D8A" />;
const note5000 = <Note value="5000" label="오천원" color="#F2B48C" dark="#8A3B12" person="이이 Yi I" hanbok="#7A3417" />;
const note10000 = <Note value="10000" label="만원" color="#A8D5A2" dark="#1E5631" person="세종대왕 King Sejong" hanbok="#1E5631" />;
const note50000 = <Note value="50000" label="오만원" color="#F5DC8A" dark="#8A6A08" person="신사임당 Shin Saimdang" hanbok="#7D5A0B" />;

/* ── Coins ───────────────────────────────────────────────── */
const coin = (cx: number, cy: number, r: number, v: string, fill: string, motif: string) => (
  <G key={v}>
    <Circle cx={cx} cy={cy} r={r} fill={fill} stroke="#6B7280" strokeWidth="1.2" />
    <Circle cx={cx} cy={cy} r={r - 3} fill="none" stroke="#FFFFFF" strokeWidth="0.8" opacity={0.7} />
    {txt(cx, cy + 3, v, r * 0.62, '#374151', '900')}
    {txt(cx, cy + r + 8, motif, 5.2, '#374151', '700')}
  </G>
);

/* ── Signs ───────────────────────────────────────────────── */
const signBoard = (bg: string, big: string, sub: string, fg = '#FFFFFF', bigSize = 34) => (
  <G>
    <Rect x="6" y="14" width="88" height="72" rx="10" fill={bg} />
    <Rect x="10" y="18" width="80" height="64" rx="7" fill="none" stroke={fg} strokeWidth="1.5" opacity={0.6} />
    {txt(50, 56, big, bigSize, fg, '900')}
    {txt(50, 75, sub, Math.min(9, 150 / sub.length), fg, '800')}
  </G>
);
const ban = (inner: React.ReactNode) => (
  <G>
    {inner}
    <Circle cx="50" cy="50" r="40" fill="none" stroke="#E5383B" strokeWidth="8" />
    <Line x1="22" y1="22" x2="78" y2="78" stroke="#E5383B" strokeWidth="8" />
  </G>
);

/* ── Food helpers ────────────────────────────────────────── */
const bowl = (soup: string, inner?: React.ReactNode, rim = '#F5F5F4') => (
  <G>
    <Ellipse cx="50" cy="80" rx="34" ry="6" fill="#000" opacity={0.1} />
    <Path d="M12 48 Q14 82 50 84 Q86 82 88 48 Z" fill={rim} stroke="#A8A29E" strokeWidth="1.5" />
    <Ellipse cx="50" cy="48" rx="38" ry="14" fill={rim} stroke="#A8A29E" strokeWidth="1.5" />
    <Ellipse cx="50" cy="49" rx="33" ry="10.5" fill={soup} />
    {inner}
  </G>
);
const steam = (
  <G stroke="#94A3B8" strokeWidth="2" fill="none" strokeLinecap="round" opacity={0.7}>
    <Path d="M38 30 q-4 -6 0 -12 q4 -6 0 -12" />
    <Path d="M52 30 q-4 -6 0 -12 q4 -6 0 -12" />
    <Path d="M66 30 q-4 -6 0 -12 q4 -6 0 -12" />
  </G>
);
const building = (wall: string, roof: string, label: string, labelColor = '#FFFFFF') => (
  <G>
    <Rect x="20" y="22" width="60" height="68" rx="3" fill={wall} />
    <Rect x="16" y="16" width="68" height="10" rx="2" fill={roof} />
    {[0, 1, 2].map((r) => [0, 1, 2].map((c) => <Rect key={`${r}${c}`} x={27 + c * 17} y={32 + r * 14} width="11" height="8" rx="1" fill="#BFE3FF" />))}
    <Rect x="42" y="74" width="16" height="16" fill="#334155" />
    <Rect x="24" y="2" width="52" height="13" rx="3" fill={roof} />
    {txt(50, 12, label, 9, labelColor, '900')}
  </G>
);
const person = (x: number, y: number, color: string, s = 1) => (
  <G transform={`translate(${x},${y}) scale(${s})`}>
    <Circle cx="0" cy="-26" r="7" fill="#F1C9A5" />
    <Rect x="-7" y="-18" width="14" height="22" rx="6" fill={color} />
    <Rect x="-6" y="3" width="5" height="12" rx="2" fill="#334155" />
    <Rect x="1" y="3" width="5" height="12" rx="2" fill="#334155" />
  </G>
);

const PROPS: Record<PropId, React.ReactNode> = {
  /* money */
  'krw-1000': note1000,
  'krw-5000': note5000,
  'krw-10000': note10000,
  'krw-50000': note50000,
  'krw-notes': (
    <G>
      <G transform="translate(-6,-22) scale(0.8)">{note1000}</G>
      <G transform="translate(14,-8) scale(0.8)">{note5000}</G>
      <G transform="translate(-6,10) scale(0.8)">{note10000}</G>
      <G transform="translate(14,26) scale(0.8)">{note50000}</G>
    </G>
  ),
  coins: (
    <G>
      {coin(22, 36, 13, '10', '#D7A26A', '다보탑')}
      {coin(64, 34, 15, '50', '#D1D5DB', '벼 rice')}
      {coin(30, 72, 16.5, '100', '#D1D5DB', '이순신')}
      {coin(72, 70, 18, '500', '#E5E7EB', '학 crane')}
    </G>
  ),
  atm: (
    <G>
      <Rect x="20" y="8" width="60" height="86" rx="6" fill="#1D4ED8" />
      <Rect x="20" y="8" width="60" height="16" rx="6" fill="#0B2E8A" />
      {txt(50, 20, 'GLOBAL ATM', 8, '#FFFFFF', '900')}
      <Rect x="28" y="30" width="44" height="26" rx="2" fill="#DBEAFE" />
      {txt(50, 41, 'English', 7, K, '800')}
      {txt(50, 51, '한국어 中文 日本語', 5.5, K, '700')}
      {[0, 1, 2].map((r) => [0, 1, 2].map((c) => <Rect key={`${r}${c}`} x={32 + c * 12} y={62 + r * 8} width="9" height="6" rx="1" fill="#E5E7EB" />))}
      <Rect x="34" y="88" width="32" height="3" rx="1" fill="#0F172A" />
    </G>
  ),
  exchange: (
    <G>
      <Circle cx="30" cy="40" r="22" fill="#1E9E6A" />
      {txt(30, 49, '₩', 26, '#FFFFFF', '900')}
      <Circle cx="70" cy="62" r="22" fill="#2D6CDF" />
      {txt(70, 71, '$', 26, '#FFFFFF', '900')}
      <Path d="M56 22 Q76 22 78 38 l5 -4 M78 38 l-6 -3" stroke={K} strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <Path d="M44 82 Q24 82 22 66 l-5 4 M22 66 l6 3" stroke={K} strokeWidth="3.5" fill="none" strokeLinecap="round" />
    </G>
  ),
  'exchange-rate': (
    <G>
      <Rect x="8" y="12" width="84" height="76" rx="8" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
      <Path d="M16 70 L32 58 L46 62 L60 40 L72 46 L86 26" stroke="#E5383B" strokeWidth="4" fill="none" strokeLinejoin="round" />
      {txt(18, 30, 'KRW', 12, K, '900', 'start')}
      {txt(50, 84, '₩10,000 ≈ $7', 9, '#5A6283', '800')}
    </G>
  ),
  'phone-pay': (
    <G>
      <Rect x="14" y="8" width="40" height="80" rx="8" fill={K} />
      <Rect x="18" y="16" width="32" height="62" rx="3" fill="#E0F2FE" />
      <Path d="M58 42 q8 8 0 16 M64 36 q14 14 0 28 M70 30 q20 20 0 40" stroke="#2D6CDF" strokeWidth="3" fill="none" strokeLinecap="round" />
      <Rect x="24" y="34" width="20" height="13" rx="2" fill="#FFC93C" />
      <Rect x="58" y="70" width="34" height="22" rx="3" fill="#1D4ED8" />
      <Rect x="62" y="75" width="8" height="6" rx="1" fill="#FFC93C" />
      {txt(83, 89, 'VISA·MC', 5, '#FFFFFF', '900')}
    </G>
  ),
  'tax-refund': (
    <G>
      <Path d="M50 6 L90 22 L90 54 Q90 82 50 96 Q10 82 10 54 L10 22 Z" fill="#E5383B" />
      {txt(50, 46, 'TAX', 20, '#FFFFFF', '900')}
      {txt(50, 68, 'FREE', 20, '#FFFFFF', '900')}
      {txt(50, 82, '즉시환급', 8, '#FFE4E6', '800')}
    </G>
  ),
  kiosk: (
    <G>
      <Rect x="26" y="6" width="48" height="66" rx="5" fill="#334155" />
      <Rect x="30" y="10" width="40" height="54" rx="3" fill="#FFFFFF" />
      {[0, 1].map((r) => [0, 1].map((c) => <Rect key={`${r}${c}`} x={33 + c * 19} y={14 + r * 20} width="15" height="15" rx="2" fill={['#F08A24', '#E5383B', '#22A06B', '#FFC93C'][r * 2 + c]} />))}
      <Rect x="33" y="54" width="34" height="7" rx="2" fill="#1D4ED8" />
      <Rect x="44" y="72" width="12" height="18" fill="#475569" />
      <Rect x="32" y="88" width="36" height="6" rx="2" fill="#475569" />
      {txt(50, 60, 'EN 한', 5, '#FFFFFF', '900')}
    </G>
  ),
  /* transport */
  tmoney: (
    <G>
      <Rect x="6" y="22" width="88" height="56" rx="7" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
      <Path d="M6 58 Q50 40 94 58 L94 71 Q94 78 87 78 L13 78 Q6 78 6 71 Z" fill="#F08A24" />
      {txt(12, 42, 'T-money', 15, '#E5383B', '900', 'start')}
      {txt(12, 52, '티머니 · 교통카드', 7, K, '800', 'start')}
      <Rect x="70" y="30" width="16" height="12" rx="2" fill="#E3B04B" />
      {txt(50, 73, 'Tap IN · Tap OUT', 7, '#FFFFFF', '900')}
    </G>
  ),
  arex: (
    <G>
      <Path d="M4 70 L4 40 Q4 28 18 28 L80 28 Q96 30 96 48 L96 70 Z" fill="#E8F0FF" stroke="#0B4DA2" strokeWidth="2" />
      <Rect x="4" y="56" width="92" height="6" fill="#0B4DA2" />
      {[12, 30, 48, 66].map((x) => <Rect key={x} x={x} y="36" width="12" height="12" rx="2" fill="#7FB3FF" />)}
      <Path d="M84 36 L92 36 Q94 44 94 50 L84 50 Z" fill="#7FB3FF" />
      {txt(40, 54, 'AREX', 7, '#0B4DA2', '900')}
      <Circle cx="20" cy="74" r="5" fill="#334155" />
      <Circle cx="80" cy="74" r="5" fill="#334155" />
      <Rect x="0" y="80" width="100" height="4" fill="#94A3B8" />
      {txt(50, 96, 'Incheon Airport ⇄ Seoul Stn', 7, K, '800')}
    </G>
  ),
  'subway-sign': (
    <G>
      <Rect x="4" y="22" width="92" height="56" rx="6" fill="#1F2937" />
      <Circle cx="22" cy="50" r="13" fill="#00A84D" />
      {txt(22, 56, '2', 16, '#FFFFFF', '900')}
      {txt(40, 46, '시청', 15, '#FFFFFF', '900', 'start')}
      {txt(40, 60, 'City Hall  201', 9, '#D1D5DB', '800', 'start')}
      <Rect x="4" y="72" width="92" height="6" fill="#00A84D" />
      {txt(50, 92, 'colour + number = your line', 7, '#5A6283', '800')}
    </G>
  ),
  bus: (
    <G>
      <Rect x="6" y="20" width="88" height="56" rx="10" fill="#2D6CDF" />
      <Rect x="12" y="28" width="58" height="22" rx="3" fill="#BFE3FF" />
      <Rect x="74" y="28" width="14" height="40" rx="2" fill="#BFE3FF" />
      <Rect x="6" y="20" width="88" height="7" rx="3" fill="#1E40AF" />
      {txt(40, 26, '470', 6, '#FFFFFF', '900')}
      <Circle cx="24" cy="78" r="8" fill="#1F2937" />
      <Circle cx="76" cy="78" r="8" fill="#1F2937" />
      {txt(40, 64, 'FRONT IN · BACK OUT', 6.5, '#FFFFFF', '900')}
    </G>
  ),
  taxi: (
    <G>
      <Path d="M8 66 L14 46 Q18 38 28 38 L72 38 Q82 38 86 46 L92 66 Z" fill="#F08A24" />
      <Rect x="6" y="60" width="88" height="16" rx="6" fill="#F08A24" />
      <Path d="M22 48 L28 42 L48 42 L48 54 L20 54 Z M52 42 L72 42 L78 48 L80 54 L52 54 Z" fill="#BFE3FF" />
      <Rect x="36" y="26" width="28" height="12" rx="3" fill="#FFC93C" />
      {txt(50, 35, 'TAXI', 8, K, '900')}
      <Circle cx="26" cy="78" r="8" fill="#1F2937" />
      <Circle cx="74" cy="78" r="8" fill="#1F2937" />
      {txt(50, 96, 'regular · 모범=black (deluxe)', 6.5, K, '800')}
    </G>
  ),
  ktx: (
    <G>
      <Path d="M4 70 L4 42 L56 32 Q86 34 98 66 L98 70 Z" fill="#FFFFFF" stroke="#334155" strokeWidth="2" />
      <Path d="M4 60 L98 60 L98 66 L4 66 Z" fill="#1D4ED8" />
      <Path d="M62 38 Q80 40 88 54 L64 54 Z" fill="#1F2937" />
      {[10, 26, 42].map((x) => <Rect key={x} x={x} y="44" width="12" height="8" rx="2" fill="#93C5FD" />)}
      {txt(26, 40, 'KTX', 8, '#1D4ED8', '900')}
      <Rect x="0" y="74" width="100" height="4" fill="#94A3B8" />
      {txt(50, 92, '~300 km/h', 9, K, '800')}
    </G>
  ),
  bike: (
    <G stroke="#1F2937" strokeWidth="3" fill="none">
      <Circle cx="24" cy="66" r="16" />
      <Circle cx="76" cy="66" r="16" />
      <Path d="M24 66 L42 40 L64 40 L76 66 M42 40 L52 66 L64 40 M38 32 L48 32 M64 40 L62 28 L72 26" stroke="#22A06B" strokeWidth="4" />
      <Rect x="40" y="18" width="20" height="10" rx="3" fill="#22A06B" stroke="none" />
      <Path d="M30 18 Q50 6 70 18" stroke="#E5383B" strokeWidth="0" />
    </G>
  ),
  ferry: (
    <G>
      <Rect x="0" y="74" width="100" height="26" fill="#60A5FA" />
      <Path d="M6 62 L94 62 L84 80 L16 80 Z" fill="#FFFFFF" stroke="#1E3A8A" strokeWidth="2" />
      <Rect x="22" y="44" width="56" height="18" rx="2" fill="#FFFFFF" stroke="#1E3A8A" strokeWidth="2" />
      <Rect x="36" y="30" width="28" height="14" rx="2" fill="#E5383B" />
      {[28, 40, 52, 64].map((x) => <Circle key={x} cx={x} cy="53" r="3" fill="#60A5FA" />)}
      <Path d="M6 88 q8 -4 16 0 t16 0 t16 0 t16 0 t16 0" stroke="#FFFFFF" strokeWidth="2" fill="none" />
    </G>
  ),
  crosswalk: (
    <G>
      <Rect x="0" y="60" width="100" height="40" fill="#4B5563" />
      {[6, 24, 42, 60, 78].map((x) => <Rect key={x} x={x} y="62" width="12" height="36" fill="#FFFFFF" />)}
      <Rect x="64" y="4" width="28" height="48" rx="4" fill="#111827" />
      <Circle cx="78" cy="16" r="8" fill="#3F3F46" />
      <Circle cx="78" cy="38" r="9" fill="#22C55E" />
      <Path d="M78 32 l0 8 m-4 -4 l8 0 m-4 4 l-3 6 m3 -6 l3 6" stroke="#052e16" strokeWidth="2" />
      <Rect x="30" y="20" width="26" height="18" rx="3" fill="#111827" />
      {txt(43, 34, '15', 13, '#22C55E', '900')}
    </G>
  ),
  idp: (
    <G>
      <Rect x="16" y="8" width="68" height="84" rx="4" fill="#9CA3AF" />
      <Rect x="20" y="12" width="60" height="76" rx="2" fill="#D1D5DB" />
      {txt(50, 34, 'INTERNATIONAL', 7, K, '900')}
      {txt(50, 44, 'DRIVING', 9, K, '900')}
      {txt(50, 54, 'PERMIT', 9, K, '900')}
      <Circle cx="50" cy="70" r="9" fill="none" stroke={K} strokeWidth="2" />
      {txt(50, 86, '+ home licence', 6, K, '800')}
    </G>
  ),
  passport: (
    <G>
      <Rect x="20" y="8" width="60" height="84" rx="5" fill="#1E3A8A" />
      <Circle cx="50" cy="44" r="14" fill="none" stroke="#FFC93C" strokeWidth="2.5" />
      <Path d="M36 44 L64 44 M50 30 Q42 44 50 58 Q58 44 50 30" stroke="#FFC93C" strokeWidth="2" fill="none" />
      {txt(50, 76, 'PASSPORT', 9, '#FFC93C', '900')}
    </G>
  ),
  /* lodging */
  hotel: building('#64748B', '#1E293B', 'HOTEL'),
  motel: (
    <G>
      {building('#7C3AED', '#4C1D95', 'MOTEL', '#F9A8D4')}
      <Rect x="66" y="40" width="12" height="30" rx="2" fill="#F472B6" />
      {txt(72, 60, '♥', 8, '#FFFFFF')}
    </G>
  ),
  house: (
    <G>
      <Path d="M10 46 L50 14 L90 46 Z" fill="#E5383B" />
      <Rect x="18" y="44" width="64" height="46" fill="#FDE68A" />
      <Rect x="44" y="62" width="14" height="28" fill="#92400E" />
      <Rect x="24" y="54" width="14" height="12" fill="#BFE3FF" />
      <Rect x="64" y="54" width="14" height="12" fill="#BFE3FF" />
      {txt(50, 98, 'registered stay ✓', 7, '#22A06B', '900')}
    </G>
  ),
  jjimjilbang: (
    <G>
      <Ellipse cx="50" cy="78" rx="40" ry="10" fill="#93C5FD" />
      <Path d="M30 70 q-6 -12 0 -24 q6 -12 0 -24 M50 70 q-6 -12 0 -24 q6 -12 0 -24 M70 70 q-6 -12 0 -24 q6 -12 0 -24" stroke="#E5383B" strokeWidth="5" fill="none" strokeLinecap="round" />
      <Circle cx="50" cy="78" r="6" fill="#E5383B" />
      {txt(50, 98, '찜질방 ♨ 24h', 9, K, '900')}
    </G>
  ),
  hanok: (
    <G>
      <Path d="M4 40 Q20 34 50 30 Q80 34 96 40 Q86 44 80 46 L20 46 Q14 44 4 40 Z" fill="#374151" />
      <Path d="M2 38 Q8 36 10 32 M98 38 Q92 36 90 32" stroke="#374151" strokeWidth="3" fill="none" />
      <Rect x="16" y="46" width="68" height="34" fill="#F5E6C8" />
      {[18, 38, 58, 78].map((x) => <Rect key={x} x={x} y="46" width="4" height="34" fill="#8B5A2B" />)}
      <Rect x="24" y="52" width="12" height="20" fill="#FFF8E7" stroke="#8B5A2B" strokeWidth="1" />
      <Rect x="44" y="52" width="12" height="20" fill="#FFF8E7" stroke="#8B5A2B" strokeWidth="1" />
      <Rect x="64" y="52" width="12" height="20" fill="#FFF8E7" stroke="#8B5A2B" strokeWidth="1" />
      <Rect x="10" y="80" width="80" height="8" fill="#9CA3AF" />
    </G>
  ),
  temple: (
    <G>
      <Path d="M2 36 Q20 30 50 26 Q80 30 98 36 L86 42 L14 42 Z" fill="#14532D" />
      <Path d="M14 42 L86 42 L86 46 L14 46Z" fill="#1E40AF" />
      <Path d="M14 46 L86 46 L86 48 L14 48Z" fill="#E5383B" />
      <Rect x="18" y="48" width="64" height="34" fill="#B91C1C" />
      <Rect x="28" y="54" width="44" height="28" fill="#FDE68A" />
      <Rect x="10" y="82" width="80" height="8" fill="#9CA3AF" />
      <Ellipse cx="30" cy="62" rx="5" ry="7" fill="#F472B6" />
      <Ellipse cx="70" cy="62" rx="5" ry="7" fill="#F472B6" />
    </G>
  ),
  pension: (
    <G>
      <Path d="M8 44 L50 16 L92 44 Z" fill="#92400E" />
      <Rect x="16" y="44" width="68" height="40" fill="#FBBF77" />
      <Rect x="24" y="52" width="22" height="18" fill="#BFE3FF" />
      <Rect x="58" y="56" width="16" height="28" fill="#78350F" />
      <Rect x="8" y="84" width="84" height="6" fill="#A16207" />
      <Path d="M20 96 l8 -10 l8 10" stroke="#334155" strokeWidth="2" fill="none" />
      <Rect x="18" y="84" width="20" height="4" fill="#1F2937" />
    </G>
  ),
  /* food */
  'call-bell': (
    <G>
      <Rect x="18" y="44" width="64" height="36" rx="10" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="2" />
      <Circle cx="50" cy="58" r="13" fill="#E5383B" />
      <Circle cx="50" cy="56" r="10" fill="#F87171" />
      {txt(50, 76, '호출 CALL', 7, K, '900')}
      <Path d="M30 30 l6 8 M50 24 l0 10 M70 30 l-6 8" stroke="#F08A24" strokeWidth="3" strokeLinecap="round" />
    </G>
  ),
  bibimbap: bowl('#7C2D12', (
    <G>
      <Path d="M24 48 Q30 40 40 44 L44 52 Q32 56 24 48Z" fill="#22A06B" />
      <Path d="M44 40 Q54 38 58 44 L50 52 Z" fill="#F08A24" />
      <Path d="M60 46 Q72 42 76 50 Q68 56 60 52Z" fill="#7C3AED" />
      <Path d="M28 54 Q40 60 46 56 L40 50 Z" fill="#FDE68A" />
      <Path d="M56 54 Q66 60 72 54 L64 50 Z" fill="#B45309" />
      <Ellipse cx="50" cy="49" rx="9" ry="6" fill="#FFFFFF" />
      <Circle cx="50" cy="49" r="4" fill="#FBBF24" />
      <Ellipse cx="62" cy="44" rx="5" ry="3" fill="#DC2626" />
    </G>
  ), '#1F2937'),
  chicken: (
    <G>
      <Path d="M14 44 L86 44 L80 88 L20 88 Z" fill="#FFFFFF" stroke="#E5383B" strokeWidth="3" />
      {txt(50, 80, 'CHICKEN', 9, '#E5383B', '900')}
      <Ellipse cx="34" cy="40" rx="14" ry="11" fill="#C2410C" />
      <Ellipse cx="56" cy="36" rx="14" ry="11" fill="#B45309" />
      <Ellipse cx="72" cy="42" rx="12" ry="10" fill="#DC2626" />
      <Rect x="18" y="52" width="16" height="12" rx="2" fill="#FEF9C3" stroke="#CA8A04" />
      {txt(50, 96, '+ 치킨무 pickled radish', 6.5, K, '800')}
    </G>
  ),
  baekban: (
    <G>
      <Rect x="4" y="18" width="92" height="70" rx="8" fill="#D6B98C" />
      <Circle cx="28" cy="66" r="14" fill="#FFFFFF" />
      <Ellipse cx="28" cy="64" rx="10" ry="7" fill="#F8FAFC" stroke="#E5E7EB" />
      <Circle cx="72" cy="66" r="14" fill="#7C2D12" />
      <Ellipse cx="72" cy="64" rx="10" ry="7" fill="#EA580C" />
      {[[20, 34, '#DC2626'], [40, 32, '#22A06B'], [60, 32, '#FDE68A'], [80, 34, '#78350F']].map(([x, y, c]) => (
        <G key={String(x)}><Circle cx={x as number} cy={y as number} r="9" fill="#FFFFFF" /><Circle cx={x as number} cy={y as number} r="6" fill={c as string} /></G>
      ))}
      <Rect x="46" y="50" width="3" height="34" fill="#9CA3AF" />
      <Ellipse cx="47.5" cy="48" rx="4" ry="6" fill="#9CA3AF" />
    </G>
  ),
  tang: (
    <G>{steam}{bowl('#F5F5DC', <G><Circle cx="40" cy="48" r="2.5" fill="#22A06B" /><Circle cx="56" cy="46" r="2.5" fill="#22A06B" /><Circle cx="62" cy="51" r="2.5" fill="#22A06B" /><Rect x="34" y="48" width="14" height="5" rx="2" fill="#D6B98C" /></G>, '#1F2937')}</G>
  ),
  jjigae: (
    <G>
      {steam}
      <Rect x="6" y="54" width="10" height="5" rx="2" fill="#475569" />
      <Rect x="84" y="54" width="10" height="5" rx="2" fill="#475569" />
      <Path d="M14 46 L86 46 L82 82 Q50 90 18 82 Z" fill="#334155" />
      <Ellipse cx="50" cy="46" rx="36" ry="10" fill="#DC2626" />
      <Rect x="36" y="42" width="10" height="7" rx="1" fill="#FFFBEB" />
      <Rect x="54" y="44" width="10" height="7" rx="1" fill="#FFFBEB" />
      <Path d="M28 44 q6 -4 10 2" stroke="#16A34A" strokeWidth="2.5" fill="none" />
    </G>
  ),
  gukbap: (
    <G>{steam}{bowl('#F8F4EC', <G><Path d="M30 46 L46 44 L46 50 L30 52Z" fill="#E7D3C1" /><Path d="M52 46 L68 46 L66 52 L52 52Z" fill="#E7D3C1" /><Circle cx="44" cy="53" r="2" fill="#16A34A" /><Circle cx="60" cy="43" r="2" fill="#16A34A" /></G>, '#1F2937')}<Ellipse cx="86" cy="86" rx="10" ry="5" fill="#FFFFFF" stroke="#A8A29E" /><Ellipse cx="86" cy="85" rx="6" ry="2.5" fill="#FCA5A5" /></G>
  ),
  bbq: (
    <G>
      <Circle cx="50" cy="52" r="38" fill="#374151" />
      <Circle cx="50" cy="52" r="32" fill="#6B7280" />
      {[-16, -6, 4, 14].map((dy) => <Rect key={dy} x="24" y={52 + dy} width="52" height="5" rx="2.5" fill={dy % 2 ? '#F5D0C5' : '#E8A598'} />)}
      <Path d="M70 86 Q86 70 96 80 Q88 96 70 86Z" fill="#22C55E" />
      {txt(50, 98, '삼겹살 · ssam', 7, K, '900')}
    </G>
  ),
  hotteok: (
    <G>
      <Ellipse cx="50" cy="56" rx="38" ry="28" fill="#C2410C" />
      <Ellipse cx="50" cy="52" rx="34" ry="24" fill="#EA8A3E" />
      <Path d="M30 52 Q50 64 70 52" stroke="#7C2D12" strokeWidth="5" fill="none" strokeLinecap="round" />
      {[38, 46, 54, 62].map((x) => <Ellipse key={x} cx={x} cy={56} rx="1.6" ry="2.6" fill="#FDE68A" />)}
      {txt(50, 96, 'HOT sugar inside!', 8, '#E5383B', '900')}
    </G>
  ),
  soju: (
    <G>
      <Path d="M30 30 L30 18 L40 18 L40 30 Q48 36 48 46 L48 90 Q48 94 44 94 L26 94 Q22 94 22 90 L22 46 Q22 36 30 30Z" fill="#16A34A" opacity={0.85} />
      <Rect x="29" y="12" width="12" height="7" rx="1" fill="#15803D" />
      <Rect x="24" y="56" width="22" height="20" rx="2" fill="#FFFFFF" />
      {txt(35, 69, '소주', 7, '#16A34A', '900')}
      <Path d="M60 62 L84 62 L80 92 L64 92 Z" fill="#E0F2FE" stroke="#94A3B8" strokeWidth="1.5" />
      <Path d="M62 72 L82 72 L80 92 L64 92 Z" fill="#BAE6FD" />
      {txt(72, 54, '건배!', 9, '#E5383B', '900')}
    </G>
  ),
  chopsticks: (
    <G>
      <Ellipse cx="34" cy="22" rx="11" ry="15" fill="#CBD5E1" stroke="#94A3B8" />
      <Rect x="31" y="34" width="6" height="58" rx="3" fill="#CBD5E1" stroke="#94A3B8" />
      <Rect x="56" y="8" width="5" height="84" rx="2" fill="#CBD5E1" stroke="#94A3B8" transform="rotate(4 58 50)" />
      <Rect x="66" y="8" width="5" height="84" rx="2" fill="#CBD5E1" stroke="#94A3B8" transform="rotate(-4 68 50)" />
      {txt(50, 99, 'spoon: rice & soup', 7, K, '800')}
    </G>
  ),
  kimchi: (
    <G>
      <Ellipse cx="50" cy="72" rx="40" ry="14" fill="#FFFFFF" stroke="#A8A29E" strokeWidth="1.5" />
      <Path d="M20 66 Q30 40 50 44 Q70 40 80 66 Q50 76 20 66Z" fill="#DC2626" />
      <Path d="M30 62 Q40 50 50 56 Q60 50 70 62" stroke="#FDE68A" strokeWidth="3" fill="none" />
      <Path d="M36 52 L40 60 M58 50 L56 60" stroke="#FEE2E2" strokeWidth="2" />
    </G>
  ),
  /* etiquette */
  'walk-right': (
    <G>
      <Rect x="4" y="10" width="92" height="80" rx="8" fill="#F1F5F9" />
      <Line x1="50" y1="14" x2="50" y2="86" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="6 4" />
      <Path d="M30 22 L30 70 l-8 -10 M30 70 l8 -10" stroke="#94A3B8" strokeWidth="5" fill="none" strokeLinecap="round" />
      <Path d="M70 22 L70 70 l-8 -10 M70 70 l8 -10" stroke="#94A3B8" strokeWidth="5" fill="none" strokeLinecap="round" transform="rotate(180 70 46)" />
      {person(70, 78, '#22A06B', 0.9)}
      {txt(70, 20, 'KEEP RIGHT', 7, '#22A06B', '900')}
    </G>
  ),
  queue: (
    <G>
      <Rect x="0" y="86" width="100" height="6" fill="#CBD5E1" />
      {person(84, 84, '#E5383B')}
      {person(62, 84, '#2D6CDF')}
      {person(40, 84, '#22A06B')}
      {person(18, 84, '#F08A24')}
      <Rect x="90" y="30" width="8" height="56" fill="#64748B" />
    </G>
  ),
  quiet: (
    <G>
      <Circle cx="50" cy="50" r="38" fill="#FDE68A" />
      <Ellipse cx="38" cy="42" rx="3" ry="4" fill={K} />
      <Ellipse cx="62" cy="42" rx="3" ry="4" fill={K} />
      <Rect x="46" y="48" width="8" height="30" rx="4" fill="#EDB98A" stroke="#B45309" />
      <Path d="M38 62 L62 62" stroke={K} strokeWidth="3" strokeLinecap="round" />
      {txt(84, 20, 'shh', 12, '#2D6CDF', '900')}
    </G>
  ),
  'priority-seat': (
    <G>
      <Rect x="10" y="44" width="80" height="20" rx="6" fill="#F472B6" />
      <Rect x="10" y="20" width="80" height="26" rx="6" fill="#F9A8D4" />
      <Rect x="16" y="64" width="8" height="18" fill="#9CA3AF" />
      <Rect x="76" y="64" width="8" height="18" fill="#9CA3AF" />
      <Circle cx="50" cy="28" r="5" fill="#FFFFFF" />
      <Path d="M44 46 Q44 34 50 34 Q60 36 58 46 Z" fill="#FFFFFF" />
      {txt(50, 94, '임산부 배려석 · leave empty', 7, '#BE185D', '900')}
    </G>
  ),
  'trash-bins': (
    <G>
      {[
        [6, '#6B7280', '일반', 'general'],
        [38, '#2D6CDF', '재활용', 'recycle'],
        [70, '#F59E0B', '음식물', 'food'],
      ].map(([x, c, k, e]) => (
        <G key={String(x)}>
          <Rect x={x as number} y="34" width="26" height="52" rx="3" fill={c as string} />
          <Rect x={(x as number) - 2} y="28" width="30" height="8" rx="2" fill="#1F2937" />
          {txt((x as number) + 13, 56, k as string, 7, '#FFFFFF', '900')}
          {txt((x as number) + 13, 68, e as string, 5.5, '#FFFFFF', '800')}
        </G>
      ))}
    </G>
  ),
  'shoes-off': (
    <G>
      <Rect x="0" y="66" width="100" height="26" fill="#A8A29E" />
      <Rect x="40" y="40" width="60" height="26" fill="#B45309" />
      <Path d="M8 64 Q8 54 18 54 L28 56 Q32 60 32 64Z" fill="#E5383B" />
      <Path d="M8 82 Q8 72 18 72 L28 74 Q32 78 32 82Z" fill="#E5383B" />
      <Path d="M46 38 l0 -14 m-6 6 l6 -6 l6 6" stroke="#22A06B" strokeWidth="3" fill="none" />
      {txt(70, 56, 'socks only', 8, '#FFFFFF', '900')}
    </G>
  ),
  'two-hands': (
    <G>
      <Rect x="34" y="20" width="32" height="20" rx="2" fill="#FFFFFF" stroke="#94A3B8" />
      {txt(50, 34, '₩', 10, '#22A06B', '900')}
      <Path d="M10 70 Q20 44 36 40 L44 46 L34 56 Z" fill="#EDB98A" />
      <Path d="M90 70 Q80 44 64 40 L56 46 L66 56 Z" fill="#EDB98A" />
      <Rect x="0" y="66" width="22" height="30" rx="6" fill="#2D6CDF" />
      <Rect x="78" y="66" width="22" height="30" rx="6" fill="#2D6CDF" />
      {txt(50, 72, '두 손으로', 8, K, '900')}
    </G>
  ),
  camera: (
    <G>
      <Rect x="10" y="30" width="80" height="54" rx="8" fill="#334155" />
      <Rect x="34" y="22" width="22" height="10" rx="2" fill="#334155" />
      <Circle cx="50" cy="57" r="18" fill="#1F2937" />
      <Circle cx="50" cy="57" r="11" fill="#60A5FA" />
      <Circle cx="76" cy="40" r="4" fill="#FFC93C" />
      {txt(50, 98, 'ask first: 사진 찍어도 돼요?', 6.5, K, '800')}
    </G>
  ),
  hanbok: (
    <G>
      <Path d="M30 20 L50 28 L70 20 L84 40 L72 44 L68 38 L66 46 L34 46 L32 38 L28 44 L16 40 Z" fill="#FDE68A" />
      <Path d="M50 28 L42 46 M50 28 L58 46" stroke="#B91C1C" strokeWidth="2" />
      <Path d="M48 38 Q38 54 44 62 M52 38 Q62 54 56 62" stroke="#B91C1C" strokeWidth="3" fill="none" />
      <Path d="M30 46 L70 46 Q86 80 80 94 L20 94 Q14 80 30 46Z" fill="#E5383B" />
    </G>
  ),
  /* law */
  police: (
    <G>
      {signBoard('#1E3A8A', '112', '경찰 POLICE', '#FFFFFF', 30)}
      <Path d="M50 20 L58 26 L56 34 L44 34 L42 26Z" fill="#FFC93C" />
    </G>
  ),
  'no-smoking': ban(
    <G>
      <Rect x="18" y="46" width="56" height="10" fill="#F5F5F4" />
      <Rect x="18" y="46" width="14" height="10" fill="#F08A24" />
      <Rect x="74" y="46" width="6" height="10" fill="#EF4444" />
      <Path d="M82 40 q4 -6 0 -12" stroke="#9CA3AF" strokeWidth="2" fill="none" />
    </G>,
  ),
  'no-drugs': ban(
    <G>
      <Path d="M50 24 L54 44 L70 34 L58 50 L78 52 L58 56 L66 70 L52 60 L50 78 L48 60 L34 70 L42 56 L22 52 L42 50 L30 34 L46 44Z" fill="#16A34A" />
      <Rect x="30" y="64" width="12" height="20" rx="3" fill="#94A3B8" />
    </G>,
  ),
  drone: ban(
    <G>
      <Rect x="38" y="44" width="24" height="12" rx="4" fill="#334155" />
      <Line x1="24" y1="40" x2="38" y2="48" stroke="#334155" strokeWidth="3" />
      <Line x1="76" y1="40" x2="62" y2="48" stroke="#334155" strokeWidth="3" />
      <Ellipse cx="22" cy="38" rx="10" ry="3" fill="#64748B" />
      <Ellipse cx="78" cy="38" rx="10" ry="3" fill="#64748B" />
    </G>,
  ),
  'alert-phone': (
    <G>
      <Rect x="24" y="6" width="52" height="88" rx="9" fill={K} />
      <Rect x="28" y="14" width="44" height="72" rx="3" fill="#FFF7ED" />
      <Path d="M50 22 L68 52 L32 52 Z" fill="#F59E0B" />
      {txt(50, 49, '!', 18, '#FFFFFF', '900')}
      {txt(50, 64, '재난문자', 8, '#E5383B', '900')}
      {txt(50, 76, 'Emergency Alert', 6, K, '800')}
      <Path d="M14 30 q-6 10 0 20 M86 30 q6 10 0 20" stroke="#E5383B" strokeWidth="3" fill="none" />
    </G>
  ),
  /* weather */
  seasons: (
    <G>
      <Rect x="4" y="4" width="45" height="45" rx="6" fill="#FCE7F3" />
      <Rect x="51" y="4" width="45" height="45" rx="6" fill="#FEF3C7" />
      <Rect x="4" y="51" width="45" height="45" rx="6" fill="#FFEDD5" />
      <Rect x="51" y="51" width="45" height="45" rx="6" fill="#E0F2FE" />
      {[0, 72, 144, 216, 288].map((a) => <Ellipse key={a} cx="26" cy="20" rx="4" ry="7" fill="#F472B6" transform={`rotate(${a} 26 26)`} />)}
      <Circle cx="73" cy="26" r="10" fill="#F59E0B" />
      <Path d="M26 60 L30 70 L40 68 L33 76 L38 86 L26 80 L14 86 L19 76 L12 68 L22 70Z" fill="#EA580C" />
      <Path d="M73 60 L73 88 M61 67 L85 81 M61 81 L85 67" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" />
      {txt(26, 46, 'Spring', 7, '#BE185D', '900')}
      {txt(73, 46, 'Summer', 7, '#B45309', '900')}
      {txt(26, 94, 'Autumn', 7, '#C2410C', '900')}
      {txt(73, 94, 'Winter', 7, '#1D4ED8', '900')}
    </G>
  ),
  spring: (
    <G>
      <Path d="M50 96 L50 50 M50 64 L30 44 M50 56 L72 38" stroke="#78350F" strokeWidth="4" />
      {[[30, 40], [72, 34], [50, 30], [40, 52], [62, 50]].map(([x, y], i) => (
        <G key={i}>{[0, 72, 144, 216, 288].map((a) => <Ellipse key={a} cx={x} cy={y - 5} rx="3.5" ry="5.5" fill="#F9A8D4" transform={`rotate(${a} ${x} ${y})`} />)}<Circle cx={x} cy={y} r="2" fill="#BE185D" /></G>
      ))}
    </G>
  ),
  summer: (
    <G>
      <Circle cx="50" cy="50" r="20" fill="#F59E0B" />
      {Array.from({ length: 8 }).map((_, i) => <Rect key={i} x="48" y="10" width="4" height="14" rx="2" fill="#F59E0B" transform={`rotate(${i * 45} 50 50)`} />)}
    </G>
  ),
  autumn: (
    <G>
      <Path d="M50 10 L58 34 L82 28 L68 46 L90 58 L64 62 L70 86 L50 72 L30 86 L36 62 L10 58 L32 46 L18 28 L42 34Z" fill="#EA580C" />
      <Path d="M50 72 L50 96" stroke="#7C2D12" strokeWidth="3" />
    </G>
  ),
  winter: (
    <G stroke="#3B82F6" strokeWidth="5" strokeLinecap="round">
      <Line x1="50" y1="10" x2="50" y2="90" />
      <Line x1="15" y1="30" x2="85" y2="70" />
      <Line x1="15" y1="70" x2="85" y2="30" />
      <Path d="M42 18 L50 26 L58 18 M42 82 L50 74 L58 82" fill="none" strokeWidth="3" />
      {txt(50, 99, '-15°C', 9, '#1D4ED8', '900')}
    </G>
  ),
  heatwave: (
    <G>
      <Circle cx="68" cy="30" r="16" fill="#F59E0B" />
      <Rect x="24" y="10" width="16" height="64" rx="8" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="2" />
      <Rect x="29" y="24" width="6" height="50" rx="3" fill="#E5383B" />
      <Circle cx="32" cy="80" r="12" fill="#E5383B" />
      {txt(70, 74, '35°C+', 16, '#E5383B', '900')}
      <Path d="M54 90 q6 -6 12 0 t12 0" stroke="#F59E0B" strokeWidth="3" fill="none" />
    </G>
  ),
  typhoon: (
    <G>
      <Path d="M50 50 m-30 0 a30 30 0 1 1 30 30 M50 50 m-16 0 a16 16 0 1 1 16 16" stroke="#475569" strokeWidth="7" fill="none" strokeLinecap="round" />
      <Circle cx="50" cy="50" r="5" fill="#475569" />
      {[[14, 84], [30, 92], [70, 90], [86, 82]].map(([x, y]) => <Line key={x} x1={x} y1={y - 10} x2={x - 4} y2={y} stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" />)}
    </G>
  ),
  umbrella: (
    <G>
      <Path d="M8 52 Q50 0 92 52 Q82 44 71 52 Q60 44 50 52 Q40 44 29 52 Q18 44 8 52Z" fill="#2D6CDF" />
      <Path d="M50 52 L50 86 Q50 94 42 94 Q36 94 36 88" stroke="#334155" strokeWidth="4" fill="none" strokeLinecap="round" />
      {[[20, 70], [80, 66], [68, 86], [26, 90]].map(([x, y]) => <Line key={x} x1={x} y1={y - 8} x2={x - 3} y2={y} stroke="#60A5FA" strokeWidth="3" strokeLinecap="round" />)}
    </G>
  ),
  'fine-dust': (
    <G>
      {Array.from({ length: 28 }).map((_, i) => <Circle key={i} cx={(i * 37) % 100} cy={(i * 23) % 40 + 4} r={1.5 + (i % 3)} fill="#A8A29E" opacity={0.7} />)}
      <Path d="M16 52 Q50 40 84 52 L80 80 Q50 92 20 80 Z" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="2" />
      <Path d="M16 56 L4 50 M84 56 L96 50" stroke="#94A3B8" strokeWidth="2" />
      {txt(50, 72, 'KF94', 13, '#2D6CDF', '900')}
    </G>
  ),
  /* medical */
  pharmacy: (
    <G>
      <Rect x="6" y="14" width="88" height="72" rx="10" fill="#FFFFFF" stroke="#16A34A" strokeWidth="4" />
      <Circle cx="50" cy="44" r="22" fill="#16A34A" />
      {txt(50, 54, '약', 28, '#FFFFFF', '900')}
      {txt(50, 80, '약국 PHARMACY', 9, '#16A34A', '900')}
    </G>
  ),
  hospital: (
    <G>
      {signBoard('#1D4ED8', '병원', 'HOSPITAL · CLINIC', '#FFFFFF', 26)}
      <Rect x="44" y="20" width="12" height="4" fill="#FFFFFF" />
      <Rect x="48" y="16" width="4" height="12" fill="#FFFFFF" />
    </G>
  ),
  hanuiwon: signBoard('#0F766E', '한의원', 'KOREAN MEDICINE', '#FFFFFF', 24),
  er: (
    <G>
      {signBoard('#DC2626', '응급실', 'EMERGENCY ROOM', '#FFFFFF', 24)}
      <Circle cx="82" cy="24" r="10" fill="#FFFFFF" />
      {txt(82, 28, '119', 7, '#DC2626', '900')}
    </G>
  ),
  convenience: (
    <G>
      <Rect x="8" y="30" width="84" height="62" fill="#F8FAFC" stroke="#94A3B8" />
      <Rect x="4" y="18" width="92" height="16" fill="#22A06B" />
      <Rect x="4" y="30" width="92" height="5" fill="#2D6CDF" />
      {txt(50, 30, '24 편의점 STORE', 9, '#FFFFFF', '900')}
      <Rect x="16" y="44" width="30" height="40" fill="#BFE3FF" />
      <Rect x="54" y="44" width="30" height="40" fill="#BFE3FF" />
      <Rect x="58" y="56" width="10" height="14" rx="2" fill="#FFFFFF" />
      <Rect x="61" y="61" width="4" height="4" fill="#E5383B" />
      {txt(50, 99, 'night meds: pain · digestion · cold', 6, K, '800')}
    </G>
  ),
  medicine: (
    <G>
      <Rect x="14" y="30" width="34" height="56" rx="6" fill="#F08A24" />
      <Rect x="12" y="20" width="38" height="12" rx="3" fill="#FFFFFF" stroke="#94A3B8" />
      <Rect x="18" y="48" width="26" height="20" rx="2" fill="#FFFFFF" />
      {txt(31, 62, '소화제', 7, '#C2410C', '900')}
      <Rect x="58" y="44" width="30" height="14" rx="7" fill="#E5383B" />
      <Rect x="73" y="44" width="15" height="14" rx="7" fill="#FFFFFF" stroke="#E5383B" />
      <Circle cx="66" cy="76" r="8" fill="#FFFFFF" stroke="#94A3B8" />
      <Circle cx="84" cy="76" r="8" fill="#FFFFFF" stroke="#94A3B8" />
    </G>
  ),
  insurance: (
    <G>
      <Rect x="14" y="10" width="52" height="70" rx="4" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="2" />
      {[24, 34, 44, 54].map((y) => <Rect key={y} x="22" y={y} width="36" height="4" rx="2" fill="#CBD5E1" />)}
      {txt(40, 72, 'RECEIPT', 7, K, '900')}
      <Path d="M70 40 L92 48 L92 64 Q92 82 70 92 Q48 82 48 64 L48 48 Z" fill="#22A06B" />
      <Path d="M60 66 L68 74 L82 58" stroke="#FFFFFF" strokeWidth="5" fill="none" strokeLinecap="round" />
    </G>
  ),
  hotline: (
    <G>
      <Circle cx="50" cy="50" r="42" fill="#2D6CDF" />
      <Path d="M32 30 Q28 34 30 42 Q38 62 58 70 Q66 72 70 68 L64 58 L56 62 Q46 56 40 46 L44 38 Z" fill="#FFFFFF" />
      {txt(50, 92, '1330', 14, '#FFC93C', '900')}
      {txt(72, 32, 'EN 中 日', 7, '#FFFFFF', '900')}
    </G>
  ),
  firstaid: (
    <G>
      <Rect x="10" y="28" width="80" height="58" rx="8" fill="#E5383B" />
      <Rect x="38" y="18" width="24" height="12" rx="3" fill="none" stroke="#B91C1C" strokeWidth="4" />
      <Rect x="44" y="42" width="12" height="32" rx="2" fill="#FFFFFF" />
      <Rect x="34" y="52" width="32" height="12" rx="2" fill="#FFFFFF" />
    </G>
  ),
};

export const hasProp = (id?: string) => !!id && id in PROPS;

export function Prop({ id, size = 96 }: { id?: string; size?: number }) {
  const art = id && (PROPS as Record<string, React.ReactNode>)[id];
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {art ?? (
        <G>
          <Circle cx="50" cy="50" r="40" fill="#E2E8F0" />
          {txt(50, 60, '?', 30, '#64748B')}
        </G>
      )}
    </Svg>
  );
}
