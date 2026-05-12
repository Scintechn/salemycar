import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatEUR } from "@/lib/config";
import { getListing, priceWithCode } from "@/lib/listing";

export const dynamic = "force-dynamic";

// Extract the first ~140 chars of the description as a hero tagline.
// Cut at the first sentence boundary when possible, otherwise word-safe.
function tagline(desc: string, max = 140): string {
  if (!desc) return "";
  const firstChunk = desc.split(/\n\s*\n/)[0].replace(/\s+/g, " ").trim();
  if (firstChunk.length <= max) return firstChunk;
  const periodAt = firstChunk.indexOf(". ");
  if (periodAt > 40 && periodAt <= max) return firstChunk.slice(0, periodAt + 1);
  const lastSpace = firstChunk.lastIndexOf(" ", max);
  return firstChunk.slice(0, lastSpace > 0 ? lastSpace : max).trim() + "…";
}

export default async function HomePage() {
  const car = await getListing();
  const finalPrice = priceWithCode(car);

  const hero = car.photos[0];
  const gallery = car.photos.slice(1, 5);
  const heroTagline = tagline(car.description);
  const showFullDescription = car.description.trim().length > heroTagline.length;

  return (
    <main className="flex-1">
      {/* ----- HERO ---------------------------------------------------- */}
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 md:grid-cols-[1.1fr_1fr] md:items-center md:py-16">
          {/* Image */}
          <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-200 to-zinc-300 shadow-sm">
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
          <div className="flex flex-col">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Anúncio particular
            </p>
            <h1 className="mt-3 text-3xl font-semibold leading-[1.1] tracking-tight md:text-[2.5rem]">
              {car.title}
            </h1>
            <p className="mt-1 text-lg text-zinc-500">{car.year}</p>

            {heroTagline ? (
              <p className="mt-5 text-[15px] leading-relaxed text-zinc-700">
                {heroTagline}
              </p>
            ) : null}

            {/* Key facts strip */}
            <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-zinc-700">
              <KeyFact label="km">{car.km.toLocaleString("pt-PT")}</KeyFact>
              <KeyFact label="combustível">{car.fuel}</KeyFact>
              <KeyFact label="caixa">{car.transmission}</KeyFact>
              <KeyFact label="potência">{car.power}</KeyFact>
            </ul>

            {/* Price + CTA */}
            <div className="mt-8 rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="text-3xl font-bold tracking-tight text-emerald-700 md:text-4xl">
                  {formatEUR(finalPrice)}
                </span>
                <span className="text-xs uppercase tracking-wide text-emerald-700">
                  com código
                </span>
              </div>
              <p className="mt-1 text-sm text-zinc-600">
                Sem código:{" "}
                <span className="font-medium text-zinc-800">
                  {formatEUR(car.list_price)}
                </span>
                <span className="ml-1 text-zinc-500">
                  (poupa {formatEUR(car.buyer_discount)} com código)
                </span>
              </p>
              <Link href="/interest" className="mt-4 block">
                <Button variant="success" size="lg" className="w-full">
                  Inicie o trato
                </Button>
              </Link>
              <p className="mt-3 text-center text-[11px] text-zinc-500">
                Resposta por WhatsApp no próprio dia. Sem intermediários.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Thumbnail strip */}
      {gallery.length > 0 ? (
        <section className="bg-white">
          <div className="mx-auto max-w-6xl px-6 pb-10">
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
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6">
            <p className="text-sm leading-relaxed text-zinc-700">
              Este anúncio é gerido diretamente pelo proprietário. Se chegou
              aqui através de um link de alguém conhecido, traz consigo um
              código de desconto de{" "}
              <strong>{formatEUR(car.buyer_discount)}</strong> ao submeter o
              seu contacto.
            </p>
          </div>

          {showFullDescription ? (
            <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6">
              <h2 className="text-lg font-semibold">Sobre este {car.title}</h2>
              <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-zinc-700">
                {car.description}
              </p>
            </div>
          ) : null}

          <div className="mt-6 grid gap-6 md:grid-cols-2">
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
              <Button variant="success" size="lg">
                Inicie o trato
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ----- FOOTER -------------------------------------------------- */}
      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-6 text-center text-xs text-zinc-500">
          Anúncio particular. Sem custos extra para o comprador.{" "}
          <Link href="/affiliate" className="underline hover:text-zinc-700">
            Seja Afiliado
          </Link>
        </div>
      </footer>
    </main>
  );
}

function KeyFact({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-baseline gap-1.5">
      <span className="font-semibold text-zinc-900">{children}</span>
      <span className="text-xs uppercase tracking-wide text-zinc-500">
        {label}
      </span>
    </li>
  );
}
