/**
 * Korean for course texts that were written in English only.
 * Exact sentences come from KO_TEXT (ko-text.ts); sentences built from templates in the mission
 * generator are matched by PATTERNS, with place names translated through the name map.
 * Anything not found stays English (the app falls back to English).
 */
import type { Course } from '../types';
import { KO_TEXT } from './ko-text';

type Names = Map<string, string>;
/** Korean particle 로/으로 after a noun (으로 after a final consonant other than ㄹ). */
const ro = (w: string) => {
  const c = w.charCodeAt(w.length - 1) - 0xac00;
  if (c < 0 || c > 11171) return `${w}(으)로`;
  const jong = c % 28;
  return w + (jong === 0 || jong === 8 ? '로' : '으로');
};
const PATTERNS: [RegExp, (m: RegExpMatchArray, n: (en: string) => string) => string][] = [
  [/^Order at (.+)$/, (m, n) => `${n(m[1])}에서 주문하기`],
  [/^How do you get to (.+)\?$/, (m, n) => `${n(m[1])}까지 어떻게 갈까요?`],
  [/^Taxi to (.+)$/, (m, n) => `${n(m[1])}까지 택시`],
  [/^Call a taxi in the app to (.+) – check the Korean address and the plate number\.$/, (m, n) => `앱으로 ${n(m[1])}까지 택시를 부르세요. 한국어 주소와 차량 번호를 확인해요.`],
  [/^Bus to (.+)$/, (m, n) => `${n(m[1])}까지 버스`],
  [/^Take city bus (\S+): find it on the arrival board, tap in at the front, ring the bell and tap out at the back door\.$/, (m) => `${m[1]}번 시내버스를 타요. 도착 안내판에서 찾고, 앞문으로 타며 카드를 찍고, 하차벨을 누른 뒤 뒷문에서 카드를 찍고 내려요.`],
  [/^(.+) tickets$/, (m, n) => `${n(m[1])} 입장권`],
  [/^Buy tickets for your party at the (.+) ticket office( \(you are all wearing hanbok today!\))?, then scan in at the gate\.$/, (m, n) => `${n(m[1])} 매표소에서 일행의 표를 사고${m[2] ? ' (오늘은 모두 한복 차림이에요!)' : ''} 입구에서 표를 찍고 들어가요.`],
  [/^Café kiosk at (.+)$/, (m, n) => `${n(m[1])} 카페 키오스크`],
  [/^Evening of day (\d+)\. You check into your (.+)\.$/, (m, n) => `${m[1]}일차 저녁. ${n(m[2])}에 체크인해요.`],
  [/^(.+) self check-in$/, (m, n) => `${n(m[1])} 셀프 체크인`],
  [/^Day (\d+)\. Time to head back to (.+)\.$/, (m, n) => `${m[1]}일차. 이제 ${ro(n(m[2]))} 돌아갈 시간이에요.`],
  [/^What a trip – (.+)! See you on the next mission\.$/, (m, n) => `정말 멋진 여행이었어요 – ${n(m[1])}! 다음 미션에서 만나요.`],
  [/^Your (.+)$/, (m, n) => `내 ${n(m[1])}`],
  [/^Walk to (.+)$/, (m, n) => `${n(m[1])}까지 도보`],
];

/** en → ko names collected from the courses themselves (titles, locations, entry/exit). */
function collectNames(courses: Course[]): Names {
  const names: Names = new Map();
  const add = (l?: { en?: string; ko?: string }) => { if (l?.en && l.ko) { names.set(l.en, l.ko); names.set(l.en.toLowerCase(), l.ko); names.set(l.en.replace(' International', ''), l.ko); } };
  for (const c of courses) {
    add(c.title); add(c.entry?.name); add(c.exit?.name);
    for (const s of c.scenes) { add(s.location); for (const i of s.est?.items ?? []) add(i.label); }
  }
  for (const [en, ko] of [['hotel', '호텔'], ['hanok stay', '한옥스테이'], ['guesthouse', '게스트하우스'], ['pension', '펜션'], ['temple stay', '템플스테이'], ['jjimjilbang', '찜질방'], ['motel', '모텔'], ['resort', '리조트']]) {
    names.set(en, ko); names.set(en[0].toUpperCase() + en.slice(1), ko);
  }
  return names;
}

export function toKorean(en: string, names: Names): string | undefined {
  if (KO_TEXT[en]) return KO_TEXT[en];
  if (names.has(en)) return names.get(en);
  // a pattern only applies when every place name in it is known in Korean
  let unknown = false;
  const n = (s: string) => {
    const ko = names.get(s) ?? names.get(s.toLowerCase());
    if (!ko) unknown = true;
    return ko ?? s;
  };
  for (const [re, f] of PATTERNS) {
    const m = en.match(re);
    if (!m) continue;
    unknown = false;
    const ko = f(m, n);
    if (!unknown) return ko;
  }
  return undefined;
}

/** Fill in missing Korean on every { en } text of the courses (and any extra objects such as cards), in place. Returns the untranslated sentences. */
export function localizeCourses(courses: Course[], extra: unknown[] = []): string[] {
  const names = collectNames(courses);
  const missing = new Set<string>();
  const walk = (o: unknown): void => {
    if (!o || typeof o !== 'object') return;
    if (Array.isArray(o)) return o.forEach(walk);
    const r = o as Record<string, unknown>;
    if (typeof r.en === 'string' && Object.keys(r).every((k) => k === 'en' || k === 'ko')) {
      if (!r.ko) {
        const ko = toKorean(r.en, names);
        if (ko) r.ko = ko;
        else missing.add(r.en);
      }
      return;
    }
    for (const v of Object.values(r)) walk(v);
  };
  walk(courses);
  walk(extra);
  return [...missing];
}
