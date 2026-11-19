/**
 * Places for the day-planner game (Seoul, Busan, Gyeongju, Jeju). Opening hours, closed days and prices are
 * approximate 2025 values for gameplay – editable data; always check before a real trip.
 * x/y are positions on the planner's schematic map (0..100).
 */
import type { L } from './types';

export type Weekday = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export type Region = 'seoul' | 'busan' | 'gyeongju' | 'jeju';
export type Transport = 'subway' | 'bus' | 'car' | 'taxi' | 'walk';

export interface RegionInfo {
  /** transport modes offered in the planner (car only with the `rentalCar` flag) */
  modes: Transport[];
  /** map units → distance multiplier (1 unit ≈ 120 m × scale) */
  scale: number;
  /** last public transport of the day */
  last?: { mode: Transport; at: string };
  mapKm: string;
}
export const REGIONS: Record<Region, RegionInfo> = {
  seoul: { modes: ['subway', 'taxi', 'walk'], scale: 1, last: { mode: 'subway', at: '24:00' }, mapKm: '~1.5 km' },
  busan: { modes: ['subway', 'taxi', 'walk'], scale: 2, last: { mode: 'subway', at: '24:00' }, mapKm: '~3 km' },
  gyeongju: { modes: ['bus', 'taxi', 'walk'], scale: 2, last: { mode: 'bus', at: '22:30' }, mapKm: '~3 km' },
  jeju: { modes: ['car', 'bus', 'taxi'], scale: 4, last: { mode: 'bus', at: '22:00' }, mapKm: '~6 km' },
};
export const MODE_ICON: Record<Transport, string> = { subway: '🚇', bus: '🚌', car: '🚗', taxi: '🚕', walk: '🚶' };
export const MODE_NAME: Record<Transport, string> = { subway: 'Subway', bus: 'Bus', car: 'Rental car', taxi: 'Taxi', walk: 'Walk' };

export interface Place {
  id: string;
  /** default seoul */
  region?: Region;
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
  /* ───────── Seoul extras (K-culture course) ───────── */
  { id: 'hotel-hongdae', ko: '홍대 숙소', name: { en: 'Guesthouse (Hongdae)', ko: '홍대 숙소' }, x: 14, y: 50, open: '00:00', close: '24:00', visitMin: 0, cost: 0, energy: 0, outdoor: false, fun: 0, tip: { en: 'Your base.' } },
  {
    id: 'hongdae', ko: '홍대 거리', name: { en: 'Hongdae street & buskers', ko: '홍대 거리' }, x: 18, y: 46,
    open: '12:00', close: '24:00', visitMin: 90, cost: 8000, energy: 6, outdoor: true, fun: 14, nightBonus: 10,
    tip: { en: 'Busking and dance crews come out in the evening.', ko: '저녁 버스킹이 하이라이트.' },
  },
  {
    id: 'mangwon', ko: '망원 한강공원', name: { en: 'Mangwon Hangang Park', ko: '망원 한강공원' }, x: 8, y: 78,
    open: '00:00', close: '24:00', visitMin: 75, cost: 4000, energy: -6, outdoor: true, food: true, fun: 14, nightBonus: 8,
    tip: { en: 'Convenience-store ramyeon by the river – lovely at sunset.', ko: '한강 라면, 해질녘 추천.' },
  },
  {
    id: 'myeongdong-shop', ko: '명동 K-뷰티', name: { en: 'Myeongdong K-beauty shops', ko: '명동 K-뷰티' }, x: 53, y: 54,
    open: '10:00', close: '22:00', visitMin: 90, cost: 30000, energy: 6, outdoor: false, fun: 16,
    tip: { en: 'Sheet masks and sunscreen – ask for tax-free with your passport.', ko: '여권 지참 시 택스프리.' },
  },
  {
    id: 'sinchon-pc', ko: '신촌 PC방', name: { en: 'PC bang (Sinchon)', ko: '신촌 PC방' }, x: 22, y: 42,
    open: '00:00', close: '24:00', visitMin: 90, cost: 4500, energy: 2, outdoor: false, fun: 12,
    tip: { en: 'Gaming café open 24 h – order ramyeon to your seat.', ko: '24시간, 자리에서 주문.' },
  },
  {
    id: 'lotteworld', ko: '롯데월드', name: { en: 'Lotte World (Jamsil)', ko: '롯데월드' }, x: 98, y: 82,
    open: '10:00', close: '21:00', lastEntry: '19:00', visitMin: 240, cost: 62000, energy: 18, outdoor: false, fun: 34,
    tip: { en: 'Huge indoor theme park – it needs half a day and is far east.', ko: '반나절 필요, 동쪽 끝.' },
  },

