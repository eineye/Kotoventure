/**
 * Kotoventure shared domain model.
 * Used by the mobile app, the admin web and the seed generator.
 * Everything here must stay dependency-free (pure TypeScript).
 */

/** Localised text. `en` is required, other languages (ko, ja, zh, ...) can be added from the admin. */
export type L = { en: string } & Record<string, string>;

/** The 8 survival topics that every mission must cover. */
export type TopicId =
  | 'transport'
  | 'lodging'
  | 'food'
  | 'money'
  | 'etiquette'
  | 'law'
  | 'weather'
  | 'medical';

export type PartyType = 'solo' | 'couple' | 'friends' | 'group';

export interface Phrase {
  hangul: string;
  roman: string;
  meaning: string;
}

export interface Category {
  id: string;
  name: L;
  /** emoji or icon key */
  icon: string;
  color: string;
  sortOrder: number;
  isActive: boolean;
}

export interface KnowledgeCard {
  id: string;
  topic: TopicId;
  title: L;
  body: L;
  /** 2D illustration id (see app/src/art/props) */
  prop?: string;
  phrase?: Phrase;
  tips?: L[];
}

export interface Effects {
  /** stamina 0..100 */
  energy?: number;
  /** wallet change in KRW */
  money?: number;
  /** manner score 0..100 */
  manner?: number;
}

export type Speaker =
  | 'guide'
  | 'player'
  | 'local'
  | 'staff'
  | 'driver'
  | 'police'
  | 'doctor'
  | 'pharmacist'
  | 'elder'
  | 'monk'
  | 'haenyeo';

interface StepBase {
  /** Only show this step for these party types. Empty/undefined = everyone. */
  parties?: PartyType[];
}

export interface NarrationStep extends StepBase {
  type: 'narration';
  text: L;
}

export interface DialogStep extends StepBase {
  type: 'dialog';
  speaker: Speaker;
  text: L;
  phrase?: Phrase;
}

export interface ChoiceOption {
  text: L;
  /** optional illustration to make the option a tappable picture */
  prop?: string;
  correct: boolean;
  feedback: L;
  effects?: Effects;
}

export interface ChoiceStep extends StepBase {
  type: 'choice';
  topic: TopicId;
  prompt: L;
  options: ChoiceOption[];
  /** card unlocked after answering */
  cardId?: string;
}

export interface CardStep extends StepBase {
  type: 'card';
  cardId: string;
}

export interface EventStep extends StepBase {
  type: 'event';
  kind: 'weather' | 'health' | 'money' | 'surprise' | 'law';
  title: L;
  text: L;
  prop?: string;
  effects?: Effects;
}

/** Hands-on simulations of real Korean machines / counters. */
export type SimKind = 'exchange' | 'atm' | 'tmoney' | 'train';

export interface SimConfig {
  /** exchange: where you exchange – airport rates are worse than downtown money changers */
  venue?: 'airport' | 'downtown';
  /** exchange: how much cash (KRW) the mission suggests you need */
  targetKRW?: number;
  /** atm: also practise a Korean passbook (통장) update after the withdrawal */
  passbookPractice?: boolean;
  /** tmoney: buy a new card first (otherwise you already have one) */
  buyCard?: boolean;
  /** train: departure / destination station ids (see rail.ts) and latest acceptable arrival "HH:MM" */
  from?: string;
  to?: string;
  arriveBy?: string;
}

export interface SimStep extends StepBase {
  type: 'sim';
  sim: SimKind;
  topic: TopicId;
  title: L;
  intro: L;
  config?: SimConfig;
  /** card unlocked after the simulation */
  cardId?: string;
}

export type Step = NarrationStep | DialogStep | ChoiceStep | CardStep | EventStep | SimStep;

export interface Scene {
  id: string;
  day: number;
  title: L;
  location: L;
  /** background id (see app/src/art/backgrounds) */
  bg: string;
  steps: Step[];
}

export interface Gateway {
  kind: 'airport' | 'port';
  code: string;
  name: L;
}

export interface Course {
  id: string;
  categoryId: string;
  title: L;
  subtitle: L;
  description: L;
  region: L;
  entry: Gateway;
  exit: Gateway;
  nights: number;
  days: number;
  /** 1 (easy) .. 3 (hard) */
  difficulty: number;
  /** how well the course fits each party type, 1..5 */
  partyFit: Record<PartyType, number>;
  partyTips: Partial<Record<PartyType, L>>;
  /** starting wallet in KRW */
  startBudget: number;
  coverBg: string;
  /** 'base' = included in the $0.99 app purchase, 'iap' = sold separately */
  access: 'base' | 'iap';
  productId?: string;
  isPublished: boolean;
  version: number;
  sortOrder: number;
  scenes: Scene[];
}

export interface Product {
  id: string;
  type: 'paid_app' | 'course_pack';
  title: L;
  priceUsd: number;
  iosProductId: string;
  androidProductId: string;
  courseIds: string[];
  isActive: boolean;
}

export interface AppConfig {
  /** reference exchange rates, KRW per 1 unit of currency. Editable from the admin. */
  fxRates: Record<string, number>;
  fxUpdatedAt: string;
  emergencyNumbers: { label: L; number: string }[];
  /** short notice shown on the home screen (e.g. weather alert, event) */
  notice?: L;
  minAppVersion: string;
}

export interface ContentBundle {
  version: number;
  generatedAt: string;
  categories: Category[];
  cards: KnowledgeCard[];
  courses: Course[];
  products: Product[];
  config: AppConfig;
}

/** player state while playing a course */
export interface RunStats {
  energy: number;
  money: number;
  manner: number;
  /** fractional for simulations (score/100) */
  correct: number;
  answered: number;
  /** number of simulations played and their summed score (0..100 each) */
  sims?: number;
  simPoints?: number;
}

export interface CourseProgress {
  courseId: string;
  courseVersion: number;
  sceneIndex: number;
  stepIndex: number;
  stats: RunStats;
  cards: string[];
  phrases: string[];
  completedAt?: string;
  bestScore?: number;
  plays: number;
}
