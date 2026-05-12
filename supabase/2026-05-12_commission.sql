-- ============================================================================
-- Migration: proportional commission based on final sale price
-- Adds two columns to leads:
--   sale_price        — what the owner actually received (entered when closing)
--   commission_amount — what the affiliate is owed (snapshotted at close time)
--
-- Existing closed_won rows are backfilled assuming the buyer paid the
-- "expected" price (list_price - buyer_discount), so historical commission
-- equals the configured max.
-- ============================================================================

alter table salemycar.leads
  add column if not exists sale_price        int,
  add column if not exists commission_amount int;

-- Backfill: for any already-closed row that has no sale_price yet, assume
-- the buyer paid the expected discounted price → commission = configured max.
-- We can't read env vars from SQL, so we use what's in the listing row.
do $$
declare
  l record;
  ref_price int;
  max_comm  int;
begin
  select coalesce(list_price, 0)            as list_price,
         coalesce(buyer_discount, 0)        as buyer_discount,
         coalesce(affiliate_commission, 0)  as affiliate_commission
    into l
    from salemycar.listing
    where id = 'clio';

  if l is null then
    return;
  end if;

  ref_price := greatest(l.list_price - l.buyer_discount, 0);
  max_comm  := l.affiliate_commission;

  update salemycar.leads
     set sale_price        = ref_price,
         commission_amount = max_comm
   where status = 'closed_won'
     and (sale_price is null or commission_amount is null)
     and affiliate_id is not null;
end$$;
