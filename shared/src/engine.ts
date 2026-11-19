/** Pure game logic shared by app (gameplay) and admin (preview / validation). */
import type { ContentBundle, Course, Effects, KnowledgeCard, L, PartyType, RunStats, Scene, Step, TopicId } from './types';
import { TOPICS } from './meta';
import { stationById } from './rail';
import { DEFAULT_CASH } from './money';

export const SIM_KINDS = ['exchange', 'atm', 'tmoney', 'train', 'cashpay'] as const;

/** Record a finished simulation (score 0..100) in the run stats. */
export function applySim(s: RunStats, points: number): RunStats {
  const p = Math.max(0, Math.min(100, Math.round(points)));
  return { ...s, answered: s.answered + 1, correct: s.correct + p / 100, sims: (s.sims ?? 0) + 1, simPoints: (s.simPoints ?? 0) + p };
}

export const tr = (l: L | undefined, lang = 'en'): string => (l ? l[lang] || l.en || '' : '');

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

/** Steps visible for the selected party type. */
export const visibleSteps = (scene: Scene, party: PartyType): Step[] =>
  scene.steps.filter((st) => !st.parties || st.parties.length === 0 || st.parties.includes(party));

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
