import { useState } from 'react';
import { Modal, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { Text } from '../ui/Text';
import Svg, { Circle, Defs, G, LinearGradient, Line, Path, Rect, Stop } from 'react-native-svg';
import { SvgT as T } from '../ui/SvgText';
import { JEJU, KOREA_ISLANDS, KOREA_MOUNTAINS, KOREA_OUTLINE, KOREA_RIVERS, LINES, STATIONS, stationById } from '@kotoventure/shared';

/**
 * Illustrated KTX map drawn on the real geography of South Korea: coastline, islands, rivers,
 * mountain ranges, the DMZ, the other high-speed lines (SRT, KTX-Eum, Gyeongjeon/Donghae) and AREX
 * from Incheon Airport. The capital area is magnified like on a real rail map so its stations stay readable.
 */
export const MAP_W = 300;
export const MAP_H = 500;

type LL = [number, number];
const LNG0 = 125.95;
const LNG1 = 129.75;
const LAT0 = 38.72;
const COS = Math.cos((36.5 * Math.PI) / 180);
const K = MAP_W / ((LNG1 - LNG0) * COS);
/** Jeju is drawn a little north of its real position (map inset) */
const JEJU_SHIFT = 0.55;

const raw = (lng: number, lat: number) => ({ x: (lng - LNG0) * COS * K, y: (LAT0 - lat) * K });
// capital-area lens (Sarkar–Brown fisheye): ×3 in the centre, seamless at the edge
const LENS = { c: raw(126.99, 37.5), r: 64, d: 2 };
function proj(lng: number, lat: number) {
  const p = raw(lng, lat);
  const dx = p.x - LENS.c.x;
  const dy = p.y - LENS.c.y;
  const r = Math.hypot(dx, dy);
  if (r === 0 || r >= LENS.r) return p;
  const u = r / LENS.r;
  const s = (((LENS.d + 1) * u) / (LENS.d * u + 1)) * (LENS.r / r);
  return { x: LENS.c.x + dx * s, y: LENS.c.y + dy * s };
}
const P = ([lng, lat]: LL) => proj(lng, lat);

/** smooth Catmull-Rom path through points */
export function smooth(pts: { x: number; y: number }[], closed: boolean) {
  if (pts.length < 2) return '';
  const n = pts.length;
  const at = (i: number) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  let d = `M${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += ` C${c1.x.toFixed(1)} ${c1.y.toFixed(1)} ${c2.x.toFixed(1)} ${c2.y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return closed ? d + 'Z' : d;
}
const ellipse = (lng: number, lat: number, rx: number, ry: number, n = 14): { x: number; y: number }[] =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return proj(lng + Math.cos(a) * rx, lat + Math.sin(a) * ry);
  });

/* ── geography ── */
const LAND = smooth(KOREA_OUTLINE.map(P), true);
const DMZ = smooth(KOREA_OUTLINE.slice(0, 7).map(P), false);
// mountain ranges (Taebaek along the east, Sobaek across the middle) and the big plains
const TAEBAEK: LL[] = [[128.2, 38.35], [128.55, 38.12], [128.9, 37.62], [129.17, 37.1], [129.22, 36.6], [129.0, 36.3], [128.7, 36.6], [128.45, 37.0], [128.25, 37.45], [128.0, 37.85]];
const SOBAEK: LL[] = [[127.95, 37.02], [128.45, 36.96], [128.6, 36.72], [128.2, 36.3], [127.95, 35.9], [127.85, 35.5], [127.6, 35.2], [127.4, 35.42], [127.62, 35.9], [127.75, 36.45]];
const PLAINS: LL[][] = [
  [[126.62, 35.98], [127.02, 35.92], [127.08, 35.5], [126.78, 35.28], [126.52, 35.5]],
  [[126.85, 37.25], [127.3, 37.1], [127.2, 36.85], [126.9, 36.85], [126.75, 37.05]],
  [[128.45, 35.98], [128.85, 35.9], [128.9, 35.65], [128.5, 35.6]],
];
const RIVERS: LL[][] = [...KOREA_RIVERS, [[127.05, 35.32], [126.85, 35.12], [126.62, 34.92], [126.42, 34.8]]];
/** small islands along the west and south coasts, Yeongjong (Incheon Airport) */
const SMALL_ISLANDS: [number, number, number, number][] = [
  [126.45, 37.46, 0.09, 0.045], [126.55, 37.25, 0.03, 0.02], [126.38, 37.38, 0.03, 0.02], [126.4, 36.02, 0.03, 0.02], [126.15, 35.65, 0.03, 0.02],
  [126.1, 34.95, 0.05, 0.03], [126.0, 34.8, 0.04, 0.03], [126.22, 34.62, 0.05, 0.03], [126.05, 34.52, 0.03, 0.02], [126.45, 34.15, 0.05, 0.03],
  [126.72, 34.12, 0.04, 0.03], [126.95, 34.22, 0.05, 0.03], [127.15, 34.33, 0.04, 0.025], [127.42, 34.42, 0.05, 0.03], [127.8, 34.58, 0.04, 0.03],
  [128.08, 34.68, 0.04, 0.03], [128.42, 34.7, 0.05, 0.03], [128.68, 34.7, 0.04, 0.03], [125.95, 34.65, 0.03, 0.02], [126.3, 34.3, 0.03, 0.02],
];
const PEAK_NAMES: Record<number, [string, number, number]> = { 0: ['설악산', 6, -2], 8: ['지리산', -2, 14] };

