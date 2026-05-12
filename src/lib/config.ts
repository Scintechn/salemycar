// Pricing + owner config sourced from env vars. Defaults match SPEC.md so
// the app still renders sensibly in local dev if .env is incomplete.

function readInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : fallback;
}

export const pricing = {
  listPrice: readInt("NEXT_PUBLIC_LIST_PRICE", 15800),
  ownerNetTarget: readInt("OWNER_NET_TARGET", 15000),
  affiliateCommission: readInt("AFFILIATE_COMMISSION", 500),
  buyerDiscount: readInt("BUYER_DISCOUNT", 300),
};

export const priceWithCode = pricing.listPrice - pricing.buyerDiscount;

export const owner = {
  whatsapp: process.env.OWNER_WHATSAPP ?? "",
  firstName: process.env.NEXT_PUBLIC_OWNER_FIRST_NAME ?? "o proprietário",
};

export const site = {
  baseUrl:
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/+$/, "") ??
    "http://localhost:3000",
};

export function formatEUR(amount: number): string {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}