  /* ───────── Busan ───────── */
  { id: 'hotel-nampo', region: 'busan', ko: '남포동 숙소', name: { en: 'Hotel (Nampo-dong)', ko: '남포동 숙소' }, x: 22, y: 74, open: '00:00', close: '24:00', visitMin: 0, cost: 0, energy: 0, outdoor: false, fun: 0, tip: { en: 'Your base near Jagalchi.' } },
  { id: 'bs-seomyeon', region: 'busan', ko: '서면 국밥골목', name: { en: 'Seomyeon gukbap alley', ko: '서면 국밥골목' }, x: 40, y: 40, open: '00:00', close: '24:00', visitMin: 0, cost: 0, energy: 0, outdoor: false, fun: 0, tip: { en: 'You start here after breakfast.' } },
  {
    id: 'gamcheon', region: 'busan', ko: '감천문화마을', name: { en: 'Gamcheon Culture Village', ko: '감천문화마을' }, x: 8, y: 66,
    open: '09:00', close: '18:00', visitMin: 90, cost: 2000, energy: 12, outdoor: true, fun: 20,
    tip: { en: 'Colourful hillside village – lots of steep stairs. Shops close around 18:00.', ko: '계단 많음, 18시경 마감.' },
  },
  {
    id: 'huinnyeoul', region: 'busan', ko: '흰여울문화마을', name: { en: 'Huinnyeoul Village (Yeongdo)', ko: '흰여울문화마을' }, x: 30, y: 92,
    open: '09:00', close: '20:00', visitMin: 60, cost: 6000, energy: 6, outdoor: true, fun: 14,
    tip: { en: 'Cliff-side alley with sea views and cafés on Yeongdo island.', ko: '영도 바다 절벽 마을.' },
  },
  {
    id: 'busantower', region: 'busan', ko: '부산타워', name: { en: 'Busan Tower (Yongdusan Park)', ko: '부산타워' }, x: 26, y: 70,
    open: '10:00', close: '22:00', lastEntry: '21:30', visitMin: 60, cost: 12000, energy: 4, outdoor: true, fun: 10, nightBonus: 10,
    tip: { en: 'Right next to Nampo-dong – best at night over the harbour.', ko: '남포동 바로 옆, 야경.' },
  },
  {
    id: 'haeundae', region: 'busan', ko: '해운대 해수욕장', name: { en: 'Haeundae Beach', ko: '해운대 해수욕장' }, x: 84, y: 44,
    open: '00:00', close: '24:00', visitMin: 120, cost: 5000, energy: 8, outdoor: true, fun: 22,
    tip: { en: 'Korea\'s most famous beach. Lifeguards on duty 09:00–18:00 in summer.', ko: '여름 안전요원 09–18시.' },
  },
  {
    id: 'haeundae-market', region: 'busan', ko: '해운대시장', name: { en: 'Haeundae Market', ko: '해운대시장' }, x: 82, y: 40,
    open: '09:00', close: '23:00', visitMin: 60, cost: 15000, energy: -14, outdoor: false, food: true, fun: 16,
    tip: { en: 'Eomuk, tteokbokki and grilled fish – a perfect beach lunch.', ko: '어묵·떡볶이, 해변 점심.' },
  },
  {
    id: 'blueline', region: 'busan', ko: '블루라인파크', name: { en: 'Haeundae Blueline Park sky capsule', ko: '블루라인파크 스카이캡슐' }, x: 90, y: 50,
    open: '09:30', close: '19:00', lastEntry: '18:00', visitMin: 75, cost: 35000, energy: 2, outdoor: true, fun: 18,
    tip: { en: 'Tiny colourful capsules gliding along the coast. Last ride ~18:00.', ko: '해변열차·스카이캡슐.' },
  },
  {
    id: 'yonggungsa', region: 'busan', ko: '해동용궁사', name: { en: 'Haedong Yonggungsa Temple', ko: '해동용궁사' }, x: 97, y: 26,
    open: '05:00', close: '19:00', visitMin: 75, cost: 0, energy: 10, outdoor: true, fun: 18,
    tip: { en: 'A temple on the sea rocks – beautiful but far north-east (bus/taxi).', ko: '바다 위 사찰, 동북쪽 끝.' },
  },
  {
    id: 'spaland', region: 'busan', ko: '스파랜드 (센텀)', name: { en: 'Spa Land Centum City', ko: '스파랜드 센텀시티' }, x: 70, y: 36,
    open: '09:00', close: '21:00', lastEntry: '20:00', visitMin: 120, cost: 23000, energy: -16, outdoor: false, fun: 16,
    tip: { en: 'Luxury jjimjilbang/spa – indoors, great when it\'s too hot. Tattoo rules may apply.', ko: '실내 찜질방, 폭염 피난처.' },
  },

