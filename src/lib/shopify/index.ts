"use server";
import {
  HIDDEN_PRODUCT_TAG,
  SHOPIFY_GRAPHQL_API_ENDPOINT,
  TAGS,
} from "@/lib/constants";
import { isShopifyError } from "@/lib/typeGuards";
import { ensureStartsWith } from "@/lib/utils";
import { revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  addToCartMutation,
  createCartMutation,
  editCartItemsMutation,
  removeFromCartMutation,
} from "./mutations/cart";
import { cartBuyerIdentityUpdateMutation } from "./mutations/cartBuyerIdentity";
import {
  createCustomerMutation,
  getCustomerAccessTokenMutation,
  getUserDetailsQuery,
  getCustomerOrdersQuery,
} from "./mutations/customer";
import { getCartQuery } from "./queries/cart";
import {
  getCollectionProductsQuery,
  getCollectionQuery,
  getCollectionsQuery,
} from "./queries/collection";
import { getMenuQuery } from "./queries/menu";
import { getPageQuery, getPagesQuery } from "./queries/page";
import {
  getHighestProductPriceQuery,
  getProductQuery,
  getProductRecommendationsQuery,
  getProductsQuery,
} from "./queries/product";
import { getVendorsQuery } from "./queries/vendor";
import {
  Cart,
  Collection,
  Connection,
  CustomerInput,
  Image,
  Menu,
  Page,
  PageInfo,
  Product,
  ShopifyAddToCartOperation,
  ShopifyCart,
  ShopifyCartBuyerIdentityUpdateOperation,
  ShopifyCartOperation,
  ShopifyCollection,
  ShopifyCollectionOperation,
  ShopifyCollectionProductsOperation,
  ShopifyCollectionsOperation,
  ShopifyContext,
  ShopifyCreateCartOperation,
  ShopifyMenuOperation,
  ShopifyPageOperation,
  ShopifyPagesOperation,
  ShopifyProduct,
  ShopifyProductOperation,
  ShopifyProductRecommendationsOperation,
  ShopifyProductsOperation,
  ShopifyRemoveFromCartOperation,
  ShopifyUpdateCartOperation,
  registerOperation,
  user,
  userOperation,
  CustomerOrdersOperation,
  Order,
} from "./types";

const domain = process.env.SHOPIFY_STORE_DOMAIN
  ? ensureStartsWith(process.env.SHOPIFY_STORE_DOMAIN, "https://")
  : "";
const endpoint = `${domain}${SHOPIFY_GRAPHQL_API_ENDPOINT}`;
const key = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN!;

type ExtractVariables<T> = T extends { variables: object }
  ? T["variables"]
  : never;

class ShopifyFetchError extends Error {
  status: number;
  query: string;
  reason?: string;

  constructor(
    message: string,
    options: { status?: number; query: string; reason?: string },
  ) {
    super(message);
    this.name = "ShopifyFetchError";
    this.status = options.status ?? 500;
    this.query = options.query;
    this.reason = options.reason;
  }
}

export async function shopifyFetch<T>({
  cache = "no-store",
  headers,
  query,
  tags,
  variables,
}: {
  cache?: RequestCache;
  headers?: HeadersInit;
  query: string;
  tags?: string[];
  variables?: ExtractVariables<T>;
}): Promise<{ status: number; body: T } | never> {
  try {
    const result = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": key,
        ...headers,
      },
      body: JSON.stringify({
        ...(query && { query }),
        ...(variables && { variables }),
      }),
      cache,
      ...(tags && { next: { tags } }),
    });

    const body = await result.json();

    if (body.errors) {
      const firstError = body.errors[0];
      const errorMessage =
        firstError?.message || firstError?.extensions?.code || "GraphQL error";
      const errorReason = firstError?.extensions?.reason || firstError?.message;

      throw new ShopifyFetchError(errorMessage, {
        status: result.status,
        reason: errorReason,
        query,
      });
    }

    return { status: result.status, body };
  } catch (error: unknown) {
    // Se è già un ShopifyFetchError, rilanciarlo
    if (error instanceof ShopifyFetchError) {
      throw error;
    }

    if (isShopifyError(error)) {
      throw new ShopifyFetchError(error.message, {
        status: error.status,
        reason: error.cause?.toString(),
        query,
      });
    }

    const message =
      error instanceof Error ? error.message : "Unexpected Shopify fetch error";

    throw new ShopifyFetchError(message, { query });
  }
}

