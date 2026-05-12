import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SellThanksPage() {
  return (
    <main className="flex-1">
      <div className="mx-auto max-w-xl px-6 py-16">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Obrigado! Recebemos o seu pedido.
        </h1>
        <p className="mt-3 text-base text-zinc-600">
          Vamos contactá-lo por WhatsApp no próprio dia. Se quiser, pode também
          falar connosco diretamente — preferimos respostas rápidas para
          conhecer o seu carro.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/">
            <Button variant="secondary" size="lg">
              ← Voltar ao anúncio
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
