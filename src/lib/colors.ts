/**
 * Mappa nome colore → hex per gli swatch delle varianti quando il prodotto
 * non ha un'immagine dedicata per quel colore. Copre spagnolo e inglese.
 */
const COLOR_HEX: Record<string, string> = {
  // Español
  rojo: "#EF4444",
  naranja: "#F97316",
  amarillo: "#F59E0B",
  verde: "#10B981",
  azul: "#3B82F6",
  celeste: "#38BDF8",
  rosa: "#EC4899",
  morado: "#A855F7",
  lila: "#C084FC",
  lavanda: "#B39DDB",
  negro: "#111827",
  blanco: "#F9FAFB",
  gris: "#6B7280",
  cafe: "#92400E",
  marron: "#92400E",
  beige: "#D4C5B9",
  dorado: "#D4AF37",
  plateado: "#C0C0C0",
  // English
  red: "#EF4444",
  orange: "#F97316",
  yellow: "#F59E0B",
  green: "#10B981",
  blue: "#3B82F6",
  pink: "#EC4899",
  purple: "#A855F7",
  black: "#111827",
  white: "#F9FAFB",
  gray: "#6B7280",
  grey: "#6B7280",
  brown: "#92400E",
};

/** Hex per un nome colore (accenti-insensibile); grigio neutro se sconosciuto. */
export const colorNameToHex = (name: string): string => {
  const key = name.toLowerCase().trim().normalize("NFD").replace(/[̀-ͯ]/g, "");
  return COLOR_HEX[key] || "#D1D5DB";
};
