import { useState } from 'react';
import { View } from 'react-native';
import { Text } from '../ui/Text';
import { tr } from '@kotoventure/shared';
import { H, P } from '../ui/kit';
import { Box, DoneCard, OptBtn, SimShell, useScore, type SimProps } from './kit';

interface Scene {
  light: 'red' | 'green' | 'blink' | 'none';
  count?: number;
  lanes: number;
  scene: { ko: string; en: string };
  opts: { ko: string; en: string; ok: boolean; why: { ko: string; en: string } }[];
}
const SCENES: Scene[] = [
  {
    light: 'red', lanes: 4, scene: { ko: '빨간불. 차가 한 대도 안 보여요.', en: 'Red man. Not a single car in sight.' },
    opts: [
      { ko: '초록불을 기다린다', en: 'Wait for the green man', ok: true, why: { ko: '배달 오토바이가 갑자기 나타날 수 있어요. 무단횡단은 범칙금 대상이에요.', en: 'Delivery bikes appear out of nowhere – and jaywalking can be fined.' } },
      { ko: '빨리 건넌다', en: 'Cross quickly', ok: false, why: { ko: '무단횡단은 범칙금 대상이고, 오토바이가 순식간에 와요.', en: 'Jaywalking can be fined, and scooters come fast.' } },
    ],
  },
  {
    light: 'green', count: 25, lanes: 4, scene: { ko: '초록불, 남은 시간 25초.', en: 'Green man, 25 seconds left.' },
    opts: [
      { ko: '좌우를 한 번 보고 건넌다', en: 'Glance left and right, then cross', ok: true, why: { ko: '충분한 시간! 그래도 확인하는 습관이 좋아요.', en: 'Plenty of time – the quick check is a good habit.' } },
      { ko: '다음 신호를 기다린다', en: 'Wait for the next light', ok: false, why: { ko: '25초면 4차로를 건너기에 충분해요.', en: '25 seconds is plenty for 4 lanes.' } },
    ],
  },
  {
    light: 'blink', count: 3, lanes: 8, scene: { ko: '초록불이 깜빡이고 3초 남았어요. 8차로 큰길이에요.', en: 'Green is blinking, 3 seconds left, on an 8-lane road.' },
    opts: [
      { ko: '다음 신호를 기다린다', en: 'Wait for the next light', ok: true, why: { ko: '깜빡이면 새로 건너기 시작하지 마세요. 큰길 중간에 갇힐 수 있어요.', en: 'Never start crossing on a blinking light – you\'d be stuck mid-road.' } },
      { ko: '뛰어서 건넌다', en: 'Run for it', ok: false, why: { ko: '8차로는 3초에 못 건너요. 위험해요!', en: 'Nobody crosses 8 lanes in 3 seconds. Dangerous!' } },
    ],
  },
  {
    light: 'green', count: 18, lanes: 4, scene: { ko: '초록불인데 우회전 차가 횡단보도로 들어오고 있어요.', en: 'Green man – but a right-turning car is rolling into the crosswalk.' },
    opts: [
      { ko: '차가 멈추는 걸 확인하고(눈 맞추고) 건넌다', en: 'Make eye contact, cross once it has stopped', ok: true, why: { ko: '우회전 차는 보행자 앞에서 멈춰야 하지만, 확인하고 건너는 게 안전해요.', en: 'Turning cars must stop for you – but confirm it before stepping out.' } },
      { ko: '초록불이니 휴대폰 보면서 그냥 건넌다', en: 'It\'s green – keep scrolling my phone and walk', ok: false, why: { ko: '보행 중 휴대폰은 사고의 큰 원인이에요.', en: 'Phone-walking is a top cause of accidents.' } },
    ],
  },
  {
    light: 'none', lanes: 1, scene: { ko: '신호등 없는 골목길 횡단보도. 배달 오토바이가 빠르게 다가와요.', en: 'Alley crossing without lights. A delivery scooter is speeding towards you.' },
    opts: [
      { ko: '멈춰서 오토바이가 지나가거나 서는 걸 본다', en: 'Stop and let it pass (or wait until it stops)', ok: true, why: { ko: '법적으로는 차가 서야 하지만, 내 안전이 먼저예요.', en: 'Legally it should stop – but your safety comes first.' } },
      { ko: '횡단보도니까 그냥 건넌다', en: 'It\'s a crosswalk – just walk', ok: false, why: { ko: '오토바이가 못 볼 수도 있어요. 확인하고 건너세요.', en: 'The rider may not see you. Check first.' } },
    ],
  },
];
const LIGHT = { red: '#DC2626', green: '#16A34A', blink: '#16A34A', none: '#6B7280' };

