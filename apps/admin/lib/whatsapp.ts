export function versWhatsapp(numero: string | null | undefined): string | null {
  if (!numero) return null;
  const chiffres = numero.replace(/\D/g, '');
  if (!chiffres) return null;
  return chiffres.startsWith('0') ? `213${chiffres.slice(1)}` : chiffres;
}