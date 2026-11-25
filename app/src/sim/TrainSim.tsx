import { useEffect, useMemo, useState } from 'react';
import { Pressable, View, useWindowDimensions } from 'react-native';
import { Text } from '../ui/Text';
import Svg, { Circle, G, Line, Path, Polyline, Rect, Text as T } from 'react-native-svg';
import { LINES, STATIONS, stationById, timetable, toMin, tr, type TrainRun } from '@kotoventure/shared';
import { Btn, H, P, won } from '../ui/kit';
import { C } from '../ui/theme';
import { Box, DoneCard, Glass, Metal, OptBtn, SimShell, Slot, WalletBar, useScore, type SimProps } from './kit';

type S = 'map' | 'line' | 'home' | 'dest' | 'pax' | 'trains' | 'seat' | 'pay' | 'card' | 'print' | 'ticket' | 'board' | 'done';

const MAP_W = 300;
const MAP_H = 420;

/** soft landmass of South Korea, drawn to fit the station positions (map units 300×420) */
const LAND =
  'M18 0 L300 0 L300 70 C296 96 290 120 288 150 C284 190 280 220 279 250 C278 282 276 300 268 318 C262 334 250 344 236 350 C220 356 204 360 188 364 C172 368 160 372 146 370 C132 368 120 362 106 364 C90 366 74 360 60 352 C46 344 34 336 30 322 C28 306 40 296 46 284 C52 272 50 260 60 248 C70 236 66 222 72 210 C78 196 88 186 86 172 C84 158 92 146 100 132 C108 118 98 104 104 92 C110 80 120 72 112 62 C104 52 94 50 84 44 C70 36 60 26 46 18 C36 12 26 6 18 0 Z';
const MOUNTAINS: [number, number, number][] = [
  [238, 104, 1.1], [258, 132, 1.3], [246, 168, 1.0], [262, 196, 1.15], [226, 140, 0.85], [200, 112, 0.8],
  [128, 292, 1.2], [112, 274, 0.85], [176, 250, 0.9], [196, 286, 0.8], [106, 150, 0.7],
];
const FOREST: [number, number][] = [[214, 96], [272, 160], [230, 212], [168, 120], [120, 260], [90, 210], [190, 318], [218, 300], [70, 290]];
const ISLANDS: [number, number, number][] = [[22, 334, 5], [34, 352, 3.5], [70, 372, 4], [120, 380, 3], [176, 380, 4], [212, 372, 3]];

function Peak({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <G transform={`translate(${x},${y}) scale(${s})`}>
      <Path d="M-14 6 L0 -12 L14 6 Z" fill="#B9A98A" />
      <Path d="M0 -12 L14 6 L4 6 Z" fill="#A39376" />
      <Path d="M-4.5 -6 L0 -12 L4.5 -6 L2 -4.5 L0 -6.5 L-2 -4.5 Z" fill="#F7F1E3" />
    </G>
  );
}
function Tree({ x, y }: { x: number; y: number }) {
  return (
    <G transform={`translate(${x},${y})`}>
      <Path d="M0 -9 C4 -5 4 -1 0 2 C-4 -1 -4 -5 0 -9Z" fill="#5E8B6B" />
      <Path d="M5 -6 C8 -3 8 0 5 2 C2 0 2 -3 5 -6Z" fill="#46705A" />
      <Line x1="0" y1="2" x2="0" y2="5" stroke="#6B5640" strokeWidth="1" />
    </G>
  );
}
/** two-pass label: cream halo, then ink */
function Label({ x, y, text, size, weight, color, anchor }: { x: number; y: number; text: string; size: number; weight: string; color: string; anchor: 'start' | 'middle' | 'end' }) {
  return (
    <G>
      <T x={x} y={y} fontSize={size} fontWeight={weight} fill="#FBF6EA" stroke="#FBF6EA" strokeWidth={2.6} strokeLinejoin="round" textAnchor={anchor}>
        {text}
      </T>
      <T x={x} y={y} fontSize={size} fontWeight={weight} fill={color} textAnchor={anchor}>
        {text}
      </T>
    </G>
  );
}

