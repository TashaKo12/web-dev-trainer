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
