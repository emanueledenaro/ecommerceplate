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
  FaLayerGroup,
} from "react-icons/fa6";
import { createUrl } from "@/lib/utils";

interface SubcategoryChipsProps {
  subcategories: string[];
  selected?: string;
}

// Icona per ogni sottocategoria (fallback: FaTag).
const SUBCATEGORY_ICON: Record<string, IconType> = {
  Alimentación: FaBowlFood,
  Higiene: FaSoap,
  Salud: FaKitMedical,
  Juguetes: FaBaseball,
  Jaulas: FaHouse,
  Accesorios: FaTag,
};

const SubcategoryChips = ({
  subcategories,
  selected,
}: SubcategoryChipsProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("products");

  if (subcategories.length === 0) return null;

  const go = (sub?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (sub) {
      params.set("sub", sub);
    } else {
      params.delete("sub");
    }
    params.delete("cursor");
    router.push(createUrl("/products", params), { scroll: false });
  };

  const chipClass = (active: boolean) =>
    `group inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
      active
        ? "border-primary bg-primary text-white shadow-md shadow-primary/20"
        : "border-border bg-white text-text-dark hover:-translate-y-0.5 hover:border-primary/60 hover:text-primary hover:shadow-sm"
    }`;

  const iconClass = (active: boolean) =>
    `text-[0.95em] transition-colors ${active ? "text-white" : "text-primary"}`;

  return (
    <nav
      aria-label={t("allProducts")}
      className="mb-10 flex flex-wrap justify-center gap-2.5 md:gap-3"
    >
      <button
        type="button"
        onClick={() => go()}
        className={chipClass(!selected)}
        aria-pressed={!selected}
      >
        <FaLayerGroup className={iconClass(!selected)} aria-hidden="true" />
        {t("allSubcategories")}
      </button>

      {subcategories.map((sub) => {
        const Icon = SUBCATEGORY_ICON[sub] ?? FaTag;
        const active = selected === sub;
        return (
          <button
            key={sub}
            type="button"
            onClick={() => go(sub)}
            className={chipClass(active)}
            aria-pressed={active}
          >
            <Icon className={iconClass(active)} aria-hidden="true" />
            {sub}
          </button>
        );
      })}
    </nav>
  );
};

export default SubcategoryChips;
