import { useEffect, useState } from 'react';
import { Pressable, View, useWindowDimensions } from 'react-native';
import { Text } from '../ui/Text';
import Svg, { Circle, G, Line, Path, Polyline, Rect } from 'react-native-svg';
import { SvgT as T } from '../ui/SvgText';
import {
  MODE_ICON,
  MODE_NAME,
  REGIONS,
  WEEKDAY_KO,
  modesFor,
  regionOf,
  type Region,
  hhmm,
  placeById,
  simulatePlan,
  toMinutes,
  tr,
  travel,
  type Place,
  type PlanResult,
  type PlanStop,
  type Transport,
} from '@kotoventure/shared';
import { Btn, H, P, won } from '../ui/kit';
import { C, R } from '../ui/theme';
import { Box, DoneCard, OptBtn, SimShell, useScore, type SimProps } from './kit';

const DAY_EN: Record<string, string> = { Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday' };

/** Naive preview: times only (does NOT reveal closures or weather – that's for the player to work out). */
function preview(stops: PlanStop[], hotel: Place, ret: Transport, start: Place, startMin: number) {
  let t = startMin;
  let at = start;
  let cost = 0;
  let energy = 0;
  const rows = stops.map((s) => {
    const p = placeById(s.placeId)!;
    const tr0 = travel(at, p, s.mode, t);
    t += tr0.min;
    const arrive = Math.max(t, toMinutes(p.open));
    t = arrive + p.visitMin;
    cost += tr0.cost + p.cost;
    energy += tr0.energy + p.energy;
    at = p;
    return { arrive, leave: t, travelMin: tr0.min };
  });
  const back = travel(at, hotel, ret, t);
  cost += back.cost;
  energy += back.energy;
  return { rows, end: t + back.min, cost, energy };
}

export function DayPlanSim({ step, ctx, onDone }: SimProps) {
  const { width } = useWindowDimensions();
  const cfg = step.config ?? {};
  const ko = ctx.lang === 'ko';
  const hotel = placeById(cfg.hotel ?? 'hotel-myeongdong')!;
  const places = (cfg.places ?? []).map((id) => placeById(id)).filter(Boolean) as Place[];
  const region = regionOf(hotel);
  const startPlace = placeById(cfg.startAt) ?? hotel;
  const startMin = toMinutes(cfg.start ?? '09:00');
  const modes = modesFor(region, ctx.flags);
  const MODES: [Transport, string][] = modes.map((m) => [m, MODE_ICON[m]]);
  const last = REGIONS[region].last;
  const sc = useScore();
  const [stops, setStops] = useState<PlanStop[]>([]);
  const [ret, setRet] = useState<Transport>(modes[0]);
  const [result, setResult] = useState<PlanResult | null>(null);
  const [shown, setShown] = useState(0);
  const pv = preview(stops, hotel, ret, startPlace, startMin);
  const mapW = Math.min(width - 40, 380);

  useEffect(() => {
    if (!result || shown >= result.events.length) return;
    const t = setTimeout(() => setShown((n) => n + 1), 280);
    return () => clearTimeout(t);
  }, [result, shown]);

  const add = (id: string) => {
    if (stops.length >= 6) return sc.info(ko ? '하루 최대 6곳까지 계획할 수 있어요.' : 'Max 6 stops per day.');
    setStops((s) => [...s, { placeId: id, mode: modes[0] }]);
    sc.clear();
  };
  const move = (i: number, d: number) =>
    setStops((s) => {
      const j = i + d;
      if (j < 0 || j >= s.length) return s;
      const a = [...s];
      [a[i], a[j]] = [a[j], a[i]];
      return a;
    });

  const run = () => {
    const r = simulatePlan(cfg, stops, ret, ctx.flags, ctx.energy);
    setResult(r);
    setShown(0);
  };

  const stages = [ko ? '일정 계획' : 'Plan', ko ? '여행 실행' : 'Live the day', ko ? '결과' : 'Result'];
  const W = cfg.weather;

  if (result) {
    const done = shown >= result.events.length;
    return (
      <SimShell title={tr(step.title, ctx.lang)} stage={done ? 2 : 1} stages={stages} fb={null}>
        <Box style={{ gap: 6 }}>
          <Text style={{ fontWeight: '900', color: C.ink }}>
            📅 {ko ? WEEKDAY_KO[cfg.weekday ?? 'Mon'] : DAY_EN[cfg.weekday ?? 'Mon']} · {ko ? '오늘의 여행' : 'Your day'}
          </Text>
          {result.events.slice(0, shown).map((e, i) => {
            const bad = ['closed', 'late', 'hungry', 'lastTrain', 'tired'].includes(e.kind) || (e.kind === 'weather' && !e.good);
            return (
              <View key={i} style={{ flexDirection: 'row', gap: 8, paddingVertical: 3, borderBottomWidth: 1, borderBottomColor: C.line }}>
                <Text style={{ width: 44, fontWeight: '900', color: C.inkSoft, fontVariant: ['tabular-nums'] }}>{e.time}</Text>
                <Text style={{ flex: 1, color: bad ? C.red : e.kind === 'visit' || e.good ? C.green : C.ink, fontWeight: e.kind === 'travel' ? '600' : '800' }}>
                  {e.kind === 'closed' ? '⛔ ' : e.kind === 'late' ? '⏰ ' : e.kind === 'hungry' ? '🍚 ' : e.kind === 'visit' ? '📍 ' : ''}
                  {e.text}
                </Text>
              </View>
            );
          })}
        </Box>
        {done && (
          <>
            <Box style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <Stat k={ko ? '총 시간' : 'Total time'} v={`${Math.floor((result.endMin - startMin) / 60)}h ${(result.endMin - startMin) % 60}m`} />
              <Stat k={ko ? '쓴 돈' : 'Spent'} v={won(result.cost)} />
              <Stat k={ko ? '체력' : 'Energy'} v={`−${Math.max(0, result.energy)}`} />
              <Stat k={ko ? '방문' : 'Visited'} v={`${result.visited.length}/${stops.length}`} />
            </Box>
            <DoneCard
              title={ko ? '하루 일정 완료' : 'Day complete'}
              score={result.score}
              lang={ctx.lang}
              log={[
                `${ko ? '방문' : 'Visited'}: ${result.visited.map((id) => placeById(id)?.ko).join(', ') || '—'}`,
                ...result.events.filter((e) => ['closed', 'late', 'hungry', 'lastTrain'].includes(e.kind)).map((e) => e.text),
              ]}
              onContinue={() =>
                onDone({
                  score: result.score,
                  effects: { money: -result.cost, energy: -Math.max(0, result.energy) },
                  log: [`Day plan: ${result.visited.length} places, ${hhmm(startMin)}–${hhmm(result.endMin)}`],
                  flags: [...result.visited.map((id) => `visit:${id}`), ...result.visited.map((id) => `by:${id}:${result.modes[id]}`)],
                  startMin,
                  endMin: result.endMin,
                })
              }
            />
          </>
        )}
      </SimShell>
    );
  }

  return (
    <SimShell title={tr(step.title, ctx.lang)} stage={0} stages={stages} fb={sc.fb}>
      <P>{tr(step.intro, ctx.lang)}</P>
      <Box style={{ gap: 4 }}>
        <Text style={{ fontWeight: '900', color: C.ink, fontSize: 16 }}>
          📅 {ko ? WEEKDAY_KO[cfg.weekday ?? 'Mon'] : DAY_EN[cfg.weekday ?? 'Mon']} · {cfg.start ?? '09:00'} {startPlace === hotel ? (ko ? '숙소 출발' : 'leave the hotel') : ko ? `${startPlace.ko} 출발` : `start at ${startPlace.name.en}`}
        </Text>
        {W && (
          <Text style={{ fontWeight: '800', color: W.kind === 'heat' ? C.orange : W.kind === 'storm' ? C.red : C.blue }}>
            {W.kind === 'heat' ? '🥵' : W.kind === 'storm' ? '🌀' : '🌧️'} {ko ? '일기예보' : 'Forecast'}: {W.text} ({W.from}–{W.to})
          </Text>
        )}
        <Text style={{ color: C.inkSoft, fontSize: 12 }}>
          🕘 {ko ? '하루 일정은 숙소에 돌아오는 시간까지 계산돼요' : 'Your day is timed until you are back at your stay'} · {ko ? '점심을 꼭 챙기세요 (11:00–14:30)' : 'Remember lunch (11:00–14:30)'} {last ? ` · ${ko ? `${MODE_NAME[last.mode] === 'Bus' ? '버스' : '지하철'} 막차 ~${last.at}` : `Last ${MODE_NAME[last.mode].toLowerCase()} ~${last.at}`}` : ''}
          {modes.length ? ` · ${modes.map((m) => `${MODE_ICON[m]} ${MODE_NAME[m]}`).join(' / ')}` : ''}
        </Text>
      </Box>

      {/* map */}
      <Box style={{ alignItems: 'center', padding: 6 }}>
        <Svg width={mapW} height={mapW * 0.8} viewBox="0 0 100 80">
          <MapDeco region={region} />
          {stops.length > 0 && (
            <Polyline
              points={[startPlace, ...stops.map((s) => placeById(s.placeId)!), hotel].map((p) => `${p.x},${p.y * 0.8}`).join(' ')}
              stroke={C.red}
              strokeWidth="0.8"
              strokeDasharray="1.6 1"
              fill="none"
            />
          )}
          {[hotel, ...(startPlace !== hotel ? [startPlace] : []), ...places].map((p) => {
            const idx = stops.findIndex((s) => s.placeId === p.id);
            return (
              <G key={p.id}>
                <Circle cx={p.x} cy={p.y * 0.8} r={p === hotel ? 2.6 : 2.2} fill={p === hotel ? C.navy : idx >= 0 ? C.red : '#FFFFFF'} stroke={C.ink} strokeWidth="0.5" />
                {idx >= 0 && (
                  <T x={p.x} y={p.y * 0.8 + 1} fontSize="2.4" fill="#FFF" fontWeight="900" textAnchor="middle">
                    {idx + 1}
                  </T>
                )}
                <T x={p.x} y={p.y * 0.8 - 3} fontSize="2.6" fill={C.ink} fontWeight="900" textAnchor="middle">
                  {p.ko}
                </T>
              </G>
            );
          })}
          <Line x1="4" y1="76" x2="16" y2="76" stroke={C.ink} strokeWidth="0.4" />
          <T x="10" y="75" fontSize="2.2" fill={C.inkSoft} textAnchor="middle">{REGIONS[region].mapKm}</T>
        </Svg>
      </Box>

      {/* places */}
      <H size={16}>{ko ? '갈 곳 고르기' : 'Pick places'}</H>
      {places.map((p) => {
        const added = stops.some((s) => s.placeId === p.id);
        return (
          <Box key={p.id} style={{ gap: 3, opacity: added ? 0.55 : 1 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontWeight: '900', color: C.ink, flex: 1 }}>
                {p.outdoor ? '🌳' : '🏛️'}
                {p.food ? '🍜' : ''} {p.ko} · {tr(p.name, 'en')}
              </Text>
              <OptBtn testID={`add-${p.id}`} label={added ? '✓' : ko ? '+ 추가' : '+ Add'} disabled={added} onPress={() => add(p.id)} style={{ minHeight: 34, paddingVertical: 4, minWidth: 70 }} />
            </View>
            <Text style={{ fontSize: 12, color: C.inkSoft, fontWeight: '700' }}>
              🕘 {p.open}–{p.close}
              {p.lastEntry ? ` (${ko ? '입장마감' : 'last entry'} ${p.lastEntry})` : ''} · ⏱ {p.visitMin}m · {p.cost ? won(p.cost) : ko ? '무료' : 'free'}
              {p.closedOn?.length ? (
                <Text style={{ color: C.red, fontWeight: '900' }}>
                  {' '}
                  · ⛔ {ko ? p.closedOn.map((d) => WEEKDAY_KO[d]).join(',') + ' 휴무' : 'closed ' + p.closedOn.join(',')}
                </Text>
              ) : null}
            </Text>
            <Text style={{ fontSize: 12, color: C.ink }}>💡 {tr(p.tip, ctx.lang)}</Text>
          </Box>
        );
      })}

      {/* plan */}
      <H size={16}>
        🗓️ {ko ? '내 일정' : 'My plan'} ({stops.length})
      </H>
      {stops.length === 0 && <P dim>{ko ? '위에서 갈 곳을 추가하세요. 순서와 이동수단이 중요해요!' : 'Add places above. Order and transport matter!'}</P>}
      {stops.map((s, i) => {
        const p = placeById(s.placeId)!;
        const row = pv.rows[i];
        return (
          <Box key={s.placeId} style={{ gap: 6, borderLeftWidth: 5, borderLeftColor: C.red }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontWeight: '900', color: C.red }}>{i + 1}</Text>
              <Text style={{ flex: 1, fontWeight: '900', color: C.ink }}>{p.ko}</Text>
              <Pressable testID={`up-${i}`} onPress={() => move(i, -1)} style={{ padding: 4 }}>
                <Text>⬆️</Text>
              </Pressable>
              <Pressable testID={`down-${i}`} onPress={() => move(i, 1)} style={{ padding: 4 }}>
                <Text>⬇️</Text>
              </Pressable>
              <Pressable testID={`del-${i}`} onPress={() => setStops((x) => x.filter((_, k) => k !== i))} style={{ padding: 4 }}>
                <Text>✕</Text>
              </Pressable>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 12, color: C.inkSoft, fontWeight: '800' }}>{ko ? '이동' : 'Go by'}</Text>
              {MODES.map(([m, icon]) => (
                <OptBtn key={m} testID={`mode-${i}-${m}`} label={icon} selected={s.mode === m} onPress={() => setStops((x) => x.map((y, k) => (k === i ? { ...y, mode: m } : y)))} style={{ minHeight: 32, paddingVertical: 2, width: 44 }} />
              ))}
              <Text style={{ fontSize: 11, color: C.inkSoft, flex: 1, textAlign: 'right' }}>
                {row.travelMin}m → ~{hhmm(row.arrive)}–{hhmm(row.leave)}
              </Text>
            </View>
          </Box>
        );
      })}
      {stops.length > 0 && (
        <Box style={{ gap: 6 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ fontWeight: '800', color: C.ink }}>🏨 {ko ? '숙소로 복귀' : 'Back to hotel'}</Text>
            {MODES.map(([m, icon]) => (
              <OptBtn key={m} testID={`ret-${m}`} label={icon} selected={ret === m} onPress={() => setRet(m)} style={{ minHeight: 32, paddingVertical: 2, width: 44 }} />
            ))}
          </View>
          <Text style={{ fontSize: 12, color: C.inkSoft, fontWeight: '700' }}>
            {ko ? '예상' : 'Estimate'}: {ko ? '복귀' : 'back'} ~{hhmm(pv.end)} · {won(pv.cost)} · ⚡ −{Math.max(0, pv.energy)}
          </Text>
        </Box>
      )}
      <View style={{ backgroundColor: '#FFF4D6', borderRadius: R.m, padding: 10 }}>
        <Text style={{ fontSize: 12, color: C.ink }}>
          {ko
            ? '⚠️ 예상 시간은 휴무일·입장마감·날씨를 반영하지 않아요. 직접 확인하고 계획하세요!'
            : '⚠️ The estimate ignores closing days, last entry and weather – check the details yourself!'}
        </Text>
      </View>
      <Btn testID="plan-go" label={ko ? '이 일정으로 출발!' : 'Start the day!'} disabled={!stops.length} onPress={run} />
    </SimShell>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontWeight: '900', fontSize: 16, color: C.ink }}>{v}</Text>
      <Text style={{ fontSize: 11, color: C.inkSoft, fontWeight: '800' }}>{k}</Text>
    </View>
  );
}

