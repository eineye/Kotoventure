/**
 * Hidden-gem treks: walking-only courses in lesser-known places.
 * Managed in the admin (🥾 Treks page); the app shows a list, a detail page with a Korea map
 * and a route sketch, photos, and a checkpoint "walk" mode.
 */
import type { Area, L } from './types';

export type TrekPointKind = 'start' | 'end' | 'view' | 'beach' | 'shop' | 'rest' | 'rock' | 'cave' | 'spot';
export type TrekStatus = 'draft' | 'published' | 'paused';

export interface TrekPoint {
  name: L;
  kind: TrekPointKind;
  note?: L;
}

export interface TrekPhoto {
  /** bundled photo ("asset:<key>"), an https URL, or a data: URL uploaded in the admin */
  src: string;
  caption?: L;
}

export interface Trek {
  id: string;
  title: L;
  area: Area;
  /** e.g. "Course 1" */
  courseName: L;
  /** exact address of the starting point (Korean) */
  addressKo: string;
  /** map search term for the start (Korean) */
  startSearch: string;
  /** map search term for the finish (Korean) */
  endSearch?: string;
  /** introduction / important notice */
  notice: L;
  /** practical tips, e.g. renting a car */
  tips: L[];
  points: TrekPoint[];
  distanceKm: number;
  durationMin: number;
  /** 1 easy · 2 moderate · 3 hard */
  difficulty: 1 | 2 | 3;
  meal: L;
  photos: TrekPhoto[];
  /** position of the start on the Korea map */
  lat: number;
  lng: number;
  status: TrekStatus;
  sortOrder: number;
}

export const TREK_POINT_ICON: Record<TrekPointKind, string> = { start: '🚩', end: '🏁', view: '👀', beach: '🏖️', shop: '🏪', rest: '🪑', rock: '🪨', cave: '🕳️', spot: '📍' };
export const TREK_MAX_PHOTOS = 4;

/** Coarse outline of South Korea as [lng, lat] – enough to show roughly where a trek is. */
export const KOREA_OUTLINE: [number, number][] = [
  [126.62, 37.78], [127.05, 38.0], [127.6, 38.3], [128.35, 38.62], [128.6, 38.2], [128.9, 37.76], [129.12, 37.48], [129.38, 37.05],
  [129.44, 36.6], [129.57, 36.08], [129.42, 35.5], [129.1, 35.1], [128.62, 34.86], [128.1, 34.9], [127.75, 34.72], [127.25, 34.55],
  [126.55, 34.3], [126.32, 34.6], [126.35, 34.82], [126.42, 35.38], [126.68, 35.98], [126.52, 36.35], [126.32, 36.6], [126.14, 36.74],
  [126.2, 36.98], [126.52, 37.0], [126.82, 37.02], [126.6, 37.45], [126.45, 37.72],
];
/** Jeju as an ellipse: centre [lng, lat] and radii in degrees */
export const JEJU = { lng: 126.55, lat: 33.38, rx: 0.37, ry: 0.17 };
export const KOREA_BOUNDS = { minLng: 125.9, maxLng: 129.8, minLat: 33.0, maxLat: 38.8 };

/** Equirectangular projection into a w×h box (with latitude correction). */
export function projectKorea(lng: number, lat: number, w: number, h: number) {
  const b = KOREA_BOUNDS;
  return { x: ((lng - b.minLng) / (b.maxLng - b.minLng)) * w, y: ((b.maxLat - lat) / (b.maxLat - b.minLat)) * h };
}

export const fmtTrekTime = (min: number, lang: string) => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return lang === 'ko' ? `${h ? `${h}시간` : ''}${m ? ` ${m}분` : ''}`.trim() : `${h ? `${h} h` : ''}${m ? ` ${m} min` : ''}`.trim();
};

const P = (ko: string, en: string, kind: TrekPointKind, note?: L): TrekPoint => ({ name: { ko, en }, kind, ...(note ? { note } : {}) });

