# salemycar — Affiliate Referral Pilot (Renault Clio V 2022)

One-car pilot to validate an affiliate referral model. The owner keeps the car;
affiliates promote it with a unique link; buyers redeem a discount code; the
affiliate gets a fixed commission on closed sales.

Built per `SPEC.md.pdf`. Tech stack is locked: Next.js 16 (App Router, TS) +
Tailwind v4 + Supabase + Vercel. WhatsApp via Evolution API (same provider as
`Scintechn/flowdeski`).

---

## Routes

| Route                      | What it does                                             |
| -------------------------- | -------------------------------------------------------- |
| `/`                        | Hardcoded Clio listing. `?ref=xxx` → 30-day httpOnly cookie. |
| `/interest`                | Buyer lead form (name + WhatsApp). Server action inserts a `lead`, generates a 6-char `discount_code`, fires 2 WhatsApp messages (buyer + owner). |
| `/interest/thanks?code=X`  | Confirmation with discount code + wa.me CTA.             |
| `/affiliate`               | Affiliate signup. Generates `name-xxxx` `ref_code`.      |
| `/affiliate/[ref_code]`    | Semi-public dashboard: their link, counts, lead list.    |
| `/admin`                   | Owner panel. HTTP Basic Auth on `ADMIN_USER` / `ADMIN_PASSWORD`. Edit lead status, notes, mark commission paid. |

---

## Pricing (env-tunable)

| Env var                       | Default | Meaning                          |
| ----------------------------- | ------: | -------------------------------- |
| `NEXT_PUBLIC_LIST_PRICE`      |  15800  | Public list price                |
| `OWNER_NET_TARGET`            |  15000  | What the owner keeps             |
| `AFFILIATE_COMMISSION`        |    500  | Per closed sale                  |
| `BUYER_DISCOUNT`              |    300  | Off list when code redeemed      |

Buyer with code pays `LIST_PRICE - BUYER_DISCOUNT` (= €15,500).

---

## First-time setup (one developer, ~15 minutes)

### 1. Supabase — run the schema

The Supabase project is shared with other systems, so our objects live in a
**dedicated `salemycar` schema** (not `public`).

1. Open Supabase → project `supabase-green-yacht` → SQL editor.
2. Paste and run `supabase/schema.sql`.
3. Open **Project Settings → API → Exposed schemas** and add `salemycar` to the
   list (alongside `public`). Save.
4. Copy the **service_role** key from **Project Settings → API → service_role**
   (NOT the anon key) — needed for server actions to bypass RLS.

### 2. Local dev

```bash
cp .env.example .env.local
# Then edit .env.local — at minimum set:
#   SUPABASE_SERVICE_ROLE_KEY=<from Supabase dashboard>
#   ADMIN_PASSWORD=<strong password>
#   OWNER_WHATSAPP=351XXXXXXXXX     (no +)
#   NEXT_PUBLIC_OWNER_FIRST_NAME=<owner's name>

npm install
npm run dev
# open http://localhost:3000
```

### 3. WhatsApp (Evolution API)

While `WHATSAPP_ENABLED=false`, lead submissions still work — message bodies
are logged to the server console and the lead is saved.

To enable real sends:

1. Connect the owner's WhatsApp number to your Evolution instance via QR (one
   time, on the Evolution dashboard).
2. Set in `.env.local` (and later in Vercel):
   ```
   WHATSAPP_ENABLED=true
   EVOLUTION_API_URL=https://your-evolution-host
   EVOLUTION_API_KEY=...
   EVOLUTION_INSTANCE_NAME=salemycar
   ```

The Evolution pattern used here matches `Scintechn/flowdeski`:
`POST {url}/message/sendText/{instance}` with `apikey` header and
`{ number, text }` body. See `src/lib/whatsapp.ts`.

---

## Deploy to Vercel

The repo on GitHub is **Scintechn/salemycar**. Vercel auto-deploys `main`.

```bash
# from the project root, signed in as development@scintechn.com:
vercel link          # link to Scintechn org / salemycar project (create if needed)
vercel env add SUPABASE_URL production           # paste the Supabase URL
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SCHEMA production         # value: salemycar
vercel env add NEXT_PUBLIC_LIST_PRICE production  # 15800
vercel env add OWNER_NET_TARGET production        # 15000
vercel env add AFFILIATE_COMMISSION production    # 500
vercel env add BUYER_DISCOUNT production          # 300
vercel env add OWNER_WHATSAPP production          # 351XXXXXXXXX
vercel env add NEXT_PUBLIC_OWNER_FIRST_NAME production
vercel env add ADMIN_USER production              # owner
vercel env add ADMIN_PASSWORD production
vercel env add WHATSAPP_ENABLED production        # false at first
vercel env add EVOLUTION_API_URL production
vercel env add EVOLUTION_API_KEY production
vercel env add EVOLUTION_INSTANCE_NAME production # salemycar
vercel env add NEXT_PUBLIC_BASE_URL production    # https://<domain>.vercel.app

git push origin main    # triggers production build
```

Or use the **Vercel dashboard → Import Project → GitHub → Scintechn/salemycar**
and paste the variables into Settings → Environment Variables. Either path
works.

---

## Acceptance checklist (per SPEC)

1. ☐ `/` shows the Clio listing with photos and €15,800.
2. ☐ `/affiliate` signup → land on `/affiliate/{ref_code}` with a unique URL.
3. ☐ Visiting `/?ref={my_code}` sets the cookie. Submitting `/interest`
      creates a lead linked to the affiliate.
4. ☐ Buyer receives WhatsApp with code (or console log if disabled).
5. ☐ Owner receives WhatsApp with new lead (or console log if disabled).
6. ☐ `/admin` (HTTP Basic Auth) — change a lead to `closed_won`, see
      "€500 owed to {affiliate}".
7. ☐ Deployed to a public Vercel URL with all env vars set.

---

## Project structure

```
src/
  app/
    page.tsx                       — landing
    layout.tsx                     — root html + body
    globals.css                    — tailwind v4 entry
    interest/
      page.tsx                     — buyer lead form
      interest-form.tsx            — client component
      actions.ts                   — submitInterest server action
      thanks/page.tsx              — confirmation
    affiliate/
      page.tsx                     — signup
      affiliate-form.tsx           — client component
      actions.ts                   — submitAffiliate server action
      [ref_code]/
        page.tsx                   — dashboard
        copy-button.tsx            — client copy-to-clipboard
    admin/
      page.tsx                     — leads + affiliates tables
      lead-row.tsx                 — editable row (status/notes/paid)
      actions.ts                   — updateLead server action
  components/ui/
    button.tsx, input.tsx, card.tsx
  lib/
    config.ts                      — pricing/owner/site from env
    supabase.ts                    — service-role client + types
    codes.ts                       — discount/ref code generators
    whatsapp.ts                    — Evolution API client
    messages.ts                    — PT-PT message templates
    utils.ts                       — cn() helper
  proxy.ts                         — ref cookie + /admin Basic Auth
supabase/
  schema.sql                       — run once in Supabase SQL editor
```

---

## Out of scope (per SPEC — do NOT add to this pilot)

Multi-car listings, Stripe / payment automation, email, SMS, OAuth, leaderboards,
i18n beyond PT-PT, mobile app, image uploads, audit log, GDPR cookie banner
(one-liner privacy notice on forms is fine for pilot), unit tests.

## Legal note

Pilot only. Before publicly marketing affiliate signup, resolve: (a) affiliate
tax setup (recibos verdes, Cat. B), (b) full RGPD compliance (cookie banner,
privacy policy URL, data retention), (c) intermediary tax treatment.
