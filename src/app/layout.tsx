import "@/styles/main.css";
import Cart from "@/components/cart/Cart";
import OpenCart from "@/components/cart/OpenCart";
import config from "@/config/config.json";
import theme from "@/config/theme.json";
import TwSizeIndicator from "@/helpers/TwSizeIndicator";
import { intlLocale } from "@/lib/i18n/config";
import Footer from "@/partials/Footer";
import Header from "@/partials/Header";
import Providers from "@/partials/Providers";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const messages = await getMessages();
  const cartTranslations = messages.cart as {
    openCartEmpty: string;
  };

  const pf = theme.fonts.font_family.primary;
  const sf = theme.fonts.font_family.secondary;

  return (
    <html suppressHydrationWarning={true} lang={intlLocale}>
      <head>
        {/* responsive meta */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5"
        />

        {/* favicon */}
        <link rel="shortcut icon" href={config.site.favicon} />
        {/* theme meta */}
        <meta name="theme-name" content="commerceplate" />
        <meta
          name="msapplication-TileColor"
          content={theme.colors.default.theme_color.primary}
        />
        <meta
          name="theme-color"
          media="(prefers-color-scheme: light)"
          content={theme.colors.default.theme_color.body}
        />

        {/* google font css */}
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href={`https://fonts.googleapis.com/css2?family=${pf}${
            sf ? "&family=" + sf : ""
          }&display=swap`}
          rel="stylesheet"
        />
      </head>

      <body suppressHydrationWarning={true}>
        <TwSizeIndicator />
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <Header
              cartFallback={
                <Link
                  href="/cart"
                  aria-label={cartTranslations.openCartEmpty}
                  className="relative inline-flex items-center justify-center"
                >
                  <OpenCart />
                </Link>
              }
              cartContent={<Cart />}
            />
            <main>{children}</main>
            <Footer />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
