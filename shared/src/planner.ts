/**
 * "Plan my own trip": the player picks an area, a gateway, the number of days, places, restaurants and
 * a place to stay; the trip is built with the same generator as the recommended missions, so it plays
 * (and estimates time and cost) exactly like them.
 */
import type { Area, Course, PartyType } from './types';
import { buildMission, HUBS, type HubId, type Kind, type Meal, type MissionDef, type Stop } from './courses/gen';
import { SEOUL_MISSIONS } from './courses/missions-seoul';
import { REGION_MISSIONS } from './courses/missions-regions';
import { localizeCourses } from './i18n/localize';
import { KO_TEXT } from './i18n/ko-text';
import { seasonOf } from './seasons';

export type StayKind = MissionDef['stay'];
export const MAX_DAYS = 4;
export const STAY_KINDS: { id: StayKind; en: string; ko: string; icon: string }[] = [
  { id: 'hotel', en: 'Hotel', ko: '호텔', icon: '🏨' }, { id: 'guesthouse', en: 'Guesthouse', ko: '게스트하우스', icon: '🛏️' }, { id: 'hanok', en: 'Hanok stay', ko: '한옥스테이', icon: '🏠' },
  { id: 'pension', en: 'Pension', ko: '펜션', icon: '🏡' }, { id: 'motel', en: 'Motel', ko: '모텔', icon: '🏩' }, { id: 'resort', en: 'Resort', ko: '리조트', icon: '🏝️' },
  { id: 'temple', en: 'Temple stay', ko: '템플스테이', icon: '🛕' }, { id: 'jjimjilbang', en: 'Jjimjilbang', ko: '찜질방', icon: '♨️' },
];
export interface TripSpec {
  id: string;
  area: Area;
  hub: HubId;
  days: number;
  stay: StayKind;
  /** planner place ids with the day they are visited, in visiting order */
  places: { id: string; day: number }[];
  /** planner meal ids */
  meals: string[];
  month?: number;
  createdAt: string;
}

export interface PlannerPlace { id: string; area: Area; ko: string; en: string; kind: Kind; min: number; stop: Stop }
export interface PlannerMeal { id: string; area: Area; ko: string; en: string; dishes: string; meal: Meal }

export const KIND_ICON: Record<Kind, string> = {
  palace: '🏯', temple: '🛕', market: '🛍️', mountain: '⛰️', beach: '🏖️', museum: '🏛️', street: '🚶', village: '🏘️',
  night: '🌃', park: '🌳', island: '🏝️', workshop: '🎨', river: '🌊', memorial: '🕯️', cave: '🦇', farm: '🍊',
};
const VISIT: Record<Kind, number> = { palace: 120, temple: 90, market: 60, mountain: 240, beach: 90, museum: 90, street: 60, village: 60, night: 60, park: 60, island: 150, workshop: 90, river: 60, memorial: 60, cave: 60, farm: 60 };

const DEFS = [...SEOUL_MISSIONS, ...REGION_MISSIONS];
/** every place of the recommended missions, by area (deduplicated by name) */
export const PLANNER_PLACES: PlannerPlace[] = (() => {
  const seen = new Set<string>();
  const out: PlannerPlace[] = [];
  for (const d of DEFS)
    for (const s of d.stops) {
      if (seen.has(s.ko)) continue;
      seen.add(s.ko);
      out.push({ id: `${d.id}:${s.key}`, area: d.area, ko: s.ko, en: s.en, kind: s.kind, min: s.min ?? VISIT[s.kind], stop: s });
    }
  return out;
})();
export const PLANNER_MEALS: PlannerMeal[] = (() => {
  const seen = new Set<string>();
  const out: PlannerMeal[] = [];
  for (const d of DEFS)
    [d.food, d.food2, d.food3].forEach((m, k) => {
      if (!m || seen.has(m.place[0])) return;
      seen.add(m.place[0]);
      out.push({ id: `${d.id}:food${k + 1}`, area: d.area, ko: m.place[0], en: m.place[1], dishes: m.dishes.map((x) => x[0]).join(', '), meal: m });
    });
  return out;
})();

/** gateways that make sense for each area */
export const AREA_HUBS: Record<Area, HubId[]> = {
  seoul: ['ICN', 'GMP'], gyeonggi: ['ICN', 'GMP'], incheon: ['ICN', 'INCHEON-PORT'], chungcheong: ['CJJ', 'ICN'],
  gangwon: ['YNY', 'ICN'], jeolla: ['MWX', 'RSU'], gyeongsang: ['PUS', 'TAE', 'BUSAN-PORT'], jeju: ['CJU', 'JEJU-PORT'],
};
export const hubInfo = (h: HubId) => HUBS[h];

