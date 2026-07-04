import config from "@/config/config.json";

const siteUrl = config.site.base_url.replace(/\/$/, "");

const normalizePathname = (pathname: string) => {
  const cleanedPathname = pathname.startsWith("/") ? pathname : `/${pathname}`;
  // Rimuove eventuali vecchi prefissi di mercato/lingua dagli URL.
  const withoutLocale = cleanedPathname.replace(
    /^\/(es-mx|mx|it|en)(?=\/|$)/,
    "",
  );

  return withoutLocale || "/";
};

export const getCanonicalUrl = (pathname = "/") => {
  const normalizedPathname = normalizePathname(pathname);

  return `${siteUrl}${normalizedPathname === "/" ? "" : normalizedPathname}`;
};

export const getMetadataAlternates = (pathname = "/") => ({
  canonical: getCanonicalUrl(pathname),
});
