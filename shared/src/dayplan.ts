/**
 * Day-planner simulation: turns a player's itinerary into a timeline with consequences.
 * Pure logic (no UI) so it can be unit-tested and reused by the admin.
 */
import { MODE_ICON, MODE_NAME, REGIONS, placeById, regionOf, travel, type Place, type Transport, type Weekday } from './places';
import type { SimConfig } from './types';

export interface PlanStop {
  placeId: string;
  /** how you get TO this stop */
  mode: Transport;
}

export interface PlanEvent {
  time: string;
  kind: 'travel' | 'visit' | 'closed' | 'late' | 'wait' | 'weather' | 'hungry' | 'lastTrain' | 'night' | 'end' | 'tired';
  text: string;
  good?: boolean;
}

export interface PlanResult {
  events: PlanEvent[];
  fun: number;
  cost: number;
  energy: number;
  visited: string[];
  score: number;
  endMin: number;
  /** fun needed for 100 points (scaled to available hours and region) */
  target: number;
}

export const toMinutes = (s: string) => {
  const [h, m] = s.split(':').map(Number);
  return h * 60 + (m || 0);
};
export const hhmm = (m: number) => `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(Math.round(m) % 60).padStart(2, '0')}`;

/** Fun points that make a 100-point FULL day (09:00–21:00) in Seoul. */
export const FUN_TARGET = 75;

