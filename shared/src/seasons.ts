/**
 * Travel month → season, month notes and the knowledge cards that matter in that month.
 * Steps built here carry `months`, so a course shows only the block for the player's travel month.
 */
import type { L, Step } from './types';

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export const SEASON_MONTHS: Record<Season, number[]> = { spring: [3, 4, 5], summer: [6, 7, 8], autumn: [9, 10, 11], winter: [12, 1, 2] };
export const seasonOf = (month: number): Season => (Object.keys(SEASON_MONTHS) as Season[]).find((s) => SEASON_MONTHS[s].includes(month)) ?? 'spring';
/** a representative month for a course written for one season (used when the player picked no month) */
export const SEASON_DEFAULT_MONTH: Record<Season, number> = { spring: 4, summer: 7, autumn: 10, winter: 1 };

export const MONTH_NAMES: { en: string; ko: string; icon: string }[] = [
  { en: 'January', ko: '1월', icon: '❄️' }, { en: 'February', ko: '2월', icon: '🧧' }, { en: 'March', ko: '3월', icon: '🌱' },
  { en: 'April', ko: '4월', icon: '🌸' }, { en: 'May', ko: '5월', icon: '🌿' }, { en: 'June', ko: '6월', icon: '☔' },
  { en: 'July', ko: '7월', icon: '🌧️' }, { en: 'August', ko: '8월', icon: '☀️' }, { en: 'September', ko: '9월', icon: '🌕' },
  { en: 'October', ko: '10월', icon: '🍁' }, { en: 'November', ko: '11월', icon: '🍂' }, { en: 'December', ko: '12월', icon: '⛄' },
];

/** What a traveller should know about each month: a short note and the cards to learn. */
export const MONTH_INFO: Record<number, { text: L; cards: string[]; prop: string }> = {
  1: { prop: 'winter', cards: ['we-cold', 'we-snow', 'et-seollal'], text: { en: 'January is the coldest month: −10 °C mornings, dry air and icy pavements. Seollal (Lunar New Year) can fall in late January.', ko: '1월은 가장 추운 달이에요. 아침 −10°C, 건조한 공기, 빙판길. 설날이 1월 말에 올 수도 있어요.' } },
  2: { prop: 'winter', cards: ['we-cold', 'we-snow', 'et-seollal', 'we-dust'], text: { en: 'February is still freezing, with the last snow. Seollal often falls in February – check holiday closures and book transport early.', ko: '2월도 아직 춥고 마지막 눈이 와요. 설날이 2월인 해가 많아요. 휴무와 교통 예매를 미리 확인하세요.' } },
  3: { prop: 'spring', cards: ['we-seasons', 'we-dust', 'we-blossom'], text: { en: 'March warms up slowly (0–13 °C). Fine dust and yellow dust are common, and the first blossoms open in the south at the end of the month.', ko: '3월은 천천히 따뜻해져요(0–13°C). 미세먼지와 황사가 잦고, 월말엔 남쪽부터 꽃이 피어요.' } },
  4: { prop: 'spring', cards: ['we-blossom', 'we-dust', 'we-seasons'], text: { en: 'April is cherry-blossom month – mild days, chilly evenings and crowded festivals. Yellow dust days still happen.', ko: '4월은 벚꽃의 달이에요. 포근한 낮, 쌀쌀한 저녁, 붐비는 축제. 황사가 오는 날도 있어요.' } },
  5: { prop: 'spring', cards: ['we-seasons', 'we-dust'], text: { en: 'May is warm and green (15–25 °C) – one of the best months to travel. Children\'s Day (5 May) and Buddha\'s Birthday make some days very busy.', ko: '5월은 따뜻하고 푸르러요(15–25°C). 여행하기 가장 좋은 달 중 하나예요. 어린이날과 부처님오신날엔 무척 붐벼요.' } },
  6: { prop: 'summer', cards: ['we-heat', 'we-rain'], text: { en: 'June gets hot and humid, and the monsoon (jangma) usually starts in the last week.', ko: '6월은 덥고 습해지고, 보통 마지막 주에 장마가 시작돼요.' } },
  7: { prop: 'typhoon', cards: ['we-rain', 'we-heat', 'we-alert'], text: { en: 'July is monsoon season: heavy downpours, flooding alerts and steamy 30 °C+ days. Carry an umbrella everywhere.', ko: '7월은 장마철이에요. 집중호우, 침수 경보, 30°C가 넘는 찜통더위. 우산을 늘 챙기세요.' } },
  8: { prop: 'heatwave', cards: ['we-heat', 'we-rain', 'we-alert'], text: { en: 'August is the hottest month (33 °C+, tropical nights) and typhoons can reach Jeju and the south coast.', ko: '8월은 가장 더운 달이에요(33°C 이상, 열대야). 태풍이 제주와 남해안에 올 수 있어요.' } },
  9: { prop: 'typhoon', cards: ['we-rain', 'et-chuseok', 'we-heat'], text: { en: 'September is still warm, with typhoon risk early in the month. Chuseok often falls in September – expect closures and full trains.', ko: '9월은 아직 따뜻하고 초에는 태풍 위험이 있어요. 추석이 9월인 해가 많아요. 휴무와 매진된 기차를 예상하세요.' } },
  10: { prop: 'autumn', cards: ['we-foliage', 'we-seasons', 'et-chuseok'], text: { en: 'October has clear blue skies and the first autumn leaves – cool mornings, warm afternoons. Chuseok can fall in early October.', ko: '10월은 맑고 파란 하늘에 첫 단풍이 들어요. 아침은 서늘하고 오후는 따뜻해요. 추석이 10월 초일 수도 있어요.' } },
  11: { prop: 'autumn', cards: ['we-foliage', 'we-seasons', 'we-cold'], text: { en: 'November brings peak leaves in the south and the first cold snaps in the north. Days are short – plan outdoor visits before 17:00.', ko: '11월엔 남쪽 단풍이 절정이고 북쪽엔 첫 추위가 와요. 해가 짧으니 야외 일정은 17시 전에 잡으세요.' } },
  12: { prop: 'winter', cards: ['we-cold', 'we-snow'], text: { en: 'December turns freezing, with the first snow, ski resorts opening and Christmas lights in the cities.', ko: '12월은 매섭게 추워지고 첫눈이 와요. 스키장이 문을 열고 도시엔 크리스마스 불빛이 켜져요.' } },
};

/** One block per month (an event + its cards). Each step carries `months: [m]`. */
export function monthSteps(): Step[] {
  const steps: Step[] = [];
  for (let m = 1; m <= 12; m++) {
    const info = MONTH_INFO[m];
    const name = MONTH_NAMES[m - 1];
    steps.push({ type: 'event', kind: 'weather', title: { en: `Travelling in ${name.en}`, ko: `${name.ko}의 한국 여행` }, text: info.text, prop: info.prop, months: [m] } as Step);
    for (const c of info.cards) steps.push({ type: 'card', cardId: c, months: [m] } as Step);
  }
  return steps;
}
