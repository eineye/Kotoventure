import { useMemo, useState } from 'react';
import { Pressable, View, useWindowDimensions } from 'react-native';
import { Text } from '../ui/Text';
import { KRW_COINS, KRW_NOTES, VENUE_SPREAD, addCash, breakdownKRW, currencyForCountry, tr, CURRENCIES } from '@kotoventure/shared';
import { Banknote, Coin } from '../art/Money';
import { Btn, H, P, won } from '../ui/kit';
import { C, R } from '../ui/theme';
import { Box, DoneCard, MoneyTray, OptBtn, SimShell, notePx, useScore, type SimProps } from './kit';

/**
 * 환전 simulation:
 * 1) read the rate board for YOUR currency  2) decide how much to exchange
 * 3) count the money the teller gives you   4) recognise every note & coin (front/back)
 */
export function ExchangeSim({ step, ctx, onDone }: SimProps) {
  const { width } = useWindowDimensions();
  const venue = step.config?.venue ?? 'airport';
  const target = step.config?.targetKRW ?? (venue === 'airport' ? 100000 : 300000);
  const home = currencyForCountry(ctx.country);
  const mid = ctx.fxRates[home.code] ?? ctx.fxRates.USD ?? 1400;
  const buy = mid * (1 - VENUE_SPREAD[venue]);
  const sc = useScore();
  const [stage, setStage] = useState(0);
  const [amount, setAmount] = useState(home.presets[1]);
  const [received, setReceived] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const [noteQ, setNoteQ] = useState<number | null>(null);
  const [flip, setFlip] = useState<Record<string, boolean>>({});
  const noteW = Math.min(width - 60, 300);
  const pxPerMm = noteW / 154;

  const krw = (a: number) => Math.floor((a * buy) / 1000) * 1000; // counters pay out in ₩1,000 units
  const stages = ['Rate board', 'Amount', 'Count it', 'Know your money', 'Done'];
  const add = (l: string) => setLog((x) => [...x, l]);

  // stage 2: count quiz options
  const countOptions = useMemo(() => {
    const parts = breakdownKRW(received);
    const fifty = parts.find((p) => p.value === 50000)?.count ?? 0;
    const wrong1 = received - fifty * 45000 || received + 45000; // mistaking ₩50,000 for ₩5,000
    const wrong2 = received + 10000;
    return [received, wrong1, wrong2].sort((a, b) => ((a * 7) % 3) - ((b * 7) % 3));
  }, [received]);

  const rows = ['USD', 'JPY', 'CNY', 'EUR', 'AUD', home.code].filter((v, i, a) => a.indexOf(v) === i && ctx.fxRates[v]);

  return (
    <SimShell title={tr(step.title, ctx.lang)} stage={stage} stages={stages} fb={sc.fb}>
      {stage === 0 && (
        <>
          <P>{tr(step.intro, ctx.lang)}</P>
          {/* LED rate board */}
          <View style={{ backgroundColor: '#0B1020', borderRadius: R.m, padding: 10, borderWidth: 4, borderColor: '#334155' }}>
            <Text style={{ color: '#FDE68A', fontWeight: '900', textAlign: 'center' }}>
              환율 EXCHANGE RATES · {venue === 'airport' ? '공항 Airport' : '시내 환전소 Downtown'}
            </Text>
            <View style={{ flexDirection: 'row', marginTop: 6 }}>
              {['통화 Currency', '기준 Base', '현찰 살때 We buy'].map((h) => (
                <Text key={h} style={{ flex: 1, color: '#94A3B8', fontSize: 10, fontWeight: '800' }}>
                  {h}
                </Text>
              ))}
            </View>
            {rows.map((code) => {
              const m = ctx.fxRates[code];
              const per = code === 'JPY' || code === 'VND' ? 100 : 1;
              const mine = code === home.code;
              return (
                <View key={code} style={{ flexDirection: 'row', paddingVertical: 4, backgroundColor: mine ? '#1E3A8A' : 'transparent', borderRadius: 4 }}>
                  <Text style={{ flex: 1, color: mine ? '#FFF' : '#E2E8F0', fontWeight: '900' }}>
                    {code}
                    {per > 1 ? ` (${per})` : ''}
                    {mine ? ' ◀ YOU' : ''}
                  </Text>
                  <Text style={{ flex: 1, color: '#86EFAC', fontWeight: '900', fontVariant: ['tabular-nums'] }}>{(m * per).toFixed(2)}</Text>
                  <Text style={{ flex: 1, color: '#FCA5A5', fontWeight: '900', fontVariant: ['tabular-nums'] }}>{(m * per * (1 - VENUE_SPREAD[venue])).toFixed(2)}</Text>
                </View>
              );
            })}
          </View>
          <P dim style={{ fontSize: 12 }}>
            Reference rates set by the game admin – always check a live rate. “We buy” is what the counter pays you for your {home.name}.
          </P>
          <H size={16}>
            How many won do you get for 1 {home.code}?
          </H>
          {[buy, mid, buy * 0.9].map((v, i) => (
            <OptBtn
              key={i}
              testID={`opt-${i}`}
              label={`about ₩${v.toFixed(v < 10 ? 2 : 0)}`}
              onPress={() => {
                if (i === 0) sc.ok('Right – you get the "We buy" rate, not the base rate.');
                else sc.miss(`The base rate is only a reference. Counters pay you the "We buy" rate: ₩${buy.toFixed(buy < 10 ? 2 : 0)}.`);
                add(`Read the board: 1 ${home.code} ≈ ₩${buy.toFixed(buy < 10 ? 2 : 0)} (${venue}, spread ${(VENUE_SPREAD[venue] * 100).toFixed(1)}%)`);
                setStage(1);
              }}
            />
          ))}
        </>
      )}

      {stage === 1 && (
        <>
          <Box>
            <Text style={{ fontWeight: '900', color: C.inkSoft }}>🎯 Mission</Text>
            <P>
              {venue === 'airport'
                ? `Airport rates are poor. Change only what you need until you reach downtown (about ${won(target)}): T-money, a snack, a taxi just in case.`
                : `You need about ${won(target)} in cash for markets, street food and T-money top-ups. Use your card for everything else.`}
            </P>
          </Box>
          <H size={16}>How much {home.name} will you exchange?</H>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {home.presets.map((p) => (
              <OptBtn key={p} testID={`amt-${p}`} label={`${home.symbol}${p.toLocaleString('en-US')}`} selected={amount === p} onPress={() => setAmount(p)} style={{ minWidth: 90 }} />
            ))}
          </View>
          <Box style={{ alignItems: 'center' }}>
            <Text style={{ color: C.inkSoft, fontWeight: '800' }}>
              You give {home.symbol}
              {amount.toLocaleString('en-US')} {home.code}
            </Text>
            <Text style={{ fontSize: 30, fontWeight: '900', color: C.green }}>{won(krw(amount))}</Text>
            <Text style={{ color: C.inkSoft, fontSize: 12 }}>
              Lost to the spread: about {won(amount * mid - krw(amount))}
            </Text>
          </Box>
          <Btn
            testID="sim-next"
            label="Exchange this amount"
            onPress={() => {
              const got = krw(amount);
              const ratio = got / target;
              if (venue === 'airport' && ratio > 2) sc.miss(`That's a lot at a bad airport rate – about ${won(amount * mid - got)} lost. Next time change less here.`);
              else if (ratio < 0.4) sc.miss(`Only ${won(got)} – you may run short of cash today.`);
              else if (ratio > 0.6 && ratio < 1.6) {
                sc.ok('Good amount for the mission!');
                sc.addBonus(5);
              } else sc.info('OK – a bit off the suggested amount, but it works.');
              setReceived(got);
              add(`Exchanged ${home.symbol}${amount.toLocaleString('en-US')} → ${won(got)} (passport shown)`);
              setStage(2);
            }}
          />
        </>
      )}

      {stage === 2 && (
        <>
          <P>The teller hands you the money with your passport and receipt. Always count it at the counter!</P>
          <Box>
            <MoneyTray amount={received} noteWidth={Math.min(width - 150, 210)} />
          </Box>
          <H size={16}>How much did you receive?</H>
          {countOptions.map((v, i) => (
            <OptBtn
              key={i}
              testID={`opt-${i}`}
              label={won(v)}
              onPress={() => {
                if (v === received) sc.ok('Counted correctly.');
                else sc.miss(`Careful: the yellow ₩50,000 and the orange ₩5,000 look alike. The total is ${won(received)}.`);
                add(`Counted the cash: ${won(received)}`);
                setNoteQ(KRW_NOTES[Math.floor((received / 1000) % 4)].value);
                setStage(3);
              }}
            />
          ))}
        </>
      )}

      {stage === 3 && noteQ && (
        <>
          <H size={16}>Tap the {won(noteQ)} note</H>
          <P dim style={{ fontSize: 12 }}>Notes are shown at their real relative size – bigger value, longer note.</P>
          {[...KRW_NOTES]
            .sort((a, b) => ((a.value * 13) % 7) - ((b.value * 13) % 7))
            .map((n) => (
              <Pressable
                key={n.value}
                testID={`note-${n.value}`}
                onPress={() => {
                  if (n.value === noteQ) {
                    sc.ok(`Yes! ${won(n.value)} – ${tr(n.person, 'en')}.`);
                    setNoteQ(null);
                  } else sc.miss(`That is ${won(n.value)} (${tr(n.person, 'en')}).`);
                }}
              >
                <Banknote value={n.value} width={(noteW * notePx(n.value)) / 154} />
              </Pressable>
            ))}
        </>
      )}

      {stage === 3 && !noteQ && (
        <>
          <H size={17}>📖 Know your money – tap to flip front/back</H>
          {KRW_NOTES.map((n) => {
            const k = `n${n.value}`;
            return (
              <Box key={k}>
                <Pressable onPress={() => setFlip((f) => ({ ...f, [k]: !f[k] }))} testID={`flip-${n.value}`}>
                  <Banknote value={n.value} side={flip[k] ? 'back' : 'front'} width={(noteW * notePx(n.value)) / 154} />
                </Pressable>
                <Text style={{ fontWeight: '900', color: n.dark, marginTop: 6 }}>
                  {won(n.value)} {n.ko} · {n.sizeMm[0]}×{n.sizeMm[1]} mm
                </Text>
                <P style={{ fontSize: 13 }}>👤 {tr(n.person, ctx.lang)}</P>
                <P style={{ fontSize: 13 }}>{flip[k] ? '🔄 Back: ' + tr(n.back, ctx.lang) : '▶ Front: ' + tr(n.front, ctx.lang)}</P>
                <P dim style={{ fontSize: 12 }}>🔒 {tr(n.security, ctx.lang)}</P>
              </Box>
            );
          })}
          <Box>
            <Text style={{ fontWeight: '900', color: C.ink, marginBottom: 6 }}>Coins (real relative size) – tap to flip</Text>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around' }}>
              {KRW_COINS.map((c) => {
                const k = `c${c.value}`;
                return (
                  <Pressable key={k} onPress={() => setFlip((f) => ({ ...f, [k]: !f[k] }))} style={{ alignItems: 'center' }}>
                    <Coin value={c.value} side={flip[k] ? 'back' : 'front'} pxPerMm={pxPerMm * 1.9} />
                    <Text style={{ fontWeight: '900', fontSize: 12 }}>{won(c.value)}</Text>
                    <Text style={{ fontSize: 10, color: C.inkSoft }}>{c.diameterMm} mm</Text>
                    <Text style={{ fontSize: 10, color: C.inkSoft, textAlign: 'center', width: 70 }}>{tr(c.motif, ctx.lang)}</Text>
                  </Pressable>
                );
              })}
            </View>
          </Box>
          <Btn
            testID="sim-next"
            label="I know my won!"
            onPress={() => {
              add('Checked all 4 notes and 4 coins (front & back)');
              setStage(4);
            }}
          />
        </>
      )}

      {stage === 4 && (
        <DoneCard
          title="Exchange complete"
          score={sc.final()}
          log={log}
          lang={ctx.lang}
          onContinue={() => onDone({ score: sc.final(), effects: { money: -Math.round(amount * mid - received) }, log, cash: addCash(ctx.cash, received) })}
        />
      )}
    </SimShell>
  );
}

export const homeCurrencies = CURRENCIES;