/** Illustrated KTX map (flat warm style, like the scene backgrounds) with tappable stations. */
function RouteMap({ width, onTap, highlight }: { width: number; onTap?: (id: string) => void; highlight?: string }) {
  const k = width / MAP_W;
  return (
    <View style={{ width, height: MAP_H * k }}>
      <Svg width={width} height={MAP_H * k} viewBox={`0 0 ${MAP_W} ${MAP_H}`}>
        {/* sea with soft wave strokes */}
        <Rect x="0" y="0" width={MAP_W} height={MAP_H} rx="12" fill="#CFE3DF" />
        {Array.from({ length: 16 }).map((_, i) => (
          <Path key={i} d={`M${(i * 53) % 280} ${40 + ((i * 97) % 360)} q6 -3 12 0 t12 0`} stroke="#AFCFCA" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        ))}
        {/* land, coast line and a lighter inner band */}
        <Path d={LAND} fill="#F1E6CD" stroke="#D9C7A2" strokeWidth="2" />
        <Path d={LAND} fill="none" stroke="#FBF4E2" strokeWidth="1" transform="translate(150 190) scale(0.97) translate(-150 -190)" />
        {/* green lowlands */}
        <Path d="M92 150 C110 140 130 150 128 176 C126 200 104 214 86 204 C72 196 76 162 92 150Z" fill="#DDE6C4" />
        <Path d="M60 260 C80 248 104 262 100 290 C96 316 66 320 54 304 C44 290 46 270 60 260Z" fill="#DDE6C4" />
        <Path d="M150 214 C176 206 204 222 198 246 C192 268 160 270 148 252 C140 238 140 220 150 214Z" fill="#E4E9C9" />
        {/* rivers: Han and Nakdong */}
        <Path d="M214 70 C196 62 182 56 166 54 C150 52 136 50 118 52" stroke="#9CC6C8" strokeWidth="3" fill="none" strokeLinecap="round" />
        <Path d="M206 150 C214 180 206 210 222 236 C232 254 226 284 234 306 C238 318 236 330 232 344" stroke="#9CC6C8" strokeWidth="2.6" fill="none" strokeLinecap="round" />
        <Path d="M150 160 C140 176 128 190 118 214 C110 232 96 244 84 262" stroke="#9CC6C8" strokeWidth="2" fill="none" strokeLinecap="round" opacity={0.8} />
        {/* mountains (Taebaek ridge, Jirisan…) and forests */}
        {MOUNTAINS.map(([x, y, sc], i) => <Peak key={i} x={x} y={y} s={sc} />)}
        {FOREST.map(([x, y], i) => <Tree key={i} x={x} y={y} />)}
        {/* islands and Jeju */}
        {ISLANDS.map(([x, y, r], i) => <Circle key={i} cx={x} cy={y} r={r} fill="#EADBB9" stroke="#D9C7A2" strokeWidth="1" />)}
        <Path d="M66 402 C80 392 112 390 128 398 C136 404 126 412 106 414 C86 416 60 412 66 402Z" fill="#E6D7B4" stroke="#D2BF97" strokeWidth="1.2" />
        <Peak x={97} y={402} s={0.6} />
        <Label x={142} y={410} text="제주 Jeju" size={7} weight="800" color="#7A6A50" anchor="start" />
        {/* seas */}
        <T x="22" y="150" fontSize="8" fontWeight="800" fill="#7FA6A3" fontStyle="italic">서해</T>
        <T x="22" y="160" fontSize="6" fontWeight="700" fill="#7FA6A3">Yellow Sea</T>
        <T x="292" y="232" fontSize="8" fontWeight="800" fill="#7FA6A3" textAnchor="end">동해</T>
        <T x="292" y="242" fontSize="6" fontWeight="700" fill="#7FA6A3" textAnchor="end">East Sea</T>
        <T x="210" y="390" fontSize="8" fontWeight="800" fill="#7FA6A3">남해</T>
        {/* compass */}
        <G transform="translate(276,370)">
          <Circle r="13" fill="#FBF6EA" stroke="#C8B48C" strokeWidth="1.2" />
          <Path d="M0 -10 L3.5 0 L0 10 L-3.5 0Z" fill="#E9772F" />
          <Path d="M0 0 L3.5 0 L0 10Z" fill="#C8B48C" />
          <T x="0" y="-15" fontSize="7" fontWeight="900" fill="#7A6A50" textAnchor="middle">N</T>
        </G>
        {/* city silhouettes */}
        <G opacity={0.55}>
          {[0, 6, 11, 17, 22].map((dx, i) => <Rect key={i} x={160 + dx} y={22 - (i % 3) * 4} width="4.5" height={10 + (i % 3) * 4} fill="#B8A88A" />)}
          {[0, 5, 10, 16].map((dx, i) => <Rect key={i} x={250 + dx} y={346 - (i % 2) * 4} width="4" height={8 + (i % 2) * 4} fill="#B8A88A" />)}
        </G>
        {/* KTX lines: light casing + colour */}
        {LINES.map((l) => (
          <Polyline key={l.id + 'c'} points={l.path.map((id) => `${stationById(id)!.x},${stationById(id)!.y}`).join(' ')} stroke="#FBF6EA" strokeWidth="8" fill="none" strokeLinejoin="round" strokeLinecap="round" />
        ))}
        {LINES.map((l) => (
          <Polyline key={l.id} points={l.path.map((id) => `${stationById(id)!.x},${stationById(id)!.y}`).join(' ')} stroke={l.color} strokeWidth="4.5" fill="none" strokeLinejoin="round" strokeLinecap="round" />
        ))}
        <Line x1="150" y1="40" x2="122" y2="58" stroke="#8A7E68" strokeWidth="2" strokeDasharray="3 2" />
        {STATIONS.map((s) => (
          <G key={s.id}>
            {s.id === highlight && <Circle cx={s.x} cy={s.y} r="11" fill="#FACC15" opacity={0.45} />}
            <Circle cx={s.x} cy={s.y} r={s.line === 'hub' ? 6 : 4.5} fill={s.id === highlight ? '#FACC15' : '#FFFDF7'} stroke="#2B2620" strokeWidth="1.6" />
            {(() => {
              const lp = s.lp ?? (s.x > 230 ? 'l' : 'r');
              const dx = lp === 'r' ? 7 : lp === 'l' ? -7 : 0;
              const dy = lp === 't' ? -16 : lp === 'b' ? 13 : -3;
              const anchor = lp === 'r' ? 'start' : lp === 'l' ? 'end' : 'middle';
              return (
                <G>
                  <Label x={s.x + dx} y={s.y + dy} text={s.ko} size={8.5} weight="900" color="#2B2620" anchor={anchor} />
                  <Label x={s.x + dx} y={s.y + dy + 8} text={s.en.replace(/ \(.*\)/, '')} size={6} weight="700" color="#6B6250" anchor={anchor} />
                </G>
              );
            })()}
          </G>
        ))}
        {/* legend card */}
        <Rect x="6" y={MAP_H - 36} width="238" height="30" rx="6" fill="#FBF6EA" opacity={0.92} stroke="#D9C7A2" strokeWidth="1" />
        {LINES.map((l, i) => (
          <G key={l.id} transform={`translate(${12 + (i % 2) * 118},${MAP_H - 22 + Math.floor(i / 2) * 12})`}>
            <Rect x="0" y="-6" width="14" height="5" rx="2" fill={l.color} />
            <T x="18" y="-1" fontSize="7.5" fontWeight="800" fill="#2B2620">
              {l.ko} {l.en}
            </T>
          </G>
        ))}
      </Svg>
      {onTap &&
        STATIONS.map((s) => (
          <Pressable
            key={s.id}
            testID={`st-${s.id}`}
            accessibilityLabel={s.en}
            onPress={() => onTap(s.id)}
            style={{ position: 'absolute', left: (s.x - 14) * k, top: (s.y - 12) * k, width: 28 * k, height: 24 * k, borderRadius: 12 * k }}
          />
        ))}
    </View>
  );
}

