-- CareerOS initial schema
-- Run this in the Supabase dashboard: SQL Editor -> New query -> paste -> Run

-- Rituals: the recurring weekly/monthly/quarterly checklist items
create table if not exists rituals (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  cadence text not null check (cadence in ('weekly', 'monthly', 'quarterly')),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  unique (title, cadence)
);

-- Ritual check-ins: one row per ritual per period it was completed in
-- period_key examples: '2026-W27' (weekly), '2026-07' (monthly), '2026-Q3' (quarterly)
create table if not exists ritual_checkins (
  id uuid primary key default gen_random_uuid(),
  ritual_id uuid not null references rituals(id) on delete cascade,
  period_key text not null,
  completed_at timestamptz not null default now(),
  unique (ritual_id, period_key)
);

-- Backlog: experiments and artifacts you're tracking
create table if not exists backlog_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  item_type text not null check (item_type in ('experiment', 'artifact')),
  status text not null default 'backlog' check (status in ('backlog', 'in_progress', 'shipped', 'archived')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Leads: outreach and opportunities you're moving toward conversion
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  channel text not null,
  status text not null default 'contacted' check (status in ('contacted', 'replied', 'converted', 'lost')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Seed starter rituals based on your CareerOS framework
insert into rituals (title, cadence, sort_order) values
  ('Ship 1-2 artifacts (case study, thread, template)', 'weekly', 1),
  ('Run 1-2 experiments', 'weekly', 2),
  ('Log learnings', 'weekly', 3),
  ('Review portfolio', 'monthly', 1),
  ('Refine offers', 'monthly', 2),
  ('Update ICPs', 'monthly', 3),
  ('Adjust positioning', 'quarterly', 1)
on conflict (title, cadence) do nothing;

-- This app has no login system yet (single-user, personal use), so tables are
-- left open to the anon key rather than locked down with row-level security.
-- Revisit this if CareerOS ever becomes multi-user.
-- Note: disabling RLS does not grant table access on its own — the anon and
-- authenticated roles still need explicit grants below.
alter table rituals disable row level security;
alter table ritual_checkins disable row level security;
alter table backlog_items disable row level security;
alter table leads disable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on rituals, ritual_checkins, backlog_items, leads to anon, authenticated;