  /* ───────── Gyeongju ───────── */
  { id: 'hotel-hwangnidan', region: 'gyeongju', ko: '황리단길 한옥', name: { en: 'Hanok stay (Hwangnidan-gil)', ko: '황리단길 한옥' }, x: 34, y: 42, open: '00:00', close: '24:00', visitMin: 0, cost: 0, energy: 0, outdoor: false, fun: 0, tip: { en: 'Your base.' } },
  {
    id: 'wolji', region: 'gyeongju', ko: '동궁과 월지', name: { en: 'Donggung Palace & Wolji Pond', ko: '동궁과 월지' }, x: 46, y: 50,
    open: '09:00', close: '22:00', lastEntry: '21:30', visitMin: 60, cost: 3000, energy: 4, outdoor: true, fun: 10, nightBonus: 16,
    tip: { en: 'Famous for its night reflections – go after sunset.', ko: '야경 명소, 해진 뒤 추천.' },
  },
  {
    id: 'gjmuseum', region: 'gyeongju', ko: '국립경주박물관', name: { en: 'Gyeongju National Museum', ko: '국립경주박물관' }, x: 50, y: 56,
    open: '10:00', close: '18:00', lastEntry: '17:30', visitMin: 90, cost: 0, energy: 6, outdoor: false, fun: 20,
    tip: { en: 'Silla gold crowns and the Emille Bell – free and indoors.', ko: '금관·에밀레종, 무료·실내.' },
  },
  {
    id: 'hwangnyongsa', region: 'gyeongju', ko: '황룡사역사문화관', name: { en: 'Hwangnyongsa History Center', ko: '황룡사역사문화관' }, x: 54, y: 48,
    open: '09:00', close: '18:00', closedOn: ['Mon'], visitMin: 45, cost: 3000, energy: 3, outdoor: false, fun: 12,
    tip: { en: 'Model of the lost 9-storey wooden pagoda. Closed on MONDAYS.', ko: '월요일 휴관.' },
  },
  {
    id: 'gyochon', region: 'gyeongju', ko: '교촌마을', name: { en: 'Gyochon Traditional Village', ko: '교촌마을' }, x: 30, y: 52,
    open: '10:00', close: '21:00', visitMin: 75, cost: 13000, energy: -12, outdoor: true, food: true, fun: 14,
    tip: { en: 'Hanok village with gyochon gimbap and Choi family restaurants – lunch spot.', ko: '교리김밥, 점심 장소.' },
  },
  {
    id: 'hwangnidan-cafe', region: 'gyeongju', ko: '황리단길 카페', name: { en: 'Hwangnidan-gil cafés', ko: '황리단길 카페' }, x: 36, y: 38,
    open: '10:00', close: '22:00', visitMin: 60, cost: 12000, energy: -8, outdoor: false, food: true, fun: 12,
    tip: { en: 'Trendy hanok cafés right next to your stay.', ko: '숙소 옆 한옥 카페.' },
  },
  {
    id: 'namsan-gj', region: 'gyeongju', ko: '경주 남산', name: { en: 'Gyeongju Namsan trail', ko: '경주 남산' }, x: 36, y: 84,
    open: '05:00', close: '18:00', lastEntry: '14:00', visitMin: 180, cost: 0, energy: 22, outdoor: true, fun: 26,
    tip: { en: 'Buddha carvings all over the mountain. Start before 14:00 to be down by dark.', ko: '14시 이전 입산.' },
  },
  {
    id: 'seokguram', region: 'gyeongju', ko: '석굴암', name: { en: 'Seokguram Grotto', ko: '석굴암' }, x: 92, y: 66,
    open: '09:00', close: '17:30', lastEntry: '17:00', visitMin: 60, cost: 0, energy: 8, outdoor: true, fun: 20,
    tip: { en: 'UNESCO stone Buddha high on Tohamsan – far east, the bus is slow.', ko: '토함산, 멀고 버스 느림.' },
  },

