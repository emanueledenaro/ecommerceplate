import config from "./src/config/config.json" with { type: "json" };

const siteUrl = (process.env.SITE_URL || config.site.base_url).replace(
  /\/$/,
  "",
);

/** @type {import('next-sitemap').IConfig} */
const sitemapConfig = {
  siteUrl,
  generateRobotsTxt: true,
};

export default sitemapConfig;
