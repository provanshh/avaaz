-- Avaaz — paste this entire file into the Supabase SQL Editor and click Run.
-- Dashboard: Project → SQL → New query

create extension if not exists "pgcrypto";

create table if not exists public.agents (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text,
  category text,
  description text,
  location text,
  phone text,
  email text,
  website text,
  opening_hours text,
  products jsonb default '[]'::jsonb,
  services jsonb default '[]'::jsonb,
  pricing jsonb default '[]'::jsonb,
  faqs jsonb default '[]'::jsonb,
  personality text,
  knowledge text,
  voice text default 'friendly',
  logo text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.agent_files (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents(id) on delete cascade,
  file_name text,
  file_path text,
  file_type text,
  extracted_text text,
  created_at timestamptz default now()
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents(id) on delete cascade,
  user_message text,
  assistant_message text,
  created_at timestamptz default now()
);

create index if not exists agents_slug_idx on public.agents (slug);
create index if not exists agent_files_agent_id_idx on public.agent_files (agent_id);
create index if not exists conversations_agent_id_idx on public.conversations (agent_id);

insert into storage.buckets (id, name, public)
values ('agent-files', 'agent-files', true)
on conflict (id) do nothing;

alter table public.agents enable row level security;
alter table public.agent_files enable row level security;
alter table public.conversations enable row level security;

drop policy if exists "agents open" on public.agents;
create policy "agents open" on public.agents for all using (true) with check (true);

drop policy if exists "agent_files open" on public.agent_files;
create policy "agent_files open" on public.agent_files for all using (true) with check (true);

drop policy if exists "conversations open" on public.conversations;
create policy "conversations open" on public.conversations for all using (true) with check (true);

drop policy if exists "agent-files read" on storage.objects;
create policy "agent-files read"
  on storage.objects for select
  using (bucket_id = 'agent-files');

drop policy if exists "agent-files write" on storage.objects;
create policy "agent-files write"
  on storage.objects for insert
  with check (bucket_id = 'agent-files');

drop policy if exists "agent-files update" on storage.objects;
create policy "agent-files update"
  on storage.objects for update
  using (bucket_id = 'agent-files');

alter table public.agents add column if not exists logo text;
alter table public.agents add column if not exists followers_count integer default 0;

create table if not exists public.agent_follows (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents(id) on delete cascade,
  follower_key text not null,
  display_name text,
  created_at timestamptz default now(),
  unique (agent_id, follower_key)
);

create index if not exists agent_follows_agent_id_idx on public.agent_follows (agent_id);

alter table public.agent_follows enable row level security;

drop policy if exists "agent_follows open" on public.agent_follows;
create policy "agent_follows open" on public.agent_follows for all using (true) with check (true);
