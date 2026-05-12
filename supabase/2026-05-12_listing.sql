-- ============================================================================
-- Migration: editable single-car listing + Storage bucket for photos
-- Run this in Supabase SQL editor AFTER schema.sql.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- listing — singleton row holding the car spec, photos, and price overrides.
--   id is fixed to 'clio' so /admin always edits the same row.
--   Any nullable price column overrides the env var when set.
-- ----------------------------------------------------------------------------
create table if not exists salemycar.listing (
  id                    text primary key default 'clio',
  title                 text not null default 'Renault Clio V',
  year                  int  not null default 2022,
  km                    int  not null default 38500,
  fuel                  text not null default 'Gasolina',
  transmission          text not null default 'Manual',
  power                 text not null default '75 cv',
  color                 text not null default 'Cinzento Titânio',
  description           text not null default '',
  options               text[] not null default '{}',
  photos                text[] not null default '{}',  -- public Storage URLs
  list_price            int,                            -- nullable → use env
  buyer_discount        int,                            -- nullable → use env
  affiliate_commission  int,                            -- nullable → use env
  updated_at            timestamptz not null default now(),
  constraint listing_singleton check (id = 'clio')
);

drop trigger if exists listing_set_updated_at on salemycar.listing;
create trigger listing_set_updated_at
  before update on salemycar.listing
  for each row execute function salemycar.set_updated_at();

alter table salemycar.listing enable row level security;
-- No policies = no anon/authenticated access. Service role bypasses RLS.

grant all on salemycar.listing to service_role;

-- Seed the singleton with the hardcoded values from page.tsx so /
-- still renders the right thing on day one.
insert into salemycar.listing (
  id, title, year, km, fuel, transmission, power, color, description, options
) values (
  'clio',
  'Renault Clio V',
  2022,
  38500,
  'Gasolina',
  'Manual',
  '75 cv',
  'Cinzento Titânio',
  'Particular. Sem comissões. Sem intermediários a inflar o preço.',
  array[
    'Ar condicionado automático',
    'Sensores de estacionamento traseiros',
    'Câmara de marcha-atrás',
    'Apple CarPlay / Android Auto',
    'Cruise control adaptativo',
    'Faróis LED',
    'Jantes em liga leve 16"',
    '2.º proprietário, livro de revisões na marca'
  ]
) on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- Storage bucket: salemycar (public read, server-side writes only)
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'salemycar',
  'salemycar',
  true,
  5242880,  -- 5 MB per file
  array['image/jpeg','image/png','image/webp','image/heic','image/heif']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Public read on objects in the salemycar bucket. (Writes are server-side
-- with the service_role key, which bypasses RLS — no insert policy needed.)
drop policy if exists "salemycar public read" on storage.objects;
create policy "salemycar public read" on storage.objects
  for select using (bucket_id = 'salemycar');
