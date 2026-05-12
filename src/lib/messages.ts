// PT-PT WhatsApp message templates. All pricing-aware templates accept
// the live amounts as parameters so they reflect /admin/listing edits
// instead of env-var defaults.

import { owner, formatEUR } from "./config";
import type { WhatsAppButton } from "./whatsapp";

// ---------------------------------------------------------------------------
// Buyer flow — /interest submission
// ---------------------------------------------------------------------------
export function buyerConfirmation(opts: {
  buyerName: string;
  code: string;
  listPrice: number;
  buyerDiscount: number;
  carTitle: string;
}) {
  const ownerLink = `https://wa.me/${owner.whatsapp}?text=${encodeURIComponent(
    `Olá! Tenho o código ${opts.code} e tenho interesse no ${opts.carTitle}.`,
  )}`;
  const finalPrice = Math.max(0, opts.listPrice - opts.buyerDiscount);
  return (
    `Olá ${opts.buyerName}! Recebemos o seu interesse no *${opts.carTitle}*.\n\n` +
    `O seu código de desconto: *${opts.code}*\n` +
    `Vale ${formatEUR(opts.buyerDiscount)} de desconto sobre ${formatEUR(opts.listPrice)} — preço final ${formatEUR(finalPrice)}.\n\n` +
    `Fale connosco diretamente por WhatsApp:\n${ownerLink}`
  );
}

export function ownerNewLead(opts: {
  buyerName: string;
  buyerWhatsapp: string;
  code: string;
  affiliateName: string | null;
  listPrice: number;
  buyerDiscount: number;
}) {
  const finalPrice = Math.max(0, opts.listPrice - opts.buyerDiscount);
  return (
    `🚗 Novo lead SaleMyCar\n\n` +
    `Comprador: ${opts.buyerName}\n` +
    `WhatsApp: +${opts.buyerWhatsapp}\n` +
    `Código: ${opts.code}\n` +
    `Afiliado: ${opts.affiliateName ?? "direto"}\n\n` +
    `Preço com código: ${formatEUR(finalPrice)}`
  );
}

// ---------------------------------------------------------------------------
// Affiliate flow — /affiliate signup
// ---------------------------------------------------------------------------
export function affiliateWelcome(opts: {
  name: string;
  refUrl: string;
  dashboardUrl: string;
  maxCommission: number;
}) {
  const firstName = opts.name.split(/\s+/)[0];
  return (
    `Olá ${firstName}! 🎉 Já é afiliado SaleMyCar.\n\n` +
    `*O seu link para partilhar:*\n${opts.refUrl}\n\n` +
    `Por cada trato fechado a partir deste link recebe até *${formatEUR(opts.maxCommission)}* (proporcional ao preço final).\n\n` +
    `Acompanhe os seus leads aqui:\n${opts.dashboardUrl}\n\n` +
    `Pagamento por MB Way ou transferência após escritura. Boa partilha!`
  );
}

// Rich (button-message) version of the same welcome. Description carries
// the URL too so it stays useful if the recipient's WhatsApp client doesn't
// render the interactive buttons.
export interface RichMessage {
  title: string;
  description: string;
  footer: string;
  buttons: WhatsAppButton[];
}

export function affiliateWelcomeRich(opts: {
  name: string;
  refUrl: string;
  dashboardUrl: string;
  maxCommission: number;
}): RichMessage {
  const firstName = opts.name.split(/\s+/)[0];
  return {
    title: `Bem-vindo, ${firstName} 🎉`,
    description:
      `Já é afiliado SaleMyCar.\n\n` +
      `O seu link para partilhar:\n${opts.refUrl}\n\n` +
      `Por cada trato fechado a partir deste link recebe até ${formatEUR(opts.maxCommission)} (proporcional ao preço final). Pagamento por MB Way ou transferência após escritura.`,
    footer: "SaleMyCar — programa de afiliados",
    buttons: [
      { type: "copy", displayText: "Copiar o meu link", copyCode: opts.refUrl },
      { type: "url", displayText: "Ver o meu painel", url: opts.dashboardUrl },
    ],
  };
}

export function ownerNewAffiliate(opts: {
  name: string;
  whatsapp: string;
  email: string;
  refCode: string;
}) {
  return (
    `🤝 Novo afiliado SaleMyCar\n\n` +
    `Nome: ${opts.name}\n` +
    `WhatsApp: +${opts.whatsapp}\n` +
    `Email: ${opts.email}\n` +
    `Código: ${opts.refCode}`
  );
}

// ---------------------------------------------------------------------------
// Prospective owner flow — /sell submission
// ---------------------------------------------------------------------------
export function ownerInterestConfirm(opts: {
  name: string;
  carBrief: string | null;
}) {
  const firstName = opts.name.split(/\s+/)[0];
  return (
    `Olá ${firstName}! Recebemos o seu pedido para anunciar${opts.carBrief ? ` o ${opts.carBrief}` : " um carro"} na SaleMyCar.\n\n` +
    `Vamos contactá-lo brevemente por aqui para conversar sobre o anúncio e os próximos passos. Se preferir, pode também responder a esta mensagem com qualquer dúvida.`
  );
}
