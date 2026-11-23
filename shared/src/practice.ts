/**
 * Data for the everyday-life simulations: city bus, attraction ticket office, restaurant menu
 * and trash sorting. Prices are realistic 2025 examples for gameplay – always check on site.
 */
import type { PartyType } from './types';

/* ───────────── city bus ───────────── */
export type BusColor = 'blue' | 'green' | 'yellow' | 'red';
export const BUS_COLORS: Record<BusColor, { ko: string; en: string; hex: string }> = {
  blue: { ko: '간선', en: 'Trunk (long city routes)', hex: '#2563EB' },
  green: { ko: '지선', en: 'Branch (local, to subway)', hex: '#16A34A' },
  yellow: { ko: '순환', en: 'Circular (downtown loop)', hex: '#EAB308' },
  red: { ko: '광역', en: 'Express (to suburbs)', hex: '#DC2626' },
};
export const BUS_FARE = 1500;

/* ───────────── attraction tickets ───────────── */
export type TicketKind = 'adult' | 'youth' | 'child' | 'senior';
export interface TicketSite {
  id: string;
  ko: string;
  en: string;
  open: string;
  lastEntry: string;
  prices: Record<TicketKind, number>;
  /** free entry for visitors wearing hanbok */
  hanbokFree?: boolean;
  note: { en: string; ko?: string };
}
export const TICKET_SITES: Record<string, TicketSite> = {
  palace: {
    id: 'palace', ko: '경복궁 매표소', en: 'Gyeongbokgung ticket office', open: '09:00', lastEntry: '17:00',
    prices: { adult: 3000, youth: 1500, child: 1500, senior: 0 }, hanbokFree: true,
    note: { en: 'Wearing hanbok = free entry. Keep your ticket until you leave.', ko: '한복 착용 시 무료 입장.' },
  },
  seongsan: {
    id: 'seongsan', ko: '성산일출봉 매표소', en: 'Seongsan Ilchulbong ticket office', open: '07:00', lastEntry: '19:00',
    prices: { adult: 5000, youth: 2500, child: 2500, senior: 0 },
    note: { en: 'UNESCO site – the trail is steep; seniors 65+ enter free.', ko: '경사가 가파름, 65세 이상 무료.' },
  },
  wolji: {
    id: 'wolji', ko: '동궁과 월지 매표소', en: 'Donggung & Wolji ticket office', open: '09:00', lastEntry: '21:30',
    prices: { adult: 3000, youth: 2000, child: 1000, senior: 0 },
    note: { en: 'Open until 22:00 – the night reflection is the highlight.', ko: '야경 명소.' },
  },
  tower: {
    id: 'tower', ko: 'N서울타워 전망대 매표소', en: 'N Seoul Tower observatory', open: '10:00', lastEntry: '22:30',
    prices: { adult: 21000, youth: 17000, child: 17000, senior: 17000 },
    note: { en: 'Observatory ticket – the plaza below is free.', ko: '광장은 무료, 전망대 유료.' },
  },
};
export const TICKET_LABEL: Record<TicketKind, { ko: string; en: string }> = {
  adult: { ko: '성인 (19–64세)', en: 'Adult (19–64)' },
  youth: { ko: '청소년 (13–18세)', en: 'Youth (13–18)' },
  child: { ko: '어린이 (7–12세)', en: 'Child (7–12)' },
  senior: { ko: '경로 (65세 이상)', en: 'Senior (65+)' },
};
/** Who is travelling (ages) – group = a 3-generation family. */
export const PARTY_PEOPLE: Record<PartyType, { kind: TicketKind; who: string }[]> = {
  solo: [{ kind: 'adult', who: 'You (31)' }],
  couple: [{ kind: 'adult', who: 'You (29)' }, { kind: 'adult', who: 'Partner (30)' }],
  friends: [{ kind: 'adult', who: 'You (24)' }, { kind: 'adult', who: 'Friend (25)' }, { kind: 'adult', who: 'Friend (23)' }],
  group: [
    { kind: 'adult', who: 'You (41)' },
    { kind: 'adult', who: 'Spouse (39)' },
    { kind: 'youth', who: 'Daughter (14)' },
    { kind: 'child', who: 'Son (9)' },
    { kind: 'senior', who: 'Grandma (68)' },
    { kind: 'senior', who: 'Grandpa (71)' },
  ],
};
export function ticketTotal(site: TicketSite, counts: Partial<Record<TicketKind, number>>, hanbok = false) {
  if (hanbok && site.hanbokFree) return 0;
  return (Object.keys(counts) as TicketKind[]).reduce((a, k) => a + (counts[k] ?? 0) * site.prices[k], 0);
}

