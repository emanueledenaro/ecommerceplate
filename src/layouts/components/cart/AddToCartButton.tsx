"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useFormStatus } from "react-dom";
import { BiLoaderAlt } from "react-icons/bi";
import { HiCheck, HiPlus } from "react-icons/hi";
import type { ProductVariant } from "@/lib/shopify/types";
import type { CartActionResult } from "@/lib/utils/cartActions";
import { useTranslations } from "next-intl";

type SubmitButtonProps = {
  availableForSale: boolean;
  selectedVariantId: string | undefined;
  stylesClass: string;
  handle: string | null;
  showSuccess: boolean;
};

function SubmitButton({
  availableForSale,
  selectedVariantId,
  stylesClass,
  handle,
  showSuccess,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  const buttonClasses = stylesClass ?? "";
  const disabledClasses = "cursor-not-allowed flex";
  const t = useTranslations("product");

  const DynamicTag = handle === null ? "button" : Link;

  if (!availableForSale) {
    return (
      <button
        type="button"
        disabled
        aria-disabled
        className={`${buttonClasses} ${disabledClasses}`}
      >
        {t("outOfStock")}
      </button>
    );
  }

  if (!selectedVariantId) {
    return (
      <DynamicTag
        href={`/products/${handle ?? ""}`}
        aria-label={t("selectVariant")}
        aria-disabled
        className={`${buttonClasses} ${
          DynamicTag === "button" && disabledClasses
        }`}
      >
        {t("selectVariant")}
      </DynamicTag>
    );
  }

  return (
    <button
      type="submit"
      onClick={(event: React.FormEvent<HTMLButtonElement>) => {
        if (pending) event.preventDefault();
      }}
      aria-label={showSuccess ? t("inCartClickMore") : t("addToCart")}
      title={showSuccess ? t("inCartClickMore") : t("addToCart")}
      aria-disabled={pending ? "true" : "false"}
      disabled={pending}
      className={`${buttonClasses} ${
        showSuccess ? "!bg-success !text-white" : ""
      } flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.98] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/50  disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:shadow-none min-h-[44px]`}
    >
      {pending ? (
        <>
          <BiLoaderAlt className="animate-spin flex-shrink-0" size={20} />
          <span className="font-semibold">{t("adding")}</span>
        </>
      ) : showSuccess ? (
        <>
          <HiCheck className="flex-shrink-0" size={20} />
          <span className="font-semibold">{t("inCart")}</span>
        </>
      ) : buttonClasses.includes("w-9 h-9") ||
        buttonClasses.includes("rounded-full") ? (
        <HiPlus size={20} />
      ) : (
        <>
          <HiPlus className="flex-shrink-0" size={20} />
          <span className="font-semibold">{t("addToCart")}</span>
        </>
      )}
    </button>
  );
}

type AddToCartButtonProps = {
  variants: ProductVariant[];
  availableForSale: boolean;
  stylesClass?: string;
  handle: string | null;
  defaultVariantId: string | undefined;
  isInCart?: boolean;
  action: (
    prevState: CartActionResult | null,
    formData: FormData,
  ) => Promise<CartActionResult>;
};

const CART_EVENT = "cart:changed";

const AddToCartButton = ({
  variants,
  availableForSale,
  stylesClass = "",
  handle,
  defaultVariantId,
  isInCart = false,
  action,
}: AddToCartButtonProps) => {
  const searchParams = useSearchParams();
  const [actionState, formAction] = useActionState(action, null);
  const [showSuccess, setShowSuccess] = useState(isInCart);
  const t = useTranslations("product");

  const selectedOptions = useMemo(
    () => Array.from(searchParams.entries()),
    [searchParams],
  );

  const variant = useMemo(
    () =>
      variants.find((productVariant: ProductVariant) =>
        selectedOptions.every(([key, value]) =>
          productVariant.selectedOptions.some(
            (option) =>
              option.name.toLowerCase() === key && option.value === value,
          ),
        ),
      ),
    [selectedOptions, variants],
  );

  const selectedVariantId = variant?.id ?? defaultVariantId;

  useEffect(() => {
    setShowSuccess(isInCart);
  }, [isInCart]);

  useEffect(() => {
    if (actionState?.status === "success") {
      setShowSuccess(true);

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event(CART_EVENT));
      }
    }
  }, [actionState]);

  return (
    <form action={formAction}>
      <input type="hidden" name="variantId" value={selectedVariantId} />
      <SubmitButton
        availableForSale={availableForSale}
        selectedVariantId={selectedVariantId}
        stylesClass={stylesClass}
        handle={handle}
        showSuccess={showSuccess}
      />
      {actionState?.status === "error" && (
        <div
          role="alert"
          aria-live="assertive"
          className="mt-2 text-sm text-error "
        >
          {actionState.message || t("addError")}
        </div>
      )}
      {actionState?.status === "success" && (
        <p aria-live="polite" className="sr-only" role="status">
          {t("addedSuccess")}
        </p>
      )}
    </form>
  );
};

export default AddToCartButton;
