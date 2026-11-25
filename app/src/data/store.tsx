import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  SEED_BUNDLE,
  buildTrip,
  type TripSpec,
  type ContentBundle,
  type Course,
  type CourseProgress,
  type PartyType,
  type Product,
  withRouteSpots,
  type RouteSpot,
} from '@kotoventure/shared';
import { loadContent } from './content';
import { LangContext } from '../ui/Text';
import { buyProduct } from './purchases';
import { dropKey, getJSON, setJSON } from './storage';
import { supabase } from './supabase';

export interface Profile {
  id: string;
  nickname: string;
  country: string;
  party: PartyType;
  avatar: string;
  /** ja/zh/es are translated at runtime from English (shared/src/i18n) */
  lang: 'en' | 'ko' | 'ja' | 'zh' | 'es';
  /** month of the planned trip (1–12): seasonal knowledge cards and weather follow it */
  month?: number;
  /** guide = instant feedback; real = results revealed in a nightly summary */
  mode?: 'guide' | 'real';
}

interface State {
  ready: boolean;
  content: ContentBundle;
  profile: Profile | null;
  progress: Record<string, CourseProgress>;
  entitlements: string[];
  /** trips the player planned themselves (built into playable courses) */
  trips: TripSpec[];
  /** spots the player saved ("want to go") */
  savedSpots: string[];
  /** Kachi's picks the player added to a mission route: courseId → picks */
  routeSpots: Record<string, RouteSpot[]>;
}

interface Api extends State {
  toggleSpot(id: string): void;
  /** add a pick to a mission on a day (day 0 removes it) */
  setRouteSpot(courseId: string, spotId: string, day: number): void;
  saveTrip(t: TripSpec): void;
  deleteTrip(id: string): void;
  signUp(p: Omit<Profile, 'id' | 'lang'> & { lang?: Profile['lang'] }): Promise<void>;
  updateProfile(patch: Partial<Profile>): void;
  saveProgress(p: CourseProgress): void;
  resetProgress(courseId?: string): void;
  isUnlocked(c: Course): boolean;
  productFor(c: Course): Product | undefined;
  purchase(p: Product): Promise<boolean>;
  collectedCards: Set<string>;
  signOut(): Promise<void>;
}

const K = { profile: 'kv.profile', progress: 'kv.progress', ent: 'kv.entitlements', trips: 'kv.trips', spots: 'kv.savedSpots', route: 'kv.routeSpots' };
const Ctx = createContext<Api | null>(null);

