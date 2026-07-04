import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { cookies } from "next/headers";
import Price from "@/components/Price";
import { DeleteItemButton } from "@/components/cart/DeleteItemButton";
import { EditItemQuantityButton } from "@/components/cart/EditItemQuantityButton";
import { DEFAULT_OPTION } from "@/lib/constants";
import { getCart } from "@/lib/shopify";
import type { Cart, CartItem } from "@/lib/shopify/types";
import { createUrl } from "@/lib/utils";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { shopifyContext } from "@/lib/i18n/config";
import { getMetadataAlternates } from "@/lib/i18n/metadata";

type MerchandiseSearchParams = {
  [key: string]: string;
};

export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getTranslations("cart");

  return {
    title: t("yourCart"),
    description: t("cartDescription"),
    alternates: getMetadataAlternates("/cart"),
  };
};

const buildMerchandiseUrl = (item: CartItem) => {
  const merchandiseSearchParams = {} as MerchandiseSearchParams;

  item.merchandise.selectedOptions.forEach(({ name, value }) => {
    if (value !== DEFAULT_OPTION) {
      merchandiseSearchParams[name.toLowerCase()] = value;
    }
  });

  return createUrl(
    `/products/${item.merchandise.product.handle}`,
    new URLSearchParams(merchandiseSearchParams),
  );
};

const EmptyCartState = ({
  translations,
}: {
  translations: {
    yourCart: string;
    emptyTitle: string;
    emptyDescription: string;
    goToCatalog: string;
  };
}) => (
  <section className="container py-24">
    <div className="mx-auto max-w-xl rounded-2xl border border-border/60 bg-light/70 p-10 text-center shadow-sm  ">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/80 ">
        {translations.yourCart}
      </p>
      <h1 className="mt-4 text-3xl font-semibold text-text-dark ">
        {translations.emptyTitle}
      </h1>
      <p className="mt-3 text-text-light ">{translations.emptyDescription}</p>
      <Link
        href="/products"
        className="btn btn-primary mt-8 inline-flex rounded-full px-6 py-3 text-sm"
      >
        {translations.goToCatalog}
      </Link>
    </div>
  </section>
);

const CartLine = ({ item }: { item: CartItem }) => {
  const merchandiseUrl = buildMerchandiseUrl(item);
  const options = item.merchandise.selectedOptions.filter(
    ({ value }) => value !== DEFAULT_OPTION,
  );

  return (
    <li className="rounded-2xl border border-border/60 bg-body p-4 shadow-sm  ">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <Link
          href={merchandiseUrl}
          className="relative h-24 w-24 flex-none overflow-hidden rounded-2xl border border-border/50 bg-light/80  "
        >
          <Image
            src={
              item.merchandise.product.featuredImage?.url ||
              "/images/product_image404.jpg"
            }
            alt={item.merchandise.title}
            fill
            className="object-cover"
          />
        </Link>

        <div className="flex-1 space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <Link
                href={merchandiseUrl}
                className="text-lg font-semibold text-text-dark transition hover:text-primary  "
              >
                {item.merchandise.product.title}
              </Link>
              {options.length ? (
                <ul className="text-sm text-text-light ">
                  {options.map(({ name, value }) => (
                    <li key={name}>
                      {name}: {value}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
            <Price
              className="text-base font-semibold text-text-dark "
              amount={item.cost.totalAmount.amount}
              currencyCode={item.cost.totalAmount.currencyCode}
            />
          </div>

          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 rounded-full border border-border/50 bg-light/60 px-2 py-1  ">
              <EditItemQuantityButton item={item} type="minus" />
              <span className="min-w-[28px] text-center text-sm font-semibold text-text-dark ">
                {item.quantity}
              </span>
              <EditItemQuantityButton item={item} type="plus" />
            </div>
            <DeleteItemButton item={item} />
          </div>
        </div>
      </div>
    </li>
  );
};

const CartSummary = ({
  cart,
  translations,
}: {
  cart: Cart;
  translations: {
    orderSummary: string;
    subtotal: string;
    taxes: string;
    shipping: string;
    shippingCalculated: string;
    total: string;
    proceedToCheckout: string;
    securePayment: string;
  };
}) => (
  <aside className="rounded-2xl border border-border/60 bg-body p-6 shadow-sm  ">
    <h2 className="text-lg font-semibold text-text-dark ">
      {translations.orderSummary}
    </h2>
    <div className="mt-4 space-y-3 text-sm text-text-light ">
      <div className="flex items-center justify-between">
        <span>{translations.subtotal}</span>
        <Price
          className="text-base font-semibold text-text-dark "
          amount={cart.cost.subtotalAmount.amount}
          currencyCode={cart.cost.subtotalAmount.currencyCode}
        />
      </div>
      <div className="flex items-center justify-between">
        <span>{translations.taxes}</span>
        <Price
          className="text-base font-semibold text-text-dark "
          amount={cart.cost.totalTaxAmount.amount}
          currencyCode={cart.cost.totalTaxAmount.currencyCode}
        />
      </div>
      <div className="flex items-center justify-between">
        <span>{translations.shipping}</span>
        <span>{translations.shippingCalculated}</span>
      </div>
      <div className="flex items-center justify-between border-t border-border/40 pt-3 text-base font-semibold text-text-dark  ">
        <span>{translations.total}</span>
        <Price
          className="text-xl font-semibold"
          amount={cart.cost.totalAmount.amount}
          currencyCode={cart.cost.totalAmount.currencyCode}
        />
      </div>
    </div>
    <a
      href={cart.checkoutUrl}
      className="btn btn-primary mt-6 flex w-full items-center justify-center rounded-full px-6 py-3 text-sm font-semibold"
    >
      {translations.proceedToCheckout}
    </a>
    <p className="mt-3 text-xs text-text-light ">
      {translations.securePayment}
    </p>
  </aside>
);

export default async function CartPage() {
  const t = await getTranslations("cart");
  const context = shopifyContext;

  const cookieStore = await cookies();
  const cartId = cookieStore.get("cartId")?.value;
  const cart = cartId ? await getCart(cartId, context) : undefined;

  const emptyTranslations = {
    yourCart: t("yourCart"),
    emptyTitle: t("emptyTitle"),
    emptyDescription: t("emptyDescription"),
    goToCatalog: t("goToCatalog"),
  };

  if (!cart || !cart.lines.length) {
    return <EmptyCartState translations={emptyTranslations} />;
  }

  const summaryTranslations = {
    orderSummary: t("orderSummary"),
    subtotal: t("subtotal"),
    taxes: t("taxes"),
    shipping: t("shipping"),
    shippingCalculated: t("shippingCalculated"),
    total: t("total"),
    proceedToCheckout: t("proceedToCheckout"),
    securePayment: t("securePayment"),
  };

  return (
    <section className="container py-16">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/80 ">
          {t("yourCart")}
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-text-dark ">
          {t("readyForPet")}
        </h1>
        <p className="mt-2 text-text-light ">{t("cartDescription")}</p>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <ul className="space-y-4">
          {cart.lines.map((item) => (
            <CartLine key={item.id} item={item} />
          ))}
        </ul>
        <CartSummary cart={cart} translations={summaryTranslations} />
      </div>

      <div className="mt-12 rounded-2xl border border-border/40 bg-light/60 p-6 text-sm text-text-light shadow-sm   ">
        <p>
          {t("needHelp")}{" "}
          <Link href="/contact" className="font-semibold text-primary ">
            {t("contactUs")}
          </Link>{" "}
          {t("helpDescription")}
        </p>
      </div>
    </section>
  );
}
