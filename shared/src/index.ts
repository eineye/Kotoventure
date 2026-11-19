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

export const COURSES = [seoulClassic, busanFood, gyeongjuHeritage, jejuAdventure, kcultureExperience];

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
