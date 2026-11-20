import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import {
  SEED_BUNDLE,
  type AppConfig,
  type Category,
  type ContentBundle,
  type Course,
  type KnowledgeCard,
  type Product,
} from '@kotoventure/shared';

export interface MemberProgress {
  course_id: string;
  scene_index: number;
  best_score: number | null;
  plays: number;
  completed_at: string | null;
}

export interface Member {
  id: string;
  nickname: string;
  country: string | null;
  party_type: string | null;
  avatar: string | null;
  role: 'user' | 'admin';
  is_banned: boolean;
  memo: string | null;
  created_at: string;
  last_seen_at: string | null;
  entitlements: { product_id: string; source: string }[];
  progress: MemberProgress[];
}

export type CourseStats = Record<string, { players: number; completions: number; avg: number | null }>;

/** Data access for the admin. Two implementations: Supabase (real DB) and Demo (browser localStorage). */
export interface Repo {
  mode: 'supabase' | 'demo';
  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
  session(): Promise<{ email: string } | null>;
  loadContent(): Promise<ContentBundle>;
  saveCategory(c: Category): Promise<void>;
  deleteCategory(id: string): Promise<void>;
  saveCard(c: KnowledgeCard): Promise<void>;
  deleteCard(id: string): Promise<void>;
  saveProduct(p: Product): Promise<void>;
  deleteProduct(id: string): Promise<void>;
  saveCourse(c: Course, previousId?: string): Promise<void>;
  deleteCourse(id: string): Promise<void>;
  saveConfig(cfg: AppConfig): Promise<void>;
  listMembers(): Promise<Member[]>;
  updateMember(id: string, patch: { role: string; is_banned: boolean; memo: string | null }): Promise<void>;
  deleteMember(id: string): Promise<void>;
  grant(userId: string, productId: string): Promise<void>;
  revoke(userId: string, productId: string): Promise<void>;
  resetProgress(userId: string, courseId: string): Promise<void>;
  courseStats(): Promise<CourseStats>;
}

const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));

/* ───────────────────────────── Supabase ───────────────────────────── */
class SupabaseRepo implements Repo {
  mode = 'supabase' as const;
  constructor(private db: SupabaseClient) {}

  private ok<T>(r: { error: any; data?: any }): T {
    if (r.error) throw new Error(r.error.message);
    return r.data as T;
  }

  async signIn(email: string, password: string) {
    this.ok(await this.db.auth.signInWithPassword({ email, password }));
    const { data } = await this.db.rpc('is_admin');
    if (!data) {
      await this.db.auth.signOut();
      throw new Error('관리자 권한이 없는 계정입니다 (profiles.role = admin 필요).');
    }
  }
  async signOut() {
    await this.db.auth.signOut();
  }
  async session() {
    const { data } = await this.db.auth.getSession();
    return data.session ? { email: data.session.user.email ?? '' } : null;
  }

  async loadContent(): Promise<ContentBundle> {
    const [cats, cards, courses, scenes, products, config] = await Promise.all([
      this.db.from('categories').select('*').order('sort_order'),
      this.db.from('cards').select('*').order('id'),
      this.db.from('courses').select('*').order('sort_order'),
      this.db.from('scenes').select('*').order('sort_order'),
      this.db.from('products').select('*').order('id'),
      this.db.from('app_config').select('*').eq('key', 'main').maybeSingle(),
    ]);
    const sc = this.ok<any[]>(scenes);
    return {
      version: 1,
      generatedAt: new Date().toISOString(),
      categories: this.ok<any[]>(cats).map((c) => ({ id: c.id, name: c.name, icon: c.icon, color: c.color, sortOrder: c.sort_order, isActive: c.is_active })),
      cards: this.ok<any[]>(cards).map((c) => ({ id: c.id, topic: c.topic, title: c.title, body: c.body, prop: c.prop ?? undefined, phrase: c.phrase ?? undefined, tips: c.tips ?? [] })),
      products: this.ok<any[]>(products).map((p) => ({
        id: p.id, type: p.type, title: p.title, priceUsd: Number(p.price_usd), iosProductId: p.ios_product_id ?? '', androidProductId: p.android_product_id ?? '', courseIds: p.course_ids ?? [], isActive: p.is_active,
      })),
      courses: this.ok<any[]>(courses).map((r) => ({
        id: r.id, categoryId: r.category_id, area: r.area ?? undefined, title: r.title, subtitle: r.subtitle, description: r.description, region: r.region,
        entry: r.entry, exit: r.exit, nights: r.nights, days: r.days, difficulty: r.difficulty, partyFit: r.party_fit, partyTips: r.party_tips ?? {},
        startBudget: r.start_budget, coverBg: r.cover_bg, access: r.access, productId: r.product_id ?? undefined, isPublished: r.is_published,
        version: r.version, sortOrder: r.sort_order,
        scenes: sc.filter((s) => s.course_id === r.id).map((s) => ({ id: s.id, day: s.day, title: s.title, location: s.location, bg: s.bg, steps: s.steps })),
      })),
      config: (config.data?.value as AppConfig) ?? SEED_BUNDLE.config,
    };
  }

