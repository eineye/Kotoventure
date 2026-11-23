import { useEffect, useState } from 'react';
import { Pressable, View, useWindowDimensions } from 'react-native';
import { Text } from '../ui/Text';
import Svg, { Circle, G, Polyline, Rect, Text as T } from 'react-native-svg';
import { SUBWAY_LINES, SUBWAY_STATIONS, bestRoute, linesBetween, routeTime, stationOf, tr, netOf } from '@kotoventure/shared';
import { Btn, H, P } from '../ui/kit';
import { C } from '../ui/theme';
import { Box, DoneCard, SimShell, useScore, type SimProps } from './kit';

const MW = 300;
const MH = 200;

const lineName = (id: string) => SUBWAY_LINES.find((l) => l.id === id)?.name ?? id;

/** Describe a path as "Line 4 → (transfer at DDP) → Line 2". */
function describe(path: string[]) {
  const { lines } = routeTime(path);
  const parts: string[] = [];
  lines.forEach((l, i) => {
    if (i === 0 || l !== lines[i - 1]) {
      if (i > 0) parts.push(`환승 ${stationOf(path[i])?.ko} transfer`);
      parts.push(lineName(l));
    }
  });
  return parts.join(' → ');
}

/** Subway transfer puzzle: tap stations one by one to build the fastest route before time runs out. */
export function TransferSim({ step, ctx, onDone }: SimProps) {
  const { width } = useWindowDimensions();
  const ko = ctx.lang === 'ko';
  const from = step.config?.fromStation ?? 'myeongdong';
  const to = step.config?.toStation ?? 'seongsu';
  const limit = step.config?.timeLimit ?? 60;
  const best = bestRoute(from, to);
  const sc = useScore(8);
  const [path, setPath] = useState<string[]>([from]);
  const [left, setLeft] = useState(limit);
  const [done, setDone] = useState<null | { score: number; reached: boolean }>(null);
  const k = Math.min(width - 40, 400) / MW;
  const cur = path[path.length - 1];
  const rt = routeTime(path);
  const net = netOf(from);
  const LINES = SUBWAY_LINES.filter((l) => (l.net ?? 'seoul') === net);
  const STATIONS = SUBWAY_STATIONS.filter((st) => (st.net ?? 'seoul') === net);

  useEffect(() => {
    if (done) return;
    const t = setTimeout(() => {
      if (left <= 1) {
        setLeft(0);
        sc.miss(ko ? '시간 초과! 열차를 놓쳤어요.' : 'Time is up – you missed the train!');
        setDone({ score: 30, reached: false });
      } else setLeft((x) => x - 1);
    }, 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left, done]);

  const tap = (id: string) => {
    if (done) return;
    if (id === cur) return;
    if (path.length > 1 && id === path[path.length - 2]) {
      setPath((p) => p.slice(0, -1));
      return;
    }
    if (!linesBetween(cur, id).length) return sc.info(ko ? '바로 옆 역만 고를 수 있어요 (같은 노선으로 연결된 다음 역).' : 'Pick a station right next to your current one on a line.');
    if (path.includes(id)) return sc.info(ko ? '이미 지나온 역이에요.' : 'You already passed this station.');
    const np = [...path, id];
    setPath(np);
    if (id === to) {
      const r = routeTime(np);
      const diff = r.min - best.min;
      const score = Math.max(45, 100 - diff * 4 - (left < limit * 0.2 ? 5 : 0));
      if (diff <= 0) sc.ok(ko ? `최단 경로! ${r.min}분, 환승 ${r.transfers}회` : `Fastest route! ${r.min} min, ${r.transfers} transfer(s).`);
      else sc.info(ko ? `도착! ${r.min}분 (최단 ${best.min}분)` : `Arrived in ${r.min} min (fastest is ${best.min} min).`);
      setDone({ score, reached: true });
    }
  };

  const nb = new Set(STATIONS.filter((s) => linesBetween(cur, s.id).length).map((s) => s.id));

  return (
    <SimShell title={tr(step.title, ctx.lang)} stage={done ? 1 : 0} stages={[ko ? '경로 찾기' : 'Find route', ko ? '결과' : 'Result']} fb={sc.fb}>
      <P>{tr(step.intro, ctx.lang)}</P>
      <Box style={{ gap: 4 }}>
        <Text style={{ fontWeight: '900', color: C.ink, fontSize: 16 }}>
          🚇 {stationOf(from)?.ko} → 🎯 {stationOf(to)?.ko}
        </Text>
        <Text style={{ color: C.inkSoft, fontSize: 12, fontWeight: '700' }}>
          {ko ? '역을 하나씩 눌러 길을 이으세요. 한 정거장 2분, 환승 5분. 방금 고른 역을 다시 누르면 취소.' : 'Tap stations one by one. 2 min per stop, 5 min per transfer. Tap the previous station to undo.'}
        </Text>
        <View style={{ height: 8, backgroundColor: C.line, borderRadius: 4, marginTop: 4 }}>
          <View style={{ height: 8, borderRadius: 4, width: `${(left / limit) * 100}%`, backgroundColor: left < limit * 0.3 ? C.red : C.green }} />
        </View>
        <Text style={{ fontWeight: '900', color: left < limit * 0.3 ? C.red : C.ink }}>
          ⏱ {left}s · {ko ? '현재 경로' : 'Route'} {rt.min}
          {ko ? '분' : ' min'} · {ko ? '환승' : 'transfers'} {rt.transfers}
        </Text>
      </Box>
      <Box style={{ padding: 4, alignItems: 'center' }}>
        <View style={{ width: MW * k, height: MH * k }}>
          <Svg width={MW * k} height={MH * k} viewBox={`0 0 ${MW} ${MH}`}>
            <Rect x="0" y="0" width={MW} height={MH} rx="8" fill="#F8FAFC" />
            {LINES.map((l) => (
              <Polyline key={l.id} points={l.stations.map((s) => `${stationOf(s)!.x},${stationOf(s)!.y}`).join(' ')} stroke={l.color} strokeWidth="5" fill="none" strokeLinejoin="round" opacity={0.85} />
            ))}
            {path.length > 1 && <Polyline points={path.map((s) => `${stationOf(s)!.x},${stationOf(s)!.y}`).join(' ')} stroke="#E5383B" strokeWidth="2.6" strokeDasharray="5 3" fill="none" />}
            {STATIONS.map((s) => {
              const inter = LINES.filter((l) => l.stations.includes(s.id)).length > 1;
              const isCur = s.id === cur;
              const isGoal = s.id === to;
              const near = nb.has(s.id) && !done;
              return (
                <G key={s.id}>
                  {near && <Circle cx={s.x} cy={s.y} r="8" fill="#FDE68A" opacity={0.7} />}
                  <Circle cx={s.x} cy={s.y} r={inter ? 5 : 3.6} fill={isCur ? '#E5383B' : isGoal ? '#FACC15' : '#FFFFFF'} stroke="#1B2140" strokeWidth={inter ? 1.8 : 1.2} />
                  <T x={s.x} y={s.below ? s.y + 12 : s.y - 7} fontSize={net === 'busan' ? '6' : '7'} fontWeight="900" fill="#1B2140" textAnchor="middle">
                    {s.ko}
                  </T>
                </G>
              );
            })}
            {LINES.map((l, i) => (
              <G key={l.id} transform={`translate(${6 + i * 44},${MH - 8})`}>
                <Rect x="0" y="-5" width="10" height="5" rx="2" fill={l.color} />
                <T x="13" y="0" fontSize="6.5" fontWeight="800" fill="#1B2140">
                  {l.name}
                </T>
              </G>
            ))}
          </Svg>
          {STATIONS.map((s) => (
            <Pressable
              key={s.id}
              testID={`stn-${s.id}`}
              accessibilityLabel={s.en}
              onPress={() => tap(s.id)}
              style={{ position: 'absolute', left: (s.x - 10) * k, top: (s.y - 10) * k, width: 20 * k, height: 20 * k, borderRadius: 10 * k }}
            />
          ))}
        </View>
      </Box>
      {!done && path.length > 1 && <Text style={{ color: C.ink, fontWeight: '700' }}>🛤️ {describe(path)}</Text>}
      {!done && (
        <Btn
          testID="sim-giveup"
          kind="ghost"
          label={ko ? '모르겠어요 (정답 보기)' : 'I give up – show me'}
          onPress={() => {
            sc.miss(ko ? '다음엔 노선 색과 환승역을 확인하세요.' : 'Next time follow the line colours and look for transfer stations (bold circles).');
            setDone({ score: 30, reached: false });
          }}
        />
      )}
      {done && (
        <>
          <Box style={{ gap: 4 }}>
            <H size={15}>{ko ? '최단 경로' : 'Fastest route'}</H>
            <Text style={{ color: C.ink }}>
              {best.path.map((s) => stationOf(s)?.ko).join(' › ')}
            </Text>
            <Text style={{ color: C.green, fontWeight: '800' }}>
              {describe(best.path)} · {best.min}
              {ko ? '분' : ' min'}
            </Text>
          </Box>
          <DoneCard
            title={done.reached ? (ko ? '도착!' : 'Arrived!') : ko ? '경로 학습' : 'Route learned'}
            score={Math.min(done.score, sc.final())}
            lang={ctx.lang}
            log={[
              done.reached ? `Your route: ${describe(path)} (${rt.min} min)` : 'Did not reach the destination in time',
              `Fastest: ${describe(best.path)} (${best.min} min)`,
            ]}
            onContinue={() => onDone({ score: Math.min(done.score, sc.final()), effects: { energy: done.reached ? -2 : -8, money: -1550 }, log: [`Subway route ${stationOf(from)?.en} → ${stationOf(to)?.en}`] })}
          />
        </>
      )}
    </SimShell>
  );
}
