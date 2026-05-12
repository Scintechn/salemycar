// Loader for the single editable car listing. The /admin/listing page edits
// this row; / and /interest read from it. If the DB row is missing (e.g. in
// local dev before the migration is run) we fall back to the hardcoded
// values so the public site never 500s.

import { supabaseAdmin } from "./supabase";
import { pricing as envPricing } from "./config";

export interface Listing {
  id: "clio";
  title: string;
  year: number;
  km: number;
  fuel: string;
  transmission: string;
  power: string;
  color: string;
  description: string;
  options: string[];
  photos: string[];
  list_price: number;       // resolved (DB override or env default)
  buyer_discount: number;
  affiliate_commission: number;
}

const FALLBACK: Listing = {
  id: "clio",
  title: "Renault Clio V",
  year: 2022,
  km: 38500,
  fuel: "Gasolina",
  transmission: "Manual",
  power: "75 cv",
  color: "Cinzento Titânio",
  description: "Particular. Sem comissões. Sem intermediários a inflar o preço.",
  options: [
    "Ar condicionado automático",
    "Sensores de estacionamento traseiros",
    "Câmara de marcha-atrás",
    "Apple CarPlay / Android Auto",
    "Cruise control adaptativo",
    "Faróis LED",
    "Jantes em liga leve 16\"",
    "2.º proprietário, livro de revisões na marca",
  ],
  photos: [],
  list_price: envPricing.listPrice,
  buyer_discount: envPricing.buyerDiscount,
  affiliate_commission: envPricing.affiliateCommission,
};

type Row = {
  title: string;
  year: number;
  km: number;
  fuel: string;
  transmission: string;
  power: string;
  color: string;
  description: string;
  options: string[];
  photos: string[];
  list_price: number | null;
  buyer_discount: number | null;
  affiliate_commission: number | null;
};

export async function getListing(): Promise<Listing> {
  try {
    const { data } = await supabaseAdmin()
      .from("listing")
      .select(
        "title, year, km, fuel, transmission, power, color, description, options, photos, list_price, buyer_discount, affiliate_commission",
      )
      .eq("id", "clio")
      .maybeSingle();
    if (!data) return FALLBACK;
    const row = data as unknown as Row;
    return {
      id: "clio",
      title: row.title,
      year: row.year,
      km: row.km,
      fuel: row.fuel,
      transmission: row.transmission,
      power: row.power,
      color: row.color,
      description: row.description,
      options: row.options ?? [],
      photos: row.photos ?? [],
      list_price: row.list_price ?? envPricing.listPrice,
      buyer_discount: row.buyer_discount ?? envPricing.buyerDiscount,
      affiliate_commission:
        row.affiliate_commission ?? envPricing.affiliateCommission,
    };
  } catch (err) {
    console.warn("[listing] read failed, using fallback:", err);
    return FALLBACK;
  }
}

export function priceWithCode(l: Listing): number {
  return Math.max(0, l.list_price - l.buyer_discount);
}
