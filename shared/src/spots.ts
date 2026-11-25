/**
 * Spots: hidden restaurants, cafés, shops and places recommended in the app.
 * Stage 1 = editorial picks ("Kachi's pick"); `sponsored` marks paid partner listings,
 * which the app always labels as such. Managed in the admin (Places page).
 */
import type { Area, Course, L } from './types';

export type SpotKind = 'food' | 'cafe' | 'shop' | 'spot' | 'experience';
export type SpotStatus = 'draft' | 'published' | 'paused';
export type SpotFeature = 'englishMenu' | 'card' | 'vegetarian' | 'solo' | 'noReservation' | 'free';
/** what the editor checked before publishing */
export type SpotCheck = 'visited' | 'priceShown' | 'foreignerFriendly' | 'noComplaints';

export interface Spot {
  id: string;
  name: L;
  kind: SpotKind;
  area: Area;
  /** Korean address or name used for the map search */
  addressKo: string;
  intro: L;
  /** insider tip shown under the intro */
  tip?: L;
  /** 1 = cheap … 3 = pricey */
  priceRange?: 1 | 2 | 3;
  hours?: string;
  closed?: string;
  features: SpotFeature[];
  /** missions where it is suggested (empty = every mission in its area) */
  courseIds: string[];
  /** scenes where it pops up as "nearby" */
  sceneIds: string[];
  status: SpotStatus;
  /** paid partner listing – always labelled in the app */
  sponsored: boolean;
  checks: SpotCheck[];
  /** last time the info was checked on site (YYYY-MM-DD) */
  verifiedAt?: string;
  /** internal note for editors (never shown in the app) */
  note?: string;
  sortOrder: number;
}

export const SPOT_KINDS: { id: SpotKind; icon: string; name: L }[] = [
  { id: 'food', icon: '🍜', name: { en: 'Restaurant', ko: '맛집' } },
  { id: 'cafe', icon: '☕', name: { en: 'Café', ko: '카페' } },
  { id: 'shop', icon: '🛍️', name: { en: 'Shop', ko: '쇼핑' } },
  { id: 'spot', icon: '📍', name: { en: 'Hidden spot', ko: '숨은 명소' } },
  { id: 'experience', icon: '🎨', name: { en: 'Experience', ko: '체험' } },
];

export const SPOT_FEATURES: { id: SpotFeature; icon: string; name: L }[] = [
  { id: 'englishMenu', icon: '🔤', name: { en: 'English menu', ko: '영어 메뉴' } },
  { id: 'card', icon: '💳', name: { en: 'Cards accepted', ko: '카드 결제' } },
  { id: 'vegetarian', icon: '🥗', name: { en: 'Vegetarian options', ko: '채식 메뉴' } },
  { id: 'solo', icon: '🧍', name: { en: 'Solo-friendly', ko: '1인 가능' } },
  { id: 'noReservation', icon: '🚶', name: { en: 'No reservation needed', ko: '예약 불필요' } },
  { id: 'free', icon: '🆓', name: { en: 'Free entry', ko: '무료' } },
];

export const SPOT_CHECKS: { id: SpotCheck; name: string }[] = [
  { id: 'visited', name: '직접 방문해 확인함' },
  { id: 'priceShown', name: '가격이 명확히 표시됨 (바가지 없음)' },
  { id: 'foreignerFriendly', name: '외국인 응대 가능 (메뉴·결제)' },
  { id: 'noComplaints', name: '최근 불만·강매 이력 없음' },
];

/** published spots older than this many days need a re-check */
export const SPOT_RECHECK_DAYS = 90;

export const spotNeedsRecheck = (s: Spot, today = new Date()) =>
  !s.verifiedAt || (today.getTime() - new Date(s.verifiedAt).getTime()) / 86400000 > SPOT_RECHECK_DAYS;

/** Published spots for a mission: linked to it, or (if unlinked) in the same area. */
export function spotsForCourse(spots: Spot[] | undefined, course: Course): Spot[] {
  return (spots ?? [])
    .filter((s) => s.status === 'published' && (s.courseIds.length ? s.courseIds.includes(course.id) : !!course.area && s.area === course.area))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/** Published spots that pop up in a scene. */
export const spotsForScene = (spots: Spot[] | undefined, sceneId: string): Spot[] =>
  (spots ?? []).filter((s) => s.status === 'published' && s.sceneIds.includes(sceneId)).slice(0, 1);

/**
 * Starter picks: public, non-commercial places (no business is promoted).
 * Editors add restaurants, cafés and shops in the admin.
 */
export const SPOTS: Spot[] = [
  {
    id: 'naksan-park', name: { en: 'Naksan Park city wall at night', ko: '낙산공원 성곽길 야경' }, kind: 'spot', area: 'seoul', addressKo: '낙산공원',
    intro: { en: 'Walk along the lit-up Joseon city wall above Ihwa mural village – a free night view of downtown Seoul, far from the crowds.', ko: '이화 벽화마을 위로 불 밝힌 한양도성 성곽을 따라 걷는 길. 붐비지 않는 무료 서울 야경 명소예요.' },
    tip: { en: 'Go 30 minutes after sunset. Residents live below – keep your voice down.', ko: '해 지고 30분 뒤가 가장 예뻐요. 아래쪽은 주거지라 조용히 걸어 주세요.' },
    features: ['free', 'solo', 'noReservation'], courseIds: [], sceneIds: [], status: 'published', sponsored: false, checks: ['visited', 'priceShown', 'noComplaints'], verifiedAt: '2026-11-01', sortOrder: 1,
  },
  {
    id: 'choryang-ibagu', name: { en: 'Choryang Ibagu-gil & the 168 Stairs', ko: '초량 이바구길 168계단' }, kind: 'spot', area: 'gyeongsang', addressKo: '초량 이바구길',
    intro: { en: 'A hillside lane above Busan Station with refugee-era history, a monorail beside 168 steep steps and harbour views.', ko: '부산역 위 산복도로 골목. 피란 시절의 이야기와 168계단 옆 모노레일, 항구 전망이 있어요.' },
    tip: { en: 'Take the free monorail up and walk down. Small cafés at the top have the best view.', ko: '올라갈 때는 무료 모노레일, 내려올 때는 걸어서. 꼭대기 작은 카페 전망이 최고예요.' },
    features: ['free', 'solo', 'noReservation'], courseIds: ['busan-food'], sceneIds: [], status: 'published', sponsored: false, checks: ['visited', 'priceShown', 'noComplaints'], verifiedAt: '2026-11-01', sortOrder: 2,
  },
  {
    id: 'jeju-dongmun-night', name: { en: 'Dongmun Market night stalls', ko: '동문시장 야시장' }, kind: 'food', area: 'jeju', addressKo: '동문재래시장',
    intro: { en: 'Jeju\'s traditional market turns into a street-food night market: black-pork skewers, abalone gimbap, tangerine juice.', ko: '제주 전통시장이 밤이면 길거리 음식 야시장으로 변해요. 흑돼지 꼬치, 전복김밥, 귤 주스.' },
    tip: { en: 'Prices are on every stall – most take cards, but bring some cash.', ko: '노점마다 가격이 적혀 있어요. 카드도 대부분 되지만 현금도 조금 챙기세요.' },
    priceRange: 1, hours: '18:00–24:00', features: ['card', 'solo', 'noReservation'], courseIds: [], sceneIds: [], status: 'published', sponsored: false, checks: ['visited', 'priceShown', 'foreignerFriendly', 'noComplaints'], verifiedAt: '2026-11-01', sortOrder: 3,
  },
];
