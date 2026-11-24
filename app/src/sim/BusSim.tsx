import { useState } from 'react';
import { View } from 'react-native';
import { Text } from '../ui/Text';
import { BUS_COLORS, BUS_FARE, tr, type BusColor } from '@kotoventure/shared';
import { TmoneyCard } from '../art/TmoneyCard';
import { H, P, won } from '../ui/kit';
import { C } from '../ui/theme';
import { Box, DoneCard, OptBtn, PARTY_SIZE, SimShell, Slot, WalletBar, useScore, type SimProps } from './kit';

type Stage = 'stop' | 'board' | 'ride' | 'exit' | 'done';

/** City bus: find your bus at the stop, board at the front and tap, ring the bell, tap again when getting off. */
export function BusSim({ step, ctx, onDone }: SimProps) {
  const ko = ctx.lang === 'ko';
  const L = (k: string, e: string) => (ko ? k : e);
  const cfg = step.config ?? {};
  const busNo = cfg.busNo ?? '01A';
  const color = (cfg.busColor ?? 'yellow') as BusColor;
  const stops = cfg.stops ?? ['Stop A', 'Stop B', 'Stop C'];
  const target = cfg.getOff ?? stops[stops.length - 1];
  const people = PARTY_SIZE[ctx.party];
  const sc = useScore(10);
  const [stage, setStage] = useState<Stage>('stop');
  const [door, setDoor] = useState<'front' | 'back' | null>(null);
  const [held, setHeld] = useState<string | null>(null);
  const [paidAll, setPaidAll] = useState(people === 1);
  const [pos, setPos] = useState(0); // index of the stop the bus just left
  const [bell, setBell] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [missedStop, setMissedStop] = useState(false);
  const add = (s: string) => setLog((l) => [...l, s]);

  const arrivals = [
    { no: busNo, color, min: 3 },
    { no: '402', color: 'blue' as BusColor, min: 1 },
    { no: '7016', color: 'green' as BusColor, min: 6 },
    { no: '9401', color: 'red' as BusColor, min: 9 },
  ].filter((b, i, a) => a.findIndex((x) => x.no === b.no) === i);
  // stable, non-sorted order so the right bus isn't always on top
  const board = [arrivals[1], arrivals[0], ...arrivals.slice(2)].filter(Boolean);

  const pickBus = (no: string) => {
    if (no !== busNo) return sc.miss(L(`${no}번은 다른 곳으로 가요. 정류장 노선도에서 번호를 확인하세요.`, `Bus ${no} goes elsewhere – check the route number on the stop map.`));
    sc.ok(L(`${busNo}번 버스 도착! 앞문으로 타세요.`, `Bus ${busNo} is here! Board at the front door.`));
    add(`Found bus ${busNo} on the arrival board`);
    setStage('board');
  };

  const pickDoor = (d: 'front' | 'back') => {
    if (d === 'back') return sc.miss(L('뒷문은 내리는 문이에요. 앞문으로 타고 기사님 옆 단말기에 카드를 대세요.', 'The back door is for getting off. Board at the FRONT and tap the reader next to the driver.'));
    setDoor('front');
    sc.ok(L('앞문으로 탔어요. 이제 카드를 단말기에 대세요.', 'You board at the front. Now tap your card on the reader.'));
  };

  const tapIn = () => {
    if (door !== 'front') return sc.info(L('먼저 앞문으로 타세요.', 'Board at the front door first.'));
    if (held !== 'tmoney') return sc.miss(L('교통카드(T머니)를 고른 다음 단말기를 누르세요. 현금 승차는 점점 사라지고 있어요.', 'Pick your T-money card, then tap the reader. Paying cash on buses is being phased out.'));
    if (!paidAll) return sc.info(L('일행이 있어요 – 먼저 결제 방법을 고르세요.', 'You have companions – choose how to pay first.'));
    setHeld(null);
    sc.ok(L('"삑! 승차입니다." 손잡이를 꼭 잡으세요 – 버스가 바로 출발해요.', '"Beep! Boarding." Hold the handrail – Korean buses pull away quickly.'));
    add(`Tapped in (${won(BUS_FARE)} × ${people})`);
    setStage('ride');
  };

  const nextStop = () => {
    const np = pos + 1;
    if (stops[np] === target && !bell) {
      // passed the stop without ringing
      setMissedStop(true);
      sc.miss(L(`${target}에서 아무도 벨을 누르지 않아 버스가 그냥 지나갔어요! 다음 정류장에서 내려 걸어가요.`, `Nobody rang the bell, so the bus skipped ${target}! You get off at the next stop and walk back.`));
      add('Missed the stop – rang too late');
      setPos(Math.min(np + 1, stops.length - 1));
      setStage('exit');
      return;
    }
    if (stops[np] === target && bell) {
      sc.ok(L(`${target} 도착. 뒷문으로 내리세요.`, `Arriving at ${target}. Get off at the back door.`));
      setPos(np);
      setStage('exit');
      return;
    }
    setPos(np);
    sc.clear();
  };

  const ring = () => {
    if (bell) return;
    if (stops[pos + 1] !== target) return sc.miss(L(`아직이에요! 다음 정류장은 ${stops[pos + 1]}. 내릴 정류장 바로 전에 벨을 누르세요.`, `Too early! Next stop is ${stops[pos + 1]}. Ring just before YOUR stop.`));
    setBell(true);
    sc.ok(L('"띵동!" 하차벨 불이 켜졌어요. 버스가 서면 일어나세요.', '"Ding!" The STOP light is on. Stand up only when the bus has stopped.'));
    add('Rang the bell before the stop');
  };

  const tapOut = (doIt: boolean) => {
    if (doIt) {
      if (held !== 'tmoney') return sc.info(L('지갑에서 T머니를 고른 다음 뒷문 단말기를 누르세요.', 'Pick T-money from your wallet, then tap the back-door reader.'));
      sc.ok(L('"삑! 하차입니다." 30분 안에 환승하면 할인돼요.', '"Beep! Getting off." Transfer within 30 minutes and the next ride is (almost) free.'));
      add('Tapped out at the back door (transfer discount kept)');
    } else {
      sc.miss(L('내릴 때 안 찍으면 환승 할인을 못 받고, 다음 탑승 때 추가 요금이 붙을 수 있어요.', 'If you don\'t tap out you lose the transfer discount – and may pay a penalty on the next ride.'));
      add('Did not tap out – lost the transfer discount');
    }
    setHeld(null);
    setStage('done');
  };

  const stagesL = [L('정류장', 'Stop'), L('승차', 'Board'), L('하차벨', 'Bell'), L('하차', 'Get off'), L('결과', 'Result')];
  const stageIdx = ['stop', 'board', 'ride', 'exit', 'done'].indexOf(stage);
  const B = BUS_COLORS[color];

  return (
    <SimShell title={tr(step.title, ctx.lang)} stage={stageIdx} stages={stagesL} fb={sc.fb}>
      <P>{tr(step.intro, ctx.lang)}</P>

      {stage === 'stop' && (
        <>
          <Box style={{ backgroundColor: '#0F172A', gap: 6 }}>
            <Text style={{ color: '#FDE68A', fontWeight: '900' }}>🚏 {L('버스 도착 안내', 'Bus arrivals')} · {stops[0]}</Text>
            {board.map((b) => (
              <View key={b.no} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, borderTopWidth: 1, borderTopColor: '#334155', paddingTop: 6 }}>
                <View style={{ backgroundColor: BUS_COLORS[b.color].hex, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, minWidth: 54, alignItems: 'center' }}>
                  <Text style={{ color: b.color === 'yellow' ? '#111' : '#FFF', fontWeight: '900' }}>{b.no}</Text>
                </View>
                <Text style={{ color: '#CBD5E1', fontSize: 11, flex: 1 }}>{BUS_COLORS[b.color].ko} · {BUS_COLORS[b.color].en}</Text>
                <Text style={{ color: '#4ADE80', fontWeight: '900' }}>{b.min}{L('분 후', ' min')}</Text>
              </View>
            ))}
          </Box>
          <H size={15}>
            {L(`목적지: ${target} – 어떤 버스를 탈까요?`, `Destination: ${target} – which bus do you take?`)}
          </H>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {board.map((b) => (
              <OptBtn key={b.no} testID={`bus-${b.no}`} label={b.no} sub={BUS_COLORS[b.color].ko} color={BUS_COLORS[b.color].hex} onPress={() => pickBus(b.no)} style={{ width: 90 }} />
            ))}
          </View>
          <P dim style={{ fontSize: 12 }}>
            💡 {L(`노선도(정류장 표지판)에 ${busNo}번이 ${target}에 선다고 적혀 있어요. 버스 색은 노선 종류를 알려줘요.`, `The stop sign map shows bus ${busNo} stops at ${target}. Bus colours tell you the route type.`)}
          </P>
        </>
      )}

      {stage === 'board' && (
        <>
          <Box style={{ alignItems: 'center', gap: 8, backgroundColor: B.hex + '22' }}>
            <View style={{ backgroundColor: B.hex, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 18, flexDirection: 'row', gap: 16, alignItems: 'center' }}>
              <OptBtn testID="door-front" label={L('🚪 앞문 (승차)', '🚪 Front door')} selected={door === 'front'} onPress={() => pickDoor('front')} color="#111827" />
              <Text style={{ color: color === 'yellow' ? '#111' : '#FFF', fontWeight: '900', fontSize: 22 }}>{busNo}</Text>
              <OptBtn testID="door-back" label={L('🚪 뒷문', '🚪 Back door')} onPress={() => pickDoor('back')} color="#111827" />
            </View>
          </Box>
          {people > 1 && !paidAll && door === 'front' && (
            <Box style={{ gap: 6 }}>
              <H size={15}>{L(`일행 ${people}명. 어떻게 결제할까요?`, `You are ${people} people. How do you pay?`)}</H>
              <OptBtn testID="pay-each" label={L('각자 자기 교통카드를 찍는다', 'Everyone taps their own card')} onPress={() => { setPaidAll(true); sc.ok(L('좋아요. 한 사람씩 차례로 찍어요.', 'Good – one by one, each person taps.')); add('Everyone tapped their own card'); }} />
              <OptBtn testID="pay-tell" label={L(`기사님께 "${people}명이요" 말하고 한 카드로 찍는다`, `Tell the driver "${people} people" ("${people}-myeong-iyo"), then tap one card`)} onPress={() => { setPaidAll(true); sc.ok(L('정답! 다인승 결제는 먼저 기사님께 인원을 말해요.', 'Right! For a group payment, tell the driver the number first.')); add('Group payment: told the driver the number'); }} />
              <OptBtn testID="pay-once" label={L('한 번만 찍고 모두 탄다', 'Tap once and everybody walks in')} onPress={() => sc.miss(L('한 번 찍으면 1명 요금만 결제돼요. 무임승차가 돼요!', 'One tap pays for ONE person – the others would be riding without a ticket!'))} />
            </Box>
          )}
          <Box style={{ alignItems: 'center', gap: 8, backgroundColor: '#1F2937' }}>
            <Text style={{ color: '#FDE68A', fontWeight: '900', fontSize: 12 }}>{L('승차 단말기', 'Card reader (boarding)')}</Text>
            <Slot testID="reader-in" label={L('여기에 카드를 대세요', 'Tap card here')} width={120} height={60} blink={held === 'tmoney'} color="#0EA5E9" onPress={tapIn} />
          </Box>
        </>
      )}

      {stage === 'ride' && (
        <>
          <Box style={{ backgroundColor: '#111827', gap: 6 }}>
            <Text style={{ color: '#F87171', fontWeight: '900', fontSize: 12 }}>
              {L('이번 정류장', 'This stop')} ▸ <Text style={{ color: '#FFF' }}>{stops[pos]}</Text>
            </Text>
            <Text style={{ color: '#FBBF24', fontWeight: '900', fontSize: 18 }}>
              {L('다음 정류장', 'Next stop')} ▸ {stops[pos + 1] ?? '—'}
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
              {stops.map((s, i) => (
                <Text key={s} style={{ color: i <= pos ? '#64748B' : s === target ? '#4ADE80' : '#CBD5E1', fontSize: 11, fontWeight: '800' }}>
                  {i > 0 ? '› ' : ''}
                  {s}
                </Text>
              ))}
            </View>
          </Box>
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            <OptBtn testID="bus-bell" label={bell ? L('🔴 하차벨 켜짐', '🔴 STOP') : L('🔔 하차벨', '🔔 Stop bell')} selected={bell} color="#DC2626" onPress={ring} style={{ flex: 1, minHeight: 60 }} />
            <OptBtn testID="bus-next" label={L('버스 계속 가기 ▶', 'Ride on ▶')} onPress={nextStop} style={{ flex: 1, minHeight: 60 }} />
          </View>
          <P dim style={{ fontSize: 12 }}>💡 {L('안내 방송과 화면의 "다음 정류장"이 내릴 곳이면 벨을 누르세요. 벨을 안 누르면 서지 않을 수 있어요.', 'When "Next stop" is yours, press the bell. If nobody rings, the bus may not stop.')}</P>
        </>
      )}

      {stage === 'exit' && (
        <>
          <Box style={{ gap: 6 }}>
            <H size={15}>{missedStop ? L(`${stops[pos]}에서 내려요`, `Getting off at ${stops[pos]}`) : L(`${target}에서 내려요`, `Getting off at ${target}`)}</H>
            <P>{L('뒷문 옆에도 단말기가 있어요. 어떻게 할까요?', 'There is a card reader at the back door too. What do you do?')}</P>
          </Box>
          <Box style={{ alignItems: 'center', gap: 8, backgroundColor: '#1F2937' }}>
            <Text style={{ color: '#FDE68A', fontWeight: '900', fontSize: 12 }}>{L('하차 단말기', 'Card reader (getting off)')}</Text>
            <Slot testID="reader-out" label={L('내릴 때 카드를 대세요', 'Tap when getting off')} width={120} height={60} blink={held === 'tmoney'} color="#F97316" onPress={() => tapOut(true)} />
          </Box>
          <OptBtn testID="no-tap" label={L('그냥 내린다 (요금은 이미 냈으니까)', 'Just get off – I already paid')} color={C.inkSoft} onPress={() => tapOut(false)} />
        </>
      )}

      {stage !== 'stop' && stage !== 'ride' && stage !== 'done' && (
        <>
          <View style={{ alignItems: 'center' }}>
            <TmoneyCard width={150} />
          </View>
          <WalletBar
            title={L('지갑 – 카드를 고른 뒤 단말기를 누르세요', 'Wallet – pick a card, then tap the reader')}
            items={[
              { id: 'tmoney', label: 'T-money', icon: '🟧' },
              { id: 'cash', label: L('현금', 'Cash'), icon: '💵' },
              { id: 'passport', label: L('여권', 'Passport'), icon: '🛂' },
            ]}
            selected={held}
            onSelect={(id) => {
              setHeld(id);
              if (id === 'passport') sc.info(L('여권은 버스 요금 결제에 쓰지 않아요.', 'Your passport doesn\'t pay the fare.'));
            }}
          />
        </>
      )}

      {stage === 'done' && (
        <DoneCard
          title={L('버스 타기 완료', 'Bus ride done')}
          score={sc.final()}
          lang={ctx.lang}
          log={log}
          onContinue={() => onDone({ score: sc.final(), effects: { money: -BUS_FARE * people, energy: missedStop ? -6 : 0 }, log })}
        />
      )}
    </SimShell>
  );
}
