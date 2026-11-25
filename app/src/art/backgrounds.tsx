import React from 'react';
import { Image, type ImageSourcePropType } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, Line, LinearGradient, Path, RadialGradient, Rect, Stop, Text as T } from 'react-native-svg';
import type { BackgroundId } from '@kotoventure/shared';

/**
 * Scene backgrounds, 400×240. Landmarks are drawn to be recognisable
 * (Geunjeongjeon two-tier roof, N Seoul Tower, Cheomseongdae, Bulguksa terraces, Seongsan Ilchulbong…).
 */
const W = 400;
const H = 240;
const t = (x: number, y: number, s: string, size = 12, fill = '#1B2140', w: any = '900', a: any = 'middle') => (
  <T x={x} y={y} fontSize={size} fill={fill} fontWeight={w} textAnchor={a}>{s}</T>
);

/** Shared gradients: overlays that add light & depth on top of any base colour. */
const BgDefs = () => (
  <Defs>
    <LinearGradient id="bgx-down" x1="0" y1="0" x2="0" y2="1">
      <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.06" />
      <Stop offset="0.45" stopColor="#FFFFFF" stopOpacity="0" />
      <Stop offset="1" stopColor="#3A2A1A" stopOpacity="0.07" />
    </LinearGradient>
    <LinearGradient id="bgx-haze" x1="0" y1="0" x2="0" y2="1">
      <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.05" />
      <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0.45" />
    </LinearGradient>
    <LinearGradient id="bgx-side" x1="0" y1="0" x2="1" y2="0">
      <Stop offset="0" stopColor="#3A2A1A" stopOpacity="0.04" />
      <Stop offset="1" stopColor="#3A2A1A" stopOpacity="0.12" />
    </LinearGradient>
    <LinearGradient id="bgx-glass" x1="0" y1="0" x2="1" y2="1">
      <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.18" />
      <Stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0" />
      <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0.08" />
    </LinearGradient>
    <RadialGradient id="bgx-sun" cx="0.82" cy="0.12" r="0.55">
      <Stop offset="0" stopColor="#FFF7D6" stopOpacity="0.9" />
      <Stop offset="0.25" stopColor="#FFF7D6" stopOpacity="0.35" />
      <Stop offset="1" stopColor="#FFF7D6" stopOpacity="0" />
    </RadialGradient>
    <RadialGradient id="bgx-vignette" cx="0.5" cy="0.45" r="0.75">
      <Stop offset="0.7" stopColor="#3A2A1A" stopOpacity="0" />
      <Stop offset="1" stopColor="#3A2A1A" stopOpacity="0.08" />
    </RadialGradient>
    <RadialGradient id="bgx-cloud" cx="0.45" cy="0.3" r="0.8">
      <Stop offset="0" stopColor="#FFFFFF" />
      <Stop offset="0.75" stopColor="#FFFFFF" />
      <Stop offset="1" stopColor="#DCE6F2" />
    </RadialGradient>
    <LinearGradient id="bgx-floor" x1="0" y1="0" x2="0" y2="1">
      <Stop offset="0" stopColor="#3A2A1A" stopOpacity="0.06" />
      <Stop offset="0.3" stopColor="#FFFFFF" stopOpacity="0.04" />
      <Stop offset="1" stopColor="#3A2A1A" stopOpacity="0.1" />
    </LinearGradient>
  </Defs>
);

