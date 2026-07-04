import { createRequire } from "node:module";
import createNextIntlPlugin from "next-intl/plugin";

const require = createRequire(import.meta.url);
const config = require("./src/config/config.json");

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  basePath: config.base_path !== "/" ? config.base_path : "",
  trailingSlash: config.site.trailing_slash,
  transpilePackages: ["next-mdx-remote"],
  output: "standalone",
  outputFileTracingIncludes: {
    "/**": ["src/content/**/*"],
  },
  async redirects() {
    // Vecchi prefissi di mercato/lingua: il sito ora vive senza prefisso.
    return ["es-mx", "mx", "it", "en"].flatMap((prefix) => [
      { source: `/${prefix}`, destination: "/", permanent: true },
      { source: `/${prefix}/:path*`, destination: "/:path*", permanent: true },
    ]);
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.shopify.com", pathname: "/**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
    ],
  },
  eslint: { ignoreDuringBuilds: true },
};

export default withNextIntl(nextConfig);