/** Region-specific map background (schematic). */
function MapDeco({ region }: { region: Region }) {
  if (region === 'busan')
    return (
      <G>
        <Rect x="0" y="0" width="100" height="80" rx="3" fill="#9ED3F5" />
        <Path d="M0 0 H100 V30 Q92 34 88 40 Q80 34 72 34 Q66 40 58 44 Q44 46 34 56 Q26 62 18 62 Q10 56 0 58Z" fill="#EEF5E9" />
        <Path d="M22 70 Q30 66 38 72 Q34 78 24 78Z" fill="#EEF5E9" />
        <Path d="M30 14 Q44 4 60 14" stroke="#86B97A" strokeWidth="5" fill="none" opacity={0.5} />
        <T x="60" y="72" fontSize="2.8" fill="#1D4ED8" fontWeight="700">바다 Sea</T>
      </G>
    );
  if (region === 'gyeongju')
    return (
      <G>
        <Rect x="0" y="0" width="100" height="80" rx="3" fill="#EEF5E9" />
        <Path d="M20 0 Q24 30 18 50 Q14 66 22 80" stroke="#9ED3F5" strokeWidth="3" fill="none" />
        <T x="6" y="30" fontSize="2.4" fill="#1D4ED8" fontWeight="700">형산강</T>
        <Path d="M24 64 Q36 56 48 66 Q40 76 26 74Z" fill="#B7D9A8" />
        <Path d="M78 40 Q90 30 100 40 L100 64 Q88 66 78 58Z" fill="#B7D9A8" />
        <T x="86" y="62" fontSize="2.4" fill="#3F6212" fontWeight="700">토함산</T>
      </G>
    );
  if (region === 'jeju')
    return (
      <G>
        <Rect x="0" y="0" width="100" height="80" rx="3" fill="#9ED3F5" />
        <Path d="M6 36 Q10 18 40 12 Q70 8 92 22 Q99 34 92 48 Q70 66 40 66 Q12 62 6 36Z" fill="#EEF5E9" />
        <Path d="M42 40 L50 28 L58 40Z" fill="#A3B18A" />
        <T x="50" y="44" fontSize="2.4" fill="#3F6212" fontWeight="700" textAnchor="middle">한라산</T>
        <Circle cx="97" cy="24" r="3" fill="#EEF5E9" />
      </G>
    );
  return (
    <G>
      <Rect x="0" y="0" width="100" height="80" rx="3" fill="#EEF5E9" />
      <Path d="M0 62 Q30 56 50 64 Q70 72 100 66 L100 72 Q70 78 50 70 Q30 62 0 68Z" fill="#9ED3F5" />
      <T x="72" y="76" fontSize="2.6" fill="#1D4ED8" fontWeight="700">한강 Han River</T>
      <Path d="M30 20 Q40 6 54 14" stroke="#86B97A" strokeWidth="4" fill="none" opacity={0.5} />
    </G>
  );
}
