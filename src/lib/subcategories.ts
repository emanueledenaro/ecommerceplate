/**
 * Sottocategorie merceologiche derivate dal Product Type di Shopify.
 *
 * Ogni prodotto ha un Product Type nel formato `<Funzione> para <Animale>`
 * (es. "Higiene para Gatos"). La sottocategoria è la parte prima di "para".
 * Così, dentro il mondo di un animale (collezione), possiamo filtrare per
 * funzione senza creare collezioni dedicate.
 */

// Ordine di presentazione dei chip (le sottocategorie non elencate finiscono in coda).
export const SUBCATEGORY_ORDER = [
  "Alimentación",
  "Higiene",
  "Salud",
  "Juguetes",
  "Jaulas",
  "Accesorios",
] as const;

// Emoji per sottocategoria (fallback: nessuna).
export const SUBCATEGORY_EMOJI: Record<string, string> = {
  Alimentación: "🍖",
  Higiene: "🧼",
  Salud: "💊",
  Juguetes: "🎾",
  Jaulas: "🏠",
  Accesorios: "🎀",
};

/** Ricava la sottocategoria dal Product Type ("Higiene para Gatos" → "Higiene"). */
export const getSubcategory = (productType?: string | null): string | null => {
  if (!productType) return null;
  const base = productType.split(/\s+para\s+/i)[0]?.trim();
  return base || null;
};

/** Sottocategorie presenti in una lista di prodotti, ordinate per presentazione. */
export const getAvailableSubcategories = (
  products: { productType?: string | null }[],
): string[] => {
  const present = new Set<string>();
  for (const product of products) {
    const sub = getSubcategory(product.productType);
    if (sub) present.add(sub);
  }

  const rank = (value: string) => {
    const index = SUBCATEGORY_ORDER.indexOf(
      value as (typeof SUBCATEGORY_ORDER)[number],
    );
    return index < 0 ? SUBCATEGORY_ORDER.length : index;
  };

  return [...present].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
};
