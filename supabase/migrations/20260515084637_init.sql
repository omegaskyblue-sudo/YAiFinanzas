-- YAiFinanzas - Esquema inicial

create extension if not exists "uuid-ossp";

create type transaction_type as enum ('income', 'expense');

create table couples (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz not null default now(),
  invite_code text unique not null
);

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  couple_id uuid references couples(id) on delete set null,
  name text not null,
  avatar_url text
);

create table categories (
  id uuid primary key default uuid_generate_v4(),
  couple_id uuid references couples(id) on delete cascade,
  name text not null,
  icon text not null default 'receipt',
  type transaction_type not null default 'expense',
  color text not null default '#6B7280'
);

create table transactions (
  id uuid primary key default uuid_generate_v4(),
  couple_id uuid not null references couples(id) on delete cascade,
  created_by uuid not null references profiles(id) on delete cascade,
  amount numeric(12,2) not null check (amount > 0),
  type transaction_type not null,
  category_id uuid references categories(id) on delete set null,
  description text,
  date date not null default current_date,
  is_split boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table budgets (
  id uuid primary key default uuid_generate_v4(),
  couple_id uuid not null references couples(id) on delete cascade,
  category_id uuid not null references categories(id) on delete cascade,
  month date not null check (date_trunc('month', month) = month),
  amount numeric(12,2) not null check (amount > 0),
  spent numeric(12,2) not null default 0 check (spent >= 0),
  unique (couple_id, category_id, month)
);

create table savings_goals (
  id uuid primary key default uuid_generate_v4(),
  couple_id uuid not null references couples(id) on delete cascade,
  name text not null,
  target_amount numeric(12,2) not null check (target_amount > 0),
  current_amount numeric(12,2) not null default 0 check (current_amount >= 0),
  deadline date,
  created_at timestamptz not null default now()
);

-- Indices
create index idx_profiles_couple on profiles(couple_id);
create index idx_transactions_couple on transactions(couple_id);
create index idx_transactions_date on transactions(couple_id, date desc);
create index idx_transactions_category on transactions(category_id);
create index idx_categories_couple on categories(couple_id);
create index idx_budgets_couple on budgets(couple_id, month);
create index idx_savings_goals_couple on savings_goals(couple_id);

-- RLS helper function (security definer to avoid recursion)
create or replace function public.get_couple_id()
returns uuid
language sql
security definer
stable
as $$
  select couple_id from public.profiles where id = auth.uid()
$$;

alter table couples enable row level security;
alter table profiles enable row level security;
alter table categories enable row level security;
alter table transactions enable row level security;
alter table budgets enable row level security;
alter table savings_goals enable row level security;

-- couples policies
create policy "couples_select" on couples for select
  using (id = public.get_couple_id());
create policy "couples_insert" on couples for insert
  with check (true);

-- profiles policies
create policy "profiles_select" on profiles for select
  using (couple_id = public.get_couple_id() or couple_id is null);
create policy "profiles_insert" on profiles for insert
  with check (id = auth.uid());
create policy "profiles_update" on profiles for update
  using (id = auth.uid()) with check (id = auth.uid());

-- categories policies
create policy "categories_select" on categories for select
  using (couple_id is null or couple_id = public.get_couple_id());
create policy "categories_insert" on categories for insert
  with check (couple_id = public.get_couple_id());
create policy "categories_update" on categories for update
  using (couple_id = public.get_couple_id());
create policy "categories_delete" on categories for delete
  using (couple_id = public.get_couple_id());

-- transactions policies
create policy "transactions_select" on transactions for select
  using (couple_id = public.get_couple_id());
create policy "transactions_insert" on transactions for insert
  with check (couple_id = public.get_couple_id() and created_by = auth.uid());
create policy "transactions_update" on transactions for update
  using (couple_id = public.get_couple_id());
create policy "transactions_delete" on transactions for delete
  using (couple_id = public.get_couple_id());

-- budgets policies
create policy "budgets_select" on budgets for select
  using (couple_id = public.get_couple_id());
create policy "budgets_insert" on budgets for insert
  with check (couple_id = public.get_couple_id());
create policy "budgets_update" on budgets for update
  using (couple_id = public.get_couple_id());
create policy "budgets_delete" on budgets for delete
  using (couple_id = public.get_couple_id());

-- savings_goals policies
create policy "savings_goals_select" on savings_goals for select
  using (couple_id = public.get_couple_id());
create policy "savings_goals_insert" on savings_goals for insert
  with check (couple_id = public.get_couple_id());
create policy "savings_goals_update" on savings_goals for update
  using (couple_id = public.get_couple_id());
create policy "savings_goals_delete" on savings_goals for delete
  using (couple_id = public.get_couple_id());

-- Triggers
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_transactions_updated_at
  before update on transactions
  for each row execute function update_updated_at();

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', 'Usuario'));
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
