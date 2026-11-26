-- Hidden-gem trekking courses. The whole trek (incl. small uploaded photos as data URLs) is stored as JSON.
create table if not exists public.treks (
  id          text primary key,
  status      text not null default 'draft' check (status in ('draft','published','paused')),
  area        text,
  data        jsonb not null,
  updated_at  timestamptz not null default now()
);

create trigger touch_treks before update on public.treks for each row execute function public.touch_updated_at();

alter table public.treks enable row level security;
create policy "read published treks" on public.treks for select using (status = 'published' or public.is_admin());
create policy "admin treks" on public.treks for all using (public.is_admin()) with check (public.is_admin());

create or replace function public.content_stamp() returns timestamptz
language sql stable security definer set search_path = public as $$
  select greatest(
    (select max(updated_at) from categories), (select max(updated_at) from cards),
    (select max(updated_at) from courses),    (select max(updated_at) from products),
    (select max(updated_at) from app_config), (select max(updated_at) from spots),
    (select max(updated_at) from treks)
  );
$$;
