-- Run this in Supabase SQL editor (Project → SQL Editor → New query)

create table if not exists analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  input_summary text,
  target_role text,
  skills_json jsonb,
  gap_json jsonb
);

alter table analyses enable row level security;

create policy "Users can read their own analyses"
  on analyses for select
  using (auth.uid() = user_id);

create policy "Users can insert their own analyses"
  on analyses for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own analyses"
  on analyses for delete
  using (auth.uid() = user_id);
