import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { tr } from '@kotoventure/shared';
import { H, P, won } from '../ui/kit';
import { C, R } from '../ui/theme';
import { Box, DoneCard, Glass, Metal, OptBtn, SimShell, Slot, WalletBar, useScore, type SimProps } from './kit';

type Opt = 'temp' | 'size';
interface Item {
  id: string;
  ko: string;
  en: string;
  price: number;
  cat: string;
  icon: string;
  opts?: Opt[];
}
const MENUS: Record<string, { cats: [string, string][]; items: Item[] }> = {
  cafe: {
    cats: [
      ['커피', 'Coffee'],
      ['음료', 'Drinks'],
      ['디저트', 'Dessert'],
    ],
    items: [
      { id: 'americano', ko: '아메리카노', en: 'Americano', price: 4500, cat: '커피', icon: '☕', opts: ['temp', 'size'] },
      { id: 'latte', ko: '카페라떼', en: 'Café latte', price: 5000, cat: '커피', icon: '🥛', opts: ['temp', 'size'] },
      { id: 'vanilla', ko: '바닐라라떼', en: 'Vanilla latte', price: 5500, cat: '커피', icon: '🍦', opts: ['temp', 'size'] },
      { id: 'lemonade', ko: '레몬에이드', en: 'Lemonade', price: 5500, cat: '음료', icon: '🍋', opts: ['size'] },
      { id: 'greentea', ko: '녹차라떼', en: 'Green-tea latte', price: 5500, cat: '음료', icon: '🍵', opts: ['temp'] },
      { id: 'hallabong', ko: '한라봉에이드', en: 'Hallabong (Jeju orange) ade', price: 6500, cat: '음료', icon: '🍊', opts: ['size'] },
      { id: 'croffle', ko: '크로플', en: 'Croffle', price: 4500, cat: '디저트', icon: '🧇' },
      { id: 'cheesecake', ko: '치즈케이크', en: 'Cheesecake', price: 6000, cat: '디저트', icon: '🍰' },
    ],
  },
  snack: {
    cats: [
      ['김밥', 'Gimbap'],
      ['분식', 'Snacks'],
      ['음료', 'Drinks'],
    ],
    items: [
      { id: 'gimbap', ko: '김밥', en: 'Gimbap', price: 3500, cat: '김밥', icon: '🍙' },
      { id: 'tuna', ko: '참치김밥', en: 'Tuna gimbap', price: 4500, cat: '김밥', icon: '🐟' },
      { id: 'tteokbokki', ko: '떡볶이', en: 'Tteokbokki', price: 5000, cat: '분식', icon: '🌶️' },
      { id: 'ramyeon', ko: '라면', en: 'Ramyeon', price: 4500, cat: '분식', icon: '🍜' },
      { id: 'sundae', ko: '순대', en: 'Sundae (blood sausage)', price: 5000, cat: '분식', icon: '🌭' },
      { id: 'cola', ko: '콜라', en: 'Cola', price: 2000, cat: '음료', icon: '🥤' },
    ],
  },
  gukbap: {
    cats: [
      ['국밥', 'Rice soup'],
      ['면·수육', 'Noodles & meat'],
      ['추가', 'Extras'],
    ],
    items: [
      { id: 'dwaeji', ko: '돼지국밥', en: 'Pork rice soup', price: 9000, cat: '국밥', icon: '🍲' },
      { id: 'sundaeguk', ko: '순대국밥', en: 'Sundae rice soup', price: 9500, cat: '국밥', icon: '🥘' },
      { id: 'milmyeon', ko: '밀면', en: 'Milmyeon (Busan cold noodles)', price: 8000, cat: '면·수육', icon: '🍜' },
      { id: 'suyuk', ko: '수육 (소)', en: 'Boiled pork slices (small)', price: 15000, cat: '면·수육', icon: '🥩' },
      { id: 'rice', ko: '공기밥 추가', en: 'Extra bowl of rice', price: 1000, cat: '추가', icon: '🍚' },
      { id: 'cider', ko: '사이다', en: 'Cider (lemon-lime soda)', price: 2000, cat: '추가', icon: '🥤' },
    ],
  },
  pcbang: {
    cats: [
      ['시간충전', 'PC time'],
      ['식사', 'Meals'],
      ['음료', 'Drinks'],
    ],
    items: [
      { id: 'pc1', ko: '1시간 충전', en: '1 hour PC time', price: 1500, cat: '시간충전', icon: '⏱️' },
      { id: 'pc3', ko: '3시간 충전', en: '3 hours PC time', price: 4000, cat: '시간충전', icon: '⏳' },
      { id: 'jjapa', ko: '짜파게티', en: 'Jjapaghetti (black-bean noodles)', price: 4500, cat: '식사', icon: '🍝' },
      { id: 'pcramyeon', ko: '라면', en: 'Ramyeon', price: 4000, cat: '식사', icon: '🍜' },
      { id: 'fries', ko: '감자튀김', en: 'French fries', price: 3500, cat: '식사', icon: '🍟' },
      { id: 'icetea', ko: '아이스티', en: 'Iced tea', price: 2500, cat: '음료', icon: '🧋', opts: ['size'] },
    ],
  },
};

