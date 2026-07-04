"use client";

import { AddToCart } from "@/components/cart/AddToCart";
import Price from "@/components/Price";
import { Link } from "@/i18n/navigation";
import ImageFallback from "@/layouts/helpers/ImageFallback";
import { Product } from "@/lib/shopify/types";
import { Suspense, useState } from "react";
import { useTranslations } from "next-intl";

interface ProductListItemProps {
  product: Product;
}

export default function ProductListItem({ product }: ProductListItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const t = useTranslations("productCard");

  const defaultVariantId =
    product?.variants.length > 0 ? product?.variants[0].id : undefined;

  // Calcola badge sconto
  const compareAtPrice = parseFloat(
    product?.compareAtPriceRange?.maxVariantPrice?.amount || "0",
  );
  const currentPrice = parseFloat(
    product?.priceRange?.minVariantPrice?.amount || "0",
  );
  const hasDiscount = compareAtPrice > currentPrice && compareAtPrice > 0;
  const discountPercent = hasDiscount
    ? Math.round(((compareAtPrice - currentPrice) / compareAtPrice) * 100)
    : 0;

  // Badge "Nuovo" se prodotto aggiornato negli ultimi 30 giorni
  const isNew = () => {
    if (!product?.updatedAt) return false;
    const updatedDate = new Date(product.updatedAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return updatedDate > thirtyDaysAgo;
  };

  // Immagini per hover swap
  const mainImage =
    product.featuredImage?.url || "/images/product_image404.jpg";
  const hoverImage = product.images?.[1]?.url || mainImage;

  return (
    <div
      className="group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Card Elevation Container - Orizzontale */}
      <div className="bg-white  shadow-lg hover:shadow-2xl rounded-2xl overflow-hidden transition-all duration-300 flex flex-col md:flex-row">
        {/* Immagine Container Quadrata (40% width desktop) */}
        <div className="relative md:w-[40%] aspect-square overflow-hidden">
          {/* Badge piccoli nell'angolo alto-sinistra */}
          <div className="absolute top-2 left-2 z-20 flex flex-col gap-1">
            {isNew() && (
              <span className="px-2 py-0.5 bg-success text-white text-[10px] font-semibold rounded-2xl shadow">
                {t("newBadge")}
              </span>
            )}
            {hasDiscount && (
              <span className="px-2 py-0.5 bg-error text-white text-[10px] font-semibold rounded-2xl shadow">
                -{discountPercent}%
              </span>
            )}
            {!product?.availableForSale && (
              <span className="px-2 py-0.5 bg-text/70  text-white text-[10px] font-semibold rounded-2xl shadow">
                {t("outBadge")}
              </span>
            )}
          </div>

          {/* Immagine principale */}
          <ImageFallback
            src={mainImage}
            width={400}
            height={400}
            alt={product.featuredImage?.altText || product.title}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isHovered && hoverImage !== mainImage
                ? "opacity-0"
                : "opacity-100"
            }`}
          />

          {/* Immagine hover (swap) */}
          {hoverImage !== mainImage && (
            <ImageFallback
              src={hoverImage}
              width={400}
              height={400}
              alt={t("alternativeImageAlt", { title: product.title })}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                isHovered ? "opacity-100" : "opacity-0"
              }`}
            />
          )}
        </div>

        {/* Info Box (60% width desktop) */}
        <div className="p-5 md:p-6 flex-1 flex flex-col justify-between">
          <div>
            {/* Titolo */}
            <h2 className="text-lg md:text-xl font-semibold mb-3">
              <Link
                href={`/products/${product?.handle}`}
                className="hover:text-primary  transition-colors"
              >
                {product?.title}
              </Link>
            </h2>

            {/* Prezzo */}
            <div className="flex items-baseline gap-2 mb-4">
              <Price
                as="span"
                amount={currentPrice.toFixed(2)}
                currencyCode={product.priceRange.minVariantPrice.currencyCode}
                className="text-xl md:text-2xl font-bold text-text-dark "
              />
              {hasDiscount && (
                <Price
                  as="span"
                  amount={compareAtPrice.toFixed(2)}
                  currencyCode={
                    product.compareAtPriceRange.maxVariantPrice.currencyCode
                  }
                  className="text-sm md:text-base text-text-light  line-through"
                />
              )}
            </div>

            {/* Descrizione */}
            <p className="text-sm md:text-base text-text-light  mb-4 line-clamp-2">
              {product?.description}
            </p>
          </div>

          {/* Bottom Section: Colors + Button */}
          <div className="flex items-center justify-between gap-4 mt-auto">
            {/* Color Swatches */}
            <div className="flex items-center gap-1.5">
              {product.options
                ?.find(
                  (opt) =>
                    opt.name.toLowerCase() === "color" ||
                    opt.name.toLowerCase() === "colour",
                )
                ?.values.slice(0, 4)
                .map((color, idx) => (
                  <div
                    key={idx}
                    className="w-5 h-5 rounded-full border border-border  shadow-sm cursor-pointer"
                    style={{ backgroundColor: getColorHex(color) }}
                    title={color}
                  />
                )) || null}
            </div>

            {/* Add to Cart Button */}
            {product?.availableForSale && (
              <Suspense>
                <AddToCart
                  variants={product?.variants}
                  availableForSale={product?.availableForSale}
                  handle={product?.handle}
                  defaultVariantId={defaultVariantId}
                  stylesClass="btn btn-primary btn-sm whitespace-nowrap shadow-md"
                />
              </Suspense>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper per convertire nomi colori in hex
function getColorHex(colorName: string): string {
  const colorMap: { [key: string]: string } = {
    black: "#000000",
    white: "#FFFFFF",
    red: "#EF4444",
    blue: "#3B82F6",
    green: "#10B981",
    yellow: "#F59E0B",
    pink: "#EC4899",
    purple: "#A855F7",
    gray: "#6B7280",
    grey: "#6B7280",
    brown: "#92400E",
    orange: "#F97316",
    beige: "#D4C5B9",
    navy: "#1E3A8A",
  };
  const normalized = colorName.toLowerCase().trim();
  return colorMap[normalized] || "#D1D5DB";
}
