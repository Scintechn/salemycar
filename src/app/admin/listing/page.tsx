import Link from "next/link";
import { getListing } from "@/lib/listing";
import { pricing } from "@/lib/config";
import { ListingForm } from "./listing-form";
import { PhotoManager } from "./photo-manager";

export const dynamic = "force-dynamic";

export default async function AdminListingPage() {
  const listing = await getListing();

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/admin"
            className="text-sm text-zinc-500 hover:text-zinc-800"
          >
            ← Painel
          </Link>
          <Link
            href="/"
            target="_blank"
            className="text-sm text-zinc-500 hover:text-zinc-800"
          >
            Ver anúncio →
          </Link>
        </div>

        <h1 className="mt-4 text-2xl font-semibold tracking-tight md:text-3xl">
          Editar anúncio
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          As alterações são públicas imediatamente em <code>/</code>.
        </p>

        {/* Photos */}
        <section className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-semibold">Fotos</h2>
          <p className="mt-1 text-sm text-zinc-500">
            A primeira foto é usada como destaque. Tamanho máx. 5 MB por foto.
          </p>
          <PhotoManager photos={listing.photos} />
        </section>

        {/* Spec + price */}
        <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6">
          <ListingForm
            listing={listing}
            envDefaults={{
              list_price: pricing.listPrice,
              buyer_discount: pricing.buyerDiscount,
              affiliate_commission: pricing.affiliateCommission,
            }}
          />
        </section>
      </div>
    </main>
  );
}
