-- Хранилище прогресса по коду участника.
-- Запускается один раз: Supabase → SQL Editor → вставить весь файл → Run.
--
-- В таблице только код и прогресс (уровни, даты, очки) — никаких имён и других личных данных.
-- Напрямую таблица закрыта для всех: сайт работает только через три функции ниже,
-- и каждая видит ровно одну запись — ту, чей код ей передали.

create table if not exists public.progress (
  code text primary key check (code ~ '^[A-Z2-9]{8}$'),
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.progress enable row level security;
revoke all on public.progress from anon, authenticated;

create or replace function public.save_progress(p_code text, p_data jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_code !~ '^[A-Z2-9]{8}$' then
    raise exception 'invalid code';
  end if;
  if jsonb_typeof(p_data) <> 'object' or pg_column_size(p_data) > 200000 then
    raise exception 'invalid data';
  end if;
  insert into progress (code, data, updated_at)
  values (p_code, p_data, now())
  on conflict (code) do update set data = excluded.data, updated_at = now();
end;
$$;

create or replace function public.load_progress(p_code text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select data from progress where code = p_code;
$$;

create or replace function public.delete_progress(p_code text)
returns void
language sql
security definer
set search_path = public
as $$
  delete from progress where code = p_code;
$$;

revoke all on function public.save_progress(text, jsonb) from public;
revoke all on function public.load_progress(text) from public;
revoke all on function public.delete_progress(text) from public;

grant execute on function public.save_progress(text, jsonb) to anon;
grant execute on function public.load_progress(text) to anon;
grant execute on function public.delete_progress(text) to anon;