/* ── rail ── */
// how the station dots sit on the map (offsets for the busy capital, label side)
const NUDGE: Record<string, [number, number]> = { seoul: [4, -4], yongsan: [-6, 4], gwangmyeong: [-4, 8] };
const SPOT = (id: string) => {
  const s = stationById(id)!;
  const p = proj(s.lng, s.lat);
  const n = NUDGE[id] ?? [0, 0];
  return { x: p.x + n[0], y: p.y + n[1] };
};
/** real track shape between neighbouring stations */
const VIA: Record<string, LL[]> = {
  'seoul>manjong': [[127.06, 37.585], [127.49, 37.49]],
  'manjong>pyeongchang': [[128.15, 37.45]],
  'jinbu>gangneung': [[128.75, 37.72]],
  'daejeon>gimcheon-gumi': [[127.75, 36.2]],
  'dongdaegu>singyeongju': [[128.95, 35.86]],
  'ulsan>busan': [[129.1, 35.3]],
  'jeongeup>gwangju-songjeong': [[126.8, 35.35]],
  'gwangju-songjeong>mokpo': [[126.55, 34.95]],
  'jeonju>namwon': [[127.25, 35.6]],
  'namwon>suncheon': [[127.43, 35.18]],
  'suncheon>yeosu': [[127.63, 34.84]],
};
function linePts(path: string[]) {
  const out: { x: number; y: number }[] = [];
  path.forEach((id, i) => {
    if (i > 0) for (const v of VIA[`${path[i - 1]}>${id}`] ?? []) out.push(P(v));
    out.push(SPOT(id));
  });
  return out;
}
/** other lines for orientation (not part of the ticket question) */
const OTHER: { id: string; color: string; dash?: string; width: number; pts: LL[]; stops: { at: LL; ko: string; en: string; side: 'r' | 'l' | 't' | 'b' }[] }[] = [
  {
    id: 'arex', color: '#1E3A8A', dash: '3 2', width: 2.2,
    pts: [[126.4505, 37.4479], [126.6, 37.55], [126.8016, 37.5623], [126.9707, 37.5547]],
    stops: [{ at: [126.8016, 37.5623], ko: '김포공항', en: 'Gimpo', side: 't' }],
  },
  {
    id: 'eum', color: '#0E9F9A', dash: '4 2', width: 2.4,
    pts: [[127.0477, 37.5803], [127.4905, 37.4925], [127.9461, 37.318], [128.1945, 37.1332], [128.3598, 36.9814], [128.6249, 36.8091], [128.6833, 36.5644]],
    stops: [
      { at: [127.0477, 37.5803], ko: '청량리', en: 'Cheongnyangni', side: 'r' },
      { at: [128.3598, 36.9814], ko: '단양', en: 'Danyang', side: 'l' },
      { at: [128.6833, 36.5644], ko: '안동', en: 'Andong', side: 'r' },
    ],
  },
  {
    id: 'srt', color: '#7C3AED', dash: '4 2', width: 2.2,
    pts: [[127.104, 37.4855], [127.1, 37.2], [127.0864, 36.993], [127.1045, 36.7945]],
    stops: [{ at: [127.104, 37.4855], ko: '수서', en: 'Suseo', side: 'r' }],
  },
  {
    id: 'gyeongjeon', color: '#1D4ED8', dash: '2 2', width: 1.8,
    pts: [[128.6283, 35.8793], [128.761, 35.486], [128.69, 35.25], [128.566, 35.239], [128.1, 35.178]],
    stops: [{ at: [128.1, 35.178], ko: '진주', en: 'Jinju', side: 'b' }],
  },
  {
    id: 'donghae', color: '#1D4ED8', dash: '2 2', width: 1.8,
    pts: [[129.1897, 35.7984], [129.349, 36.072]],
    stops: [{ at: [129.349, 36.072], ko: '포항', en: 'Pohang', side: 't' }],
  },
];

