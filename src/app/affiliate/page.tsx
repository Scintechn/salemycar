import Link from "next/link";
import { AffiliateForm } from "./affiliate-form";
import { formatEUR, pricing } from "@/lib/config";

export default function AffiliateSignupPage() {
  return (
    <main className="flex-1">
      <div className="mx-auto max-w-xl px-6 py-12">
        <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-800">
          ← Voltar ao anúncio
        </Link>

        <h1 className="mt-4 text-2xl font-semibold tracking-tight md:text-3xl">
          Programa de afiliados — Clio V 2022
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Tem alguém à procura de um carro? Inscreva-se e receba um link
          próprio. Por cada venda fechada a partir do seu link, recebe{" "}
          <strong>{formatEUR(pricing.affiliateCommission)}</strong>. Sem
          mensalidades, sem mínimos.
        </p>

        <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6">
          <AffiliateForm />
        </div>

        <p className="mt-6 text-xs text-zinc-500">
          Pagamento por MB Way ou transferência após escritura. Comissão paga
          pelo proprietário, sem qualquer custo para o comprador.
        </p>
      </div>
    </main>
  );
}
