"use client";

import { useState, useTransition } from "react";
import type { Lead, LeadStatus } from "@/lib/supabase";
import { updateLead } from "./actions";
import { formatEUR } from "@/lib/config";
import { computeCommission } from "@/lib/commission";

const STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: "new", label: "Novo" },
  { value: "contacted", label: "Contactado" },
  { value: "test_drive", label: "Test drive" },
  { value: "closed_won", label: "Trato fechado" },
  { value: "closed_lost", label: "Não fechou" },
];

interface Props {
  lead: Lead;
  affiliateName: string | null;
  affiliateWhatsapp: string | null;
  referencePrice: number;
  maxCommission: number;
}

export function LeadRow({
  lead,
  affiliateName,
  affiliateWhatsapp,
  referencePrice,
  maxCommission,
}: Props) {
  const [status, setStatus] = useState<LeadStatus>(lead.status);
  const [notes, setNotes] = useState(lead.notes ?? "");
  const [paid, setPaid] = useState(lead.commission_paid);
  const [salePriceText, setSalePriceText] = useState(
    lead.sale_price != null ? String(lead.sale_price) : "",
  );
  const [commission, setCommission] = useState<number | null>(
    lead.commission_amount,
  );
  const [pending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<number | null>(null);

  function flash() {
    setSavedAt(Date.now());
    setTimeout(() => setSavedAt(null), 1200);
  }

  function save(patch: Parameters<typeof updateLead>[0]) {
    startTransition(async () => {
      const res = await updateLead(patch);
      if (res.ok) flash();
    });
  }

  const date = new Date(lead.created_at).toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "2-digit",
  });

  const isClosed = status === "closed_won";

  function onSalePriceBlur() {
    if (!isClosed) return;
    const parsed = salePriceText === "" ? null : Number(salePriceText);
    if (parsed !== null && !Number.isFinite(parsed)) return;
    if (parsed === lead.sale_price) return;
    const next =
      parsed === null
        ? null
        : computeCommission({
            salePrice: parsed,
            reference: referencePrice,
            maxCommission,
          });
    setCommission(next);
    save({ id: lead.id, sale_price: parsed, commission_amount: next });
  }

  return (
    <tr className={pending ? "opacity-60" : ""}>
      <td className="whitespace-nowrap px-4 py-3 text-xs text-zinc-500">
        {date}
      </td>
      <td className="px-4 py-3">
        <p className="font-medium">{lead.buyer_name}</p>
        {savedAt ? (
          <p className="text-[10px] text-emerald-600">guardado ✓</p>
        ) : null}
      </td>
      <td className="px-4 py-3">
        <a
          className="font-mono text-xs text-zinc-700 hover:text-zinc-900 hover:underline"
          href={`https://wa.me/${lead.buyer_whatsapp}`}
          target="_blank"
          rel="noopener"
        >
          +{lead.buyer_whatsapp}
        </a>
      </td>
      <td className="px-4 py-3 font-mono text-xs">{lead.discount_code}</td>
      <td className="px-4 py-3 text-xs">
        {affiliateName ? (
          <div>
            <p className="font-medium">{affiliateName}</p>
            {isClosed && commission != null && !paid && affiliateWhatsapp ? (
              <a
                className="mt-0.5 inline-block text-emerald-700 underline"
                href={`https://wa.me/${affiliateWhatsapp}?text=${encodeURIComponent(
                  `Olá ${affiliateName.split(" ")[0]}, vou enviar-te ${formatEUR(commission)} pelo trato fechado do Clio.`,
                )}`}
                target="_blank"
                rel="noopener"
              >
                Pagar {formatEUR(commission)}
              </a>
            ) : null}
          </div>
        ) : (
          <span className="text-zinc-400">direto</span>
        )}
      </td>
      <td className="px-4 py-3">
        <select
          value={status}
          onChange={(e) => {
            const next = e.target.value as LeadStatus;
            setStatus(next);
            save({ id: lead.id, status: next });
          }}
          className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </td>
      <td className="px-4 py-3">
        {isClosed ? (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1">
              <span className="text-xs text-zinc-500">€</span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={salePriceText}
                onChange={(e) => setSalePriceText(e.target.value)}
                onBlur={onSalePriceBlur}
                placeholder={String(referencePrice)}
                className="w-24 rounded-md border border-zinc-300 bg-white px-1.5 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>
            {commission != null ? (
              <span className="text-[10px] text-zinc-500">
                bónus {formatEUR(commission)}
              </span>
            ) : null}
          </div>
        ) : (
          <span className="text-xs text-zinc-300">—</span>
        )}
      </td>
      <td className="px-4 py-3">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => {
            if ((lead.notes ?? "") !== notes) {
              save({ id: lead.id, notes });
            }
          }}
          rows={2}
          className="min-w-[160px] rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900"
          placeholder="—"
        />
      </td>
      <td className="px-4 py-3 text-center">
        <input
          type="checkbox"
          checked={paid}
          disabled={!isClosed}
          onChange={(e) => {
            const next = e.target.checked;
            setPaid(next);
            save({ id: lead.id, commission_paid: next });
          }}
          className="h-4 w-4 accent-zinc-900"
        />
      </td>
    </tr>
  );
}
