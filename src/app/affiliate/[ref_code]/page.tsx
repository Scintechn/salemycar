import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin, type Lead } from "@/lib/supabase";
import { formatEUR, pricing, site } from "@/lib/config";
import { CopyLinkButton } from "./copy-button";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ ref_code: string }>;
}

function statusLabel(status: Lead["status"]): string {
  switch (status) {
    case "new":
      return "Novo";
    case "contacted":
      return "Contactado";
    case "test_drive":
      return "Test drive";
    case "closed_won":
      return "Venda fechada";
    case "closed_lost":
      return "Não fechou";
  }
}

function shortBuyerName(full: string): string {
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

export default async function AffiliateDashboardPage({ params }: Props) {
  const { ref_code } = await params;

  const db = supabaseAdmin();
  const { data: affiliate } = await db
    .from("affiliates")
    .select("id, name, ref_code, created_at")
    .eq("ref_code", ref_code)
    .maybeSingle();

  if (!affiliate) notFound();

  const { data: leadsRaw } = await db
    .from("leads")
    .select("id, buyer_name, status, created_at")
    .eq("affiliate_id", (affiliate as { id: string }).id)
    .order("created_at", { ascending: false });

  const leads = (leadsRaw ?? []) as Pick<
    Lead,
    "id" | "buyer_name" | "status" | "created_at"
  >[];

  const total = leads.length;
  const counts = leads.reduce<Record<Lead["status"], number>>(
    (acc, l) => {
      acc[l.status] = (acc[l.status] ?? 0) + 1;
      return acc;
    },
    {
      new: 0,
      contacted: 0,
      test_drive: 0,
      closed_won: 0,
      closed_lost: 0,
    },
  );
  const owed = counts.closed_won * pricing.affiliateCommission;
  const refUrl = `${site.baseUrl}/?ref=${(affiliate as { ref_code: string }).ref_code}`;

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-800">
          ← Voltar ao anúncio
        </Link>

        <h1 className="mt-4 text-2xl font-semibold tracking-tight md:text-3xl">
          Olá, {(affiliate as { name: string }).name.split(" ")[0]}
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Comissão por venda fechada:{" "}
          <strong>{formatEUR(pricing.affiliateCommission)}</strong>. Pagamento
          por MB Way ou transferência após escritura.
        </p>

        {/* Referral URL */}
        <section className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6">
          <h2 className="text-sm font-medium text-zinc-500">O seu link</h2>
          <p className="mt-2 break-all font-mono text-sm">{refUrl}</p>
          <div className="mt-4">
            <CopyLinkButton url={refUrl} />
          </div>
        </section>

        {/* Counts */}
        <section className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="Total" value={total} />
          <Stat label="Contactados" value={counts.contacted + counts.test_drive + counts.closed_won + counts.closed_lost} />
          <Stat label="Fechadas" value={counts.closed_won} />
          <Stat label="Comissão acumulada" value={formatEUR(owed)} />
        </section>

        {/* Leads list */}
        <section className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-semibold">Os seus leads</h2>
          {leads.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-600">
              Ainda não há leads. Partilhe o seu link para começar.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-zinc-100">
              {leads.map((lead) => (
                <li
                  key={lead.id}
                  className="flex items-center justify-between py-3"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {shortBuyerName(lead.buyer_name)}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {new Date(lead.created_at).toLocaleDateString("pt-PT", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700">
                    {statusLabel(lead.status)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-zinc-900">{value}</p>
    </div>
  );
}
