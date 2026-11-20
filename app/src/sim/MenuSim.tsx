import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { RESTAURANTS, mainPortions, orderTotal, tr } from '@kotoventure/shared';
import { H, P, won } from '../ui/kit';
import { C } from '../ui/theme';
import { Box, DoneCard, OptBtn, PARTY_SIZE, SimShell, useScore, type SimProps } from './kit';

type Stage = 'menu' | 'call' | 'meal' | 'pay' | 'done';

/** Restaurant: read a Korean menu board, order the right amount for your party, call staff, refills, pay at the counter. */
export function MenuSim({ step, ctx, onDone }: SimProps) {
  const ko = ctx.lang === 'ko';
  const L = (k: string, e: string) => (ko ? k : e);
  const r = RESTAURANTS[step.config?.restaurant ?? 'bbq'];
  const people = PARTY_SIZE[ctx.party];
  const kids = ctx.party === 'group';
  const sc = useScore(10);
  const [stage, setStage] = useState<Stage>('menu');
  const [order, setOrder] = useState<Record<string, number>>({});
  const [showEn, setShowEn] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const add = (s: string) => setLog((l) => [...l, s]);
  const total = orderTotal(r, order);

  const setQty = (id: string, d: number) => setOrder((o) => ({ ...o, [id]: Math.max(0, (o[id] ?? 0) + d) }));

  const submit = () => {
    const under = r.items.find((i) => i.min && (order[i.id] ?? 0) > 0 && (order[i.id] ?? 0) < i.min);
    if (under) return sc.miss(L(`"${under.ko}"는 ${under.min}인분 이상 주문해야 해요 (메뉴판의 "${under.min}인분 이상").`, `"${under.ko}" needs at least ${under.min} portions – the menu says "${under.min}인분 이상".`));
    const mains = mainPortions(r, order);
    if (mains < people)
      return sc.miss(L(`${people}명인데 주메뉴가 ${mains}인분이에요. 고깃집·식당은 보통 1인 1메뉴(1인분)로 시켜요.`, `You are ${people} but ordered ${mains} main portion(s). In Korea you usually order one portion per person.`));
    if (kids && !r.items.some((i) => i.main && (order[i.id] ?? 0) > 0 && !i.spicy))
      return sc.miss(L('아이들이 있어요 – 안 매운 메뉴도 하나 시키세요 (고추 표시 없는 메뉴).', 'The kids can\'t eat spicy food – add one non-spicy main (no chili mark).'));
    if (mains > people * 2) sc.info(L('음식이 너무 많아요… 남기면 아까워요. 그래도 주문할게요.', 'That\'s a lot of food… but OK!'));
    else sc.ok(L('주문 내용이 딱 좋아요!', 'Perfect order!'));
    add(`Ordered: ${r.items.filter((i) => order[i.id]).map((i) => `${i.en} ×${order[i.id]}`).join(', ')} – ${won(total)}`);
    setStage('call');
  };

  const call = (how: 'bell' | 'whistle' | 'wait') => {
    if (how === 'whistle') return sc.miss(L('휘파람이나 손가락 튕기기는 무례해요. 호출벨을 누르거나 "저기요!"라고 하세요.', 'Whistling or snapping feels rude. Press the call bell or say "Jeogiyo!"'));
    if (how === 'wait') return sc.miss(L('한국 식당은 부르기 전까지 잘 안 와요. 호출벨을 누르세요!', 'Staff won\'t come until you call. Press the bell!'));
    sc.ok(L('"띵동" – 직원이 바로 와서 주문을 받아요.', '"Ding-dong" – the staff come right away.'));
    add('Called the staff with the bell / "Jeogiyo!"');
    setStage('meal');
  };

  const refill = (how: 'free' | 'pay' | 'none') => {
    if (how === 'pay') return sc.miss(L('반찬은 무료로 더 줘요! 돈을 낼 필요 없어요.', 'Side dishes are refilled for free – no need to pay.'));
    if (how === 'none') return sc.miss(L('눈치 볼 필요 없어요. 반찬 리필은 무료이고 자연스러워요.', 'No need to be shy – free banchan refills are normal.'));
    sc.ok(r.selfBar ? L('셀프바에서 반찬을 가져왔어요 ("셀프" 표시).', 'You refill at the self-service bar ("셀프").') : L('"반찬 좀 더 주세요" – 무료로 더 줘요.', '"Banchan jom deo juseyo" – more for free.'));
    add('Refilled side dishes for free');
    setStage('pay');
  };

  const payAt = (how: 'counter' | 'table' | 'tip') => {
    if (how === 'tip') return sc.miss(L('한국은 팁 문화가 없어요. 놓고 가면 직원이 쫓아올 수도 있어요!', 'There is no tipping in Korea – staff may even run after you to return it!'));
    if (how === 'table' && r.payAt === 'counter') return sc.miss(L('대부분의 식당은 나갈 때 계산대(카운터)에서 계산해요. 테이블의 계산서를 들고 가세요.', 'Most Korean restaurants: take the bill from your table and pay at the counter by the exit.'));
    sc.ok(L('계산 완료! "잘 먹었습니다!"라고 인사하면 더 좋아요.', 'Paid! Say "Jal meogeosseumnida!" (I ate well) on the way out.'));
    add(`Paid ${won(total)} at the ${r.payAt}, no tip`);
    setStage('done');
  };

  const stageIdx = ['menu', 'call', 'meal', 'pay', 'done'].indexOf(stage);
  return (
    <SimShell title={tr(step.title, ctx.lang)} stage={stageIdx} stages={[L('메뉴', 'Menu'), L('주문', 'Order'), L('식사', 'Meal'), L('계산', 'Pay'), L('결과', 'Result')]} fb={sc.fb}>
      <P>{tr(step.intro, ctx.lang)}</P>

      {stage === 'menu' && (
        <>
          <Box style={{ backgroundColor: '#2B1A10', gap: 2 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: '#FDE68A', fontWeight: '900', fontSize: 17 }}>📜 {r.ko} 메뉴</Text>
              <Pressable testID="menu-en" onPress={() => setShowEn((v) => !v)} style={{ backgroundColor: '#FDE68A', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                <Text style={{ fontWeight: '900', fontSize: 11 }}>{showEn ? '한글만' : '📷 번역 앱'}</Text>
              </Pressable>
            </View>
            {r.items.map((i) => (
              <View key={i.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, borderTopWidth: 1, borderTopColor: '#5B3A22', paddingVertical: 5 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 15 }}>
                    {i.ko} {i.spicy ? '🌶️'.repeat(i.spicy) : ''}
                    {i.min ? <Text style={{ color: '#FCA5A5', fontSize: 11 }}> ({i.min}인분 이상)</Text> : null}
                  </Text>
                  {showEn && <Text style={{ color: '#FCD34D', fontSize: 11 }}>{i.en}</Text>}
                </View>
                <Text style={{ color: '#FDE68A', fontWeight: '900', width: 70, textAlign: 'right' }}>{won(i.price)}</Text>
                <Pressable testID={`m-minus-${i.id}`} onPress={() => setQty(i.id, -1)} style={btn}>
                  <Text style={btnT}>−</Text>
                </Pressable>
                <Text style={{ color: '#FFF', width: 18, textAlign: 'center', fontWeight: '900' }}>{order[i.id] ?? 0}</Text>
                <Pressable testID={`m-plus-${i.id}`} onPress={() => setQty(i.id, 1)} style={btn}>
                  <Text style={btnT}>+</Text>
                </Pressable>
              </View>
            ))}
            <Text style={{ color: '#FCA5A5', fontSize: 11, marginTop: 4 }}>* 가격은 1인분 기준 · {L('예시 가격', 'example prices')}</Text>
          </Box>
          <Box style={{ gap: 6 }}>
            <Text style={{ color: C.ink, fontWeight: '800' }}>
              👥 {L(`일행 ${people}명`, `${people} people`)}
              {kids ? L(' (아이 2명 포함 – 매운 것 못 먹어요)', ' (incl. 2 kids – no spicy food)') : ''}
            </Text>
            <Text style={{ color: C.ink, fontWeight: '900' }}>
              {L('합계', 'Total')} {won(total)} · {L('주메뉴', 'mains')} {mainPortions(r, order)}
              {L('인분', ' portions')}
            </Text>
            <OptBtn testID="m-order" label={L('이대로 주문하기', 'Place this order')} selected disabled={total === 0} onPress={submit} />
          </Box>
        </>
      )}

      {stage === 'call' && (
        <Box style={{ gap: 8 }}>
          <H size={15}>{L('주문하려고 해요. 직원을 어떻게 부를까요?', 'Ready to order. How do you get the staff?')}</H>
          <OptBtn testID="call-bell" label={L('🔔 테이블 호출벨을 누르거나 "저기요!"', '🔔 Press the table call bell or say "Jeogiyo!"')} onPress={() => call('bell')} />
          <OptBtn testID="call-wait" label={L('직원이 올 때까지 조용히 기다린다', 'Wait quietly until someone comes')} onPress={() => call('wait')} />
          <OptBtn testID="call-whistle" label={L('휘파람을 불거나 손가락을 튕긴다', 'Whistle or snap my fingers')} onPress={() => call('whistle')} />
        </Box>
      )}

      {stage === 'meal' && (
        <Box style={{ gap: 8 }}>
          <Text style={{ fontSize: 36, textAlign: 'center' }}>🥢🍚🥬🥩🍲</Text>
          <H size={15}>{L('반찬 그릇이 비었어요. 어떻게 할까요?', 'The side-dish bowls are empty. What now?')}</H>
          <OptBtn testID="refill-free" label={r.selfBar ? L('"셀프" 반찬 코너에서 더 가져온다', 'Get more from the "셀프" (self-service) bar') : L('"반찬 좀 더 주세요"라고 부탁한다', 'Ask "Banchan jom deo juseyo"')} onPress={() => refill('free')} />
          <OptBtn testID="refill-pay" label={L('추가 요금을 내고 반찬을 시킨다', 'Order extra side dishes and pay for them')} onPress={() => refill('pay')} />
          <OptBtn testID="refill-none" label={L('더 달라고 하면 실례니까 참는다', 'Don\'t ask – it would be rude')} onPress={() => refill('none')} />
        </Box>
      )}

      {stage === 'pay' && (
        <Box style={{ gap: 8 }}>
          <H size={15}>
            {L('다 먹었어요. 계산은?', 'All done. How do you pay?')} ({won(total)})
          </H>
          <OptBtn testID="pay-counter" label={L('계산서를 들고 출구 쪽 카운터에서 계산', 'Take the bill to the counter by the exit')} onPress={() => payAt('counter')} />
          <OptBtn testID="pay-table" label={L('테이블에 앉아 계산서를 가져다주길 기다린다', 'Wait at the table for the cheque')} onPress={() => payAt('table')} />
          <OptBtn testID="pay-tip" label={L('계산하고 테이블에 팁 10%를 두고 간다', 'Pay and leave a 10% tip on the table')} onPress={() => payAt('tip')} />
        </Box>
      )}

      {stage === 'done' && (
        <DoneCard title={L('맛있게 먹었어요!', 'Great meal!')} score={sc.final()} lang={ctx.lang} log={log} onContinue={() => onDone({ score: sc.final(), effects: { money: -total, energy: 15 }, log })} />
      )}
    </SimShell>
  );
}

const btn = { width: 30, height: 30, borderRadius: 15, backgroundColor: '#FDE68A', alignItems: 'center' as const, justifyContent: 'center' as const };
const btnT = { fontSize: 17, fontWeight: '900' as const, color: '#3B1D0F' };
