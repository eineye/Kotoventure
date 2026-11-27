import { useState } from 'react';
import { Modal, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';
import { SvgT as T } from '../ui/SvgText';
import { BUS_COLORS, type BusColor } from '@kotoventure/shared';
import { Text } from '../ui/Text';
import { smooth } from './KtxMap';

/**
 * Bus route maps on real geography (like the stop-sign route map): the route through its stops at their
 * real positions, with the area's hills, rivers, lakes, coast and landmarks. Routes whose stops are not
 * known here (e.g. written in the admin) simply show no map.
 */
const W = 300;
type LL = [number, number];
type Blob = [lng: number, lat: number, rx: number, ry: number, name?: string];
interface Area {
  box: [lng0: number, lng1: number, lat0: number, lat1: number];
  land?: LL[];
  lakes?: Blob[];
  rivers?: { pts: LL[]; w: number; name?: string }[];
  /** green = park/forest, brown = mountain */
  parks?: Blob[];
  hills?: Blob[];
  peaks?: { at: LL; ko: string }[];
  roads?: LL[][];
  /** subway / cable car / other lines for orientation */
  lines?: { pts: LL[]; color: string; ko?: string; dash?: string }[];
  labels?: { at: LL; ko: string; color?: string }[];
  /** colourful houses (Gamcheon) */
  houses?: Blob;
  /** extra bends of the road between two stops: "a|b" → points */
  via?: Record<string, LL[]>;
}

/** stop name (as written in the courses) → position */
const STOPS: Record<string, LL> = {
  '명동역 Myeongdong Stn.': [126.986, 37.5609],
  '남산케이블카 Cable Car': [126.9846, 37.5577],
  '국립극장 National Theater': [127.0007, 37.5524],
  '남산서울타워 N Seoul Tower': [126.9882, 37.5512],
  '성수역 Seongsu Stn.': [127.0557, 37.5445],
  '뚝섬역 Ttukseom Stn.': [127.0474, 37.5472],
  '서울숲 Seoul Forest': [127.0418, 37.5444],
  '토성역 Toseong Stn.': [129.0186, 35.1003],
  '부산대병원 PNU Hospital': [129.0168, 35.1009],
  '감정초등학교 Gamjeong Elem.': [129.0124, 35.0978],
  '감천문화마을 Gamcheon Village': [129.0105, 35.0974],
  '불국사 Bulguksa': [129.332, 35.79],
  '불국사 주차장 Bulguksa Parking': [129.3355, 35.7885],
  '토함산 고개 Tohamsan Pass': [129.343, 35.79],
  '석굴암 Seokguram': [129.3494, 35.7948],
  '속초 시내 Sokcho': [128.5918, 38.207],
  '물치 Mulchi': [128.618, 38.157],
  '설악동 Seorak-dong': [128.52, 38.17],
  '설악산 소공원 Seoraksan Park': [128.4895, 38.1725],
  '안동역 Andong Stn.': [128.6833, 36.5644],
  '병산 Byeongsan': [128.5536, 36.5405],
  '하회 입구 Hahoe Gate': [128.5335, 36.5425],
  '하회마을 Hahoe Village': [128.5185, 36.5395],
};

const AREAS: Area[] = [
  {
    // Namsan circular bus
    box: [126.972, 127.008, 37.543, 37.566],
    parks: [[126.991, 37.5515, 0.0115, 0.006, '남산'], [126.9945, 37.5595, 0.0016, 0.001]],
    roads: [[[126.972, 37.5585], [126.99, 37.5605], [127.008, 37.5625]], [[126.976, 37.552], [126.982, 37.5545], [126.984, 37.5565]], [[126.986, 37.566], [126.986, 37.5609]]],
    lines: [{ pts: [[126.9846, 37.5577], [126.9872, 37.5527]], color: '#6B7280', ko: '케이블카', dash: '3 2' }],
    labels: [{ at: [126.981, 37.5635], ko: '명동 거리' }, { at: [126.9945, 37.5603], ko: '남산골한옥마을', color: '#5E7D4E' }],
    via: {
      '명동역 Myeongdong Stn.|남산케이블카 Cable Car': [[126.9855, 37.5594]],
      '남산케이블카 Cable Car|국립극장 National Theater': [[126.99, 37.5574], [126.997, 37.5556]],
      '국립극장 National Theater|남산서울타워 N Seoul Tower': [[126.9975, 37.5527], [126.9925, 37.551]],
    },
  },
  {
    // Seongsu – Seoul Forest
    box: [127.035, 127.062, 37.532, 37.552],
    rivers: [
      { w: 22, pts: [[127.03, 37.537], [127.045, 37.5345], [127.058, 37.5352], [127.07, 37.537]], name: '한강 Han River' },
      { w: 5, pts: [[127.064, 37.552], [127.0605, 37.543], [127.0575, 37.536]], name: '중랑천' },
    ],
    parks: [[127.0405, 37.5432, 0.0048, 0.0037, '서울숲']],
    roads: [[[127.035, 37.5475], [127.05, 37.5468], [127.062, 37.5452]], [[127.0557, 37.552], [127.0557, 37.538]]],
    lines: [{ pts: [[127.035, 37.5478], [127.0474, 37.5472], [127.0557, 37.5445], [127.062, 37.5435]], color: '#00A84D', ko: '2호선' }],
    labels: [{ at: [127.0525, 37.5418], ko: '성수동 카페거리' }],
    via: { '성수역 Seongsu Stn.|뚝섬역 Ttukseom Stn.': [[127.051, 37.5463]], '뚝섬역 Ttukseom Stn.|서울숲 Seoul Forest': [[127.044, 37.5462]] },
  },
  {
    // Gamcheon Culture Village
    box: [129.003, 129.027, 35.091, 35.106],
    hills: [[129.0065, 35.0935, 0.0055, 0.0035, '천마산'], [129.022, 35.104, 0.004, 0.003, '구덕산 자락']],
    houses: [129.0105, 35.0972, 0.003, 0.0022],
    roads: [[[129.027, 35.0975], [129.0186, 35.1003], [129.012, 35.1045]]],
    lines: [{ pts: [[129.0186, 35.1003], [129.027, 35.0968]], color: '#F06E00', ko: '1호선' }],
    via: {
      '토성역 Toseong Stn.|부산대병원 PNU Hospital': [[129.0178, 35.1008]],
      '부산대병원 PNU Hospital|감정초등학교 Gamjeong Elem.': [[129.0146, 35.0999], [129.0135, 35.0983]],
    },
  },
  {
    // Bulguksa → Seokguram
    box: [129.326, 129.366, 35.782, 35.801],
    hills: [[129.353, 35.7935, 0.013, 0.0075, '토함산']],
    parks: [[129.3315, 35.7905, 0.002, 0.0014], [129.3494, 35.7952, 0.0012, 0.0009]],
    peaks: [{ at: [129.3608, 35.7953], ko: '토함산 정상' }],
    labels: [{ at: [129.329, 35.785], ko: '불국사 마을' }],
    via: {
      '불국사 Bulguksa|불국사 주차장 Bulguksa Parking': [[129.3338, 35.7892]],
      '불국사 주차장 Bulguksa Parking|토함산 고개 Tohamsan Pass': [[129.338, 35.7874], [129.3402, 35.7912], [129.3418, 35.7882]],
      '토함산 고개 Tohamsan Pass|석굴암 Seokguram': [[129.3458, 35.7922], [129.348, 35.7932]],
    },
  },
  {
    // Sokcho → Seoraksan
    box: [128.47, 128.645, 38.135, 38.225],
    land: [[128.46, 38.23], [128.592, 38.23], [128.596, 38.215], [128.601, 38.205], [128.596, 38.195], [128.605, 38.18], [128.612, 38.17], [128.622, 38.158], [128.63, 38.145], [128.638, 38.13], [128.46, 38.13]],
    lakes: [[128.592, 38.198, 0.006, 0.004], [128.586, 38.216, 0.006, 0.004, '영랑호']],
    hills: [[128.485, 38.15, 0.03, 0.025, '설악산'], [128.5, 38.195, 0.012, 0.008]],
    peaks: [{ at: [128.4934, 38.1945], ko: '울산바위' }, { at: [128.475, 38.145], ko: '설악산' }],
    labels: [{ at: [128.63, 38.21], ko: '동해', color: '#4F8FA3' }],
    via: {
      '속초 시내 Sokcho|물치 Mulchi': [[128.594, 38.19], [128.606, 38.171]],
      '물치 Mulchi|설악동 Seorak-dong': [[128.6, 38.161], [128.57, 38.165], [128.545, 38.168]],
      '설악동 Seorak-dong|설악산 소공원 Seoraksan Park': [[128.505, 38.1712]],
    },
  },
  {
    // Andong → Hahoe
    box: [128.505, 128.7, 36.51, 36.595],
    rivers: [
      {
        w: 7,
        name: '낙동강',
        pts: [[128.7, 36.558], [128.67, 36.553], [128.64, 36.548], [128.61, 36.548], [128.585, 36.542], [128.565, 36.535], [128.553, 36.536], [128.54, 36.545], [128.525, 36.549], [128.511, 36.545], [128.508, 36.535], [128.515, 36.528], [128.53, 36.53], [128.537, 36.52]],
      },
    ],
    hills: [[128.535, 36.558, 0.012, 0.008, '화산'], [128.6, 36.575, 0.02, 0.01], [128.575, 36.522, 0.015, 0.008]],
    peaks: [{ at: [128.512, 36.552], ko: '부용대' }],
    labels: [{ at: [128.69, 36.575], ko: '안동 시내' }],
    via: { '안동역 Andong Stn.|병산 Byeongsan': [[128.65, 36.566], [128.61, 36.56], [128.58, 36.553]] },
  },
];

export function busAreaFor(stops: string[]) {
  return AREAS.find((a) => stops.every((s) => STOPS[s]) && stops.every((s) => {
    const [lng, lat] = STOPS[s];
    return lng >= a.box[0] && lng <= a.box[1] && lat >= a.box[2] && lat <= a.box[3];
  }));
}

const split = (s: string) => {
  const i = s.search(/[A-Za-z]/);
  return i > 0 ? [s.slice(0, i).trim(), s.slice(i).trim()] : [s, ''];
};

function Label({ x, y, text, size, color = '#1B2140', anchor = 'middle', weight = '900' }: { x: number; y: number; text: string; size: number; color?: string; anchor?: 'start' | 'middle' | 'end'; weight?: '700' | '800' | '900' }) {
  return (
    <G>
      <T x={x} y={y} fontSize={size} fontWeight={weight} fill="#FFFDF7" stroke="#FFFDF7" strokeWidth={2.2} strokeLinejoin="round" textAnchor={anchor}>
        {text}
      </T>
      <T x={x} y={y} fontSize={size} fontWeight={weight} fill={color} textAnchor={anchor}>
        {text}
      </T>
    </G>
  );
}

export function BusMap({ stops, color, busNo, target, pos, width }: { stops: string[]; color: BusColor; busNo: string; target: string; /** index of the stop the bus just left (undefined = waiting at the first stop) */ pos?: number; width: number }) {
  const a = busAreaFor(stops);
  if (!a) return null;
  const [lng0, lng1, lat0, lat1] = a.box;
  const cos = Math.cos((((lat0 + lat1) / 2) * Math.PI) / 180);
  const k = W / ((lng1 - lng0) * cos);
  const H = (lat1 - lat0) * k;
  const p = (lng: number, lat: number) => ({ x: (lng - lng0) * cos * k, y: (lat1 - lat) * k });
  const P = ([lng, lat]: LL) => p(lng, lat);
  const blob = ([lng, lat, rx, ry]: Blob, n = 12) =>
    smooth(
      Array.from({ length: n }, (_, i) => {
        const t = (i / n) * Math.PI * 2;
        return p(lng + Math.cos(t) * rx, lat + Math.sin(t) * ry);
      }),
      true,
    );
  const routePts: { x: number; y: number }[] = [];
  stops.forEach((s, i) => {
    if (i > 0) for (const v of a.via?.[`${stops[i - 1]}|${s}`] ?? []) routePts.push(P(v));
    routePts.push(P(STOPS[s]));
  });
  const hex = BUS_COLORS[color].hex;
  const busAt = pos === undefined ? P(STOPS[stops[0]]) : (() => {
    const q1 = P(STOPS[stops[pos]]);
    const q2 = P(STOPS[stops[Math.min(pos + 1, stops.length - 1)]]);
    return { x: (q1.x * 2 + q2.x) / 3, y: (q1.y * 2 + q2.y) / 3 };
  })();
  const sea = '#BFDDE6';
  const ground = '#F3EDE0';
  const sc = width / W;
  return (
    <View style={{ width, height: H * sc }}>
      <Svg width={width} height={H * sc} viewBox={`0 0 ${W} ${H}`}>
        <Rect x="0" y="0" width={W} height={H} rx="8" fill={a.land ? sea : ground} />
        {a.land && <Path d={smooth(a.land.map(P), true)} fill={ground} stroke="#D8CDB4" strokeWidth="1" />}
        {a.hills?.map((b, i) => {
          const c = P([b[0], b[1]]);
          return (
            <G key={i}>
              <Path d={blob(b)} fill="#DCCFAE" />
              <Path d={blob([b[0], b[1], b[2] * 0.6, b[3] * 0.6])} fill="#CFC09A" />
              {b[4] && <Label x={c.x} y={c.y + 2} text={b[4]} size={6.5} color="#7A6A4E" weight="800" />}
            </G>
          );
        })}
        {a.parks?.map((b, i) => {
          const c = P([b[0], b[1]]);
          return (
            <G key={i}>
              <Path d={blob(b)} fill="#CFE3BE" />
              {b[4] && <Label x={c.x} y={c.y + 2} text={b[4]} size={6.5} color="#5E7D4E" weight="800" />}
            </G>
          );
        })}
        {a.houses &&
          Array.from({ length: 26 }).map((_, i) => {
            const [lng, lat, rx, ry] = a.houses!;
            const q = p(lng + (((i * 37) % 21) / 10 - 1) * rx, lat + (((i * 53) % 17) / 8 - 1) * ry);
            return <Rect key={i} x={q.x - 2.2} y={q.y - 1.6} width="4.4" height="3.2" rx="0.6" fill={['#F87171', '#60A5FA', '#FBBF24', '#34D399', '#F472B6', '#A78BFA'][i % 6]} opacity={0.85} />;
          })}
        {a.lakes?.map((b, i) => {
          const c = P([b[0], b[1]]);
          return (
            <G key={i}>
              <Path d={blob(b)} fill={sea} />
              {b[4] && <Label x={c.x} y={c.y + 2} text={b[4]} size={5.5} color="#4F8FA3" weight="800" />}
            </G>
          );
        })}
        {a.rivers?.map((r, i) => {
          const pts = r.pts.map(P);
          const m = pts[Math.floor(pts.length / 2)];
          return (
            <G key={i}>
              <Path d={smooth(pts, false)} stroke={sea} strokeWidth={r.w} fill="none" strokeLinecap="round" />
              {r.name && <Label x={m.x} y={m.y + 2} text={r.name} size={6} color="#4F8FA3" weight="800" />}
            </G>
          );
        })}
        {a.roads?.map((r, i) => <Path key={i} d={smooth(r.map(P), false)} stroke="#FFFFFF" strokeWidth="3.5" fill="none" strokeLinecap="round" />)}
        {a.lines?.map((l, i) => {
          const pts = l.pts.map(P);
          return (
            <G key={i}>
              <Path d={smooth(pts, false)} stroke={l.color} strokeWidth="2.4" strokeDasharray={l.dash} fill="none" strokeLinecap="round" opacity={0.8} />
              {l.ko && <Label x={pts[pts.length - 1].x - 2} y={pts[pts.length - 1].y - 4} text={l.ko} size={5.5} color={l.color} anchor="end" weight="800" />}
            </G>
          );
        })}
        {a.peaks?.map((pk) => {
          const q = P(pk.at);
          return (
            <G key={pk.ko}>
              <Path d={`M${q.x - 7} ${q.y + 4} L${q.x} ${q.y - 6} L${q.x + 7} ${q.y + 4}Z`} fill="#A39376" />
              <Path d={`M${q.x - 2.4} ${q.y - 2.6} L${q.x} ${q.y - 6} L${q.x + 2.4} ${q.y - 2.6}Z`} fill="#FAF5EA" />
              <Label x={q.x} y={q.y + 11} text={pk.ko} size={5.5} color="#6B5A3E" weight="800" />
            </G>
          );
        })}
        {a.labels?.map((l) => {
          const q = P(l.at);
          return <Label key={l.ko} x={q.x} y={q.y} text={l.ko} size={6} color={l.color ?? '#6B6250'} weight="800" />;
        })}
        {/* the bus route */}
        <Path d={smooth(routePts, false)} stroke="#FFFFFF" strokeWidth="7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <Path d={smooth(routePts, false)} stroke={hex} strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {stops.map((s, i) => {
          const q = P(STOPS[s]);
          const [ko, en] = split(s);
          const passed = pos !== undefined && i <= pos;
          const isTarget = s === target;
          const below = i % 2 === 1 && i !== pos && i !== (pos ?? -1) + 1;
          return (
            <G key={s}>
              {isTarget && <Circle cx={q.x} cy={q.y} r="9" fill="#FACC15" opacity={0.5} />}
              <Circle cx={q.x} cy={q.y} r="4.2" fill={isTarget ? '#FACC15' : passed ? '#CBD5E1' : '#FFFFFF'} stroke="#1B2140" strokeWidth="1.5" />
              <Label x={q.x} y={below ? q.y + 13 : q.y - 14} text={`${isTarget ? '🎯 ' : ''}${ko}`} size={7.5} color={passed ? '#94A3B8' : '#1B2140'} />
              {en ? <Label x={q.x} y={below ? q.y + 20 : q.y - 7} text={en} size={5} color="#6B6250" weight="700" /> : null}
            </G>
          );
        })}
        {/* the bus */}
        <G>
          <Path d={`M${busAt.x - 3} ${busAt.y + 3} L${busAt.x} ${busAt.y} L${busAt.x + 3} ${busAt.y + 3}Z`} fill={hex} />
          <Rect x={busAt.x - 10} y={busAt.y + 3} width="20" height="10" rx="3" fill={hex} stroke="#FFFFFF" strokeWidth="1.2" />
          <T x={busAt.x} y={busAt.y + 10.5} fontSize="6.5" fontWeight="900" fill={color === 'yellow' ? '#111' : '#FFF'} textAnchor="middle">
            {busNo}
          </T>
        </G>
        <G transform={`translate(${W - 12},12)`}>
          <Circle r="8" fill="#FFFDF7" stroke="#C8B48C" strokeWidth="0.8" />
          <Path d="M0 -6 L2.2 0 L0 6 L-2.2 0Z" fill="#E9772F" />
          <T x="0" y="-9.5" fontSize="5" fontWeight="900" fill="#7A6A50" textAnchor="middle">
            N
          </T>
        </G>
      </Svg>
    </View>
  );
}

