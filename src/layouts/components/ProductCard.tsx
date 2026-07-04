"use client";

import { AddToCart } from "@/components/cart/AddToCart";
import Price from "@/components/Price";
import { Link } from "@/i18n/navigation";
import ImageFallback from "@/layouts/helpers/ImageFallback";
import { Product } from "@/lib/shopify/types";
import { useState } from "react";
import { HiEye } from "react-icons/hi";
import { useTranslations } from "next-intl";

interface ProductCardProps {
  product: Product;
  isInCart?: boolean;
}

export default function ProductCard({
  product,
  isInCart = false,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const t = useTranslations("productCard");

  const defaultVariantId =
    product?.variants.length > 0 ? product?.variants[0].id : undefined;

  // Calcola badge
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

  // Color swatches (se esiste option "Color" o "Colour")
  const colorOption = product.options?.find(
    (opt) =>
      opt.name.toLowerCase() === "color" || opt.name.toLowerCase() === "colour",
  );
  const colors = colorOption?.values || [];

  return (
    <div className="w-full h-full">
      {/* Card Amazon-Style: Flat, Functional, Info-Dense */}
      <div
        className={`bg-white  border rounded-2xl overflow-hidden h-full flex flex-col transition-all duration-300 ${
          hasDiscount
            ? "border-error/60  shadow-lg shadow-error/20 animate-pulse-border hover:shadow-xl hover:shadow-error/30"
            : "border-border/60  hover:border-primary/50 hover:shadow-md"
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Immagine Container + Badges + Icon Cart */}
        <div className="relative aspect-square overflow-hidden bg-light/50  group">
          {/* Ribbon Diagonale Sconto */}
          {hasDiscount && (
            <div className="absolute top-0 left-0 z-20 w-24 h-24 pointer-events-none">
              <div
                className="absolute transform -rotate-45 bg-error text-white text-center font-bold text-xs md:text-sm py-2 md:py-2.5 left-[-32px] top-[18px] md:top-[16px] w-[140px]"
                style={{
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
                }}
              >
                -{discountPercent}%
              </div>
            </div>
          )}

          {/* Badge Nuovo top-right */}
          {isNew() && !hasDiscount && (
            <span className="absolute top-2 right-2 z-10 px-3 py-1.5 bg-success text-white text-sm md:text-base font-bold rounded-2xl shadow-md">
              {t("newBadge")}
            </span>
          )}

          {/* Immagine Link */}
          <Link
            href={`/products/${product?.handle}`}
            className="block w-full h-full relative"
          >
            {/* Immagine principale */}
            <ImageFallback
              src={mainImage}
              width={400}
              height={400}
              alt={product.title}
              loading="lazy"
              className={`w-full h-full object-cover transition-all duration-300 ${
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
                loading="lazy"
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-300 ${
                  isHovered ? "opacity-100" : "opacity-0"
                }`}
              />
            )}

            {/* Overlay Hover - detail */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
              <div className="text-white text-center">
                <HiEye className="mx-auto mb-2" size={32} />
                <span className="text-lg font-bold">{t("details")}</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Info Box - Responsive */}
        <div className="p-3 md:p-4 flex-1 flex flex-col gap-2 md:gap-3">
          {/* Titolo (2 righe max) */}
          <h3 className="text-sm md:text-lg font-semibold line-clamp-2 min-h-[40px] md:min-h-[56px] leading-snug">
            <Link
              href={`/products/${product?.handle}`}
              className="hover:text-primary  transition-colors"
            >
              {product?.title}
            </Link>
          </h3>

          {/* Prezzo + Button */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            {/* Prezzo */}
            <div className="flex items-baseline gap-2 flex-wrap">
              <Price
                as="span"
                amount={currentPrice.toFixed(2)}
                currencyCode={product.priceRange.minVariantPrice.currencyCode}
                className="text-xl md:text-2xl font-bold text-error "
              />
              {hasDiscount && (
                <Price
                  as="span"
                  amount={compareAtPrice.toFixed(2)}
                  currencyCode={
                    product.compareAtPriceRange.maxVariantPrice.currencyCode
                  }
                  className="text-xs md:text-sm text-text-light  line-through"
                />
              )}
            </div>

            {/* Add to Cart Button */}
            {product?.availableForSale && (
              <AddToCart
                variants={product?.variants}
                availableForSale={product?.availableForSale}
                handle={product?.handle}
                defaultVariantId={defaultVariantId}
                isInCart={isInCart}
                stylesClass="btn btn-sm !py-2.5 !px-4 md:!py-3 md:!px-5 !text-sm md:!text-base w-full sm:w-auto flex items-center justify-center gap-2 font-bold"
              />
            )}
          </div>

          {/* Color Swatches */}
          {colors.length > 0 && (
            <div className="flex items-center gap-1.5 mt-auto pt-1">
              {colors.slice(0, 5).map((color, idx) => (
                <div
                  key={idx}
                  className="w-5 h-5 md:w-6 md:h-6 rounded-full border border-border  cursor-pointer"
                  style={{ backgroundColor: getColorHex(color) }}
                  title={color}
                />
              ))}
              {colors.length > 5 && (
                <span className="text-xs text-text-light ">
                  +{colors.length - 5}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper per convertire nomi colori in hex (fallback)
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
  return colorMap[normalized] || "#D1D5DB"; // Fallback grigio
}
