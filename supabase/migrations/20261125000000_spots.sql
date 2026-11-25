-- Recommended spots (editorial picks now, partner listings later). The whole spot is stored as JSON;
-- status/area are columns for filtering and access rules.
create table if not exists public.spots (
  id          text primary key,
  status      text not null default 'draft' check (status in ('draft','published','paused')),
  area        text,
  sponsored   boolean not null default false,
  data        jsonb not null,
  updated_at  timestamptz not null default now()
);
create index if not exists spots_status_idx on public.spots (status);

create trigger touch_spots before update on public.spots for each row execute function public.touch_updated_at();

alter table public.spots enable row level security;
create policy "read published spots" on public.spots for select using (status = 'published' or public.is_admin());
create policy "admin spots" on public.spots for all using (public.is_admin()) with check (public.is_admin());

-- the app re-downloads content when anything (including spots) changed
create or replace function public.content_stamp() returns timestamptz
language sql stable security definer set search_path = public as $$
  select greatest(
    (select max(updated_at) from categories), (select max(updated_at) from cards),
    (select max(updated_at) from courses),    (select max(updated_at) from products),
    (select max(updated_at) from app_config), (select max(updated_at) from spots)
  );
$$;
