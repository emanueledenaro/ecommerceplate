"use client";

import Breadcrumbs from "@/layouts/components/Breadcrumbs";
import PageHeader from "@/layouts/partials/PageHeader";
import SeoMeta from "@/layouts/partials/SeoMeta";
import ImageFallback from "@/layouts/helpers/ImageFallback";
import SkeletonOrders from "@/layouts/components/loadings/skeleton/SkeletonOrders";
import { Link } from "@/i18n/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { fetchUser } from "@/layouts/components/NavUser";
import type { Order, OrderLineItem } from "@/lib/shopify/types";
import { BsBox } from "react-icons/bs";
import { useTranslations } from "next-intl";
import { intlLocale } from "@/lib/i18n/config";

const OrdersPage = () => {
  const router = useRouter();
  const t = useTranslations("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getOrders = async () => {
      const userInfo = await fetchUser();
      if (!userInfo) {
        router.push("/login");
        return;
      }

      try {
        const response = await fetch("/api/customer/orders", {
          credentials: "same-origin",
        });

        const data = (await response.json()) as {
          orders: Order[];
          error?: string;
        };

        if (!response.ok) {
          if (response.status === 401) {
            router.push("/login");
            return;
          }
          throw new Error(data.error || "Failed to fetch orders");
        }

        setOrders(data.orders || []);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    getOrders();
  }, [router]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(intlLocale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: string, currencyCode: string) => {
    return new Intl.NumberFormat(intlLocale, {
      style: "currency",
      currency: currencyCode,
    }).format(parseFloat(amount));
  };

  const getFinancialStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      PAID: t("paid"),
      PENDING: t("pending"),
      AUTHORIZED: t("authorized"),
      PARTIALLY_PAID: t("partiallyPaid"),
      PARTIALLY_REFUNDED: t("partiallyRefunded"),
      REFUNDED: t("refunded"),
      VOIDED: t("voided"),
    };
    return statusMap[status] || status;
  };

  const getFulfillmentStatusLabel = (status: string | null) => {
    if (!status) return t("unfulfilled");
    const statusMap: Record<string, string> = {
      FULFILLED: t("fulfilled"),
      UNFULFILLED: t("unfulfilled"),
      PARTIAL: t("partiallyFulfilled"),
      RESTOCKED: t("restocked"),
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <>
        <SeoMeta
          title={t("title")}
          meta_title={t("title")}
          description={t("description")}
        />
        <PageHeader title={t("title")} />
        <SkeletonOrders />
      </>
    );
  }

  return (
    <>
      <SeoMeta
        title={t("title")}
        meta_title={t("title")}
        description={t("description")}
      />
      <PageHeader title={t("title")} />
      <section className="section">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            {orders.length === 0 ? (
              <div className="bg-white  border border-border  rounded-2xl p-12 text-center">
                <BsBox className="text-6xl text-text-light  mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-text-dark  mb-2">
                  {t("noOrders")}
                </h2>
                <p className="text-text-light  mb-6">{t("noOrdersDesc")}</p>
                <Link href="/products" className="btn btn-primary inline-block">
                  {t("goToShop")}
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const lineItems = order.lineItems.edges.map(
                    (edge) => edge.node,
                  );

                  return (
                    <div
                      key={order.id}
                      className="bg-white  border border-border  rounded-2xl p-6 hover:border-primary  transition-colors"
                    >
                      {/* Order Header */}
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 pb-6 border-b border-border/20 ">
                        <div>
                          <h3 className="text-lg font-semibold text-text-dark  mb-1">
                            {t("orderNumber", { name: order.name })}
                          </h3>
                          <p className="text-sm text-text-light ">
                            {formatDate(order.processedAt)}
                          </p>
                        </div>
                        <div className="flex flex-col md:items-end gap-2">
                          <p className="text-xl font-bold text-text-dark ">
                            {formatCurrency(
                              order.totalPrice.amount,
                              order.totalPrice.currencyCode,
                            )}
                          </p>
                          <div className="flex gap-2 flex-wrap">
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary  ">
                              {getFinancialStatusLabel(order.financialStatus)}
                            </span>
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-light  text-text-dark ">
                              {getFulfillmentStatusLabel(
                                order.fulfillmentStatus,
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Line Items */}
                      <div className="space-y-3">
                        {lineItems.map((item: OrderLineItem) => (
                          <div key={item.id} className="flex gap-4 items-start">
                            {item.variant?.image && (
                              <div className="flex-shrink-0">
                                <Link
                                  href={`/products/${item.product?.handle || ""}`}
                                >
                                  <ImageFallback
                                    src={item.variant.image.url}
                                    alt={
                                      item.variant.image.altText || item.title
                                    }
                                    width={80}
                                    height={80}
                                    className="rounded-2xl border border-border "
                                  />
                                </Link>
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <Link
                                href={`/products/${item.product?.handle || ""}`}
                                className="font-medium text-text-dark  hover:text-primary  transition-colors"
                              >
                                {item.title}
                              </Link>
                              {item.variant?.title && (
                                <p className="text-sm text-text-light  mt-1">
                                  {item.variant.title}
                                </p>
                              )}
                              <div className="flex items-center gap-4 mt-2">
                                <span className="text-sm text-text-light ">
                                  {t("quantity")}: {item.quantity}
                                </span>
                                {item.variant?.price && (
                                  <span className="text-sm font-medium text-text-dark ">
                                    {formatCurrency(
                                      item.variant.price.amount,
                                      item.variant.price.currencyCode,
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default OrdersPage;
