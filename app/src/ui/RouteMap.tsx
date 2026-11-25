import { useMemo, useState } from 'react';
import { Linking, Modal, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import Svg, { Circle, G, Path, Rect, Text as SvgText } from 'react-native-svg';
import { tr, type Course } from '@kotoventure/shared';
import { Text } from './Text';
import { C, R, shadow } from './theme';

/** colours for the days of a trip (cycled) */
const DAY_COLORS = ['#D9484F', '#2D6CDF', '#2F855A', '#B7791F', '#6B46C1'];

type Stop = { n: number; day: number; label: string; ko: string; kind: 'start' | 'food' | 'stay' | 'health' | 'end' | 'spot'; optional: boolean };

const KIND_ICON: Record<Stop['kind'], string> = { start: '✈', food: '🍜', stay: '🛏', health: '💊', end: '🏁', spot: '' };

function kindOf(bg: string, idx: number, last: number, title: string): Stop['kind'] {
  if (idx === 0) return 'start';
  if (idx === last) return 'end';
  if (bg === 'restaurant' || bg === 'jejufood') return 'food';
  if (bg === 'pharmacy' || bg === 'hospital') return 'health';
  if (/^Night\b/.test(title)) return 'stay';
  return 'spot';
}

const cut = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

/** Serpentine layout: rows of `cols` stops, alternating direction, so the route reads like a trail map. */
function layout(count: number, cols: number, cellW: number, cellH: number, padX: number, padY: number) {
  return Array.from({ length: count }, (_, i) => {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const c = row % 2 === 0 ? col : cols - 1 - col;
    return { x: padX + c * cellW + cellW / 2, y: padY + row * cellH + cellH / 2 - 8 };
  });
}

function trailPath(pts: { x: number; y: number }[]) {
  if (!pts.length) return '';
  let d = `M${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    if (a.y === b.y) d += ` L${b.x} ${b.y}`;
    else {
      // turn at the end of a row with a rounded bend
      const out = a.x > 200 ? 40 : -40;
      d += ` C${a.x + out} ${a.y} ${b.x + out} ${b.y} ${b.x} ${b.y}`;
    }
  }
  return d;
}

/** Simple trail-style route map of a course (schematic, not to scale). */
function MapSvg({ stops, width, big }: { stops: Stop[]; width: number; big?: boolean }) {
  const cols = 3;
  const W = 400;
  const cellW = (W - 20) / cols;
  const cellH = big ? 84 : 76;
  const rows = Math.ceil(stops.length / cols);
  const H = rows * cellH + 20;
  const pts = layout(stops.length, cols, cellW, cellH, 10, 10);
  const days = Array.from(new Set(stops.map((s) => s.day)));
  return (
    <Svg width={width} height={(width * H) / W} viewBox={`0 0 ${W} ${H}`}>
      <Rect x="0" y="0" width={W} height={H} rx="12" fill="#F6EEDF" />
      {/* soft terrain blobs so it reads as a map */}
      <Path d={`M0 ${H * 0.3} C80 ${H * 0.18} 140 ${H * 0.45} 230 ${H * 0.32} C300 ${H * 0.22} 350 ${H * 0.4} 400 ${H * 0.3} L400 ${H * 0.5} C320 ${H * 0.6} 260 ${H * 0.42} 180 ${H * 0.55} C100 ${H * 0.68} 50 ${H * 0.5} 0 ${H * 0.58}Z`} fill="#E3EBD9" />
      <Path d={`M0 ${H * 0.85} C90 ${H * 0.75} 170 ${H * 0.95} 260 ${H * 0.82} C320 ${H * 0.74} 360 ${H * 0.86} 400 ${H * 0.8} L400 ${H} L0 ${H}Z`} fill="#DCE8EC" />
      {/* trail, one colour per day */}
      {days.map((d, di) => {
        const idx = stops.map((s, i) => (s.day === d ? i : -1)).filter((i) => i >= 0);
        const from = Math.max(0, idx[0] - 1);
        const seg = pts.slice(from, idx[idx.length - 1] + 1);
        return <Path key={d} d={trailPath(seg)} stroke={DAY_COLORS[di % DAY_COLORS.length]} strokeWidth={big ? 4 : 3.5} strokeDasharray={di % 2 ? '8 5' : undefined} fill="none" strokeLinecap="round" opacity={0.85} />;
      })}
      {stops.map((s, i) => {
        const p = pts[i];
        const col = DAY_COLORS[days.indexOf(s.day) % DAY_COLORS.length];
        const icon = KIND_ICON[s.kind];
        return (
          <G key={i}>
            <Circle cx={p.x} cy={p.y} r={big ? 13 : 12} fill={s.optional ? '#FFF' : col} stroke={col} strokeWidth="2.5" />
            <SvgText x={p.x} y={p.y + 4.5} fontSize={big ? 12 : 11} fontWeight="900" fill={s.optional ? col : '#FFF'} textAnchor="middle">
              {String(s.n)}
            </SvgText>
            <SvgText x={p.x} y={p.y + (big ? 30 : 28)} fontSize={big ? 11 : 10.5} fontWeight="700" fill="#33302B" textAnchor="middle">
              {(icon ? icon + ' ' : '') + cut(s.label, big ? 14 : 11)}
            </SvgText>
          </G>
        );
      })}
    </Svg>
  );
}

function useStops(course: Course, lang: string): Stop[] {
  return useMemo(() => {
    const last = course.scenes.length - 1;
    return course.scenes.map((s, i) => ({
      n: i + 1,
      day: s.day,
      label: tr(s.location, lang) || tr(s.title, lang),
      ko: (s.location?.ko || s.title.ko || '').replace(/^[^\p{L}\p{N}]+/u, '').trim(),
      kind: kindOf(String(s.bg), i, last, s.title.en ?? ''),
      optional: !!s.requires?.length,
    }));
  }, [course, lang]);
}

function Legend({ course, lang }: { course: Course; lang: string }) {
  const days = Array.from(new Set(course.scenes.map((s) => s.day)));
  const ko = lang === 'ko';
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 6 }}>
      {days.map((d, di) => (
        <View key={d} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <View style={{ width: 14, height: 4, borderRadius: 2, backgroundColor: DAY_COLORS[di % DAY_COLORS.length] }} />
          <Text style={{ fontSize: 11, fontWeight: '800', color: C.inkSoft }}>{ko ? `${d}일차` : `Day ${d}`}</Text>
        </View>
      ))}
      <Text style={{ fontSize: 11, color: C.inkSoft }}>{ko ? '○ 일정에 넣으면' : '○ if you plan it'}</Text>
    </View>
  );
}

/** generic stops ("hotel", "nearby pharmacy") have no single place to search */
const GENERIC = /^(호텔|게스트하우스|모텔|펜션|리조트|찜질방|한옥스테이|템플스테이|근처 약국|근처|숙소)$/;
const searchable = (s: Stop) => !!s.ko && !GENERIC.test(s.ko.trim());

/** Open the place in Naver Map or KakaoMap (app if installed, otherwise the web map). */
function openMap(which: 'naver' | 'kakao', place: string) {
  const q = encodeURIComponent(place);
  const url = which === 'naver' ? `https://map.naver.com/p/search/${q}` : `https://map.kakao.com/link/search/${q}`;
  Linking.openURL(url).catch(() => {});
}

/** Route map card: tap to open a full-screen, zoomable view. */
export function RouteMap({ course, lang }: { course: Course; lang: string }) {
  const { width, height } = useWindowDimensions();
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const stops = useStops(course, lang);
  const ko = lang === 'ko';
  const cardW = Math.min(width - 64, 560);
  const fullW = Math.min(width, 900) - 16;
  return (
    <View style={{ marginTop: 10 }}>
      <Pressable testID="route-map" onPress={() => { setZoom(1); setOpen(true); }} accessibilityRole="button" accessibilityLabel={ko ? '지도 크게 보기' : 'Open the map'}>
        <MapSvg stops={stops} width={cardW} />
        <View style={{ position: 'absolute', right: 8, top: 8, backgroundColor: '#FFFFFFE6', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }}>
          <Text style={{ fontSize: 11, fontWeight: '900', color: C.ink }}>🔍 {ko ? '크게 보기' : 'Enlarge'}</Text>
        </View>
      </Pressable>
      <Legend course={course} lang={lang} />
      <Text style={{ fontSize: 10, color: C.inkSoft, marginTop: 2 }}>{ko ? '* 간단한 경로도예요 (실제 거리·방향과 다를 수 있어요). 크게 보기에서 장소별 N·K 지도로 길찾기를 열 수 있어요.' : '* Simplified route map – not to scale. Open it to find each place in Naver Map or KakaoMap.'}</Text>

      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={{ flex: 1, backgroundColor: C.paper }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8, backgroundColor: C.navy }}>
            <Pressable testID="map-close" onPress={() => setOpen(false)} style={{ padding: 6 }} accessibilityRole="button" accessibilityLabel={ko ? '닫기' : 'Close'}>
              <Text style={{ color: '#FFF', fontSize: 18, fontWeight: '900' }}>✕</Text>
            </Pressable>
            <Text style={{ flex: 1, color: '#FFF', fontWeight: '900' }} numberOfLines={1}>
              🗺️ {tr(course.title, lang)}
            </Text>
            {[
              ['−', () => setZoom((z) => Math.max(1, +(z - 0.5).toFixed(1))), 'map-zoom-out'],
              ['+', () => setZoom((z) => Math.min(3, +(z + 0.5).toFixed(1))), 'map-zoom-in'],
            ].map(([label, fn, id]) => (
              <Pressable key={id as string} testID={id as string} onPress={fn as () => void} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFFFFF22', alignItems: 'center', justifyContent: 'center' }} accessibilityRole="button">
                <Text style={{ color: '#FFF', fontSize: 20, fontWeight: '900' }}>{label as string}</Text>
              </Pressable>
            ))}
            <Text style={{ color: '#CBD5E1', fontWeight: '800', width: 52, textAlign: 'right' }}>{Math.round(zoom * 100)}%</Text>
          </View>
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 8 }} maximumZoomScale={3} minimumZoomScale={1}>
            <ScrollView horizontal contentContainerStyle={{ paddingRight: 8 }}>
              <View style={{ borderRadius: R.m, overflow: 'hidden', ...shadow }}>
                <MapSvg stops={stops} width={fullW * zoom} big />
              </View>
            </ScrollView>
            <View style={{ paddingHorizontal: 8 }}>
              <Legend course={course} lang={lang} />
            </View>
            <View style={{ padding: 8, gap: 4, marginTop: 6, minHeight: height * 0.2 }}>
              {stops.map((s) => (
                <View key={s.n} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 3, borderBottomWidth: 1, borderBottomColor: C.line }}>
                  <Text style={{ flex: 1, fontSize: 13, color: C.ink }}>
                    <Text style={{ fontWeight: '900' }}>{s.n}.</Text> {KIND_ICON[s.kind] ? KIND_ICON[s.kind] + ' ' : ''}
                    {s.label}
                    {s.optional ? <Text style={{ color: C.orange, fontSize: 11 }}> · {ko ? '일정에 넣으면' : 'if you plan it'}</Text> : null}
                  </Text>
                  {searchable(s) && (
                    <>
                      <Pressable testID={`map-naver-${s.n}`} onPress={() => openMap('naver', s.ko)} accessibilityRole="link" accessibilityLabel={`Naver Map: ${s.ko}`} style={{ backgroundColor: '#03C75A', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 4 }}>
                        <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 11 }}>N {ko ? '지도' : 'Map'}</Text>
                      </Pressable>
                      <Pressable testID={`map-kakao-${s.n}`} onPress={() => openMap('kakao', s.ko)} accessibilityRole="link" accessibilityLabel={`KakaoMap: ${s.ko}`} style={{ backgroundColor: '#FEE500', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 4 }}>
                        <Text style={{ color: '#3A1D1D', fontWeight: '900', fontSize: 11 }}>K {ko ? '지도' : 'Map'}</Text>
                      </Pressable>
                    </>
                  )}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