/* ───────────── restaurant menus ───────────── */
export interface MenuItem {
  id: string;
  ko: string;
  en: string;
  price: number;
  /** counts as a main dish portion (per person) */
  main?: boolean;
  /** minimum order in portions (e.g. "2인분 이상") */
  min?: number;
  spicy?: 0 | 1 | 2;
  cat: 'main' | 'side' | 'drink';
}
export interface Restaurant {
  id: string;
  ko: string;
  en: string;
  items: MenuItem[];
  /** how you pay */
  payAt: 'counter' | 'table';
  selfBar?: boolean;
  /** kind of restaurant – decides extras, refills and the label on the menu board */
  kind?: CuisineKind;
}

/* ───────────── kinds of restaurants ───────────── */
export type CuisineKind = 'korean' | 'bbq' | 'seafood' | 'noodle' | 'chinese' | 'snack' | 'chicken' | 'pub' | 'street' | 'bakery' | 'convenience' | 'western' | 'fusion';
/** what you can get more of for free – asked in the "meal" stage */
export type RefillKind = 'banchan' | 'danmuji' | 'pickle' | 'radish' | 'water';
type Extra = [id: string, ko: string, en: string, price: number, cat: 'side' | 'drink', spicy?: 1 | 2];
export const CUISINES: Record<CuisineKind, { ko: string; en: string; icon: string; refill: RefillKind; extras: Extra[] }> = {
  korean: { ko: '한식', en: 'Korean', icon: '🍚', refill: 'banchan', extras: [['rice', '공기밥', 'Bowl of rice', 1000, 'side'], ['gyeran', '계란말이', 'Rolled omelette (to share)', 8000, 'side'], ['makgeolli', '막걸리', 'Makgeolli (rice wine)', 5000, 'drink'], ['cola', '콜라', 'Cola', 2000, 'drink']] },
  bbq: { ko: '고깃집', en: 'Korean BBQ', icon: '🥩', refill: 'banchan', extras: [['doenjang', '된장찌개', 'Soybean stew', 3000, 'side'], ['naeng', '물냉면', 'Cold noodles (after the meat)', 8000, 'side'], ['rice', '공기밥', 'Bowl of rice', 1000, 'side'], ['soju', '소주', 'Soju', 5000, 'drink'], ['cola', '콜라', 'Cola', 2000, 'drink']] },
  seafood: { ko: '해산물·횟집', en: 'Seafood', icon: '🐟', refill: 'banchan', extras: [['maeuntang', '매운탕 (회 먹은 후)', 'Spicy fish-bone stew (after sashimi)', 5000, 'side', 2], ['rice', '공기밥', 'Bowl of rice', 1000, 'side'], ['soju', '소주', 'Soju', 5000, 'drink'], ['cider', '사이다', 'Cider (lemon-lime soda)', 2000, 'drink']] },
  noodle: { ko: '국수·칼국수', en: 'Noodle house', icon: '🍜', refill: 'banchan', extras: [['mandu', '왕만두', 'Big dumplings', 6000, 'side'], ['rice', '공기밥 (국물에 말아 먹기)', 'Rice (to drop into the broth)', 1000, 'side'], ['cola', '콜라', 'Cola', 2000, 'drink']] },
  chinese: { ko: '중식 (한국식 중화요리)', en: 'Chinese-Korean', icon: '🥟', refill: 'danmuji', extras: [['gunmandu', '군만두', 'Fried dumplings', 6000, 'side'], ['rice', '공기밥', 'Bowl of rice', 1000, 'side'], ['goryangju', '고량주', 'Kaoliang liquor', 8000, 'drink'], ['cola', '콜라', 'Cola', 2000, 'drink']] },
  snack: { ko: '분식', en: 'Bunsik (snack bar)', icon: '🍙', refill: 'danmuji', extras: [['sundae', '순대', 'Korean blood sausage', 5000, 'side'], ['eomuk', '어묵', 'Fish-cake skewers', 3000, 'side'], ['twigim', '모둠튀김', 'Assorted fritters', 5000, 'side'], ['coolpis', '쿨피스', 'Coolpis (peach drink)', 1500, 'drink']] },
  chicken: { ko: '치킨집', en: 'Fried-chicken pub', icon: '🍗', refill: 'radish', extras: [['fries', '감자튀김', 'French fries', 5000, 'side'], ['beer', '생맥주 500cc', 'Draft beer 500 ml', 4500, 'drink'], ['cola', '콜라 1.25L', 'Cola 1.25 L', 3000, 'drink']] },
  pub: { ko: '호프·포차', en: 'Korean pub', icon: '🍺', refill: 'banchan', extras: [['fries', '감자튀김', 'French fries', 6000, 'side'], ['beer', '생맥주 500cc', 'Draft beer 500 ml', 4000, 'drink'], ['soju', '소주', 'Soju', 5000, 'drink'], ['cider', '사이다', 'Cider (soda)', 2000, 'drink']] },
  street: { ko: '시장·노점', en: 'Market & street food', icon: '🏮', refill: 'water', extras: [['eomuk', '어묵 꼬치', 'Fish-cake skewer', 1500, 'side'], ['sikhye', '식혜', 'Sikhye (sweet rice drink)', 3000, 'drink'], ['water', '생수', 'Bottled water', 1000, 'drink']] },
  bakery: { ko: '빵집·베이커리', en: 'Bakery', icon: '🥐', refill: 'water', extras: [['milk', '우유', 'Milk', 2500, 'drink'], ['americano', '아메리카노', 'Americano', 4500, 'drink'], ['latte', '카페라테', 'Café latte', 5000, 'drink']] },
  convenience: { ko: '편의점', en: 'Convenience store', icon: '🏪', refill: 'water', extras: [['samgak', '삼각김밥', 'Triangle gimbap', 1500, 'side'], ['banana', '바나나맛 우유', 'Banana milk', 1700, 'drink'], ['beer', '캔맥주', 'Canned beer', 3000, 'drink']] },
  western: { ko: '양식', en: 'Western', icon: '🍝', refill: 'pickle', extras: [['salad', '시저 샐러드', 'Caesar salad (to share)', 13000, 'side'], ['fries', '트러플 감자튀김', 'Truffle fries', 9000, 'side'], ['wine', '하우스 와인 (잔)', 'House wine (glass)', 9000, 'drink'], ['ade', '레몬에이드', 'Lemonade', 6000, 'drink'], ['cola', '콜라', 'Cola', 3000, 'drink']] },
  fusion: { ko: '퓨전', en: 'Fusion', icon: '✨', refill: 'pickle', extras: [['fries', '감자튀김', 'French fries', 7000, 'side'], ['ade', '자몽에이드', 'Grapefruit ade', 6500, 'drink'], ['beer', '수제 맥주', 'Craft beer', 8000, 'drink'], ['cola', '콜라', 'Cola', 3000, 'drink']] },
};