let gid = 0;
/** flat poster palette shared by the outdoor scenes */
const P = { cream: '#F3EADB', peach: '#F6DCC0', sand: '#E9D9BF', bldg: '#D8CBB4', bldg2: '#CDBFA6', cloud: '#C9C1B1', sun: '#F0A23B', leaf: '#24405A', leaf2: '#2F5670', pot: '#C8553D' };
/** soft rolling blob behind everything (the warm "haze" shape of the reference style) */
const blob = (c: string, y: number, o = 1) => (
  <Path d={`M0 ${y + 20} C40 ${y - 30} 90 ${y - 40} 140 ${y - 6} C180 ${y + 18} 210 ${y - 60} 260 ${y - 54} C310 ${y - 48} 330 ${y - 10} 400 ${y - 24} L400 ${H} L0 ${H}Z`} fill={c} opacity={o} />
);
const sunDisc = (x: number, y: number, c: string, r = 20) => (
  <G>
    <Circle cx={x} cy={y} r={r + 8} fill="none" stroke={c} strokeWidth="2.2" strokeDasharray="7 5" opacity={0.9} />
    <Circle cx={x} cy={y} r={r} fill={c} />
  </G>
);
const Sky = ({ top, bottom, sun = true, kind = 'day' }: { top: string; bottom: string; sun?: boolean; kind?: 'day' | 'sunset' | 'night' }) => {
  const id = `sky${gid++}`;
  return (
    <G>
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={top} />
          <Stop offset="1" stopColor={bottom} />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width={W} height={H} fill={`url(#${id})`} />
      {kind === 'night' ? (
        <G>
          {[30, 95, 150, 210, 260, 360, 60, 180, 300].map((x, i) => <Circle key={i} cx={x} cy={14 + ((i * 23) % 50)} r={i % 3 ? 1 : 1.6} fill="#F3EADB" opacity={0.7} />)}
          {sunDisc(338, 40, '#EADFC8', 15)}
        </G>
      ) : (
        <G>
          {blob(kind === 'sunset' ? '#F4C9A2' : P.peach, 120, 0.75)}
          {sun && sunDisc(338, 44, kind === 'sunset' ? '#E9772F' : P.sun, 20)}
        </G>
      )}
    </G>
  );
};
const day = <Sky top="#EFE4D2" bottom="#F7F0E4" />;
const sunset = <Sky top="#F1C7A1" bottom="#F8E7D2" kind="sunset" />;
const night = <Sky top="#202C45" bottom="#36465F" sun={false} kind="night" />;
/** flat grey-beige cloud: a few bumps on a straight base */
const cloud = (x: number, y: number, s = 1) => (
  <G transform={`translate(${x},${y}) scale(${s})`}>
    <Path d="M-18 8 Q-20 -2 -8 -2 Q-4 -14 10 -12 Q16 -22 30 -16 Q42 -16 42 -4 Q54 -4 54 8Z" fill={P.cloud} />
  </G>
);
const ground = (c: string, y = 190) => (
  <G>
    <Rect x="0" y={y} width={W} height={H - y} fill={c} />
    <Rect x="0" y={y} width={W} height={H - y} fill="url(#bgx-down)" />
    <Rect x="0" y={y} width={W} height="2" fill="#FFFFFF" opacity={0.25} />
  </G>
);
const hills = (c: string, y = 150) => {
  const d = `M0 ${y} C50 ${y - 44} 100 ${y - 40} 140 ${y - 12} C190 ${y - 50} 240 ${y - 52} 280 ${y - 16} C320 ${y - 46} 370 ${y - 40} 400 ${y - 8} L400 ${H} L0 ${H}Z`;
  return <Path d={d} fill={c} />;
};
/** flat city silhouette in two soft layers (no windows, a few spires) */
const skyline = (c: string, y = 190, seed = 1) => {
  const layer = (fill: string, off: number, hs: number, o: number) => (
    <G opacity={o}>
      {Array.from({ length: 12 }).map((_, i) => {
        const h = (34 + ((i * 41 * seed + off) % 64)) * hs;
        const x = i * 34 + (off % 17) - 8;
        const w = 22 + ((i * 13 + off) % 12);
        return (
          <G key={i}>
            <Rect x={x} y={y - h} width={w} height={h} fill={fill} />
            {(i + seed) % 4 === 0 && <Rect x={x + w / 2 - 1.5} y={y - h - 16} width="3" height="16" fill={fill} />}
            {(i + seed) % 5 === 2 && <Rect x={x + 4} y={y - h - 6} width={w - 8} height="6" fill={fill} />}
          </G>
        );
      })}
    </G>
  );
  return (
    <G>
      {layer(P.bldg, 23, 1.25, 0.55)}
      {layer(c, 0, 1, 1)}
    </G>
  );
};
const windows = (x: number, y: number, cols: number, rows: number, c = '#FFE9A8') => (
  <G>
    {Array.from({ length: rows }).map((_, r) =>
      Array.from({ length: cols }).map((__, k) => (
        <G key={`${r}-${k}`}>
          <Rect x={x + k * 10} y={y + r * 12} width="6" height="7" fill={c} />
          <Rect x={x + k * 10} y={y + r * 12} width="6" height="7" fill="url(#bgx-glass)" />
        </G>
      )),
    )}
  </G>
);
const tiledRoof = (x: number, y: number, w: number, c = '#3F4A5A') => {
  const d = `M${x - 14} ${y + 4} Q${x} ${y - 4} ${x + w / 2} ${y - 16} Q${x + w} ${y - 4} ${x + w + 14} ${y + 4} Q${x + w} ${y + 8} ${x + w - 6} ${y + 10} L${x + 6} ${y + 10} Q${x} ${y + 8} ${x - 14} ${y + 4}Z`;
  return (
    <G>
      <Path d={d} fill={c} />
      <Path d={d} fill="url(#bgx-down)" />
      {Array.from({ length: Math.floor((w + 20) / 5) }).map((_, i) => (
        <Line key={i} x1={x - 8 + i * 5} y1={y + 1 - Math.max(0, 12 - Math.abs(x - 8 + i * 5 - (x + w / 2)) / (w / 24))} x2={x - 8 + i * 5} y2={y + 9} stroke="#000" strokeWidth="0.8" opacity={0.18} />
      ))}
      <Path d={`M${x - 14} ${y + 4} Q${x} ${y - 4} ${x + w / 2} ${y - 16} Q${x + w} ${y - 4} ${x + w + 14} ${y + 4}`} stroke="#FFFFFF" strokeWidth="1.2" opacity={0.3} fill="none" />
      <Path d={`M${x - 16} ${y + 2} q4 0 6 -6 M${x + w + 16} ${y + 2} q-4 0 -6 -6`} stroke={c} strokeWidth="3" fill="none" />
    </G>
  );
};
const dancheong = (x: number, y: number, w: number) => (
  <G>
    <Rect x={x} y={y} width={w} height="5" fill="#2F855A" />
    <Rect x={x} y={y + 5} width={w} height="3" fill="#2D6CDF" />
    {Array.from({ length: Math.floor(w / 12) }).map((_, i) => (
      <G key={i}>
        <Circle cx={x + 6 + i * 12} cy={y + 3} r="1.8" fill="#E5383B" />
        <Circle cx={x + 6 + i * 12} cy={y + 3} r="0.8" fill="#FDE68A" />
      </G>
    ))}
    <Rect x={x} y={y + 8} width={w} height="1.5" fill="#000" opacity={0.2} />
  </G>
);
const interior = (wall: string, floor: string) => (
  <G>
    <Rect x="0" y="0" width={W} height={H} fill={wall} />
    <Rect x="0" y="0" width={W} height="176" fill="url(#bgx-down)" />
    <Rect x="0" y="176" width={W} height={H - 176} fill={floor} />
    <Rect x="0" y="176" width={W} height={H - 176} fill="url(#bgx-floor)" />
    {Array.from({ length: 11 }).map((_, i) => (
      <Line key={i} x1={i * 40} y1="176" x2={(i * 40 - 200) * 2.2 + 200} y2={H} stroke="#000" strokeWidth="1" opacity={0.08} />
    ))}
    <Rect x="0" y="170" width={W} height="7" fill="#000" opacity={0.15} />
    <Rect x="0" y="170" width={W} height="1.5" fill="#FFFFFF" opacity={0.3} />
    {plant(18, 158, 0.9)}
    {plant(384, 158, 0.9)}
  </G>
);
const sea = (y: number, c = '#3B82F6') => (
  <G>
    <Rect x="0" y={y} width={W} height={H - y} fill={c} />
    <Rect x="0" y={y} width={W} height={H - y} fill="url(#bgx-down)" />
    <Rect x="0" y={y} width={W} height="3" fill="#FFFFFF" opacity={0.35} />
    {[0, 1, 2].map((i) => <Path key={i} d={`M0 ${y + 14 + i * 16} q20 -6 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0`} stroke="#FFFFFF" strokeOpacity={0.35 - i * 0.08} strokeWidth="2" fill="none" />)}
    {Array.from({ length: 14 }).map((_, i) => (
      <Rect key={i} x={(i * 53) % 390} y={y + 6 + ((i * 17) % 40)} width={6 + (i % 3) * 4} height="1.2" rx="0.6" fill="#FFFFFF" opacity={0.55} />
    ))}
  </G>
);
/** tree: dark navy leaf clusters on a thin stem (flat illustration style) */
const leafPath = 'M0 0 C6 -8 6 -20 0 -28 C-6 -20 -6 -8 0 0Z';
const tree = (x: number, y: number, c = P.leaf, s = 1) => (
  <G transform={`translate(${x},${y}) scale(${s})`}>
    <Rect x="-1.5" y="-6" width="3" height="24" fill="#5A4636" />
    {[-70, -40, -15, 15, 40, 70, 0].map((r, i) => (
      <Path key={i} d={leafPath} fill={i % 2 ? c : P.leaf2} transform={`translate(0,${-4 - (i % 3) * 5}) rotate(${r})`} />
    ))}
  </G>
);
/** potted plant for room corners */
const plant = (x: number, y: number, s = 1) => (
  <G transform={`translate(${x},${y}) scale(${s})`}>
    {[-55, -30, -8, 12, 34, 58].map((r, i) => (
      <G key={i} transform={`rotate(${r}) translate(0,-6)`}>
        <Path d="M0 0 L0 -26" stroke="#1E2F3F" strokeWidth="1" />
        <Path d="M0 -14 C7 -22 7 -34 0 -42 C-7 -34 -7 -22 0 -14Z" fill={i % 2 ? P.leaf : P.leaf2} />
      </G>
    ))}
    <Path d="M-12 0 L12 0 L9 18 L-9 18Z" fill={P.pot} />
    <Rect x="-13" y="-2" width="26" height="5" rx="1" fill="#B44A35" />
  </G>
);
const palm = (x: number, y: number, lean = 0) => (
  <G transform={`translate(${x},${y}) rotate(${lean})`}>
    <Path d="M0 0 Q4 -30 2 -60" stroke="#8B5A2B" strokeWidth="6" fill="none" />
    <Path d="M1.5 0 Q5.5 -30 3.5 -60" stroke="#5E3A17" strokeWidth="2" fill="none" opacity={0.6} />
    {[-60, -20, 20, 60, 100, 140].map((a, i) => (
      <Path key={a} d="M2 -60 q20 -6 34 8" stroke={i % 2 ? '#2F855A' : '#3FA76B'} strokeWidth="6" fill="none" strokeLinecap="round" transform={`rotate(${a} 2 -60)`} />
    ))}
  </G>
);
const nSeoulTower = (x: number, y: number, s = 1, lit = false) => (
  <G transform={`translate(${x},${y}) scale(${s})`}>
    <Path d="M-60 0 Q0 -50 60 0Z" fill={lit ? '#1E293B' : '#3F7D4E'} />
    <Path d="M-60 0 Q0 -50 60 0Z" fill="url(#bgx-down)" />
    <Rect x="-4" y="-120" width="8" height="90" fill="#F1F5F9" />
    <Rect x="0" y="-120" width="4" height="90" fill="#000" opacity={0.12} />
    <Rect x="-14" y="-118" width="28" height="16" rx="6" fill={lit ? '#F472B6' : '#E2E8F0'} />
    <Rect x="-14" y="-118" width="28" height="16" rx="6" fill="url(#bgx-down)" />
    <Rect x="-12" y="-113" width="24" height="3" fill="#1E293B" opacity={0.5} />
    <Rect x="-10" y="-102" width="20" height="5" fill="#CBD5E1" />
    <Rect x="-1.5" y="-160" width="3" height="42" fill="#E5383B" />
    <Rect x="-1.5" y="-160" width="1.5" height="42" fill="#FFFFFF" opacity={0.3} />
    <Rect x="-12" y="-34" width="24" height="10" fill="#E2E8F0" />
  </G>
);

