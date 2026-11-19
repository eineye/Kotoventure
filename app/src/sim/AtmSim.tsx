import { useEffect, useState } from 'react';
import { Text, View, useWindowDimensions } from 'react-native';
import { currencyForCountry, tr } from '@kotoventure/shared';
import { P, won } from '../ui/kit';
import { C } from '../ui/theme';
import { Box, DoneCard, Keypad, MoneyTray, OptBtn, SimShell, Slot, WalletBar, useScore, type SimProps } from './kit';

type S =
  | 'lang' | 'menu' | 'insert' | 'pin' | 'account' | 'amount' | 'dcc' | 'fee' | 'busy' | 'takeCard' | 'takeCash' | 'receipt'
  | 'pbIntro' | 'pbMenu' | 'pbInsert' | 'pbPrint' | 'pbTake' | 'done';

const PIN = '2580';
const ATM_FEE = 3600;
const DCC_MARKUP = 0.06;

/**
 * Global ATM simulation (as found at airports, ferry terminals, bank branches, convenience stores).
 * Real flow: language → foreign-card withdrawal → insert card → PIN → account → amount
 * → refuse DCC conversion → accept fee → TAKE CARD first → take cash → receipt.
 * Optional: practise a Korean passbook update (통장정리) in the passbook slot.
 */
