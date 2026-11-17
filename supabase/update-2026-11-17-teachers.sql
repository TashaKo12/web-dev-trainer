-- Обновление: несколько педагогов. Добавляет педагога «Кузнецов Василий» со своим ключом входа.
-- Supabase → SQL Editor → New query → вставить весь файл → Run. Повторный запуск безопасен:
-- педагог не задвоится, а его ключ не поменяется.
--
-- Раньше в таблице admins могла быть только одна строка. Все функции педагога ищут его по ключу,
-- поэтому каждый педагог входит своим ключом и видит тех же учеников.

-- 1. Разрешаем несколько строк: вместо «id = true» — обычный уникальный id.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'admins' and column_name = 'id' and data_type = 'boolean'
  ) then
    alter table public.admins drop constraint if exists admins_pkey;
    alter table public.admins drop constraint if exists admins_id_check;
    alter table public.admins drop column id;
    alter table public.admins add column id uuid primary key default gen_random_uuid();
  end if;
end;
$$;

alter table public.admins drop constraint if exists admins_name_key;
alter table public.admins add constraint admins_name_key unique (name);

-- 2. Новый педагог с ключом из 16 знаков (буквы без I и O, цифры без 0 и 1).
do $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  b1 bytea;
  b2 bytea;
  v_code text;
  i int;
begin
  if exists (select 1 from public.admins where name = 'Кузнецов Василий') then
    return;
  end if;
  loop
    b1 := uuid_send(gen_random_uuid());
    b2 := uuid_send(gen_random_uuid());
    v_code := '';
    foreach i in array array[0, 1, 2, 3, 4, 5, 10, 11] loop
      v_code := v_code || substr(alphabet, 1 + get_byte(b1, i) % 32, 1) || substr(alphabet, 1 + get_byte(b2, i) % 32, 1);
    end loop;
    begin
      insert into public.admins (name, code) values ('Кузнецов Василий', v_code);
      exit;
    exception when unique_violation then
      -- такой ключ уже есть — придумываем другой
    end;
  end loop;
end;
$$;

revoke all on public.admins from public, anon, authenticated;
notify pgrst, 'reload schema';

-- Ключ нового педагога (показывается в результате ниже):
select name as "Педагог", substr(code, 1, 4) || '-' || substr(code, 5, 4) || '-' || substr(code, 9, 4) || '-' || substr(code, 13, 4) as "Ключ входа"
from public.admins
where name = 'Кузнецов Василий';