/** the recommended way from each gateway into town (answer of the arrival question) */
const HUB_GO: Record<HubId, [en: string, ko: string]> = {
  ICN: ['Airport railroad (AREX) or an airport limousine bus into town', '공항철도(AREX)나 공항 리무진 버스로 시내까지'],
  GMP: ['Subway from Gimpo Airport (Line 5, Line 9 or AREX)', '김포공항에서 지하철(5호선·9호선·공항철도)'],
  CJU: ['Airport bus or a rental car from the rental-car centre', '공항버스나 렌터카 하우스에서 렌터카'],
  PUS: ['Busan–Gimhae light rail and the Busan Metro', '부산김해경전철과 부산 도시철도'],
  TAE: ['City bus or a short taxi ride into Daegu', '시내버스나 짧은 택시로 대구 시내까지'],
  CJJ: ['Airport limousine bus or the train from Cheongju Airport station', '공항 리무진 버스나 청주공항역에서 기차'],
  YNY: ['Airport shuttle bus or a taxi', '공항 셔틀버스나 택시'],
  MWX: ['Airport bus into town', '시내까지 공항버스'],
  RSU: ['Airport bus or a taxi into Yeosu', '여수 시내까지 공항버스나 택시'],
  'INCHEON-PORT': ['City bus or taxi from the ferry terminal', '여객터미널에서 시내버스나 택시'],
  'BUSAN-PORT': ['Subway Line 1 or a taxi from the passenger terminal', '여객터미널에서 지하철 1호선이나 택시'],
  'JEJU-PORT': ['City bus or taxi from the ferry terminal', '여객터미널에서 시내버스나 택시'],
};
for (const [en, ko] of Object.values(HUB_GO)) KO_TEXT[en] = ko;
KO_TEXT['Lunch at a busy local restaurant near your first stop.'] = '첫 장소 근처의 붐비는 동네 식당에서 점심을 먹어요.';

const AREA_KO: Record<Area, [string, string]> = {
  seoul: ['Seoul', '서울'], gyeonggi: ['Gyeonggi', '경기'], incheon: ['Incheon', '인천'], chungcheong: ['Chungcheong', '충청'],
  gangwon: ['Gangwon', '강원'], jeolla: ['Jeolla', '전라'], gyeongsang: ['Gyeongsang', '경상'], jeju: ['Jeju', '제주'],
};
const hash = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
};

/** Build a playable course from the player's plan. */
export function buildTrip(spec: TripSpec, sortOrder = 0): Course | null {
  const days = Math.max(1, Math.min(MAX_DAYS, spec.days));
  const picked = [...spec.places].filter((x) => x.day <= days).sort((a, b) => a.day - b.day);
  const places = picked.map((x) => PLANNER_PLACES.find((p) => p.id === x.id)).filter((p): p is PlannerPlace => !!p);
  const dayOfPlace = picked.filter((x) => PLANNER_PLACES.some((p) => p.id === x.id)).map((x) => x.day);
  const meals = spec.meals.map((id) => PLANNER_MEALS.find((m) => m.id === id)).filter((m): m is PlannerMeal => !!m);
  if (!places.length) return null;
  const n = places.length;
  // copy the places with fresh keys; fixed days/times of the original missions don't apply here
  const stops: Stop[] = places.map((p, i) => {
    const { day: _d, time: _t, ...rest } = p.stop;
    return { ...rest, key: `p${i + 1}`, day: dayOfPlace[i] };
  });
  // spread the meals over the trip: after the place closest to each meal's share of the day
  const ms: Meal[] = meals.slice(0, 3).map((m, k) => {
    const { time: _t, after: _a, ...rest } = m.meal;
    return { ...rest, after: stops[Math.min(n - 1, Math.floor(((k + 0.5) * n) / meals.length))].key };
  });
  const [areaEn, areaKo] = AREA_KO[spec.area];
  const month = spec.month ?? new Date().getMonth() + 1;
  const def: MissionDef = {
    id: spec.id,
    area: spec.area,
    cat: 'sightseeing',
    title: [`My ${areaEn} trip`, `나의 ${areaKo} 여행`],
    sub: [`${Math.max(0, days - 1)} nights / ${days} days · ${n} places`, `${Math.max(0, days - 1)}박 ${days}일 · ${n}곳`],
    desc: `Your own itinerary: ${places.map((p) => p.en).join(' → ')}.`,
    hub: spec.hub,
    go: HUB_GO[spec.hub][0],
    days,
    nights: Math.max(0, days - 1),
    diff: 1,
    fit: [5, 5, 5, 5],
    budget: 150000 * days,
    season: seasonOf(month),
    stay: spec.stay,
    food: ms[0] ?? { place: ['근처 식당', 'A local restaurant'], text: 'Lunch at a busy local restaurant near your first stop.', dishes: [['비빔밥', 'Bibimbap', 10000], ['김치찌개', 'Kimchi stew', 9000, 0, 1], ['불고기', 'Bulgogi', 15000]], after: stops[0].key },
    ...(ms[1] ? { food2: ms[1] } : {}),
    ...(ms[2] ? { food3: ms[2] } : {}),
    stops,
    health: (['heat', 'sprain', 'stomach', 'cold'] as const)[hash(spec.id) % 4],
    everyNight: true,
  };
  const course = buildMission(def, sortOrder);
  const descKo = `직접 짠 일정: ${places.map((p) => p.ko).join(' → ')}.`;
  course.description = { en: def.desc, ko: descKo };
  KO_TEXT[def.desc] = descKo;
  localizeCourses([course]);
  return course;
}

/** Party-independent defaults for a new plan. */
export function newTripSpec(area: Area, party: PartyType): TripSpec {
  return {
    id: `my-${Date.now().toString(36)}`,
    area,
    hub: AREA_HUBS[area][0],
    days: 2,
    stay: party === 'solo' ? 'guesthouse' : party === 'group' ? 'pension' : 'hotel',
    places: [],
    meals: [],
    createdAt: new Date().toISOString(),
  };
}
