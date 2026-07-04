"use client";

import ImageFallback from "@/layouts/helpers/ImageFallback";
import { Link } from "@/i18n/navigation";
import type { Collection } from "@/lib/shopify/types";

const CollectionsSlider = ({ collections }: { collections: Collection[] }) => {
  return (
    <div className="relative">
      {/* Mobile: griglia 3x2 tutta visibile | Desktop: riga unica centrata */}
      <ul className="grid grid-cols-3 gap-x-2 gap-y-6 justify-items-center md:flex md:justify-center md:gap-6 select-none">
        {collections.map((item, index) => {
          const { title, handle, image } = item;

          return (
            <li
              key={handle}
              className="w-full max-w-32 sm:max-w-36 md:w-40 md:max-w-none md:shrink-0 opacity-0 animate-[fadeUp_.5s_ease-out_forwards]"
              style={{ animationDelay: `${index * 70}ms` }}
            >
              <Link
                href={`/products?c=${handle}`}
                className="group flex flex-col items-center text-center"
              >
                {/* Anello sfumato coral→pesca */}
                <span className="rounded-full p-[3px] bg-gradient-to-br from-primary/70 via-secondary to-primary/30 shadow-md transition-all duration-300 group-hover:shadow-lg">
                  <span className="block rounded-full bg-body p-1">
                    <span className="block relative aspect-square w-24 sm:w-28 md:w-32 overflow-hidden rounded-full">
                      <ImageFallback
                        src={image?.url || "/images/image-placeholder.png"}
                        fallback="/images/image-placeholder.png"
                        width={224}
                        height={224}
                        alt={image?.altText || title}
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute inset-0 rounded-full bg-gradient-to-t from-black/25 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    </span>
                  </span>
                </span>

                <span className="mt-3 block font-semibold text-sm md:text-base text-text-dark transition-colors duration-200 group-hover:text-primary">
                  {title}
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
