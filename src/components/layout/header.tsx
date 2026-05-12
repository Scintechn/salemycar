import Link from "next/link";
import { Logo } from "@/components/brand/logo";

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-6">
        <Link href="/" aria-label="SaleMyCar — início">
          <Logo />
        </Link>

        <nav className="flex items-center gap-2 text-sm">
          <Link
            href="/affiliate"
            className="hidden rounded-md px-3 py-1.5 font-medium text-zinc-700 hover:bg-zinc-100 sm:inline-block"
          >
            Seja Afiliado
          </Link>
          <Link
            href="/sell"
            className="rounded-md bg-zinc-900 px-3 py-1.5 font-medium text-white hover:bg-zinc-800"
          >
            Anunciar o meu carro
          </Link>
        </nav>
      </div>
    </header>
  );
}
