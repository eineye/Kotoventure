import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { DENOMS, addCash, bestPayment, cashTotal, removePieces, tr, type Cash } from '@kotoventure/shared';
import { Banknote, Coin } from '../art/Money';
import { Btn, H, P, won } from '../ui/kit';
import { C, R } from '../ui/theme';
import { Box, DoneCard, MoneyTray, OptBtn, SimShell, notePx, useScore, type SimProps } from './kit';

type Scorer = ReturnType<typeof useScore>;

const NOTE_W = 104; // on-screen width of a ₩50,000 note in the wallet
const PX_PER_MM = NOTE_W / 154;

/** One denomination drawn at true relative size. */
export function Piece({ value, scale = 1 }: { value: number; scale?: number }) {
  return value >= 1000 ? <Banknote value={value} width={(NOTE_W * scale * notePx(value)) / 154} /> : <Coin value={value} pxPerMm={PX_PER_MM * 1.7 * scale} />;
}

/**
 * Pay a price with the cash you actually have: tap notes/coins from your wallet onto the counter,
 * pay, then check your change. Used by the cash-payment simulation and the T-money card purchase.
 */
export function CashPicker({
  wallet,
  total,
  sc,
  cashOnly = true,
  onDone,
  lang = 'en',
}: {
  wallet: Cash;
  total: number;
  sc: Scorer;
  cashOnly?: boolean;
  lang?: string;
  onDone: (r: { wallet: Cash; log: string[] }) => void;
}) {
  const [tray, setTray] = useState<number[]>([]);
  const [stage, setStage] = useState<'pick' | 'change' | 'got'>('pick');
  const [after, setAfter] = useState<Cash>(wallet);
  const [log, setLog] = useState<string[]>([]);
  const left: Cash = useMemo(() => removePieces(wallet, tray), [wallet, tray]);
  const given = tray.reduce((a, b) => a + b, 0);
  const change = given - total;
  const best = bestPayment(wallet, total);
  const enough = best !== null;
  const ko = lang === 'ko';

  const pay = () => {
    const l: string[] = [`Paid ${won(given)} for ${won(total)} (${[...tray].sort((a, b) => b - a).map((v) => won(v)).join(' + ')})`];
    if (given === total) {
      sc.ok(ko ? '딱 맞게 냈어요! 거스름돈 없음.' : 'Exact amount – no change needed. Perfect!');
      sc.addBonus(5);
    } else if (best !== null && given - best >= 10000) {
      sc.miss(
        ko
          ? `더 작은 돈으로 낼 수 있었어요 (최적: ${won(best)}).`
          : `You could have paid with smaller money: ${won(best)} was possible. Small shops run out of change quickly.`,
      );
    } else if (tray.includes(50000) && total < 10000 && best !== null && best < 50000) {
      sc.miss(ko ? '작은 가게에서 5만원권은 거스름돈이 부족할 수 있어요.' : 'A ₩50,000 note for a small purchase – stalls often can’t break it.');
    } else sc.ok(ko ? '좋아요. 거스름돈을 확인하세요.' : 'Good payment. Now check your change.');
    setLog(l);
    // pieces leave the wallet now; change comes back after the change check
    setAfter(left);
    setStage(given === total ? 'got' : 'change');
    if (given === total) onDone({ wallet: left, log: l });
  };

  if (!enough && stage === 'pick')
    return (
      <Box style={{ gap: 8 }}>
        <Text style={{ fontWeight: '900', color: C.red }}>
          {ko ? '현금이 부족해요' : 'Not enough cash!'} ({won(cashTotal(wallet))} / {won(total)})
        </Text>
        {!cashOnly && (
          <OptBtn
            testID="pay-card"
            label={ko ? '카드로 결제' : 'Pay by card instead'}
            onPress={() => {
              sc.info(ko ? '카드 결제 완료.' : 'Paid by card – fine here.');
              onDone({ wallet, log: [`Not enough cash – paid ${won(total)} by card`] });
            }}
          />
        )}
        <OptBtn
          testID="pay-atm"
          label={ko ? 'ATM에서 현금 인출 후 결제' : 'Run to an ATM, then pay in cash'}
          onPress={() => {
            sc.miss(ko ? '현금만 받는 곳이에요. 다음엔 현금을 미리 준비하세요.' : 'Cash-only place – keep some cash for markets and stalls. (ATM fee ₩3,600)');
            const withdrawn = Math.ceil(total / 10000) * 10000;
            const paidWallet = addCash(wallet, withdrawn - total); // withdraw, pay, keep the change
            onDone({ wallet: paidWallet, log: [`Ran out of cash – withdrew money at an ATM to pay ${won(total)}`] });
          }}
        />
      </Box>
    );

  if (stage === 'change') {
    const opts = [change, change + 1000, Math.max(0, change - 1000), change + 5000].filter((v, i, a) => a.indexOf(v) === i).slice(0, 3);
    const order = [...opts].sort((a, b) => ((a / 10) % 7) - ((b / 10) % 7));
    return (
      <Box style={{ gap: 8 }}>
        <H size={16}>{ko ? `${won(given)}을 냈어요. 거스름돈은 얼마일까요?` : `You handed over ${won(given)}. How much change should you get?`}</H>
        {order.map((v, i) => (
          <OptBtn
            key={v}
            testID={`change-${i}`}
            label={won(v)}
            onPress={() => {
              if (v === change) sc.ok(ko ? '정확해요!' : `Right – ${won(given)} − ${won(total)} = ${won(change)}.`);
              else sc.miss(ko ? `거스름돈은 ${won(change)}이에요.` : `${won(given)} − ${won(total)} = ${won(change)}. Always check your change!`);
              const w = addCash(after, change);
              setAfter(w);
              setLog((x) => [...x, `Checked the change: ${won(change)}`]);
              setStage('got');
              onDone({ wallet: w, log: [...log, `Checked the change: ${won(change)}`] });
            }}
          />
        ))}
      </Box>
    );
  }

  if (stage === 'got')
    return (
      <Box style={{ gap: 6 }}>
        <Text style={{ fontWeight: '900', color: C.green }}>{change > 0 ? `${ko ? '거스름돈' : 'Your change'}: ${won(change)}` : ko ? '결제 완료' : 'Paid'}</Text>
        {change > 0 && <MoneyTray amount={change} noteWidth={150} />}
      </Box>
    );

  return (
    <View style={{ gap: 10 }}>
      {/* counter tray */}
      <View style={{ backgroundColor: '#7C5A3A', borderRadius: R.m, padding: 8 }}>
        <Text style={{ color: '#FDE68A', fontWeight: '900', fontSize: 12 }}>
          🧾 {ko ? '계산대 (누르면 다시 가져오기)' : 'Counter – tap a piece to take it back'}
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, minHeight: 46, marginTop: 6, alignItems: 'center' }}>
          {tray.map((v, i) => (
            <Pressable key={i} testID={`tray-${i}`} onPress={() => setTray((t) => t.filter((_, k) => k !== i))}>
              <Piece value={v} scale={0.8} />
            </Pressable>
          ))}
          {!tray.length && <Text style={{ color: '#FDE68A99' }}>{ko ? '(비어 있음)' : '(empty)'}</Text>}
        </View>
        <Text style={{ color: '#FFF', fontWeight: '900', marginTop: 6 }}>
          {ko ? '낸 돈' : 'Given'} {won(given)} / {ko ? '가격' : 'price'} {won(total)}
          {given < total ? `  ·  ${won(total - given)} ${ko ? '더 필요' : 'more'}` : given > total ? `  ·  ${ko ? '거스름돈' : 'change'} ${won(given - total)}` : '  ·  ✓'}
        </Text>
      </View>

      {/* wallet */}
      <View style={{ backgroundColor: '#3F2A1D', borderRadius: R.m, padding: 8 }}>
        <Text style={{ color: '#FDE68A', fontWeight: '900', fontSize: 12 }}>
          👛 {ko ? '내 지갑 현금' : 'Your cash'}: {won(cashTotal(left))} – {ko ? '눌러서 계산대에 올리기' : 'tap to put on the counter'}
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6, alignItems: 'flex-end' }}>
          {DENOMS.filter((d) => (left[d] ?? 0) > 0).map((d) => (
            <Pressable key={d} testID={`cash-${d}`} onPress={() => setTray((t) => [...t, d])} style={{ alignItems: 'center' }}>
              <Piece value={d} />
              <View style={{ position: 'absolute', top: -6, right: -6, backgroundColor: C.red, borderRadius: 10, minWidth: 20, paddingHorizontal: 4, alignItems: 'center' }}>
                <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 11 }}>×{left[d]}</Text>
              </View>
              <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 10 }}>{won(d)}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Btn testID="pay" label={given >= total ? (ko ? `${won(given)} 내기` : `Pay ${won(given)}`) : ko ? `${won(total - given)} 더 내야 해요` : `Add ${won(total - given)} more`} disabled={given < total} onPress={pay} />
    </View>
  );
}

