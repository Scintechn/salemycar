// Proportional commission helper.
//
// Rule: the configured affiliate_commission is the MAX. It applies in full
// when the buyer pays the expected price after code redemption
// (= list_price - buyer_discount). If the seller negotiates lower, the
// commission scales down proportionally (rule of 3). If the sale closes at
// or above the reference price, the commission is capped at the max.
//
// All amounts are integer euros (no cents) to stay consistent with the rest
// of the app and avoid floating-point payout drift.

export function referencePrice(opts: {
  listPrice: number;
  buyerDiscount: number;
}): number {
  return Math.max(0, opts.listPrice - opts.buyerDiscount);
}

export function computeCommission(opts: {
  salePrice: number;
  reference: number;
  maxCommission: number;
}): number {
  const { salePrice, reference, maxCommission } = opts;
  if (maxCommission <= 0) return 0;
  if (reference <= 0) return 0;
  const ratio = Math.min(1, Math.max(0, salePrice / reference));
  return Math.round(maxCommission * ratio);
}
