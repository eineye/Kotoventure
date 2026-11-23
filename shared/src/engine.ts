/** Pure game logic shared by app (gameplay) and admin (preview / validation). */
import { translateText } from './i18n/translate';
import type { ContentBundle, Course, Effects, KnowledgeCard, L, PartyType, RunStats, Scene, Step, TopicId } from './types';
import { TOPICS } from './meta';
import { stationById } from './rail';
import { DEFAULT_CASH } from './money';
import { placeById } from './places';
import { stationOf } from './subway';
import { RESTAURANTS, SYMPTOMS, TICKET_SITES, trashById } from './practice';

export const SIM_KINDS = ['exchange', 'atm', 'tmoney', 'train', 'cashpay', 'dayplan', 'transfer', 'kiosk', 'phrase', 'bus', 'ticket', 'menu', 'recycle', 'pharmacy', 'taxi', 'checkin', 'locker', 'crosswalk'] as const;

/** Record a finished simulation (score 0..100) in the run stats. */
export function applySim(s: RunStats, points: number): RunStats {
  const p = Math.max(0, Math.min(100, Math.round(points)));
  return { ...s, answered: s.answered + 1, correct: s.correct + p / 100, sims: (s.sims ?? 0) + 1, simPoints: (s.simPoints ?? 0) + p };
}

/** Text of an L object in a language; ja/zh/es come from the translation dictionaries when the object has none. */
export const tr = (l: L | undefined, lang = 'en'): string => (l ? l[lang] || (lang !== 'en' && lang !== 'ko' && l.en ? translateText(l.en, lang) : '') || l.en || '' : '');

export const initialStats = (course: Course): RunStats => ({
  energy: 100,
  money: course.startBudget,
  manner: 50,
  correct: 0,
  answered: 0,
  cash: { ...DEFAULT_CASH },
});

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export function applyEffects(s: RunStats, e?: Effects): RunStats {
  if (!e) return s;
  return {
    ...s,
    energy: clamp(s.energy + (e.energy ?? 0), 0, 100),
    manner: clamp(s.manner + (e.manner ?? 0), 0, 100),
    money: s.money + (e.money ?? 0),
  };
}

/** deterministic 0..1 from a string (so random events are stable within one play) */
export function roll(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return ((h >>> 0) % 10000) / 10000;
}

const flagsOk = (ifF: string[] | undefined, unlessF: string[] | undefined, flags: string[]) =>
  (!ifF || ifF.every((f) => flags.includes(f))) && (!unlessF || !unlessF.some((f) => flags.includes(f)));

/** Steps visible for the party type, the consequence flags and (for random events) this play's seed. */
export const visibleSteps = (scene: Scene, party: PartyType, flags: string[] = [], seed = '', month?: number): Step[] =>
  scene.steps.filter(
    (st, i) =>
      (!st.months || !month || st.months.includes(month)) &&
      (!st.parties || st.parties.length === 0 || st.parties.includes(party)) &&
      flagsOk(st.ifFlags, st.unlessFlags, flags) &&
      (st.chance === undefined || roll(`${seed}|${scene.id}|${i}`) < st.chance),
  );

/** `requires` entries are flags; a leading "!" means the flag must be absent. */
export const sceneVisible = (scene: Scene, flags: string[] = []) =>
  !scene.requires || scene.requires.every((f) => (f.startsWith('!') ? !flags.includes(f.slice(1)) : flags.includes(f)));

/** Index of the next playable scene after `from` (skips scenes whose requirements aren't met). */
export function nextScene(course: Course, from: number, flags: string[], minDay?: number): number {
  for (let i = from + 1; i < course.scenes.length; i++) {
    const sc = course.scenes[i];
    if (minDay !== undefined && sc.day < minDay) continue;
    if (sceneVisible(sc, flags)) return i;
  }
  return course.scenes.length;
}

/** Record a learning result for a topic (value 0..1) and remember misses for the review list. */
export function tally(s: RunStats, topic: TopicId, value: number, missKey?: string): RunStats {
  const cur = s.topics?.[topic] ?? { c: 0, n: 0 };
  return {
    ...s,
    topics: { ...(s.topics ?? {}), [topic]: { c: cur.c + value, n: cur.n + 1 } },
    missed: missKey && value < 0.7 && !(s.missed ?? []).includes(missKey) ? [...(s.missed ?? []), missKey] : s.missed,
  };
}

