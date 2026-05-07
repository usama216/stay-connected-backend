-- Run this in Supabase SQL Editor (Dashboard > SQL Editor) to create the contact_queries table.

create table if not exists contact_queries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company text,
  phone text,
  service_interest text,
  message text not null,
  status text not null default 'new' check (status in ('new', 'in_progress', 'completed', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- If Row Level Security (RLS) is enabled on this table, add a policy so the backend can read/write:
-- create policy "Backend full access" on contact_queries for all using (true) with check (true);
