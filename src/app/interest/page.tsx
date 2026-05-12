import Link from "next/link";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase";
import { formatEUR, pricing, priceWithCode } from "@/lib/config";
import { InterestForm } from "./interest-form";

export const dynamic = "force-dynamic";

export default async function InterestPage() {
  // Show referrer name if we have a valid affiliate cookie — gives the buyer
  // confidence about where the discount is coming from.
  const refCookie = (await cookies()).get("affiliate_ref")?.value;
  let referrerName: string | null = null;
  if (refCookie) {
    const { data } = await supabaseAdmin()
      .from("affiliates")
      .select("name")
      .eq("ref_code", refCookie)
      .maybeSingle();
    if (data) referrerName = (data as { name: string }).name.split(" ")[0];
  }

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-xl px-6 py-12">
        <Link
          href="/"
          className="text-sm text-zinc-500 hover:text-zinc-800"
        >
          ← Voltar ao anúncio
        </Link>

        <h1 className="mt-4 text-2xl font-semibold tracking-tight md:text-3xl">
          Tenho interesse no Clio
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Deixe os seus dados. O proprietário entra em contacto por WhatsApp no
          próprio dia. Os seus dados são usados apenas para esta venda.
        </p>

        {referrerName ? (
          <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
            Está a vir através de <strong>{referrerName}</strong>. Vai receber
            um código de desconto de{" "}
            <strong>{formatEUR(pricing.buyerDiscount)}</strong> — preço final{" "}
            <strong>{formatEUR(priceWithCode)}</strong>.
          </div>
        ) : (
          <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-4 text-sm text-zinc-700">
            Submete e recebe no WhatsApp um código de desconto de{" "}
            <strong>{formatEUR(pricing.buyerDiscount)}</strong> sobre o preço de
            tabela.
          </div>
        )}

        <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6">
          <InterestForm />
        </div>
      </div>
    </main>
  );
}
