-- ============================================================================
-- salemycar pilot — affiliate referral system for one Renault Clio V 2022
-- Run this in the Supabase SQL editor for your shared project.
-- All objects live in a dedicated `salemycar` schema so they do not collide
-- with anything else running in the same Postgres instance.
--
-- AFTER running this, go to: Supabase Dashboard → Project Settings → API →
-- "Exposed schemas" and add `salemycar` to the list (alongside `public`).
-- Without that, PostgREST will not see these tables.
-- ============================================================================

create schema if not exists salemycar;

-- ----------------------------------------------------------------------------
-- affiliates
-- ----------------------------------------------------------------------------
create table if not exists salemycar.affiliates (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  whatsapp    text not null,
  ref_code    text not null unique,
  created_at  timestamptz not null default now()
);

create index if not exists affiliates_ref_code_idx on salemycar.affiliates (ref_code);

-- ----------------------------------------------------------------------------
-- leads
-- ----------------------------------------------------------------------------
create table if not exists salemycar.leads (
  id               uuid primary key default gen_random_uuid(),
  affiliate_id     uuid references salemycar.affiliates(id) on delete set null,
  buyer_name       text not null,
  buyer_whatsapp   text not null,
  discount_code    text not null unique,
  status           text not null default 'new'
                   check (status in ('new','contacted','test_drive','closed_won','closed_lost')),
  notes            text,
  commission_paid  boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists leads_affiliate_id_idx on salemycar.leads (affiliate_id);
create index if not exists leads_discount_code_idx on salemycar.leads (discount_code);
create index if not exists leads_status_idx on salemycar.leads (status);
create index if not exists leads_created_at_idx on salemycar.leads (created_at desc);

-- auto-update updated_at
create or replace function salemycar.set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists leads_set_updated_at on salemycar.leads;
create trigger leads_set_updated_at
  before update on salemycar.leads
  for each row execute function salemycar.set_updated_at();

-- ----------------------------------------------------------------------------
-- Row Level Security
-- All writes/reads from the app go through the service role key on the server.
-- The anon key gets zero permissions.
-- ----------------------------------------------------------------------------
alter table salemycar.affiliates enable row level security;
alter table salemycar.leads      enable row level security;

-- No policies = no access for anon/authenticated. Service role bypasses RLS.

-- Grant schema usage so PostgREST can introspect (still gated by RLS).
grant usage on schema salemycar to anon, authenticated, service_role;
grant all on all tables in schema salemycar to service_role;
grant all on all sequences in schema salemycar to service_role;
alter default privileges in schema salemycar
  grant all on tables to service_role;
alter default privileges in schema salemycar
  grant all on sequences to service_role;
