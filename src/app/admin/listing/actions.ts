"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase";

const BUCKET = "salemycar";
// Capped at 4 MB so we stay inside Next's serverActions body limit
// (see next.config.ts) and below Vercel's ~4.5 MB infra ceiling.
const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

// ---------------------------------------------------------------------------
// Save spec + price fields. Photos are managed by the upload/delete actions
// below so this server action only touches text/number columns.
// ---------------------------------------------------------------------------
const SaveSchema = z.object({
  title: z.string().trim().min(1).max(120),
  year: z.coerce.number().int().min(1900).max(2100),
  km: z.coerce.number().int().min(0).max(2000000),
  fuel: z.string().trim().max(40),
  transmission: z.string().trim().max(40),
  power: z.string().trim().max(40),
  color: z.string().trim().max(60),
  description: z.string().trim().max(2000),
  options: z.string().max(4000),                  // newline-separated
  list_price: z.coerce.number().int().min(0).max(10_000_000).optional(),
  buyer_discount: z.coerce.number().int().min(0).max(10_000_000).optional(),
  affiliate_commission: z.coerce
    .number()
    .int()
    .min(0)
    .max(10_000_000)
    .optional(),
});

export type SaveState = { ok: boolean; error?: string; savedAt?: number };

export async function saveListing(
  _prev: SaveState,
  formData: FormData,
): Promise<SaveState> {
  const raw = {
    title: formData.get("title"),
    year: formData.get("year"),
    km: formData.get("km"),
    fuel: formData.get("fuel"),
    transmission: formData.get("transmission"),
    power: formData.get("power"),
    color: formData.get("color"),
    description: formData.get("description"),
    options: formData.get("options") ?? "",
    list_price: blankToUndef(formData.get("list_price")),
    buyer_discount: blankToUndef(formData.get("buyer_discount")),
    affiliate_commission: blankToUndef(formData.get("affiliate_commission")),
  };

  const parsed = SaveSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Inválido." };
  }

  const options = parsed.data.options
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  const { error } = await supabaseAdmin()
    .from("listing")
    .upsert({
      id: "clio",
      title: parsed.data.title,
      year: parsed.data.year,
      km: parsed.data.km,
      fuel: parsed.data.fuel,
      transmission: parsed.data.transmission,
      power: parsed.data.power,
      color: parsed.data.color,
      description: parsed.data.description,
      options,
      list_price: parsed.data.list_price ?? null,
      buyer_discount: parsed.data.buyer_discount ?? null,
      affiliate_commission: parsed.data.affiliate_commission ?? null,
    });

  if (error) {
    console.error("[admin.saveListing]", error);
    return { ok: false, error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/interest");
  revalidatePath("/admin/listing");
  return { ok: true, savedAt: Date.now() };
}

function blankToUndef(v: FormDataEntryValue | null): string | undefined {
  if (v === null) return undefined;
  const s = String(v).trim();
  return s === "" ? undefined : s;
}

// ---------------------------------------------------------------------------
// Photo upload — accepts one or more files, pushes them into Supabase Storage
// (public bucket "salemycar"), then appends the public URLs to listing.photos.
// ---------------------------------------------------------------------------
export type UploadState = {
  ok: boolean;
  added?: number;
  error?: string;
  savedAt?: number;
};

export async function uploadPhotos(
  _prev: UploadState,
  formData: FormData,
): Promise<UploadState> {
  const files = formData.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) return { ok: false, error: "Escolha pelo menos uma foto." };

  const db = supabaseAdmin();

  // Read current photos so we can append.
  const { data: existing } = await db
    .from("listing")
    .select("photos")
    .eq("id", "clio")
    .maybeSingle();
  const current = (existing as { photos?: string[] } | null)?.photos ?? [];

  const newUrls: string[] = [];
  for (const file of files) {
    if (file.size > MAX_BYTES) {
      return { ok: false, error: `"${file.name}" excede 4 MB.` };
    }
    if (file.type && !ALLOWED_MIME.has(file.type)) {
      return { ok: false, error: `"${file.name}" tipo não suportado.` };
    }

    const ext = guessExt(file);
    const path = `listing/${Date.now()}-${randomToken()}.${ext}`;

    const { error: upErr } = await db.storage
      .from(BUCKET)
      .upload(path, file, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });
    if (upErr) {
      console.error("[admin.uploadPhotos] storage:", upErr);
      return { ok: false, error: upErr.message };
    }

    const { data: pub } = db.storage.from(BUCKET).getPublicUrl(path);
    newUrls.push(pub.publicUrl);
  }

  const { error: updErr } = await db
    .from("listing")
    .upsert({ id: "clio", photos: [...current, ...newUrls] });
  if (updErr) {
    console.error("[admin.uploadPhotos] update:", updErr);
    return { ok: false, error: updErr.message };
  }

  revalidatePath("/");
  revalidatePath("/admin/listing");
  return { ok: true, added: newUrls.length, savedAt: Date.now() };
}

function guessExt(file: File): string {
  const m = file.type.match(/^image\/(\w+)/);
  if (m) return m[1] === "jpeg" ? "jpg" : m[1];
  const name = file.name.toLowerCase();
  const dot = name.lastIndexOf(".");
  if (dot >= 0) return name.slice(dot + 1);
  return "jpg";
}

function randomToken(): string {
  return Math.random().toString(36).slice(2, 10);
}

// ---------------------------------------------------------------------------
// Photo delete — removes one URL from listing.photos AND deletes the file
// from Storage. Tolerant: if the Storage delete fails (e.g. URL is external),
// the DB row still gets updated.
// ---------------------------------------------------------------------------
export async function deletePhoto(url: string): Promise<{ ok: boolean }> {
  const db = supabaseAdmin();

  const { data: existing } = await db
    .from("listing")
    .select("photos")
    .eq("id", "clio")
    .maybeSingle();
  const current = (existing as { photos?: string[] } | null)?.photos ?? [];
  const next = current.filter((u) => u !== url);

  const { error: updErr } = await db
    .from("listing")
    .upsert({ id: "clio", photos: next });
  if (updErr) {
    console.error("[admin.deletePhoto] update:", updErr);
    return { ok: false };
  }

  // Best-effort Storage delete (only for URLs we own).
  const prefix = `${process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`;
  if (url.startsWith(prefix)) {
    const path = url.slice(prefix.length);
    try {
      await db.storage.from(BUCKET).remove([path]);
    } catch (err) {
      console.warn("[admin.deletePhoto] storage remove failed:", err);
    }
  }

  revalidatePath("/");
  revalidatePath("/admin/listing");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Reorder photos — used by drag handle later. Right now: move-up / move-down.
// ---------------------------------------------------------------------------
export async function reorderPhotos(order: string[]): Promise<{ ok: boolean }> {
  const db = supabaseAdmin();
  const { error } = await db
    .from("listing")
    .upsert({ id: "clio", photos: order });
  if (error) {
    console.error("[admin.reorderPhotos]", error);
    return { ok: false };
  }
  revalidatePath("/");
  revalidatePath("/admin/listing");
  return { ok: true };
}