export const TREKS: Trek[] = [
  {
    id: 'taean-solhyang-1',
    title: { en: 'Taean Solhyanggi-gil: coastal pine trail', ko: '태안 솔향기길 해안 트레킹' },
    area: 'chungcheong',
    courseName: { en: 'Solhyanggi-gil Course 1, Iwon-myeon, Taean-gun, South Chungcheong', ko: '충남 태안군 이원면 솔향기길 1코스' },
    addressKo: '충청남도 태안군 이원면 내리 만대항',
    startSearch: '만대항',
    endSearch: '꾸지나무골해수욕장',
    notice: {
      en: 'Most hidden-gem trekking courses cannot be reached by public transport. We recommend renting a car. This trail follows the cliffs and pine forest of the Taean coast – narrow paths, wooden steps and small beaches, with very few shops on the way.',
      ko: '숨은 명소 트레킹 코스는 대부분 대중교통으로 갈 수 없습니다. 기본적으로 자동차를 렌트해서 다니시는 것을 추천합니다. 이 길은 태안 해안의 절벽과 소나무 숲을 따라 걷는 좁은 길로, 나무 계단과 작은 해변이 이어지며 중간에 매점이 거의 없습니다.',
    },
    tips: [
      { en: 'Renting a car: bring your passport, your home driving licence and an International Driving Permit (IDP), plus a credit card in the driver\'s name. Most companies require age 21+ and at least 1 year of driving experience.', ko: '자동차 렌트: 여권, 본국 운전면허증, 국제운전면허증(IDP), 운전자 명의 신용카드가 필요해요. 대부분 만 21세 이상, 운전 경력 1년 이상이어야 해요.' },
      { en: 'Where to rent: counters at Incheon/Gimpo airports and major KTX stations (e.g. Cheonan-Asan, about 1 h 30 min to Taean), or book in a rental app in advance.', ko: '렌트 장소: 인천·김포공항과 주요 KTX역(예: 천안아산역, 태안까지 약 1시간 30분) 카운터, 또는 렌터카 앱으로 미리 예약해요.' },
      { en: 'Navigation: enter "만대항" (Mandae Port) in Naver Map or KakaoMap. Expressway tolls are paid by Hi-pass in the car or at the booth; speed cameras are common.', ko: '내비게이션: 네이버지도·카카오맵에 "만대항"을 입력하세요. 고속도로 통행료는 차량 하이패스나 요금소에서 내고, 과속 카메라가 많아요.' },
      { en: 'The course is one-way: park at Mandae Port and take a taxi back from Kkujinamugol Beach (about 15 min) – save a local taxi number before you start.', ko: '편도 코스예요: 만대항에 주차하고, 꾸지나무골해수욕장에서 택시로 돌아와요(약 15분). 출발 전에 지역 콜택시 번호를 저장해 두세요.' },
      { en: 'Start by 10:00, wear hiking shoes, and carry water and a packed lunch. Check the tide times – some beach sections are easier at low tide.', ko: '오전 10시 전에 출발하고, 등산화를 신고 물과 도시락을 챙기세요. 일부 해변 구간은 썰물 때 걷기 편하니 물때를 확인하세요.' },
    ],
    points: [
      P('만대항', 'Mandae Port', 'start', { en: 'Start – free parking by the port', ko: '출발 – 항구 옆 무료 주차' }),
      P('큰구매수동', 'Keungumaesudong', 'beach'),
      P('붉은앙뗑이 (수인등표 등대와 장안여)', 'Bulgeun-angtteng-i (beacon tower & Jangan-yeo rocks)', 'rock'),
      P('당봉전망대', 'Dangbong Observatory', 'view'),
      P('근욱골해변', 'Geunukgol Beach', 'beach'),
      P('칼바위', 'Kal-bawi (Knife Rock)', 'rock'),
      P('가마봉전망대', 'Gamabong Observatory', 'view'),
      P('여섬해변', 'Yeoseom Beach', 'beach'),
      P('중막골해변 (무인매점)', 'Jungmakgol Beach (honesty shop)', 'shop', { en: 'Unmanned shop – take what you need, write it in the notebook and pay', ko: '무인매점 – 필요한 것을 고르고 노트에 적은 뒤 계산해요' }),
      P('용난굴', 'Yongnan-gul Cave', 'cave'),
      P('작은어리골 쉼터 (매점)', 'Jageun-eorigol rest area (shop)', 'rest'),
      P('큰어리골', 'Keun-eorigol', 'beach'),
      P('꾸지나무골해수욕장', 'Kkujinamugol Beach', 'end', { en: 'Finish – take a taxi back to Mandae Port', ko: '도착 – 택시로 만대항까지 돌아가요' }),
    ],
    distanceKm: 9.9,
    durationMin: 270,
    difficulty: 2,
    meal: {
      en: 'There are no restaurants on the trail – bring a packed lunch (dosirak). Snacks and drinks at the honesty shop at Jungmakgol Beach and the small shop at the Jageun-eorigol rest area.',
      ko: '코스 중간에는 식당이 없어요. 도시락을 챙기세요. 간식과 음료는 중막골해변 무인매점과 작은어리골 쉼터 매점에서 살 수 있어요.',
    },
    photos: [
      { src: 'asset:solhyang-1', caption: { en: 'Yongnan-gul Cave', ko: '용난굴' } },
      { src: 'asset:solhyang-2', caption: { en: 'Honesty shop at Jungmakgol Beach', ko: '중막골 무인매점' } },
      { src: 'asset:solhyang-3', caption: { en: 'Pine forest and sea along the trail', ko: '솔숲 사이로 보이는 바다' } },
      { src: 'asset:solhyang-4', caption: { en: 'Course map (Course 1 in red)', ko: '코스 안내도 (빨간선 1코스)' } },
    ],
    lat: 36.96,
    lng: 126.27,
    status: 'published',
    sortOrder: 1,
  },
];
