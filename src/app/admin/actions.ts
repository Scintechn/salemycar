"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { supabaseAdmin, type LeadStatus } from "@/lib/supabase";
import { getListing } from "@/lib/listing";
import { computeCommission, referencePrice } from "@/lib/commission";

const STATUSES = [
  "new",
  "contacted",
  "test_drive",
  "closed_won",
  "closed_lost",
] as const satisfies readonly LeadStatus[];

const UpdateLeadSchema = z.object({
  id: z.uuid(),
  status: z.enum(STATUSES).optional(),
  notes: z.string().max(2000).optional(),
  commission_paid: z.boolean().optional(),
  sale_price: z.number().int().min(0).max(10_000_000).nullable().optional(),
  commission_amount: z
    .number()
    .int()
    .min(0)
    .max(10_000_000)
    .nullable()
    .optional(),
});

export async function updateLead(input: {
  id: string;
  status?: LeadStatus;
  notes?: string | null;
  commission_paid?: boolean;
  sale_price?: number | null;
  commission_amount?: number | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = UpdateLeadSchema.safeParse({
    id: input.id,
    status: input.status,
    notes: input.notes ?? undefined,
    commission_paid: input.commission_paid,
    sale_price: input.sale_price ?? undefined,
    commission_amount: input.commission_amount ?? undefined,
  });
  if (!parsed.success) {
    return { ok: false, error: "Invalid input." };
  }

  const patch: Record<string, unknown> = {};
  if (parsed.data.status !== undefined) patch.status = parsed.data.status;
  if (parsed.data.notes !== undefined) patch.notes = parsed.data.notes;
  if (parsed.data.commission_paid !== undefined) {
    patch.commission_paid = parsed.data.commission_paid;
  }
  if (parsed.data.sale_price !== undefined) {
    patch.sale_price = parsed.data.sale_price;
  }
  if (parsed.data.commission_amount !== undefined) {
    patch.commission_amount = parsed.data.commission_amount;
  }

  // When status flips to closed_won and the owner hasn't typed a sale price
  // yet, default sale_price to (list - discount) and commission to max.
  // This makes the common "no negotiation" case zero-click.
  if (parsed.data.status === "closed_won" && parsed.data.sale_price === undefined) {
    const listing = await getListing();
    const ref = referencePrice({
      listPrice: listing.list_price,
      buyerDiscount: listing.buyer_discount,
    });
    patch.sale_price = ref;
    patch.commission_amount = computeCommission({
      salePrice: ref,
      reference: ref,
      maxCommission: listing.affiliate_commission,
    });
  }

  if (Object.keys(patch).length === 0) return { ok: true };

  const { error } = await supabaseAdmin()
    .from("leads")
    .update(patch)
    .eq("id", parsed.data.id);

  if (error) {
    console.error("[admin.updateLead]", error);
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin");
  return { ok: true };
}
