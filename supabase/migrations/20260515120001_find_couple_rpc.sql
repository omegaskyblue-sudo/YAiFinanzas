-- RPC to find a couple by invite code (bypass RLS)
create or replace function public.find_couple_by_code(code text)
returns json
language plpgsql
security definer
as $$
declare
  v_couple json;
begin
  select json_build_object(
    'id', c.id,
    'invite_code', c.invite_code,
    'created_at', c.created_at
  ) into v_couple
  from public.couples c
  where c.invite_code = code;

  return v_couple;
end;
$$;
