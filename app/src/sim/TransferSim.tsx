import { useEffect, useState } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { Text } from '../ui/Text';
import { SUBWAY_LINES, SUBWAY_STATIONS, bestRoute, linesBetween, routeTime, stationOf, tr, netOf } from '@kotoventure/shared';
import { Btn, H, P } from '../ui/kit';
import { C } from '../ui/theme';
import { SubwayMapCard } from './SubwayMap';
import { Box, DoneCard, SimShell, useScore, type SimProps } from './kit';


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
  const cur = path[path.length - 1];
  const rt = routeTime(path);
  const net = netOf(from);
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
      <Box style={{ padding: 6 }}>
        <SubwayMapCard
          net={net}
          width={Math.min(width - 56, 420)}
          lang={ctx.lang}
          state={{ path, cur, goal: to, near: done ? new Set() : nb }}
          onTap={tap}
          closeWhen={!!done}
          status={
            <Text style={{ fontWeight: '900', color: left < limit * 0.3 ? '#FCA5A5' : '#FFF' }}>
              🚇 {stationOf(from)?.ko} → 🎯 {stationOf(to)?.ko} · ⏱ {left}s · {rt.min}
              {ko ? '분' : ' min'} · {ko ? '환승' : 'transfers'} {rt.transfers}
            </Text>
          }
        />
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