/** Route map with a zoom button (full-screen view, 100–300%). */
export function BusMapCard(props: { stops: string[]; color: BusColor; busNo: string; target: string; pos?: number; width: number; lang: string; title: string }) {
  const ko = props.lang === 'ko';
  const { width: sw } = useWindowDimensions();
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(1.5);
  if (!busAreaFor(props.stops)) return null;
  const fullW = Math.min(sw, 700) - 16;
  return (
    <View style={{ gap: 4 }}>
      <Text style={{ fontWeight: '900', color: '#1B2140', fontSize: 13 }}>{props.title}</Text>
      <View>
        <BusMap {...props} />
        <Pressable
          testID="bus-zoom"
          onPress={() => {
            setZoom(1.5);
            setOpen(true);
          }}
          accessibilityRole="button"
          accessibilityLabel={ko ? '노선도 크게 보기' : 'Zoom the map'}
          style={{ position: 'absolute', top: 6, left: 6, backgroundColor: '#1F2A44E6', borderRadius: 999, paddingHorizontal: 11, paddingVertical: 6 }}
        >
          <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 12 }}>🔍 {ko ? '크게 보기' : 'Zoom'}</Text>
        </Pressable>
      </View>
      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={{ flex: 1, backgroundColor: '#1F2A44' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingTop: 14, paddingBottom: 10 }}>
            <Pressable testID="bus-zoom-close" onPress={() => setOpen(false)} style={{ padding: 6 }} accessibilityRole="button" accessibilityLabel={ko ? '닫기' : 'Close'}>
              <Text style={{ color: '#FFF', fontSize: 22, fontWeight: '900' }}>✕</Text>
            </Pressable>
            <Text style={{ flex: 1, color: '#FFF', fontWeight: '900', fontSize: 15 }} numberOfLines={1}>
              {props.title}
            </Text>
            {(
              [
                ['−', () => setZoom((z) => Math.max(1, +(z - 0.5).toFixed(1))), 'bus-zoom-out'],
                ['+', () => setZoom((z) => Math.min(3, +(z + 0.5).toFixed(1))), 'bus-zoom-in'],
              ] as const
            ).map(([label, fn, id]) => (
              <Pressable key={id} testID={id} onPress={fn} style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: '#FFFFFF22', alignItems: 'center', justifyContent: 'center' }} accessibilityRole="button">
                <Text style={{ color: '#FFF', fontSize: 22, fontWeight: '900' }}>{label}</Text>
              </Pressable>
            ))}
            <Text style={{ color: '#CBD5E1', fontWeight: '800', width: 48, textAlign: 'right' }}>{Math.round(zoom * 100)}%</Text>
          </View>
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 8 }}>
            <ScrollView horizontal contentContainerStyle={{ paddingRight: 8 }}>
              <BusMap {...props} width={fullW * zoom} />
            </ScrollView>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
