-- ==============================================================================
-- FOCAS AI - Production Database Schema (Supabase / PostgreSQL)
-- Multi-user startup ideation, evaluations, experiments, and customer interview notes
-- with strict Row Level Security (RLS) policies for complete tenant data isolation.
-- ==============================================================================

-- 1. Profiles Table (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  full_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile trigger on auth.users signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Projects Table
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text default '',
  status text not null default 'Evaluating',
  form jsonb not null default '{}'::jsonb,
  analysis jsonb,
  model_used text,
  evaluation_type text default 'ai', -- 'ai' or 'basic'
  is_quota_exceeded boolean default false,
  error text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indices for fast tenant lookups and dashboard ordering
create index if not exists idx_projects_user_id on public.projects(user_id);
create index if not exists idx_projects_updated_at on public.projects(updated_at desc);

-- Enable RLS on projects
alter table public.projects enable row level security;

create policy "Users can view only their own projects"
  on public.projects for select
  using (auth.uid() = user_id);

create policy "Users can insert their own projects"
  on public.projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update only their own projects"
  on public.projects for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete only their own projects"
  on public.projects for delete
  using (auth.uid() = user_id);

-- 3. Evaluation Reports & History Table
create table if not exists public.evaluation_history (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  form jsonb not null default '{}'::jsonb,
  analysis jsonb not null default '{}'::jsonb,
  model_used text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_eval_history_project on public.evaluation_history(project_id);
create index if not exists idx_eval_history_user on public.evaluation_history(user_id);

alter table public.evaluation_history enable row level security;

create policy "Users can view their own evaluation history"
  on public.evaluation_history for select
  using (auth.uid() = user_id);

create policy "Users can insert their own evaluation history"
  on public.evaluation_history for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own evaluation history"
  on public.evaluation_history for delete
  using (auth.uid() = user_id);

-- 4. Customer Interviews Table
create table if not exists public.customer_interviews (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  interviewee_role text not null,
  interview_date text not null,
  problem_confirmed boolean default false,
  frequency text default 'Daily',
  would_pay boolean default false,
  estimated_budget text default '',
  current_workaround text default '',
  key_quotes text default '',
  notes text default '',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_interviews_project on public.customer_interviews(project_id);
create index if not exists idx_interviews_user on public.customer_interviews(user_id);

alter table public.customer_interviews enable row level security;

create policy "Users can view their own interviews"
  on public.customer_interviews for select
  using (auth.uid() = user_id);

create policy "Users can insert their own interviews"
  on public.customer_interviews for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own interviews"
  on public.customer_interviews for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own interviews"
  on public.customer_interviews for delete
  using (auth.uid() = user_id);

-- 5. Tracked Assumptions & Experiments Table
create table if not exists public.tracked_assumptions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  assumption text not null,
  category text not null default 'Problem',
  state text not null default 'Untested', -- 'Untested', 'Supported', 'Disproved'
  evidence_notes text default '',
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_assumptions_project on public.tracked_assumptions(project_id);
create index if not exists idx_assumptions_user on public.tracked_assumptions(user_id);

alter table public.tracked_assumptions enable row level security;

create policy "Users can view their own assumptions"
  on public.tracked_assumptions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own assumptions"
  on public.tracked_assumptions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own assumptions"
  on public.tracked_assumptions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own assumptions"
  on public.tracked_assumptions for delete
  using (auth.uid() = user_id);

-- 6. Project Chat History Table (Optional conversational history persistence)
create table if not exists public.project_chat (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role text not null, -- 'user' or 'assistant'
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_chat_project on public.project_chat(project_id);
create index if not exists idx_chat_user on public.project_chat(user_id);

alter table public.project_chat enable row level security;

create policy "Users can view their own chat messages"
  on public.project_chat for select
  using (auth.uid() = user_id);

create policy "Users can insert their own chat messages"
  on public.project_chat for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own chat messages"
  on public.project_chat for delete
  using (auth.uid() = user_id);