const BG: Partial<Record<BackgroundId, React.ReactNode>> = {
  airport: (
    <G>
      {day}
      {cloud(60, 40)}
      {cloud(240, 26, 0.7)}
      <G transform="translate(300,58) rotate(-12)">
        <Path d="M-44 0 L40 -1 Q54 0 54 6 Q54 11 40 11 L-38 11Z" fill="#FDFCFA" stroke="#A7AEB7" strokeWidth="0.8" />
        <Path d="M-38 8 L44 8 Q50 9 50 11 L-38 11Z" fill="#D4D8DC" />
        {[-28, -20, -12, -4, 4, 12, 20, 28].map((x) => <Circle key={x} cx={x} cy="4" r="1.2" fill="#8FB1DB" />)}
        <Path d="M38 2 Q46 2 48 5 L40 5Z" fill="#4E5C83" />
        <Path d="M-4 4 L-26 -24 L-15 -24 L16 4Z M-4 9 L-22 32 L-11 32 L14 9Z" fill="#E7E9EB" stroke="#A7AEB7" strokeWidth="0.6" />
        <Path d="M-44 2 L-52 -16 L-41 -16 L-32 2Z" fill="#6787C0" />
        <Ellipse cx="2" cy="16" rx="6" ry="3" fill="#A7AEB7" />
      </G>
      {/* terminal: steel roof canopy over a glass curtain wall */}
      <Path d="M10 196 L10 112 Q200 66 390 112 L390 196Z" fill="#DFE4E7" />
      {Array.from({ length: 24 }).map((_, i) => {
        const x = 18 + i * 15.5;
        const top = 112 - Math.sin((i / 23) * Math.PI) * 30 + 6;
        return (
          <G key={i}>
            <Rect x={x} y={top} width="14" height={190 - top} fill="#ACC7D9" />
            <Rect x={x} y={top} width="14" height={190 - top} fill="url(#bgx-glass)" />
          </G>
        );
      })}
      {Array.from({ length: 5 }).map((_, r) => <Line key={r} x1="12" y1={130 + r * 13} x2="388" y2={130 + r * 13} stroke="#E7E9EB" strokeWidth="1.2" opacity={0.8} />)}
      <Path d="M0 116 Q200 62 400 116" stroke="#767D85" strokeWidth="9" fill="none" />
      <Path d="M0 112 Q200 58 400 112" stroke="#B8BDC3" strokeWidth="3" fill="none" />
      {Array.from({ length: 9 }).map((_, i) => <Line key={i} x1={20 + i * 45} y1={112 - Math.sin((i / 8) * Math.PI) * 30} x2={20 + i * 45} y2="196" stroke="#767D85" strokeWidth="2" />)}
      {/* interior lights */}
      {Array.from({ length: 12 }).map((_, i) => <Circle key={i} cx={30 + i * 31} cy="142" r="2" fill="#F6F1DE" opacity={0.9} />)}
      <Rect x="118" y="126" width="164" height="24" rx="4" fill="#34373C" />
      <Rect x="118" y="126" width="164" height="12" rx="4" fill="#FDFCFA" opacity={0.06} />
      {t(200, 143, '도착 ARRIVALS ✈ 到达 到着', 12, '#DCBF74')}
      {/* travellers inside */}
      {[[60, '#CC7A7A'], [92, '#6989C1'], [300, '#559577'], [334, '#CD9761']].map(([x, c]) => (
        <G key={x as number} opacity={0.75}>
          <Circle cx={x as number} cy="170" r="4" fill="#50463F" />
          <Rect x={(x as number) - 4} y="174" width="8" height="14" rx="3" fill={c as string} />
          <Rect x={(x as number) + 5} y="180" width="6" height="8" rx="1.5" fill="#545A62" />
        </G>
      ))}
      {ground('#ABB0B4', 192)}
      {Array.from({ length: 10 }).map((_, i) => <Rect key={i} x={i * 44} y="214" width="24" height="3" fill="#FDFCFA" opacity={0.7} />)}
      <Rect x="0" y="196" width={W} height="3" fill="#D2B958" opacity={0.7} />
    </G>
  ),
  port: (
    <G>
      {day}
      {cloud(80, 36)}
      <Path d="M0 120 L60 80 L120 110 L180 70 L260 110 L330 76 L400 104 L400 150 L0 150Z" fill="#849684" />
      {skyline('#A7AEB7', 150, 2)}
      <G stroke="#C96F6E" strokeWidth="5" fill="none">
        <Path d="M300 150 L300 70 L370 70 M300 90 L340 70 M352 70 L352 110" />
      </G>
      {sea(150, '#6483C7')}
      <G transform="translate(70,150)">
        <Path d="M0 0 L140 0 L128 26 L12 26Z" fill="#FDFCFA" stroke="#4E5C83" strokeWidth="2" />
        <Rect x="24" y="-26" width="90" height="26" fill="#FDFCFA" stroke="#4E5C83" strokeWidth="2" />
        <Rect x="50" y="-44" width="40" height="18" fill="#C96F6E" />
        {[34, 54, 74, 94].map((x) => <Circle key={x} cx={x} cy="-13" r="5" fill="#B3CBE6" />)}
      </G>
      <Rect x="230" y="110" width="150" height="40" fill="#E7E9EB" />
      <Rect x="230" y="104" width="150" height="10" fill="#4E5C83" />
      {t(305, 134, '국제여객터미널 FERRY TERMINAL', 9)}
    </G>
  ),
  subway: (
    <G>
      {interior('#E7E9EB', '#ABAEB2')}
      <Rect x="0" y="40" width={W} height="136" fill="#D4D8DC" />
      {[0, 1, 2, 3].map((i) => (
        <G key={i}>
          <Rect x={10 + i * 100} y="50" width="80" height="122" fill="#D1E3EF" stroke="#656B73" strokeWidth="4" />
          <Line x1={50 + i * 100} y1="50" x2={50 + i * 100} y2="172" stroke="#656B73" strokeWidth="3" />
        </G>
      ))}
      <Rect x="0" y="34" width={W} height="10" fill="#4698AE" />
      <Rect x="130" y="6" width="140" height="26" rx="4" fill="#41454A" />
      <Circle cx="148" cy="19" r="9" fill="#4698AE" />
      {t(148, 23, '4', 11, '#FDFCFA')}
      {t(210, 24, '명동 Myeongdong 424', 11, '#FDFCFA')}
      <Rect x="0" y="176" width={W} height="8" fill="#D2B958" />
    </G>
  ),
  street: (
    <G>
      {day}
      {[0, 1, 2, 3, 4].map((i) => {
        const x = i * 82;
        const h = 125 + (i % 2) * 30;
        const colors = ['#E8C6C4', '#D0DBE9', '#E7DCB7', '#D7CEE9', '#C2DFCC'];
        const signs = ['화장품 COSMETICS', '환전 EXCHANGE', '맛집 FOOD', '카페 CAFE', '약국 PHARMACY'];
        const signC = ['#C96F76', '#4D9565', '#CD9761', '#9571CC', '#4D9565'];
        return (
          <G key={i}>
            <Rect x={x} y={190 - h} width="78" height={h} fill={colors[i]} />
            <Rect x={x + 60} y={190 - h} width="18" height={h} fill="url(#bgx-side)" />
            <Rect x={x} y={190 - h} width="78" height="4" fill="#FDFCFA" opacity={0.4} />
            {windows(x + 8, 200 - h, 6, Math.floor(h / 14) - 4, '#BDCCDA')}
            {/* vertical hanging sign */}
            <Rect x={x + 64} y={200 - h} width="11" height="48" rx="2" fill={signC[(i + 2) % 5]} />
            <Rect x={x + 64} y={200 - h} width="11" height="48" rx="2" fill="url(#bgx-glass)" />
            {/* glowing shop sign */}
            <Rect x={x + 2} y={148 - (i % 2) * 6} width="74" height="18" rx="3" fill={signC[i]} />
            <Rect x={x + 2} y={148 - (i % 2) * 6} width="74" height="9" rx="3" fill="#FDFCFA" opacity={0.18} />
            {t(x + 39, 161 - (i % 2) * 6, signs[i], 7.5, '#FDFCFA')}
            <Rect x={x + 4} y={168} width="70" height="22" fill="#F8F3E5" opacity={0.85} />
          </G>
        );
      })}
      {/* string lights */}
      <Path d="M0 120 Q100 136 200 120 Q300 136 400 120" stroke="#656B73" strokeWidth="0.8" fill="none" />
      {Array.from({ length: 20 }).map((_, i) => <Circle key={i} cx={i * 21 + 5} cy={121 + Math.sin(((i * 21) / 200) * Math.PI) * 10} r="2" fill="#E9D8A9" />)}
      {ground('#D9D6D3')}
      {Array.from({ length: 12 }).map((_, i) => <Line key={i} x1={i * 36} y1="190" x2={i * 36 - 30} y2="240" stroke="#B1ACA8" strokeWidth="0.8" opacity={0.6} />)}
      {/* street-food stalls */}
      {[40, 170, 300].map((x) => (
        <G key={x}>
          <Ellipse cx={x + 30} cy="208" rx="38" ry="4" fill="#22211F" opacity={0.15} />
          <Rect x={x} y="178" width="60" height="28" rx="2" fill="#FDFCFA" stroke="#A7AEB7" />
          <Rect x={x} y="194" width="60" height="12" fill="#22211F" opacity={0.06} />
          <Path d={`M${x - 6} 178 L${x + 66} 178 L${x + 60} 162 L${x} 162Z`} fill="#C96F76" />
          {[0, 1, 2, 3, 4, 5].map((k) => <Path key={k} d={`M${x + k * 12} 162 L${x - 6 + k * 12 + 6} 178`} stroke="#FDFCFA" strokeWidth="3" opacity={0.7} />)}
          <Ellipse cx={x + 30} cy="181" rx="18" ry="3" fill="#A65452" />
          {t(x + 30, 199, '떡볶이', 9, '#C96F76')}
        </G>
      ))}
      {/* people */}
      {[[130, '#6989C1'], [148, '#DE99BA'], [255, '#559577'], [370, '#CD9761']].map(([x, c]) => (
        <G key={x as number}>
          <Ellipse cx={x as number} cy="232" rx="7" ry="1.6" fill="#22211F" opacity={0.2} />
          <Circle cx={x as number} cy="206" r="5" fill="#50463F" />
          <Rect x={(x as number) - 5} y="211" width="10" height="15" rx="4" fill={c as string} />
          <Rect x={(x as number) - 4} y="225" width="3.5" height="7" fill="#545A62" />
          <Rect x={(x as number) + 0.5} y="225" width="3.5" height="7" fill="#545A62" />
        </G>
      ))}
    </G>
  ),
  restaurant: (
    <G>
      {interior('#EDE4D2', '#AD9884')}
      <Rect x="20" y="20" width="160" height="70" rx="4" fill="#FDFCFA" stroke="#896F54" strokeWidth="3" />
      {t(100, 40, '메뉴 MENU', 12)}
      {t(100, 58, '삼겹살 ₩16,000 · 갈비 ₩22,000', 9, '#767988', '700')}
      {t(100, 74, '김치찌개 ₩9,000 · 공기밥 ₩1,000', 9, '#767988', '700')}
      <Rect x="240" y="30" width="130" height="40" rx="4" fill="#C96F6E" />
      {t(305, 56, '1인분 가능 ✓', 13, '#FDFCFA')}
      {[90, 290].map((x) => (
        <G key={x}>
          <Rect x={x - 6} y="80" width="12" height="70" fill="#A7AEB7" />
          <Path d={`M${x - 30} 150 L${x + 30} 150 L${x + 20} 128 L${x - 20} 128Z`} fill="#D4D8DC" />
          <Rect x={x - 70} y="170" width="140" height="14" rx="3" fill="#896F54" />
          <Circle cx={x} cy="170" r="20" fill="#565A60" />
          <Circle cx={x + 50} cy="168" r="6" fill="#C96F6E" />
        </G>
      ))}
    </G>
  ),
  noraebang: (
    <G>
      {interior('#4E3D67', '#434057')}
      <Rect x="90" y="24" width="220" height="120" rx="6" fill="#34373C" stroke="#BBABE3" strokeWidth="4" />
      <Rect x="98" y="32" width="204" height="104" fill="#4E5C83" />
      {t(200, 74, '♪ Sing your heart out ♪', 14, '#DE99BA')}
      {t(200, 100, '노래방 · 00:42 남음', 12, '#E8DBA9')}
      <Circle cx="50" cy="30" r="18" fill="#E8E8E8" />
      {[0, 1, 2, 3].map((i) => <Line key={i} x1="50" y1="30" x2={10 + i * 30} y2="110" stroke={['#DE99BA', '#8FB1DB', '#E8DBA9', '#6ABB9B'][i]} strokeWidth="3" opacity={0.5} />)}
      <Rect x="20" y="170" width="360" height="40" rx="10" fill="#A95273" />
      <Ellipse cx="340" cy="160" rx="16" ry="6" fill="#DCBF74" />
    </G>
  ),
  pharmacy: (
    <G>
      {interior('#F0F7F1', '#D7D8D9')}
      {[0, 1, 2].map((r) => (
        <G key={r}>
          <Rect x="20" y={40 + r * 40} width="360" height="6" fill="#ABAEB2" />
          {Array.from({ length: 18 }).map((_, i) => <Rect key={i} x={24 + i * 20} y={18 + r * 40} width="14" height="22" rx="2" fill={['#CD9761', '#8FB1DB', '#C96F6E', '#559577', '#DE99BA'][(i + r) % 5]} />)}
        </G>
      ))}
      <Rect x="40" y="150" width="320" height="40" fill="#FDFCFA" stroke="#4D9565" strokeWidth="3" />
      <Circle cx="200" cy="146" r="22" fill="#4D9565" />
      {t(200, 155, '약', 24, '#FDFCFA')}
    </G>
  ),
  hospital: (
    <G>
      {interior('#F3F3F3', '#D4D8DC')}
      <Rect x="230" y="40" width="150" height="100" fill="#FDFCFA" stroke="#A7AEB7" strokeWidth="2" />
      {t(305, 70, '접수 RECEPTION', 12, '#5B73B8')}
      {t(305, 92, '내과 · 정형외과 · 이비인후과', 9, '#767988', '700')}
      {t(305, 114, 'Bring your passport', 9, '#767988', '700')}
      <Rect x="30" y="30" width="60" height="60" rx="8" fill="#5B73B8" />
      <Rect x="54" y="42" width="12" height="36" fill="#FDFCFA" />
      <Rect x="42" y="54" width="36" height="12" fill="#FDFCFA" />
      {[30, 80, 130].map((x) => <Rect key={x} x={x} y="148" width="40" height="24" rx="6" fill="#8FB1DB" />)}
    </G>
  ),
  palace: (
    <G>
      {day}
      {cloud(300, 34, 0.9)}
      {cloud(40, 50, 0.6)}
      {/* Bugaksan behind the palace */}
      <Path d="M60 128 Q120 46 175 70 Q215 34 262 72 Q310 52 372 128Z" fill="#889E82" />
      <Path d="M60 128 Q120 46 175 70 Q215 34 262 72 Q310 52 372 128Z" fill="url(#bgx-down)" />
      <Path d="M150 80 l8 -6 l6 4 M220 60 l6 -5 l8 6 M250 74 l5 -3 l5 4" stroke="#E8E6E3" strokeWidth="2" fill="none" opacity={0.6} />
      <Rect x="0" y="60" width={W} height="70" fill="url(#bgx-haze)" />
      {/* side corridors (hoerang) */}
      {[[0, 118, 90], [310, 118, 90]].map(([x, y, w], i) => (
        <G key={i}>
          <Rect x={x} y={y + 8} width={w} height="18" fill="#A65452" />
          {Array.from({ length: 8 }).map((_, k) => <Rect key={k} x={x + 4 + k * 11} y={y + 8} width="3" height="18" fill="#7E4B48" />)}
          {tiledRoof(x + 6, y, w - 12, '#5D6167')}
        </G>
      ))}
      {/* two-tier stone platform (woldae) with balustrades */}
      <Rect x="62" y="166" width="276" height="16" fill="#D9D6D3" />
      <Rect x="62" y="166" width="276" height="16" fill="url(#bgx-down)" />
      <Rect x="84" y="152" width="232" height="15" fill="#E8E6E3" />
      <Rect x="84" y="152" width="232" height="15" fill="url(#bgx-down)" />
      {[[62, 166, 276], [84, 152, 232]].map(([x, y, w], i) => (
        <G key={i}>
          <Line x1={x} y1={y - 4} x2={x + w} y2={y - 4} stroke="#B1ACA8" strokeWidth="1.5" />
          {Array.from({ length: Math.floor(w / 14) + 1 }).map((_, k) => (
            <Rect key={k} x={x + k * 14 - 1} y={y - 6} width="2.4" height="6" fill="#B1ACA8" />
          ))}
        </G>
      ))}
      <Path d="M186 182 L190 152 L210 152 L214 182 Z" fill="#F5F3F1" />
      {Array.from({ length: 6 }).map((_, k) => <Line key={k} x1={187 + k * 0.3} y1={157 + k * 5} x2={213 - k * 0.3} y2={157 + k * 5} stroke="#B1ACA8" strokeWidth="0.8" />)}
      {/* Geunjeongjeon – lower storey */}
      <Rect x="116" y="112" width="168" height="40" fill="#AD5C5D" />
      {[118, 140, 162, 184, 206, 228, 250, 272].map((x) => (
        <G key={x}>
          <Rect x={x} y="112" width="6" height="40" fill="#884C4C" />
          <Rect x={x} y="112" width="2" height="40" fill="#FDFCFA" opacity={0.18} />
        </G>
      ))}
      {[124, 146, 168, 190, 212, 234, 256].map((x) => (
        <G key={x}>
          <Rect x={x + 2} y="118" width="12" height="32" fill="#8F5946" opacity={0.55} />
          {Array.from({ length: 6 }).map((_, k) => <Line key={k} x1={x + 2} y1={121 + k * 5} x2={x + 14} y2={121 + k * 5} stroke="#E8DBA9" strokeWidth="0.5" opacity={0.6} />)}
          <Line x1={x + 8} y1="118" x2={x + 8} y2="150" stroke="#E8DBA9" strokeWidth="0.5" opacity={0.6} />
        </G>
      ))}
      <Rect x="116" y="112" width="168" height="40" fill="url(#bgx-down)" />
      {dancheong(114, 104, 172)}
      {tiledRoof(114, 96, 172, '#585C61')}
      {/* upper storey */}
      <Rect x="148" y="74" width="104" height="18" fill="#AD5C5D" />
      {[150, 170, 190, 210, 230, 246].map((x) => <Rect key={x} x={x} y="74" width="5" height="18" fill="#884C4C" />)}
      {dancheong(146, 68, 108)}
      {tiledRoof(144, 60, 112, '#585C61')}
      {/* ridge figurines (japsang) */}
      {[0, 1, 2, 3].map((k) => (
        <G key={k}>
          <Circle cx={130 - k * 4} cy={92 + k * 1.6} r="1.6" fill="#41454A" />
          <Circle cx={270 + k * 4} cy={92 + k * 1.6} r="1.6" fill="#41454A" />
        </G>
      ))}
      {/* courtyard paving (bakseok) and rank stones */}
      <Rect x="0" y="182" width={W} height="58" fill="#E8E6E3" />
      <Rect x="0" y="182" width={W} height="58" fill="url(#bgx-down)" />
      {Array.from({ length: 22 }).map((_, i) => (
        <Path key={i} d={`M${i * 19 - 4} 182 L${i * 19 + ((i * 7) % 6) - 10} 240`} stroke="#B1ACA8" strokeWidth="0.7" opacity={0.6} />
      ))}
      {[192, 206, 222].map((y) => <Line key={y} x1="0" y1={y} x2={W} y2={y + ((y * 3) % 4) - 2} stroke="#B1ACA8" strokeWidth="0.7" opacity={0.6} />)}
      {[96, 132, 168, 232, 268, 304].map((x) => (
        <G key={x}>
          <Rect x={x} y="190" width="7" height="13" rx="1" fill="#B1ACA8" />
          <Rect x={x} y="190" width="3" height="13" fill="#FDFCFA" opacity={0.3} />
          <Ellipse cx={x + 3.5} cy="204" rx="6" ry="1.5" fill="#22211F" opacity={0.15} />
        </G>
      ))}
      <Rect x="190" y="182" width="20" height="58" fill="#F5F3F1" opacity={0.7} />
      {t(200, 230, '경복궁 근정전 Gyeongbokgung · Geunjeongjeon', 10, '#6B6863', '800')}
    </G>
  ),
  hanok: (
    <G>
      {day}
      {skyline('#D4D8DC', 130, 3)}
      {nSeoulTower(340, 130, 0.55)}
      <Path d="M0 240 L0 150 Q200 120 400 150 L400 240Z" fill="#B1ACA8" />
      {[0, 1].map((r) =>
        [0, 1, 2, 3].map((i) => {
          const x = i * 104 - r * 52 + 18;
          const y = 150 + r * 42;
          return (
            <G key={`${r}${i}`}>
              <Rect x={x} y={y} width="74" height="30" fill="#EDE4D2" />
              <Rect x={x + 8} y={y + 8} width="14" height="16" fill="#F9F4E9" stroke="#896F54" />
              <Rect x={x + 52} y={y + 8} width="14" height="16" fill="#F9F4E9" stroke="#896F54" />
              <Rect x={x + 30} y={y + 6} width="14" height="24" fill="#896F54" />
              {tiledRoof(x, y, 74, '#676B70')}
              <Rect x={x - 6} y={y + 30} width="86" height="8" fill="#ABAEB2" />
            </G>
          );
        }),
      )}
      {t(200, 234, '북촌 한옥마을 Bukchon · residents live here – shh!', 9, '#41454A')}
    </G>
  ),
  cafe: (
    <G>
      {day}
      {[0, 1, 2].map((i) => (
        <G key={i}>
          <Rect x={i * 135} y="60" width="130" height="130" fill="#A87666" />
          {Array.from({ length: 10 }).map((_, r) => <Line key={r} x1={i * 135} y1={66 + r * 12} x2={i * 135 + 130} y2={66 + r * 12} stroke="#885D51" strokeWidth="1" />)}
          <Rect x={i * 135 + 20} y="100" width="90" height="70" fill="#E8DBA9" opacity={0.85} />
          <Rect x={i * 135 + 30} y="74" width="70" height="18" rx="4" fill="#40414F" />
          {t(i * 135 + 65, 87, ['CAFE 성수', 'POP-UP', 'GALLERY'][i], 10, '#FDFCFA')}
          <Rect x={i * 135 + 100} y="20" width="12" height="40" fill="#828489" />
        </G>
      ))}
      {ground('#B1ACA8')}
      {[60, 200, 330].map((x) => tree(x, 176, '#62793E', 0.8))}
    </G>
  ),
  tower: (
    <G>
      {sunset}
      {skyline('#89788B', 200, 4)}
      {nSeoulTower(250, 190, 1.2)}
      {ground('#635B65', 200)}
      {t(250, 228, 'N서울타워 N Seoul Tower · Namsan', 10, '#FDFCFA')}
    </G>
  ),
  river: (
    <G>
      {sunset}
      {skyline('#958694', 120, 5)}
      <Rect x="0" y="120" width={W} height="60" fill="#8AA2D3" />
      <Path d="M0 130 L400 130" stroke="#656B73" strokeWidth="6" />
      {Array.from({ length: 9 }).map((_, i) => <Path key={i} d={`M${i * 50} 130 Q${i * 50 + 25} 110 ${i * 50 + 50} 130`} stroke="#656B73" strokeWidth="3" fill="none" />)}
      {Array.from({ length: 9 }).map((_, i) => <Rect key={i} x={i * 50 - 2} y="130" width="4" height="30" fill="#656B73" />)}
      <Rect x="0" y="180" width={W} height="20" fill="#ABAEB2" />
      <Line x1="0" y1="190" x2={W} y2="190" stroke="#FDFCFA" strokeWidth="2" strokeDasharray="10 8" />
      {ground('#87A97B', 200)}
      <Rect x="250" y="206" width="70" height="22" fill="#8FB1DB" opacity={0.8} />
      {t(200, 236, '한강공원 Hangang Park', 9, '#FDFCFA')}
    </G>
  ),
  market: (
    <G>
      {day}
      <Rect x="0" y="40" width={W} height="20" fill="#4E5C83" />
      {t(200, 55, '시장 MARKET · 회 · 어묵 · 호떡', 13, '#FDFCFA')}
      {[0, 1, 2, 3].map((i) => (
        <G key={i}>
          <Path d={`M${i * 100} 80 L${i * 100 + 96} 80 L${i * 100 + 90} 64 L${i * 100 + 6} 64Z`} fill={['#C96F6E', '#CD9761', '#6787C0', '#559577'][i]} />
          <Rect x={i * 100 + 6} y="80" width="84" height="110" fill="#F8F8F7" />
          <Rect x={i * 100 + 12} y="120" width="72" height="44" fill="#A3CEE2" stroke="#40738E" strokeWidth="2" />
          <Path d={`M${i * 100 + 24} 140 q10 -8 20 0 q-10 8 -20 0 l-6 -5 l0 10z`} fill="#D18B59" />
          <Path d={`M${i * 100 + 54} 150 q8 -6 16 0 q-8 6 -16 0`} fill="#7F868F" />
        </G>
      ))}
      {ground('#ABAEB2')}
    </G>
  ),
  village: (
    <G>
      {day}
      <Path d="M0 240 L0 120 Q200 40 400 110 L400 240Z" fill="#ABAEB2" />
      {Array.from({ length: 30 }).map((_, i) => {
        const col = i % 10;
        const row = Math.floor(i / 10);
        const x = col * 40 + (row % 2) * 20;
        const y = 120 + row * 38 - Math.sin((col / 10) * Math.PI) * 30;
        return (
          <G key={i}>
            <Rect x={x} y={y} width="34" height="30" fill={['#EABFD4', '#B3CBE6', '#E8DBA9', '#A7DCB8', '#D2C9EC', '#E4C09A'][i % 6]} />
            <Rect x={x + 4} y={y + 8} width="8" height="8" fill="#FDFCFA" />
            <Rect x={x} y={y - 4} width="34" height="5" fill="#7F868F" />
          </G>
        );
      })}
    </G>
  ),
  beach: (
    <G>
      {day}
      {skyline('#A7AEB7', 110, 6)}
      {sea(110, '#73B7D3')}
      <Path d="M0 170 Q200 150 400 170 L400 240 L0 240Z" fill="#E8DBA9" />
      {[60, 160, 270, 350].map((x, i) => (
        <G key={x}>
          <Line x1={x} y1="210" x2={x} y2="170" stroke="#656B73" strokeWidth="3" />
          <Path d={`M${x - 26} 172 Q${x} 150 ${x + 26} 172Z`} fill={['#C96F6E', '#6787C0', '#CD9761', '#559577'][i]} />
        </G>
      ))}
      <Rect x="180" y="120" width="40" height="34" fill="#FDFCFA" />
      <Rect x="186" y="110" width="28" height="12" fill="#C96F6E" />
      {t(200, 145, '안전', 9, '#C96F6E')}
    </G>
  ),
  'night-beach': (
    <G>
      {night}
      {Array.from({ length: 30 }).map((_, i) => <Circle key={i} cx={(i * 53) % 400} cy={(i * 31) % 90 + 6} r="1.4" fill="#FDFCFA" opacity={0.8} />)}
      {/* drone light show */}
      {Array.from({ length: 24 }).map((_, i) => <Circle key={i} cx={200 + 46 * Math.cos((i / 24) * Math.PI * 2)} cy={60 + 30 * Math.sin((i / 24) * Math.PI * 2)} r="2.6" fill="#DE99BA" />)}
      {t(200, 66, 'BUSAN', 14, '#E8DBA9')}
      {sea(130, '#4E5C83')}
      {/* Gwangan Bridge */}
      <Path d="M0 130 L400 130" stroke="#8FB1DB" strokeWidth="5" />
      {[110, 290].map((x) => <Rect key={x} x={x - 4} y="80" width="8" height="50" fill="#B3CBE6" />)}
      <Path d="M0 120 Q55 128 110 80 Q200 128 290 80 Q345 128 400 120" stroke="#BBABE3" strokeWidth="3" fill="none" />
      {Array.from({ length: 40 }).map((_, i) => <Circle key={i} cx={i * 10} cy="131" r="1.8" fill={['#DE99BA', '#8FB1DB', '#E8DBA9'][i % 3]} />)}
      <Path d="M0 180 Q200 168 400 180 L400 240 L0 240Z" fill="#87827E" />
    </G>
  ),
  jjimjilbang: (
    <G>
      {interior('#F2E6D3', '#DDCBB1')}
      {[60, 200, 340].map((x, i) => (
        <G key={x}>
          <Path d={`M${x - 50} 176 Q${x - 50} 70 ${x} 70 Q${x + 50} 70 ${x + 50} 176Z`} fill={['#AA6648', '#895D41', '#9F6C44'][i]} />
          <Rect x={x - 16} y="130" width="32" height="46" rx="16" fill="#41454A" />
          {t(x, 100, ['불가마 90°C', '황토방 60°C', '얼음방 ICE'][i], 10, '#FDFCFA')}
        </G>
      ))}
      <Ellipse cx="300" cy="206" rx="40" ry="10" fill="#CD9761" opacity={0.6} />
      {t(200, 228, '찜질방 · Jjimjilbang', 11, '#7A5040')}
    </G>
  ),
  tombs: (
    <G>
      {day}
      {cloud(80, 40)}
      <Ellipse cx="90" cy="190" rx="110" ry="70" fill="#62793E" />
      <Ellipse cx="300" cy="196" rx="130" ry="80" fill="#749344" />
      <Ellipse cx="200" cy="210" rx="80" ry="40" fill="#56673C" />
      {/* Cheomseongdae – bottle-shaped stone observatory */}
      <G transform="translate(200,190)">
        <Path d="M-22 0 Q-14 -40 -10 -70 L10 -70 Q14 -40 22 0Z" fill="#D1C8B2" stroke="#A89C84" strokeWidth="1.5" />
        {Array.from({ length: 9 }).map((_, i) => <Line key={i} x1={-22 + i * 1.3} y1={-i * 8} x2={22 - i * 1.3} y2={-i * 8} stroke="#A89C84" strokeWidth="1" />)}
        <Rect x="-5" y="-42" width="10" height="10" fill="#6B6863" />
        <Rect x="-14" y="-78" width="28" height="8" fill="#C1B79F" stroke="#A89C84" />
        <Rect x="-26" y="0" width="52" height="8" fill="#C1B79F" />
      </G>
      {ground('#8DB151', 214)}
      {t(200, 232, '대릉원 · 첨성대 Cheomseongdae', 10, '#38412A')}
    </G>
  ),
  temple: (
    <G>
      {day}
      <Path d="M0 110 Q100 40 200 80 Q300 30 400 100 L400 240 L0 240Z" fill="#829378" />
      {/* Bulguksa stone terraces & stair-bridges */}
      <Rect x="40" y="150" width="320" height="44" fill="#CFC9BB" />
      {Array.from({ length: 16 }).map((_, i) => <Line key={i} x1={40 + i * 20} y1="150" x2={40 + i * 20} y2="194" stroke="#ADA799" />)}
      <Path d="M150 194 L170 150 L200 150 L180 194Z" fill="#E5E0D5" />
      <Path d="M230 194 L250 150 L270 150 L250 194Z" fill="#E5E0D5" />
      <Rect x="90" y="116" width="220" height="34" fill="#A65452" />
      {dancheong(88, 108, 224)}
      {tiledRoof(88, 100, 224, '#4D5149')}
      {/* Dabotap (ornate) & Seokgatap (simple) */}
      <G transform="translate(60,150)">
        {[0, 1, 2, 3].map((i) => <Rect key={i} x={-14 + i * 2} y={-12 - i * 12} width={28 - i * 4} height="10" fill="#BAB4A6" />)}
        <Rect x="-2" y="-64" width="4" height="14" fill="#948F83" />
      </G>
      <G transform="translate(340,150)">
        {[0, 1, 2].map((i) => <G key={i}><Rect x={-16 + i * 3} y={-14 - i * 16} width={32 - i * 6} height="5" fill="#ADA89A" /><Rect x={-10 + i * 3} y={-9 - i * 16} width={20 - i * 6} height="9" fill="#C9C3B5" /></G>)}
      </G>
      {Array.from({ length: 12 }).map((_, i) => <Ellipse key={i} cx={40 + i * 30} cy="96" rx="6" ry="8" fill={['#DE99BA', '#E8DBA9', '#8FB1DB'][i % 3]} />)}
      {ground('#D6D1C8', 194)}
      {t(200, 226, '불국사 Bulguksa · UNESCO', 10, '#5B5854')}
    </G>
  ),
  mountain: (
    <G>
      <Sky top="#DCE0DA" bottom="#F3EEE4" />
      {cloud(60, 60)}
      {/* Hallasan – broad shield volcano with crater */}
      <Path d="M-20 210 Q120 80 180 70 L220 70 Q280 80 420 210Z" fill="#738471" />
      <Path d="M176 72 Q200 84 224 72" stroke="#505F4F" strokeWidth="4" fill="none" />
      <Path d="M150 96 Q200 60 250 96 Q220 90 200 92 Q180 90 150 96Z" fill="#F8F8F7" opacity={0.9} />
      {hills('#607560', 200)}
      <Path d="M120 240 Q160 200 190 180 Q210 160 200 120" stroke="#D1C8B2" strokeWidth="4" fill="none" strokeDasharray="6 4" />
      {[30, 70, 330, 370].map((x) => tree(x, 206, '#526952', 0.9))}
      {t(200, 232, '한라산 Hallasan 1,947 m', 10, '#FDFCFA')}
    </G>
  ),
  volcano: (
    <G>
      <Sky top="#E4C09A" bottom="#F3ECD3" />
      {/* Seongsan Ilchulbong tuff cone */}
      <Path d="M60 170 Q90 70 150 60 L250 60 Q300 70 330 170Z" fill="#8F9D83" />
      <Path d="M150 60 Q200 80 250 60" stroke="#68765E" strokeWidth="5" fill="none" />
      {Array.from({ length: 10 }).map((_, i) => <Line key={i} x1={96 + i * 22} y1="100" x2={90 + i * 24} y2="170" stroke="#7F8C75" strokeWidth="2" />)}
      {sea(170, '#6483C7')}
      {[80, 120, 300, 340].map((x) => <G key={x}><Circle cx={x} cy="200" r="7" fill="#D18B59" /><Line x1={x} y1="207" x2={x} y2="220" stroke="#41454A" strokeWidth="2" /></G>)}
      {t(200, 232, '성산일출봉 Seongsan Ilchulbong · haenyeo buoys', 9, '#FDFCFA')}
    </G>
  ),
  coast: (
    <G>
      {day}
      {sea(110, '#54A0C1')}
      <Path d="M0 160 Q100 130 200 150 Q300 170 400 140 L400 240 L0 240Z" fill="#565A60" />
      {Array.from({ length: 16 }).map((_, i) => <Ellipse key={i} cx={(i * 27) % 400} cy={170 + (i % 3) * 18} rx="14" ry="8" fill="#41454A" />)}
      <Path d="M0 200 Q200 180 400 205" stroke="#D1C8B2" strokeWidth="10" fill="none" />
      {/* dol hareubang */}
      <G transform="translate(330,190)">
        <Rect x="-14" y="-50" width="28" height="50" rx="10" fill="#6B6863" />
        <Ellipse cx="0" cy="-56" rx="15" ry="9" fill="#5B5854" />
        <Ellipse cx="-5" cy="-38" rx="3" ry="4" fill="#44413E" />
        <Ellipse cx="5" cy="-38" rx="3" ry="4" fill="#44413E" />
        <Ellipse cx="0" cy="-30" rx="5" ry="4" fill="#5B5854" />
      </G>
      <Path d="M60 150 L60 120 M60 122 l10 4 l-10 4 M58 122 l-10 4 l10 4" stroke="#5B73B8" strokeWidth="2" fill="#D18B59" />
      {palm(120, 150, -6)}
    </G>
  ),
  storm: (
    <G>
      <Sky top="#41454A" bottom="#676B70" sun={false} />
      {cloud(40, 40, 1.4)}
      {cloud(220, 30, 1.6)}
      <Path d="M260 60 L240 110 L258 110 L236 160" stroke="#DCCC7B" strokeWidth="5" fill="none" />
      {Array.from({ length: 50 }).map((_, i) => <Line key={i} x1={(i * 41) % 400} y1={(i * 29) % 200} x2={(i * 41) % 400 - 10} y2={(i * 29) % 200 + 18} stroke="#B3CBE6" strokeWidth="1.6" opacity={0.7} />)}
      {sea(170, '#545A62')}
      {palm(80, 200, 22)}
      {palm(320, 200, 26)}
      <Rect x="140" y="120" width="120" height="70" fill="#7F868F" />
      {windows(150, 130, 10, 4, '#E8DBA9')}
    </G>
  ),
  pension: (
    <G>
      <Sky top="#E2E3DA" bottom="#F5EFE5" />
      {sea(150, '#54A0C1')}
      {hills('#749344', 190)}
      <Path d="M100 110 L200 60 L300 110Z" fill="#895D41" />
      <Rect x="115" y="110" width="170" height="80" fill="#E3C39C" />
      <Rect x="130" y="124" width="50" height="34" fill="#D1E3EF" />
      <Rect x="220" y="134" width="34" height="56" fill="#77533E" />
      <Rect x="300" y="170" width="40" height="8" fill="#41454A" />
      <Path d="M306 178 l-6 14 M334 178 l6 14" stroke="#41454A" strokeWidth="3" />
      <Path d="M312 166 q4 -8 0 -16 M326 166 q4 -8 0 -16" stroke="#ABAEB2" strokeWidth="2" fill="none" />
      {palm(60, 200)}
    </G>
  ),
  stage: (
    <G>
      {interior('#34373C', '#59585A')}
      <Rect x="20" y="20" width="360" height="150" fill="#41454A" stroke="#828489" strokeWidth="4" />
      <Rect x="28" y="28" width="344" height="134" fill="#565A60" />
      {[0, 1, 2, 3, 4].map((i) => <Path key={i} d={`M${40 + i * 80} 0 L${10 + i * 80} 176 L${70 + i * 80} 176Z`} fill={['#DE99BA', '#8FB1DB', '#E8DBA9', '#BBABE3', '#6ABB9B'][i]} opacity={0.18} />)}
      {t(200, 90, 'K-POP DANCE CLASS', 20, '#DE99BA')}
      {t(200, 116, '5 · 6 · 7 · 8 !', 14, '#E8DBA9')}
      <Rect x="0" y="176" width={W} height="6" fill="#BBABE3" />
    </G>
  ),
  kitchen: (
    <G>
      {interior('#F3ECD3', '#D9D6D3')}
      {Array.from({ length: 12 }).map((_, i) => <Rect key={i} x={i * 34} y="40" width="32" height="32" fill="#FDFCFA" stroke="#E8E6E3" />)}
      <Rect x="20" y="130" width="360" height="46" fill="#E8E6E3" stroke="#B1ACA8" strokeWidth="2" />
      <Ellipse cx="120" cy="128" rx="50" ry="14" fill="#E8E8E8" stroke="#ABAEB2" />
      <Ellipse cx="120" cy="126" rx="40" ry="9" fill="#C0615F" />
      <Ellipse cx="280" cy="128" rx="34" ry="12" fill="#41454A" />
      <Ellipse cx="280" cy="126" rx="28" ry="8" fill="#7A5040" />
      {t(200, 30, '김치 · 비빔밥 COOKING CLASS', 14, '#9F6C44')}
    </G>
  ),
  shop: (
    <G>
      {interior('#FBF2F1', '#F2DAE5')}
      {[0, 1, 2, 3].map((r) => (
        <G key={r}>
          <Rect x="10" y={30 + r * 36} width="380" height="5" fill="#EABFD4" />
          {Array.from({ length: 24 }).map((_, i) => <Rect key={i} x={14 + i * 16} y={14 + r * 36} width="10" height={14 + (i % 3) * 3} rx="3" fill={['#ECBDC1', '#BFC5E8', '#E8DBA9', '#A7DCB8', '#FDFCFA'][(i + r) % 5]} />)}
        </G>
      ))}
      <Rect x="120" y="160" width="160" height="30" rx="6" fill="#C96F6E" />
      {t(200, 181, 'TAX FREE · 즉시환급', 12, '#FDFCFA')}
    </G>
  ),
  dmz: (
    <G>
      <Sky top="#E3DED3" bottom="#F3EDE2" sun={false} />
      {hills('#7F8873', 150)}
      {hills('#646C5A', 190)}
      {Array.from({ length: 11 }).map((_, i) => <Rect key={i} x={i * 40} y="150" width="4" height="60" fill="#6B6863" />)}
      {[160, 172, 184, 196].map((y) => <Line key={y} x1="0" y1={y} x2={W} y2={y} stroke="#87827E" strokeWidth="1.5" strokeDasharray="4 3" />)}
      {Array.from({ length: 30 }).map((_, i) => <Rect key={i} x={6 + i * 13} y={164 + (i % 3) * 10} width="5" height="12" fill={['#C96F6E', '#E8DBA9', '#8FB1DB', '#FDFCFA'][i % 4]} />)}
      <Rect x="300" y="80" width="40" height="40" fill="#87827E" />
      <Rect x="294" y="74" width="52" height="8" fill="#6B6863" />
      {ground('#B1ACA8', 210)}
      {t(200, 230, 'DMZ · 비무장지대 – photos only at marked spots', 9, '#393633')}
    </G>
  ),
};

