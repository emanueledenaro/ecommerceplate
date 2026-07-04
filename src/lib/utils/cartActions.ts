"use server";

import { TAGS } from "@/lib/constants";
import { shopifyContext } from "@/lib/i18n/config";
import {
  addToCart,
  createCart,
  getCart,
  removeFromCart,
  updateCart,
} from "@/lib/shopify";
import type { Cart, ShopifyContext } from "@/lib/shopify/types";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";

export type CartActionResult =
  | { status: "success" }
  | { status: "error"; message: string };

const cartCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 30, // 30 giorni
};

const success = (): CartActionResult => ({ status: "success" });
const failure = (message: string): CartActionResult => ({
  status: "error",
  message,
});

const getShopifyContext = async (): Promise<ShopifyContext> => shopifyContext;

const ensureCart = async (): Promise<{ cartId: string; cart: Cart }> => {
  const cookieStore = await cookies();
  const existingCartId = cookieStore.get("cartId")?.value;
  const context = await getShopifyContext();

  if (existingCartId) {
    const existingCart = await getCart(existingCartId, context);
    if (existingCart) {
      cookieStore.set({
        name: "cartId",
        value: existingCartId,
        ...cartCookieOptions,
      });
      return { cartId: existingCartId, cart: existingCart };
    }
  }

  const newCart = await createCart(context);
  cookieStore.set({
    name: "cartId",
    value: newCart.id,
    ...cartCookieOptions,
  });

  return { cartId: newCart.id, cart: newCart };
};

export async function addItem(
  _prevState: CartActionResult | null,
  formData: FormData,
): Promise<CartActionResult> {
  const selectedVariantId = formData.get("variantId")?.toString();

  if (!selectedVariantId) {
    return failure("Missing product variant ID");
  }

  try {
    const { cartId } = await ensureCart();
    const context = await getShopifyContext();

    await addToCart(
      cartId,
      [{ merchandiseId: selectedVariantId, quantity: 1 }],
      context,
    );
    revalidateTag(TAGS.cart);

    return success();
  } catch (cause) {
    console.error("Error adding item to cart", cause);
    return failure("Error adding item to cart");
  }
}

export async function removeItem(
  _prevState: CartActionResult | null,
  formData: FormData,
): Promise<CartActionResult> {
  const lineId = formData.get("lineId")?.toString();

  if (!lineId) {
    return failure("Missing line ID");
  }

  const cookieStore = await cookies();
  const cartId = cookieStore.get("cartId")?.value;

  if (!cartId) {
    return failure("Missing cart ID");
  }

  try {
    const context = await getShopifyContext();
    await removeFromCart(cartId, [lineId], context);
    revalidateTag(TAGS.cart);
    return success();
  } catch (cause) {
    console.error("Error removing item from cart", cause);
    return failure("Error removing item from cart");
  }
}

export async function updateItemQuantity(
  _prevState: CartActionResult | null,
  formData: FormData,
): Promise<CartActionResult> {
  const lineId = formData.get("lineId")?.toString();
  const variantId = formData.get("variantId")?.toString();
  const quantity = parseInt(formData.get("quantity")?.toString() || "0");

  if (!lineId || !variantId) {
    return failure("Missing required fields");
  }

  const cookieStore = await cookies();
  const cartId = cookieStore.get("cartId")?.value;

  if (!cartId) {
    return failure("Missing cart ID");
  }

  try {
    const context = await getShopifyContext();

    if (quantity === 0) {
      await removeFromCart(cartId, [lineId], context);
      revalidateTag(TAGS.cart);
      return success();
    }

    await updateCart(
      cartId,
      [{ id: lineId, merchandiseId: variantId, quantity }],
      context,
    );
    revalidateTag(TAGS.cart);
    return success();
  } catch (cause) {
    console.error("Error updating item quantity", cause);
    return failure("Error updating item quantity");
  }
}
