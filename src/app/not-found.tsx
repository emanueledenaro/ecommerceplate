import SeoMeta from "@/partials/SeoMeta";
import { Link } from "@/i18n/navigation";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";

const NotFound = async () => {
  const t = await getTranslations("notFound");

  return (
    <>
      <Suspense fallback={null}>
        <SeoMeta title={t("seoTitle")} />
      </Suspense>
      <style>{`
        header.header,
        footer {
          display: none !important;
        }
      `}</style>
      <main className="min-h-screen flex flex-col items-center justify-center bg-body  px-4">
        <div className="text-center max-w-xl">
          <span className="block text-[10rem] leading-none font-bold text-primary ">
            404
          </span>
          <h1 className="h2 mb-4 text-text-dark ">{t("title")}</h1>
          <p className="text-text-light  mb-8">{t("description")}</p>
          <Link
            href="/"
            className="btn btn-primary inline-flex items-center justify-center"
          >
            {t("backToHome")}
          </Link>
        </div>
      </main>
    </>
  );
};

export default NotFound;
