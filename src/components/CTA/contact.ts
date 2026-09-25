import { siteConfig } from "@/config/site";

/** Link do WhatsApp com mensagem pré-preenchida (número vem da configuração central). */
export function whatsappLink(message: string, number: string = siteConfig.whatsapp) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

/** "5519996441824" → "(19) 99644-1824". Sem formato reconhecido, devolve "+<dígitos>". */
export function formatPhoneBR(raw: string) {
  const digits = raw.replace(/\D/g, "");
  const local = digits.startsWith("55") && digits.length >= 12 ? digits.slice(2) : digits;
  if (local.length === 11) return `(${local.slice(0, 2)}) ${local.slice(2, 7)}-${local.slice(7)}`;
  if (local.length === 10) return `(${local.slice(0, 2)}) ${local.slice(2, 6)}-${local.slice(6)}`;
  return `+${digits}`;
}