function Peak({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <G transform={`translate(${x},${y}) scale(${s})`}>
      <Path d="M-9 5 L0 -8 L9 5 Z" fill="#B9A586" />
      <Path d="M0 -8 L9 5 L3 5 Z" fill="#9E8C6E" />
      <Path d="M-3 -3.6 L0 -8 L3 -3.6 L1.3 -2.6 L0 -4 L-1.3 -2.6 Z" fill="#FAF5EA" />
    </G>
  );
}
/** two-pass label: cream halo, then ink */
function Label({ x, y, text, size, weight, color, anchor }: { x: number; y: number; text: string; size: number; weight: '700' | '800' | '900'; color: string; anchor: 'start' | 'middle' | 'end' }) {
  return (
    <G>
      <T x={x} y={y} fontSize={size} fontWeight={weight} fill="#FBF6EA" stroke="#FBF6EA" strokeWidth={2.4} strokeLinejoin="round" textAnchor={anchor}>
        {text}
      </T>
      <T x={x} y={y} fontSize={size} fontWeight={weight} fill={color} textAnchor={anchor}>
        {text}
      </T>
    </G>
  );
}
const place = (side: 'r' | 'l' | 't' | 'b', gap: number) =>
  side === 'r' ? { dx: gap, dy: -1, anchor: 'start' as const } : side === 'l' ? { dx: -gap, dy: -1, anchor: 'end' as const } : side === 't' ? { dx: 0, dy: -gap - 5, anchor: 'middle' as const } : { dx: 0, dy: gap + 6, anchor: 'middle' as const };

