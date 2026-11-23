import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '../ui/Text';
import { BAG_SIZE, LOCKERS, tr, type LockerSize } from '@kotoventure/shared';
import { H, P, won } from '../ui/kit';
import { C } from '../ui/theme';
import { Box, DoneCard, Glass, Metal, OptBtn, SimShell, useScore, type SimProps } from './kit';

type Stage = 'size' | 'menu' | 'pay' | 'pin' | 'later' | 'done';
const PIN = '4827';
const BAG_LABEL = { backpack: { ko: '배낭', en: 'backpack' }, carryon: { ko: '기내용 캐리어', en: 'carry-on suitcase' }, large: { ko: '큰 캐리어 (28인치)', en: 'large suitcase (28")' } };

/** Station storage locker: choose the size, store and pay, keep the PIN, come back and open it. */
export function LockerSim({ step, ctx, onDone }: SimProps) {
  const ko = ctx.lang === 'ko';
  const L = (k: string, e: string) => (ko ? k : e);
  const bag = step.config?.bag ?? 'carryon';
  const need = BAG_SIZE[bag];
  const sc = useScore(10);
  const [stage, setStage] = useState<Stage>('size');
  const [size, setSize] = useState<LockerSize | null>(null);
  const [typed, setTyped] = useState('');
  const [log, setLog] = useState<string[]>([]);
  const add = (s: string) => setLog((l) => [...l, s]);

  const pickSize = (s: LockerSize) => {
    const order = ['S', 'M', 'L'];
    if (order.indexOf(s) < order.indexOf(need)) return sc.miss(L(`${LOCKERS[s].ko} 보관함에는 ${BAG_LABEL[bag].ko}이(가) 안 들어가요.`, `A ${LOCKERS[s].en} locker is too small for your ${BAG_LABEL[bag].en}.`));
    if (s !== need) sc.info(L('들어가긴 하지만 더 비싸요. 맞는 크기를 고르면 돈을 아껴요.', 'It fits, but costs more than needed.'));
    else sc.ok(L('딱 맞는 크기!', 'Just the right size!'));
    setSize(s);
    add(`Chose a ${LOCKERS[s].en} locker for a ${BAG_LABEL[bag].en}`);
    setStage('menu');
  };
  const menu = (m: 'store' | 'find') => {
    if (m === 'find') return sc.miss(L('"찾기"는 짐을 꺼낼 때예요. 지금은 "보관하기".', '"찾기" (find) is for collecting. Now you need "보관하기" (store).'));
    sc.clear();
    setStage('pay');
  };
  const pay = (how: 'card' | 'cash') => {
    if (how === 'cash') return sc.miss(L('대부분의 역 물품보관함은 현금이 안 돼요. 카드나 T머니로 결제하세요.', 'Most station lockers don\'t take cash – pay by card or T-money.'));
    sc.ok(L(`결제 완료 (${won(LOCKERS[size!].price)} / 4시간). 비밀번호가 화면에 떴어요!`, `Paid (${won(LOCKERS[size!].price)} / 4 h). Your PIN is on the screen!`));
    setStage('pin');
  };
  const keep = (photo: boolean) => {
    if (!photo) sc.miss(L('비밀번호를 잊으면 콜센터에 전화하고 한참 기다려야 해요. 화면을 사진 찍어 두세요!', 'Forget it and you\'ll be calling the help line for ages – take a photo of the screen!'));
    else sc.ok(L('사진 찰칵! 이제 가볍게 구경하세요.', 'Snap! Now enjoy the city with empty hands.'));
    add(photo ? 'Photographed the PIN screen' : 'Tried to memorise the PIN');
    setStage('later');
  };
  const key = (k: string) => {
    if (k === 'OK') {
      if (typed === PIN) {
        sc.ok(L('"철컥" 보관함이 열렸어요!', '"Clunk" – the locker opens!'));
        add('Collected the bag with the PIN');
        setStage('done');
      } else {
        sc.miss(L('비밀번호가 틀렸어요. 찍어 둔 사진을 보세요.', 'Wrong PIN – check your photo.'));
        setTyped('');
      }
      return;
    }
    if (k === 'C') return setTyped('');
    setTyped((t) => (t + k).slice(0, 6));
  };

  const stageIdx = ['size', 'menu', 'pay', 'pin', 'later', 'done'].indexOf(stage);
  return (
    <SimShell title={tr(step.title, ctx.lang)} stage={Math.min(stageIdx, 4)} stages={[L('크기', 'Size'), L('보관', 'Store'), L('결제', 'Pay'), L('찾기', 'Collect'), L('결과', 'Result')]} fb={sc.fb}>
      <P>{tr(step.intro, ctx.lang)}</P>
      {stage === 'size' && (
        <Box style={{ gap: 8 }}>
          <H size={15}>
            {L('내 짐', 'Your bag')}: {ko ? BAG_LABEL[bag].ko : BAG_LABEL[bag].en} 🧳
          </H>
          {(['S', 'M', 'L'] as LockerSize[]).map((s) => (
            <OptBtn key={s} testID={`lk-${s}`} label={`${LOCKERS[s].ko} ${LOCKERS[s].en} · ${won(LOCKERS[s].price)} / 4h`} sub={LOCKERS[s].fits} onPress={() => pickSize(s)} />
          ))}
        </Box>
      )}
      {stage !== 'size' && stage !== 'done' && (
        <Metal colors={['#E2E8F0', '#94A3B8', '#475569']} style={{ padding: 10 }}>
          <Glass minHeight={170} tint="#FFFFFF">
            {stage === 'menu' && (
              <View style={{ gap: 8 }}>
                <Text style={{ fontWeight: '900', color: C.ink, textAlign: 'center' }}>물품보관함 · Lockers</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <OptBtn testID="lk-store" label="보관하기" sub="Store" onPress={() => menu('store')} style={{ flex: 1 }} />
                  <OptBtn testID="lk-find" label="찾기" sub="Collect" onPress={() => menu('find')} style={{ flex: 1 }} />
                </View>
              </View>
            )}
            {stage === 'pay' && (
              <View style={{ gap: 8 }}>
                <Text style={{ fontWeight: '900', color: C.ink, textAlign: 'center' }}>
                  {LOCKERS[size!].ko} · {won(LOCKERS[size!].price)}
                </Text>
                <OptBtn testID="lk-card" label="카드 / 교통카드" sub="Card / T-money" onPress={() => pay('card')} />
                <OptBtn testID="lk-cash" label="현금" sub="Cash" onPress={() => pay('cash')} />
              </View>
            )}
            {stage === 'pin' && (
              <View style={{ gap: 8, alignItems: 'center' }}>
                <Text style={{ color: C.inkSoft }}>비밀번호 / Your PIN</Text>
                <Text style={{ fontSize: 34, fontWeight: '900', letterSpacing: 6, color: C.blue }}>{PIN}</Text>
                <OptBtn testID="lk-photo" label={L('📷 화면 사진 찍기', '📷 Take a photo of the screen')} onPress={() => keep(true)} />
                <OptBtn testID="lk-memo" label={L('외울 수 있어요', 'I\'ll remember it')} onPress={() => keep(false)} />
              </View>
            )}
            {stage === 'later' && (
              <View style={{ gap: 6, alignItems: 'center' }}>
                <Text style={{ color: C.ink, fontWeight: '800' }}>{L('3시간 뒤… 짐을 찾으러 왔어요. 비밀번호 입력', '3 hours later… enter the PIN')}</Text>
                <Text style={{ fontSize: 24, fontWeight: '900', letterSpacing: 6 }}>{'●'.repeat(typed.length) || '____'}</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5, width: 200, justifyContent: 'center' }}>
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'OK'].map((k) => (
                    <Pressable key={k} testID={`lkkey-${k}`} onPress={() => key(k)} style={{ width: 58, height: 40, borderRadius: 8, backgroundColor: k === 'OK' ? C.green : '#E2E8F0', alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontWeight: '900', color: k === 'OK' ? '#FFF' : C.ink }}>{k}</Text>
                    </Pressable>
                  ))}
                </View>
                <Text style={{ fontSize: 11, color: C.inkSoft }}>📷 {L('찍어 둔 사진', 'Your photo')}: {PIN}</Text>
              </View>
            )}
          </Glass>
        </Metal>
      )}
      {stage === 'done' && <DoneCard title={L('짐 보관 성공', 'Bag stored & collected')} score={sc.final()} lang={ctx.lang} log={log} onContinue={() => onDone({ score: sc.final(), effects: { money: -LOCKERS[size ?? need].price, energy: 6 }, log })} />}
    </SimShell>
  );
}