/** Kinds where dishes are shared: one main per two people is enough (a whole chicken, pub snacks). */
export const SHARED_KINDS: CuisineKind[] = ['chicken', 'pub'];
/** Main portions a party should order at this restaurant. */
export const mainsNeeded = (r: Restaurant, people: number) => (SHARED_KINDS.includes(r.kind ?? 'korean') ? Math.ceil(people / 2) : people);

/** How ordering works, per kind – shown as the intro of the menu simulation. */
const HOW_TO_ORDER: Record<CuisineKind, [en: string, ko: string]> = {
  korean: ['The menu on the wall is only in Korean. Order one main dish per person – side dishes (banchan) come free.', '벽에 붙은 메뉴판은 한글뿐이에요. 1인 1메뉴로 주문하세요. 반찬은 무료로 나와요.'],
  bbq: ['Korean BBQ: meat is ordered by the portion (인분) and grilled at your table. Order one portion per person, then doenjang stew, rice or cold noodles to finish.', '고깃집: 고기는 인분 단위로 주문하고 테이블에서 구워요. 1인 1인분이 기본이고, 마무리로 된장찌개·공기밥·냉면을 시켜요.'],
  seafood: ['Seafood restaurant: big platters are priced per dish for sharing, but count one main per person. After sashimi, the bones become a spicy stew (매운탕).', '해산물 식당: 큰 접시는 나눠 먹지만 인원수만큼 주메뉴를 시켜요. 회를 먹고 나면 남은 뼈로 매운탕을 끓여 줘요.'],
  noodle: ['Noodle house: one bowl per person. Kimchi is on the table and refills are free; add rice to drop into the leftover broth.', '국숫집: 1인 1그릇. 김치는 테이블에 있고 리필은 무료예요. 남은 국물에 공기밥을 말아 먹어요.'],
  chinese: ['Korean-Chinese restaurant: one noodle dish per person (jjajangmyeon or spicy jjamppong) and tangsuyuk to share. Danmuji and onion come free.', '중식당: 1인 1면(짜장면·짬뽕)에 탕수육은 함께 나눠 먹어요. 단무지·양파는 무료예요.'],
  snack: ['Bunsik (snack bar): cheap and quick. Order one dish per person and a few to share – danmuji is free.', '분식집: 싸고 빨라요. 1인 1메뉴에 나눠 먹을 메뉴를 더해요. 단무지는 무료예요.'],
  chicken: ['Fried-chicken pub: one whole chicken feeds about two people, so order one chicken for every two. Free pickled radish (치킨무) comes with it.', '치킨집: 치킨 한 마리는 2명 정도가 먹어요. 2명당 한 마리를 시키세요. 치킨무는 무료예요.'],
  pub: ['Korean pub: everyone shares anju (food for drinking) – about one dish for every two people – plus drinks.', '호프·포차: 안주를 함께 나눠 먹어요. 2명당 안주 하나 정도에 음료를 시켜요.'],
  street: ['Market stalls: point at what you want and pay on the spot. Get one item per person and try a few things.', '시장·노점: 원하는 음식을 가리키고 바로 계산해요. 1인 1개씩 골라 여러 가지를 맛보세요.'],
  bakery: ['Bakery: take a tray and tongs, pick one bread per person and pay at the counter. Drinks are ordered at the counter too.', '빵집: 쟁반과 집게를 들고 1인 1개씩 골라 계산대에서 계산해요. 음료도 계산대에서 주문해요.'],
  convenience: ['Convenience store: pick one item per person, pay at the counter, then use the hot-water machine or microwave yourself.', '편의점: 1인 1개씩 골라 계산대에서 계산하고, 온수기·전자레인지는 직접 사용해요.'],
  western: ['Western restaurant in Korea: one main per person and no 2-portion rule. Pickles come free, water is often self-service and there is no tipping.', '한국의 양식당: 1인 1메뉴, 2인분 제한은 없어요. 피클은 무료, 물은 셀프인 경우가 많고 팁은 없어요.'],
  fusion: ['Fusion restaurant: Korean flavours on Western dishes. One main per person, a side to share – free pickles, no tipping.', '퓨전 식당: 서양 요리에 한국 맛을 더했어요. 1인 1메뉴에 나눠 먹을 사이드 하나, 피클은 무료이고 팁은 없어요.'],
};
/** Intro text of the menu simulation, matching the kind of restaurant and its menu. */
export function menuIntro(r: Restaurant): { en: string; ko: string } {
  const [en, ko] = HOW_TO_ORDER[r.kind ?? 'korean'];
  const min = r.items.find((i) => i.min);
  const spicy = r.items.some((i) => i.spicy);
  return {
    en: [en, min ? `Watch the "${min.min}인분 이상" mark – some dishes need at least ${min.min} portions.` : '', spicy ? '🌶️ marks spicy dishes.' : ''].filter(Boolean).join(' '),
    ko: [ko, min ? `"${min.min}인분 이상" 표시가 있는 메뉴는 ${min.min}인분부터 주문할 수 있어요.` : '', spicy ? '🌶️ 표시는 매운 음식이에요.' : ''].filter(Boolean).join(' '),
  };
}

