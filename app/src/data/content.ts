import { SEED_BUNDLE, type ContentBundle, type Course, type Scene } from '@kotoventure/shared';
import { supabase } from './supabase';
import { getJSON, setJSON } from './storage';

const CACHE_KEY = 'kv.content.v1';

/* DB row → domain mappers (snake_case → camelCase) */
const toCourse = (r: any, scenes: any[]): Course => ({
  id: r.id,
  categoryId: r.category_id,
  area: r.area ?? undefined,
  title: r.title,
  subtitle: r.subtitle,
  description: r.description,
  region: r.region,
  entry: r.entry,
  exit: r.exit,
  nights: r.nights,
  days: r.days,
  difficulty: r.difficulty,
  partyFit: r.party_fit,
  partyTips: r.party_tips ?? {},
  startBudget: r.start_budget,
  coverBg: r.cover_bg,
  access: r.access,
  productId: r.product_id ?? undefined,
  isPublished: r.is_published,
  version: r.version,
  sortOrder: r.sort_order,
  scenes: scenes
    .filter((s) => s.course_id === r.id)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((s): Scene => ({ id: s.id, day: s.day, title: s.title, location: s.location, bg: s.bg, steps: s.steps })),
});

async function fetchRemote(): Promise<ContentBundle> {
  const db = supabase!;
  const [cats, cards, courses, scenes, products, config, spots] = await Promise.all([
    db.from('categories').select('*').order('sort_order'),
    db.from('cards').select('*'),
    db.from('courses').select('*').order('sort_order'),
    db.from('scenes').select('*'),
    db.from('products').select('*'),
    db.from('app_config').select('*').eq('key', 'main').maybeSingle(),
    db.from('spots').select('data').eq('status', 'published'),
  ]);
  const err = cats.error || cards.error || courses.error || scenes.error || products.error;
  if (err) throw err;
  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    categories: cats.data!.map((c: any) => ({ id: c.id, name: c.name, icon: c.icon, color: c.color, sortOrder: c.sort_order, isActive: c.is_active })),
    cards: cards.data!.map((c: any) => ({ id: c.id, topic: c.topic, title: c.title, body: c.body, prop: c.prop ?? undefined, phrase: c.phrase ?? undefined, tips: c.tips ?? [] })),
    courses: courses.data!.map((r: any) => toCourse(r, scenes.data!)),
    products: products.data!.map((p: any) => ({
      id: p.id,
      type: p.type,
      title: p.title,
      priceUsd: Number(p.price_usd),
      iosProductId: p.ios_product_id,
      androidProductId: p.android_product_id,
      courseIds: p.course_ids,
      isActive: p.is_active,
    })),
    config: config.data?.value ?? SEED_BUNDLE.config,
    // older databases have no spots table yet → keep the bundled picks
    spots: spots.error ? undefined : (spots.data ?? []).map((r: any) => r.data),
  };
}

/**
 * The app ships with the latest missions (SEED_BUNDLE). A cached or server copy may be older
 * (e.g. the test DB was seeded before an app update) – then the bundled course wins, so a
 * new APK always shows its new missions. Courses/cards that only exist remotely are kept.
 */
export function mergeWithBundled(remote: ContentBundle): ContentBundle {
  const courses = remote.courses.map((c) => {
    const local = SEED_BUNDLE.courses.find((x) => x.id === c.id);
    return local && local.version > c.version ? local : c;
  });
  for (const local of SEED_BUNDLE.courses) if (!courses.some((c) => c.id === local.id)) courses.push(local);
  const cards = [...remote.cards];
  for (const card of SEED_BUNDLE.cards) if (!cards.some((c) => c.id === card.id)) cards.push(card);
  const spots = remote.spots && remote.spots.length ? remote.spots : SEED_BUNDLE.spots;
  return { ...remote, courses: courses.sort((a, b) => a.sortOrder - b.sortOrder), cards, spots };
}

/**
 * Returns content immediately from cache/seed, then (if Supabase is configured and online)
 * compares the server stamp and refreshes. `onUpdate` is called when newer content arrives.
 */
export async function loadContent(onUpdate: (b: ContentBundle) => void): Promise<ContentBundle> {
  const cached = await getJSON<{ stamp: string; bundle: ContentBundle }>(CACHE_KEY);
  const initial = cached?.bundle ? mergeWithBundled(cached.bundle) : SEED_BUNDLE;

  if (supabase) {
    (async () => {
      try {
        const { data: stamp } = await supabase.rpc('content_stamp');
        if (!stamp || stamp === cached?.stamp) return;
        const fresh = await fetchRemote();
        if (fresh.courses.length === 0) return; // empty DB → keep seed
        await setJSON(CACHE_KEY, { stamp, bundle: fresh });
        onUpdate(mergeWithBundled(fresh));
      } catch (e) {
        console.warn('[content] offline, using cached/seed content', e);
      }
    })();
  }
  return initial;
}
