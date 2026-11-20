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
}
export const RESTAURANTS: Record<string, Restaurant> = {
  bbq: {
    id: 'bbq', ko: '을지로 고깃집', en: 'Euljiro BBQ house', payAt: 'counter', selfBar: true,
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
    id: 'blackpork', ko: '제주 흑돼지집', en: 'Jeju black-pork house', payAt: 'counter', selfBar: false,
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
    id: 'jjigae', ko: '인사동 백반집', en: 'Insadong home-style eatery', payAt: 'counter',
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
    id: 'ssambap', ko: '교촌 쌈밥집', en: 'Gyochon ssambap house', payAt: 'table',
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
