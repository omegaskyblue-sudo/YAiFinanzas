-- Push notifications tokens

create extension if not exists "uuid-ossp";

create table push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  token text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id)
);

alter table push_tokens enable row level security;

-- Users can manage their own token
create policy "push_tokens_insert" on push_tokens for insert
  with check (user_id = auth.uid());

create policy "push_tokens_select" on push_tokens for select
  using (user_id = auth.uid());

create policy "push_tokens_update" on push_tokens for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "push_tokens_delete" on push_tokens for delete
  using (user_id = auth.uid());

-- Service role needs to read tokens to send notifications
-- (service_role bypasses RLS by default, so no extra policy needed)

create trigger trg_push_tokens_updated_at
  before update on push_tokens
  for each row execute function update_updated_at();

create index idx_push_tokens_user on push_tokens(user_id);