interface Line {
  id: string;
  qty: number;
  temp?: 'ice' | 'hot';
  size?: 'R' | 'L';
}
const linePrice = (it: Item, l: Line) => (it.price + (l.size === 'L' ? 500 : 0)) * l.qty;
const describeLine = (it: Item | undefined, l: Line) =>
  `${l.temp === 'ice' ? 'Iced ' : l.temp === 'hot' ? 'Hot ' : ''}${it?.en ?? l.id}${l.size ? ` (${l.size === 'L' ? 'Large' : 'Regular'})` : ''} ×${l.qty}`;

/** Korean self-service kiosk under queue pressure. */
export function KioskSim({ step, ctx, onDone }: SimProps) {
  const ko = ctx.lang === 'ko';
  const cfg = step.config ?? {};
  const menu = MENUS[cfg.menu ?? 'cafe'];
  const order = (cfg.order ?? []) as Line[];
  const sc = useScore(10);
  const [s, setS] = useState<'idle' | 'where' | 'menu' | 'pay' | 'card' | 'num' | 'done'>('idle');
  const [en, setEn] = useState(false);
  const [dine, setDine] = useState<boolean | null>(null);
  const [cat, setCat] = useState(menu.cats[0][0]);
  const [cart, setCart] = useState<Line[]>([]);
  const [opt, setOpt] = useState<{ item: Item; temp?: 'ice' | 'hot'; size?: 'R' | 'L' } | null>(null);
  const [held, setHeld] = useState<string | null>(null);
  const [sec, setSec] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const orderNo = 127;
  const total = cart.reduce((a, l) => a + linePrice(menu.items.find((i) => i.id === l.id)!, l), 0);
  const itemOf = (id: string) => menu.items.find((i) => i.id === id);
  const L = (k: string, e: string) => (en ? e : k);

  useEffect(() => {
    if (s === 'idle' || s === 'num' || s === 'done') return;
    const t = setTimeout(() => setSec((x) => x + 1), 1000);
    return () => clearTimeout(t);
  }, [s, sec]);
  const queue = Math.min(6, Math.floor(sec / 10));

  const addLine = (l: Line) => {
    setCart((c) => {
      const i = c.findIndex((x) => x.id === l.id && x.temp === l.temp && x.size === l.size);
      if (i >= 0) return c.map((x, k) => (k === i ? { ...x, qty: x.qty + 1 } : x));
      return [...c, l];
    });
  };

  const checkout = () => {
    const out: string[] = [];
    let ok = true;
    for (const want of order) {
      const got = cart.find((c) => c.id === want.id && (!want.temp || c.temp === want.temp) && (!want.size || c.size === want.size));
      if (!got || got.qty !== want.qty) {
        ok = false;
        out.push(`✖ ${describeLine(itemOf(want.id), want)}`);
      } else out.push(`✔ ${describeLine(itemOf(want.id), want)}`);
    }
    const extra = cart.filter((c) => !order.some((w) => w.id === c.id && (!w.temp || c.temp === w.temp) && (!w.size || c.size === w.size)));
    if (extra.length) {
      ok = false;
      out.push(`✖ Extra: ${extra.map((e) => describeLine(itemOf(e.id), e)).join(', ')}`);
    }
    if (dine !== (cfg.dineIn ?? true)) {
      ok = false;
      out.push(`✖ ${cfg.dineIn ?? true ? 'Should be 매장 (eat in)' : 'Should be 포장 (take out)'}`);
    }
    if (ok) sc.ok(ko ? '주문 내용이 정확해요!' : 'Order is exactly right!');
    else {
      out.filter((x) => x.startsWith('✖')).forEach(() => sc.miss(ko ? '주문이 달라요 – 영수증을 확인하세요.' : 'Something in the order is wrong – check the receipt.'));
    }
    setLog(out);
    setS('pay');
  };

  const optPanel = opt && (
        <Box style={{ gap: 8, borderWidth: 2, borderColor: C.blue }}>
          <Text style={{ fontWeight: '900', fontSize: 16 }}>
            {opt.item.icon} {L(opt.item.ko, opt.item.en)} – {L('옵션 선택', 'Options')}
          </Text>
          {opt.item.opts?.includes('temp') && (
            <View style={{ flexDirection: 'row', gap: 6 }}>
              <OptBtn testID="k-opt-hot" label="HOT 🔥" selected={opt.temp === 'hot'} color="#DC2626" onPress={() => setOpt({ ...opt, temp: 'hot' })} style={{ flex: 1 }} />
              <OptBtn testID="k-opt-ice" label="ICE 🧊" selected={opt.temp === 'ice'} color="#2563EB" onPress={() => setOpt({ ...opt, temp: 'ice' })} style={{ flex: 1 }} />
            </View>
          )}
          {opt.item.opts?.includes('size') && (
            <View style={{ flexDirection: 'row', gap: 6 }}>
              <OptBtn testID="k-opt-R" label={L('레귤러', 'Regular')} selected={opt.size === 'R'} onPress={() => setOpt({ ...opt, size: 'R' })} style={{ flex: 1 }} />
              <OptBtn testID="k-opt-L" label={`${L('라지', 'Large')} +₩500`} selected={opt.size === 'L'} onPress={() => setOpt({ ...opt, size: 'L' })} style={{ flex: 1 }} />
            </View>
          )}
          <OptBtn
            testID="k-opt-add"
            label={L('담기', 'Add to cart')}
            color="#16A34A"
            disabled={(opt.item.opts?.includes('temp') && !opt.temp) || (opt.item.opts?.includes('size') && !opt.size)}
            onPress={() => {
              addLine({ id: opt.item.id, qty: 1, temp: opt.temp, size: opt.size });
              setOpt(null);
            }}
          />
        </Box>
  );

  const screen = () => {
    if (s === 'menu' && opt) return optPanel;
    switch (s) {
      case 'idle':
        return (
          <Pressable testID="k-start" onPress={() => setS('where')} style={{ alignItems: 'center', gap: 6, paddingVertical: 30 }}>
            <Text style={{ fontSize: 40 }}>👆</Text>
            <Text style={{ fontWeight: '900', fontSize: 16, color: '#1B2140' }}>주문하시려면 화면을 터치하세요</Text>
            <Text style={{ fontSize: 11, color: C.inkSoft }}>Touch to order</Text>
          </Pressable>
        );
      case 'where':
        return (
          <View style={{ gap: 8 }}>
            <Text style={{ fontWeight: '900', textAlign: 'center', color: '#1B2140' }}>{L('식사 장소를 선택하세요', 'Where will you eat?')}</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <OptBtn testID="k-dinein" label={`🍽️ ${L('매장', 'Eat in')}`} style={{ flex: 1, minHeight: 70 }} onPress={() => (setDine(true), setS('menu'))} />
              <OptBtn testID="k-takeout" label={`🛍️ ${L('포장', 'Take out')}`} style={{ flex: 1, minHeight: 70 }} onPress={() => (setDine(false), setS('menu'))} />
            </View>
          </View>
        );
      case 'menu':
        return (
          <View style={{ gap: 6 }}>
            <View style={{ flexDirection: 'row', gap: 4 }}>
              {menu.cats.map(([k, e]) => (
                <OptBtn key={k} testID={`k-cat-${k}`} label={L(k, e)} selected={cat === k} onPress={() => setCat(k)} style={{ flex: 1, minHeight: 34, paddingVertical: 4 }} />
              ))}
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {menu.items
                .filter((i) => i.cat === cat)
                .map((i) => (
                  <Pressable
                    key={i.id}
                    testID={`k-item-${i.id}`}
                    onPress={() => (i.opts?.length ? setOpt({ item: i }) : addLine({ id: i.id, qty: 1 }))}
                    style={{ width: '31%', backgroundColor: '#FFF', borderRadius: 8, padding: 6, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' }}
                  >
                    <Text style={{ fontSize: 26 }}>{i.icon}</Text>
                    <Text style={{ fontWeight: '900', fontSize: 12, color: '#1B2140', textAlign: 'center' }}>{L(i.ko, i.en)}</Text>
                    <Text style={{ fontSize: 11, color: C.inkSoft }}>{won(i.price)}</Text>
                  </Pressable>
                ))}
            </View>
            <View style={{ backgroundColor: '#F1F5F9', borderRadius: 6, padding: 6, gap: 2 }}>
              <Text style={{ fontWeight: '900', fontSize: 12 }}>🛒 {L('장바구니', 'Cart')}</Text>
              {cart.map((l, i) => (
                <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 12 }}>
                    {l.temp ? (l.temp === 'ice' ? 'ICE ' : 'HOT ') : ''}
                    {L(itemOf(l.id)!.ko, itemOf(l.id)!.en)}
                    {l.size ? ` (${l.size === 'L' ? L('라지', 'L') : L('레귤러', 'R')})` : ''} ×{l.qty}
                  </Text>
                  <Pressable testID={`k-rm-${i}`} onPress={() => setCart((c) => c.filter((_, k) => k !== i))}>
                    <Text style={{ color: C.red, fontWeight: '900' }}>✕</Text>
                  </Pressable>
                </View>
              ))}
              <Text style={{ fontWeight: '900', textAlign: 'right' }}>
                {L('합계', 'Total')} {won(total)}
              </Text>
            </View>
            <OptBtn testID="k-checkout" label={`${L('결제하기', 'Pay')} ›`} color="#E5383B" disabled={!cart.length} onPress={checkout} />
          </View>
        );
      case 'pay':
        return (
          <View style={{ gap: 8 }}>
            <Text style={{ fontWeight: '900', textAlign: 'center' }}>
              {L('결제 수단을 선택하세요', 'Choose payment')} · {won(total)}
            </Text>
            <OptBtn testID="k-paycard" label={`💳 ${L('신용/체크카드', 'Credit / debit card')}`} onPress={() => setS('card')} />
            <OptBtn testID="k-paymobile" label={`📱 ${L('간편결제 (삼성페이 등)', 'Mobile pay')}`} onPress={() => sc.info(ko ? '해외 휴대폰 결제는 안 될 수 있어요. 카드를 쓰세요.' : 'Foreign mobile wallets often fail here – use your card.')} />
            <Text style={{ fontSize: 11, color: C.red, textAlign: 'center', fontWeight: '800' }}>{L('현금 결제는 카운터에 문의하세요', 'Cash: please ask at the counter')}</Text>
          </View>
        );
      case 'card':
        return <Text style={{ textAlign: 'center', fontWeight: '900', fontSize: 15, marginVertical: 30 }}>{L('카드를 투입구에 꽂아주세요 ↓', 'Insert your card below ↓')}</Text>;
      case 'num':
        return (
          <View style={{ alignItems: 'center', gap: 4, paddingVertical: 14 }}>
            <Text style={{ fontWeight: '900' }}>{L('주문이 완료되었습니다', 'Order complete')}</Text>
            <Text style={{ fontSize: 13, color: C.inkSoft }}>{L('주문번호', 'Order number')}</Text>
            <Text style={{ fontSize: 40, fontWeight: '900', color: '#E5383B' }}>{orderNo}</Text>
          </View>
        );
      default:
        return null;
    }
  };

  if (s === 'done' || s === 'num')
    return (
      <SimShell title={tr(step.title, ctx.lang)} stage={2} stages={[ko ? '주문' : 'Order', ko ? '결제' : 'Pay', ko ? '픽업' : 'Pick-up']} fb={sc.fb}>
        <Box style={{ alignItems: 'center' }}>{screen()}</Box>
        {s === 'num' ? (
          <>
            <H size={16}>{ko ? '픽업대 화면에 번호가 떴어요. 내 주문은?' : 'The pick-up screen calls numbers. Which one is yours?'}</H>
            <View style={{ backgroundColor: '#0B1020', borderRadius: R.m, padding: 10, gap: 6 }}>
              <Text style={{ color: '#FDE68A', fontWeight: '900', textAlign: 'center' }}>📢 픽업 대기 PICK-UP</Text>
              {[121, orderNo, 172].map((n) => (
                <OptBtn
                  key={n}
                  testID={`k-pick-${n}`}
                  label={`${n}번 고객님 – ${n === 121 ? '준비 완료' : n === orderNo ? '준비 완료' : '준비 중'}`}
                  color="#FDE68A"
                  onPress={() => {
                    if (n === orderNo) sc.ok(ko ? '내 번호 맞아요! 맛있게 드세요.' : 'That’s your number – enjoy!');
                    else sc.miss(ko ? `내 주문번호는 ${orderNo}번이에요.` : `Your order number is ${orderNo}.`);
                    if (sec > 90) sc.miss(ko ? '시간이 오래 걸려 뒤 손님들이 기다렸어요.' : 'You took a while – the queue behind you grew.');
                    setS('done');
                  }}
                />
              ))}
            </View>
          </>
        ) : (
          <DoneCard
            title={ko ? '키오스크 주문 완료' : 'Kiosk order done'}
            score={sc.final()}
            lang={ctx.lang}
            log={[...log, `Time: ${sec}s, people waiting behind you: ${queue}`, `Paid ${won(total)} by card`]}
            onContinue={() => onDone({ score: sc.final(), effects: { money: -total, energy: 8 }, log: ['Ordered at a Korean kiosk'] })}
          />
        )}
      </SimShell>
    );

  return (
    <SimShell title={tr(step.title, ctx.lang)} stage={s === 'pay' || s === 'card' ? 1 : 0} stages={[ko ? '주문' : 'Order', ko ? '결제' : 'Pay', ko ? '픽업' : 'Pick-up']} fb={sc.fb}>
      <P>{tr(step.intro, ctx.lang)}</P>
      <Box style={{ gap: 2, borderLeftWidth: 5, borderLeftColor: C.yellow }}>
        <Text style={{ fontWeight: '900', color: C.ink }}>📝 {ko ? '주문할 것' : 'Your order'}</Text>
        {order.map((l, i) => (
          <Text key={i} style={{ color: C.ink }}>
            • {describeLine(itemOf(l.id), l)}
          </Text>
        ))}
        <Text style={{ color: C.ink }}>• {cfg.dineIn ?? true ? (ko ? '매장에서 먹기 (Eat in)' : 'Eat in') : ko ? '포장 (Take out)' : 'Take out'}</Text>
        <Text style={{ color: queue >= 3 ? C.red : C.inkSoft, fontWeight: '800', marginTop: 4 }}>
          ⏱ {sec}s · {ko ? '뒤에 기다리는 사람' : 'People waiting behind you'}: {'🧍'.repeat(queue) || '0'}
        </Text>
      </Box>
      <Metal colors={['#E2E8F0', '#94A3B8', '#475569']} style={{ padding: 10, alignSelf: 'center', width: '100%', maxWidth: 420 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <Text style={{ fontWeight: '900', color: '#1B2140' }}>🖥️ 무인 주문기 KIOSK</Text>
          {cfg.english ? (
            <Pressable testID="k-lang" onPress={() => setEn((x) => !x)} style={{ backgroundColor: '#FFF', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
              <Text style={{ fontWeight: '900', fontSize: 12 }}>{en ? '한국어' : 'English'}</Text>
            </Pressable>
          ) : (
            <Text style={{ fontSize: 10, color: '#1B2140', fontWeight: '800' }}>{ko ? '영어 지원 없음' : 'Korean only'}</Text>
          )}
        </View>
        <Glass minHeight={240} tint="#FFFFFF">
          {screen()}
        </Glass>
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 8 }}>
          <Slot testID="k-slot-card" label="카드 CARD" sub="IC ▲" width={90} blink={s === 'card'} onPress={() => {
            if (s !== 'card') return sc.info(ko ? '결제 단계에서 카드를 넣어요.' : 'Insert the card at the payment step.');
            if (held !== 'visa') return sc.info(ko ? '지갑에서 카드를 먼저 고르세요.' : 'Select your card in the wallet first.');
            setHeld(null);
            sc.ok(ko ? '결제 완료! 카드를 빼세요.' : 'Payment approved – take your card.');
            setS('num');
          }} />
        </View>
      </Metal>
      {s === 'card' && <WalletBar items={[{ id: 'visa', icon: '💳', label: 'Visa card' }]} selected={held} onSelect={setHeld} />}

    </SimShell>
  );
}
