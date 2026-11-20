export * from './types';
export * from './meta';
export * from './engine';
export * from './money';
export * from './rail';
export { CARDS } from './cards';
import type { ContentBundle } from './types';
import { CARDS } from './cards';
import { CATEGORIES, DEFAULT_CONFIG, PRODUCTS } from './meta';
import { seoulClassic } from './courses/seoul-classic';
import { busanFood } from './courses/busan-food';
import { gyeongjuHeritage } from './courses/gyeongju-heritage';
import { jejuAdventure } from './courses/jeju-adventure';
import { kcultureExperience } from './courses/kculture-experience';

import { buildMission } from './courses/gen';
import { ORIGINAL_EST } from './courses/estimates';
import { SEOUL_MISSIONS } from './courses/missions-seoul';
import { REGION_MISSIONS } from './courses/missions-regions';

const ORIGINAL = [seoulClassic, busanFood, gyeongjuHeritage, jejuAdventure, kcultureExperience];
const ORIGINAL_AREA = { 'seoul-classic': 'seoul', 'busan-food': 'gyeongsang', 'gyeongju-heritage': 'gyeongsang', 'jeju-adventure': 'jeju', 'kculture-experience': 'seoul' } as const;
for (const c of ORIGINAL) {
  c.area = ORIGINAL_AREA[c.id as keyof typeof ORIGINAL_AREA];
  for (const sc of c.scenes) if (ORIGINAL_EST[sc.id]) sc.est = ORIGINAL_EST[sc.id];
}

/** 50 regional missions (Seoul 15 + 7 regions × 5) generated from compact definitions. */
export const REGIONAL_COURSES = [...SEOUL_MISSIONS, ...REGION_MISSIONS].map((d, i) => buildMission(d, 10 + i));

export const COURSES = [...ORIGINAL, ...REGIONAL_COURSES];
for (const p of PRODUCTS) {
  if (p.type === 'paid_app') p.courseIds = COURSES.filter((c) => c.access === 'base').map((c) => c.id);
  else if (p.id.startsWith('pack_') && !p.courseIds.length) p.courseIds = COURSES.filter((c) => c.productId === p.id).map((c) => c.id);
}

/** Bundled seed content – used offline, in demo mode and to seed the database. */
export const SEED_BUNDLE: ContentBundle = {
  version: 1,
  generatedAt: '2026-11-18',
  categories: CATEGORIES,
  cards: CARDS,
  courses: COURSES,
  products: PRODUCTS,
  config: DEFAULT_CONFIG,
};
export * from './art-ids';
export * from './places';
export * from './subway';
export * from './dayplan';
export * from './practice';
export * from './timeline';
