// PT-PT WhatsApp message templates for the two notifications fired on
// /interest submission. Keep them short and plain-text.

import { owner, pricing, priceWithCode, formatEUR } from "./config";

export function buyerConfirmation(opts: { buyerName: string; code: string }) {
  const ownerLink = `https://wa.me/${owner.whatsapp}?text=${encodeURIComponent(
    `Olá! Tenho o código ${opts.code} e tenho interesse no Clio.`,
  )}`;
  return (
    `Olá ${opts.buyerName}! Recebemos o seu interesse no Renault Clio V 2022.\n\n` +
    `O seu código de desconto: *${opts.code}* (vale ${formatEUR(pricing.buyerDiscount)} de desconto sobre ${formatEUR(pricing.listPrice)}).\n\n` +
    `Fale connosco diretamente por WhatsApp:\n${ownerLink}`
  );
}

export function ownerNewLead(opts: {
  buyerName: string;
  buyerWhatsapp: string;
  code: string;
  affiliateName: string | null;
}) {
  return (
    `🚗 Novo lead Clio\n\n` +
    `Comprador: ${opts.buyerName}\n` +
    `WhatsApp: +${opts.buyerWhatsapp}\n` +
    `Código: ${opts.code}\n` +
    `Afiliado: ${opts.affiliateName ?? "direto"}\n\n` +
    `Preço com código: ${formatEUR(priceWithCode)}`
  );
}
