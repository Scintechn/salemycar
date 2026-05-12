"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { supabaseAdmin, type LeadStatus } from "@/lib/supabase";

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
});

export async function updateLead(input: {
  id: string;
  status?: LeadStatus;
  notes?: string | null;
  commission_paid?: boolean;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = UpdateLeadSchema.safeParse({
    id: input.id,
    status: input.status,
    notes: input.notes ?? undefined,
    commission_paid: input.commission_paid,
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