  async saveCategory(c: Category) {
    this.ok(await this.db.from('categories').upsert({ id: c.id, name: c.name, icon: c.icon, color: c.color, sort_order: c.sortOrder, is_active: c.isActive }));
  }
  async deleteCategory(id: string) {
    this.ok(await this.db.from('categories').delete().eq('id', id));
  }
  async saveCard(c: KnowledgeCard) {
    this.ok(await this.db.from('cards').upsert({ id: c.id, topic: c.topic, title: c.title, body: c.body, prop: c.prop ?? null, phrase: c.phrase ?? null, tips: c.tips ?? [] }));
  }
  async deleteCard(id: string) {
    this.ok(await this.db.from('cards').delete().eq('id', id));
  }
  async saveProduct(p: Product) {
    this.ok(
      await this.db.from('products').upsert({
        id: p.id, type: p.type, title: p.title, price_usd: p.priceUsd, ios_product_id: p.iosProductId, android_product_id: p.androidProductId, course_ids: p.courseIds, is_active: p.isActive,
      }),
    );
  }
  async deleteProduct(id: string) {
    this.ok(await this.db.from('products').delete().eq('id', id));
  }
  async saveCourse(c: Course, previousId?: string) {
    if (previousId && previousId !== c.id) this.ok(await this.db.from('courses').update({ id: c.id }).eq('id', previousId));
    this.ok(
      await this.db.from('courses').upsert({
        id: c.id, category_id: c.categoryId, area: c.area ?? null, title: c.title, subtitle: c.subtitle, description: c.description, region: c.region,
        entry: c.entry, exit: c.exit, nights: c.nights, days: c.days, difficulty: c.difficulty, party_fit: c.partyFit, party_tips: c.partyTips,
        start_budget: c.startBudget, cover_bg: c.coverBg, access: c.access, product_id: c.productId || null, is_published: c.isPublished,
        version: c.version, sort_order: c.sortOrder,
      }),
    );
    const ids = c.scenes.map((s) => s.id);
    const existing = this.ok<any[]>(await this.db.from('scenes').select('id').eq('course_id', c.id));
    const stale = existing.map((e) => e.id).filter((id) => !ids.includes(id));
    if (stale.length) this.ok(await this.db.from('scenes').delete().eq('course_id', c.id).in('id', stale));
    if (c.scenes.length)
      this.ok(
        await this.db.from('scenes').upsert(
          c.scenes.map((s, i) => ({ id: s.id, course_id: c.id, sort_order: i, day: s.day, title: s.title, location: s.location, bg: s.bg, steps: s.steps })),
        ),
      );
  }
  async deleteCourse(id: string) {
    this.ok(await this.db.from('courses').delete().eq('id', id));
  }
  async saveConfig(cfg: AppConfig) {
    this.ok(await this.db.from('app_config').upsert({ key: 'main', value: cfg }));
  }
  async listMembers(): Promise<Member[]> {
    const [profiles, ents, prog] = await Promise.all([
      this.db.from('profiles').select('*').order('created_at', { ascending: false }).limit(1000),
      this.db.from('entitlements').select('user_id, product_id, source'),
      this.db.from('progress').select('user_id, course_id, scene_index, best_score, plays, completed_at'),
    ]);
    const e = this.ok<any[]>(ents);
    const p = this.ok<any[]>(prog);
    return this.ok<any[]>(profiles).map((m) => ({
      ...m,
      entitlements: e.filter((x) => x.user_id === m.id),
      progress: p.filter((x) => x.user_id === m.id),
    }));
  }
  async updateMember(id: string, patch: { role: string; is_banned: boolean; memo: string | null }) {
    this.ok(await this.db.rpc('admin_update_member', { p_id: id, p_role: patch.role, p_banned: patch.is_banned, p_memo: patch.memo }));
  }
  async deleteMember(id: string) {
    this.ok(await this.db.from('profiles').delete().eq('id', id));
  }
  async grant(userId: string, productId: string) {
    this.ok(await this.db.from('entitlements').upsert({ user_id: userId, product_id: productId, source: 'admin' }, { onConflict: 'user_id,product_id' }));
  }
  async revoke(userId: string, productId: string) {
    this.ok(await this.db.from('entitlements').delete().eq('user_id', userId).eq('product_id', productId));
  }
  async resetProgress(userId: string, courseId: string) {
    this.ok(await this.db.from('progress').delete().eq('user_id', userId).eq('course_id', courseId));
  }
  async courseStats(): Promise<CourseStats> {
    const rows = this.ok<any[]>(await this.db.from('admin_course_stats').select('*'));
    return Object.fromEntries(rows.map((r) => [r.course_id, { players: r.players, completions: r.completions, avg: r.avg_best_score }]));
  }
}

