-- Обновление: усиление защиты базы.
-- Supabase → SQL Editor → New query → вставить весь файл → Run. Повторный запуск безопасен.
--
-- Что уже было и проверено снаружи:
--   • таблицы progress и admins закрыты: прочитать или изменить их напрямую нельзя;
--   • сайт работает только через функции; все значения передаются в них как параметры,
--     а не склеиваются в текст запроса, поэтому SQL-инъекции невозможны
--     (проверено: ' OR '1'='1, ; drop table …, -- и т. п. обрабатываются как обычный текст);
--   • действия педагога требуют его 16-значный ключ, неверный ключ — задержка 1 секунда.
-- Что добавляет этот файл:
--   1) у функций с правами владельца фиксируется безопасный путь поиска (public, pg_temp),
--      чтобы никто не мог подменить таблицу или функцию своей временной копией;
--   2) посетителям сайта доступны только 8 функций, нужных сайту, — всё остальное закрыто,
--      в том числе функции, которые появятся в будущем;
--   3) никто, кроме владельца, не может создавать свои объекты в схеме public;
--   4) защита от спама аккаунтами: не больше 60 новых аккаунтов в час на весь сайт;

-- 1) безопасный путь поиска
alter function public.create_participant(text, text, jsonb) set search_path = public, pg_temp;
alter function public.save_progress(text, jsonb) set search_path = public, pg_temp;
alter function public.load_progress(text) set search_path = public, pg_temp;
alter function public.admin_overview(text) set search_path = public, pg_temp;
alter function public.admin_rename_participant(text, text, text, text) set search_path = public, pg_temp;
alter function public.admin_delete_participant(text, text) set search_path = public, pg_temp;
alter function public.leaderboard(text, text) set search_path = public, pg_temp;

-- 2) только нужные функции, только для посетителей сайта (anon)
revoke execute on all functions in schema public from public, anon, authenticated;
alter default privileges in schema public revoke execute on functions from public, anon, authenticated;

grant execute on function public.create_participant(text, text, jsonb) to anon;
grant execute on function public.save_progress(text, jsonb) to anon;
grant execute on function public.load_progress(text) to anon;
grant execute on function public.leaderboard(text, text) to anon;
grant execute on function public.admin_overview(text) to anon;
grant execute on function public.admin_rename_participant(text, text, text, text) to anon;
grant execute on function public.admin_delete_participant(text, text) to anon;

-- таблицы: ещё раз закрыть и запретить по умолчанию для будущих таблиц
revoke all on public.progress from public, anon, authenticated;
revoke all on public.admins from public, anon, authenticated;
alter default privileges in schema public revoke all on tables from public, anon, authenticated;

-- 3) никто, кроме владельца, не создаёт объекты в public
revoke create on schema public from public, anon, authenticated;

-- 4) ограничение частоты создания аккаунтов
create index if not exists progress_created_at_idx on public.progress (created_at);

create or replace function public.create_participant(p_name text, p_surname3 text, p_data jsonb)
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  positions constant int[] := array[0, 1, 2, 3, 4, 5, 10, 11];
  v_name text := initcap(btrim(p_name));
  v_surname text := initcap(btrim(p_surname3));
  v_bytes bytea;
  v_code text;
  i int;
begin
  if (select count(*) from progress where created_at > now() - interval '1 hour') >= 60 then
    raise exception 'too many new accounts, try later';
  end if;
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

create or replace function public.save_progress(p_code text, p_data jsonb)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if jsonb_typeof(p_data) <> 'object' or pg_column_size(p_data) > 200000 then
    raise exception 'invalid data';
  end if;
  update progress set data = p_data, updated_at = now() where code = p_code;
  return found;
end;
$$;
revoke execute on function public.create_participant(text, text, jsonb) from public, authenticated;
revoke execute on function public.save_progress(text, jsonb) from public, authenticated;
grant execute on function public.create_participant(text, text, jsonb) to anon;
grant execute on function public.save_progress(text, jsonb) to anon;

notify pgrst, 'reload schema';

select 'Защита обновлена' as "Результат";
