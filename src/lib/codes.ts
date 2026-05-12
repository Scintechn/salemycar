// Code generation helpers used by server actions.

const DISCOUNT_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I/L
const REF_ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";

function pick(alphabet: string, length: number): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

export function generateDiscountCode(): string {
  return pick(DISCOUNT_ALPHABET, 6);
}

export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24);
}

export function generateRefCode(name: string): string {
  const firstWord = name.trim().split(/\s+/)[0] ?? "user";
  const base = slugify(firstWord) || "user";
  return `${base}-${pick(REF_ALPHABET, 4)}`;
}

// PT mobile = 9XXXXXXXX (9 digits starting with 9). E.164 with +351.
// Accept either form on input; normalize to E.164 without "+" for storage.
export function normalizePtWhatsapp(input: string): string | null {
  const digits = input.replace(/\D+/g, "");
  if (/^9\d{8}$/.test(digits)) return `351${digits}`;
  if (/^351 ?9\d{8}$/.test(digits)) return digits;
  // Allow any other valid E.164 (8–15 digits) for non-PT numbers.
  if (/^[1-9]\d{7,14}$/.test(digits)) return digits;
  return null;
}
