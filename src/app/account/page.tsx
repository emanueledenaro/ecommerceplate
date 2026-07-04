"use client";

import Breadcrumbs from "@/layouts/components/Breadcrumbs";
import PageHeader from "@/layouts/partials/PageHeader";
import SeoMeta from "@/layouts/partials/SeoMeta";
import SkeletonAccount from "@/layouts/components/loadings/skeleton/SkeletonAccount";
import type { user } from "@/lib/shopify/types";
import { fetchUser } from "@/layouts/components/NavUser";
import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import Gravatar from "react-gravatar";
import { BsPerson, BsBox, BsFileText, BsCreditCard } from "react-icons/bs";
import { useTranslations } from "next-intl";

type Customer = user["customer"] | null;

const AccountPage = () => {
  const router = useRouter();
  const t = useTranslations("account");
  const [customer, setCustomer] = useState<Customer>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const userInfo = await fetchUser();
      if (!userInfo) {
        router.push("/login");
        return;
      }
      setCustomer(userInfo);
      setLoading(false);
    };

    getUser();
  }, [router]);

  if (loading) {
    return (
      <>
        <SeoMeta
          title={t("title")}
          meta_title={t("title")}
          description={t("description")}
        />
        <PageHeader title={t("title")} />
        <SkeletonAccount />
      </>
    );
  }

  if (!customer) {
    return null;
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
            {/* User Profile */}
            <div className="bg-white  border border-border  rounded-2xl p-6 md:p-8 mb-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="flex-shrink-0">
                  <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-border  flex items-center justify-center bg-light ">
                    <Gravatar
                      email={customer.email ?? ""}
                      style={{ borderRadius: "50px" }}
                      size={96}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-text-dark  mb-2">
                    {customer.firstName} {customer.lastName}
                  </h2>
                  <p className="text-text-light  mb-1">{customer.email}</p>
                  {customer.phone && (
                    <p className="text-text-light ">{customer.phone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Options Menu */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* My Orders */}
              <Link
                href="/orders"
                className="bg-white  border border-border  rounded-2xl p-6 hover:border-primary  transition-colors group"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-primary/10  flex items-center justify-center group-hover:bg-primary/20  transition-colors">
                      <BsBox className="text-primary  text-xl" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-text-dark  mb-1">
                      {t("myOrders")}
                    </h3>
                    <p className="text-sm text-text-light ">
                      {t("myOrdersDesc")}
                    </p>
                  </div>
                </div>
              </Link>

              {/* Addresses */}
              <div className="bg-white  border border-border  rounded-2xl p-6 opacity-50 cursor-not-allowed">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-gray-100  flex items-center justify-center">
                      <BsCreditCard className="text-gray-400 text-xl" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-text-dark  mb-1">
                      {t("addresses")}
                    </h3>
                    <p className="text-sm text-text-light ">
                      {t("addressesDesc")}
                    </p>
                    <span className="text-xs text-text-light  mt-2 inline-block">
                      ({t("comingSoon")})
                    </span>
                  </div>
                </div>
              </div>

              {/* Personal Data */}
              <div className="bg-white  border border-border  rounded-2xl p-6 opacity-50 cursor-not-allowed">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-gray-100  flex items-center justify-center">
                      <BsPerson className="text-gray-400 text-xl" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-text-dark  mb-1">
                      {t("personalData")}
                    </h3>
                    <p className="text-sm text-text-light ">
                      {t("personalDataDesc")}
                    </p>
                    <span className="text-xs text-text-light  mt-2 inline-block">
                      ({t("comingSoon")})
                    </span>
                  </div>
                </div>
              </div>

              {/* Privacy and Security */}
              <div className="bg-white  border border-border  rounded-2xl p-6 opacity-50 cursor-not-allowed">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-gray-100  flex items-center justify-center">
                      <BsFileText className="text-gray-400 text-xl" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-text-dark  mb-1">
                      {t("privacySecurity")}
                    </h3>
                    <p className="text-sm text-text-light ">
                      {t("privacySecurityDesc")}
                    </p>
                    <span className="text-xs text-text-light  mt-2 inline-block">
                      ({t("comingSoon")})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AccountPage;
