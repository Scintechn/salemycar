import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin, type Lead } from "@/lib/supabase";
import { formatEUR, site } from "@/lib/config";
import { getListing } from "@/lib/listing";
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
      return "Trato fechado";
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
  const [{ data: affiliate }, listing] = await Promise.all([
    db
      .from("affiliates")
      .select("id, name, ref_code, created_at")
      .eq("ref_code", ref_code)
      .maybeSingle(),
    getListing(),
  ]);

  if (!affiliate) notFound();

  const { data: leadsRaw } = await db
    .from("leads")
    .select(
      "id, buyer_name, status, commission_amount, commission_paid, created_at",
    )
    .eq("affiliate_id", (affiliate as { id: string }).id)
    .order("created_at", { ascending: false });

  type LeadLite = Pick<
    Lead,
    | "id"
    | "buyer_name"
    | "status"
    | "commission_amount"
    | "commission_paid"
    | "created_at"
  >;
  const leads = (leadsRaw ?? []) as LeadLite[];

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

  // Sum actual snapshotted commission across all closed_won leads
  // (whether paid or not — it's still the affiliate's earnings to date).
  const earnedTotal = leads
    .filter((l) => l.status === "closed_won")
    .reduce(
      (sum, l) => sum + (l.commission_amount ?? listing.affiliate_commission),
      0,
    );

  const refUrl = `${site.baseUrl}/?ref=${(affiliate as { ref_code: string }).ref_code}`;
  const firstName = (affiliate as { name: string }).name.split(" ")[0];

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-800">
          ← Voltar ao anúncio
        </Link>

        <h1 className="mt-4 text-2xl font-semibold tracking-tight md:text-3xl">
          Olá, {firstName}
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Bónus máximo por trato fechado:{" "}
          <strong>{formatEUR(listing.affiliate_commission)}</strong>{" "}
          (proporcional ao preço final do trato).
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
          <Stat label="Total leads" value={total} />
          <Stat
            label="Em conversa"
            value={counts.contacted + counts.test_drive}
          />
          <Stat label="Tratos fechados" value={counts.closed_won} />
          <Stat label="Bónus" value={formatEUR(earnedTotal)} />
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
              {leads.map((lead) => {
                const isWon = lead.status === "closed_won";
                const amount =
                  lead.commission_amount ?? listing.affiliate_commission;
                return (
                  <li
                    key={lead.id}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
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
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          isWon
                            ? "bg-emerald-100 text-emerald-800"
                            : lead.status === "closed_lost"
                              ? "bg-zinc-100 text-zinc-500"
                              : "bg-zinc-100 text-zinc-700"
                        }`}
                      >
                        {statusLabel(lead.status)}
                      </span>
                      {isWon ? (
                        <span className="text-[11px] text-zinc-600">
                          {formatEUR(amount)}{" "}
                          {lead.commission_paid ? (
                            <span className="text-emerald-700">· pago</span>
                          ) : (
                            <span className="text-zinc-400">· a receber</span>
                          )}
                        </span>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <p className="mt-6 text-xs text-zinc-500">
          Pagamento por MB Way ou transferência após a escritura. O bónus
          escala proporcionalmente ao preço final do trato (regra de 3) e está
          limitado ao máximo configurado.
        </p>
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
