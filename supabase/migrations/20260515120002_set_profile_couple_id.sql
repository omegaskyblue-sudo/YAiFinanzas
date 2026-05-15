create or replace function public.set_profile_couple_id(p_couple_id uuid)
returns boolean
language plpgsql
security definer
as $$
begin
  update public.profiles
  set couple_id = p_couple_id
  where id = auth.uid();

  return found;
end;
$$;
