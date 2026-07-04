export const defaultLocale = "es-mx" as const;
export type Locale = typeof defaultLocale;

// Contesto Shopify del mercato messicano (unico mercato supportato).
export const shopifyContext = { country: "MX", language: "ES" } as const;

// Codice BCP 47 usato per l'attributo lang e i metadati.
export const intlLocale = "es-MX";
