"use client";

import Breadcrumbs from "@/components/Breadcrumbs";
import { CATEGORY_COVERS } from "@/lib/categoryCovers";
import { Collection } from "@/lib/shopify/types";
import Image from "next/image";
import { useTranslations } from "next-intl";

interface CategoryHeaderProps {
  category?: Collection;
  searchValue?: string;
  productCount: number;
}

export default function CategoryHeader({
  category,
  searchValue,
  productCount,
}: CategoryHeaderProps) {
  const t = useTranslations("products");

  const title = searchValue
    ? t("resultsFor", { query: searchValue })
    : category?.title || t("allProducts");

  const description = !searchValue && category?.description;
  const coverImage = category?.handle
    ? CATEGORY_COVERS[category.handle] || category.image?.url
    : undefined;

  return (
    <section>
      <div className="text-center">
        <div className="relative overflow-hidden bg-gradient-to-b from-body to-light px-8 py-14 md:py-20">
          {coverImage && (
            <>
              <Image
                src={coverImage}
                alt={category?.image?.altText || title}
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-white/72" />
            </>
          )}

          <h1 className="relative mb-4 text-3xl font-bold md:text-4xl lg:text-5xl">
            {title}
          </h1>

          {description && (
            <p className="relative mx-auto mb-6 max-w-2xl text-base leading-relaxed text-text md:text-lg">
              {description}
            </p>
          )}

          <p className="relative mb-6 text-sm text-text md:text-base">
            {productCount === 0 ? (
              <span className="font-medium text-error">
                {t("noProductsFound")}
              </span>
            ) : (
              <>
                {t("productCount", { count: productCount })}{" "}
                {searchValue ? t("found") : ""}
              </>
            )}
          </p>

          <Breadcrumbs className="relative mt-6" />
        </div>
      </div>
    </section>
  );
}
