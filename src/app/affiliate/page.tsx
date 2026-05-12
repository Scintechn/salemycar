import Link from "next/link";
import { AffiliateForm } from "./affiliate-form";
import { formatEUR } from "@/lib/config";
import { getListing } from "@/lib/listing";
import { referencePrice } from "@/lib/commission";

export const dynamic = "force-dynamic";

export default async function AffiliateSignupPage() {
  const listing = await getListing();
  const refPrice = referencePrice({
    listPrice: listing.list_price,
    buyerDiscount: listing.buyer_discount,
  });
  const maxComm = listing.affiliate_commission;

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-800">
          ← Voltar ao anúncio
        </Link>

        <h1 className="mt-4 text-2xl font-semibold tracking-tight md:text-3xl">
          Recomende e receba um bónus
        </h1>
        <p className="mt-2 text-base text-zinc-600">
          Tem alguém à procura de um carro? Inscreva-se e receba um link
          próprio. Por cada trato fechado a partir do seu link, recebe até{" "}
          <strong>{formatEUR(maxComm)}</strong>.
        </p>

        {/* ----- HOW IT WORKS BANNER ----- */}
        <section className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Como funciona
          </h2>
          <ol className="mt-5 grid gap-5 md:grid-cols-3">
            <Step
              n={1}
              title="Inscreva-se"
              body="30 segundos. Nome, email, WhatsApp. Sem mensalidades, sem mínimos."
            />
            <Step
              n={2}
              title="Partilhe o seu link"
              body="Receba um link único. Quem clicar e submeter interesse fica ligado a si."
            />
            <Step
              n={3}
              title="Receba o seu bónus"
              body={`Até ${formatEUR(maxComm)} por trato fechado. Pagamento por MB Way ou transferência após escritura.`}
            />
          </ol>
        </section>

        {/* ----- COMMISSION RULES ----- */}
        <section className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-emerald-900">
            Como é calculado o bónus
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-emerald-900">
            O bónus máximo é <strong>{formatEUR(maxComm)}</strong>, aplicado em
            tratos a <strong>{formatEUR(refPrice)}</strong> (preço de tabela de{" "}
            {formatEUR(listing.list_price)} menos o desconto de{" "}
            {formatEUR(listing.buyer_discount)} aplicado pelo código).
          </p>
          <p className="mt-2 text-sm leading-relaxed text-emerald-900">
            Se houver negociação e o trato fechar por um valor inferior, o
            bónus escala proporcionalmente (regra de 3). Exemplo: se o trato
            fechar a {formatEUR(Math.round(refPrice * 0.97))}, o bónus é de{" "}
            {formatEUR(Math.round(maxComm * 0.97))}.
          </p>
        </section>

        {/* ----- SIGNUP FORM ----- */}
        <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-semibold">Inscreva-se</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Recebe o seu link na próxima página.
          </p>
          <div className="mt-5">
            <AffiliateForm />
          </div>
        </div>

        <p className="mt-6 text-xs text-zinc-500">
          Bónus pago pelo proprietário, sem qualquer custo para o comprador.
          Anúncio particular — para informações sobre fiscalidade dos
          recebimentos como afiliado, consulte o proprietário antes do primeiro
          trato fechado.
        </p>
      </div>
    </main>
  );
}

function Step({
  n,
  title,
  body,
}: {
  n: number;
  title: string;
  body: string;
}) {
  return (
    <li className="flex flex-col gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white">
        {n}
      </span>
      <h3 className="text-base font-semibold text-zinc-900">{title}</h3>
      <p className="text-sm leading-relaxed text-zinc-600">{body}</p>
    </li>
  );
}
