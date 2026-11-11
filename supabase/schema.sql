-- Хранилище прогресса по коду участника.
-- Запуск: Supabase → SQL Editor → вставить весь файл → Run. Повторный запуск безопасен.
--
-- Код участника выдаёт сама база: он уникальный и постоянный, не меняется и не удаляется с сайта.
-- Вместе с кодом хранятся имя и первые три буквы фамилии — чтобы автор курса мог найти код,
-- если участник его потеряет (Table Editor → progress). Других личных данных нет.
-- Напрямую таблица закрыта для всех: сайт работает только через функции ниже.

create table if not exists public.progress (
  code text primary key check (code ~ '^[A-Z2-9]{8}$'),
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.progress add column if not exists name text;
alter table public.progress add column if not exists surname3 text;
alter table public.progress add column if not exists created_at timestamptz not null default now();

alter table public.progress enable row level security;
revoke all on public.progress from anon, authenticated;

-- Коды больше не удаляются с сайта; save_progress пересоздаётся с новым типом ответа.
drop function if exists public.delete_progress(text);
drop function if exists public.save_progress(text, jsonb);

-- Новый участник: проверяет имя, сама придумывает уникальный код и возвращает его.
create or replace function public.create_participant(p_name text, p_surname3 text, p_data jsonb)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  positions constant int[] := array[0, 1, 2, 3, 4, 5, 10, 11]; -- случайные байты uuid v4
  v_name text := initcap(btrim(p_name));
  v_surname text := initcap(btrim(p_surname3));
  v_bytes bytea;
  v_code text;
  i int;
begin
  if v_name is null or v_name !~ '^[A-Za-zА-Яа-яЁё][A-Za-zА-Яа-яЁё -]{0,29}$' then
    raise exception 'invalid name';
  end if;
  if v_surname is null or v_surname !~ '^[A-Za-zА-Яа-яЁё]{3}$' then
    raise exception 'invalid surname';
  end if;
  if jsonb_typeof(p_data) <> 'object' or pg_column_size(p_data) > 200000 then
    raise exception 'invalid data';
  end if;

  loop
    v_bytes := uuid_send(gen_random_uuid());
    v_code := '';
    foreach i in array positions loop
      v_code := v_code || substr(alphabet, 1 + get_byte(v_bytes, i) % 32, 1);
    end loop;
    begin
      insert into progress (code, data, name, surname3) values (v_code, p_data, v_name, v_surname);
      return v_code;
    exception when unique_violation then
      -- такой код уже есть — придумываем другой
    end;
  end loop;
end;
$$;

-- Обновляет прогресс существующего участника. Новые коды так создать нельзя.
create or replace function public.save_progress(p_code text, p_data jsonb)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if jsonb_typeof(p_data) <> 'object' or pg_column_size(p_data) > 200000 then
    raise exception 'invalid data';
  end if;
  update progress set data = p_data, updated_at = now() where code = p_code;
  return found;
end;
$$;

-- Прогресс и подпись участника по коду (null, если кода нет).
create or replace function public.load_progress(p_code text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object('data', data, 'name', name, 'surname3', surname3)
  from progress where code = p_code;
$$;

revoke all on function public.create_participant(text, text, jsonb) from public;
revoke all on function public.save_progress(text, jsonb) from public;
revoke all on function public.load_progress(text) from public;

grant execute on function public.create_participant(text, text, jsonb) to anon;
grant execute on function public.save_progress(text, jsonb) to anon;
grant execute on function public.load_progress(text) to anon;

notify pgrst, 'reload schema';

-- ───────── Админ ─────────
-- Ровно один админ (строка с id = true). Код из 16 знаков выдаётся один раз и больше не меняется:
-- повторный запуск скрипта его не трогает. Посмотреть код всегда можно в Table Editor → admins.

create table if not exists public.admins (
  id boolean primary key default true check (id),
  name text not null,
  code text not null unique check (code ~ '^[A-Z2-9]{16}$'),
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;
revoke all on public.admins from anon, authenticated;

do $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  b1 bytea := uuid_send(gen_random_uuid());
  b2 bytea := uuid_send(gen_random_uuid());
  v_code text := '';
  i int;
begin
  if exists (select 1 from public.admins) then
    return;
  end if;
  foreach i in array array[0, 1, 2, 3, 4, 5, 10, 11] loop
    v_code := v_code || substr(alphabet, 1 + get_byte(b1, i) % 32, 1) || substr(alphabet, 1 + get_byte(b2, i) % 32, 1);
  end loop;
  insert into public.admins (name, code) values ('Кондратюк Татьяна', v_code);
end;
$$;

-- Сводка для страницы админа: все участники с прогрессом. Без верного кода админа — ошибка.
create or replace function public.admin_overview(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin text;
begin
  select name into v_admin from admins where code = p_code;
  if v_admin is null then
    perform pg_sleep(1); -- замедляет подбор кода
    raise exception 'not admin';
  end if;
  return jsonb_build_object(
    'admin', v_admin,
    'participants', coalesce((
      select jsonb_agg(jsonb_build_object(
        'code', code, 'name', name, 'surname3', surname3,
        'created_at', created_at, 'updated_at', updated_at, 'data', data
      ) order by updated_at desc)
      from progress
    ), '[]'::jsonb)
  );
end;
$$;

revoke all on function public.admin_overview(text) from public;
grant execute on function public.admin_overview(text) to anon;

notify pgrst, 'reload schema';

-- ───────── Рейтинг учеников ─────────
-- Публичный список: только имя, три буквы фамилии, очки и решённые уровни. Коды не показываются.
-- Если передать свой код, своя строка помечается флагом me.

create or replace function public.progress_points(p jsonb)
returns int
language plpgsql
immutable
as $$
declare
  v numeric := 0;
begin
  select coalesce(sum(value::numeric), 0) into v from jsonb_each_text((p ->> 'wdt:points')::jsonb);
  return v::int;
exception when others then
  return 0;
end;
$$;

create or replace function public.progress_solved(p jsonb)
returns int
language plpgsql
immutable
as $$
declare
  v int := 0;
begin
  select count(*) into v
  from jsonb_each_text(p) s
  cross join lateral jsonb_array_elements_text((s.value::jsonb) -> 'statuses') st
  where s.key like 'wdt:session:%' and st = 'correct';
  return v;
exception when others then
  return 0;
end;
$$;

revoke all on function public.progress_points(jsonb) from public, anon, authenticated;
revoke all on function public.progress_solved(jsonb) from public, anon, authenticated;

drop function if exists public.leaderboard(text);
create function public.leaderboard(p_code text default null)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'name', r.name, 'surname3', r.surname3, 'points', r.points, 'solved', r.solved, 'me', r.me
  ) order by r.points desc, r.solved desc, r.created_at), '[]'::jsonb)
  from (
    select name, surname3, created_at,
           progress_points(data) as points,
           progress_solved(data) as solved,
           (p_code is not null and code = p_code) as me
    from progress
    where name is not null
    order by points desc, solved desc, created_at
    limit 50
  ) r;
$$;

revoke all on function public.leaderboard(text) from public;
grant execute on function public.leaderboard(text) to anon;

notify pgrst, 'reload schema';

-- Код админа (показывается в результате ниже):
select name as "Админ", substr(code, 1, 4) || '-' || substr(code, 5, 4) || '-' || substr(code, 9, 4) || '-' || substr(code, 13, 4) as "Код админа"
from public.admins;
