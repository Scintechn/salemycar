import Link from "next/link";
import { TestForm } from "./test-form";

export const dynamic = "force-dynamic";

export default function WhatsappTestPage() {
  const enabled = process.env.WHATSAPP_ENABLED === "true";
  const apiUrl = process.env.EVOLUTION_API_URL ?? "";
  const instance = process.env.EVOLUTION_INSTANCE_NAME ?? "";

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-xl px-6 py-10">
        <Link href="/admin" className="text-sm text-zinc-500 hover:text-zinc-800">
          ← Painel
        </Link>

        <h1 className="mt-4 text-2xl font-semibold tracking-tight md:text-3xl">
          Testar WhatsApp (Evolution API)
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Envia uma mensagem real através da instância configurada para
          confirmar que o pilot consegue notificar compradores e o proprietário.
        </p>

        <dl className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 text-sm">
          <Row label="WHATSAPP_ENABLED">
            <code
              className={
                enabled
                  ? "rounded bg-emerald-50 px-1.5 py-0.5 text-emerald-700"
                  : "rounded bg-red-50 px-1.5 py-0.5 text-red-700"
              }
            >
              {enabled ? "true" : "false"}
            </code>
          </Row>
          <Row label="EVOLUTION_API_URL">
            <code className="text-xs">{maskUrl(apiUrl)}</code>
          </Row>
          <Row label="EVOLUTION_INSTANCE_NAME">
            <code className="text-xs">{instance || "—"}</code>
          </Row>
        </dl>

        <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6">
          <TestForm
            defaultTo="351931852422"
            defaultText="Teste SaleMyCar — Evolution API ligado. Se recebeu esta mensagem, o pilot está pronto para notificar compradores e o proprietário a cada novo lead. ✓"
          />
        </div>
      </div>
    </main>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-100 py-2 last:border-b-0">
      <dt className="text-xs uppercase tracking-wide text-zinc-500">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function maskUrl(url: string): string {
  if (!url) return "—";
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.host}`;
  } catch {
    return "(inválido)";
  }
}
