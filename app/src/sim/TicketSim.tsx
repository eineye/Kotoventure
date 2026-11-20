import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { PARTY_PEOPLE, TICKET_LABEL, TICKET_SITES, ticketTotal, tr, type TicketKind } from '@kotoventure/shared';
import { H, P, won } from '../ui/kit';
import { C } from '../ui/theme';
import { Box, DoneCard, OptBtn, SimShell, Slot, WalletBar, useScore, type SimProps } from './kit';

type Stage = 'board' | 'count' | 'pay' | 'gate' | 'done';
const KINDS: TicketKind[] = ['adult', 'youth', 'child', 'senior'];
const minus30 = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  const x = h * 60 + m - 25;
  return `${String(Math.floor(x / 60)).padStart(2, '0')}:${String(x % 60).padStart(2, '0')}`;
};

/** Attraction ticket office: read the price board, buy the right tickets for your party, pass the gate. */
export function TicketSim({ step, ctx, onDone }: SimProps) {
  const ko = ctx.lang === 'ko';
  const L = (k: string, e: string) => (ko ? k : e);
  const cfg = step.config ?? {};
  const site = TICKET_SITES[cfg.site ?? 'palace'];
  const people = PARTY_PEOPLE[ctx.party];
  const hanbok = !!cfg.hanbok && !!site.hanbokFree;
  const need = KINDS.reduce((a, k) => ({ ...a, [k]: people.filter((p) => p.kind === k).length }), {} as Record<TicketKind, number>);
  const sc = useScore(10);
  const [stage, setStage] = useState<Stage>('board');
  const [counts, setCounts] = useState<Record<TicketKind, number>>({ adult: 0, youth: 0, child: 0, senior: 0 });
  const [paid, setPaid] = useState(0);
  const [held, setHeld] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const add = (s: string) => setLog((l) => [...l, s]);
  const now = minus30(site.lastEntry);

  const answerTime = (yes: boolean) => {
    if (!yes) return sc.miss(L(`아직 들어갈 수 있어요! 마지막 입장은 ${site.lastEntry}이에요 (문 닫는 시간과 달라요).`, `You can still enter! Last admission is ${site.lastEntry} – that's different from closing time.`));
    sc.ok(L(`맞아요. 마지막 입장 ${site.lastEntry} 전이라 입장할 수 있어요. 서둘러요!`, `Right – it's before last admission (${site.lastEntry}). Hurry!`));
    add(`Read the board: last entry ${site.lastEntry}`);
    setStage('count');
  };

  const buy = () => {
    const wrong = KINDS.filter((k) => counts[k] !== need[k]);
    if (hanbok) {
      sc.miss(L('한복을 입었으면 무료예요! 매표소에 "한복 입었어요"라고 말하면 돼요. 표 값을 그냥 낸 셈이에요.', 'You are wearing hanbok – entry is free! Just tell the staff. You paid for nothing.'));
      add('Bought tickets although hanbok = free');
    } else if (wrong.length) {
      const k = wrong[0];
      return sc.miss(
        counts[k] < need[k]
          ? L(`${TICKET_LABEL[k].ko} 표가 모자라요. 일행 나이를 다시 확인하세요.`, `Not enough ${TICKET_LABEL[k].en} tickets – check everyone's age.`)
          : L(`${TICKET_LABEL[k].ko} 표가 너무 많아요.`, `Too many ${TICKET_LABEL[k].en} tickets.`),
      );
    } else {
      sc.ok(L('표 종류와 수량이 정확해요!', 'Exactly the right tickets!'));
      add(`Bought ${KINDS.filter((k) => need[k]).map((k) => `${need[k]}× ${TICKET_LABEL[k].en}`).join(', ')}`);
    }
    const tot = ticketTotal(site, counts);
    setPaid(tot);
    setStage(tot > 0 ? 'pay' : 'gate');
  };

  const freeHanbok = () => {
    if (!hanbok) return sc.miss(L('오늘은 한복을 입지 않았어요. 이 곳은 한복 무료 입장 대상이 아니에요.', 'You are not wearing hanbok today (or this site has no hanbok rule).'));
    sc.ok(L('한복 무료 입장! 직원이 무료 입장권을 줘요.', 'Free entry in hanbok! The staff hand you free tickets.'));
    add('Hanbok = free entry');
    setPaid(0);
    setStage('gate');
  };

  const pay = (how: 'card' | 'phone' | 'foreign') => {
    if (how === 'foreign') return sc.miss(L('해외 결제 앱은 대부분 안 돼요. 카드나 현금을 쓰세요.', 'Foreign payment apps usually don\'t work here – use a card or cash.'));
    sc.ok(L('결제 완료! 표(바코드)를 받았어요.', 'Paid! You get your barcode tickets.'));
    add(`Paid ${won(paid)} by card`);
    setStage('gate');
  };

  const scan = () => {
    if (held !== 'ticket') return sc.miss(L('입장권 바코드를 고른 뒤 스캐너에 대세요.', 'Pick the ticket barcode, then hold it to the scanner.'));
    sc.ok(L('"삑" 초록불! 입장했어요. 표는 나갈 때까지 버리지 마세요.', '"Beep" – green light! Keep your ticket until you leave.'));
    add('Scanned the ticket at the gate');
    setStage('done');
  };

  const stageIdx = ['board', 'count', 'pay', 'gate', 'done'].indexOf(stage);
  return (
    <SimShell title={tr(step.title, ctx.lang)} stage={stageIdx} stages={[L('안내판', 'Board'), L('표 고르기', 'Tickets'), L('결제', 'Pay'), L('입장', 'Gate'), L('결과', 'Result')]} fb={sc.fb}>
      <P>{tr(step.intro, ctx.lang)}</P>

      {stage !== 'done' && (
        <Box style={{ backgroundColor: '#3B1D0F', gap: 4 }}>
          <Text style={{ color: '#FDE68A', fontWeight: '900', fontSize: 16 }}>🎫 {site.ko}</Text>
          <Text style={{ color: '#FCD34D', fontSize: 11 }}>{site.en}</Text>
          <Text style={{ color: '#FFF', fontWeight: '800', marginTop: 4 }}>
            🕘 {L('관람시간', 'Hours')} {site.open}– · {L('입장마감', 'Last entry')} {site.lastEntry}
          </Text>
          {KINDS.map((k) => (
            <View key={k} style={{ flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#7C2D12', paddingTop: 3 }}>
              <Text style={{ color: '#FDE68A', fontWeight: '800' }}>{ko ? TICKET_LABEL[k].ko : TICKET_LABEL[k].en}</Text>
              <Text style={{ color: '#FFF', fontWeight: '900' }}>{site.prices[k] ? won(site.prices[k]) : L('무료', 'Free')}</Text>
            </View>
          ))}
          {site.hanbokFree && <Text style={{ color: '#86EFAC', fontWeight: '900', marginTop: 4 }}>👘 {L('한복 착용 시 무료', 'Free entry in hanbok')}</Text>}
          <Text style={{ color: '#FCA5A5', fontSize: 11, marginTop: 4 }}>{tr(site.note, ctx.lang)} · {L('요금은 예시', 'example prices')}</Text>
        </Box>
      )}

      {stage === 'board' && (
        <Box style={{ gap: 8 }}>
          <H size={15}>{L(`지금 ${now}. 아직 입장할 수 있을까요?`, `It's ${now} now. Can you still go in?`)}</H>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <OptBtn testID="time-yes" label={L('네, 들어갈 수 있어요', 'Yes, we can')} onPress={() => answerTime(true)} style={{ flex: 1 }} />
            <OptBtn testID="time-no" label={L('아니요, 늦었어요', 'No, too late')} onPress={() => answerTime(false)} style={{ flex: 1 }} />
          </View>
        </Box>
      )}

      {stage === 'count' && (
        <>
          <Box style={{ gap: 4 }}>
            <H size={15}>{L('우리 일행', 'Your party')}</H>
            {people.map((p) => (
              <Text key={p.who} style={{ color: C.ink }}>
                • {p.who}
                {hanbok ? ' 👘' : ''}
              </Text>
            ))}
            {hanbok && <Text style={{ color: C.green, fontWeight: '800' }}>{L('모두 한복을 빌려 입었어요!', 'Everyone rented hanbok today!')}</Text>}
          </Box>
          <Box style={{ gap: 8 }}>
            {KINDS.map((k) => (
              <View key={k} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ flex: 1, fontWeight: '800', color: C.ink }}>{ko ? TICKET_LABEL[k].ko : TICKET_LABEL[k].en}</Text>
                <Pressable testID={`tk-minus-${k}`} onPress={() => setCounts((c) => ({ ...c, [k]: Math.max(0, c[k] - 1) }))} style={btn}>
                  <Text style={btnT}>−</Text>
                </Pressable>
                <Text style={{ width: 24, textAlign: 'center', fontWeight: '900', fontSize: 18 }}>{counts[k]}</Text>
                <Pressable testID={`tk-plus-${k}`} onPress={() => setCounts((c) => ({ ...c, [k]: c[k] + 1 }))} style={btn}>
                  <Text style={btnT}>+</Text>
                </Pressable>
              </View>
            ))}
            <Text style={{ fontWeight: '900', color: C.ink, textAlign: 'right' }}>
              {L('합계', 'Total')} {won(ticketTotal(site, counts))}
            </Text>
            <OptBtn testID="tk-buy" label={L('이 표로 구매', 'Buy these tickets')} selected onPress={buy} />
            {site.hanbokFree && <OptBtn testID="tk-hanbok" label={L('👘 "한복 입었어요" (무료 입장)', '👘 "We\'re wearing hanbok" (free entry)')} color={C.green} onPress={freeHanbok} />}
          </Box>
        </>
      )}

      {stage === 'pay' && (
        <Box style={{ gap: 8 }}>
          <H size={15}>
            {L('결제할 금액', 'To pay')}: {won(paid)}
          </H>
          <OptBtn testID="tk-card" label={L('💳 카드 결제', '💳 Pay by card')} onPress={() => pay('card')} />
          <OptBtn testID="tk-phone" label={L('📱 삼성페이 등 국내 간편결제 (등록된 카드)', '📱 Phone wallet with a registered card')} onPress={() => pay('phone')} />
          <OptBtn testID="tk-foreign" label={L('🌐 해외 전용 결제 앱 (WeChat 등)', '🌐 A home-country-only payment app')} onPress={() => pay('foreign')} />
        </Box>
      )}

      {stage === 'gate' && (
        <>
          <Box style={{ alignItems: 'center', gap: 8, backgroundColor: '#1F2937' }}>
            <Text style={{ color: '#FDE68A', fontWeight: '900', fontSize: 12 }}>{L('입장 게이트 – 바코드 스캐너', 'Entry gate – barcode scanner')}</Text>
            <Slot testID="tk-scan" label={L('바코드를 대세요', 'Scan barcode here')} width={130} height={56} blink={held === 'ticket'} color="#16A34A" onPress={scan} />
          </Box>
          <WalletBar
            title={L('지갑 – 입장권을 고른 뒤 스캐너를 누르세요', 'Wallet – pick the ticket, then tap the scanner')}
            items={[
              { id: 'ticket', label: L('입장권', 'Ticket'), icon: '🎫' },
              { id: 'receipt', label: L('영수증', 'Receipt'), icon: '🧾' },
              { id: 'tmoney', label: 'T-money', icon: '🟧' },
            ]}
            selected={held}
            onSelect={(id) => {
              setHeld(id);
              if (id !== 'ticket') sc.info(L('입장 게이트는 입장권 바코드만 읽어요.', 'The gate only reads the ticket barcode.'));
            }}
          />
        </>
      )}

      {stage === 'done' && (
        <DoneCard title={L('입장 성공!', 'You\'re in!')} score={sc.final()} lang={ctx.lang} log={log} onContinue={() => onDone({ score: sc.final(), effects: { money: -paid }, log })} />
      )}
    </SimShell>
  );
}

const btn = { width: 38, height: 38, borderRadius: 19, backgroundColor: '#E2E8F0', alignItems: 'center' as const, justifyContent: 'center' as const };
const btnT = { fontSize: 20, fontWeight: '900' as const, color: '#0F172A' };
