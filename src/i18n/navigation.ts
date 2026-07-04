// Il sito ha un solo locale (es-MX) senza routing localizzato:
// re-export delle API di navigazione native di Next.js.
export { default as Link } from "next/link";
export { redirect } from "next/navigation";
export { usePathname, useRouter } from "next/navigation";
