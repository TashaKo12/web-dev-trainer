-- Обновление: рейтинг по сезонам (зима, весна, лето, осень) — каждый сезон начинается с нуля.
-- Supabase → SQL Editor → New query → вставить весь файл → Run.
--
-- Сезон: зима — декабрь–февраль (декабрь 2026 относится к зиме 2027), весна — март–май,
-- лето — июнь–август, осень — сентябрь–ноябрь. Время — московское.

create or replace function public.season_key(ts timestamptz)
returns text
language sql
immutable
as $$
  select case
    when m = 12 then (y + 1) || '-winter'
    when m <= 2 then y || '-winter'
    when m <= 5 then y || '-spring'
    when m <= 8 then y || '-summer'
    else y || '-autumn'
  end
  from (
    select extract(month from ts at time zone 'Europe/Moscow')::int as m,
           extract(year from ts at time zone 'Europe/Moscow')::int as y
  ) d;
$$;

-- Очки за сезон: из сезонного счётчика, который ведут тренажёры.
-- Если счётчика ещё нет (аккаунт из старой версии), все очки идут в сезон последнего сохранения.
create or replace function public.progress_season_points(p jsonb, p_season text, p_updated timestamptz)
returns int
language plpgsql
immutable
as $$
declare
  v numeric;
begin
  if p ? 'wdt:points-season' then
    v := ((p ->> 'wdt:points-season')::jsonb ->> p_season)::numeric;
    return coalesce(v, 0)::int;
  end if;
  if season_key(p_updated) = p_season then
    return progress_points(p);
  end if;
  return 0;
exception when others then
  return 0;
end;
$$;

-- Уровни, решённые верно именно в этом сезоне (по дате ответа).
create or replace function public.progress_season_solved(p jsonb, p_season text)
returns int
language plpgsql
immutable
as $$
declare
  v int := 0;
begin
  select count(*) into v
  from jsonb_each_text(p) s
  cross join lateral jsonb_array_elements_text((s.value::jsonb) -> 'statuses') with ordinality as st(status, i)
  where s.key like 'wdt:session:%'
    and st.status = 'correct'
    and season_key((((s.value::jsonb) -> 'dates') ->> (st.i - 1)::int)::timestamptz) = p_season;
  return v;
exception when others then
  return 0;
end;
$$;

revoke all on function public.progress_season_points(jsonb, text, timestamptz) from public, anon, authenticated;
revoke all on function public.progress_season_solved(jsonb, text) from public, anon, authenticated;

-- Рейтинг: p_season — сезон вида '2026-autumn'; не указан — текущий; 'all' — за всё время.
-- В сезонном рейтинге только те, кто набрал очки или решил уровни в этом сезоне.
drop function if exists public.leaderboard(text);
drop function if exists public.leaderboard(text, text);
create function public.leaderboard(p_code text default null, p_season text default null)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with params as (
    select coalesce(p_season, season_key(now())) as season
  ),
  scored as (
    select name, surname3, created_at,
           case when params.season = 'all' then progress_points(data)
                else progress_season_points(data, params.season, updated_at) end as points,
           case when params.season = 'all' then progress_solved(data)
                else progress_season_solved(data, params.season) end as solved,
           (p_code is not null and code = p_code) as me,
           params.season
    from progress, params
    where name is not null
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'name', r.name, 'surname3', left(r.surname3, 1), 'points', r.points, 'solved', r.solved, 'me', r.me
  ) order by r.points desc, r.solved desc, r.created_at), '[]'::jsonb)
  from (
    select * from scored
    where season = 'all' or points > 0 or solved > 0
    order by points desc, solved desc, created_at
    limit 50
  ) r;
$$;

revoke all on function public.leaderboard(text, text) from public;
grant execute on function public.leaderboard(text, text) to anon;

notify pgrst, 'reload schema';

select season_key(now()) as "Текущий сезон";
