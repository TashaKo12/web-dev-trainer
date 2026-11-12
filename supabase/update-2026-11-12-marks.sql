-- Обновление: педагог может засчитывать ученикам задания.
-- Supabase → SQL Editor → New query → вставить весь файл → Run. Повторный запуск безопасен.
--
-- Отметки педагога хранятся отдельно от прогресса (колонка marks), поэтому их не сотрёт
-- сохранение с компьютера ученика: сайт ученика сам подтягивает отметки и засчитывает задания.
-- Ключ отметки: "<тема>:L<номер уровня>" или "<тема>:M<номер миссии>", значение — дата отметки.

alter table public.progress add column if not exists marks jsonb not null default '{}'::jsonb;

-- Засчитать задания: только с ключом педагога.
create or replace function public.admin_mark(p_admin text, p_code text, p_keys text[])
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  k text;
begin
  if not exists (select 1 from admins where code = p_admin) then
    perform pg_sleep(1);
    raise exception 'not admin';
  end if;
  if p_keys is null or array_length(p_keys, 1) is null or array_length(p_keys, 1) > 200 then
    raise exception 'invalid keys';
  end if;
  foreach k in array p_keys loop
    if k !~ '^[a-z0-9-]{1,40}:[LM][0-9]{1,2}$' then
      raise exception 'invalid key';
    end if;
  end loop;
  update progress
  set marks = marks || (select jsonb_object_agg(x, to_jsonb(now())) from unnest(p_keys) as x)
  where code = p_code;
  return found;
end;
$$;

-- Отметки для ученика (лёгкий запрос: только отметки, без всего прогресса).
create or replace function public.load_marks(p_code text)
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select marks from progress where code = p_code;
$$;

-- Сводка педагога теперь отдаёт и отметки.
create or replace function public.admin_overview(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_admin text;
begin
  select name into v_admin from admins where code = p_code;
  if v_admin is null then
    perform pg_sleep(1);
    raise exception 'not admin';
  end if;
  return jsonb_build_object(
    'admin', v_admin,
    'participants', coalesce((
      select jsonb_agg(jsonb_build_object(
        'code', code, 'name', name, 'surname3', surname3,
        'created_at', created_at, 'updated_at', updated_at, 'data', data, 'marks', marks
      ) order by updated_at desc)
      from progress
    ), '[]'::jsonb)
  );
end;
$$;

revoke execute on function public.admin_mark(text, text, text[]) from public, authenticated;
revoke execute on function public.load_marks(text) from public, authenticated;
revoke execute on function public.admin_overview(text) from public, authenticated;
grant execute on function public.admin_mark(text, text, text[]) to anon;
grant execute on function public.load_marks(text) to anon;
grant execute on function public.admin_overview(text) to anon;

notify pgrst, 'reload schema';

select 'Отметки педагога включены' as "Результат";
