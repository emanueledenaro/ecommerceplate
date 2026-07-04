"use client";

import ImageFallback from "@/layouts/helpers/ImageFallback";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import type { Collection } from "@/lib/shopify/types";

const CollectionsSlider = ({ collections }: { collections: Collection[] }) => {
  const t = useTranslations("products");

  return (
    <div className="relative">
      {/* Riga unica: scroll orizzontale con snap su mobile, distribuita su desktop */}
      <ul
        className="flex gap-4 md:gap-6 overflow-x-auto md:overflow-visible md:justify-center snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0 pb-4 md:pb-0 select-none touch-pan-x md:touch-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label={t("productCount", { count: collections.length })}
      >
        {collections.map((item, index) => {
          const { title, handle, image, products } = item;
          const productCount = products?.edges?.length || 0;

          return (
            <li
              key={handle}
              className="snap-start shrink-0 w-28 sm:w-32 md:w-36 opacity-0 animate-[fadeUp_.5s_ease-out_forwards]"
              style={{ animationDelay: `${index * 70}ms` }}
            >
              <Link
                href={`/products?c=${handle}`}
                className="group flex flex-col items-center text-center"
              >
                {/* Anello sfumato coral→pesca */}
                <span className="rounded-full p-[3px] bg-gradient-to-br from-primary/70 via-secondary to-primary/30 shadow-md transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1">
                  <span className="block rounded-full bg-body p-1">
                    <span className="block relative aspect-square w-[88px] sm:w-24 md:w-28 overflow-hidden rounded-full">
                      <ImageFallback
                        src={image?.url || "/images/image-placeholder.png"}
                        fallback="/images/image-placeholder.png"
                        width={224}
                        height={224}
                        alt={image?.altText || title}
                        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                      />
                      <span className="absolute inset-0 rounded-full bg-gradient-to-t from-black/25 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    </span>
                  </span>
                </span>

                <span className="mt-3 block font-semibold text-sm md:text-base text-text-dark transition-colors duration-200 group-hover:text-primary">
                  {title}
                </span>
                <span className="mt-0.5 block text-[11px] md:text-xs uppercase tracking-wider text-text-light">
                  {t("productCount", { count: productCount })}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <style jsx global>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default CollectionsSlider;
