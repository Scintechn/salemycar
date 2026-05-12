"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { z } from "zod";
import { supabaseAdmin, type Affiliate } from "@/lib/supabase";
import { generateDiscountCode, normalizePtWhatsapp } from "@/lib/codes";
import { tryWhatsApp } from "@/lib/whatsapp";
import { buyerConfirmation, ownerNewLead } from "@/lib/messages";
import { owner } from "@/lib/config";
import { getListing } from "@/lib/listing";

const Schema = z.object({
  buyer_name: z
    .string()
    .trim()
    .min(2, "Indique o seu nome completo.")
    .max(120, "Nome demasiado longo."),
  buyer_whatsapp: z.string().trim().min(6, "Indique o seu WhatsApp."),
});

export type LeadFormState = {
  ok: boolean;
  errors?: { buyer_name?: string; buyer_whatsapp?: string; form?: string };
};

export async function submitInterest(
  _prev: LeadFormState,
  formData: FormData,
): Promise<LeadFormState> {
  // 1. Validate inputs
  const parsed = Schema.safeParse({
    buyer_name: formData.get("buyer_name"),
    buyer_whatsapp: formData.get("buyer_whatsapp"),
  });
  if (!parsed.success) {
    const fieldErrors: LeadFormState["errors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof NonNullable<LeadFormState["errors"]>;
      if (key === "buyer_name" || key === "buyer_whatsapp") {
        fieldErrors[key] = issue.message;
      }
    }
    return { ok: false, errors: fieldErrors };
  }

  const normalizedPhone = normalizePtWhatsapp(parsed.data.buyer_whatsapp);
  if (!normalizedPhone) {
    return {
      ok: false,
      errors: {
        buyer_whatsapp:
          "Número inválido. Use formato 9XXXXXXXX ou +351 9XXXXXXXX.",
      },
    };
  }

  const db = supabaseAdmin();

  // 2. Look up affiliate via ref cookie
  const refCookie = (await cookies()).get("affiliate_ref")?.value;
  type AffiliateLite = Pick<Affiliate, "id" | "name" | "whatsapp">;
  let affiliate: AffiliateLite | null = null;
  if (refCookie) {
    const { data } = await db
      .from("affiliates")
      .select("id, name, whatsapp")
      .eq("ref_code", refCookie)
      .maybeSingle();
    if (data) affiliate = data as unknown as AffiliateLite;
  }

  // 3. Generate unique discount code (retry on collision)
  let discountCode = "";
  let inserted = null;
  let lastError: unknown = null;
  for (let attempt = 0; attempt < 5; attempt++) {
    discountCode = generateDiscountCode();
    const { data, error } = await db
      .from("leads")
      .insert({
        affiliate_id: affiliate?.id ?? null,
        buyer_name: parsed.data.buyer_name,
        buyer_whatsapp: normalizedPhone,
        discount_code: discountCode,
        status: "new",
      })
      .select("id, discount_code")
      .single();

    if (!error) {
      inserted = data;
      break;
    }
    lastError = error;
    // 23505 = unique_violation → try a new code
    if ((error as { code?: string }).code !== "23505") break;
  }

  if (!inserted) {
    console.error("[interest] insert failed:", lastError);
    return {
      ok: false,
      errors: {
        form: "Não foi possível registar o seu contacto. Tente novamente em instantes.",
      },
    };
  }

  // 4. Fire WhatsApp messages (best-effort, never blocks). Pull live pricing
  // + title from the listing row so messages reflect /admin/listing edits.
  const listing = await getListing();
  const buyerMsg = buyerConfirmation({
    buyerName: parsed.data.buyer_name,
    code: inserted.discount_code,
    listPrice: listing.list_price,
    buyerDiscount: listing.buyer_discount,
    carTitle: `${listing.title} ${listing.year}`,
  });
  const ownerMsg = ownerNewLead({
    buyerName: parsed.data.buyer_name,
    buyerWhatsapp: normalizedPhone,
    code: inserted.discount_code,
    affiliateName: affiliate?.name ?? null,
    listPrice: listing.list_price,
    buyerDiscount: listing.buyer_discount,
  });
  await Promise.all([
    tryWhatsApp(normalizedPhone, buyerMsg),
    owner.whatsapp ? tryWhatsApp(owner.whatsapp, ownerMsg) : Promise.resolve(),
  ]);

  // 5. Redirect to thank-you page
  redirect(`/interest/thanks?code=${encodeURIComponent(inserted.discount_code)}`);
}
