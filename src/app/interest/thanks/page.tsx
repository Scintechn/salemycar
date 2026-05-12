import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatEUR, owner, pricing, priceWithCode } from "@/lib/config";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ code?: string }>;
}

export default async function ThanksPage({ searchParams }: Props) {
  const { code } = await searchParams;
  const safeCode = (code ?? "").replace(/[^A-Z0-9]/g, "").slice(0, 12);

  const waLink = owner.whatsapp
    ? `https://wa.me/${owner.whatsapp}?text=${encodeURIComponent(
        `Olá! Tenho o código ${safeCode} e tenho interesse no Clio.`,
      )}`
    : null;

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-xl px-6 py-16">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Obrigado! Recebemos os seus dados.
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          O proprietário vai contactá-lo por WhatsApp no próprio dia.
        </p>

        {safeCode ? (
          <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 text-center">
            <p className="text-sm text-zinc-500">O seu código de desconto</p>
            <p className="mt-2 font-mono text-3xl font-bold tracking-[0.25em] text-zinc-900">
              {safeCode}
            </p>
            <p className="mt-3 text-xs text-zinc-500">
              Vale {formatEUR(pricing.buyerDiscount)} sobre {formatEUR(pricing.listPrice)}.
              <br />
              Preço final com código:{" "}
              <strong className="text-zinc-800">
                {formatEUR(priceWithCode)}
              </strong>
            </p>
          </div>
        ) : null}

        {waLink ? (
          <div className="mt-6 flex justify-center">
            <a href={waLink} target="_blank" rel="noopener">
              <Button size="lg">Falar agora por WhatsApp</Button>
            </a>
          </div>
        ) : null}

        <div className="mt-10 text-center">
          <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-800">
            ← Voltar ao anúncio
          </Link>
        </div>
      </div>
    </main>
  );
}
