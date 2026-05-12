"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase";
import { normalizePtWhatsapp } from "@/lib/codes";
import { tryWhatsApp } from "@/lib/whatsapp";
import { owner } from "@/lib/config";

const Schema = z.object({
  name: z.string().trim().min(2, "Indique o seu nome.").max(120),
  email: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((v) => (v ? v : undefined))
    .refine(
      (v) => v === undefined || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      "Email inválido.",
    ),
  whatsapp: z.string().trim().min(6, "Indique o seu WhatsApp."),
  car_brief: z.string().trim().max(200).optional(),
  message: z.string().trim().max(2000).optional(),
});

export type OwnerInterestState = {
  ok: boolean;
  errors?: {
    name?: string;
    email?: string;
    whatsapp?: string;
    car_brief?: string;
    message?: string;
    form?: string;
  };
};

export async function submitOwnerInterest(
  _prev: OwnerInterestState,
  formData: FormData,
): Promise<OwnerInterestState> {
  const parsed = Schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email") || undefined,
    whatsapp: formData.get("whatsapp"),
    car_brief: formData.get("car_brief") || undefined,
    message: formData.get("message") || undefined,
  });
  if (!parsed.success) {
    const errors: OwnerInterestState["errors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof NonNullable<
        OwnerInterestState["errors"]
      >;
      if (key in ({} as NonNullable<OwnerInterestState["errors"]>) || key) {
        errors[key] = issue.message;
      }
    }
    return { ok: false, errors };
  }

  const phone = normalizePtWhatsapp(parsed.data.whatsapp);
  if (!phone) {
    return {
      ok: false,
      errors: { whatsapp: "Número inválido. Use 9XXXXXXXX ou +351 9XXXXXXXX." },
    };
  }

  const { error } = await supabaseAdmin().from("owner_interest").insert({
    name: parsed.data.name,
    email: parsed.data.email?.toLowerCase() ?? null,
    whatsapp: phone,
    car_brief: parsed.data.car_brief ?? null,
    message: parsed.data.message ?? null,
  });

  if (error) {
    console.error("[sell] insert failed:", error);
    return {
      ok: false,
      errors: { form: "Não conseguimos guardar o seu pedido. Tente de novo." },
    };
  }

  // Notify platform owner so they can follow up fast while interest is hot.
  if (owner.whatsapp) {
    const msg =
      `🚗 Novo interesse de proprietário\n\n` +
      `Nome: ${parsed.data.name}\n` +
      `WhatsApp: +${phone}\n` +
      (parsed.data.email ? `Email: ${parsed.data.email}\n` : "") +
      (parsed.data.car_brief ? `Carro: ${parsed.data.car_brief}\n` : "") +
      (parsed.data.message ? `\nMensagem:\n${parsed.data.message}\n` : "");
    await tryWhatsApp(owner.whatsapp, msg);
  }

  redirect("/sell/thanks");
}
