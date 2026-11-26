import { useState, type ReactNode } from 'react';
import { Modal, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import Svg, { Circle, G, Path, Rect, Text as T } from 'react-native-svg';
import { SUBWAY_LINES, SUBWAY_STATIONS, stationOf, type SubwayNet } from '@kotoventure/shared';
import { Text } from '../ui/Text';
import { smooth } from './KtxMap';

/**
 * City subway maps for the transfer puzzle, drawn on real geography: Seoul (Han River, Cheonggyecheon,
 * Namsan, palaces), Busan (coastline, Yeongdo, Gwangan Bridge, beaches) and Incheon (coast, Wolmido,
 * Songdo, Incheon Bridge). Stations sit at their real positions.
 */
export const SUB_W = 300;
type LL = [number, number];
type Blob = [lng: number, lat: number, rx: number, ry: number, name?: string];
interface Geo {
  box: [lng0: number, lng1: number, lat0: number, lat1: number];
  /** land outline (the rest is sea); none = all land */
  land?: LL[];
  islands?: Blob[];
  rivers: { pts: LL[]; w: number }[];
  parks: Blob[];
  beaches?: LL[][];
  bridges?: { pts: LL[]; ko?: string }[];
  marks?: { at: LL; icon: string; ko: string }[];
  font: number;
  /** magnify a busy centre (fisheye): centre, radius in map units, strength */
  lens?: { c: LL; r: number; d: number };
}

const GEO: Record<SubwayNet, Geo> = {
  seoul: {
    box: [126.905, 127.07, 37.514, 37.598],
    rivers: [
      { w: 16, pts: [[126.9, 37.552], [126.915, 37.542], [126.93, 37.536], [126.945, 37.531], [126.96, 37.524], [126.975, 37.518], [126.99, 37.516], [127.005, 37.518], [127.02, 37.523], [127.035, 37.528], [127.05, 37.533], [127.06, 37.535], [127.075, 37.532]] },
      { w: 2.2, pts: [[126.978, 37.5694], [126.99, 37.5692], [127.002, 37.5696], [127.012, 37.5706], [127.025, 37.5706], [127.037, 37.5685], [127.048, 37.5655], [127.056, 37.558]] },
      { w: 3, pts: [[127.07, 37.592], [127.066, 37.57], [127.058, 37.552], [127.052, 37.538]] },
    ],
    parks: [
      [126.9885, 37.5515, 0.0105, 0.0055], [126.968, 37.595, 0.022, 0.007, '북악산'], [126.959, 37.581, 0.006, 0.008, '인왕산'],
      [126.977, 37.5796, 0.0042, 0.0036], [126.9925, 37.5815, 0.0055, 0.0035, '창덕궁'], [127.0075, 37.5808, 0.0028, 0.0028],
      [127.0418, 37.5444, 0.006, 0.0033, '서울숲'], [126.98, 37.528, 0.008, 0.0045, '용산공원'], [126.962, 37.5445, 0.003, 0.002],
    ],
    marks: [{ at: [126.9882, 37.5512], icon: '🗼', ko: 'N서울타워' }],
    font: 6,
    lens: { c: [126.995, 37.5665], r: 100, d: 2.2 },
  },
  busan: {
    box: [129.015, 129.185, 35.085, 35.195],
    land: [
      [129.01, 35.2], [129.01, 35.088], [129.022, 35.092], [129.03, 35.0935], [129.036, 35.0945], [129.04, 35.098], [129.043, 35.104], [129.047, 35.11], [129.052, 35.116],
      [129.058, 35.121], [129.064, 35.126], [129.07, 35.123], [129.076, 35.117], [129.084, 35.112], [129.093, 35.108], [129.102, 35.103], [129.112, 35.099], [129.122, 35.098],
      [129.126, 35.106], [129.122, 35.118], [129.116, 35.13], [129.114, 35.142], [129.117, 35.152], [129.122, 35.158], [129.128, 35.161], [129.134, 35.158], [129.14, 35.154],
      [129.147, 35.152], [129.153, 35.153], [129.16, 35.157], [129.168, 35.159], [129.176, 35.158], [129.19, 35.157], [129.19, 35.2],
    ],
    islands: [[129.068, 35.077, 0.024, 0.016, '영도'], [129.128, 35.095, 0.002, 0.0018]],
    rivers: [
      { w: 5, pts: [[129.105, 35.2], [129.11, 35.186], [129.118, 35.175], [129.125, 35.168], [129.131, 35.161]] },
      { w: 2, pts: [[129.06, 35.172], [129.062, 35.155], [129.064, 35.14], [129.066, 35.128]] },
    ],
    parks: [
      [129.087, 35.155, 0.012, 0.0085, '황령산'], [129.0555, 35.168, 0.0045, 0.003, '시민공원'], [129.0325, 35.1007, 0.0025, 0.0017],
      [129.176, 35.186, 0.01, 0.008, '장산'], [129.022, 35.122, 0.008, 0.012, '구덕산'], [129.12, 35.111, 0.005, 0.005, '이기대'],
    ],
    beaches: [[[129.114, 35.146], [129.116, 35.152], [129.121, 35.157]], [[129.155, 35.1565], [129.161, 35.1585], [129.168, 35.1595]]],
    bridges: [{ pts: [[129.117, 35.128], [129.128, 35.139], [129.14, 35.15]], ko: '광안대교' }],
    marks: [{ at: [129.0325, 35.1007], icon: '🗼', ko: '' }],
    font: 5.8,
  },
  incheon: {
    box: [126.565, 126.795, 37.37, 37.585],
    land: [
      [126.8, 37.59], [126.6, 37.59], [126.6, 37.575], [126.605, 37.555], [126.615, 37.535], [126.63, 37.52], [126.637, 37.505], [126.628, 37.49], [126.615, 37.482],
      [126.607, 37.476], [126.61, 37.468], [126.62, 37.458], [126.628, 37.447], [126.638, 37.437], [126.632, 37.425], [126.615, 37.41], [126.605, 37.395], [126.61, 37.38],
      [126.625, 37.37], [126.65, 37.365], [126.675, 37.37], [126.7, 37.378], [126.725, 37.383], [126.75, 37.388], [126.775, 37.39], [126.8, 37.392],
    ],
    islands: [[126.598, 37.4755, 0.008, 0.0055, '월미도'], [126.53, 37.48, 0.05, 0.035, '영종도']],
    rivers: [
      { w: 2.6, pts: [[126.735, 37.47], [126.73, 37.51], [126.718, 37.55], [126.705, 37.588]] },
      { w: 2.4, pts: [[126.63, 37.399], [126.637, 37.393], [126.645, 37.389]] },
    ],
    parks: [
      [126.712, 37.552, 0.01, 0.008, '계양산'], [126.757, 37.455, 0.012, 0.008, '인천대공원'], [126.688, 37.428, 0.006, 0.005, '문학산'],
      [126.638, 37.392, 0.006, 0.0028], [126.6215, 37.4745, 0.0025, 0.0018], [126.745, 37.405, 0.01, 0.006, '소래습지'],
    ],
    bridges: [{ pts: [[126.612, 37.392], [126.585, 37.415], [126.56, 37.44]], ko: '인천대교' }],
    marks: [{ at: [126.578, 37.458], icon: '✈', ko: '인천공항' }],
    font: 5.8,
  },
};

function projector(net: SubwayNet) {
  const [lng0, lng1, lat0, lat1] = GEO[net].box;
  const cos = Math.cos((((lat0 + lat1) / 2) * Math.PI) / 180);
  const k = SUB_W / ((lng1 - lng0) * cos);
  const raw = (lng: number, lat: number) => ({ x: (lng - lng0) * cos * k, y: (lat1 - lat) * k });
  const lens = GEO[net].lens;
  const c = lens ? raw(lens.c[0], lens.c[1]) : { x: 0, y: 0 };
  const p = (lng: number, lat: number) => {
    const q = raw(lng, lat);
    if (!lens) return q;
    const dx = q.x - c.x;
    const dy = q.y - c.y;
    const r = Math.hypot(dx, dy);
    if (r === 0 || r >= lens.r) return q;
    const u = r / lens.r;
    const f = (((lens.d + 1) * u) / (lens.d * u + 1)) * (lens.r / r);
    return { x: c.x + dx * f, y: c.y + dy * f };
  };
  return { h: (lat1 - lat0) * k, p, k, cos };
}
const blobPath = (pr: ReturnType<typeof projector>, [lng, lat, rx, ry]: Blob) => {
  const pts = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    return pr.p(lng + Math.cos(a) * rx, lat + Math.sin(a) * ry);
  });
  return smooth(pts, true);
};

