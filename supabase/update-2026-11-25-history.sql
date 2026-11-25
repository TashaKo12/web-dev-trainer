-- История прогресса: копии, которые база делает сама.
-- Запуск: Supabase → SQL Editor → вставить весь файл → Run. Повторный запуск безопасен: ничего не удаляет и не меняет в прогрессе.
--
-- 1. При первом сохранении ученика за день прежний прогресс кладётся в progress_history.
-- 2. То же самое перед удалением аккаунта.
-- 3. Сразу после запуска делается копия прогресса всех учеников.
-- Копии хранятся 60 дней. С сайта они недоступны — только в Supabase.

create table if not exists public.progress_history (
  code text not null,
  day date not null default current_date,
  reason text not null default 'day',
  name text,
  surname3 text,
  data jsonb not null,
  saved_at timestamptz not null default now(),
  primary key (code, day, reason)
);

alter table public.progress_history enable row level security;
revoke all on public.progress_history from public;
do $$
begin
  revoke all on public.progress_history from anon, authenticated;
exception when undefined_object then null;
end;
$$;

create or replace function public.keep_progress_copy()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  begin
    if tg_op = 'DELETE' then
      insert into progress_history (code, reason, name, surname3, data)
      values (old.code, 'delete', old.name, old.surname3, old.data)
      on conflict (code, day, reason) do update set data = excluded.data, saved_at = now();
    elsif new.data is distinct from old.data then
      insert into progress_history (code, name, surname3, data)
      values (old.code, old.name, old.surname3, old.data)
      on conflict do nothing;
      if found then
        delete from progress_history where code = old.code and day < current_date - 60;
      end if;
    end if;
  exception when others then
    null; -- копия не получилась — сохранению ученика это мешать не должно
  end;
  return coalesce(new, old);
end;
$$;

revoke all on function public.keep_progress_copy() from public;

drop trigger if exists keep_progress_copy on public.progress;
create trigger keep_progress_copy before update or delete on public.progress
for each row execute function public.keep_progress_copy();

-- Копия всех учеников прямо сейчас. Этот же запрос можно запускать перед любым большим обновлением сайта.
insert into public.progress_history (code, reason, name, surname3, data)
select code, 'before-update', name, surname3, data from public.progress
on conflict (code, day, reason) do update set data = excluded.data, saved_at = now();

select count(*) as "Сохранено копий" from public.progress_history;

-- Вернуть прогресс ученика на выбранный день (подставь код и дату, убери «--»):
-- update public.progress p set data = h.data from public.progress_history h
-- where p.code = 'КОДУЧЕНИ' and h.code = p.code and h.day = '2026-11-25' and h.reason = 'day';