// Rende una lettura Shopify tollerante ai guasti: se lo Storefront API non
// risponde (es. 404/rete), logga un warning e restituisce un fallback vuoto
// così la UI mostra la sezione senza prodotti invece di andare in crash.
async function withShopifyFallback<T>(
  label: string,
  fallback: T,
  operation: () => Promise<T>,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof ShopifyFetchError) {
      console.warn(
        `[shopify] ${label} non disponibile (status ${error.status}: ${error.reason ?? error.message}). Restituisco un risultato vuoto.`,
      );
      return fallback;
    }

    throw error;
  }
}

const removeEdgesAndNodes = (array: Connection<any>) => {
  return array.edges.map((edge) => edge?.node);
};

const reshapeCart = (cart: ShopifyCart): Cart => {
  if (!cart.cost?.totalTaxAmount) {
    cart.cost.totalTaxAmount = {
      amount: "0.0",
      currencyCode:
        cart.cost?.totalAmount?.currencyCode ||
        cart.cost?.subtotalAmount?.currencyCode ||
        "USD",
    };
  }

  return { ...cart, lines: removeEdgesAndNodes(cart.lines) };
};

const reshapeCollection = (
  collection: ShopifyCollection,
): Collection | undefined => {
  if (!collection) {
    return undefined;
  }

  return { ...collection, path: `/products/${collection.handle}` };
};

const reshapeCollections = (collections: ShopifyCollection[]) => {
  const reshapedCollections = [];

  for (const collection of collections) {
    if (collection) {
      const reshapedCollection = reshapeCollection(collection);

      if (reshapedCollection) {
        reshapedCollections.push(reshapedCollection);
      }
    }
  }

  return reshapedCollections;
};

