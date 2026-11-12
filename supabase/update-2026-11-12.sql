-- Обновление: педагог может переименовать и удалить участника, в рейтинге — только первая буква фамилии.
-- Supabase → SQL Editor → New query → вставить весь файл → Run.

drop function if exists public.leaderboard(text);
create function public.leaderboard(p_code text default null)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'name', r.name, 'surname3', left(r.surname3, 1), 'points', r.points, 'solved', r.solved, 'me', r.me
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

-- ───────── Действия админа: переименовать и удалить участника ─────────

create or replace function public.admin_rename_participant(p_admin text, p_code text, p_name text, p_surname3 text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text := initcap(btrim(p_name));
  v_surname text := initcap(btrim(p_surname3));
begin
  if not exists (select 1 from admins where code = p_admin) then
    perform pg_sleep(1);
    raise exception 'not admin';
  end if;
  if v_name is null or v_name !~ '^[A-Za-zА-Яа-яЁё][A-Za-zА-Яа-яЁё -]{0,29}$' then
    raise exception 'invalid name';
  end if;
  if v_surname is null or v_surname !~ '^[A-Za-zА-Яа-яЁё]{3}$' then
    raise exception 'invalid surname';
  end if;
  update progress set name = v_name, surname3 = v_surname where code = p_code;
  return found;
end;
$$;

create or replace function public.admin_delete_participant(p_admin text, p_code text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from admins where code = p_admin) then
    perform pg_sleep(1);
    raise exception 'not admin';
  end if;
  delete from progress where code = p_code;
  return found;
end;
$$;

revoke all on function public.admin_rename_participant(text, text, text, text) from public;
revoke all on function public.admin_delete_participant(text, text) from public;
grant execute on function public.admin_rename_participant(text, text, text, text) to anon;
grant execute on function public.admin_delete_participant(text, text) to anon;

notify pgrst, 'reload schema';

select 'Готово' as "Результат";