const localId = () => 'local-' + Math.random().toString(36).slice(2, 10);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [s, setS] = useState<State>({ ready: false, content: SEED_BUNDLE, profile: null, progress: {}, entitlements: ['app_base'], trips: [], savedSpots: [], routeSpots: {} });

  /* boot: cached content + local profile, then remote sync */
  useEffect(() => {
    (async () => {
      const content = await loadContent((fresh) => setS((x) => ({ ...x, content: fresh })));
      const profile = await getJSON<Profile>(K.profile);
      const progress = (await getJSON<Record<string, CourseProgress>>(K.progress)) ?? {};
      const ent = (await getJSON<string[]>(K.ent)) ?? ['app_base'];
      const trips = (await getJSON<TripSpec[]>(K.trips)) ?? [];
      const savedSpots = (await getJSON<string[]>(K.spots)) ?? [];
      const routeSpots = (await getJSON<Record<string, RouteSpot[]>>(K.route)) ?? {};
      setS({ ready: true, content, profile, progress, entitlements: ent, trips, savedSpots, routeSpots });

      if (supabase && profile) {
        const { data } = await supabase.auth.getSession();
        if (!data.session) return;
        const [ents, prog] = await Promise.all([
          supabase.from('entitlements').select('product_id'),
          supabase.from('progress').select('*'),
        ]);
        setS((x) => {
          const merged = { ...x.progress };
          for (const r of prog.data ?? []) {
            const local = merged[r.course_id];
            // keep whichever copy went further (other device / reinstall)
            const remoteAhead = (r.best_score ?? 0) > (local?.bestScore ?? 0) || (!!r.completed_at && !local?.completedAt);
            if (!local || remoteAhead) {
              merged[r.course_id] = {
                courseId: r.course_id,
                courseVersion: r.course_version,
                sceneIndex: r.scene_index,
                stepIndex: r.step_index,
                stats: r.stats,
                cards: r.cards,
                phrases: r.phrases,
                completedAt: r.completed_at ?? undefined,
                bestScore: r.best_score ?? undefined,
                plays: r.plays,
              };
            }
          }
          const remoteEnt = (ents.data ?? []).map((e: any) => e.product_id);
          return { ...x, progress: merged, entitlements: Array.from(new Set([...x.entitlements, ...remoteEnt])) };
        });
        supabase.from('profiles').update({ last_seen_at: new Date().toISOString() }).eq('id', profile.id).then(() => {});
      }
    })();
  }, []);

  const signUp = useCallback(async ({ lang = 'en', ...p }: Omit<Profile, 'id' | 'lang'> & { lang?: Profile['lang'] }) => {
    let id = localId();
    if (supabase) {
      // Simplest possible signup: anonymous account + nickname/country/party as metadata.
      const { data, error } = await supabase.auth.signInAnonymously({
        options: { data: { nickname: p.nickname, country: p.country, party_type: p.party, avatar: p.avatar } },
      });
      if (!error && data.user) id = data.user.id;
      else console.warn('[auth] anonymous sign-in failed, continuing offline', error);
    }
    const profile: Profile = { ...p, id, lang };
    await setJSON(K.profile, profile);
    setS((x) => ({ ...x, profile }));
  }, []);

  const updateProfile = useCallback((patch: Partial<Profile>) => {
    setS((x) => {
      if (!x.profile) return x;
      const profile = { ...x.profile, ...patch };
      setJSON(K.profile, profile);
      if (supabase && !profile.id.startsWith('local-')) {
        supabase
          .from('profiles')
          .update({ nickname: profile.nickname, country: profile.country, party_type: profile.party, avatar: profile.avatar })
          .eq('id', profile.id)
          .then(() => {});
      }
      return { ...x, profile };
    });
  }, []);

  const saveProgress = useCallback((p: CourseProgress) => {
    setS((x) => {
      const progress = { ...x.progress, [p.courseId]: p };
      setJSON(K.progress, progress);
      if (supabase && x.profile && !x.profile.id.startsWith('local-') && !p.courseId.startsWith('my-')) {
        supabase
          .from('progress')
          .upsert({
            user_id: x.profile.id,
            course_id: p.courseId,
            course_version: p.courseVersion,
            scene_index: p.sceneIndex,
            step_index: p.stepIndex,
            stats: p.stats,
            cards: p.cards,
            phrases: p.phrases,
            best_score: p.bestScore ?? null,
            plays: p.plays,
            completed_at: p.completedAt ?? null,
          })
          .then(({ error }) => error && console.warn('[progress] sync failed', error.message));
      }
      return { ...x, progress };
    });
  }, []);

  const resetProgress = useCallback((courseId?: string) => {
    setS((x) => {
      const progress = courseId ? Object.fromEntries(Object.entries(x.progress).filter(([k]) => k !== courseId)) : {};
      setJSON(K.progress, progress);
      return { ...x, progress };
    });
  }, []);

  const productFor = useCallback((c: Course) => s.content.products.find((p) => p.id === c.productId), [s.content.products]);

  const isUnlocked = useCallback(
    (c: Course) => c.access === 'base' || (!!c.productId && s.entitlements.includes(c.productId)),
    [s.entitlements],
  );

  const purchase = useCallback(async (p: Product) => {
    const ok = await buyProduct(p);
    if (ok) {
      setS((x) => {
        const entitlements = Array.from(new Set([...x.entitlements, p.id]));
        setJSON(K.ent, entitlements);
        return { ...x, entitlements };
      });
    }
    return ok;
  }, []);

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    await Promise.all([dropKey(K.profile), dropKey(K.progress), dropKey(K.ent), dropKey(K.trips)]);
    setS((x) => ({ ...x, profile: null, progress: {}, entitlements: ['app_base'], trips: [] }));
  }, []);

  const saveTrip = useCallback((t: TripSpec) => {
    setS((x) => {
      const trips = [t, ...x.trips.filter((y) => y.id !== t.id)];
      setJSON(K.trips, trips);
      return { ...x, trips };
    });
  }, []);
  const deleteTrip = useCallback((id: string) => {
    setS((x) => {
      const trips = x.trips.filter((y) => y.id !== id);
      setJSON(K.trips, trips);
      const progress = Object.fromEntries(Object.entries(x.progress).filter(([k]) => k !== id));
      setJSON(K.progress, progress);
      return { ...x, trips, progress };
    });
  }, []);

  // the player's own trips are built into courses and listed with the others
  const tripCourses = useMemo(() => s.trips.map((t, i) => buildTrip(t, 1000 + i)).filter((c): c is Course => !!c), [s.trips]);
  const content = useMemo(() => {
    const all = tripCourses.length ? [...s.content.courses, ...tripCourses] : s.content.courses;
    // picks the player added to a route become extra scenes of that mission
    const courses = all.map((c) => (s.routeSpots[c.id]?.length ? withRouteSpots(c, s.routeSpots[c.id], s.content.spots) : c));
    return { ...s.content, courses };
  }, [s.content, tripCourses, s.routeSpots]);

  const toggleSpot = useCallback((id: string) => {
    setS((x) => {
      const savedSpots = x.savedSpots.includes(id) ? x.savedSpots.filter((y) => y !== id) : [...x.savedSpots, id];
      setJSON(K.spots, savedSpots);
      return { ...x, savedSpots };
    });
  }, []);

  const setRouteSpot = useCallback((courseId: string, spotId: string, day: number) => {
    setS((x) => {
      const cur = (x.routeSpots[courseId] ?? []).filter((r) => r.spotId !== spotId);
      const next = day > 0 ? [...cur, { spotId, day }] : cur;
      const routeSpots = { ...x.routeSpots, [courseId]: next };
      setJSON(K.route, routeSpots);
      return { ...x, routeSpots };
    });
  }, []);

  const collectedCards = useMemo(() => new Set(Object.values(s.progress).flatMap((p) => p.cards)), [s.progress]);

  const api: Api = { ...s, content, toggleSpot, setRouteSpot, saveTrip, deleteTrip, signUp, updateProfile, saveProgress, resetProgress, isUnlocked, productFor, purchase, collectedCards, signOut };
  return (
    <Ctx.Provider value={api}>
      <LangContext.Provider value={s.profile?.lang ?? 'en'}>{children}</LangContext.Provider>
    </Ctx.Provider>
  );
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStore outside StoreProvider');
  return v;
}
