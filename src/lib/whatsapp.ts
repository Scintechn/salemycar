// WhatsApp send via Evolution API (the same provider used by Scintechn/flowdeski).
// Self-hosted Baileys-based gateway. One instance is enough for this pilot —
// the owner's WhatsApp number is connected once via QR code on the Evolution
// server, and we just hit the sendText endpoint.
//
// Env vars (set in .env.local for dev, Vercel project env for prod):
//   WHATSAPP_ENABLED         "true" to actually send, anything else = log only
//   EVOLUTION_API_URL        e.g. https://evo.example.com  (no trailing slash)
//   EVOLUTION_API_KEY        global / instance API key
//   EVOLUTION_INSTANCE_NAME  the instance connected to the owner's number

interface EvolutionConfig {
  apiUrl: string;
  apiKey: string;
  instanceName: string;
}

function readConfig(): EvolutionConfig | null {
  const apiUrl = process.env.EVOLUTION_API_URL?.replace(/\/+$/, "");
  const apiKey = process.env.EVOLUTION_API_KEY;
  const instanceName = process.env.EVOLUTION_INSTANCE_NAME;
  if (!apiUrl || !apiKey || !instanceName) return null;
  return { apiUrl, apiKey, instanceName };
}

export async function sendWhatsApp(to: string, message: string): Promise<void> {
  const enabled = process.env.WHATSAPP_ENABLED === "true";

  if (!enabled) {
    console.log(
      `[whatsapp:disabled] would send to ${to}:\n${message}\n--- end ---`,
    );
    return;
  }

  const cfg = readConfig();
  if (!cfg) {
    console.warn(
      `[whatsapp:misconfigured] WHATSAPP_ENABLED=true but EVOLUTION_API_URL / EVOLUTION_API_KEY / EVOLUTION_INSTANCE_NAME are missing. Would send to ${to}: ${message}`,
    );
    return;
  }

  const number = to.replace(/\D/g, "");
  const res = await fetch(
    `${cfg.apiUrl}/message/sendText/${cfg.instanceName}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: cfg.apiKey,
      },
      body: JSON.stringify({ number, text: message }),
      // Keep this fast so server actions don't stall on a slow gateway.
      signal: AbortSignal.timeout(8000),
    },
  );

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Evolution API ${res.status}: ${body.slice(0, 200)}`);
  }
}

// Best-effort wrapper used by server actions. Never throws — a failed
// WhatsApp send must never block the lead from being saved.
export async function tryWhatsApp(to: string, message: string): Promise<void> {
  try {
    await sendWhatsApp(to, message);
  } catch (err) {
    console.error("[whatsapp] send failed:", err);
  }
}
