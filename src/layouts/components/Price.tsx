"use client";

import { intlLocale } from "@/lib/i18n/config";

const Price = ({
  amount,
  as = "p",
  className,
  currencyCode = "USD",
  currencyCodeClassName,
  showCurrencyCode = true,
}: {
  amount: string;
  as?: "p" | "span";
  className?: string;
  currencyCode: string;
  currencyCodeClassName?: string;
  showCurrencyCode?: boolean;
} & React.ComponentProps<"p">) => {
  const Component = as;

  return (
    <Component suppressHydrationWarning={true} className={className}>
      {`${new Intl.NumberFormat(intlLocale, {
        style: "currency",
        currency: currencyCode,
        currencyDisplay: "narrowSymbol",
      }).format(parseFloat(amount))}`}
      {showCurrencyCode ? (
        <span className={`ml-1 inline ${currencyCodeClassName}`}>
          {currencyCode}
        </span>
      ) : null}
    </Component>
  );
};

export default Price;
