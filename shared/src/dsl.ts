/**
 * Tiny authoring helpers to keep the seed courses readable.
 * The admin web edits the resulting plain JSON – these helpers are only for the seed.
 */
import type { ChoiceOption, Effects, PartyType, Phrase, Speaker, Step, TopicId } from './types';

type Opt = { parties?: PartyType[]; ifFlags?: string[]; unlessFlags?: string[]; chance?: number; months?: number[] };

/** travel months for season-specific steps (a step with `months` only shows when the player travels in one of them) */
export const M = { spring: [3, 4, 5], summer: [6, 7, 8], autumn: [9, 10, 11], winter: [12, 1, 2], hot: [6, 7, 8, 9], notHot: [10, 11, 12, 1, 2, 3, 4, 5], swim: [7, 8], noSwim: [9, 10, 11, 12, 1, 2, 3, 4, 5, 6], mild: [3, 4, 5, 9, 10, 11], warmHalf: [5, 6, 7, 8, 9], coldHalf: [10, 11, 12, 1, 2, 3, 4], typhoon: [7, 8, 9], noTyphoon: [10, 11, 12, 1, 2, 3, 4, 5, 6] };

export const say = (text: string, opt: Opt = {}): Step => ({ type: 'narration', text: { en: text }, ...opt });

export const talk = (speaker: Speaker, text: string, phrase?: Phrase, opt: Opt = {}): Step => ({
  type: 'dialog', speaker, text: { en: text }, ...(phrase ? { phrase } : {}), ...opt,
});

/** correct option */
export const ok = (text: string, feedback: string, effects?: Effects, prop?: string): ChoiceOption => ({
  text: { en: text }, correct: true, feedback: { en: feedback }, ...(effects ? { effects } : {}), ...(prop ? { prop } : {}),
});

/** wrong option */
export const no = (text: string, feedback: string, effects?: Effects, prop?: string): ChoiceOption => ({
  text: { en: text }, correct: false, feedback: { en: feedback }, ...(effects ? { effects } : {}), ...(prop ? { prop } : {}),
});

export const ask = (topic: TopicId, prompt: string, options: ChoiceOption[], cardId?: string, opt: Opt = {}): Step => ({
  type: 'choice', topic, prompt: { en: prompt }, options, ...(cardId ? { cardId } : {}), ...opt,
});

export const learn = (cardId: string, opt: Opt = {}): Step => ({ type: 'card', cardId, ...opt });

export const event = (
  kind: 'weather' | 'health' | 'money' | 'surprise' | 'law',
  title: string, text: string, effects?: Effects, prop?: string, opt: Opt = {},
): Step => ({ type: 'event', kind, title: { en: title }, text: { en: text }, ...(effects ? { effects } : {}), ...(prop ? { prop } : {}), ...opt });

export const P = (hangul: string, roman: string, meaning: string): Phrase => ({ hangul, roman, meaning });

/** hands-on simulation step */
export const simulate = (
  sim: import('./types').SimKind,
  topic: TopicId,
  title: string,
  intro: string,
  config?: import('./types').SimConfig,
  cardId?: string,
  opt: Opt = {},
): Step => ({ type: 'sim', sim, topic, title: { en: title }, intro: { en: intro }, ...(config ? { config } : {}), ...(cardId ? { cardId } : {}), ...opt });