/** Guess the kind of a restaurant from its name and dishes (Korean). Order matters. */
export function inferCuisine(placeKo: string, dishesKo: string[]): CuisineKind {
  const all = [placeKo, ...dishesKo].join(' ');
  const has = (re: RegExp, s = all) => re.test(s);
  if (has(/편의점/, placeKo)) return 'convenience';
  if (has(/빵집|베이커리|제과/, placeKo)) return 'bakery';
  if (has(/중식|중화|반점/, placeKo) || dishesKo.filter((d) => /^(짜장|짬뽕|탕수육|깐풍|양장피)/.test(d)).length >= 2) return 'chinese';
  if (has(/양식|이탈리안|비스트로|파스타|피자|스테이크|버거/, placeKo)) return 'western';
  if (has(/퓨전/, placeKo)) return 'fusion';
  if (has(/치킨|통닭|닭강정/, placeKo)) return 'chicken';
  if (has(/노가리|호프|포차/, placeKo)) return 'pub';
  if (has(/분식|김밥/, placeKo)) return 'snack';
  if (has(/횟집|수산|조개구이|해녀|갈치|게장|꼬막/, placeKo)) return 'seafood';
  if (has(/고깃집|삼겹살|한우|갈비|흑돼지|닭갈비|막창/, placeKo)) return 'bbq';
  if (has(/칼국수|국수|밀면|막국수|수제비|냉면/, placeKo)) return 'noodle';
  if (has(/야시장|장터|시장/, placeKo)) return 'street';
  return 'korean';
}
export const RESTAURANTS: Record<string, Restaurant> = {
  bbq: {
    id: 'bbq', kind: 'bbq', ko: '을지로 고깃집', en: 'Euljiro BBQ house', payAt: 'counter', selfBar: true,
    items: [
      { id: 'samgyeop', ko: '삼겹살', en: 'Pork belly', price: 16000, main: true, min: 2, cat: 'main' },
      { id: 'moksal', ko: '목살', en: 'Pork neck', price: 16000, main: true, min: 2, cat: 'main' },
      { id: 'galbi', ko: '양념갈비', en: 'Marinated ribs', price: 18000, main: true, min: 2, cat: 'main' },
      { id: 'doenjang', ko: '된장찌개', en: 'Soybean stew', price: 3000, cat: 'side' },
      { id: 'naeng', ko: '물냉면', en: 'Cold noodles', price: 8000, cat: 'side' },
      { id: 'rice', ko: '공기밥', en: 'Bowl of rice', price: 1000, cat: 'side' },
      { id: 'soju', ko: '소주', en: 'Soju', price: 5000, cat: 'drink' },
      { id: 'cola', ko: '콜라', en: 'Cola', price: 2000, cat: 'drink' },
    ],
  },
  blackpork: {
    id: 'blackpork', kind: 'bbq', ko: '제주 흑돼지집', en: 'Jeju black-pork house', payAt: 'counter', selfBar: false,
    items: [
      { id: 'ogyeop', ko: '흑돼지 오겹살', en: 'Black pork belly', price: 23000, main: true, min: 2, cat: 'main' },
      { id: 'bpmok', ko: '흑돼지 목살', en: 'Black pork neck', price: 22000, main: true, min: 2, cat: 'main' },
      { id: 'gogi-guksu', ko: '고기국수', en: 'Pork noodle soup', price: 9000, main: true, cat: 'main' },
      { id: 'kimchi-jjigae', ko: '김치찌개', en: 'Kimchi stew', price: 8000, spicy: 1, cat: 'side' },
      { id: 'rice', ko: '공기밥', en: 'Bowl of rice', price: 1000, cat: 'side' },
      { id: 'hallasan', ko: '한라산 소주', en: 'Hallasan soju', price: 6000, cat: 'drink' },
      { id: 'cider', ko: '사이다', en: 'Cider (soda)', price: 2000, cat: 'drink' },
    ],
  },
  jjigae: {
    id: 'jjigae', kind: 'korean', ko: '인사동 백반집', en: 'Insadong home-style eatery', payAt: 'counter',
    items: [
      { id: 'kimchi-jjigae', ko: '김치찌개', en: 'Kimchi stew', price: 9000, main: true, spicy: 1, cat: 'main' },
      { id: 'doenjang-jjigae', ko: '된장찌개', en: 'Soybean stew', price: 9000, main: true, cat: 'main' },
      { id: 'sundubu', ko: '순두부찌개', en: 'Soft tofu stew (spicy)', price: 9500, main: true, spicy: 2, cat: 'main' },
      { id: 'jeyuk', ko: '제육볶음', en: 'Spicy stir-fried pork', price: 10000, main: true, spicy: 2, cat: 'main' },
      { id: 'bulgogi', ko: '불고기 정식', en: 'Bulgogi set (not spicy)', price: 12000, main: true, cat: 'main' },
      { id: 'gyeran', ko: '계란말이', en: 'Rolled omelette (to share)', price: 8000, cat: 'side' },
      { id: 'rice', ko: '공기밥 추가', en: 'Extra rice', price: 1000, cat: 'side' },
    ],
  },
  ssambap: {
    id: 'ssambap', kind: 'korean', ko: '교촌 쌈밥집', en: 'Gyochon ssambap house', payAt: 'table',
    items: [
      { id: 'ssam', ko: '쌈밥 정식', en: 'Leaf-wrap rice set', price: 15000, main: true, min: 2, cat: 'main' },
      { id: 'ssam-bulgogi', ko: '불고기 쌈밥', en: 'Bulgogi wrap set', price: 18000, main: true, min: 2, cat: 'main' },
      { id: 'haemul-pajeon', ko: '해물파전', en: 'Seafood pancake (to share)', price: 15000, cat: 'side' },
      { id: 'beopju', ko: '교동법주', en: 'Gyodong beopju (rice wine)', price: 12000, cat: 'drink' },
      { id: 'sikhye', ko: '식혜', en: 'Sikhye (sweet rice drink)', price: 3000, cat: 'drink' },
    ],
  },
};
/** Portions of main dishes ordered. */
export const mainPortions = (r: Restaurant, order: Record<string, number>) => r.items.filter((i) => i.main).reduce((a, i) => a + (order[i.id] ?? 0), 0);
export const orderTotal = (r: Restaurant, order: Record<string, number>) => r.items.reduce((a, i) => a + (order[i.id] ?? 0) * i.price, 0);