/** Fun target for a plan: scaled by the hours available (a half day needs less) and the region's travel distances. */
export function funTarget(cfg: SimConfig): number {
  const hotel = placeById(cfg.hotel ?? 'hotel-myeongdong');
  const hours = (21 * 60 - toMinutes(cfg.start ?? '09:00')) / (12 * 60);
  return Math.round(FUN_TARGET * Math.max(0.4, Math.min(1, hours)) * REGIONS[regionOf(hotel)].funFactor);
}
const DAY_NAME: Record<string, string> = { Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday' };

export function simulatePlan(cfg: SimConfig, stops: PlanStop[], returnMode: Transport, flags: string[], startEnergy: number): PlanResult {
  const hotel = placeById(cfg.hotel ?? 'hotel-myeongdong')!;
  const weekday = (cfg.weekday ?? 'Mon') as Weekday;
  const wFrom = cfg.weather ? toMinutes(cfg.weather.from) : -1;
  const wTo = cfg.weather ? toMinutes(cfg.weather.to) : -1;
  const region = REGIONS[regionOf(hotel)];
  const lastAt = region.last ? toMinutes(region.last.at) : Infinity;
  const ev: PlanEvent[] = [];
  let t = toMinutes(cfg.start ?? '09:00');
  let at: Place = placeById(cfg.startAt) ?? hotel;
  let fun = 0;
  let cost = 0;
  let energy = 0;
  let ate = t >= 12 * 60; // starting after noon = already had lunch
  let penalty = 0;
  const visited: string[] = [];

  const go = (to: Place, mode: Transport) => {
    const tr = travel(at, to, mode, t);
    // last subway / bus of the day
    if (region.last && mode === region.last.mode && t + tr.min > lastAt) {
      const taxi = travel(at, to, 'taxi', t);
      ev.push({ time: hhmm(t), kind: 'lastTrain', text: `Missed the last ${MODE_NAME[mode].toLowerCase()} (~${region.last.at}) – late-night taxi instead (₩${taxi.cost.toLocaleString('en-US')})` });
      cost += taxi.cost;
      t += taxi.min;
      penalty += 5;
    } else {
      cost += tr.cost;
      energy += tr.energy;
      ev.push({ time: hhmm(t), kind: 'travel', text: `${MODE_ICON[mode]} ${MODE_NAME[mode]} to ${to.name.en} (${tr.min} min${tr.cost ? `, ₩${tr.cost.toLocaleString('en-US')}` : ''})` });
      t += tr.min;
    }
    at = to;
  };

  for (const s of stops) {
    const p = placeById(s.placeId);
    if (!p) continue;
    // lunch check before leaving for an afternoon stop
    if (!ate && t >= 14 * 60 + 30 && !p.food) {
      ev.push({ time: hhmm(t), kind: 'hungry', text: 'You skipped lunch – hungry and grumpy (energy −12).' });
      energy += 12;
      penalty += 6;
      ate = true; // only once
    }
    go(p, s.mode);
    const open = toMinutes(p.open);
    const last = toMinutes(p.lastEntry ?? p.close);
    if (p.closedOn?.includes(weekday)) {
      ev.push({ time: hhmm(t), kind: 'closed', text: `${p.name.en} is CLOSED on ${DAY_NAME[weekday]}s! The trip was wasted.` });
      penalty += 10;
      continue;
    }
    if (cfg.weather?.kind === 'storm' && p.outdoor && t < wTo && t + p.visitMin > wFrom) {
      ev.push({ time: hhmm(t), kind: 'closed', text: `🌀 Typhoon warning: ${p.name.en} is closed / unsafe (outdoor). Trip wasted.` });
      energy += 6;
      penalty += 10;
      continue;
    }
    if (t > last) {
      ev.push({ time: hhmm(t), kind: 'late', text: `Too late for ${p.name.en} (last entry ${p.lastEntry ?? p.close}).` });
      penalty += 8;
      continue;
    }
    if (t < open) {
      ev.push({ time: hhmm(t), kind: 'wait', text: `${p.name.en} opens at ${p.open} – waiting ${open - t} min.` });
      t = open;
    }
    const start = t;
    const end = Math.min(t + p.visitMin, toMinutes(p.close));
    let f = p.fun * Math.min(1, (end - start) / p.visitMin);
    let e = p.energy;
    const notes: PlanEvent[] = [];
    if (end - start < p.visitMin) notes.push({ time: hhmm(end), kind: 'late', text: `${p.name.en} closed before you finished – rushed visit.` });
    // weather
    if (cfg.weather && p.outdoor && start < wTo && end > wFrom) {
      if (cfg.weather.kind === 'heat') {
        e += 10;
        f -= 5;
        notes.push({ time: hhmm(Math.max(start, wFrom)), kind: 'weather', text: `🥵 Heat at ${p.name.en}: outdoor sightseeing in the afternoon heat (energy −10).` });
      } else if (flags.includes('umbrella')) {
        e += 3;
        notes.push({ time: hhmm(Math.max(start, wFrom)), kind: 'weather', text: `🌂 Shower at ${p.name.en} – good thing you bought that umbrella!`, good: true });
      } else {
        e += 12;
        f -= 8;
        notes.push({ time: hhmm(Math.max(start, wFrom)), kind: 'weather', text: `🌧️ Downpour at ${p.name.en} and no umbrella – soaked (energy −12).` });
      }
    }
    if (p.nightBonus && end >= 18 * 60) {
      f += p.nightBonus;
      notes.push({ time: hhmm(end), kind: 'night', text: `✨ Night view from ${p.name.en}!`, good: true });
    }
    if (p.food && start >= 11 * 60 && start <= 14 * 60 + 30) ate = true;
    else if (p.food && !ate && start > 14 * 60 + 30) {
      ate = true;
      e += 5;
      penalty += 2;
      notes.push({ time: hhmm(start), kind: 'hungry', text: `Very late lunch at ${p.name.en} – you were starving by then (energy −5).` });
    }
    t = end;
    cost += p.cost;
    energy += e;
    fun += Math.max(0, f);
    visited.push(p.id);
    ev.push({ time: hhmm(start), kind: 'visit', text: `${p.name.en}: ${p.food ? 'meal, ' : ''}${end - start} min${p.cost ? ` (₩${p.cost.toLocaleString('en-US')})` : ''}`, good: true });
    ev.push(...notes);
  }
  if (!ate && t >= 14 * 60 + 30) {
    ev.push({ time: hhmm(t), kind: 'hungry', text: 'No proper lunch today (energy −12).' });
    energy += 12;
    penalty += 6;
  }
  go(hotel, returnMode);
  if (t > 23 * 60) {
    ev.push({ time: hhmm(t), kind: 'tired', text: 'Back very late – tomorrow will be tough (energy −10).' });
    energy += 10;
  }
  if (startEnergy - energy <= 0) {
    ev.push({ time: hhmm(t), kind: 'tired', text: 'You pushed too hard and collapsed at the hotel.' });
    penalty += 15;
  }
  ev.push({ time: hhmm(t), kind: 'end', text: `Back at the hotel at ${hhmm(t)}.` });
  const target = funTarget(cfg);
  const score = Math.max(0, Math.min(100, Math.round((fun / target) * 100) - penalty));
  return { events: ev, fun: Math.round(fun), cost, energy, visited, score, endMin: t, target };
}