const seatTaken = (car: number, row: number, col: number) => (car * 7 + row * 3 + col * 5) % 4 === 0;

export function TrainSim({ step, ctx, onDone }: SimProps) {
  const { width } = useWindowDimensions();
  const sc = useScore(9);
  const toId = step.config?.to ?? 'singyeongju';
  const dest = stationById(toId)!;
  const arriveBy = step.config?.arriveBy ?? '13:00';
  const runs = useMemo(() => timetable(toId), [toId]);
  const [s, setS] = useState<S>('map');
  const [lang, setLang] = useState<'ko' | 'en'>('ko');
  const [adults, setAdults] = useState(1);
  const [train, setTrain] = useState<TrainRun | null>(null);
  const [car, setCar] = useState(8);
  const [seats, setSeats] = useState<string[]>([]);
  const [held, setHeld] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const add = (l: string) => setLog((x) => [...x, l]);
  const mapW = Math.min(width - 40, 360);
  const stages = ['Route map', 'Ticket machine', 'Seat & pay', 'Ticket & platform', 'Done'];
  const stage = { map: 0, line: 0, home: 1, dest: 1, pax: 1, trains: 1, seat: 2, pay: 2, card: 2, print: 2, ticket: 3, board: 3, done: 4 }[s];
  const platform = train ? 3 + (parseInt(train.no.replace(/\D/g, ''), 10) % 12) : 0;
  const L = (ko: string, en: string) => (lang === 'ko' ? ko : en);

  useEffect(() => {
    if (s !== 'print') return;
    const t = setTimeout(() => setS('ticket'), 1600);
    return () => clearTimeout(t);
  }, [s]);

  const machine = (content: React.ReactNode) => (
    <Metal colors={['#3B82F6', '#0B4DA2', '#062C5E']} style={{ width: '100%', maxWidth: 420, alignSelf: 'center', padding: 10 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, gap: 8 }}>
        <Text style={{ color: '#FFF', fontWeight: '900', flex: 1, flexShrink: 1 }} numberOfLines={2}>
          🚄 승차권 자동발매기 · Ticket Machine
        </Text>
        <Pressable testID="lang-toggle" onPress={() => setLang(lang === 'ko' ? 'en' : 'ko')} style={{ flexShrink: 0, backgroundColor: '#FFF', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 5 }}>
          <Text style={{ fontWeight: '900', color: '#0B4DA2', fontSize: 12 }}>{lang === 'ko' ? 'English' : '한국어'}</Text>
        </Pressable>
      </View>
      <Glass minHeight={260} tint="#EEF4FB" style={{ padding: 4 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 11, fontWeight: '800', color: C.inkSoft }}>{L('출발역: 서울', 'From: Seoul')}</Text>
          <Text style={{ fontSize: 11, fontWeight: '800', color: C.inkSoft }}>{L('오늘', 'Today')} 08:12</Text>
        </View>
        {content}
      </Glass>
      <View style={{ flexDirection: 'row', marginTop: 10, justifyContent: 'space-around', alignItems: 'flex-end' }}>
        <Slot testID="slot-card" label="카드 CARD" sub="IC chip ▲" width={80} onPress={tapCardSlot} blink={s === 'card'} />
        <Slot testID="slot-cash" label="지폐 CASH" width={80} onPress={() => sc.info(L('현금 결제 시 사용', 'Used if you pay with cash.'))} />
        <Slot testID="slot-ticket" label="승차권 TICKET" width={90} height={30} onPress={() => sc.info(L('승차권이 나오는 곳', 'Your ticket prints here.'))} blink={s === 'print'} />
      </View>
    </Metal>
  );

  function tapCardSlot() {
    if (s !== 'card') return sc.info(L('결제 단계에서 사용하세요', 'Insert the card at the payment step.'));
    if (held !== 'visa') return sc.info('Select your card in the wallet, then tap the card slot.');
    setHeld(null);
    sc.ok('Payment approved. Printing your ticket…');
    add(`Paid ${won(train!.fare * adults)} by card`);
    setS('print');
  }

  const content = () => {
    switch (s) {
      case 'home':
        return (
          <View style={{ gap: 8 }}>
            {[
              ['승차권 구입', 'Buy a ticket', true],
              ['예약 승차권 발권', 'Print a reserved ticket', false],
              ['반환 · 변경', 'Refund / change', false],
            ].map(([ko, en, ok], i) => (
              <OptBtn
                key={i}
                testID={`opt-${i}`}
                label={L(ko as string, en as string)}
                color={ok ? '#E5383B' : '#0B4DA2'}
                onPress={() => {
                  if (ok) {
                    sc.ok(L('승차권 구입', 'Buy a ticket – no reservation yet.'));
                    setS('dest');
                  } else sc.miss('You have no reservation yet – choose "Buy a ticket".');
                }}
              />
            ))}
            <Text style={{ fontSize: 11, color: C.inkSoft, textAlign: 'center' }}>💡 Tip: tap “English” at the top to switch the language.</Text>
          </View>
        );
      case 'dest':
        return (
          <View style={{ gap: 6 }}>
            <Text style={{ fontWeight: '900', color: C.ink }}>{L('도착역 선택', 'Select destination')}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5 }}>
              {STATIONS.filter((x) => x.fare).map((x) => (
                <OptBtn
                  key={x.id}
                  testID={`dest-${x.id}`}
                  label={lang === 'ko' ? x.ko : x.en.replace(/ \(.*\)/, '')}
                  style={{ width: '31.5%', minHeight: 40, paddingVertical: 6 }}
                  onPress={() => {
                    if (x.id === toId) {
                      sc.ok(`${x.ko} ${x.en}`);
                      add(`Destination: ${x.ko} (${x.en})`);
                      setS('pax');
                    } else sc.miss(`${x.en} is not where you're going. Your station: ${dest.ko} (${dest.en}).`);
                  }}
                />
              ))}
            </View>
          </View>
        );
      case 'pax':
        return (
          <View style={{ gap: 10 }}>
            <Text style={{ fontWeight: '900', color: C.ink }}>{L('인원 선택', 'Passengers')}</Text>
            {[
              ['어른', 'Adult', adults, setAdults],
              ['어린이', 'Child (6–12)', 0, null],
              ['경로', 'Senior (65+)', 0, null],
            ].map(([ko, en, n, set], i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontWeight: '800', color: C.ink }}>{L(ko as string, en as string)}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <OptBtn testID={`pax-minus-${i}`} label="−" onPress={() => set && (set as any)(Math.max(0, (n as number) - 1))} style={{ width: 44 }} />
                  <Text style={{ fontWeight: '900', fontSize: 18, width: 22, textAlign: 'center' }}>{n as number}</Text>
                  <OptBtn testID={`pax-plus-${i}`} label="+" onPress={() => (set ? (set as any)(Math.min(9, (n as number) + 1)) : sc.info('Your party are all adults.'))} style={{ width: 44 }} />
                </View>
              </View>
            ))}
            <Btn
              testID="sim-next"
              label={L('다음', 'Next')}
              onPress={() => {
                if (adults !== ctx.partySize) return sc.miss(`Your party has ${ctx.partySize} adult(s) – set the number to ${ctx.partySize}.`);
                sc.ok(`${adults} adult(s).`);
                add(`Passengers: ${adults} adult(s)`);
                setS('trains');
              }}
            />
          </View>
        );
      case 'trains':
        return (
          <View style={{ gap: 4 }}>
            <Text style={{ fontWeight: '900', color: C.ink }}>
              {L('열차 조회', 'Trains')} 서울 → {dest.ko} · 🎯 {L(`${arriveBy}까지 도착`, `arrive by ${arriveBy}`)}
            </Text>
            {runs
              .filter((r) => toMin(r.dep) >= 8 * 60 + 12)
              .slice(0, 9)
              .map((r) => (
                <Pressable
                  key={r.no}
                  testID={`train-${r.no.replace(/\D/g, '')}`}
                  onPress={() => {
                    if (r.soldOut) return sc.miss('매진 = sold out. Pick another train.');
                    if (toMin(r.arr) > toMin(arriveBy)) sc.miss(`${r.no} arrives ${r.arr} – later than ${arriveBy}!`);
                    else sc.ok(`${r.no} arrives ${r.arr} – in time.`);
                    setTrain(r);
                    add(`Train ${r.no} ${r.dep}→${r.arr}`);
                    setS('seat');
                  }}
                  style={{ flexDirection: 'row', alignItems: 'center', padding: 7, borderRadius: 6, backgroundColor: r.soldOut ? '#F1F5F9' : '#FFF', borderWidth: 1, borderColor: '#CBD5E1' }}
                >
                  <Text style={{ width: 70, fontWeight: '900', color: '#0B4DA2' }}>{r.no}</Text>
                  <Text style={{ flex: 1, fontWeight: '900', color: C.ink, fontVariant: ['tabular-nums'] }}>
                    {r.dep} → {r.arr}
                  </Text>
                  <Text style={{ fontWeight: '900', color: r.soldOut ? '#DC2626' : C.green, fontSize: 12 }}>{r.soldOut ? L('매진', 'Sold out') : `${L('일반실', 'Std')} ${won(r.fare)}`}</Text>
                </Pressable>
              ))}
          </View>
        );
      case 'seat':
        return (
          <View style={{ gap: 6 }}>
            <Text style={{ fontWeight: '900', color: C.ink }}>
              {L('좌석 선택', 'Choose seats')} ({seats.length}/{adults}) · {L('호차', 'Car')}
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
              {[3, 4, 5, 6, 7, 8, 9, 10].map((c) => (
                <OptBtn
                  key={c}
                  testID={`car-${c}`}
                  label={`${c}`}
                  sub={c <= 4 ? L('특실', 'First') : L('일반', 'Std')}
                  selected={car === c}
                  color={c <= 4 ? '#B45309' : '#0B4DA2'}
                  style={{ width: '11.5%', paddingHorizontal: 0, minHeight: 40 }}
                  onPress={() => {
                    if (c <= 4) sc.info('특실 = First class: more expensive. Standard (일반실) is fine.');
                    setCar(c);
                    setSeats([]);
                  }}
                />
              ))}
            </View>
            <View style={{ backgroundColor: '#E2E8F0', borderRadius: 8, padding: 6 }}>
              {Array.from({ length: 10 }).map((_, ri) => {
                const row = ri + 1;
                return (
                  <View key={row} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 3 }}>
                    <Text style={{ width: 22, fontSize: 11, fontWeight: '900', color: C.inkSoft }}>{row}</Text>
                    {['A', 'B', 'gap', 'C', 'D'].map((col, ci) => {
                      if (col === 'gap') return <View key="g" style={{ width: 14 }} />;
                      const id = `${row}${col}`;
                      const taken = seatTaken(car, row, ci);
                      const mine = seats.includes(id);
                      return (
                        <Pressable
                          key={id}
                          testID={`seat-${id}`}
                          disabled={taken}
                          onPress={() => setSeats((x) => (mine ? x.filter((y) => y !== id) : x.length < adults ? [...x, id] : x))}
                          style={{ flex: 1, height: 22, borderRadius: 4, backgroundColor: taken ? '#94A3B8' : mine ? '#E5383B' : '#FFF', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <Text style={{ fontSize: 10, fontWeight: '900', color: mine ? '#FFF' : C.ink }}>{taken ? '×' : id}</Text>
                        </Pressable>
                      );
                    })}
                    <Text style={{ width: 54, fontSize: 9, color: C.inkSoft, fontWeight: '800' }}>{row <= 5 ? L('역방향', '↓ backward') : L('순방향', '↑ forward')}</Text>
                  </View>
                );
              })}
            </View>
            <Btn
              testID="sim-next"
              label={L('선택 완료', 'Confirm seats')}
              disabled={seats.length !== adults}
              onPress={() => {
                const back = seats.some((x) => parseInt(x, 10) <= 5);
                if (back) sc.info('Some seats face backwards (역방향) – fine, but forward seats feel nicer.');
                else sc.ok('Forward-facing seats (순방향).');
                add(`Car ${car}, seat(s) ${seats.join(', ')}`);
                setS('pay');
              }}
            />
          </View>
        );
      case 'pay':
        return (
          <View style={{ gap: 8 }}>
            <Text style={{ fontWeight: '900', color: C.ink }}>{L('결제', 'Payment')}</Text>
            <Text style={{ color: C.ink }}>
              {train!.no} · 서울 {train!.dep} → {dest.ko} {train!.arr}
              {'\n'}
              {adults} × {won(train!.fare)} = <Text style={{ fontWeight: '900' }}>{won(train!.fare * adults)}</Text>
            </Text>
            <OptBtn
              testID="opt-0"
              label={L('카드 결제', 'Pay by card')}
              color="#16A34A"
              onPress={() => {
                sc.info('Insert your card into the card slot (chip first).');
                setS('card');
              }}
            />
            <OptBtn testID="opt-1" label={L('현금 결제', 'Pay by cash')} onPress={() => sc.info(`You would need ${won(train!.fare * adults)} in notes – paying by card is easier here.`)} />
          </View>
        );
      case 'card':
        return <Text style={{ textAlign: 'center', fontWeight: '900', fontSize: 16, color: '#0B4DA2', marginTop: 40 }}>{L('카드를 넣어 주세요 ↓', 'Insert your card ↓')}</Text>;
      case 'print':
        return <Text style={{ textAlign: 'center', fontWeight: '900', fontSize: 16, color: '#0B4DA2', marginTop: 40 }}>🖨️ {L('승차권 발권 중…', 'Printing ticket…')}</Text>;
      default:
        return null;
    }
  };

  const ticket = train && (
    <View style={{ backgroundColor: '#FFF', borderRadius: 8, borderWidth: 2, borderColor: '#0B4DA2', overflow: 'hidden' }}>
      <View style={{ backgroundColor: '#0B4DA2', padding: 6, flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ color: '#FFF', fontWeight: '900' }}>KTX 승차권 · TICKET</Text>
        <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 12 }}>{train.no}</Text>
      </View>
      <View style={{ padding: 10, gap: 4 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ fontSize: 20, fontWeight: '900', color: C.ink }}>서울</Text>
            <Text style={{ fontSize: 11, color: C.inkSoft }}>Seoul {train.dep}</Text>
          </View>
          <Text style={{ fontSize: 22, color: '#0B4DA2' }}>➜</Text>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 20, fontWeight: '900', color: C.ink }}>{dest.ko}</Text>
            <Text style={{ fontSize: 11, color: C.inkSoft }}>
              {dest.en.replace(/ \(.*\)/, '')} {train.arr}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
          <View style={{ backgroundColor: '#FEF3C7', borderRadius: 6, padding: 6, flex: 1 }}>
            <Text style={{ fontSize: 10, color: '#92400E', fontWeight: '800' }}>호차 CAR</Text>
            <Text style={{ fontSize: 22, fontWeight: '900', color: '#92400E' }}>{car}</Text>
          </View>
          <View style={{ backgroundColor: '#FEF3C7', borderRadius: 6, padding: 6, flex: 2 }}>
            <Text style={{ fontSize: 10, color: '#92400E', fontWeight: '800' }}>좌석 SEAT</Text>
            <Text style={{ fontSize: 22, fontWeight: '900', color: '#92400E' }}>{seats.join(' ')}</Text>
          </View>
        </View>
        <Text style={{ fontSize: 11, color: C.inkSoft }}>
          {car <= 4 ? '특실 First' : '일반실 Standard'} · 어른 {adults} · {won(train.fare * adults)} · 승차권은 앱(코레일톡)에서도 확인 가능
        </Text>
      </View>
    </View>
  );

  return (
    <SimShell title={tr(step.title, ctx.lang)} stage={stage} stages={stages} fb={sc.fb}>
      {s === 'map' && (
        <>
          <P>{tr(step.intro, ctx.lang)}</P>
          <H size={16}>🗺️ Tap the KTX station where you should get off for {dest.en.match(/\((.*)\)/)?.[1] ?? dest.en}</H>
          <Box style={{ alignItems: 'center' }}>
            <RouteMap
              width={mapW}
              onTap={(id) => {
                if (id === toId) {
                  sc.ok(`Yes – ${dest.ko} (${dest.en}).`);
                  add(`Found ${dest.ko} on the KTX map`);
                  setS('line');
                } else {
                  const st = stationById(id)!;
                  sc.miss(
                    toId === 'singyeongju' && id === 'dongdaegu'
                      ? 'Dongdaegu is Daegu. For Gyeongju get off at 신경주 Singyeongju (KTX stops outside the old Gyeongju station).'
                      : `${st.ko} ${st.en} – not your stop. Look for ${dest.ko}.`,
                  );
                }
              }}
            />
          </Box>
          <P dim style={{ fontSize: 12 }}>
            Gyeongbu (blue) runs Seoul → Busan; Gangneung (green) to the east coast; Honam/Jeolla trains usually leave from Yongsan.
          </P>
        </>
      )}

      {s === 'line' && (
        <>
          <Box style={{ alignItems: 'center' }}>
            <RouteMap width={mapW} highlight={toId} />
          </Box>
          <H size={16}>Which line takes you from Seoul to {dest.ko}?</H>
          {LINES.map((l, i) => (
            <OptBtn
              key={l.id}
              testID={`opt-${i}`}
              label={`${l.ko} ${l.en}`}
              color={l.color}
              onPress={() => {
                if (l.id === dest.line) {
                  sc.ok(`${l.en} – trains leave from Seoul Station.`);
                  add(`Line: ${l.en}`);
                  setS('home');
                } else sc.miss(`${dest.ko} is on the ${LINES.find((x) => x.id === dest.line)?.en}.`);
              }}
            />
          ))}
        </>
      )}

      {['home', 'dest', 'pax', 'trains', 'seat', 'pay', 'card', 'print'].includes(s) && (
        <>
          {s === 'home' && <P>Seoul Station, 2nd floor: blue self-service ticket machines (승차권 자동발매기). Same-day tickets – let’s buy one.</P>}
          {machine(content())}
          {s === 'card' && <WalletBar items={[{ id: 'visa', icon: '💳', label: 'Visa card' }]} selected={held} onSelect={setHeld} />}
        </>
      )}

      {s === 'ticket' && (
        <>
          <H size={16}>🎫 Your ticket</H>
          {ticket}
          <H size={16}>Which car (호차) do you board?</H>
          {[car, car + 1 > 10 ? car - 2 : car + 1, Number(seats[0]?.replace(/\D/g, '')) || 1]
            .filter((v, i, a) => a.indexOf(v) === i)
            .map((v, i) => (
              <OptBtn
                key={v}
                testID={`opt-${i}`}
                label={`Car ${v}`}
                onPress={() => {
                  if (v === car) sc.ok(`Car ${car} – the number painted on the platform floor shows where it stops.`);
                  else sc.miss(`"${car}호차" on your ticket = car ${car}. The seat number is ${seats.join(', ')}.`);
                  setS('board');
                }}
              />
            ))}
        </>
      )}

      {s === 'board' && train && (
        <>
          <View style={{ backgroundColor: '#0B1020', borderRadius: 8, padding: 8 }}>
            <Text style={{ color: '#FDE68A', fontWeight: '900', textAlign: 'center' }}>출발 DEPARTURES · 서울역</Text>
            {[...runs.slice(0, 3).filter((r) => r.no !== train.no), train]
              .sort((a, b) => toMin(a.dep) - toMin(b.dep))
              .map((r) => {
                const p = 3 + (parseInt(r.no.replace(/\D/g, ''), 10) % 12);
                return (
                  <View key={r.no} style={{ flexDirection: 'row', paddingVertical: 3 }}>
                    <Text style={{ width: 54, color: '#86EFAC', fontWeight: '900' }}>{r.dep}</Text>
                    <Text style={{ width: 72, color: '#E2E8F0', fontWeight: '900' }}>{r.no}</Text>
                    <Text style={{ flex: 1, color: '#E2E8F0', fontWeight: '800' }}>{r === train ? dest.ko : '부산'}</Text>
                    <Text style={{ color: '#FCA5A5', fontWeight: '900' }}>{p}번</Text>
                  </View>
                );
              })}
          </View>
          <H size={16}>Which platform (타는 곳) for {train.no}?</H>
          {[platform, platform + 2, platform > 4 ? platform - 1 : platform + 4].map((p, i) => (
            <OptBtn
              key={p}
              testID={`opt-${i}`}
              label={`Platform ${p} · ${p}번 타는 곳`}
              onPress={() => {
                if (p === platform) sc.ok('Right platform! Be there ~10 minutes early – KTX leaves on the dot.');
                else sc.miss(`Find your train number ${train.no} on the board: platform ${platform}.`);
                add(`Platform ${platform}, car ${car}`);
                setS('done');
              }}
            />
          ))}
        </>
      )}

      {s === 'done' && (
        <>
          {ticket}
          <DoneCard title="Ticket & train mastered" score={sc.final()} log={log} lang={ctx.lang} onContinue={() => onDone({ score: sc.final(), effects: { money: -(train?.fare ?? 0) }, log })} />
        </>
      )}
    </SimShell>
  );
}