/* ───────────────────────────── Demo (localStorage) ───────────────────────────── */
const LS = { bundle: 'kv.admin.bundle', members: 'kv.admin.members', session: 'kv.admin.session' };

const demoMembers = (): Member[] => {
  const now = Date.now();
  const mk = (i: number, nickname: string, country: string, party: string, extra: Partial<Member> = {}): Member => ({
    id: `0000000${i}-demo-4000-8000-00000000000${i}`,
    nickname,
    country,
    party_type: party,
    avatar: ['alex', 'mina', 'kofi', 'lena', 'raj', 'yui'][i % 6],
    role: 'user',
    is_banned: false,
    memo: null,
    created_at: new Date(now - i * 86400000 * 3).toISOString(),
    last_seen_at: new Date(now - i * 3600000 * 5).toISOString(),
    entitlements: [{ product_id: 'app_base', source: 'store' }],
    progress: [],
    ...extra,
  });
  return [
    mk(1, 'Admin', 'KR', 'solo', { role: 'admin', memo: 'demo admin' }),
    mk(2, 'Aussie Kim', 'AU', 'couple', { progress: [{ course_id: 'seoul-classic', scene_index: 12, best_score: 812, plays: 2, completed_at: new Date(now - 86400000).toISOString() }] }),
    mk(3, 'Yuki', 'JP', 'friends', { progress: [{ course_id: 'busan-food', scene_index: 4, best_score: null, plays: 1, completed_at: null }] }),
    mk(4, 'Carlos', 'BR', 'group'),
    mk(5, 'Mei', 'TW', 'solo', { entitlements: [{ product_id: 'app_base', source: 'test' }], progress: [{ course_id: 'jeju-adventure', scene_index: 8, best_score: 905, plays: 1, completed_at: new Date(now - 7200000).toISOString() }] }),
    mk(6, 'Spammer', 'OT', 'solo', { is_banned: true, memo: '부적절한 닉네임' }),
  ];
};

class DemoRepo implements Repo {
  mode = 'demo' as const;
  private get<T>(k: string, fallback: () => T): T {
    try {
      const v = localStorage.getItem(k);
      if (v) return JSON.parse(v) as T;
    } catch {
      /* ignore */
    }
    const f = fallback();
    this.set(k, f);
    return f;
  }
  private set(k: string, v: unknown) {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch {
      /* ignore */
    }
  }
  private bundle() {
    return this.get<ContentBundle>(LS.bundle, () => clone(SEED_BUNDLE));
  }
  private mutate(fn: (b: ContentBundle) => void) {
    const b = this.bundle();
    fn(b);
    this.set(LS.bundle, b);
  }
  private members() {
    return this.get<Member[]>(LS.members, demoMembers);
  }
  private mutMembers(fn: (m: Member[]) => Member[]) {
    this.set(LS.members, fn(this.members()));
  }
  private upsertBy<T extends { id: string }>(list: T[], item: T) {
    const i = list.findIndex((x) => x.id === item.id);
    if (i >= 0) list[i] = item;
    else list.push(item);
  }

