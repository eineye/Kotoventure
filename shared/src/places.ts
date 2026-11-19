/**
 * Places for the day-planner game (Seoul). Opening hours, closed days and prices are
 * approximate 2025 values for gameplay – editable data; always check before a real trip.
 * x/y are positions on the planner's schematic map (0..100).
 */
import type { L } from './types';

export type Weekday = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export interface Place {
  id: string;
  ko: string;
  name: L;
  x: number;
  y: number;
  open: string;
  close: string;
  /** last admission (defaults to close) */
  lastEntry?: string;
  closedOn?: Weekday[];
  visitMin: number;
  cost: number;
  energy: number;
  outdoor: boolean;
  food?: boolean;
  /** satisfaction points for a successful visit */
  fun: number;
  /** extra fun when visiting after 18:00 (night views) */
  nightBonus?: number;
  tip: L;
  cardId?: string;
}

export const PLACES: Place[] = [
  { id: 'hotel-myeongdong', ko: '명동 숙소', name: { en: 'Hotel (Myeongdong)', ko: '명동 숙소' }, x: 50, y: 58, open: '00:00', close: '24:00', visitMin: 0, cost: 0, energy: 0, outdoor: false, fun: 0, tip: { en: 'Your base.' } },
  {
    id: 'gyeongbokgung', ko: '경복궁', name: { en: 'Gyeongbokgung Palace', ko: '경복궁' }, x: 40, y: 22,
    open: '09:00', close: '18:00', lastEntry: '17:00', closedOn: ['Tue'], visitMin: 120, cost: 3000, energy: 12, outdoor: true, fun: 26,
    tip: { en: 'Closed on TUESDAYS. Free entry in hanbok. Guard ceremony 10:00 & 14:00.', ko: '화요일 휴궁. 한복 착용 시 무료.' }, cardId: 'et-photo',
  },
  {
    id: 'changdeokgung', ko: '창덕궁', name: { en: 'Changdeokgung Palace', ko: '창덕궁' }, x: 55, y: 22,
    open: '09:00', close: '18:00', lastEntry: '17:00', closedOn: ['Mon'], visitMin: 90, cost: 3000, energy: 10, outdoor: true, fun: 22,
    tip: { en: 'UNESCO palace with a famous Secret Garden. Closed on MONDAYS.', ko: '월요일 휴궁. 유네스코 세계유산.' },
  },
  {
    id: 'bukchon', ko: '북촌 한옥마을', name: { en: 'Bukchon Hanok Village', ko: '북촌 한옥마을' }, x: 48, y: 17,
    open: '10:00', close: '17:00', visitMin: 60, cost: 0, energy: 8, outdoor: true, fun: 16,
    tip: { en: 'Residents live here – tourist visits only 10:00–17:00 in the red zone.', ko: '관광 허용시간 10~17시.' }, cardId: 'la-bukchon',
  },
  {
    id: 'insadong', ko: '인사동', name: { en: 'Insadong', ko: '인사동' }, x: 50, y: 32,
    open: '10:00', close: '21:00', visitMin: 90, cost: 10000, energy: 6, outdoor: true, fun: 15,
    tip: { en: 'Traditional crafts, tea houses and souvenirs.', ko: '전통 공예·찻집·기념품.' },
  },
  {
    id: 'gwangjang', ko: '광장시장', name: { en: 'Gwangjang Market', ko: '광장시장' }, x: 64, y: 36,
    open: '09:00', close: '22:00', visitMin: 60, cost: 12000, energy: -15, outdoor: false, food: true, fun: 18,
    tip: { en: 'Bindaetteok, mayak gimbap, yukhoe – a classic lunch stop. Mostly cash!', ko: '빈대떡·마약김밥. 현금 위주.' }, cardId: 'fo-street',
  },
  {
    id: 'ikseon', ko: '익선동', name: { en: 'Ikseon-dong', ko: '익선동' }, x: 56, y: 30,
    open: '11:00', close: '22:00', visitMin: 75, cost: 15000, energy: -12, outdoor: true, food: true, fun: 15,
    tip: { en: 'Hanok alleys full of cafés and restaurants – good for lunch.', ko: '한옥 골목 카페·식당.' },
  },
  {
    id: 'nseoultower', ko: 'N서울타워', name: { en: 'N Seoul Tower', ko: 'N서울타워' }, x: 47, y: 72,
    open: '10:00', close: '23:00', lastEntry: '22:30', visitMin: 90, cost: 21000, energy: 10, outdoor: true, fun: 16, nightBonus: 12,
    tip: { en: 'Best after sunset – the night view adds a lot. Steep walk or cable car.', ko: '야경이 하이라이트.' },
  },
  {
    id: 'museum', ko: '국립중앙박물관', name: { en: 'National Museum of Korea', ko: '국립중앙박물관' }, x: 38, y: 88,
    open: '10:00', close: '18:00', lastEntry: '17:30', visitMin: 120, cost: 0, energy: 8, outdoor: false, fun: 22,
    tip: { en: 'Huge, free and indoors – perfect on a rainy or very hot day.', ko: '무료·실내. 비/폭염 날 추천.' },
  },
  {
    id: 'seongsu', ko: '성수동', name: { en: 'Seongsu-dong', ko: '성수동' }, x: 84, y: 62,
    open: '11:00', close: '21:00', visitMin: 120, cost: 15000, energy: -8, outdoor: false, food: true, fun: 20,
    tip: { en: 'Café brunch & brand pop-ups in old factories (mostly indoors).', ko: '카페·팝업. 대부분 실내.' },
  },
  {
    id: 'starfield', ko: '별마당 도서관', name: { en: 'Starfield Library (COEX)', ko: '별마당 도서관' }, x: 90, y: 90,
    open: '10:00', close: '22:00', visitMin: 60, cost: 0, energy: 4, outdoor: false, fun: 14,
    tip: { en: 'Giant book walls inside COEX mall – free and indoors.', ko: '코엑스 실내 무료.' },
  },
];

export const placeById = (id?: string) => PLACES.find((p) => p.id === id);
export const WEEKDAY_KO: Record<Weekday, string> = { Mon: '월요일', Tue: '화요일', Wed: '수요일', Thu: '목요일', Fri: '금요일', Sat: '토요일', Sun: '일요일' };

export type Transport = 'subway' | 'taxi' | 'walk';

/** Travel between two places: minutes, cost (KRW) and energy. 1 map unit ≈ 120 m. */
export function travel(a: Place, b: Place, mode: Transport, atMin: number) {
  const d = Math.hypot(a.x - b.x, a.y - b.y);
  if (mode === 'walk') return { min: Math.round(d * 1.6 + 2), cost: 0, energy: Math.round(d * 0.35) };
  if (mode === 'taxi') {
    const night = atMin >= 22 * 60 || atMin < 4 * 60;
    return { min: Math.round(6 + d * 0.55), cost: Math.round((4800 + d * 260) * (night ? 1.2 : 1) / 100) * 100, energy: 0 };
  }
  return { min: Math.round(12 + d * 0.45), cost: 1550, energy: 3 };
}
