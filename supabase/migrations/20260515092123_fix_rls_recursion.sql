-- Fix RLS infinite recursion: use security definer function
create or replace function public.get_couple_id()
returns uuid
language sql
security definer
stable
as $$
  select couple_id from public.profiles where id = auth.uid()
$$;

-- Recreate all policies using get_couple_id()

drop policy if exists "couples_select" on couples;
create policy "couples_select" on couples for select
  using (id = public.get_couple_id());

drop policy if exists "profiles_select" on profiles;
create policy "profiles_select" on profiles for select
  using (couple_id = public.get_couple_id() or couple_id is null);

drop policy if exists "categories_select" on categories;
create policy "categories_select" on categories for select
  using (couple_id is null or couple_id = public.get_couple_id());

drop policy if exists "categories_insert" on categories;
create policy "categories_insert" on categories for insert
  with check (couple_id = public.get_couple_id());

drop policy if exists "categories_update" on categories;
create policy "categories_update" on categories for update
  using (couple_id = public.get_couple_id());

drop policy if exists "categories_delete" on categories;
create policy "categories_delete" on categories for delete
  using (couple_id = public.get_couple_id());

drop policy if exists "transactions_select" on transactions;
create policy "transactions_select" on transactions for select
  using (couple_id = public.get_couple_id());

drop policy if exists "transactions_insert" on transactions;
create policy "transactions_insert" on transactions for insert
  with check (couple_id = public.get_couple_id() and created_by = auth.uid());

drop policy if exists "transactions_update" on transactions;
create policy "transactions_update" on transactions for update
  using (couple_id = public.get_couple_id());

drop policy if exists "transactions_delete" on transactions;
create policy "transactions_delete" on transactions for delete
  using (couple_id = public.get_couple_id());

drop policy if exists "budgets_select" on budgets;
create policy "budgets_select" on budgets for select
  using (couple_id = public.get_couple_id());

drop policy if exists "budgets_insert" on budgets;
create policy "budgets_insert" on budgets for insert
  with check (couple_id = public.get_couple_id());

drop policy if exists "budgets_update" on budgets;
create policy "budgets_update" on budgets for update
  using (couple_id = public.get_couple_id());

drop policy if exists "budgets_delete" on budgets;
create policy "budgets_delete" on budgets for delete
  using (couple_id = public.get_couple_id());

drop policy if exists "savings_goals_select" on savings_goals;
create policy "savings_goals_select" on savings_goals for select
  using (couple_id = public.get_couple_id());

drop policy if exists "savings_goals_insert" on savings_goals;
create policy "savings_goals_insert" on savings_goals for insert
  with check (couple_id = public.get_couple_id());

drop policy if exists "savings_goals_update" on savings_goals;
create policy "savings_goals_update" on savings_goals for update
  using (couple_id = public.get_couple_id());

drop policy if exists "savings_goals_delete" on savings_goals;
create policy "savings_goals_delete" on savings_goals for delete
  using (couple_id = public.get_couple_id());
