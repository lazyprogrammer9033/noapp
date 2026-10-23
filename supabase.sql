-- Run this once in Supabase > SQL Editor > New query.
-- It creates the table for RSVPs and locks it down so that:
--   * anyone visiting the invitation can ADD an RSVP
--   * only a signed-in admin can READ or DELETE them

create table if not exists public.rsvps (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  name        text not null check (char_length(name) between 1 and 100),
  email       text not null check (char_length(email) between 3 and 200),
  guests      int  not null default 1 check (guests between 1 and 20),
  diet        text check (char_length(diet) <= 50),
  message     text check (char_length(message) <= 500)
);

alter table public.rsvps enable row level security;

-- Guests (anonymous visitors) may only insert.
drop policy if exists "anyone can rsvp" on public.rsvps;
create policy "anyone can rsvp"
  on public.rsvps for insert
  to anon, authenticated
  with check (true);

-- Only signed-in users (the admin account you create) can read.
drop policy if exists "admin can read" on public.rsvps;
create policy "admin can read"
  on public.rsvps for select
  to authenticated
  using (true);

-- Only signed-in users can delete (e.g. remove a test entry).
drop policy if exists "admin can delete" on public.rsvps;
create policy "admin can delete"
  on public.rsvps for delete
  to authenticated
  using (true);
