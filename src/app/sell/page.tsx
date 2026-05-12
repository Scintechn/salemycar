import Link from "next/link";
import { SellForm } from "./sell-form";

export const dynamic = "force-dynamic";

export default function SellPage() {
  return (
    <main className="flex-1">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-800">
          ← Voltar
        </Link>

        <h1 className="mt-4 text-2xl font-semibold tracking-tight md:text-3xl">
          Quer vender o seu carro pela SaleMyCar?
        </h1>
        <p className="mt-3 text-base text-zinc-600">
          De momento operamos com um anúncio de cada vez. Se quiser ser dos
          primeiros a publicar quando abrirmos a mais proprietários, deixe os
          seus dados — entramos em contacto consigo.
        </p>

        {/* How it will work */}
        <section className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Como funcionará
          </h2>
          <ol className="mt-5 grid gap-5 md:grid-cols-3">
            <Step
              n={1}
              title="Publica o anúncio"
              body="Foto, ficha técnica, preço pedido e desconto opcional para quem traz código."
            />
            <Step
              n={2}
              title="Rede de afiliados promove"
              body="Pessoas com quem confia partilham o seu link e enviam compradores qualificados."
            />
            <Step
              n={3}
              title="Você fecha a venda"
              body="Fala diretamente com o comprador. Paga uma comissão fixa só por venda fechada."
            />
          </ol>
        </section>

        {/* Form */}
        <section className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-semibold">Quero saber mais</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Levamos menos de 1 minuto a preencher. Contactamos por WhatsApp no
            próprio dia.
          </p>
          <div className="mt-5">
            <SellForm />
          </div>
        </section>

        <p className="mt-6 text-xs text-zinc-500">
          Os seus dados são usados apenas para responder a este pedido.
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