export function KtxMap({ width, onTap, highlight }: { width: number; onTap?: (id: string) => void; highlight?: string }) {
  const k = width / MAP_W;
  const jeju = ellipse(JEJU.lng, JEJU.lat + JEJU_SHIFT, JEJU.rx, JEJU.ry, 18);
  const jejuBox = { x: proj(JEJU.lng - JEJU.rx - 0.18, 0).x, y: proj(0, JEJU.lat + JEJU_SHIFT + JEJU.ry + 0.14).y };
  const jejuBoxW = proj(JEJU.lng + JEJU.rx + 0.18, 0).x - jejuBox.x;
  const jejuBoxH = proj(0, JEJU.lat + JEJU_SHIFT - JEJU.ry - 0.12).y - jejuBox.y;
  const icn = P([126.4505, 37.4479]);
  const km50 = 50 / 111 * K;
  return (
    <View style={{ width, height: MAP_H * k }}>
      <Svg width={width} height={MAP_H * k} viewBox={`0 0 ${MAP_W} ${MAP_H}`}>
        <Defs>
          <LinearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#CFE4E2" />
            <Stop offset="1" stopColor="#B9D7D6" />
          </LinearGradient>
          <LinearGradient id="land" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#F4EAD2" />
            <Stop offset="1" stopColor="#EADDBF" />
          </LinearGradient>
        </Defs>
        {/* sea, shallow-water band and a few wave strokes */}
        <Rect x="0" y="0" width={MAP_W} height={MAP_H} rx="12" fill="url(#sea)" />
        <Path d={LAND} fill="none" stroke="#DCEDEA" strokeWidth="9" strokeLinejoin="round" />
        {[[22, 70], [30, 300], [255, 70], [270, 300], [130, 470], [220, 430], [12, 180], [282, 200]].map(([x, y], i) => (
          <Path key={i} d={`M${x} ${y} q5 -2.5 10 0 t10 0`} stroke="#A9CBC9" strokeWidth="1.1" fill="none" strokeLinecap="round" />
        ))}
        {/* land */}
        <Path d={LAND} fill="url(#land)" stroke="#C9B48B" strokeWidth="1.2" strokeLinejoin="round" />
        {[...KOREA_ISLANDS, ...SMALL_ISLANDS].map(([lng, lat, rx, ry], i) => (
          <Path key={i} d={smooth(ellipse(lng, lat, rx, ry, 10), true)} fill="#EFE3C8" stroke="#C9B48B" strokeWidth="0.8" />
        ))}
        {/* plains and mountain ranges */}
        {PLAINS.map((pl, i) => <Path key={i} d={smooth(pl.map(P), true)} fill="#DCE5C0" opacity={0.85} />)}
        <Path d={smooth(TAEBAEK.map(P), true)} fill="#DCCBA6" opacity={0.75} />
        <Path d={smooth(SOBAEK.map(P), true)} fill="#DFD0AD" opacity={0.7} />
        {/* rivers */}
        {RIVERS.map((r, i) => (
          <Path key={i} d={smooth(r.map(P), false)} stroke="#93C2C6" strokeWidth={i < 2 ? 2 : 1.6} fill="none" strokeLinecap="round" />
        ))}
        {/* DMZ */}
        <Path d={DMZ} stroke="#8F7F62" strokeWidth="1.2" strokeDasharray="3 2" fill="none" />
        <Label x={P([127.6, 38.32]).x} y={P([127.6, 38.32]).y - 5} text="DMZ" size={6} weight="800" color="#8F7F62" anchor="middle" />
        {/* peaks (Halla goes with Jeju) */}
        {KOREA_MOUNTAINS.slice(0, -1).map(([lng, lat], i) => {
          const m = proj(lng, lat);
          const name = PEAK_NAMES[i];
          return (
            <G key={i}>
              <Peak x={m.x} y={m.y} s={0.75} />
              {name && <Label x={m.x + name[1]} y={m.y + name[2]} text={name[0]} size={5.5} weight="700" color="#8A7656" anchor={name[1] < 0 ? 'end' : 'start'} />}
            </G>
          );
        })}
        {/* Jeju (inset) */}
        <Rect x={jejuBox.x} y={jejuBox.y} width={jejuBoxW} height={jejuBoxH} rx="5" fill="none" stroke="#9FBFBC" strokeWidth="0.8" strokeDasharray="3 2" />
        <Path d={smooth(jeju, true)} fill="url(#land)" stroke="#C9B48B" strokeWidth="1" />
        <Peak x={proj(JEJU.lng, JEJU.lat + JEJU_SHIFT).x} y={proj(JEJU.lng, JEJU.lat + JEJU_SHIFT).y} s={0.7} />
        <Label x={jejuBox.x + jejuBoxW + 3} y={jejuBox.y + jejuBoxH - 4} text="제주 Jeju" size={6.5} weight="800" color="#7A6A50" anchor="start" />
        {/* seas */}
        <T x="8" y="250" fontSize="8" fontWeight="800" fill="#6F9C99">서해</T>
        <T x="8" y="259" fontSize="5.5" fontWeight="700" fill="#6F9C99">Yellow Sea</T>
        <T x="294" y="120" fontSize="8" fontWeight="800" fill="#6F9C99" textAnchor="end">동해</T>
        <T x="294" y="129" fontSize="5.5" fontWeight="700" fill="#6F9C99" textAnchor="end">East Sea</T>
        <T x="128" y="420" fontSize="8" fontWeight="800" fill="#6F9C99">남해</T>
        <T x="128" y="429" fontSize="5.5" fontWeight="700" fill="#6F9C99">South Sea</T>
        {/* other lines and AREX */}
        {OTHER.map((o) => (
          <G key={o.id}>
            <Path d={smooth(o.pts.map(P), false)} stroke="#FBF6EA" strokeWidth={o.width + 2.5} fill="none" strokeLinecap="round" />
            <Path d={smooth(o.pts.map(P), false)} stroke={o.color} strokeWidth={o.width} strokeDasharray={o.dash} fill="none" strokeLinecap="round" opacity={0.9} />
            {o.stops.map((st) => {
              const q = P(st.at);
              const pl = place(st.side, 5);
              return (
                <G key={st.ko}>
                  <Circle cx={q.x} cy={q.y} r="2.4" fill="#FFFDF7" stroke={o.color} strokeWidth="1.2" />
                  <Label x={q.x + pl.dx} y={q.y + pl.dy} text={st.ko} size={6} weight="800" color="#5C5345" anchor={pl.anchor} />
                </G>
              );
            })}
          </G>
        ))}
        {/* Incheon Airport */}
        <G>
          <Circle cx={icn.x} cy={icn.y} r="6.5" fill="#1E3A8A" />
          <T x={icn.x} y={icn.y + 2.6} fontSize="7.5" fill="#FFF" textAnchor="middle">✈</T>
          <Label x={icn.x} y={icn.y + 14} text="인천공항 ICN" size={6} weight="800" color="#1E3A8A" anchor="middle" />
        </G>
        {/* KTX lines: light casing + colour */}
        {LINES.map((l) => (
          <Path key={l.id + 'c'} d={smooth(linePts(l.path), false)} stroke="#FBF6EA" strokeWidth="7.5" fill="none" strokeLinejoin="round" strokeLinecap="round" />
        ))}
        {LINES.map((l) => (
          <Path key={l.id} d={smooth(linePts(l.path), false)} stroke={l.color} strokeWidth="4" fill="none" strokeLinejoin="round" strokeLinecap="round" />
        ))}
        {/* stations */}
        {STATIONS.map((s) => {
          const q = SPOT(s.id);
          const hub = s.line === 'hub';
          const pl = place(s.lp ?? 'r', hub ? 7 : 6);
          return (
            <G key={s.id}>
              {s.id === highlight && <Circle cx={q.x} cy={q.y} r="10" fill="#FACC15" opacity={0.5} />}
              <Circle cx={q.x} cy={q.y} r={hub ? 5 : 3.8} fill={s.id === highlight ? '#FACC15' : '#FFFDF7'} stroke="#2B2620" strokeWidth={hub ? 1.8 : 1.4} />
              {hub && <Circle cx={q.x} cy={q.y} r="1.8" fill="#2B2620" />}
              <Label x={q.x + pl.dx} y={q.y + pl.dy} text={s.ko} size={hub ? 8.5 : 7.5} weight="900" color="#2B2620" anchor={pl.anchor} />
              <Label x={q.x + pl.dx} y={q.y + pl.dy + 7} text={s.en.replace(/ \(.*\)/, '')} size={5.3} weight="700" color="#6B6250" anchor={pl.anchor} />
            </G>
          );
        })}
        {/* compass and scale */}
        <G transform="translate(278,24)">
          <Circle r="11" fill="#FBF6EA" stroke="#C8B48C" strokeWidth="1" />
          <Path d="M0 -8.5 L3 0 L0 8.5 L-3 0Z" fill="#E9772F" />
          <Path d="M0 0 L3 0 L0 8.5Z" fill="#C8B48C" />
          <T x="0" y="-13" fontSize="6.5" fontWeight="900" fill="#7A6A50" textAnchor="middle">N</T>
        </G>
        <G transform={`translate(${MAP_W - 12 - km50},${MAP_H - 76})`}>
          <Line x1="0" y1="0" x2={km50} y2="0" stroke="#5C5345" strokeWidth="1.6" />
          <Line x1="0" y1="-3" x2="0" y2="2" stroke="#5C5345" strokeWidth="1.2" />
          <Line x1={km50} y1="-3" x2={km50} y2="2" stroke="#5C5345" strokeWidth="1.2" />
          <T x={km50 / 2} y="-4" fontSize="6" fontWeight="800" fill="#5C5345" textAnchor="middle">50 km</T>
        </G>
        {/* legend */}
        <Rect x="150" y={MAP_H - 66} width="144" height="60" rx="6" fill="#FBF6EA" opacity={0.95} stroke="#D2BF97" strokeWidth="0.8" />
        {LINES.map((l, i) => (
          <G key={l.id} transform={`translate(156,${MAP_H - 55 + i * 9})`}>
            <Rect x="0" y="-3.5" width="12" height="4" rx="2" fill={l.color} />
            <T x="16" y="0" fontSize="6.2" fontWeight="800" fill="#2B2620">
              {l.ko} {l.en}
            </T>
          </G>
        ))}
        {[['#7C3AED', 'SRT (수서)'], ['#0E9F9A', 'KTX-이음 Eum'], ['#1E3A8A', '공항철도 AREX']].map(([c, t], i) => (
          <G key={t} transform={`translate(156,${MAP_H - 19 + Math.floor(i / 2) * 8})`}>
            <Line x1={(i % 2) * 70} y1="-1.5" x2={(i % 2) * 70 + 10} y2="-1.5" stroke={c} strokeWidth="2" strokeDasharray="3 1.5" />
            <T x={(i % 2) * 70 + 13} y="0.5" fontSize="5.5" fontWeight="700" fill="#5C5345">
              {t}
            </T>
          </G>
        ))}
      </Svg>
      {onTap &&
        STATIONS.map((s) => {
          const q = SPOT(s.id);
          const small = s.id in NUDGE;
          const w = small ? 16 : 24;
          const h = small ? 11 : 20;
          return (
            <Pressable
              key={s.id}
              testID={`st-${s.id}`}
              accessibilityLabel={s.en}
              onPress={() => onTap(s.id)}
              style={{ position: 'absolute', left: (q.x - w / 2) * k, top: (q.y - h / 2) * k, width: w * k, height: h * k, borderRadius: (h / 2) * k }}
            />
          );
        })}
    </View>
  );
}

