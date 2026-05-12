-- ============================================================================
-- Migration: capture interest from prospective owners who want to list a car
-- via SaleMyCar. This is a demand-signal table for the multi-listing pivot —
-- the platform is single-car today, but the header CTA collects intent so we
-- know if/when to build v2.
-- ============================================================================

create table if not exists salemycar.owner_interest (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  email        text,
  whatsapp     text not null,
  car_brief    text,                 -- e.g. "Peugeot 208 2020 ~50k km"
  message      text,
  created_at   timestamptz not null default now()
);

create index if not exists owner_interest_created_at_idx
  on salemycar.owner_interest (created_at desc);

alter table salemycar.owner_interest enable row level security;
-- No policies = no anon/authenticated access. Service role bypasses RLS.

grant all on salemycar.owner_interest to service_role;