/**
 * Painted illustrations that replace the vector art for some scenes
 * (1280 px wide WebP, ~80 KB each; shown with "cover" so any frame size works).
 */
const PAINTED: Partial<Record<BackgroundId, ImageSourcePropType>> = {
  airport: require('../../assets/bg/airport.webp'),
  palace: require('../../assets/bg/palace.webp'),
  port: require('../../assets/bg/port.webp'),
  subway: require('../../assets/bg/subway.webp'),
  street: require('../../assets/bg/street.webp'),
  dmz: require('../../assets/bg/dmz.webp'),
  songdo: require('../../assets/bg/songdo.webp'),
  stage: require('../../assets/bg/stage.webp'),
  hanok: require('../../assets/bg/hanok.webp'),
  tower: require('../../assets/bg/tower.webp'),
  market: require('../../assets/bg/market.webp'),
  cafe: require('../../assets/bg/cafe.webp'),
  noraebang: require('../../assets/bg/noraebang.webp'),
  pharmacy: require('../../assets/bg/pharmacy.webp'),
  hospital: require('../../assets/bg/hospital.webp'),
  shop: require('../../assets/bg/shop.webp'),
  restaurant: require('../../assets/bg/restaurant.webp'),
  river: require('../../assets/bg/river.webp'),
  village: require('../../assets/bg/village.webp'),
  beach: require('../../assets/bg/beach.webp'),
  tombs: require('../../assets/bg/tombs.webp'),
  jjimjilbang: require('../../assets/bg/jjimjilbang.webp'),
  pension: require('../../assets/bg/pension.webp'),
  kitchen: require('../../assets/bg/kitchen.webp'),
  coast: require('../../assets/bg/coast.webp'),
  storm: require('../../assets/bg/storm.webp'),
  'night-beach': require('../../assets/bg/night-beach.webp'),
  temple: require('../../assets/bg/temple.webp'),
  mountain: require('../../assets/bg/mountain.webp'),
  volcano: require('../../assets/bg/volcano.webp'),
  ulsanbawi: require('../../assets/bg/ulsanbawi.webp'),
  geomun: require('../../assets/bg/geomun.webp'),
  nogodan: require('../../assets/bg/nogodan.webp'),
  igidae: require('../../assets/bg/igidae.webp'),
  bukchon: require('../../assets/bg/bukchon.webp'),
  hanbike: require('../../assets/bg/hanbike.webp'),
  railbike: require('../../assets/bg/railbike.webp'),
  paraglide: require('../../assets/bg/paraglide.webp'),
  mudflat: require('../../assets/bg/mudflat.webp'),
  bukhansan: require('../../assets/bg/bukhansan.webp'),
  pocha: require('../../assets/bg/pocha.webp'),
  towernight: require('../../assets/bg/towernight.webp'),
  templestay: require('../../assets/bg/templestay.webp'),
  citywall: require('../../assets/bg/citywall.webp'),
  kpop: require('../../assets/bg/kpop.webp'),
  lotteworld: require('../../assets/bg/lotteworld.webp'),
  hanbokroom: require('../../assets/bg/hanbokroom.webp'),
  mangwon: require('../../assets/bg/mangwon.webp'),
  kbeauty: require('../../assets/bg/kbeauty.webp'),
  museum: require('../../assets/bg/museum.webp'),
  hallyeo: require('../../assets/bg/hallyeo.webp'),
  haenyeo: require('../../assets/bg/haenyeo.webp'),
  jejufood: require('../../assets/bg/jejufood.webp'),
  haeinsa: require('../../assets/bg/haeinsa.webp'),
  hahoe: require('../../assets/bg/hahoe.webp'),
  jeonju: require('../../assets/bg/jeonju.webp'),
  seomun: require('../../assets/bg/seomun.webp'),
  gwangju518: require('../../assets/bg/gwangju518.webp'),
  yeosunight: require('../../assets/bg/yeosunight.webp'),
  suncheonbay: require('../../assets/bg/suncheonbay.webp'),
  ojukheon: require('../../assets/bg/ojukheon.webp'),
  dakgalbi: require('../../assets/bg/dakgalbi.webp'),
  westsunset: require('../../assets/bg/westsunset.webp'),
  surf: require('../../assets/bg/surf.webp'),
  gaetbae: require('../../assets/bg/gaetbae.webp'),
  bakery: require('../../assets/bg/bakery.webp'),
  transit: require('../../assets/bg/transit.webp'),
  ganghwa: require('../../assets/bg/ganghwa.webp'),
  jikji: require('../../assets/bg/jikji.webp'),
  baekje: require('../../assets/bg/baekje.webp'),
  folkvillage: require('../../assets/bg/folkvillage.webp'),
  icheon: require('../../assets/bg/icheon.webp'),
  hwaseong: require('../../assets/bg/hwaseong.webp'),
  chinatown: require('../../assets/bg/chinatown.webp'),
  heyri: require('../../assets/bg/heyri.webp'),
};

export function Background({ id, width, height }: { id: string; width: number; height: number }) {
  const painted = (PAINTED as Record<string, ImageSourcePropType | undefined>)[id];
  if (painted) return <Image source={painted} style={{ width, height }} resizeMode="cover" accessibilityIgnoresInvertColors />;
  const art = (BG as Record<string, React.ReactNode>)[id] ?? BG.street;
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice">
      <BgDefs />
      {art}
      <Rect x="0" y="0" width={W} height={H} fill="url(#bgx-vignette)" />
    </Svg>
  );
}
