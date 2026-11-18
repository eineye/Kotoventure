-- ═══════════════════════════════════════════════════════════════════
-- Kotoventure – initial schema (Supabase / Postgres)
-- Content tables are readable by the app; only admins can write them.
-- ═══════════════════════════════════════════════════════════════════

-- ── Members ─────────────────────────────────────────────────────────
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  nickname      text not null default 'Traveller',
  country       text,
  party_type    text check (party_type in ('solo','couple','friends','group')),
  avatar        text,
  role          text not null default 'user' check (role in ('user','admin')),
  is_banned     boolean not null default false,
  memo          text,                      -- admin-only note
  created_at    timestamptz not null default now(),
  last_seen_at  timestamptz
);

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin' and not is_banned);
$$;

-- create a profile automatically for every new auth user (anonymous or email)
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, nickname, country, party_type, avatar)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nickname', 'Traveller'),
    new.raw_user_meta_data->>'country',
    new.raw_user_meta_data->>'party_type',
    new.raw_user_meta_data->>'avatar'
  )
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Content ─────────────────────────────────────────────────────────
create table public.categories (
  id          text primary key,
  name        jsonb not null,
  icon        text,
  color       text,
  sort_order  int not null default 0,
  is_active   boolean not null default true,
  updated_at  timestamptz not null default now()
);

create table public.cards (
  id          text primary key,
  topic       text not null check (topic in ('transport','lodging','food','money','etiquette','law','weather','medical')),
  title       jsonb not null,
  body        jsonb not null,
  prop        text,
  phrase      jsonb,
  tips        jsonb not null default '[]'::jsonb,
  updated_at  timestamptz not null default now()
);

create table public.products (
  id                  text primary key,
  type                text not null check (type in ('paid_app','course_pack')),
  title               jsonb not null,
  price_usd           numeric(6,2) not null default 0.99,
  ios_product_id      text,
  android_product_id  text,
  course_ids          text[] not null default '{}',
  is_active           boolean not null default true,
  updated_at          timestamptz not null default now()
);

create table public.courses (
  id            text primary key,
  category_id   text not null references public.categories(id) on update cascade,
  title         jsonb not null,
  subtitle      jsonb not null default '{"en":""}',
  description   jsonb not null default '{"en":""}',
  region        jsonb not null default '{"en":""}',
  entry         jsonb not null,           -- {kind:'airport'|'port', code, name}
  exit          jsonb not null,
  nights        int not null default 3,
  days          int not null default 4,
  difficulty    int not null default 1 check (difficulty between 1 and 3),
  party_fit     jsonb not null default '{"solo":3,"couple":3,"friends":3,"group":3}',
  party_tips    jsonb not null default '{}',
  start_budget  int not null default 500000,
  cover_bg      text,
  access        text not null default 'base' check (access in ('base','iap')),
  product_id    text references public.products(id) on delete set null,
  is_published  boolean not null default false,
  version       int not null default 1,
  sort_order    int not null default 0,
  updated_at    timestamptz not null default now(),
  constraint entry_is_gateway check (entry->>'kind' in ('airport','port'))
);

create table public.scenes (
  id          text not null,
  course_id   text not null references public.courses(id) on delete cascade on update cascade,
  sort_order  int not null default 0,
  day         int not null default 1,
  title       jsonb not null,
  location    jsonb not null default '{"en":""}',
  bg          text not null default 'street',
  steps       jsonb not null default '[]'::jsonb,
  updated_at  timestamptz not null default now(),
  primary key (course_id, id)
);

create table public.app_config (
  key         text primary key,
  value       jsonb not null,
  updated_at  timestamptz not null default now()
);

-- ── Purchases & progress ────────────────────────────────────────────
create table public.entitlements (
  id           bigint generated always as identity primary key,
  user_id      uuid not null references public.profiles(id) on delete cascade,
  product_id   text not null references public.products(id) on delete cascade,
  source       text not null default 'store' check (source in ('store','admin','promo','test')),
  store_tx_id  text,
  created_at   timestamptz not null default now(),
  unique (user_id, product_id)
);

