import { useEffect, useState } from 'react';
import { Pressable, View, useWindowDimensions } from 'react-native';
import { Text } from '../ui/Text';
import { addCash, tr, type Cash } from '@kotoventure/shared';
import { Btn, H, P, won } from '../ui/kit';
import { C } from '../ui/theme';
import { TmoneyCard } from '../art/TmoneyCard';
import { Box, DoneCard, Glass, Metal, OptBtn, SimShell, Slot, WalletBar, useScore, type SimProps } from './kit';
import { CashPicker } from './CashPay';

const CARD_PRICE = 3000; // plain T-money card ≈ ₩2,500–4,000
const FARE = 1550; // Seoul subway base fare with a transit card (2025)

type S = 'store' | 'menu' | 'place' | 'amount' | 'cash' | 'charging' | 'charged' | 'gates' | 'exit' | 'bus' | 'done';

export function TmoneySim({ step, ctx, onDone }: SimProps) {
  const { width } = useWindowDimensions();
  const sc = useScore(10);
  const buy = step.config?.buyCard ?? true;
  const [s, setS] = useState<S>(buy ? 'store' : 'menu');
  const [flipped, setFlipped] = useState(false);
  const [notes, setNotes] = useState<Cash>({ ...ctx.cash });
  const [bought, setBought] = useState(false);
  const [held, setHeld] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);
  const [topup, setTopup] = useState(0);
  const [inserted, setInserted] = useState(0);
  const [cardOnPad, setCardOnPad] = useState(false);
  const [spent, setSpent] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const add = (l: string) => setLog((x) => [...x, l]);
  const cardW = Math.min(width - 60, 280);
  const stages = ['Buy card', 'Top-up machine', 'Insert cash', 'Gates', 'Done'];
  const stage = { store: 0, menu: 1, place: 1, amount: 1, cash: 2, charging: 2, charged: 2, gates: 3, exit: 3, bus: 3, done: 4 }[s];

  useEffect(() => {
    if (s !== 'charging') return;
    const t = setTimeout(() => {
      setBalance((b) => b + topup);
      sc.ok(`Charged ${won(topup)}! New balance ${won(balance + topup)}.`);
      add(`Topped up ${won(topup)} with cash at the station machine`);
      setS('charged');
    }, 2200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s]);

  const noteItems = Object.entries(notes)
    .filter(([v, n]) => n > 0 && Number(v) >= 1000)
    .map(([v, n]) => ({ id: `note-${v}`, icon: '💵', label: `${won(Number(v))} ×${n}` }));
  const takeNote = (id: string) => {
    const v = Number(id.replace('note-', ''));
    setNotes((n) => ({ ...n, [v]: n[v] - 1 }));
    return v;
  };

  /* ── machine hardware ── */
  const tapPad = () => {
    if (s === 'place') {
      if (held === 'tmoney') {
        setCardOnPad(true);
        setHeld(null);
        sc.ok('Card detected. Leave it on the pad.');
        setS('amount');
      } else if (held === 'visa') sc.miss('Your bank card is not a transit card here – place the T-money card.');
      else sc.info('Select your T-money card in the wallet, then tap the card pad.');
    } else if (s === 'charging') sc.miss('Never lift the card while it is charging (충전 중) – the top-up can fail.');
    else if (s === 'charged') {
      setCardOnPad(false);
      sc.ok('Card taken.');
      setS('gates');
    }
  };
  const tapBillSlot = () => {
    if (s !== 'cash') return sc.info('The bill slot is used after choosing the top-up amount.');
    if (!held) return sc.info('Select a banknote in your wallet, then tap the bill slot.');
    if (held === 'visa') return sc.miss('Top-up machines take CASH only – no credit cards.');
    if (held === 'tmoney') return sc.info('Insert banknotes here. The card stays on the pad.');
    const v = takeNote(held);
    setHeld(null);
    const total = inserted + v;
    setInserted(total);
    if (total >= topup) {
      if (total > topup) {
        add(`Received ${won(total - topup)} change`);
        setNotes((n) => addCash(n, total - topup));
      }
      setS('charging');
      sc.info('충전 중 – charging… keep the card on the pad.');
    } else sc.info(`Inserted ${won(total)} of ${won(topup)}.`);
  };

  /* ── screens ── */
  const machineScreen = () => {
    switch (s) {
      case 'menu':
        return (
          <>
            <Scr>메뉴를 선택하세요 · Select</Scr>
            {[
              ['1회용 교통카드', 'Single Journey Ticket', false],
              ['교통카드 충전', 'Transportation Card Top-up', true],
              ['영수증 발급', 'Receipt', false],
            ].map(([ko, en, ok], i) => (
              <OptBtn
                key={ko as string}
                testID={`opt-${i}`}
                label={ko as string}
                sub={en as string}
                color={ok ? '#E5383B' : '#1D4ED8'}
                onPress={() => {
                  if (ok) {
                    sc.ok('Top-up menu.');
                    setS('place');
                  } else if (i === 0) sc.miss('Single journey tickets need a ₩500 deposit and are for one ride. You have a T-money card – top it up.');
                  else sc.miss('Choose the top-up menu (교통카드 충전).');
                }}
              />
            ))}
          </>
        );
      case 'place':
        return <Scr big>카드를 올려 주세요{'\n'}Place your card on the reader ↓</Scr>;
      case 'amount':
        return (
          <>
            <Scr>
              잔액 Balance: {won(balance)}
              {'\n'}충전 금액 Top-up amount
            </Scr>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
              {[5000, 10000, 20000, 30000, 50000].map((a) => (
                <OptBtn
                  key={a}
                  testID={`amt-${a}`}
                  label={won(a)}
                  style={{ width: '47%' }}
                  onPress={() => {
                    const bills = Object.entries(notes).reduce((t, [v, n]) => t + (Number(v) >= 1000 ? Number(v) * n : 0), 0);
                    if (a > bills) return sc.miss(`You only have ${won(bills)} in notes – choose a smaller amount.`);
                    setTopup(a);
                    if (a < 10000) sc.info('₩5,000 is only about 3 rides – you may need to top up again soon.');
                    else if (a > 30000) sc.info(`${won(a)} is a lot for a short trip – leftovers are refundable only with a fee.`);
                    else sc.ok(`${won(a)} – about ${Math.floor(a / FARE)} subway rides.`);
                    setS('cash');
                  }}
                />
              ))}
            </View>
          </>
        );
      case 'cash':
        return <Scr big>지폐를 넣어 주세요 · Insert bills{'\n'}{won(inserted)} / {won(topup)}</Scr>;
      case 'charging':
        return <Scr big>⏳ 충전 중… 카드를 떼지 마세요{'\n'}Charging – do not remove the card</Scr>;
      case 'charged':
        return <Scr big>✅ 충전 완료 · Done{'\n'}잔액 Balance {won(balance)}{'\n'}카드를 가져가세요 · Take your card</Scr>;
      default:
        return null;
    }
  };

  const wallet = [
    { id: 'tmoney', icon: '🟧', label: `T-money ${won(balance)}`, disabled: cardOnPad || s === 'store' },
    { id: 'visa', icon: '💳', label: 'Visa card' },
    ...noteItems,
  ];

  return (
    <SimShell title={tr(step.title, ctx.lang)} stage={stage} stages={stages} fb={sc.fb}>
      {s === 'store' && (
        <>
          <P>{tr(step.intro, ctx.lang)}</P>
          <Box style={{ alignItems: 'center', gap: 6 }}>
            <Text style={{ fontWeight: '900', color: C.ink }}>🏪 Convenience store counter – “티머니 카드 하나 주세요”</Text>
            <Pressable onPress={() => setFlipped((f) => !f)} testID="flip-card">
              <TmoneyCard width={cardW} side={flipped ? 'back' : 'front'} />
            </Pressable>
            <Text style={{ fontSize: 12, color: C.inkSoft }}>Tap the card to see the {flipped ? 'front' : 'back'} · price {won(CARD_PRICE)} (cash)</Text>
          </Box>
          <H size={16}>Pay {won(CARD_PRICE)} in cash – pick the notes/coins from your wallet</H>
          {!bought ? (
            <CashPicker
              wallet={notes}
              total={CARD_PRICE}
              sc={sc}
              lang={ctx.lang}
              onDone={(r) => {
                setNotes(r.wallet);
                setSpent((x) => x + CARD_PRICE);
                r.log.forEach(add);
                add(`Bought a T-money card for ${won(CARD_PRICE)} in cash`);
                setBought(true);
              }}
            />
          ) : (
            <Btn testID="sim-next" label="Go to the subway station →" onPress={() => setS('menu')} />
          )}
        </>
      )}

      {['menu', 'place', 'amount', 'cash', 'charging', 'charged'].includes(s) && (
        <>
          {s === 'menu' && <P>Subway station: find the machine marked “교통카드 충전 / Card top-up”. The card is empty when you buy it!</P>}
          <Metal colors={['#94A3B8', '#475569', '#1E293B']} style={{ width: Math.min(width - 28, 400), alignSelf: 'center', padding: 10 }}>
            <View style={{ backgroundColor: '#0EA5E9', borderRadius: 6, paddingVertical: 4, marginBottom: 8 }}>
              <Text style={{ color: '#FFF', fontWeight: '900', textAlign: 'center', fontSize: 12 }}>1회용 발매 · 교통카드 충전기{'\n'}Ticket & Card Top-up Machine</Text>
            </View>
            <Glass minHeight={150} tint="#DCEFFF">
              {machineScreen()}
            </Glass>
            <View style={{ flexDirection: 'row', marginTop: 10, gap: 10, alignItems: 'flex-start' }}>
              {/* card pad */}
              <Pressable
                testID="pad"
                onPress={tapPad}
                style={{ flex: 1, height: 96, borderRadius: 10, backgroundColor: '#FDE68A', borderWidth: 3, borderColor: s === 'place' || s === 'charged' ? '#22C55E' : '#B45309', alignItems: 'center', justifyContent: 'center' }}
              >
                {cardOnPad ? <TmoneyCard width={110} /> : <Text style={{ fontSize: 26 }}>📶</Text>}
                <Text style={{ fontWeight: '900', fontSize: 10, color: '#78350F', marginTop: 2 }}>교통카드 올려놓는 곳</Text>
                <Text style={{ fontWeight: '800', fontSize: 9, color: '#78350F' }}>Place card here</Text>
              </Pressable>
              <View style={{ flex: 1, gap: 8, alignItems: 'center' }}>
                <Slot testID="slot-bill" label="지폐 투입구 BILLS" sub="₩1,000·5,000·10,000·50,000" width={110} onPress={tapBillSlot} blink={s === 'cash'} />
                <Slot testID="slot-coin" label="동전 COINS" width={50} height={20} onPress={() => sc.info('Coins work too, but notes are faster here.')} />
              </View>
            </View>
            <View style={{ marginTop: 8 }}>
              <Slot testID="slot-change" label="거스름돈 · 영수증 Change / Receipt" width={Math.min(width - 90, 330)} height={22} onPress={() => sc.info('Change and receipts come out here.')} />
            </View>
          </Metal>
          <WalletBar
            items={wallet}
            selected={held}
            onSelect={(id) => {
              setHeld(id);
              sc.info(id === 'tmoney' ? 'Holding the T-money card.' : id === 'visa' ? 'Holding your Visa card.' : `Holding a ${won(Number(id.replace('note-', '')))} note.`);
            }}
          />
        </>
      )}

      {s === 'gates' && (
        <>
          <H size={16}>Ticket gates · 개찰구 – tap your card on the reader of an ENTRY gate</H>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[
              { id: 'g1', sign: '⛔', label: '진입금지\nNo entry', color: '#DC2626', ok: false, msg: 'Red ⛔ means this gate is for people coming out.' },
              { id: 'g2', sign: '⬆', label: '승차\nEntry', color: '#16A34A', ok: true, msg: '' },
              { id: 'g3', sign: '♿', label: '우대용\nSeniors / disabled', color: '#F59E0B', ok: false, msg: 'Orange gates are for free-pass users (seniors, disabled). Use a green gate.' },
            ].map((g) => (
              <View key={g.id} style={{ flex: 1, alignItems: 'center', backgroundColor: '#CBD5E1', borderRadius: 10, padding: 6 }}>
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: g.color, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: '#FFF', fontSize: 20, fontWeight: '900' }}>{g.sign}</Text>
                </View>
                <Text style={{ fontWeight: '900', fontSize: 10, textAlign: 'center', marginVertical: 4 }}>{g.label}</Text>
                <Pressable
                  testID={`reader-${g.id}`}
                  onPress={() => {
                    if (held !== 'tmoney') return sc.info('Select your T-money card first, then tap the reader.');
                    if (!g.ok) return sc.miss(g.msg);
                    setBalance((b) => b - FARE);
                    setSpent((x) => x + FARE);
                    sc.ok(`삑! ${won(FARE)} 차감 · Balance ${won(balance - FARE)}. Walk through.`);
                    add(`Entered through a green gate (−${won(FARE)})`);
                    setS('exit');
                  }}
                  style={{ width: 56, height: 46, borderRadius: 8, backgroundColor: '#FDE68A', borderWidth: 2, borderColor: '#92400E', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Text style={{ fontSize: 16 }}>📶</Text>
                  <Text style={{ fontSize: 8, fontWeight: '900' }}>TAP</Text>
                </Pressable>
              </View>
            ))}
          </View>
          <WalletBar items={[{ id: 'tmoney', icon: '🟧', label: `T-money ${won(balance)}` }]} selected={held} onSelect={setHeld} />
        </>
      )}

      {s === 'exit' && (
        <>
          <P>🚇 Ride… you arrive at your station. To leave the paid area:</P>
          {[
            ['Tap the card again on an exit gate', true],
            ['Just push through – I already paid', false],
            ['Give the card to the staff', false],
          ].map(([l, ok], i) => (
            <OptBtn
              key={i}
              testID={`opt-${i}`}
              label={l as string}
              onPress={() => {
                if (ok) {
                  sc.ok('Tap out: distance-based extra fare is charged on exit, and the gate opens.');
                  add('Tapped out at the exit gate');
                  setS('bus');
                } else sc.miss('You must tap out: the fare depends on distance and the gate stays closed otherwise.');
              }}
            />
          ))}
        </>
      )}

      {s === 'bus' && (
        <>
          <P>🚌 Next you transfer to a city bus. When do you tap your T-money on the bus?</P>
          {[
            ['When boarding (front door) AND when getting off (back door)', true],
            ['Only when boarding', false],
            ['Only when getting off', false],
          ].map(([l, ok], i) => (
            <OptBtn
              key={i}
              testID={`opt-${i}`}
              label={l as string}
              onPress={() => {
                if (ok) sc.ok('Yes! Tapping off is what gives you the free/discounted transfer.');
                else sc.miss('Tap BOTH on and off – otherwise you lose the transfer discount.');
                add('Bus rule: tap on & tap off for free transfers');
                setS('done');
              }}
            />
          ))}
        </>
      )}

      {s === 'done' && (
        <>
          <Box style={{ alignItems: 'center' }}>
            <TmoneyCard width={cardW} side="back" balance={balance} />
          </Box>
          <DoneCard title="T-money master" score={sc.final()} log={log} lang={ctx.lang} onContinue={() => onDone({ score: sc.final(), effects: { money: -spent }, log, cash: notes })} />
        </>
      )}
    </SimShell>
  );
}

function Scr({ children, big }: { children: React.ReactNode; big?: boolean }) {
  return <Text style={{ textAlign: 'center', fontWeight: '900', color: '#0C4A6E', fontSize: big ? 16 : 13, lineHeight: big ? 24 : 18 }}>{children}</Text>;
}

export { TmoneyCard };
