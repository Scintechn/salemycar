"use server";

import { z } from "zod";
import { sendWhatsApp } from "@/lib/whatsapp";
import { normalizePtWhatsapp } from "@/lib/codes";

const Schema = z.object({
  to: z.string().trim().min(6),
  text: z.string().trim().min(1).max(2000),
});

export type TestState = {
  ok: boolean;
  message?: string;
  error?: string;
};

export async function sendTest(
  _prev: TestState,
  formData: FormData,
): Promise<TestState> {
  const parsed = Schema.safeParse({
    to: formData.get("to"),
    text: formData.get("text"),
  });
  if (!parsed.success) {
    return { ok: false, error: "Inputs inválidos." };
  }

  const phone = normalizePtWhatsapp(parsed.data.to);
  if (!phone) {
    return { ok: false, error: "Número inválido. Use 9XXXXXXXX ou +351 9XXXXXXXX." };
  }

  const enabled = process.env.WHATSAPP_ENABLED === "true";
  if (!enabled) {
    return {
      ok: false,
      error:
        "WHATSAPP_ENABLED não está a true. Verifique a variável no Vercel e refaça o deploy.",
    };
  }

  const cfg = {
    apiUrl: process.env.EVOLUTION_API_URL,
    apiKey: process.env.EVOLUTION_API_KEY,
    instance: process.env.EVOLUTION_INSTANCE_NAME,
  };
  if (!cfg.apiUrl || !cfg.apiKey || !cfg.instance) {
    return {
      ok: false,
      error: `Faltam variáveis: ${[
        !cfg.apiUrl && "EVOLUTION_API_URL",
        !cfg.apiKey && "EVOLUTION_API_KEY",
        !cfg.instance && "EVOLUTION_INSTANCE_NAME",
      ]
        .filter(Boolean)
        .join(", ")}.`,
    };
  }

  try {
    await sendWhatsApp(phone, parsed.data.text);
    return {
      ok: true,
      message: `Mensagem enviada para +${phone} via instância "${cfg.instance}".`,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
