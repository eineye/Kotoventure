-- Province-level area for grouping missions (seoul, gyeonggi, incheon, chungcheong, gangwon, jeolla, gyeongsang, jeju)
alter table public.courses add column if not exists area text;
create index if not exists courses_area_idx on public.courses (area);
