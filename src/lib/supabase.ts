import { createClient } from "@supabase/supabase-js";

// All DB access from the app goes through this server-side client using the
// service role key. RLS is enabled on the tables but service_role bypasses
// it — keep this key on the server only.

const SCHEMA = process.env.SUPABASE_SCHEMA ?? "salemycar";

type AdminClient = ReturnType<typeof buildClient>;
let cached: AdminClient | null = null;

function buildClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY. Set them in .env.local (dev) or Vercel project env (prod).",
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    db: { schema: SCHEMA as never },
  });
}

export function supabaseAdmin(): AdminClient {
  if (!cached) cached = buildClient();
  return cached;
}

// ---- domain types (mirror supabase/schema.sql) ----------------------------
export type LeadStatus =
  | "new"
  | "contacted"
  | "test_drive"
  | "closed_won"
  | "closed_lost";

export interface Affiliate {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  ref_code: string;
  created_at: string;
}

export interface Lead {
  id: string;
  affiliate_id: string | null;
  buyer_name: string;
  buyer_whatsapp: string;
  discount_code: string;
  status: LeadStatus;
  notes: string | null;
  commission_paid: boolean;
  created_at: string;
  updated_at: string;
}
