/**
 * Trip-time simulation: realistic duration (and cost) estimates for every travel element –
 * moving, transfers, walking, meals, visits, errands and overnight stays.
 * All values are typical estimates for planning, not guarantees.
 */
import type { EstItem, L, PartyType, Scene, SimStep, TimeCat } from './types';
import { BUS_FARE, LOCKERS, BAG_SIZE, MEDICINES, PARTY_PEOPLE, RESTAURANTS, SYMPTOMS, TICKET_SITES, ticketTotal, type TicketKind } from './practice';
import { timetable, toMin } from './rail';
import { bestRoute } from './subway';

export const TIME_CAT: Record<TimeCat, { icon: string; name: L; color: string }> = {
  move: { icon: '🚇', name: { en: 'Transport', ko: '이동' }, color: '#2D6CDF' },
  walk: { icon: '🚶', name: { en: 'Walking', ko: '도보' }, color: '#0E9F6E' },
  meal: { icon: '🍚', name: { en: 'Meals', ko: '식사' }, color: '#E8772E' },
  visit: { icon: '🏯', name: { en: 'Sightseeing & activities', ko: '관광·체험' }, color: '#B83280' },
  task: { icon: '🧾', name: { en: 'Errands (tickets, money, check-in…)', ko: '용무 (매표·환전·체크인 등)' }, color: '#6B7280' },
  stay: { icon: '🛏️', name: { en: 'Overnight stay', ko: '숙박' }, color: '#7A4FD6' },
};

export const partyCount = (party: PartyType) => PARTY_PEOPLE[party].length;
export const hm = (min: number) => `${String(Math.floor(min / 60) % 24).padStart(2, '0')}:${String(Math.round(min) % 60).padStart(2, '0')}`;
export const dur = (min: number, lang = 'en') => {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  if (lang === 'ko') return h ? `${h}시간${m ? ` ${m}분` : ''}` : `${m}분`;
  return h ? `${h} h${m ? ` ${m} min` : ''}` : `${m} min`;
};

/** Typical real-world time for a hands-on simulation step (null = no real-world time, e.g. phrase practice). */
export function simEstimate(step: SimStep, party: PartyType): EstItem | null {
  const cfg = step.config ?? {};
  const n = partyCount(party);
  const label = step.title;
  switch (step.sim) {
    case 'exchange': return { min: 15, cat: 'task', label };
    case 'atm': return { min: 10, cat: 'task', label };
    case 'tmoney': return { min: 10, cat: 'task', label, cost: 3000, perPerson: true };
    case 'train': {
      const run = timetable(cfg.to ?? 'singyeongju')[0];
      return run ? { min: toMin(run.arr) - toMin(run.dep) + 20, cat: 'move', label, cost: run.fare, perPerson: true } : null;
    }
    case 'cashpay': return { min: 5, cat: 'task', label, cost: (cfg.items ?? []).reduce((a, i) => a + i.price, 0), perPerson: false };
    case 'dayplan': return null; // the planner reports its own timeline
    case 'transfer': {
      const r = bestRoute(cfg.fromStation ?? 'myeongdong', cfg.toStation ?? 'seongsu');
      return { min: r.min + 10, cat: 'move', label, cost: 1550, perPerson: true };
    }
    case 'kiosk': return { min: 5, cat: 'task', label };
    case 'phrase': return null;
    case 'bus': return { min: 8 + Math.max(1, (cfg.stops?.length ?? 2) - 1) * 4, cat: 'move', label, cost: BUS_FARE, perPerson: true };
    case 'ticket': {
      const site = TICKET_SITES[cfg.site ?? 'palace'];
      const counts: Partial<Record<TicketKind, number>> = {};
      for (const p of PARTY_PEOPLE[party]) counts[p.kind] = (counts[p.kind] ?? 0) + 1;
      return { min: 10, cat: 'task', label, cost: site ? ticketTotal(site, counts, !!cfg.hanbok) : 0, perPerson: false };
    }
    case 'menu': {
      const r = RESTAURANTS[cfg.restaurant ?? 'bbq'];
      const main = r?.items.find((i) => i.main && !i.spicy) ?? r?.items[0];
      return { min: 60, cat: 'meal', label, cost: (main?.price ?? 10000) * Math.max(n, main?.min ?? 1), perPerson: false };
    }
    case 'recycle': return { min: 5, cat: 'task', label };
    case 'pharmacy': return { min: 15, cat: 'task', label, cost: MEDICINES.find((m) => m.id === SYMPTOMS[cfg.symptom ?? 'cold']?.med)?.price, perPerson: false };
    case 'taxi': {
      const fare = cfg.fare ?? 10000;
      return { min: Math.min(90, Math.max(10, 8 + Math.round((fare - 4800) / 450))), cat: 'move', label, cost: Math.round((cfg.night ? fare * 1.2 : fare) / 100) * 100, perPerson: false };
    }
    case 'checkin': return { min: 10, cat: 'task', label };
    case 'locker': return { min: 10, cat: 'task', label, cost: LOCKERS[BAG_SIZE[cfg.bag ?? 'carryon']].price, perPerson: false };
    case 'crosswalk': return { min: 10, cat: 'walk', label };
    default: return null;
  }
}

/** Cost of an item for the whole party. */
export function itemCost(it: { cost?: number; perPerson?: boolean; cat: TimeCat }, party: PartyType) {
  if (!it.cost) return 0;
  const n = partyCount(party);
  if (it.cat === 'stay') return it.perPerson ? it.cost * n : it.cost * Math.ceil(n / 2);
  return it.perPerson === false ? it.cost : it.cost * n;
}

/** Everything that takes time in a scene, in order: scene items first, then its visible simulations. */
export function sceneItems(scene: Scene, simSteps: SimStep[], party: PartyType): EstItem[] {
  const out: EstItem[] = [...(scene.est?.items ?? [])];
  for (const st of simSteps) {
    const e = simEstimate(st, party);
    if (e) out.push(e);
  }
  return out;
}

/** Whole-course estimate (all scenes, no conditions): total minutes per category and cost. */
export function courseEstimate(scenes: Scene[], party: PartyType) {
  const byCat: Record<TimeCat, number> = { move: 0, walk: 0, meal: 0, visit: 0, task: 0, stay: 0 };
  let cost = 0;
  for (const sc of scenes) {
    if (sc.est?.recap) continue;
    for (const it of sceneItems(sc, sc.steps.filter((s): s is SimStep => s.type === 'sim'), party)) {
      if (it.cat !== 'stay') byCat[it.cat] += it.min;
      cost += itemCost(it, party);
    }
  }
  return { byCat, cost, active: Object.entries(byCat).reduce((a, [k, v]) => (k === 'stay' ? a : a + v), 0) };
}