  async signIn(email: string) {
    this.set(LS.session, { email: email || 'admin@example.com' });
  }
  async signOut() {
    this.set(LS.session, null);
  }
  async session() {
    return this.get<{ email: string } | null>(LS.session, () => null);
  }
  async loadContent() {
    return this.bundle();
  }
  async saveCategory(c: Category) {
    this.mutate((b) => this.upsertBy(b.categories, c));
  }
  async deleteCategory(id: string) {
    this.mutate((b) => {
      if (b.courses.some((c) => c.categoryId === id)) throw new Error('이 카테고리를 사용하는 코스가 있습니다.');
      b.categories = b.categories.filter((c) => c.id !== id);
    });
  }
  async saveCard(c: KnowledgeCard) {
    this.mutate((b) => this.upsertBy(b.cards, c));
  }
  async deleteCard(id: string) {
    this.mutate((b) => (b.cards = b.cards.filter((c) => c.id !== id)));
  }
  async saveProduct(p: Product) {
    this.mutate((b) => this.upsertBy(b.products, p));
  }
  async deleteProduct(id: string) {
    this.mutate((b) => (b.products = b.products.filter((c) => c.id !== id)));
  }
  async saveCourse(c: Course, previousId?: string) {
    this.mutate((b) => {
      if (previousId && previousId !== c.id) b.courses = b.courses.filter((x) => x.id !== previousId);
      this.upsertBy(b.courses, c);
    });
  }
  async deleteCourse(id: string) {
    this.mutate((b) => (b.courses = b.courses.filter((c) => c.id !== id)));
  }
  async saveConfig(cfg: AppConfig) {
    this.mutate((b) => (b.config = cfg));
  }
  async listMembers() {
    return this.members();
  }
  async updateMember(id: string, patch: { role: string; is_banned: boolean; memo: string | null }) {
    this.mutMembers((ms) => ms.map((m) => (m.id === id ? { ...m, ...patch, role: patch.role as Member['role'] } : m)));
  }
  async deleteMember(id: string) {
    this.mutMembers((ms) => ms.filter((m) => m.id !== id));
  }
  async grant(userId: string, productId: string) {
    this.mutMembers((ms) =>
      ms.map((m) => (m.id === userId && !m.entitlements.some((e) => e.product_id === productId) ? { ...m, entitlements: [...m.entitlements, { product_id: productId, source: 'admin' }] } : m)),
    );
  }
  async revoke(userId: string, productId: string) {
    this.mutMembers((ms) => ms.map((m) => (m.id === userId ? { ...m, entitlements: m.entitlements.filter((e) => e.product_id !== productId) } : m)));
  }
  async resetProgress(userId: string, courseId: string) {
    this.mutMembers((ms) => ms.map((m) => (m.id === userId ? { ...m, progress: m.progress.filter((p) => p.course_id !== courseId) } : m)));
  }
  async courseStats() {
    const out: CourseStats = {};
    for (const m of this.members())
      for (const p of m.progress) {
        const s = (out[p.course_id] ??= { players: 0, completions: 0, avg: null });
        s.players++;
        if (p.completed_at) s.completions++;
        if (p.best_score) s.avg = s.avg ? Math.round((s.avg + p.best_score) / 2) : p.best_score;
      }
    return out;
  }
  /** demo only: wipe local changes */
  resetDemo() {
    localStorage.removeItem(LS.bundle);
    localStorage.removeItem(LS.members);
  }
}

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const repo: Repo = url && key ? new SupabaseRepo(createClient(url, key)) : new DemoRepo();
export const demoRepo = repo instanceof DemoRepo ? repo : null;
