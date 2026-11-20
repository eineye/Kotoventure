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
  /** Only show if ALL these flags are set (delayed consequences of earlier choices). */
  ifFlags?: string[];
  /** Hide if ANY of these flags is set. */
  unlessFlags?: string[];
  /** Random event: probability 0..1 that the step happens on a given play. */
  chance?: number;
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
  /** flags set when this option is picked (checked later by ifFlags/unlessFlags) */
  setFlags?: string[];
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
export type SimKind = 'exchange' | 'atm' | 'tmoney' | 'train' | 'cashpay' | 'dayplan' | 'transfer' | 'kiosk' | 'phrase' | 'bus' | 'ticket' | 'menu' | 'recycle' | 'pharmacy' | 'taxi' | 'checkin' | 'locker' | 'crosswalk';

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
  /** cashpay: shop name and what you buy */
  shop?: string;
  items?: { name: string; price: number }[];
  /** cashpay: the shop does not take cards (markets, street stalls) */
  cashOnly?: boolean;
  /** dayplan: plan a free day */
  weekday?: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
  places?: string[];
  hotel?: string;
  /** dayplan: start place (defaults to the hotel) and start time (default 09:00) */
  startAt?: string;
  start?: string;
  weather?: { kind: 'heat' | 'rain' | 'storm'; from: string; to: string; text: string };
  /** transfer: subway route puzzle (station ids from subway.ts) */
  fromStation?: string;
  toStation?: string;
  timeLimit?: number;
  /** kiosk: order at a self-service kiosk */
  menu?: 'cafe' | 'snack' | 'gukbap' | 'pcbang';
  order?: { id: string; qty: number; temp?: 'ice' | 'hot'; size?: 'R' | 'L' }[];
  dineIn?: boolean;
  english?: boolean;
  /** phrase: build Korean sentences from word tiles */
  phrases?: { ko: string; roman: string; en: string; extra?: string[] }[];
  /** bus: route number, colour, stops (in order) and where to get off */
  busNo?: string;
  busColor?: 'blue' | 'green' | 'yellow' | 'red';
  stops?: string[];
  getOff?: string;
  /** ticket: site id (practice.ts TICKET_SITES); hanbok = party wears hanbok */
  site?: string;
  hanbok?: boolean;
  /** menu: restaurant id (practice.ts RESTAURANTS) */
  restaurant?: string;
  /** recycle: trash item ids (practice.ts TRASH) */
  trash?: string[];
  /** pharmacy: symptom id (practice.ts SYMPTOMS) */
  symptom?: string;
  /** taxi: destination name, its Korean address, late night?, estimated fare */
  dest?: string;
  addr?: string;
  night?: boolean;
  fare?: number;
  /** check-in: door code, room number, check-out time */
  code?: string;
  room?: string;
  checkout?: string;
  /** locker: what you need to store */
  bag?: 'backpack' | 'carryon' | 'large';
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

/** Kinds of time in the trip simulation. */
export type TimeCat = 'move' | 'walk' | 'meal' | 'visit' | 'task' | 'stay';
export interface EstItem {
  min: number;
  cat: TimeCat;
  label: L;
  /** KRW per person (or per room for 'stay' unless perPerson) */
  cost?: number;
  perPerson?: boolean;
}
/** Realistic time/cost estimate for a scene (beyond its hands-on simulations). */
export interface SceneEst {
  /** clock time this scene starts at the earliest (e.g. '18:00' for a dinner) */
  start?: string;
  items: EstItem[];
  /** the scene is a highlight of a day already scheduled by the day planner – adds no time */
  recap?: boolean;
}

export interface Scene {
  id: string;
  day: number;
  title: L;
  location: L;
  /** background id (see app/src/art/backgrounds) */
  bg: string;
  /** scene only happens if ALL flags are set (e.g. visit:bukchon from the day planner) */
  requires?: string[];
  /** estimated real-world time & cost of this scene */
  est?: SceneEst;
  steps: Step[];
}

export interface Gateway {
  kind: 'airport' | 'port';
  code: string;
  name: L;
}

/** Province-level areas used to group missions. */
export type Area = 'seoul' | 'gyeonggi' | 'incheon' | 'chungcheong' | 'gangwon' | 'jeolla' | 'gyeongsang' | 'jeju';

export interface Course {
  id: string;
  categoryId: string;
  /** province-level area for the mission list filter */
  area?: Area;
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
  /** physical cash in the wallet: denomination (KRW) → count. Part of `money`. */
  cash?: Record<string, number>;
  /** consequence flags set by choices and simulations */
  flags?: string[];
  /** per-topic learning tally: c = correct (fractional for sims), n = answered */
  topics?: Partial<Record<TopicId, { c: number; n: number }>>;
  /** things to review: "sceneId:stepIndex:optionIndex" (optionIndex −1 = simulation) */
  missed?: string[];
  /** trip clock: current day and minutes since midnight */
  clock?: { day: number; min: number };
  /** what happened when – the simulated timeline */
  trail?: TrailEntry[];
}

export interface TrailEntry {
  day: number;
  sceneId: string;
  title: L;
  start: number;
  end: number;
  items: { cat: TimeCat; min: number; label: L; cost?: number }[];
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