  /* ───────── Jeju ───────── */
  { id: 'pension-aewol', region: 'jeju', ko: '애월 펜션', name: { en: 'Pension (Aewol)', ko: '애월 펜션' }, x: 30, y: 30, open: '00:00', close: '24:00', visitMin: 0, cost: 0, energy: 0, outdoor: false, fun: 0, tip: { en: 'Your base on the north-west coast.' } },
  {
    id: 'hyeopjae', region: 'jeju', ko: '협재 해수욕장', name: { en: 'Hyeopjae Beach', ko: '협재 해수욕장' }, x: 14, y: 40,
    open: '00:00', close: '24:00', visitMin: 90, cost: 0, energy: 6, outdoor: true, fun: 20,
    tip: { en: 'Emerald water and white sand – outdoors only.', ko: '에메랄드 바다, 야외.' },
  },
  {
    id: 'udo', region: 'jeju', ko: '우도', name: { en: 'Udo Island (ferry)', ko: '우도' }, x: 97, y: 30,
    open: '08:00', close: '17:00', lastEntry: '15:30', visitMin: 180, cost: 15000, energy: 10, outdoor: true, fun: 26,
    tip: { en: 'Ferry from Seongsan port – ferries stop in strong wind.', ko: '강풍 시 배 결항.' },
  },
  {
    id: 'manjanggul', region: 'jeju', ko: '만장굴', name: { en: 'Manjanggul Lava Tube', ko: '만장굴' }, x: 78, y: 24,
    open: '09:00', close: '18:00', lastEntry: '17:10', visitMin: 60, cost: 4000, energy: 6, outdoor: false, fun: 18,
    tip: { en: 'A 7 km lava cave (UNESCO) – underground, cool and dry.', ko: '용암동굴, 실내처럼 안전.' },
  },
  {
    id: 'osulloc', region: 'jeju', ko: '오설록 티뮤지엄', name: { en: 'O\'sulloc Tea Museum', ko: '오설록 티뮤지엄' }, x: 18, y: 64,
    open: '09:00', close: '18:00', visitMin: 60, cost: 8000, energy: 2, outdoor: false, fun: 14,
    tip: { en: 'Green-tea fields and an indoor museum café.', ko: '녹차밭 & 실내 카페.' },
  },
  {
    id: 'aquaplanet', region: 'jeju', ko: '아쿠아플라넷', name: { en: 'Aqua Planet Jeju', ko: '아쿠아플라넷 제주' }, x: 92, y: 42,
    open: '09:30', close: '18:00', lastEntry: '17:00', visitMin: 120, cost: 40000, energy: 6, outdoor: false, fun: 24,
    tip: { en: 'Huge indoor aquarium near Seongsan – far east.', ko: '대형 실내 아쿠아리움, 동쪽 끝.' },
  },
  {
    id: 'jejumuseum', region: 'jeju', ko: '국립제주박물관', name: { en: 'Jeju National Museum', ko: '국립제주박물관' }, x: 52, y: 20,
    open: '09:00', close: '18:00', visitMin: 75, cost: 0, energy: 4, outdoor: false, fun: 14,
    tip: { en: 'Free, indoors, in Jeju City.', ko: '무료·실내, 제주시.' },
  },
  {
    id: 'dongmun', region: 'jeju', ko: '동문시장', name: { en: 'Dongmun Market', ko: '동문시장' }, x: 50, y: 16,
    open: '08:00', close: '21:00', visitMin: 75, cost: 15000, energy: -14, outdoor: false, food: true, fun: 16, nightBonus: 6,
    tip: { en: 'Covered market – tangerines, hallabong and a famous night market.', ko: '지붕 있는 시장, 야시장.' },
  },
  {
    id: 'aewol-cafe', region: 'jeju', ko: '애월 카페거리', name: { en: 'Aewol seaside cafés', ko: '애월 카페거리' }, x: 28, y: 28,
    open: '10:00', close: '21:00', visitMin: 60, cost: 14000, energy: -8, outdoor: false, food: true, fun: 12,
    tip: { en: 'Brunch with a sea view, next to your pension.', ko: '숙소 옆 오션뷰 카페.' },
  },
];

export const placeById = (id?: string) => PLACES.find((p) => p.id === id);
export const WEEKDAY_KO: Record<Weekday, string> = { Mon: '월요일', Tue: '화요일', Wed: '수요일', Thu: '목요일', Fri: '금요일', Sat: '토요일', Sun: '일요일' };

export const regionOf = (p?: Place): Region => p?.region ?? 'seoul';

/** Modes the player can use in a region (rental car needs the `rentalCar` flag). */
export const modesFor = (region: Region, flags: string[] = []) => REGIONS[region].modes.filter((m) => m !== 'car' || flags.includes('rentalCar'));

/** Travel between two places: minutes, cost (KRW) and energy. 1 map unit ≈ 120 m (× region scale). */
export function travel(a: Place, b: Place, mode: Transport, atMin: number) {
  const d = Math.hypot(a.x - b.x, a.y - b.y) * REGIONS[regionOf(a)].scale;
  if (mode === 'walk') return { min: Math.round(d * 1.6 + 2), cost: 0, energy: Math.round(d * 0.35) };
  if (mode === 'taxi') {
    const night = atMin >= 22 * 60 || atMin < 4 * 60;
    return { min: Math.round(6 + d * 0.5), cost: Math.round((4800 + d * 260) * (night ? 1.2 : 1) / 100) * 100, energy: 0 };
  }
  if (mode === 'car') return { min: Math.round(5 + d * 0.4), cost: Math.round((1000 + d * 45) / 100) * 100, energy: 4 };
  if (mode === 'bus') return { min: Math.round(15 + d * 0.55), cost: 1500, energy: 3 };
  return { min: Math.round(12 + d * 0.45), cost: 1550, energy: 3 };
}
