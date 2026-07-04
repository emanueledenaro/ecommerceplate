import type { Metadata } from "next";
import LoadingProducts from "@/layouts/components/loadings/skeleton/SkeletonProducts";
import ActiveFilters from "@/components/ActiveFilters";
import CatalogSidebar from "@/components/CatalogSidebar";
import CategoryHeader from "@/components/CategoryHeader";
import CategorySort from "@/components/CategorySort";
import EmptyState from "@/components/EmptyState";
import { defaultSort, sorting } from "@/lib/constants";
import { getListPage } from "@/lib/contentParser";
import {
  getCollectionProducts,
  getCollections,
  getHighestProductPrice,
  getProducts,
} from "@/lib/shopify";
import { Collection, PageInfo, Product } from "@/lib/shopify/types";
import {
  buildProductQuery,
  extractFiltersFromSearchParams,
  hasActiveFilters,
} from "@/lib/utils/productQueryBuilder";
import { getSubcategory, getSubcategoryFacets } from "@/lib/subcategories";
import CallToAction from "@/partials/CallToAction";
import ProductCardView from "@/partials/ProductCardView";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { shopifyContext } from "@/lib/i18n/config";
import { getMetadataAlternates } from "@/lib/i18n/metadata";

interface SearchParams {
  sort?: string;
  q?: string;
  minPrice?: string;
  maxPrice?: string;
  b?: string;
  c?: string;
  t?: string;
  sub?: string;
}

export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getTranslations("products");

  return {
    title: t("allProducts"),
    description: t("seeAllProducts"),
    alternates: getMetadataAlternates("/products"),
  };
};

const ShowProducts = async ({
  searchParams,
  context,
}: {
  searchParams: SearchParams;
  context?: { country: string; language: string };
}) => {
  const {
    sort,
    q: searchValue,
    minPrice,
    maxPrice,
    c: category,
    sub: subcategory,
    cursor,
  } = searchParams as {
    [key: string]: string;
  };

  const t = await getTranslations("products");

  const { sortKey, reverse } =
    sorting.find((item) => item.slug === sort) || defaultSort;

  // Extract filters using utility
  const filters = extractFiltersFromSearchParams(
    searchParams as { [key: string]: string | undefined },
  );
  const hasFilters = hasActiveFilters(filters);

  let productsData: { pageInfo: PageInfo | null; products: Product[] };
  let currentCategory: Collection | undefined;

  if (hasFilters) {
    // Use utility to build query instead of duplicating logic
    const queryString = buildProductQuery(filters);

    const query = {
      sortKey,
      reverse,
      query: queryString,
      cursor,
      context,
    };

    productsData =
      category && category !== "all"
        ? await getCollectionProducts({
            collection: category,
            sortKey,
            reverse,
            context,
          })
        : await getProducts(query);
  } else {
    // Fetch all products
    productsData = await getProducts({ sortKey, reverse, cursor, context });
  }

  const categories = await getCollections(context);

  // Find current category if present
  const inCategory = Boolean(category && category !== "all");
  if (inCategory) {
    currentCategory = categories.find((cat) => cat.handle === category);
  }

  // Faccette della sidebar: mondi animali (vista globale) o sottocategorie
  // (dentro un mondo). Calcolate dinamicamente coi conteggi, stile "negozio".
  const animalFacets = !inCategory
    ? categories
        .map((cat) => ({
          handle: cat.handle,
          title: cat.title,
          count: cat.products?.edges?.length ?? 0,
        }))
        .filter((facet) => facet.count > 0)
    : [];
  const subcategoryFacets = inCategory
    ? getSubcategoryFacets(productsData.products)
    : [];

  // Filtri applicati sui prodotti del mondo (sottocategoria + prezzo),
  // stile "negozio": faccette client-side sui prodotti già caricati.
  const minP = minPrice ? parseFloat(minPrice) : null;
  const maxP = maxPrice ? parseFloat(maxPrice) : null;
  let displayProducts = productsData.products;
  if (inCategory && subcategory) {
    displayProducts = displayProducts.filter(
      (product: Product) => getSubcategory(product.productType) === subcategory,
    );
  }
  if (inCategory && (minP !== null || maxP !== null)) {
    displayProducts = displayProducts.filter((product: Product) => {
      const amount = parseFloat(
        product.priceRange?.minVariantPrice?.amount || "0",
      );
      if (minP !== null && amount < minP) return false;
      if (maxP !== null && amount > maxP) return false;
      return true;
    });
  }

  // Prezzo massimo per il range slider: dai prodotti caricati, con fallback globale.
  const worldMaxPrice = Math.ceil(
    productsData.products.reduce((max, product) => {
      const amount = parseFloat(
        product.priceRange?.maxVariantPrice?.amount || "0",
      );
      return amount > max ? amount : max;
    }, 0),
  );
  const globalMaxPrice = await getHighestProductPrice(context);
  const sidebarMaxPrice =
    worldMaxPrice > 0
      ? {
          amount: String(worldMaxPrice),
          currencyCode:
            productsData.products[0]?.priceRange?.maxVariantPrice
              ?.currencyCode || "MXN",
        }
      : {
          amount: globalMaxPrice?.amount || "10000",
          currencyCode: globalMaxPrice?.currencyCode || "MXN",
        };

  const productCount = displayProducts.length;
  const hasProducts = productCount > 0;
  const hasSidebar = animalFacets.length > 0 || subcategoryFacets.length > 0;

  return (
    <>
      {/* Hero Section with integrated Breadcrumbs */}
      <CategoryHeader
        category={currentCategory}
        searchValue={searchValue}
        productCount={productCount}
      />

      {/* Main Content: sidebar filtri + griglia (stile negozio) */}
      <div className="py-12 md:py-16">
        <div className="container">
          <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
            {hasSidebar && (
              <Suspense>
                <CatalogSidebar
                  animalFacets={animalFacets}
                  subcategoryFacets={subcategoryFacets}
                  selectedAnimal={inCategory ? category : undefined}
                  selectedSub={subcategory}
                  maxPriceData={sidebarMaxPrice}
                />
              </Suspense>
            )}

            <div className="grow">
              {/* Barra: conteggio risultati + ordinamento */}
              <div className="mb-6 flex items-center justify-between gap-3">
                <p className="text-sm text-text-light">
                  {t("productCount", { count: productCount })}
                </p>
                <Suspense>
                  <CategorySort />
                </Suspense>
              </div>

              {/* Filtri attivi rimovibili */}
              <ActiveFilters filters={filters} />

              {/* Griglia prodotti */}
              {!hasProducts ? (
                <EmptyState />
              ) : (
                <ProductCardView
                  searchParams={
                    searchParams as Record<string, string | undefined>
                  }
                  initialProducts={displayProducts}
                  initialPageInfo={productsData.pageInfo}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const ProductsListPage = async (props: {
  searchParams: Promise<SearchParams>;
}) => {
  const context = shopifyContext;
  const searchParams = await props.searchParams;
  const callToAction = getListPage("sections/call-to-action.md");

  return (
    <>
      {/* <PageHeader title={"Products"} /> */}
      <Suspense fallback={<LoadingProducts />}>
        <ShowProducts searchParams={searchParams} context={context} />
      </Suspense>

      <CallToAction data={callToAction} />
    </>
  );
};

export default ProductsListPage;