/** "Buy something with cash" simulation: market stalls, street food, convenience stores. */
export function CashPaySim({ step, ctx, onDone }: SimProps) {
  const sc = useScore(15);
  const items = step.config?.items ?? [{ name: 'Snack', price: 3000 }];
  const total = items.reduce((a, b) => a + b.price, 0);
  const [res, setRes] = useState<{ wallet: Cash; log: string[] } | null>(null);
  const ko = ctx.lang === 'ko';
  return (
    <SimShell title={tr(step.title, ctx.lang)} stage={res ? 1 : 0} stages={[ko ? '현금 결제' : 'Pay in cash', ko ? '완료' : 'Done']} fb={sc.fb}>
      <P>{tr(step.intro, ctx.lang)}</P>
      <Box>
        <Text style={{ fontWeight: '900', color: C.ink, fontSize: 16 }}>🏪 {step.config?.shop ?? 'Shop'}</Text>
        {step.config?.cashOnly !== false && <Text style={{ color: C.red, fontWeight: '800', fontSize: 12 }}>💵 {ko ? '현금만 가능' : 'Cash only'} · 현금만 받아요</Text>}
        {items.map((it, i) => (
          <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3, borderBottomWidth: 1, borderBottomColor: C.line }}>
            <Text style={{ color: C.ink, fontWeight: '700' }}>{it.name}</Text>
            <Text style={{ color: C.ink, fontWeight: '900' }}>{won(it.price)}</Text>
          </View>
        ))}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
          <Text style={{ fontWeight: '900', color: C.ink }}>{ko ? '합계' : 'Total'}</Text>
          <Text style={{ fontWeight: '900', color: C.red, fontSize: 20 }}>{won(total)}</Text>
        </View>
      </Box>
      {!res ? (
        <CashPicker wallet={ctx.cash} total={total} sc={sc} cashOnly={step.config?.cashOnly !== false} lang={ctx.lang} onDone={setRes} />
      ) : (
        <>
          <CashPickerResult res={res} />
          <DoneCard
            title={ko ? '현금 결제 완료' : 'Paid in cash'}
            score={sc.final()}
            log={res.log}
            lang={ctx.lang}
            onContinue={() => onDone({ score: sc.final(), effects: { money: -total }, log: res.log, cash: res.wallet })}
          />
        </>
      )}
    </SimShell>
  );
}

function CashPickerResult({ res }: { res: { wallet: Cash } }) {
  return (
    <Box>
      <Text style={{ fontWeight: '900', color: C.inkSoft, fontSize: 12 }}>👛 Cash left: {won(cashTotal(res.wallet))}</Text>
    </Box>
  );
}
