-- Обновление: статистика ошибок по заданиям с возможностью обнулять.
-- Supabase → SQL Editor → New query → вставить весь файл → Run. Повторный запуск безопасен.
--
-- Ученики сохраняют каждую ошибку с датой. Обнуление не стирает их данные, а запоминает момент:
-- в сводке считаются только ошибки после него. Ключ задания: "<тема>:L<n>", ":M<n>", ":C<n>",
-- а "*" — обнулить всё сразу.

create table if not exists public.mistake_resets (
  key text primary key check (key = '*' or key ~ '^[a-z0-9-]{1,40}:[LMC][0-9]{1,2}$'),
  reset_at timestamptz not null default now()
);

alter table public.mistake_resets enable row level security;
revoke all on public.mistake_resets from public, anon, authenticated;

create or replace function public.admin_reset_mistakes(p_admin text, p_key text)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not exists (select 1 from admins where code = p_admin) then
    perform pg_sleep(1);
    raise exception 'not admin';
  end if;
  if p_key is null or not (p_key = '*' or p_key ~ '^[a-z0-9-]{1,40}:[LMC][0-9]{1,2}$') then
    raise exception 'invalid key';
  end if;
  insert into mistake_resets (key, reset_at) values (p_key, now())
  on conflict (key) do update set reset_at = now();
  return true;
end;
$$;

-- Сводка педагога: участники с отметками и моменты обнуления ошибок.
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
    'resets', coalesce((select jsonb_object_agg(key, reset_at) from mistake_resets), '{}'::jsonb),
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

revoke execute on function public.admin_reset_mistakes(text, text) from public, authenticated;
revoke execute on function public.admin_overview(text) from public, authenticated;
grant execute on function public.admin_reset_mistakes(text, text) to anon;
grant execute on function public.admin_overview(text) to anon;

notify pgrst, 'reload schema';

select 'Статистика ошибок включена' as "Результат";
