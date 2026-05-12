import Link from "next/link";
import { supabaseAdmin, type Affiliate, type Lead } from "@/lib/supabase";
import { formatEUR } from "@/lib/config";
import { getListing } from "@/lib/listing";
import { referencePrice } from "@/lib/commission";
import { LeadRow } from "./lead-row";

export const dynamic = "force-dynamic";

type AffiliateLite = Pick<Affiliate, "id" | "name" | "ref_code" | "whatsapp">;

export default async function AdminPage() {
  const db = supabaseAdmin();
  const listing = await getListing();
  const refPrice = referencePrice({
    listPrice: listing.list_price,
    buyerDiscount: listing.buyer_discount,
  });

  const [{ data: leadsRaw }, { data: affiliatesRaw }] = await Promise.all([
    db
      .from("leads")
      .select(
        "id, affiliate_id, buyer_name, buyer_whatsapp, discount_code, status, notes, commission_paid, sale_price, commission_amount, created_at, updated_at",
      )
      .order("created_at", { ascending: false }),
    db
      .from("affiliates")
      .select("id, name, ref_code, whatsapp")
      .order("created_at", { ascending: false }),
  ]);

  const leads = (leadsRaw ?? []) as Lead[];
  const affiliates = (affiliatesRaw ?? []) as AffiliateLite[];
  const affiliateById = new Map(affiliates.map((a) => [a.id, a]));

  // Per-affiliate aggregation. Commission is summed from the snapshotted
  // commission_amount on each closed_won lead so historical rate changes
  // don't retroactively rewrite payouts.
  const aggregate = new Map<
    string,
    { leads: number; won: number; owed: number }
  >();
  for (const lead of leads) {
    if (!lead.affiliate_id) continue;
    const cur = aggregate.get(lead.affiliate_id) ?? {
      leads: 0,
      won: 0,
      owed: 0,
    };
    cur.leads += 1;
    if (lead.status === "closed_won") {
      cur.won += 1;
      if (!lead.commission_paid) {
        cur.owed += lead.commission_amount ?? listing.affiliate_commission;
      }
    }
    aggregate.set(lead.affiliate_id, cur);
  }

  const totalLeads = leads.length;
  const totalWon = leads.filter((l) => l.status === "closed_won").length;
  const totalOwed = leads
    .filter(
      (l) =>
        l.status === "closed_won" && !l.commission_paid && l.affiliate_id,
    )
    .reduce(
      (sum, l) => sum + (l.commission_amount ?? listing.affiliate_commission),
      0,
    );

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              Admin
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              Painel do proprietário — {listing.title} {listing.year}
            </h1>
          </div>
          <div className="flex gap-3 text-sm">
            <Pill label="Leads" value={totalLeads} />
            <Pill label="Fechadas" value={totalWon} />
            <Pill label="A pagar" value={formatEUR(totalOwed)} />
          </div>
        </header>

        <nav className="mt-6 flex gap-3 text-sm">
          <Link
            href="/admin/listing"
            className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 font-medium text-zinc-800 hover:bg-zinc-50"
          >
            Editar anúncio →
          </Link>
          <Link
            href="/"
            target="_blank"
            className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-zinc-600 hover:bg-zinc-50"
          >
            Ver anúncio público
          </Link>
        </nav>

        {/* Commission rule reminder */}
        <p className="mt-4 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-600">
          Comissão máxima: <strong>{formatEUR(listing.affiliate_commission)}</strong>{" "}
          em vendas a <strong>{formatEUR(refPrice)}</strong> (preço de tabela
          menos desconto). Em negociações abaixo desse valor, a comissão escala
          proporcionalmente (regra de 3).
        </p>

        {/* Leads */}
        <section className="mt-10">
          <h2 className="text-lg font-semibold">Leads</h2>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-zinc-200 bg-white">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Comprador</th>
                  <th className="px-4 py-3">WhatsApp</th>
                  <th className="px-4 py-3">Código</th>
                  <th className="px-4 py-3">Afiliado</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Preço venda</th>
                  <th className="px-4 py-3">Notas</th>
                  <th className="px-4 py-3">Pago</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {leads.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-4 py-8 text-center text-zinc-500"
                    >
                      Ainda não há leads.
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => {
                    const aff = lead.affiliate_id
                      ? affiliateById.get(lead.affiliate_id)
                      : null;
                    return (
                      <LeadRow
                        key={lead.id}
                        lead={lead}
                        affiliateName={aff?.name ?? null}
                        affiliateWhatsapp={aff?.whatsapp ?? null}
                        referencePrice={refPrice}
                        maxCommission={listing.affiliate_commission}
                      />
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Affiliates */}
        <section className="mt-12">
          <h2 className="text-lg font-semibold">Afiliados</h2>
          <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">ref_code</th>
                  <th className="px-4 py-3">WhatsApp</th>
                  <th className="px-4 py-3 text-right">Leads</th>
                  <th className="px-4 py-3 text-right">Fechadas</th>
                  <th className="px-4 py-3 text-right">Comissão devida</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {affiliates.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-zinc-500"
                    >
                      Ainda não há afiliados.
                    </td>
                  </tr>
                ) : (
                  affiliates.map((aff) => {
                    const agg = aggregate.get(aff.id) ?? {
                      leads: 0,
                      won: 0,
                      owed: 0,
                    };
                    return (
                      <tr key={aff.id}>
                        <td className="px-4 py-3 font-medium">{aff.name}</td>
                        <td className="px-4 py-3 font-mono text-xs">
                          {aff.ref_code}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs">
                          +{aff.whatsapp}
                        </td>
                        <td className="px-4 py-3 text-right">{agg.leads}</td>
                        <td className="px-4 py-3 text-right">{agg.won}</td>
                        <td className="px-4 py-3 text-right">
                          {agg.owed > 0 ? (
                            <a
                              className="font-semibold text-emerald-700 underline"
                              href={`https://wa.me/${aff.whatsapp}?text=${encodeURIComponent(
                                `Olá ${aff.name.split(" ")[0]}, vou enviar-te ${formatEUR(agg.owed)} pela(s) venda(s) fechada(s) do Clio.`,
                              )}`}
                              target="_blank"
                              rel="noopener"
                            >
                              {formatEUR(agg.owed)}
                            </a>
                          ) : (
                            <span className="text-zinc-400">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

function Pill({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-right">
      <p className="text-[10px] uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <p className="font-semibold text-zinc-900">{value}</p>
    </div>
  );
}