/** Overall "Korea travel readiness" 0..100 from the per-topic tally (falls back to accuracy). */
export function readiness(s: RunStats): number {
  const ts = Object.values(s.topics ?? {}).filter((t) => t && t.n > 0) as { c: number; n: number }[];
  if (!ts.length) return s.answered ? Math.round((s.correct / s.answered) * 100) : 0;
  return Math.round((ts.reduce((a, t) => a + t.c / t.n, 0) / ts.length) * 100);
}

export function score(s: RunStats, course: Course): number {
  const quiz = s.answered ? (s.correct / s.answered) * 600 : 0;
  const budgetLeft = clamp(s.money / course.startBudget, 0, 1) * 100;
  return Math.round(quiz + s.manner * 2 + s.energy + budgetLeft);
}

export function grade(points: number): { letter: string; label: L } {
  if (points >= 900) return { letter: 'S', label: { en: 'Korea Master', ko: '한국 마스터' } };
  if (points >= 760) return { letter: 'A', label: { en: 'Savvy Traveller', ko: '센스 여행자' } };
  if (points >= 600) return { letter: 'B', label: { en: 'Good Explorer', ko: '좋은 탐험가' } };
  return { letter: 'C', label: { en: 'Brave Rookie', ko: '용감한 초보' } };
}

/** Topics a course covers (via choices and cards). Used by the validator and the result screen. */
export function courseTopics(course: Course, cards: KnowledgeCard[]): Set<TopicId> {
  const byId = new Map(cards.map((c) => [c.id, c]));
  const out = new Set<TopicId>();
  for (const sc of course.scenes)
    for (const st of sc.steps) {
      if (st.type === 'choice' || st.type === 'sim') out.add(st.topic);
      if (st.type === 'sim' && st.cardId && byId.get(st.cardId)) out.add(byId.get(st.cardId)!.topic);
      if (st.type === 'card' && byId.get(st.cardId)) out.add(byId.get(st.cardId)!.topic);
    }
  return out;
}

/** Course recommendation for a party type: party fit first, then difficulty. */
export function recommend(courses: Course[], party: PartyType): Course[] {
  return [...courses]
    .filter((c) => c.isPublished)
    .sort((a, b) => b.partyFit[party] - a.partyFit[party] || a.difficulty - b.difficulty || a.sortOrder - b.sortOrder);
}

export interface Issue { level: 'error' | 'warn'; where: string; msg: string }

