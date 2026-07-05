"use client";

import { ProductOption, ProductVariant } from "@/lib/shopify/types";
import { usePathname, useRouter } from "@/i18n/navigation";
import { createUrl } from "@/lib/utils";
import { colorNameToHex } from "@/lib/colors";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { BsCheckLg } from "react-icons/bs";
import { ImageItem } from "./ProductGallery";
import VariantDropDown from "./VariantDropDown";
import { useTranslations } from "next-intl";

type Combination = {
  id: string;
  availableForSale: boolean;
  [key: string]: string | boolean;
};

export const generateImageMap = (images: ImageItem[]) => {
  const imageMap: { [altText: string]: string } = {};

  images.forEach((image) => {
    // Use the first image encountered for each unique altText
    if (!(image.altText in imageMap)) {
      imageMap[image.altText] = image.url;
    }
  });

  return imageMap;
};

export function VariantSelector({
  options,
  variants,
  images,
}: {
  options: ProductOption[];
  variants: ProductVariant[];
  images: ImageItem[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("product");

  const imageMap = generateImageMap(images);

  const color = searchParams.get("color");
  const size = searchParams.get("size");

  // Check if color and size search parameters exist
  const hasColorAndSizeParams = color && size;

  // Set default option based on the existence of search parameters
  const defaultOption: Record<string, string> = hasColorAndSizeParams
    ? {
        color:
          options
            .find((option) => option.name === "Color")
            ?.values.includes(color) ||
          options
            .find((option) => option.name === "Size")
            ?.values.includes(color)
            ? color
            : (options.find((option) => option.name === "Color")?.values[0] ??
              ""),
        size:
          options
            .find((option) => option.name === "Size")
            ?.values.includes(size) ||
          options
            .find((option) => option.name === "Color")
            ?.values.includes(size)
            ? size
            : (options.find((option) => option.name === "Size")?.values[0] ??
              ""),
      }
    : {
        color:
          options.find((option) => option.name === "Color")?.values[0] ?? "",
        size: options.find((option) => option.name === "Size")?.values[0] ?? "",
      };

  const hasNoOptionsOrJustOneOption =
    !options.length ||
    (options.length === 1 && options[0]?.values.length === 1);

  if (hasNoOptionsOrJustOneOption) {
    return null;
  }

  const combinations: Combination[] = variants.map((variant) => ({
    id: variant.id,
    availableForSale: variant.availableForSale,
    ...variant.selectedOptions.reduce(
      (accumulator, option) => ({
        ...accumulator,
        [option.name.toLowerCase()]: option.value,
      }),
      {},
    ),
  }));

  // Find the 'Size' option
  const sizeOption = options.find((option) => option.name === "Size");

  return (
    <div>
      {options.map((option) => (
        <div className="" key={option.id}>
          <h5 className="mb-2 max-md:text-base">
            {option.name === "Size" ? "" : option.name}
          </h5>
          <div className="flex flex-wrap gap-3">
            {option.values.map((value) => {
              const optionNameLowerCase = option.name.toLowerCase();
              const optionSearchParams = new URLSearchParams(
                searchParams.toString(),
              );
              optionSearchParams.set(optionNameLowerCase, value);
              const optionUrl = createUrl(pathname, optionSearchParams);

              const filtered = Array.from(optionSearchParams.entries()).filter(
                ([key, value]) =>
                  options?.find(
                    (option) =>
                      option.name.toLowerCase() === key &&
                      option.values.includes(value),
                  ),
              );

              const isAvailableForSale = combinations.find((combination) =>
                filtered.every(
                  ([key, value]) =>
                    combination[key] === value && combination.availableForSale,
                ),
              );

              const isActive =
                searchParams.get(optionNameLowerCase) === value ||
                (!searchParams.get(optionNameLowerCase) &&
                  value === defaultOption[optionNameLowerCase]);

              if (option.name === "Size") {
                return null; // skip rendering in the loop
              }

              return (
                <div key={value}>
                  <button
                    key={value}
                    type="button"
                    aria-disabled={!isAvailableForSale}
                    disabled={!isAvailableForSale}
                    onClick={() => {
                      router.replace(optionUrl, { scroll: false });
                    }}
                    aria-label={`${option.name} ${value}${
                      !isAvailableForSale
                        ? ` (${t("notAvailable")})`
                        : isActive
                          ? ` (${t("selected")})`
                          : ""
                    }`}
                    title={`${option.name} ${value}${
                      !isAvailableForSale ? ` (${t("outOfStock")})` : ""
                    }`}
                    className={`flex min-w-[48px] min-h-[44px] items-center justify-center rounded-2xl border border-border text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50  ${
                      isActive && option.name !== "Color"
                        ? "cursor-default ring-2 ring-dark "
                        : ""
                    } ${
                      !isActive && isAvailableForSale && option.name !== "Color"
                        ? "ring-1 ring-transparent transition duration-300 ease-in-out hover:ring-dark "
                        : ""
                    } ${
                      !isAvailableForSale
                        ? "relative z-10 cursor-not-allowed overflow-hidden bg-neutral-100 text-neutral-500  "
                        : ""
                    }`}
                  >
                    {/* Swatch colore: immagine dedicata se esiste, altrimenti
                        pastiglia col colore corrispondente al nome */}
                    {option.name === "Color" ? (
                      imageMap[value] ? (
                        <div
                          key={value}
                          className={`relative overflow-hidden rounded-2xl ${
                            isActive ? "outline-1 outline-dark" : ""
                          }`}
                        >
                          <Image
                            src={imageMap[value]}
                            alt={value}
                            width={50}
                            height={50}
                            className={isActive ? "opacity-80" : ""}
                          />
                          {isActive && (
                            <span className="absolute right-2 top-2 h-full text-inherit opacity-100">
                              <BsCheckLg size={35} />
                            </span>
                          )}
                        </div>
                      ) : (
                        <span
                          className={`flex h-[46px] w-[46px] items-center justify-center rounded-2xl ${
                            isActive
                              ? "outline-2 outline-dark"
                              : "border border-border"
                          }`}
                          style={{ backgroundColor: colorNameToHex(value) }}
                          title={value}
                        >
                          {isActive && (
                            <BsCheckLg
                              size={22}
                              className="text-white drop-shadow"
                            />
                          )}
                        </span>
                      )
                    ) : (
                      value
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* rendering the 'Size' select element outside the loop */}
      {sizeOption && (
        <div className="mb-8 mt-8">
          <h5 className="mb-2 max-md:text-base">{sizeOption.name}</h5>
          <Suspense>
            <VariantDropDown sizeOption={sizeOption} options={options} />
          </Suspense>
        </div>
      )}
    </div>
  );
}