const reshapeImages = (images: Connection<Image>, productTitle: string) => {
  const flattened = removeEdgesAndNodes(images);

  return flattened.map((image, index) => {
    if (!image) {
      return image;
    }

    const match = image.url.match(/.*\/([^\/?#]+)(?:\.[^./?#]+)?/);
    const derivedAlt = match?.[1]
      ? `${productTitle} - ${match[1]}`
      : `${productTitle}${flattened.length > 1 ? ` (${index + 1})` : ""}`;

    return {
      ...image,
      altText: image.altText?.trim() || derivedAlt,
    };
  });
};

const reshapeProduct = (
  product: ShopifyProduct,
  filterHiddenProducts: boolean = true,
) => {
  if (
    !product ||
    (filterHiddenProducts && product.tags.includes(HIDDEN_PRODUCT_TAG))
  ) {
    return undefined;
  }

  const { images, variants, ...rest } = product;

  return {
    ...rest,
    images: reshapeImages(images, product.title),
    variants: removeEdgesAndNodes(variants),
  };
};

const reshapeProducts = (products: ShopifyProduct[]) => {
  const reshapedProducts = [];

  for (const product of products) {
    if (product) {
      const reshapedProduct = reshapeProduct(product);

      if (reshapedProduct) {
        reshapedProducts.push(reshapedProduct);
      }
    }
  }

  return reshapedProducts;
};

export async function createCart(context?: ShopifyContext): Promise<Cart> {
  const res = await shopifyFetch<ShopifyCreateCartOperation>({
    query: createCartMutation,
    variables: {
      ...(context && {
        buyerIdentity: { countryCode: context.country },
        country: context.country,
        language: context.language,
      }),
    },
    cache: "no-store",
  });

  return reshapeCart(res.body.data.cartCreate.cart);
}

export async function addToCart(
  cartId: string,
  lines: { merchandiseId: string; quantity: number }[],
  context?: ShopifyContext,
): Promise<Cart> {
  const res = await shopifyFetch<ShopifyAddToCartOperation>({
    query: addToCartMutation,
    variables: {
      cartId,
      lines,
      ...(context && { country: context.country, language: context.language }),
    },
    cache: "no-store",
  });
  return reshapeCart(res.body.data.cartLinesAdd.cart);
}

export async function removeFromCart(
  cartId: string,
  lineIds: string[],
  context?: ShopifyContext,
): Promise<Cart> {
  const res = await shopifyFetch<ShopifyRemoveFromCartOperation>({
    query: removeFromCartMutation,
    variables: {
      cartId,
      lineIds,
      ...(context && { country: context.country, language: context.language }),
    },
    cache: "no-store",
  });

  return reshapeCart(res.body.data.cartLinesRemove.cart);
}

export async function updateCart(
  cartId: string,
  lines: { id: string; merchandiseId: string; quantity: number }[],
  context?: ShopifyContext,
): Promise<Cart> {
  const res = await shopifyFetch<ShopifyUpdateCartOperation>({
    query: editCartItemsMutation,
    variables: {
      cartId,
      lines,
      ...(context && { country: context.country, language: context.language }),
    },
    cache: "no-store",
  });

  return reshapeCart(res.body.data.cartLinesUpdate.cart);
}

export async function updateCartBuyerIdentity(
  cartId: string,
  countryCode: string,
  context?: ShopifyContext,
): Promise<Cart> {
  const res = await shopifyFetch<ShopifyCartBuyerIdentityUpdateOperation>({
    query: cartBuyerIdentityUpdateMutation,
    variables: {
      cartId,
      buyerIdentity: { countryCode },
      ...(context && { country: context.country, language: context.language }),
    },
    cache: "no-store",
  });

  return reshapeCart(res.body.data.cartBuyerIdentityUpdate.cart);
}

export async function getCart(
  cartId: string,
  context?: ShopifyContext,
): Promise<Cart | undefined> {
  const res = await shopifyFetch<ShopifyCartOperation>({
    query: getCartQuery,
    variables: {
      cartId,
      ...(context && { country: context.country, language: context.language }),
    },
    tags: [TAGS.cart],
    cache: "no-store",
  });

  // Old carts becomes `null` when you checkout.
  if (!res.body.data.cart) {
    return undefined;
  }

  return reshapeCart(res.body.data.cart);
}

export async function getCollection(
  handle: string,
  context?: ShopifyContext,
): Promise<Collection | undefined> {
  return withShopifyFallback<Collection | undefined>(
    "getCollection",
    undefined,
    async () => {
      const res = await shopifyFetch<ShopifyCollectionOperation>({
        query: getCollectionQuery,
        tags: [TAGS.collections],
        variables: {
          handle,
          ...(context && {
            country: context.country,
            language: context.language,
          }),
        },
      });

      return reshapeCollection(res.body.data.collection);
    },
  );
}

export async function getCollectionProducts({
  collection,
  reverse,
  sortKey,
  filterCategoryProduct,
  context,
}: {
  collection: string;
  reverse?: boolean;
  sortKey?: string;
  filterCategoryProduct?: unknown[];
  context?: ShopifyContext;
}): Promise<{ pageInfo: PageInfo | null; products: Product[] }> {
  return withShopifyFallback<{
    pageInfo: PageInfo | null;
    products: Product[];
  }>("getCollectionProducts", { pageInfo: null, products: [] }, async () => {
    const res = await shopifyFetch<ShopifyCollectionProductsOperation>({
      query: getCollectionProductsQuery,
      tags: [TAGS.collections, TAGS.products],
      variables: {
        handle: collection,
        reverse,
        sortKey: sortKey === "CREATED_AT" ? "CREATED" : sortKey,
        filterCategoryProduct,
        ...(context && {
          country: context.country,
          language: context.language,
        }),
      },
    });

    if (!res.body.data.collection) {
      return { pageInfo: null, products: [] };
    }

    const pageInfo = res.body.data?.collection?.products?.pageInfo;

    return {
      pageInfo,
      products: reshapeProducts(
        removeEdgesAndNodes(res.body.data.collection.products),
      ),
    };
  });
}

export async function createCustomer(input: CustomerInput): Promise<any> {
  const res = await shopifyFetch<registerOperation>({
    query: createCustomerMutation,
    variables: { input },
    cache: "no-store",
  });

  const customer = res.body.data?.customerCreate?.customer;
  const customerCreateErrors =
    res.body.data?.customerCreate?.customerUserErrors;

  return { customer, customerCreateErrors };
}

export async function getCustomerAccessToken({
  email,
  password,
}: Partial<CustomerInput>): Promise<any> {
  const res = await shopifyFetch<any>({
    query: getCustomerAccessTokenMutation,
    variables: { input: { email, password } },
  });

  const token =
    res.body.data?.customerAccessTokenCreate?.customerAccessToken?.accessToken;
  const customerLoginErrors =
    res?.body?.data?.customerAccessTokenCreate?.customerUserErrors;

  return { token, customerLoginErrors };
}

export async function getUserDetails(accessToken: string): Promise<user> {
  const response = await shopifyFetch<userOperation>({
    query: getUserDetailsQuery,
    variables: { input: accessToken },
    cache: "no-store",
  });

  return response.body.data;
}

export async function getCustomerOrders(accessToken: string): Promise<Order[]> {
  const response = await shopifyFetch<CustomerOrdersOperation>({
    query: getCustomerOrdersQuery,
    variables: { input: accessToken },
    cache: "no-store",
  });

  if (!response.body.data.customer?.orders) {
    return [];
  }

  return removeEdgesAndNodes(response.body.data.customer.orders);
}

export async function getCollections(
  context?: ShopifyContext,
): Promise<Collection[]> {
  return withShopifyFallback<Collection[]>("getCollections", [], async () => {
    const res = await shopifyFetch<ShopifyCollectionsOperation>({
      query: getCollectionsQuery,
      // Le collezioni cambiano di rado: cache persistente invalidata dal
      // webhook (revalidateTag(TAGS.collections)) invece di rifetch a ogni load.
      cache: "force-cache",
      tags: [TAGS.collections],
      variables: {
        ...(context && {
          country: context.country,
          language: context.language,
        }),
      },
    });
    const shopifyCollections = removeEdgesAndNodes(res.body?.data?.collections);
    const collections = [
      // Filter out the `hidden` collections.
      // Collections that start with `hidden-*` need to be hidden on the search page.
      ...reshapeCollections(shopifyCollections).filter(
        (collection) => !collection.handle.startsWith("hidden"),
      ),
    ];

    return collections;
  });
}

export async function getMenu(
  handle: string,
  context?: ShopifyContext,
): Promise<Menu[]> {
  return withShopifyFallback<Menu[]>("getMenu", [], async () => {
    const res = await shopifyFetch<ShopifyMenuOperation>({
      query: getMenuQuery,
      tags: [TAGS.collections],
      variables: {
        handle,
        ...(context && {
          country: context.country,
          language: context.language,
        }),
      },
    });

    return (
      res.body?.data?.menu?.items.map(
        (item: { title: string; url: string }) => ({
          title: item.title,
          path: item.url
            .replace(domain, "")
            .replace("/collections", "/search")
            .replace("/pages", ""),
        }),
      ) || []
    );
  });
}

export async function getPage(
  handle: string,
  context?: ShopifyContext,
): Promise<Page> {
  const res = await shopifyFetch<ShopifyPageOperation>({
    query: getPageQuery,
    variables: {
      handle,
      ...(context && { country: context.country, language: context.language }),
    },
  });

  return res.body.data.pageByHandle;
}

export async function getPages(context?: ShopifyContext): Promise<Page[]> {
  const res = await shopifyFetch<ShopifyPagesOperation>({
    query: getPagesQuery,
    variables: {
      ...(context && { country: context.country, language: context.language }),
    },
  });

  return removeEdgesAndNodes(res.body.data.pages);
}

export async function getProduct(
  handle: string,
  context?: ShopifyContext,
): Promise<Product | undefined> {
  return withShopifyFallback<Product | undefined>(
    "getProduct",
    undefined,
    async () => {
      const res = await shopifyFetch<ShopifyProductOperation>({
        query: getProductQuery,
        tags: [TAGS.products],
        variables: {
          handle,
          ...(context && {
            country: context.country,
            language: context.language,
          }),
        },
      });

      return reshapeProduct(res.body.data.product, false);
    },
  );
}

export async function getProductRecommendations(
  productId: string,
  context?: ShopifyContext,
): Promise<Product[]> {
  return withShopifyFallback<Product[]>(
    "getProductRecommendations",
    [],
    async () => {
      const res = await shopifyFetch<ShopifyProductRecommendationsOperation>({
        query: getProductRecommendationsQuery,
        tags: [TAGS.products],
        variables: {
          productId,
          ...(context && {
            country: context.country,
            language: context.language,
          }),
        },
      });

      return reshapeProducts(res.body.data.productRecommendations);
    },
  );
}

export async function getVendors({
  query,
  reverse,
  sortKey,
  context,
}: {
  query?: string;
  reverse?: boolean;
  sortKey?: string;
  context?: ShopifyContext;
}): Promise<{ vendor: string; productCount: number }[]> {
  return withShopifyFallback<{ vendor: string; productCount: number }[]>(
    "getVendors",
    [],
    async () => {
      const res = await shopifyFetch<ShopifyProductsOperation>({
        query: getVendorsQuery,
        tags: [TAGS.products],
        variables: {
          query,
          reverse,
          sortKey,
          ...(context && {
            country: context.country,
            language: context.language,
          }),
        },
      });

      const products = removeEdgesAndNodes(res.body.data.products);

      const vendorProductCounts: { vendor: string; productCount: number }[] =
        [];

      products.forEach((product) => {
        const vendor = product.vendor;
        if (vendor) {
          const existingVendor = vendorProductCounts.find(
            (v) => v.vendor === vendor,
          );

          if (existingVendor) {
            existingVendor.productCount++;
          } else {
            vendorProductCounts.push({ vendor, productCount: 1 });
          }
        }
      });

      return vendorProductCounts;
    },
  );
}

export async function getTags({
  query,
  reverse,
  sortKey,
  context,
}: {
  query?: string;
  reverse?: boolean;
  sortKey?: string;
  context?: ShopifyContext;
}): Promise<Product[]> {
  return withShopifyFallback<Product[]>("getTags", [], async () => {
    const res = await shopifyFetch<ShopifyProductsOperation>({
      query: getProductsQuery,
      tags: [TAGS.products],
      variables: {
        query,
        reverse,
        sortKey,
        ...(context && {
          country: context.country,
          language: context.language,
        }),
      },
    });

    return reshapeProducts(removeEdgesAndNodes(res.body.data.products));
  });
}

export async function getProducts({
  query,
  reverse,
  sortKey,
  cursor,
  context,
}: {
  query?: string;
  reverse?: boolean;
  sortKey?: string;
  cursor?: string;
  context?: ShopifyContext;
}): Promise<{ pageInfo: PageInfo; products: Product[] }> {
  return withShopifyFallback<{ pageInfo: PageInfo; products: Product[] }>(
    "getProducts",
    {
      pageInfo: { hasNextPage: false, hasPreviousPage: false, endCursor: "" },
      products: [],
    },
    async () => {
      const res = await shopifyFetch<ShopifyProductsOperation>({
        query: getProductsQuery,
        tags: [TAGS.products],
        variables: {
          query,
          reverse,
          sortKey,
          cursor,
          ...(context && {
            country: context.country,
            language: context.language,
          }),
        },
      });

      const pageInfo = res.body.data?.products?.pageInfo;

      return {
        pageInfo,
        products: reshapeProducts(removeEdgesAndNodes(res.body.data.products)),
      };
    },
  );
}

export async function getHighestProductPrice(
  context?: ShopifyContext,
): Promise<{
  amount: string;
  currencyCode: string;
} | null> {
  try {
    const res = await shopifyFetch<any>({
      query: getHighestProductPriceQuery,
      variables: {
        ...(context && {
          country: context.country,
          language: context.language,
        }),
      },
    });

    const highestProduct = res?.body?.data?.products?.edges[0]?.node;
    const highestProductPrice = highestProduct?.variants?.edges[0]?.node?.price;

    return highestProductPrice || null;
  } catch (error) {
    console.warn("Error fetching highest product price:", error);
    return null;
  }
}

// This is called from `app/api/revalidate.ts` so providers can control revalidation logic.
export async function revalidate(req: NextRequest): Promise<NextResponse> {
  // We always need to respond with a 200 status code to Shopify,
  // otherwise it will continue to retry the request.
  const collectionWebhooks = [
    "collections/create",
    "collections/delete",
    "collections/update",
  ];
  const productWebhooks = [
    "products/create",
    "products/delete",
    "products/update",
  ];
  const topic = (await headers()).get("x-shopify-topic") || "unknown";
  const secret = req.nextUrl.searchParams.get("secret");
  const isCollectionUpdate = collectionWebhooks.includes(topic);
  const isProductUpdate = productWebhooks.includes(topic);

  if (!secret || secret !== process.env.SHOPIFY_API_SECRET_KEY) {
    console.error("Invalid revalidation secret.");
    return NextResponse.json({ status: 200 });
  }

  if (!isCollectionUpdate && !isProductUpdate) {
    // We don't need to revalidate anything for any other topics.
    return NextResponse.json({ status: 200 });
  }

  if (isCollectionUpdate) {
    revalidateTag(TAGS.collections);
  }

  if (isProductUpdate) {
    revalidateTag(TAGS.products);
  }

  return NextResponse.json({ status: 200, revalidated: true, now: Date.now() });
}
