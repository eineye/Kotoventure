import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '../ui/Text';
import { CUISINES, RESTAURANTS, mainPortions, mainsNeeded, orderTotal, tr, type RefillKind } from '@kotoventure/shared';
import { H, P, PhotoLink, won } from '../ui/kit';
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
  const cuisine = CUISINES[r.kind ?? 'korean'];
  const rf = REFILL[cuisine.refill];

  const setQty = (id: string, d: number) => setOrder((o) => ({ ...o, [id]: Math.max(0, (o[id] ?? 0) + d) }));

  const submit = () => {
    const under = r.items.find((i) => i.min && (order[i.id] ?? 0) > 0 && (order[i.id] ?? 0) < i.min);
    if (under) return sc.miss(L(`"${under.ko}"는 ${under.min}인분 이상 주문해야 해요 (메뉴판의 "${under.min}인분 이상").`, `"${under.ko}" needs at least ${under.min} portions – the menu says "${under.min}인분 이상".`));
    const mains = mainPortions(r, order);
    const need = mainsNeeded(r, people);
    if (mains < need)
      return need < people
        ? sc.miss(L(`${people}명이면 주메뉴를 ${need}개 이상 시켜요. 보통 2명당 하나(치킨 한 마리·안주 하나)예요.`, `For ${people} people order at least ${need} mains – about one for every two people.`))
        : sc.miss(L(`${people}명인데 주메뉴가 ${mains}인분이에요. 보통 1인 1메뉴(1인분)로 시켜요.`, `You are ${people} but ordered ${mains} main portion(s). In Korea you usually order one portion per person.`));
    if (kids && !r.items.some((i) => i.main && (order[i.id] ?? 0) > 0 && !i.spicy))
      return sc.miss(L('아이들이 있어요 – 안 매운 메뉴도 하나 시키세요 (고추 표시 없는 메뉴).', 'The kids can\'t eat spicy food – add one non-spicy main (no chili mark).'));
    if (mains > need * 2) sc.info(L('음식이 너무 많아요… 남기면 아까워요. 그래도 주문할게요.', 'That\'s a lot of food… but OK!'));
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
    if (how === 'pay') return sc.miss(L(rf.payKo, rf.payEn));
    if (how === 'none') return sc.miss(L(rf.noneKo, rf.noneEn));
    sc.ok(r.selfBar ? L('셀프바에서 반찬을 가져왔어요 ("셀프" 표시).', 'You refill at the self-service bar ("셀프").') : L(rf.okKo, rf.okEn));
    add(rf.log);
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
              <Text style={{ color: '#FDE68A', fontWeight: '900', fontSize: 17, flex: 1 }}>📜 {r.ko} 메뉴</Text>
              <Pressable testID="menu-en" onPress={() => setShowEn((v) => !v)} style={{ backgroundColor: '#FDE68A', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                <Text style={{ fontWeight: '900', fontSize: 11 }}>{showEn ? L('한글만 보기', 'Korean only') : L('📷 번역 앱', '📷 Translate app')}</Text>
              </Pressable>
            </View>
            <Text testID="menu-kind" style={{ color: '#FCD34D', fontSize: 12, fontWeight: '800' }}>
              {cuisine.icon} {ko ? cuisine.ko : `${cuisine.en} · ${cuisine.ko}`}
            </Text>
            {r.items.map((i) => (
              <View key={i.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, borderTopWidth: 1, borderTopColor: '#5B3A22', paddingVertical: 5 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 15 }}>
                    {i.cat !== 'main' ? <Text style={{ color: '#FCD34D', fontSize: 11 }}>{i.cat === 'drink' ? '🥤 ' : '➕ '}</Text> : null}
                    {i.ko} {i.spicy ? '🌶️'.repeat(i.spicy) : ''}
                    {i.min ? <Text style={{ color: '#FCA5A5', fontSize: 11 }}> ({i.min}인분 이상)</Text> : null}
                  </Text>
                  {showEn && <Text style={{ color: '#FCD34D', fontSize: 11 }}>{i.en}</Text>}
                </View>
                <PhotoLink small q={{ ko: i.ko, en: i.en }} lang={ctx.lang} testID={`m-photo-${i.id}`} />
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
            <Text style={{ color: '#FCA5A5', fontSize: 11, marginTop: 4 }}>{L('* 가격은 1인분 기준 · 예시 가격', '* Prices per portion · example prices')}</Text>
          </Box>
          <Box style={{ gap: 6 }}>
            <Text style={{ color: C.ink, fontWeight: '800' }}>
              👥 {L(`일행 ${people}명`, `${people} ${people === 1 ? 'person' : 'people'}`)}
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
          <Text style={{ fontSize: 36, textAlign: 'center' }}>{rf.icons}</Text>
          <H size={15}>{L(rf.qKo, rf.qEn)}</H>
          <OptBtn testID="refill-free" label={r.selfBar ? L('"셀프" 반찬 코너에서 더 가져온다', 'Get more from the "셀프" (self-service) bar') : L(rf.freeKo, rf.freeEn)} onPress={() => refill('free')} />
          <OptBtn testID="refill-pay" label={L(rf.payOptKo, rf.payOptEn)} onPress={() => refill('pay')} />
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

/** What is refilled for free depends on the kind of restaurant. */
const REFILL: Record<RefillKind, { icons: string; qKo: string; qEn: string; freeKo: string; freeEn: string; payOptKo: string; payOptEn: string; okKo: string; okEn: string; payKo: string; payEn: string; noneKo: string; noneEn: string; log: string }> = {
  banchan: {
    icons: '🥢🍚🥬🥩🍲', qKo: '반찬 그릇이 비었어요. 어떻게 할까요?', qEn: 'The side-dish bowls are empty. What now?',
    freeKo: '"반찬 좀 더 주세요"라고 부탁한다', freeEn: 'Ask "Banchan jom deo juseyo"', payOptKo: '추가 요금을 내고 반찬을 시킨다', payOptEn: 'Order extra side dishes and pay for them',
    okKo: '"반찬 좀 더 주세요" – 무료로 더 줘요.', okEn: '"Banchan jom deo juseyo" – more for free.',
    payKo: '반찬은 무료로 더 줘요! 돈을 낼 필요 없어요.', payEn: 'Side dishes are refilled for free – no need to pay.',
    noneKo: '눈치 볼 필요 없어요. 반찬 리필은 무료이고 자연스러워요.', noneEn: 'No need to be shy – free banchan refills are normal.', log: 'Refilled side dishes for free',
  },
  danmuji: {
    icons: '🥢🟡🧅🥟', qKo: '단무지와 양파 접시가 비었어요. 어떻게 할까요?', qEn: 'The yellow pickled radish (danmuji) and onion plate is empty. What now?',
    freeKo: '"단무지 좀 더 주세요"라고 부탁한다 (셀프면 직접)', freeEn: 'Ask "Danmuji jom deo juseyo" (or help yourself if it says 셀프)', payOptKo: '단무지를 메뉴에서 따로 주문한다', payOptEn: 'Order danmuji separately from the menu',
    okKo: '단무지·양파·춘장은 무료로 더 줘요.', okEn: 'Danmuji, onion and black-bean paste are refilled for free.',
    payKo: '단무지는 무료예요! 따로 주문할 필요 없어요.', payEn: 'Danmuji is free – no need to order it.',
    noneKo: '단무지 리필은 무료이고 아주 흔한 부탁이에요.', noneEn: 'Asking for more danmuji is free and very normal.', log: 'Got free danmuji refills',
  },
  pickle: {
    icons: '🍝🥒🍕💧', qKo: '테이블의 피클 접시가 비었어요. 어떻게 할까요?', qEn: 'The little pickle dish on the table is empty. What now?',
    freeKo: '"피클 더 주세요"라고 부탁한다', freeEn: 'Ask "Pikeul deo juseyo" (more pickles, please)', payOptKo: '피클을 추가 메뉴로 따로 주문한다', payOptEn: 'Order pickles as an extra and pay for them',
    okKo: '한국 양식·퓨전 식당은 오이 피클을 무료로 더 줘요. 물은 보통 셀프예요.', okEn: 'Korean Western & fusion restaurants refill cucumber pickles for free. Water is usually self-service.',
    payKo: '피클은 무료예요! 한국 양식당에서는 기본으로 나와요.', payEn: 'Pickles are free – they come with the meal in Korean Western restaurants.',
    noneKo: '피클 리필은 무료이고 자연스러운 부탁이에요.', noneEn: 'Asking for more pickles is free and normal.', log: 'Got free pickle refills',
  },
  radish: {
    icons: '🍗🍺⬜🥤', qKo: '치킨무가 다 떨어졌어요. 어떻게 할까요?', qEn: 'The cubes of pickled radish (chicken-mu) are gone. What now?',
    freeKo: '"치킨무 좀 더 주세요"라고 부탁한다', freeEn: 'Ask "Chikin-mu jom deo juseyo"', payOptKo: '치킨무를 추가 요금 내고 산다', payOptEn: 'Buy an extra pickled radish',
    okKo: '매장에서는 치킨무를 무료로 더 줘요.', okEn: 'In the restaurant, chicken-mu is refilled for free.',
    payKo: '매장에서 먹으면 치킨무는 무료로 더 줘요!', payEn: 'When you eat in, chicken-mu is refilled for free.',
    noneKo: '치킨무 리필은 무료예요. 편하게 부탁하세요.', noneEn: 'Chicken-mu refills are free – just ask.', log: 'Got free chicken-mu refills',
  },
  water: {
    icons: '💧🥤🍢', qKo: '목이 말라요. 물은 어떻게 할까요?', qEn: 'You are thirsty. How do you get water?',
    freeKo: '정수기·물통에서 무료로 물을 받아 마신다 ("셀프")', freeEn: 'Take free water from the water dispenser ("셀프")', payOptKo: '물을 꼭 사서 마셔야 한다', payOptEn: 'Water must be bought',
    okKo: '대부분 정수기 물은 무료이고 셀프예요.', okEn: 'Water from the dispenser is free and self-service almost everywhere.',
    payKo: '정수기 물은 무료예요. 생수병을 원할 때만 사요.', payEn: 'Dispenser water is free – buy a bottle only if you want one.',
    noneKo: '물은 무료이고 셀프예요. 참지 마세요!', noneEn: 'Water is free and self-service – no need to go thirsty!', log: 'Took free self-service water',
  },
};

const btn = { width: 30, height: 30, borderRadius: 15, backgroundColor: '#FDE68A', alignItems: 'center' as const, justifyContent: 'center' as const };
const btnT = { fontSize: 17, fontWeight: '900' as const, color: '#3B1D0F' };
