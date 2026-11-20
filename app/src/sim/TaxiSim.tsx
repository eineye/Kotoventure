import { useState } from 'react';
import { Text, View } from 'react-native';
import { TAXI_NIGHT_SURCHARGE, tr } from '@kotoventure/shared';
import { H, P, won } from '../ui/kit';
import { C, R } from '../ui/theme';
import { Box, DoneCard, OptBtn, SimShell, useScore, type SimProps } from './kit';

type Stage = 'search' | 'type' | 'car' | 'ride' | 'done';

/** Taxi-hailing app: pick the exact destination (Korean address), the ride type, find your car by plate, buckle up, auto-pay. */
export function TaxiSim({ step, ctx, onDone }: SimProps) {
  const ko = ctx.lang === 'ko';
  const L = (k: string, e: string) => (ko ? k : e);
  const cfg = step.config ?? {};
  const dest = cfg.dest ?? '명동 호텔';
  const addr = cfg.addr ?? '서울 중구 명동길 00';
  const night = !!cfg.night;
  const base = cfg.fare ?? 10000;
  const fare = Math.round((night ? base * (1 + TAXI_NIGHT_SURCHARGE) : base) / 100) * 100;
  const plate = '32바 4817';
  const sc = useScore(10);
  const [stage, setStage] = useState<Stage>('search');
  const [rideType, setRideType] = useState<'normal' | 'black' | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const add = (s: string) => setLog((l) => [...l, s]);
  const cityPrefix = addr.split(' ')[0];
  const results = [
    { name: `${dest} 2호점`, addr: `경기 수원시 팔달구 ${addr.split(' ').slice(-1)[0]}` },
    { name: dest, addr },
    { name: `${dest} (폐업)`, addr: `${cityPrefix} 강서구 공항대로 00` },
  ];

  const pickDest = (i: number) => {
    if (results[i].addr !== addr) return sc.miss(L('이름은 비슷하지만 주소가 달라요! 예약 확인서의 한글 주소와 비교하세요.', 'Similar name, different address! Compare with the Korean address on your booking.'));
    sc.ok(L('목적지 설정 완료. 이제 택시 종류를 고르세요.', 'Destination set. Now choose the ride type.'));
    add(`Set destination by its Korean address: ${addr}`);
    setStage('type');
  };
  const pickType = (t: 'normal' | 'black' | 'flag') => {
    if (t === 'flag') return sc.miss(L('밤에 길에서 "따블!" 외치며 웃돈 주는 건 불법 요금이에요. 앱 미터 요금을 쓰세요.', 'Offering double fare on the street is an illegal deal – use the metered app taxi.'));
    if (t === 'black') sc.info(L('모범·블랙은 더 비싸요(약 1.5~2배). 그래도 괜찮아요.', 'Deluxe/black taxis cost ~1.5–2× more. Fine, but pricier.'));
    else sc.ok(L(night ? '일반 택시 호출! 22시~04시는 심야 할증이 붙어요.' : '일반 택시 호출!', night ? 'Regular taxi called! 22:00–04:00 there is a late-night surcharge.' : 'Regular taxi called!'));
    setRideType(t);
    add(`Called a ${t === 'black' ? 'deluxe' : 'regular'} taxi${night ? ' (late-night surcharge)' : ''}`);
    setStage('car');
  };
  const pickCar = (p: string) => {
    if (p !== plate) return sc.miss(L('번호판이 달라요. 앱에 뜬 차량 번호와 같은 차에만 타세요.', 'Wrong plate. Only get into the car whose number matches the app.'));
    sc.ok(L('번호판 확인! 탑승했어요.', 'Plate matches – you get in.'));
    add('Checked the plate number before getting in');
    setStage('ride');
  };
  const buckle = (yes: boolean) => {
    if (!yes) return sc.miss(L('뒷좌석도 안전띠가 의무예요. 꼭 매세요!', 'Seat belts are mandatory in the back seat too!'));
    sc.ok(L('도착! 앱에 등록한 카드로 자동 결제됐어요. 팁은 없어요.', 'Arrived! The app charged your card automatically. No tip needed.'));
    add('Buckled up in the back seat; paid in the app, no tip');
    setStage('done');
  };

  const total = rideType === 'black' ? Math.round(fare * 1.7 / 100) * 100 : fare;
  const stageIdx = ['search', 'type', 'car', 'ride', 'done'].indexOf(stage);
  return (
    <SimShell title={tr(step.title, ctx.lang)} stage={stageIdx} stages={[L('목적지', 'Destination'), L('호출', 'Call'), L('차량 확인', 'Find car'), L('탑승', 'Ride'), L('결과', 'Result')]} fb={sc.fb}>
      <P>{tr(step.intro, ctx.lang)}</P>
      <Box style={{ backgroundColor: '#FEF08A', gap: 6, borderRadius: R.l }}>
        <Text style={{ fontWeight: '900', color: '#111' }}>🚕 Taxi app · {night ? '🌙 00:30' : '☀️ 15:00'}</Text>
        {stage === 'search' && (
          <>
            <View style={{ backgroundColor: '#FFF', borderRadius: 10, padding: 8 }}>
              <Text style={{ color: '#111', fontWeight: '800' }}>🔍 {dest}</Text>
            </View>
            {results.map((r, i) => (
              <OptBtn key={r.name} testID={`dest-${i}`} label={r.name} sub={r.addr} color="#111" onPress={() => pickDest(i)} />
            ))}
          </>
        )}
        {stage === 'type' && (
          <>
            <Text style={{ color: '#111' }}>📍 {addr}</Text>
            <OptBtn testID="ride-normal" label={L(`일반 택시 · 예상 ${won(fare)}`, `Regular taxi · est. ${won(fare)}`)} color="#111" onPress={() => pickType('normal')} />
            <OptBtn testID="ride-black" label={L(`블랙(모범) · 예상 ${won(Math.round(fare * 1.7 / 100) * 100)}`, `Deluxe (black) · est. ${won(Math.round(fare * 1.7 / 100) * 100)}`)} color="#111" onPress={() => pickType('black')} />
            <OptBtn testID="ride-flag" label={L('앱 끄고 길에서 "따블!" (요금 2배 제시)', 'Close the app and shout "double fare!" on the street')} color="#991B1B" onPress={() => pickType('flag')} />
          </>
        )}
        {(stage === 'car' || stage === 'ride') && (
          <View style={{ backgroundColor: '#FFF', borderRadius: 10, padding: 8 }}>
            <Text style={{ color: '#111', fontWeight: '900' }}>{L('배차 완료', 'Driver assigned')} · 3{L('분', ' min')}</Text>
            <Text style={{ color: '#111', fontSize: 20, fontWeight: '900' }}>🚖 {plate}</Text>
            <Text style={{ color: '#555', fontSize: 12 }}>{L('흰색 쏘나타', 'White sedan')}</Text>
          </View>
        )}
      </Box>
      {stage === 'car' && (
        <Box style={{ gap: 8 }}>
          <H size={15}>{L('택시 3대가 섰어요. 어느 차?', 'Three taxis pull up. Which is yours?')}</H>
          {['32바 4871', plate, '23바 4817'].map((p) => (
            <OptBtn key={p} testID={`car-${p.replace(/\s/g, '')}`} label={`🚖 ${p}`} onPress={() => pickCar(p)} />
          ))}
        </Box>
      )}
      {stage === 'ride' && (
        <Box style={{ gap: 8 }}>
          <H size={15}>{L('뒷좌석에 앉았어요.', 'You sit in the back seat.')}</H>
          <OptBtn testID="belt-yes" label={L('안전띠를 맨다', 'Fasten the seat belt')} onPress={() => buckle(true)} />
          <OptBtn testID="belt-no" label={L('뒷자리니까 괜찮아', 'It\'s the back seat – no need')} onPress={() => buckle(false)} />
        </Box>
      )}
      {stage === 'done' && (
        <DoneCard title={L('택시 도착', 'Arrived by taxi')} score={sc.final()} lang={ctx.lang} log={[...log, `Fare ${won(total)}`]} onContinue={() => onDone({ score: sc.final(), effects: { money: -total }, log })} />
      )}
      {stage !== 'done' && <P dim style={{ fontSize: 12, color: C.inkSoft }}>💡 {L('카카오T·우티(Uber) 등 앱은 외국 카드 등록이 가능해요.', 'Apps like Kakao T or Uber accept many foreign cards.')}</P>}
    </SimShell>
  );
}
