"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { createUrl } from "@/lib/utils";
import { SUBCATEGORY_EMOJI } from "@/lib/subcategories";

interface SubcategoryChipsProps {
  subcategories: string[];
  selected?: string;
}

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

  const chip = (active: boolean) =>
    `inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
      active
        ? "bg-primary text-white shadow-sm"
        : "bg-light text-text-dark hover:bg-primary/10 hover:text-primary"
    }`;

  return (
    <div className="mb-8 flex flex-wrap justify-center gap-2 md:gap-3">
      <button
        type="button"
        onClick={() => go()}
        className={chip(!selected)}
        aria-pressed={!selected}
      >
        {t("allSubcategories")}
      </button>
      {subcategories.map((sub) => (
        <button
          key={sub}
          type="button"
          onClick={() => go(sub)}
          className={chip(selected === sub)}
          aria-pressed={selected === sub}
        >
          {SUBCATEGORY_EMOJI[sub] ? (
            <span aria-hidden="true">{SUBCATEGORY_EMOJI[sub]}</span>
          ) : null}
          {sub}
        </button>
      ))}
    </div>
  );
};

export default SubcategoryChips;