export function AtmSim({ step, ctx, onDone }: SimProps) {
  const { width } = useWindowDimensions();
  const W = Math.min(width - 28, 400);
  const sc = useScore(10);
  const home = currencyForCountry(ctx.country);
  const target = step.config?.targetKRW ?? 100000;
  const [s, setS] = useState<S>('lang');
  const [held, setHeld] = useState<string | null>(null);
  const [pin, setPin] = useState('');
  const [amount, setAmount] = useState(0);
  const [custom, setCustom] = useState('');
  const [dcc, setDcc] = useState(false);
  const [credit, setCredit] = useState(false);
  const [cardIn, setCardIn] = useState(false);
  const [pbIn, setPbIn] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const add = (l: string) => setLog((x) => [...x, l]);

  useEffect(() => {
    if (s === 'busy') {
      const t = setTimeout(() => setS('takeCard'), 1400);
      return () => clearTimeout(t);
    }
    if (s === 'pbPrint') {
      const t = setTimeout(() => setS('pbTake'), 1600);
      return () => clearTimeout(t);
    }
  }, [s]);

  const ORDER: S[] = ['lang', 'menu', 'insert', 'pin', 'account', 'amount', 'dcc', 'fee', 'busy', 'takeCard', 'takeCash', 'receipt'];
  const oi = ORDER.indexOf(s);
  const stageIdx = s === 'done' ? 4 : s.startsWith('pb') ? 3 : oi < 3 ? 0 : oi < 6 ? 1 : 2;
  const stages = ['Card in', 'PIN & amount', 'Fees & cash', 'Passbook', 'Done'];

  /* ── hardware interactions ── */
  const tapCardSlot = () => {
    if (s === 'insert') {
      if (held === 'card') {
        setCardIn(true);
        setHeld(null);
        sc.ok('Card inserted – chip first, face up, in the direction of the arrow.');
        setS('pin');
      } else if (held === 'passbook') sc.miss('The passbook does not fit the card slot – it goes in the wide passbook slot (통장).');
      else sc.info('Select your card in the wallet first, then tap the card slot.');
    } else if (s === 'takeCard') {
      setCardIn(false);
      sc.ok('Card taken. Korean ATMs return the card BEFORE the cash – never walk away without it!');
      setS('takeCash');
    } else if (s === 'pbInsert' && held === 'passbook') sc.miss('Passbooks go into the passbook slot, not the card slot.');
    else if (s === 'takeCash') sc.info('You already have your card. Now take the cash.');
  };
  const tapPassbookSlot = () => {
    if (s === 'insert' && held === 'card') return sc.miss('That wide slot is for Korean bank passbooks (통장). Cards go in the card slot.');
    if (s === 'pbInsert') {
      if (held === 'passbook') {
        setPbIn(true);
        setHeld(null);
        sc.ok('Passbook in – open at the last printed page, magnetic stripe on the right side.');
        setS('pbPrint');
      } else sc.info('Select the passbook in your wallet first.');
    } else if (s === 'pbTake') {
      setPbIn(false);
      sc.ok('Passbook updated with the latest transactions.');
      add('Practised 통장정리: passbook updated in the passbook slot');
      setS('done');
    }
  };
  const tapCash = () => {
    if (s === 'takeCash') {
      sc.ok(`Cash taken: ${won(amount)}. Count it before leaving.`);
      add(`Took the card first, then ${won(amount)} cash`);
      setS('receipt');
    } else if (s === 'takeCard') sc.miss('The cash comes out only after you take your card back.');
  };
  const onKey = (k: string) => {
    if (s === 'pin') {
      if (k === 'C') return setPin('');
      if (k === 'OK') {
        if (pin === PIN) {
          sc.ok('PIN accepted. Tip: always cover the keypad with your hand.');
          add('Entered the PIN while covering the keypad');
          setS('account');
        } else {
          sc.miss('Wrong PIN. 3 wrong tries can block your card – check the note on your card holder.');
          setPin('');
        }
        return;
      }
      if (pin.length < 4) setPin(pin + k);
    } else if (s === 'amount') {
      if (k === 'C') return setCustom('');
      if (k === 'OK') return custom && chooseAmount(Number(custom) * 10000);
      if (custom.length < 2) setCustom(custom + k);
    }
  };
  const chooseAmount = (a: number) => {
    setAmount(a);
    const r = a / target;
    if (r > 0.6 && r < 1.6) sc.ok(`${won(a)} – good amount for your plans.`);
    else sc.info(`${won(a)} – the mission suggested about ${won(target)}.`);
    add(`Requested ${won(a)}`);
    setS('dcc');
  };

  /* ── screen content ── */
  const screen = () => {
    switch (s) {
      case 'lang':
        return (
          <>
            <Scr>어서 오십시오 · Welcome · 欢迎 · ようこそ</Scr>
            <Grid>
              {['한국어', 'English', '中文', '日本語'].map((l, i) => (
                <OptBtn
                  key={l}
                  testID={`opt-${i}`}
                  label={l}
                  onPress={() => {
                    sc.ok(`Language: ${l}`);
                    add(`Chose the ${l} menu`);
                    setS('menu');
                  }}
                />
              ))}
            </Grid>
          </>
        );
      case 'menu':
        return (
          <>
            <Scr>Select a service</Scr>
            <Grid>
              {[
                ['해외카드 출금', 'Foreign card withdrawal', true],
                ['예금 출금', 'Withdrawal (Korean card)', false],
                ['통장정리', 'Passbook update', false],
                ['입금', 'Deposit', false],
                ['조회', 'Balance inquiry', false],
                ['이체', 'Transfer', false],
              ].map(([ko, en, ok], i) => (
                <OptBtn
                  key={ko as string}
                  testID={`opt-${i}`}
                  label={ko as string}
                  sub={en as string}
                  color={ok ? '#DC2626' : '#1D4ED8'}
                  onPress={() => {
                    if (ok) {
                      sc.ok('Foreign-issued cards always use the "foreign card / global" menu.');
                      setS('insert');
                    } else sc.miss(`"${en}" is for Korean bank accounts. With a foreign card choose "해외카드 출금 / Foreign card".`);
                  }}
                />
              ))}
            </Grid>
          </>
        );
      case 'insert':
        return <Scr big>💳 Please insert your card{'\n'}카드를 넣어 주십시오</Scr>;
      case 'pin':
        return (
          <>
            <Scr>Enter your PIN (4 digits) then press 확인</Scr>
            <Text style={{ fontSize: 32, fontWeight: '900', letterSpacing: 12, textAlign: 'center', color: C.ink }}>{'●'.repeat(pin.length).padEnd(4, '○')}</Text>
            <Text style={{ fontSize: 11, color: C.inkSoft, textAlign: 'center' }}>Use the keypad below ↓</Text>
          </>
        );
      case 'account':
        return (
          <>
            <Scr>Select account type</Scr>
            <Grid>
              {[
                ['Checking', '결제계좌 (debit)', 'ok'],
                ['Savings', '저축계좌', 'ok'],
                ['Credit', '신용카드 (cash advance)', 'credit'],
              ].map(([en, ko, v], i) => (
                <OptBtn
                  key={en}
                  testID={`opt-${i}`}
                  label={en}
                  sub={ko}
                  onPress={() => {
                    if (v === 'credit') {
                      setCredit(true);
                      sc.miss('A credit-card cash advance charges extra fees and interest from day one. Use your debit (checking) account.');
                    } else sc.ok('Debit account – no cash-advance interest.');
                    add(`Account: ${en}`);
                    setS('amount');
                  }}
                />
              ))}
            </Grid>
          </>
        );
      case 'amount':
        return (
          <>
            <Scr>Select amount (KRW) · 금액 선택</Scr>
            <Grid>
              {[10000, 50000, 100000, 300000, 500000].map((a, i) => (
                <OptBtn key={a} testID={`amt-${a}`} label={won(a)} onPress={() => chooseAmount(a)} />
              ))}
              <OptBtn testID={`opt-other`} label={custom ? `₩${custom}0,000 → 확인` : 'Other / 기타'} sub="keypad: ×10,000" onPress={() => custom && chooseAmount(Number(custom) * 10000)} />
            </Grid>
          </>
        );
      case 'dcc':
        return (
          <>
            <Scr>Would you like to be charged in {home.code}?</Scr>
            <Text style={{ textAlign: 'center', color: C.ink, fontWeight: '700' }}>
              {won(amount)} = {home.symbol}
              {((amount / (ctx.fxRates[home.code] ?? 1400)) * (1 + DCC_MARKUP)).toFixed(2)} {home.code}
              {'\n'}
              <Text style={{ fontSize: 11, color: C.inkSoft }}>(rate includes a {DCC_MARKUP * 100}% conversion margin)</Text>
            </Text>
            <Grid>
              <OptBtn
                testID="opt-0"
                label={`Yes – charge me in ${home.code}`}
                onPress={() => {
                  setDcc(true);
                  sc.miss('That is "Dynamic Currency Conversion" (DCC) – the ATM\'s own bad rate. Always choose KRW and let your bank convert.');
                  add(`Accepted DCC in ${home.code} (expensive!)`);
                  setS('fee');
                }}
              />
              <OptBtn
                testID="opt-1"
                label="No – continue in KRW (원화)"
                color="#16A34A"
                onPress={() => {
                  sc.ok('Smart: declined the conversion, your own bank converts at a better rate.');
                  add('Declined DCC – charged in KRW');
                  setS('fee');
                }}
              />
            </Grid>
          </>
        );
      case 'fee':
        return (
          <>
            <Scr>This ATM charges a fee of {won(ATM_FEE)}.{'\n'}Your bank may charge additional fees.</Scr>
            <Grid>
              <OptBtn testID="opt-0" label="Cancel" color="#6B7280" onPress={() => sc.info('You can cancel – but you still need cash. Most global ATMs charge a similar fee.')} />
              <OptBtn
                testID="opt-1"
                label="Accept & continue"
                color="#16A34A"
                onPress={() => {
                  add(`Accepted the ATM fee ${won(ATM_FEE)}`);
                  setS('busy');
                }}
              />
            </Grid>
          </>
        );
      case 'busy':
        return <Scr big>⏳ Processing… 처리 중입니다</Scr>;
      case 'takeCard':
        return <Scr big>💳 Please take your card{'\n'}카드를 받으십시오</Scr>;
      case 'takeCash':
        return <Scr big>💵 Please take your cash{'\n'}현금을 받으십시오</Scr>;
      case 'receipt':
        return (
          <>
            <Scr>Do you need a receipt? 명세표 출력</Scr>
            <Grid>
              {['Yes · 예', 'No · 아니오'].map((l, i) => (
                <OptBtn
                  key={l}
                  testID={`opt-${i}`}
                  label={l}
                  onPress={() => {
                    if (i === 0) add('Printed a receipt (useful for checking your bank statement)');
                    setS(step.config?.passbookPractice ? 'pbIntro' : 'done');
                  }}
                />
              ))}
            </Grid>
          </>
        );
      case 'pbIntro':
      case 'pbMenu':
        return (
          <>
            <Scr>Select a service</Scr>
            <Grid>
              {[
                ['해외카드 출금', 'Foreign card'],
                ['통장정리', 'Passbook update'],
                ['입금', 'Deposit'],
                ['조회', 'Balance'],
              ].map(([ko, en], i) => (
                <OptBtn
                  key={ko}
                  testID={`opt-${i}`}
                  label={ko}
                  sub={en}
                  onPress={() => {
                    if (ko === '통장정리') {
                      sc.ok('통장정리 = print new transactions into the passbook.');
                      setS('pbInsert');
                    } else sc.miss('Look for 통장정리 (passbook update).');
                  }}
                />
              ))}
            </Grid>
          </>
        );
      case 'pbInsert':
        return <Scr big>📘 Insert your passbook (open, last page){'\n'}통장을 넣어 주십시오</Scr>;
      case 'pbPrint':
        return <Scr big>🖨️ Printing… 통장 정리 중</Scr>;
      case 'pbTake':
        return <Scr big>📘 Please take your passbook{'\n'}통장을 받으십시오</Scr>;
      default:
        return null;
    }
  };

  if (s === 'done')
    return (
      <SimShell title={tr(step.title, ctx.lang)} stage={4} stages={stages} fb={sc.fb}>
        <Box>
          <Text style={{ fontWeight: '900', marginBottom: 6 }}>Cash received</Text>
          <MoneyTray amount={amount} noteWidth={Math.min(width - 150, 200)} />
        </Box>
        <DoneCard
          title="ATM mission complete"
          score={sc.final()}
          log={log}
          lang={ctx.lang}
          onContinue={() =>
            onDone({
              score: sc.final(),
              effects: { money: -ATM_FEE - (dcc ? Math.round(amount * DCC_MARKUP) : 0) - (credit ? 5000 : 0) },
              log,
            })
          }
        />
      </SimShell>
    );

  const passbookMode = s.startsWith('pb');
  return (
    <SimShell title={tr(step.title, ctx.lang)} stage={stageIdx} stages={stages} fb={sc.fb}>
      {s === 'lang' && <P>{tr(step.intro, ctx.lang)}</P>}
      {s === 'pbIntro' && (
        <Box>
          <P>
            📘 <Text style={{ fontWeight: '900' }}>Bonus practice:</Text> Koreans and long-stay residents with a Korean bank account still use a paper passbook (통장). Update it at the ATM: menu 통장정리 → insert the open passbook into the wide passbook slot.
          </P>
        </Box>
      )}
      {/* ── the machine ── */}
      <View style={{ width: W, alignSelf: 'center', backgroundColor: '#1E3A8A', borderRadius: 14, padding: 10, borderWidth: 3, borderColor: '#0F1E4A' }}>
        <View style={{ backgroundColor: '#DC2626', borderRadius: 6, paddingVertical: 4, marginBottom: 8 }}>
          <Text style={{ color: '#FFF', fontWeight: '900', textAlign: 'center', fontSize: 13 }}>GLOBAL ATM · 해외카드 Foreign Cards · 24h</Text>
        </View>
        {/* screen */}
        <View style={{ backgroundColor: '#0F172A', borderRadius: 8, padding: 6 }}>
          <View style={{ backgroundColor: '#E0F2FE', borderRadius: 4, padding: 8, minHeight: 190, gap: 8, justifyContent: 'center' }}>{screen()}</View>
        </View>
        {/* hardware */}
        <View style={{ flexDirection: 'row', marginTop: 10, gap: 10 }}>
          <View style={{ backgroundColor: '#334155', borderRadius: 8, padding: 6 }}>
            <Keypad onKey={onKey} />
            <Text style={{ color: '#CBD5E1', fontSize: 9, textAlign: 'center', marginTop: 4, fontWeight: '800' }}>🖐 cover while typing</Text>
          </View>
          <View style={{ flex: 1, gap: 8, alignItems: 'center' }}>
            <Slot testID="slot-card" label="카드 CARD" sub={cardIn ? '● card inside' : '▼ insert'} width={96} onPress={tapCardSlot} blink={s === 'insert' || s === 'takeCard'} />
            <Slot testID="slot-passbook" label="통장 PASSBOOK" sub={pbIn ? '● passbook inside' : 'open page ▼'} width={110} height={30} onPress={tapPassbookSlot} blink={s === 'pbInsert' || s === 'pbTake'} />
            <Slot testID="slot-receipt" label="명세표 RECEIPT" width={80} height={18} onPress={() => sc.info('Receipts come out here at the end.')} />
          </View>
        </View>
        <View style={{ marginTop: 10 }}>
          <Slot testID="slot-cash" label="현금 CASH" sub={s === 'takeCash' ? '💵 cash is out!' : ''} width={W - 60} height={34} onPress={tapCash} blink={s === 'takeCash'} />
        </View>
      </View>
      <WalletBar
        items={[
          { id: 'card', icon: '💳', label: `${home.code} debit card (PIN ${PIN})`, disabled: cardIn || passbookMode },
          ...(step.config?.passbookPractice ? [{ id: 'passbook', icon: '📘', label: '통장 Passbook', disabled: !passbookMode || pbIn }] : []),
        ]}
        selected={held}
        onSelect={(id) => {
          setHeld(id);
          sc.info(id === 'card' ? 'Holding your card – now tap the right slot on the machine.' : 'Holding the passbook – tap the right slot.');
        }}
      />
    </SimShell>
  );
}

function Scr({ children, big }: { children: React.ReactNode; big?: boolean }) {
  return <Text style={{ textAlign: 'center', fontWeight: '900', color: '#0C4A6E', fontSize: big ? 18 : 14, lineHeight: big ? 26 : 19 }}>{children}</Text>;
}
function Grid({ children }: { children: React.ReactNode }) {
  return <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>{wrap(children)}</View>;
}
const wrap = (children: React.ReactNode) =>
  (Array.isArray(children) ? children.flat() : [children]).map((c, i) => (
    <View key={i} style={{ width: '48%' }}>
      {c}
    </View>
  ));
