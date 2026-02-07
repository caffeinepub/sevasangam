export function normalizePhoneNumber(phone: string): string {
  return phone.replace(/\D/g, '');
}

export function createTelLink(phone: string): string {
  return `tel:${normalizePhoneNumber(phone)}`;
}

export function createWhatsAppLink(phone: string, message?: string): string {
  const normalized = normalizePhoneNumber(phone);
  const baseUrl = `https://wa.me/${normalized}`;
  if (message) {
    return `${baseUrl}?text=${encodeURIComponent(message)}`;
  }
  return baseUrl;
}