/** Crosswalk: read pedestrian lights and countdowns, decide when it is safe to cross. */
export function CrosswalkSim({ step, ctx, onDone }: SimProps) {
  const ko = ctx.lang === 'ko';
  const L = (k: string, e: string) => (ko ? k : e);
  const sc = useScore(10);
  const [i, setI] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const done = i >= SCENES.length;
  const s = SCENES[Math.min(i, SCENES.length - 1)];

  const choose = (k: number) => {
    const o = s.opts[k];
    if (!o.ok) return sc.miss(ko ? o.why.ko : o.why.en);
    sc.ok(ko ? o.why.ko : o.why.en);
    setLog((l) => [...l, `${s.scene.en} → ${o.en}`]);
    setI((x) => x + 1);
  };

  return (
    <SimShell title={tr(step.title, ctx.lang)} stage={done ? 1 : 0} stages={[`${L('상황', 'Situation')} ${Math.min(i + 1, SCENES.length)}/${SCENES.length}`, L('결과', 'Result')]} fb={sc.fb}>
      <P>{tr(step.intro, ctx.lang)}</P>
      {!done && (
        <>
          <Box style={{ alignItems: 'center', gap: 8, backgroundColor: '#1F2937' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <View style={{ width: 70, height: 110, backgroundColor: '#111', borderRadius: 10, alignItems: 'center', justifyContent: 'space-around', padding: 6 }}>
                <Text style={{ fontSize: 30, opacity: s.light === 'red' ? 1 : 0.15 }}>🧍</Text>
                <Text style={{ fontSize: 30, opacity: s.light === 'green' || s.light === 'blink' ? 1 : 0.15 }}>🚶</Text>
              </View>
              {s.count !== undefined && (
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: LIGHT[s.light], fontSize: 44, fontWeight: '900' }}>{s.count}</Text>
                  <Text style={{ color: '#CBD5E1', fontSize: 11 }}>{s.light === 'blink' ? L('깜빡임', 'blinking') : L('남은 초', 'sec left')}</Text>
                </View>
              )}
              {s.light === 'none' && <Text style={{ color: '#CBD5E1', fontWeight: '800' }}>{L('신호등 없음', 'No lights')}</Text>}
            </View>
            <View style={{ flexDirection: 'row', gap: 2 }}>
              {Array.from({ length: s.lanes }).map((_, k) => (
                <View key={k} style={{ width: 16, height: 26, backgroundColor: '#374151', borderLeftWidth: 2, borderLeftColor: '#FDE68A' }} />
              ))}
            </View>
            <Text style={{ color: '#FFF', fontWeight: '800', textAlign: 'center' }}>{ko ? s.scene.ko : s.scene.en}</Text>
          </Box>
          <H size={15}>{L('어떻게 할까요?', 'What do you do?')}</H>
          {s.opts.map((o, k) => (
            <OptBtn key={o.en} testID={`cw-${k}`} label={ko ? o.ko : o.en} onPress={() => choose(k)} />
          ))}
        </>
      )}
      {done && <DoneCard title={L('안전하게 건넜어요', 'Crossed safely')} score={sc.final()} lang={ctx.lang} log={log} onContinue={() => onDone({ score: sc.final(), effects: { manner: 3 }, log })} />}
    </SimShell>
  );
}
