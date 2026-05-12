import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatEUR } from "@/lib/config";
import { getListing, priceWithCode } from "@/lib/listing";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const car = await getListing();
  const finalPrice = priceWithCode(car);

  const hero = car.photos[0];
  const gallery = car.photos.slice(1, 5);

  return (
    <main className="flex-1">
      {/* ----- HERO ---------------------------------------------------- */}
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-12 md:flex-row md:items-center md:py-16">
          {/* Image */}
          <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-200 to-zinc-300 md:w-1/2">
            {hero ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={hero}
                alt={`${car.title} ${car.year}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-zinc-500">
                <span className="text-sm">Foto em breve</span>
              </div>
            )}
          </div>

          {/* Copy */}
          <div className="md:w-1/2">
            <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
              Anúncio particular
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
              {car.title} — {car.year}
            </h1>
            {car.description ? (
              <p className="mt-3 text-zinc-600">{car.description}</p>
            ) : null}

            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-4xl font-bold tracking-tight">
                {formatEUR(car.list_price)}
              </span>
              <span className="text-sm text-zinc-500">preço de tabela</span>
            </div>

            <Link href="/interest" className="mt-6 inline-block">
              <Button size="lg">Tenho interesse</Button>
            </Link>

            <p className="mt-3 text-xs text-zinc-500">
              Com código de desconto: {formatEUR(finalPrice)}
            </p>
          </div>
        </div>
      </section>

      {/* Thumbnail strip */}
      {gallery.length > 0 ? (
        <section className="bg-white">
          <div className="mx-auto max-w-5xl px-6 pb-10">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {gallery.map((src) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={src}
                  src={src}
                  alt=""
                  className="aspect-[4/3] w-full rounded-lg object-cover"
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ----- BELOW THE FOLD ------------------------------------------ */}
      <section className="bg-zinc-50">
        <div className="mx-auto max-w-5xl px-6 py-12">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6">
            <p className="text-sm leading-relaxed text-zinc-700">
              Este anúncio é gerido diretamente pelo proprietário. Se chegou
              aqui através de um link de alguém conhecido, traz consigo um
              código de desconto de{" "}
              <strong>{formatEUR(car.buyer_discount)}</strong> ao submeter o
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
              {car.options.length > 0 ? (
                <ul className="mt-4 space-y-2 text-sm text-zinc-700">
                  {car.options.map((opt) => (
                    <li key={opt} className="flex gap-2">
                      <span className="text-zinc-400">•</span>
                      <span>{opt}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-zinc-500">—</p>
              )}
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
