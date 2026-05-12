// WhatsApp send via Evolution API (the same provider used by Scintechn/flowdeski).
// Self-hosted Baileys-based gateway. One instance is enough for this pilot —
// the owner's WhatsApp number is connected once via QR code on the Evolution
// server, and we just hit the sendText / sendButtons endpoints.
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

function isEnabled(): boolean {
  return process.env.WHATSAPP_ENABLED === "true";
}

// ---------------------------------------------------------------------------
// Plain text — POST /message/sendText/{instance}
// ---------------------------------------------------------------------------
export async function sendWhatsApp(to: string, message: string): Promise<void> {
  if (!isEnabled()) {
    console.log(
      `[whatsapp:disabled] would send to ${to}:\n${message}\n--- end ---`,
    );
    return;
  }

  const cfg = readConfig();
  if (!cfg) {
    console.warn(
      `[whatsapp:misconfigured] EVOLUTION_* vars missing. Would send to ${to}: ${message}`,
    );
    return;
  }

  const res = await fetch(
    `${cfg.apiUrl}/message/sendText/${cfg.instanceName}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: cfg.apiKey,
      },
      body: JSON.stringify({
        number: to.replace(/\D/g, ""),
        text: message,
      }),
      signal: AbortSignal.timeout(8000),
    },
  );

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Evolution API ${res.status}: ${body.slice(0, 200)}`);
  }
}

// ---------------------------------------------------------------------------
// Interactive button message — POST /message/sendButtons/{instance}
// (Same shape used by flowdeski's sendButtonMessage helper.)
// ---------------------------------------------------------------------------
export type WhatsAppButton =
  | { type: "url"; displayText: string; url: string }
  | { type: "copy"; displayText: string; copyCode: string }
  | { type: "call"; displayText: string; phoneNumber: string }
  | { type: "reply"; displayText: string; id: string };

export async function sendWhatsAppButtons(
  to: string,
  opts: {
    title: string;
    description: string;
    buttons: WhatsAppButton[];
    footer?: string;
  },
): Promise<void> {
  if (!isEnabled()) {
    console.log(
      `[whatsapp:disabled] would send button-message to ${to}:\n` +
        `  title:       ${opts.title}\n` +
        `  description: ${opts.description}\n` +
        `  buttons:     ${opts.buttons.map((b) => b.displayText).join(" | ")}\n` +
        (opts.footer ? `  footer:      ${opts.footer}\n` : "") +
        `--- end ---`,
    );
    return;
  }

  const cfg = readConfig();
  if (!cfg) {
    console.warn(
      `[whatsapp:misconfigured] EVOLUTION_* vars missing. Would send button-message to ${to}`,
    );
    return;
  }

  const res = await fetch(
    `${cfg.apiUrl}/message/sendButtons/${cfg.instanceName}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: cfg.apiKey,
      },
      body: JSON.stringify({
        number: to.replace(/\D/g, ""),
        title: opts.title,
        description: opts.description,
        footer: opts.footer ?? "",
        buttons: opts.buttons,
        delay: 1200,
      }),
      signal: AbortSignal.timeout(10000),
    },
  );

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Evolution API ${res.status}: ${body.slice(0, 200)}`);
  }
}

// ---------------------------------------------------------------------------
// Best-effort wrappers — never throw out of a server action.
// Button-message variant falls back to plain text if the buttons endpoint
// rejects (some Evolution versions / paired client types don't support
// interactive messages reliably).
// ---------------------------------------------------------------------------
export async function tryWhatsApp(to: string, message: string): Promise<void> {
  try {
    await sendWhatsApp(to, message);
  } catch (err) {
    console.error("[whatsapp] text send failed:", err);
  }
}

export async function tryWhatsAppButtons(
  to: string,
  opts: {
    title: string;
    description: string;
    buttons: WhatsAppButton[];
    footer?: string;
    /** Plain-text body sent if the buttons endpoint fails. */
    fallbackText: string;
  },
): Promise<void> {
  try {
    await sendWhatsAppButtons(to, {
      title: opts.title,
      description: opts.description,
      buttons: opts.buttons,
      footer: opts.footer,
    });
  } catch (err) {
    console.warn(
      "[whatsapp] buttons failed, falling back to text:",
      err instanceof Error ? err.message : err,
    );
    try {
      await sendWhatsApp(to, opts.fallbackText);
    } catch (err2) {
      console.error("[whatsapp] fallback text send also failed:", err2);
    }
  }
}
