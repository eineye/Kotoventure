import {
  BUS_FARE,
  PARTY_PEOPLE,
  RESTAURANTS,
  TICKET_SITES,
  VENUE_SPREAD,
  addCash,
  cashTotal,
  ticketTotal,
  timetable,
  type Cash,
  type SimStep,
  type TicketKind,
} from '@kotoventure/shared';
import { MENUS, linePrice, type Line } from './KioskSim';
import { PARTY_SIZE, type SimCtx, type SimResult } from './kit';

/** Sims a player who already knows the routine may skip (the day planner is a decision, not a routine). */
export const canSkip = (step: SimStep) => step.sim !== 'dayplan';

/** Pay `total` from the wallet if possible (the change is put back as tidy notes/coins). */
function payCash(w: Cash, total: number): Cash | null {
  const have = cashTotal(w);
  return have >= total ? addCash({}, have - total) : null;
}

/**
 * What happens when a simulation is skipped: the routine is done "correctly" in the background,
 * so money, cash and the trip continue realistically – but no simulation score is recorded.
 */
export function skipOutcome(step: SimStep, ctx: SimCtx): SimResult {
  const cfg = step.config ?? {};
  const size = PARTY_SIZE[ctx.party];
  const log = [`Skipped: ${step.title.en}`];
  switch (step.sim) {
    case 'exchange': {
      const amt = cfg.targetKRW ?? 100000;
      return { score: 0, log, effects: { money: -Math.round(amt * VENUE_SPREAD[cfg.venue ?? 'airport']) }, cash: addCash(ctx.cash, amt) };
    }
    case 'atm': {
      const amt = cfg.targetKRW ?? 100000;
      return { score: 0, log, effects: { money: -3600 }, cash: addCash(ctx.cash, amt) };
    }
    case 'tmoney': {
      const cost = (cfg.buyCard ?? true ? 3000 : 0) + 10000;
      const cash = payCash(ctx.cash, cost);
      return { score: 0, log, effects: { money: -cost }, ...(cash ? { cash } : {}) };
    }
    case 'cashpay': {
      const total = (cfg.items ?? []).reduce((a, i) => a + i.price, 0);
      const cash = payCash(ctx.cash, total);
      return { score: 0, log, effects: { money: -total }, ...(cash ? { cash } : {}) };
    }
    case 'train': {
      const fare = timetable(cfg.to ?? 'singyeongju')[0]?.fare ?? 0;
      return { score: 0, log, effects: { money: -fare * size } };
    }
    case 'transfer':
      return { score: 0, log, effects: { money: -1550, energy: -2 } };
    case 'kiosk': {
      const menu = MENUS[cfg.menu ?? 'cafe'];
      const total = ((cfg.order ?? []) as Line[]).reduce((a, l) => {
        const it = menu.items.find((i) => i.id === l.id);
        return a + (it ? linePrice(it, l) : 0);
      }, 0);
      return { score: 0, log, effects: { money: -total, energy: 8 } };
    }
    case 'bus':
      return { score: 0, log, effects: { money: -BUS_FARE * size } };
    case 'ticket': {
      const site = TICKET_SITES[cfg.site ?? 'palace'];
      const counts: Partial<Record<TicketKind, number>> = {};
      for (const p of PARTY_PEOPLE[ctx.party]) counts[p.kind] = (counts[p.kind] ?? 0) + 1;
      return { score: 0, log, effects: { money: -(site ? ticketTotal(site, counts, !!cfg.hanbok) : 0) } };
    }
    case 'menu': {
      const r = RESTAURANTS[cfg.restaurant ?? 'bbq'];
      const main = r?.items.find((i) => i.main && !i.spicy) ?? r?.items[0];
      const portions = Math.max(size, main?.min ?? 1);
      return { score: 0, log, effects: { money: -(main?.price ?? 0) * portions, energy: 15 } };
    }
    default:
      return { score: 0, log };
  }
}