/* ───────────── trash sorting ───────────── */
export type BinId = 'general' | 'food' | 'plastic' | 'can' | 'glass' | 'paper' | 'vinyl';
export const BINS: Record<BinId, { ko: string; en: string; color: string; icon: string }> = {
  general: { ko: '일반쓰레기', en: 'General waste', color: '#52525B', icon: '🗑️' },
  food: { ko: '음식물', en: 'Food waste', color: '#CA8A04', icon: '🍲' },
  plastic: { ko: '플라스틱', en: 'Plastic', color: '#2563EB', icon: '🧴' },
  can: { ko: '캔·고철', en: 'Cans', color: '#B91C1C', icon: '🥫' },
  glass: { ko: '유리병', en: 'Glass', color: '#059669', icon: '🍾' },
  paper: { ko: '종이', en: 'Paper', color: '#92400E', icon: '📦' },
  vinyl: { ko: '비닐', en: 'Plastic film', color: '#7C3AED', icon: '🛍️' },
};
export interface TrashItem {
  id: string;
  ko: string;
  en: string;
  icon: string;
  bin: BinId;
  why: string;
}
export const TRASH: TrashItem[] = [
  { id: 'pet', ko: '생수병 (라벨 제거)', en: 'Water bottle (label off)', icon: '💧', bin: 'plastic', why: 'Empty it, peel off the label (film), squash it – then plastic/PET.' },
  { id: 'can', ko: '맥주 캔', en: 'Beer can', icon: '🍺', bin: 'can', why: 'Empty, rinse if sticky – cans go to the can bin.' },
  { id: 'chicken-meat', ko: '남은 치킨 살', en: 'Leftover chicken meat', icon: '🍗', bin: 'food', why: 'Leftover food → food waste (it becomes animal feed or compost).' },
  { id: 'bones', ko: '치킨 뼈', en: 'Chicken bones', icon: '🦴', bin: 'general', why: 'Surprise! Bones can\'t be fed or composted → general waste.' },
  { id: 'peel', ko: '귤 껍질', en: 'Tangerine peel', icon: '🍊', bin: 'food', why: 'Soft fruit peel → food waste.' },
  { id: 'eggshell', ko: '달걀 껍데기', en: 'Eggshells', icon: '🥚', bin: 'general', why: 'Another trick one: eggshells go in general waste.' },
  { id: 'tissue', ko: '사용한 휴지·물티슈', en: 'Used tissues & wet wipes', icon: '🧻', bin: 'general', why: 'Dirty paper and wet wipes are not recyclable → general waste.' },
  { id: 'box', ko: '택배 상자', en: 'Cardboard box', icon: '📦', bin: 'paper', why: 'Remove the tape, flatten it → paper.' },
  { id: 'soju', ko: '빈 소주병', en: 'Empty soju bottle', icon: '🍾', bin: 'glass', why: 'Glass. Shops even refund a small deposit for soju/beer bottles!' },
  { id: 'bag', ko: '과자 봉지·비닐봉지', en: 'Snack wrapper / plastic bag', icon: '🛍️', bin: 'vinyl', why: 'Soft plastic film → vinyl (비닐) bin.' },
  { id: 'cup', ko: '컵라면 용기 (국물 비움)', en: 'Cup-noodle cup (broth drained)', icon: '🍜', bin: 'general', why: 'Drain the broth first; a greasy cup goes to general waste.' },
];
export const trashById = (id: string) => TRASH.find((t) => t.id === id);

