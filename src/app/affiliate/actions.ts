"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase";
import { generateRefCode, normalizePtWhatsapp } from "@/lib/codes";
import { tryWhatsApp, tryWhatsAppButtons } from "@/lib/whatsapp";
import {
  affiliateWelcome,
  affiliateWelcomeRich,
  ownerNewAffiliate,
} from "@/lib/messages";
import { owner, site } from "@/lib/config";
import { getListing } from "@/lib/listing";

const Schema = z.object({
  name: z.string().trim().min(2, "Indique o seu nome.").max(120),
  email: z.email("Email inválido."),
  whatsapp: z.string().trim().min(6, "Indique o seu WhatsApp."),
});

export type AffiliateFormState = {
  ok: boolean;
  errors?: {
    name?: string;
    email?: string;
    whatsapp?: string;
    form?: string;
  };
};

export async function submitAffiliate(
  _prev: AffiliateFormState,
  formData: FormData,
): Promise<AffiliateFormState> {
  const parsed = Schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    whatsapp: formData.get("whatsapp"),
  });
  if (!parsed.success) {
    const errors: AffiliateFormState["errors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof NonNullable<
        AffiliateFormState["errors"]
      >;
      if (key === "name" || key === "email" || key === "whatsapp") {
        errors[key] = issue.message;
      }
    }
    return { ok: false, errors };
  }

  const phone = normalizePtWhatsapp(parsed.data.whatsapp);
  if (!phone) {
    return {
      ok: false,
      errors: {
        whatsapp: "Número inválido. Use 9XXXXXXXX ou +351 9XXXXXXXX.",
      },
    };
  }

  const email = parsed.data.email.toLowerCase();
  const db = supabaseAdmin();

  let refCode = "";
  let inserted: { ref_code: string } | null = null;
  let lastError: unknown = null;
  for (let attempt = 0; attempt < 5; attempt++) {
    refCode = generateRefCode(parsed.data.name);
    const { data, error } = await db
      .from("affiliates")
      .insert({
        name: parsed.data.name,
        email,
        whatsapp: phone,
        ref_code: refCode,
      })
      .select("ref_code")
      .single();
    if (!error) {
      inserted = data as { ref_code: string };
      break;
    }
    lastError = error;
    if ((error as { code?: string }).code !== "23505") break;
  }

  if (!inserted) {
    console.error("[affiliate] insert failed:", lastError);
    return {
      ok: false,
      errors: { form: "Não foi possível criar o seu link. Tente novamente." },
    };
  }

  // Fire WhatsApp notifications (best-effort, never blocks the redirect).
  // The affiliate gets an interactive button message (Copy link / Open
  // dashboard); the platform owner gets plain text.
  const listing = await getListing();
  const refUrl = `${site.baseUrl}/?ref=${inserted.ref_code}`;
  const dashboardUrl = `${site.baseUrl}/affiliate/${inserted.ref_code}`;
  const richWelcome = affiliateWelcomeRich({
    name: parsed.data.name,
    refUrl,
    dashboardUrl,
    maxCommission: listing.affiliate_commission,
  });
  const textFallback = affiliateWelcome({
    name: parsed.data.name,
    refUrl,
    dashboardUrl,
    maxCommission: listing.affiliate_commission,
  });
  const ownerMsg = ownerNewAffiliate({
    name: parsed.data.name,
    whatsapp: phone,
    email,
    refCode: inserted.ref_code,
  });
  await Promise.all([
    tryWhatsAppButtons(phone, { ...richWelcome, fallbackText: textFallback }),
    owner.whatsapp ? tryWhatsApp(owner.whatsapp, ownerMsg) : Promise.resolve(),
  ]);

  redirect(`/affiliate/${inserted.ref_code}`);
}
