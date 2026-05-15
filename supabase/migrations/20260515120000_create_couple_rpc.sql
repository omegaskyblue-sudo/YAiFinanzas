-- RPC to create a couple, bypassing RLS for the select after insert

create or replace function public.create_couple(invite_code text)
returns json
language plpgsql
security definer
as $$
declare
  v_couple_id uuid;
  v_couple json;
begin
  insert into public.couples (invite_code)
  values (invite_code)
  returning id into v_couple_id;

  select json_build_object(
    'id', c.id,
    'invite_code', c.invite_code,
    'created_at', c.created_at
  ) into v_couple
  from public.couples c
  where c.id = v_couple_id;

  return v_couple;
end;
$$;
