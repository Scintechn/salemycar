import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatEUR, pricing, priceWithCode } from "@/lib/config";

// Hardcoded for the single pilot listing. Refactor when the model is proven.
const car = {
  title: "Renault Clio V",
  year: 2022,
  km: 38500,
  fuel: "Gasolina",
  transmission: "Manual",
  power: "75 cv",
  color: "Cinzento Titânio",
  options: [
    "Ar condicionado automático",
    "Sensores de estacionamento traseiros",
    "Câmara de marcha-atrás",
    "Apple CarPlay / Android Auto",
    "Cruise control adaptativo",
    "Faróis LED",
    "Jantes em liga leve 16”",
    "2.º proprietário, livro de revisões na marca",
  ],
};

export default function HomePage() {
  return (
    <main className="flex-1">
      {/* ----- HERO ---------------------------------------------------- */}
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-12 md:flex-row md:items-center md:py-16">
          {/* Image */}
          <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-200 to-zinc-300 md:w-1/2">
            <div className="flex h-full items-center justify-center text-zinc-500">
              <span className="text-sm">Foto do Clio</span>
            </div>
          </div>

          {/* Copy */}
          <div className="md:w-1/2">
            <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
              Anúncio particular
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
              {car.title} — {car.year}
            </h1>
            <p className="mt-3 text-zinc-600">
              Particular. Sem comissões. Sem intermediários a inflar o preço.
            </p>

            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-4xl font-bold tracking-tight">
                {formatEUR(pricing.listPrice)}
              </span>
              <span className="text-sm text-zinc-500">preço de tabela</span>
            </div>

            <Link href="/interest" className="mt-6 inline-block">
              <Button size="lg">Tenho interesse</Button>
            </Link>

            <p className="mt-3 text-xs text-zinc-500">
              Com código de desconto: {formatEUR(priceWithCode)}
            </p>
          </div>
        </div>
      </section>

      {/* ----- BELOW THE FOLD ------------------------------------------ */}
      <section className="bg-zinc-50">
        <div className="mx-auto max-w-5xl px-6 py-12">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6">
            <p className="text-sm leading-relaxed text-zinc-700">
              Este anúncio é gerido diretamente pelo proprietário. Se chegou
              aqui através de um link de alguém conhecido, traz consigo um
              código de desconto de{" "}
              <strong>{formatEUR(pricing.buyerDiscount)}</strong> ao submeter o
              seu contacto.
            </p>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6">
              <h2 className="text-lg font-semibold">Ficha técnica</h2>
              <dl className="mt-4 grid grid-cols-2 gap-y-3 text-sm">
                <dt className="text-zinc-500">Ano</dt>
                <dd className="font-medium">{car.year}</dd>
                <dt className="text-zinc-500">Quilómetros</dt>
                <dd className="font-medium">
                  {car.km.toLocaleString("pt-PT")} km
                </dd>
                <dt className="text-zinc-500">Combustível</dt>
                <dd className="font-medium">{car.fuel}</dd>
                <dt className="text-zinc-500">Caixa</dt>
                <dd className="font-medium">{car.transmission}</dd>
                <dt className="text-zinc-500">Potência</dt>
                <dd className="font-medium">{car.power}</dd>
                <dt className="text-zinc-500">Cor</dt>
                <dd className="font-medium">{car.color}</dd>
              </dl>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-6">
              <h2 className="text-lg font-semibold">Equipamento</h2>
              <ul className="mt-4 space-y-2 text-sm text-zinc-700">
                {car.options.map((opt) => (
                  <li key={opt} className="flex gap-2">
                    <span className="text-zinc-400">•</span>
                    <span>{opt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-10 flex justify-center">
            <Link href="/interest">
              <Button size="lg">Tenho interesse</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ----- FOOTER -------------------------------------------------- */}
      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-6 text-center text-xs text-zinc-500">
          Anúncio particular. Não há comissão para o comprador.{" "}
          <Link href="/affiliate" className="underline hover:text-zinc-700">
            Sou afiliado
          </Link>
        </div>
      </footer>
    </main>
  );
}