/** Validates a bundle; used by `npm run validate` and the admin "Check" button. */
export function validateBundle(b: ContentBundle, known?: { props?: Set<string>; bgs?: Set<string> }): Issue[] {
  const issues: Issue[] = [];
  const cardIds = new Set(b.cards.map((c) => c.id));
  const catIds = new Set(b.categories.map((c) => c.id));
  const checkProp = (where: string, p?: string) => {
    if (p && known?.props && !known.props.has(p)) issues.push({ level: 'warn', where, msg: `unknown prop "${p}" (fallback icon will be used)` });
  };
  b.cards.forEach((c) => checkProp(`card ${c.id}`, c.prop));
  for (const c of b.courses) {
    if (!catIds.has(c.categoryId)) issues.push({ level: 'error', where: c.id, msg: `unknown category ${c.categoryId}` });
    if (!['airport', 'port'].includes(c.entry.kind)) issues.push({ level: 'error', where: c.id, msg: 'course must start at an airport or port' });
    const topics = courseTopics(c, b.cards);
    for (const t of TOPICS) if (!topics.has(t.id)) issues.push({ level: 'error', where: c.id, msg: `missing required topic: ${t.id}` });
    if (c.scenes.length === 0) issues.push({ level: 'error', where: c.id, msg: 'no scenes' });
    c.scenes.forEach((sc, i) => {
      const w = `${c.id} › ${sc.id}`;
      if (known?.bgs && !known.bgs.has(sc.bg)) issues.push({ level: 'warn', where: w, msg: `unknown background "${sc.bg}"` });
      sc.steps.forEach((st, j) => {
        const ws = `${w} › step ${j + 1}`;
        if (st.type === 'sim') {
          if (!SIM_KINDS.includes(st.sim)) issues.push({ level: 'error', where: ws, msg: `unknown simulation "${st.sim}"` });
          if (st.sim === 'dayplan' && (!st.config?.places?.length || st.config.places.some((p) => !placeById(p))))
            issues.push({ level: 'error', where: ws, msg: 'day plan needs valid config.places' });
          if (st.sim === 'bus' && (!st.config?.stops?.length || !st.config.getOff || !st.config.stops.includes(st.config.getOff) || st.config.stops.indexOf(st.config.getOff) === 0))
            issues.push({ level: 'error', where: ws, msg: 'bus needs config.stops and a getOff stop after the first' });
          if (st.sim === 'ticket' && !TICKET_SITES[st.config?.site ?? '']) issues.push({ level: 'error', where: ws, msg: 'ticket needs a known config.site' });
          if (st.sim === 'menu' && !RESTAURANTS[st.config?.restaurant ?? '']) issues.push({ level: 'error', where: ws, msg: 'menu needs a known config.restaurant' });
          if (st.sim === 'pharmacy' && !SYMPTOMS[st.config?.symptom ?? '']) issues.push({ level: 'error', where: ws, msg: 'pharmacy needs a known config.symptom' });
          if (st.sim === 'taxi' && (!st.config?.dest || !st.config.addr)) issues.push({ level: 'error', where: ws, msg: 'taxi needs config.dest and config.addr' });
          if (st.sim === 'checkin' && (!/^\d{4,6}$/.test(st.config?.code ?? '') || !/^\d{3}$/.test(st.config?.room ?? ''))) issues.push({ level: 'error', where: ws, msg: 'checkin needs a 4–6 digit code and a 3-digit room' });
          if (st.sim === 'recycle' && (st.config?.trash ?? []).some((t) => !trashById(t))) issues.push({ level: 'error', where: ws, msg: 'recycle: unknown trash item' });
          if (st.sim === 'dayplan') {
            const h = placeById(st.config?.hotel ?? 'hotel-myeongdong');
            if (!h || (st.config?.startAt && !placeById(st.config.startAt))) issues.push({ level: 'error', where: ws, msg: 'day plan hotel/startAt not found' });
            else if ((st.config?.places ?? []).some((p) => (placeById(p)?.region ?? 'seoul') !== (h.region ?? 'seoul')))
              issues.push({ level: 'error', where: ws, msg: 'day plan places must be in the same region as the hotel' });
          }
          if (st.sim === 'transfer' && (!stationOf(st.config?.fromStation) || !stationOf(st.config?.toStation)))
            issues.push({ level: 'error', where: ws, msg: 'transfer puzzle needs valid fromStation/toStation' });
          if (st.sim === 'phrase' && !st.config?.phrases?.length) issues.push({ level: 'error', where: ws, msg: 'phrase builder needs config.phrases' });
          if (st.sim === 'kiosk' && !st.config?.order?.length) issues.push({ level: 'error', where: ws, msg: 'kiosk needs config.order' });
          if (st.sim === 'cashpay' && !st.config?.items?.length) issues.push({ level: 'error', where: ws, msg: 'cash payment needs config.items (name + price)' });
          if (st.sim === 'train' && (!st.config?.to || !stationById(st.config.to))) issues.push({ level: 'error', where: ws, msg: 'train simulation needs a valid config.to station' });
        }
        if ((st.type === 'card' || ((st.type === 'choice' || st.type === 'sim') && st.cardId)) && !cardIds.has((st as any).cardId))
          issues.push({ level: 'error', where: ws, msg: `unknown card ${(st as any).cardId}` });
        if (st.type === 'choice') {
          if (!st.options.some((o) => o.correct)) issues.push({ level: 'error', where: ws, msg: 'choice has no correct option' });
          if (st.options.length < 2) issues.push({ level: 'error', where: ws, msg: 'choice needs 2+ options' });
          st.options.forEach((o) => checkProp(ws, o.prop));
        }
        if (st.type === 'event') checkProp(ws, st.prop);
      });
      if (i === 0 && !['airport', 'port'].includes(sc.bg)) issues.push({ level: 'warn', where: w, msg: 'first scene should be the airport/port' });
    });
  }
  const used = new Set(
    b.courses.flatMap((c) => c.scenes.flatMap((s) => s.steps.flatMap((st) => (st.type === 'card' ? [st.cardId] : (st.type === 'choice' || st.type === 'sim') && st.cardId ? [st.cardId] : [])))),
  );
  for (const card of b.cards) if (!used.has(card.id)) issues.push({ level: 'warn', where: `card ${card.id}`, msg: 'not used in any course' });
  return issues;
}