create table public.progress (
  user_id         uuid not null references public.profiles(id) on delete cascade,
  course_id       text not null references public.courses(id) on delete cascade,
  course_version  int not null default 1,
  scene_index     int not null default 0,
  step_index      int not null default 0,
  stats           jsonb not null default '{}',
  cards           text[] not null default '{}',
  phrases         text[] not null default '{}',
  best_score      int,
  plays           int not null default 0,
  completed_at    timestamptz,
  updated_at      timestamptz not null default now(),
  primary key (user_id, course_id)
);

-- ── updated_at + version bump helpers ───────────────────────────────
create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

do $$ declare t text; begin
  foreach t in array array['categories','cards','products','courses','scenes','app_config','progress'] loop
    execute format('create trigger touch_%1$s before update on public.%1$s for each row execute function public.touch_updated_at()', t);
  end loop;
end $$;

-- Editing a scene touches its course so the app knows to re-download
create or replace function public.touch_course_from_scene() returns trigger language plpgsql as $$
begin
  update public.courses set updated_at = now() where id = coalesce(new.course_id, old.course_id);
  return coalesce(new, old);
end $$;
create trigger scenes_touch_course after insert or update or delete on public.scenes
  for each row execute function public.touch_course_from_scene();

-- One cheap call for the app: "has anything changed since my cache?"
create or replace function public.content_stamp() returns timestamptz
language sql stable security definer set search_path = public as $$
  select greatest(
    (select max(updated_at) from categories), (select max(updated_at) from cards),
    (select max(updated_at) from courses),    (select max(updated_at) from products),
    (select max(updated_at) from app_config)
  );
$$;

-- ── Row Level Security ──────────────────────────────────────────────
alter table public.profiles     enable row level security;
alter table public.categories   enable row level security;
alter table public.cards        enable row level security;
alter table public.products     enable row level security;
alter table public.courses      enable row level security;
alter table public.scenes       enable row level security;
alter table public.app_config   enable row level security;
alter table public.entitlements enable row level security;
alter table public.progress     enable row level security;

-- public content: everyone may read published content; admins do everything
create policy "read categories" on public.categories for select using (is_active or public.is_admin());
create policy "read cards"      on public.cards      for select using (true);
create policy "read products"   on public.products   for select using (is_active or public.is_admin());
create policy "read courses"    on public.courses    for select using (is_published or public.is_admin());
create policy "read scenes"     on public.scenes     for select using (
  public.is_admin() or exists (select 1 from public.courses c where c.id = course_id and c.is_published));
create policy "read config"     on public.app_config for select using (true);

create policy "admin categories" on public.categories for all using (public.is_admin()) with check (public.is_admin());
create policy "admin cards"      on public.cards      for all using (public.is_admin()) with check (public.is_admin());
create policy "admin products"   on public.products   for all using (public.is_admin()) with check (public.is_admin());
create policy "admin courses"    on public.courses    for all using (public.is_admin()) with check (public.is_admin());
create policy "admin scenes"     on public.scenes     for all using (public.is_admin()) with check (public.is_admin());
create policy "admin config"     on public.app_config for all using (public.is_admin()) with check (public.is_admin());

-- members
create policy "own profile read"   on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "own profile update" on public.profiles for update using (id = auth.uid() or public.is_admin());
create policy "admin profile del"  on public.profiles for delete using (public.is_admin());
-- players may only change harmless columns of their own row
revoke update on public.profiles from authenticated;
grant update (nickname, country, party_type, avatar, last_seen_at) on public.profiles to authenticated;
-- (admin writes from the admin web go through the same 'authenticated' role, so give admins the rest via a function)
create or replace function public.admin_update_member(p_id uuid, p_role text, p_banned boolean, p_memo text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'admin only'; end if;
  update public.profiles set role = p_role, is_banned = p_banned, memo = p_memo where id = p_id;
end $$;

create policy "own entitlements" on public.entitlements for select using (user_id = auth.uid() or public.is_admin());
create policy "admin entitlements" on public.entitlements for all using (public.is_admin()) with check (public.is_admin());

create policy "own progress" on public.progress for all
  using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid());

-- ── Admin dashboard stats ───────────────────────────────────────────
create or replace view public.admin_course_stats with (security_invoker = true) as
  select c.id as course_id,
         count(p.user_id)                                  as players,
         count(p.completed_at)                             as completions,
         round(avg(p.best_score) filter (where p.best_score is not null)) as avg_best_score
  from public.courses c left join public.progress p on p.course_id = c.id
  group by c.id;