/* ───────────── pharmacy ───────────── */
export interface Medicine {
  id: string;
  ko: string;
  en: string;
  price: number;
  icon: string;
}
export const MEDICINES: Medicine[] = [
  { id: 'fever', ko: '해열진통제', en: 'Fever reducer / painkiller (acetaminophen)', price: 3000, icon: '💊' },
  { id: 'cold', ko: '종합감기약', en: 'Cold medicine (all-in-one)', price: 5000, icon: '🤧' },
  { id: 'digest', ko: '소화제', en: 'Digestive medicine', price: 3500, icon: '🫄' },
  { id: 'patch', ko: '파스 (소염진통 패치)', en: 'Pain-relief patch', price: 6000, icon: '🩹' },
  { id: 'ors', ko: '경구수분보충액', en: 'Oral rehydration solution', price: 4000, icon: '🧃' },
  { id: 'eye', ko: '인공눈물', en: 'Eye drops', price: 5000, icon: '👁️' },
];
export interface Symptom {
  id: string;
  /** what you'd say – the first one is right */
  phrases: { ko: string; en: string }[];
  med: string;
  dose: { ko: string; en: string };
  /** right answer to "how do you take it?" and two wrong ones */
  howTo: [string, string, string];
}
export const SYMPTOMS: Record<string, Symptom> = {
  stomach: {
    id: 'stomach',
    phrases: [
      { ko: '체한 것 같아요. 배가 답답해요', en: 'I think I have indigestion – my stomach feels heavy' },
      { ko: '머리가 아파요', en: 'I have a headache' },
      { ko: '눈이 가려워요', en: 'My eyes are itchy' },
    ],
    med: 'digest',
    dose: { ko: '1일 3회, 1회 1포, 식후 30분', en: '3 times a day, 1 sachet, 30 min after meals' },
    howTo: ['One sachet 30 minutes after each meal, 3 times a day', 'All three sachets at once now', 'Only before going to bed'],
  },
  cold: {
    id: 'cold',
    phrases: [
      { ko: '목이 아프고 열이 나요', en: 'My throat hurts and I have a fever' },
      { ko: '발목을 삐었어요', en: 'I sprained my ankle' },
      { ko: '체했어요', en: 'I have indigestion' },
    ],
    med: 'cold',
    dose: { ko: '1일 3회, 1회 2정, 식후 30분. 졸음 주의', en: '3 times a day, 2 tablets, 30 min after meals. May cause drowsiness' },
    howTo: ['2 tablets after each meal – and no driving if drowsy', '6 tablets at once to get well faster', 'With soju to warm up'],
  },
  sprain: {
    id: 'sprain',
    phrases: [
      { ko: '발목을 삐었어요. 붓고 아파요', en: 'I sprained my ankle – it is swollen and hurts' },
      { ko: '감기에 걸렸어요', en: 'I caught a cold' },
      { ko: '잠이 안 와요', en: 'I can\'t sleep' },
    ],
    med: 'patch',
    dose: { ko: '1일 1~2회 환부에 부착, 상처 부위 금지', en: 'Stick on the sore area 1–2 times a day, not on open wounds' },
    howTo: ['On clean, unbroken skin over the sore spot, change once or twice a day', 'On an open cut', 'Eat it'],
  },
  heat: {
    id: 'heat',
    phrases: [
      { ko: '더위를 먹었어요. 어지럽고 속이 메스꺼워요', en: 'I think it\'s the heat – I\'m dizzy and nauseous' },
      { ko: '이가 아파요', en: 'I have a toothache' },
      { ko: '기침이 나요', en: 'I have a cough' },
    ],
    med: 'ors',
    dose: { ko: '물에 타서 조금씩 자주 마시기', en: 'Mix with water and sip a little, often' },
    howTo: ['Small sips often, in the shade, and rest', 'Down it in one go and keep hiking', 'Mix it with coffee'],
  },
};

/* ───────────── taxi app ───────────── */
export const TAXI_NIGHT_SURCHARGE = 0.2;

/* ───────────── storage lockers ───────────── */
export type LockerSize = 'S' | 'M' | 'L';
export const LOCKERS: Record<LockerSize, { ko: string; en: string; fits: string; price: number }> = {
  S: { ko: '소형', en: 'Small', fits: 'backpack / shopping bag', price: 2000 },
  M: { ko: '중형', en: 'Medium', fits: 'carry-on suitcase (≤ 20")', price: 3000 },
  L: { ko: '대형', en: 'Large', fits: 'large suitcase (24–28")', price: 4000 },
};
export const BAG_SIZE: Record<string, LockerSize> = { backpack: 'S', carryon: 'M', large: 'L' };