/**
 * The KTX map with a "zoom" button: opens a full-screen view (zoom 1×–3×, scroll in both directions)
 * where stations can still be tapped – choosing one closes the view.
 */
export function KtxMapCard({ width, onTap, highlight, lang }: { width: number; onTap?: (id: string) => void; highlight?: string; lang: string }) {
  const ko = lang === 'ko';
  const { width: sw } = useWindowDimensions();
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(1.6);
  const fullW = Math.min(sw, 700) - 16;
  return (
    <View>
      <KtxMap width={width} onTap={onTap} highlight={highlight} />
      <Pressable
        testID="ktx-zoom"
        onPress={() => {
          setZoom(1.6);
          setOpen(true);
        }}
        accessibilityRole="button"
        accessibilityLabel={ko ? '노선도 크게 보기' : 'Zoom the map'}
        style={{ position: 'absolute', top: 8, left: 8, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#1F2A44E6', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 }}
      >
        <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 13 }}>🔍 {ko ? '크게 보기' : 'Zoom'}</Text>
      </Pressable>
      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={{ flex: 1, backgroundColor: '#1F2A44' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingTop: 14, paddingBottom: 10 }}>
            <Pressable testID="ktx-zoom-close" onPress={() => setOpen(false)} style={{ padding: 6 }} accessibilityRole="button" accessibilityLabel={ko ? '닫기' : 'Close'}>
              <Text style={{ color: '#FFF', fontSize: 22, fontWeight: '900' }}>✕</Text>
            </Pressable>
            <Text style={{ flex: 1, color: '#FFF', fontWeight: '900', fontSize: 15 }} numberOfLines={1}>
              🚄 {ko ? 'KTX 노선도' : 'KTX map'}
            </Text>
            {(
              [
                ['−', () => setZoom((z) => Math.max(1, +(z - 0.5).toFixed(1))), 'ktx-zoom-out'],
                ['+', () => setZoom((z) => Math.min(3, +(z + 0.5).toFixed(1))), 'ktx-zoom-in'],
              ] as const
            ).map(([label, fn, id]) => (
              <Pressable key={id} testID={id} onPress={fn} style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: '#FFFFFF22', alignItems: 'center', justifyContent: 'center' }} accessibilityRole="button">
                <Text style={{ color: '#FFF', fontSize: 22, fontWeight: '900' }}>{label}</Text>
              </Pressable>
            ))}
            <Text style={{ color: '#CBD5E1', fontWeight: '800', width: 48, textAlign: 'right' }}>{Math.round(zoom * 100)}%</Text>
          </View>
          {onTap && (
            <Text style={{ color: '#CBD5E1', fontSize: 12, paddingHorizontal: 14, paddingBottom: 6 }}>
              {ko ? '내릴 역을 누르세요. 화면을 밀어서 지도를 움직일 수 있어요.' : 'Tap the station to get off at. Drag to move around the map.'}
            </Text>
          )}
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 8 }}>
            <ScrollView horizontal contentContainerStyle={{ paddingRight: 8 }}>
              <KtxMap
                width={fullW * zoom}
                highlight={highlight}
                onTap={
                  onTap
                    ? (id) => {
                        setOpen(false);
                        onTap(id);
                      }
                    : undefined
                }
              />
            </ScrollView>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