/** two-pass label: halo, then ink */
function Label({ x, y, text, size, color = '#1B2140', anchor, weight = '900' }: { x: number; y: number; text: string; size: number; color?: string; anchor: 'start' | 'middle' | 'end'; weight?: '700' | '800' | '900' }) {
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

export interface SubwayMapState {
  path: string[];
  cur: string;
  goal: string;
  /** stations you can tap next */
  near: Set<string>;
}

export function SubwayMap({ net, width, state, onTap }: { net: SubwayNet; width: number; state: SubwayMapState; onTap?: (id: string) => void }) {
  const g = GEO[net];
  const pr = projector(net);
  const H = pr.h;
  const sc = width / SUB_W;
  const P = (id: string) => {
    const s = stationOf(id)!;
    return pr.p(s.lng, s.lat);
  };
  const lines = SUBWAY_LINES.filter((l) => (l.net ?? 'seoul') === net);
  const stations = SUBWAY_STATIONS.filter((s) => (s.net ?? 'seoul') === net);
  const water = '#BFDDE6';
  const land = '#F3EDE0';
  return (
    <View style={{ width, height: H * sc }}>
      <Svg width={width} height={H * sc} viewBox={`0 0 ${SUB_W} ${H}`}>
        {/* ground: sea + land, or all land */}
        <Rect x="0" y="0" width={SUB_W} height={H} rx="8" fill={g.land ? water : land} />
        {g.land && <Path d={smooth(g.land.map(([a, b]) => pr.p(a, b)), true)} fill={land} stroke="#D8CDB4" strokeWidth="1" />}
        {g.islands?.map((b, i) => <Path key={i} d={blobPath(pr, b)} fill={land} stroke="#D8CDB4" strokeWidth="0.8" />)}
        {/* city blocks texture */}
        {Array.from({ length: 22 }).map((_, i) => (
          <Rect key={i} x={(i * 47) % SUB_W} y={(i * 83) % H} width="14" height="9" rx="1.5" fill="#E9E1CF" opacity={g.land ? 0 : 0.6} />
        ))}
        {/* parks, mountains, palaces */}
        {g.parks.map((b, i) => {
          const c = pr.p(b[0], b[1]);
          return (
            <G key={i}>
              <Path d={blobPath(pr, b)} fill="#CFE3BE" />
              {b[4] && <Label x={c.x} y={c.y + 2} text={b[4]} size={5} color="#5E7D4E" anchor="middle" weight="800" />}
            </G>
          );
        })}
        {/* rivers and streams */}
        {g.rivers.map((r, i) => (
          <G key={i}>
            {r.w > 6 && <Path d={smooth(r.pts.map(([a, b]) => pr.p(a, b)), false)} stroke="#D7EBF0" strokeWidth={r.w + 4} fill="none" strokeLinecap="round" />}
            <Path d={smooth(r.pts.map(([a, b]) => pr.p(a, b)), false)} stroke={water} strokeWidth={r.w} fill="none" strokeLinecap="round" />
          </G>
        ))}
        {net === 'seoul' && <Label x={pr.p(126.952, 37.5245).x} y={pr.p(126.952, 37.5245).y + 2} text="한강 Han River" size={6} color="#4F8FA3" anchor="middle" weight="800" />}
        {g.beaches?.map((b, i) => <Path key={i} d={smooth(b.map(([x, y]) => pr.p(x, y)), false)} stroke="#F1D78A" strokeWidth="3" fill="none" strokeLinecap="round" />)}
        {g.bridges?.map((b, i) => {
          const pts = b.pts.map(([x, y]) => pr.p(x, y));
          const m = pts[Math.floor(pts.length / 2)];
          return (
            <G key={i}>
              <Path d={smooth(pts, false)} stroke="#8C96A8" strokeWidth="2" fill="none" />
              {b.ko && <Label x={m.x + 4} y={m.y + 8} text={b.ko} size={5} color="#5B6475" anchor="start" weight="800" />}
            </G>
          );
        })}
        {g.marks?.map((m) => {
          const q = pr.p(m.at[0], m.at[1]);
          return (
            <G key={m.ko}>
              <T x={q.x} y={q.y + 3} fontSize="8" textAnchor="middle">
                {m.icon}
              </T>
              {m.ko ? <Label x={q.x + 5} y={q.y + 2} text={m.ko} size={4.8} color="#5B6475" anchor="start" weight="800" /> : null}
            </G>
          );
        })}
        {/* lines */}
        {lines.map((l) => (
          <Path key={l.id + 'c'} d={smooth(l.stations.map(P), false)} stroke="#FFFFFF" strokeWidth="6.5" fill="none" strokeLinejoin="round" strokeLinecap="round" />
        ))}
        {lines.map((l) => (
          <Path key={l.id} d={smooth(l.stations.map(P), false)} stroke={l.color} strokeWidth="4" fill="none" strokeLinejoin="round" strokeLinecap="round" />
        ))}
        {/* the route you built */}
        {state.path.length > 1 && <Path d={state.path.map((id, i) => `${i ? 'L' : 'M'}${P(id).x} ${P(id).y}`).join(' ')} stroke="#E5383B" strokeWidth="2.4" strokeDasharray="4 2.5" fill="none" />}
        {/* stations */}
        {stations.map((s) => {
          const q = P(s.id);
          const inter = lines.filter((l) => l.stations.includes(s.id)).length > 1;
          const isCur = s.id === state.cur;
          const isGoal = s.id === state.goal;
          const near = state.near.has(s.id);
          const side = s.lp ?? 't';
          const gap = inter ? 6 : 5;
          const lx = side === 'r' ? q.x + gap : side === 'l' ? q.x - gap : q.x;
          const ly = side === 't' ? q.y - gap - 1 : side === 'b' ? q.y + gap + g.font : q.y + 2;
          const anchor = side === 'r' ? 'start' : side === 'l' ? 'end' : 'middle';
          return (
            <G key={s.id}>
              {near && <Circle cx={q.x} cy={q.y} r="7" fill="#FDE68A" opacity={0.85} />}
              {isGoal && <Circle cx={q.x} cy={q.y} r="8" fill="#FACC15" opacity={0.45} />}
              <Circle cx={q.x} cy={q.y} r={inter ? 4.2 : 3} fill={isCur ? '#E5383B' : isGoal ? '#FACC15' : '#FFFFFF'} stroke="#1B2140" strokeWidth={inter ? 1.6 : 1.1} />
              {(s.ko.length > 6 ? [s.ko.slice(0, Math.ceil(s.ko.length / 2)), s.ko.slice(Math.ceil(s.ko.length / 2))] : [s.ko]).map((part, n, all) => (
                <Label key={n} x={lx} y={ly + (n - (side === 't' ? all.length - 1 : 0)) * (g.font + 1)} text={part} size={isCur || isGoal ? g.font + 1 : g.font} color={isCur ? '#C81E1E' : '#1B2140'} anchor={anchor} />
              ))}
            </G>
          );
        })}
        {/* compass */}
        <G transform={`translate(${SUB_W - 12},12)`}>
          <Circle r="8" fill="#FFFDF7" stroke="#C8B48C" strokeWidth="0.8" />
          <Path d="M0 -6 L2.2 0 L0 6 L-2.2 0Z" fill="#E9772F" />
          <T x="0" y="-9.5" fontSize="5" fontWeight="900" fill="#7A6A50" textAnchor="middle">
            N
          </T>
        </G>
      </Svg>
      {onTap &&
        stations.map((s) => {
          const q = P(s.id);
          const t = net === 'seoul' ? 12 : 14;
          return (
            <Pressable
              key={s.id}
              testID={`stn-${s.id}`}
              accessibilityLabel={s.en}
              onPress={() => onTap(s.id)}
              style={{ position: 'absolute', left: (q.x - t / 2) * sc, top: (q.y - t / 2) * sc, width: t * sc, height: t * sc, borderRadius: (t / 2) * sc }}
            />
          );
        })}
    </View>
  );
}

export function SubwayLegend({ net }: { net: SubwayNet }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
      {SUBWAY_LINES.filter((l) => (l.net ?? 'seoul') === net).map((l) => (
        <View key={l.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <View style={{ width: 14, height: 5, borderRadius: 2, backgroundColor: l.color }} />
          <Text style={{ fontSize: 11, fontWeight: '800', color: '#1B2140' }}>{l.name}</Text>
        </View>
      ))}
    </View>
  );
}

/**
 * The map with a zoom button: a full-screen view (zoom 1×–3×, drag to move) where the route can be
 * built just like on the small map. `status` shows the timer and the route so far.
 */
export function SubwayMapCard({ net, width, state, onTap, lang, status, closeWhen }: { net: SubwayNet; width: number; state: SubwayMapState; onTap?: (id: string) => void; lang: string; status?: ReactNode; closeWhen?: boolean }) {
  const ko = lang === 'ko';
  const { width: sw } = useWindowDimensions();
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(2);
  const fullW = Math.min(sw, 700) - 16;
  const visible = open && !closeWhen;
  return (
    <View>
      <SubwayMap net={net} width={width} state={state} onTap={onTap} />
      <Pressable
        testID="subway-zoom"
        onPress={() => {
          setZoom(2);
          setOpen(true);
        }}
        accessibilityRole="button"
        accessibilityLabel={ko ? '노선도 크게 보기' : 'Zoom the map'}
        style={{ position: 'absolute', top: 6, left: 6, backgroundColor: '#1F2A44E6', borderRadius: 999, paddingHorizontal: 11, paddingVertical: 6 }}
      >
        <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 12 }}>🔍 {ko ? '크게 보기' : 'Zoom'}</Text>
      </Pressable>
      <SubwayLegend net={net} />
      <Modal visible={visible} animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={{ flex: 1, backgroundColor: '#1F2A44' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingTop: 14, paddingBottom: 8 }}>
            <Pressable testID="subway-zoom-close" onPress={() => setOpen(false)} style={{ padding: 6 }} accessibilityRole="button" accessibilityLabel={ko ? '닫기' : 'Close'}>
              <Text style={{ color: '#FFF', fontSize: 22, fontWeight: '900' }}>✕</Text>
            </Pressable>
            <Text style={{ flex: 1, color: '#FFF', fontWeight: '900', fontSize: 15 }} numberOfLines={1}>
              🚇 {ko ? '지하철 노선도' : 'Subway map'}
            </Text>
            {(
              [
                ['−', () => setZoom((z) => Math.max(1, +(z - 0.5).toFixed(1))), 'subway-zoom-out'],
                ['+', () => setZoom((z) => Math.min(3, +(z + 0.5).toFixed(1))), 'subway-zoom-in'],
              ] as const
            ).map(([label, fn, id]) => (
              <Pressable key={id} testID={id} onPress={fn} style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: '#FFFFFF22', alignItems: 'center', justifyContent: 'center' }} accessibilityRole="button">
                <Text style={{ color: '#FFF', fontSize: 22, fontWeight: '900' }}>{label}</Text>
              </Pressable>
            ))}
            <Text style={{ color: '#CBD5E1', fontWeight: '800', width: 48, textAlign: 'right' }}>{Math.round(zoom * 100)}%</Text>
          </View>
          {status && <View style={{ paddingHorizontal: 14, paddingBottom: 8 }}>{status}</View>}
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 8 }}>
            <ScrollView horizontal contentContainerStyle={{ paddingRight: 8 }}>
              <View style={{ backgroundColor: '#FFF', borderRadius: 10, padding: 4 }}>
                <SubwayMap net={net} width={fullW * zoom} state={state} onTap={onTap} />
              </View>
            </ScrollView>
            <View style={{ paddingHorizontal: 6 }}>
              <View style={{ backgroundColor: '#FFF', borderRadius: 8, padding: 8, marginTop: 8 }}>
                <SubwayLegend net={net} />
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
