"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { FaChevronDown } from "react-icons/fa6";
import { createUrl } from "@/lib/utils";

// Dropdown "Ordenar: …▾" ispirato al pattern del progetto negozio.
// Aggiorna ?sort= preservando gli altri parametri; la pagina rilegge il sort.
const SORT_OPTIONS = [
  { slug: "", key: "sortRecommended" },
  { slug: "latest-desc", key: "sortNewest" },
  { slug: "price-asc", key: "sortPriceAsc" },
  { slug: "price-desc", key: "sortPriceDesc" },
] as const;

const CategorySort = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("products");
  const current = searchParams.get("sort") ?? "";

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    const value = event.target.value;
    if (value) {
      params.set("sort", value);
    } else {
      params.delete("sort");
    }
    params.delete("cursor");
    router.push(createUrl("/products", params), { scroll: false });
  };

  return (
    <div className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border bg-white px-4 py-2.5 text-sm">
      <span className="hidden font-medium text-text-light sm:inline">
        {t("sortLabel")}:
      </span>
      <div className="relative flex items-center">
        {/* border-0/p-0/bg-none neutralizzano @tailwindcss/forms per usare la freccia custom */}
        <select
          value={current}
          onChange={handleChange}
          aria-label={t("sortLabel")}
          className="cursor-pointer appearance-none border-0 bg-transparent bg-none p-0 pr-5 font-semibold text-text-dark focus:outline-none focus:ring-0"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.slug} value={option.slug}>
              {t(option.key)}
            </option>
          ))}
        </select>
        <FaChevronDown
          className="pointer-events-none absolute right-0 text-[10px] text-text-light"
          aria-hidden="true"
        />
      </div>
    </div>
  );
};

export default CategorySort;
