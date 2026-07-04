"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import type { IconType } from "react-icons";
import {
  FaBowlFood,
  FaSoap,
  FaKitMedical,
  FaBaseball,
  FaHouse,
  FaTag,
} from "react-icons/fa6";
import RangeSlider from "@/components/rangeSlider/RangeSlider";
import { createUrl } from "@/lib/utils";

// Icona per ogni sottocategoria (fallback: FaTag).
const SUBCATEGORY_ICON: Record<string, IconType> = {
  Alimentación: FaBowlFood,
  Higiene: FaSoap,
  Salud: FaKitMedical,
  Juguetes: FaBaseball,
  Jaulas: FaHouse,
  Accesorios: FaTag,
};

interface AnimalFacet {
  handle: string;
  title: string;
  count: number;
}

interface SubcategoryFacet {
  value: string;
  count: number;
}

interface CatalogSidebarProps {
  animalFacets: AnimalFacet[];
  subcategoryFacets: SubcategoryFacet[];
  selectedAnimal?: string;
  selectedSub?: string;
  maxPriceData: { amount: string; currencyCode: string };
}

const CatalogSidebar = ({
  animalFacets,
  subcategoryFacets,
  selectedAnimal,
  selectedSub,
  maxPriceData,
}: CatalogSidebarProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("products");

  const hasPrice = searchParams.get("minPrice") || searchParams.get("maxPrice");
  const hasActive = Boolean(selectedSub) || Boolean(hasPrice);

  const push = (params: URLSearchParams) => {
    params.delete("cursor");
    router.push(createUrl("/products", params), { scroll: false });
  };

  const toggleParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get(key) === value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    // Cambiando mondo animale, la sottocategoria non è più valida.
    if (key === "c") params.delete("sub");
    push(params);
  };

  const clearAll = () => {
    const params = new URLSearchParams(searchParams.toString());
    ["sub", "minPrice", "maxPrice", "cursor"].forEach((key) =>
      params.delete(key),
    );
    push(params);
  };

  const rowClass = (active: boolean) =>
    `flex items-center justify-between gap-2 rounded-full px-3 py-2 text-sm transition-colors ${
      active
        ? "bg-primary/10 font-bold text-primary"
        : "font-medium text-text-light hover:bg-light hover:text-text-dark"
    }`;

  const badgeClass = (active: boolean) =>
    `shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold leading-none ${
      active ? "bg-primary text-white" : "bg-light text-text-light"
    }`;

  const showAnimals = animalFacets.length > 0;
  const showSubcategories = subcategoryFacets.length > 0;

  return (
    <aside className="lg:w-64 lg:shrink-0">
      <div className="rounded-2xl border border-border bg-white p-5 lg:sticky lg:top-24">
        <div className="mb-5 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-text-dark">
            {t("filters")}
          </span>
          {hasActive && (
            <button
              type="button"
              onClick={clearAll}
              className="text-xs font-semibold text-primary hover:underline"
            >
              {t("clearFilters")}
            </button>
          )}
        </div>

        <div className="flex flex-col gap-6">
          {/* Faccetta Mascota (vista globale) */}
          {showAnimals && (
            <div>
              <div className="mb-3 text-xs font-bold uppercase tracking-wider text-text-dark">
                {t("petLabel")}
              </div>
              <div className="flex flex-col gap-1">
                {animalFacets.map(({ handle, title, count }) => {
                  const active = selectedAnimal === handle;
                  return (
                    <button
                      key={handle}
                      type="button"
                      onClick={() => toggleParam("c", handle)}
                      className={rowClass(active)}
                      aria-pressed={active}
                    >
                      <span className="truncate">{title}</span>
                      <span className={badgeClass(active)}>{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Faccetta Categoría (dentro un mondo animale) */}
          {showSubcategories && (
            <div>
              <div className="mb-3 text-xs font-bold uppercase tracking-wider text-text-dark">
                {t("categoryLabel")}
              </div>
              <div className="flex flex-col gap-1">
                {subcategoryFacets.map(({ value, count }) => {
                  const Icon = SUBCATEGORY_ICON[value] ?? FaTag;
                  const active = selectedSub === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => toggleParam("sub", value)}
                      className={rowClass(active)}
                      aria-pressed={active}
                    >
                      <span className="flex items-center gap-2 truncate">
                        <Icon
                          className={
                            active ? "text-primary" : "text-text-light"
                          }
                          aria-hidden="true"
                        />
                        <span className="truncate">{value}</span>
                      </span>
                      <span className={badgeClass(active)}>{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {(showAnimals || showSubcategories) && (
            <div className="h-px bg-border" />
          )}

          {/* Prezzo */}
          <div>
            <div className="mb-4 text-xs font-bold uppercase tracking-wider text-text-dark">
              {t("priceLabel")}
            </div>
            <RangeSlider maxPriceData={maxPriceData} />
          </div>
        </div>
      </div>
    </aside>
  );
};

export default CatalogSidebar;
