export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import CollectionsSlider from "@/components/CollectionsSlider";
import HeroSection from "@/components/HeroSection";
import TrustBar from "@/components/TrustBar";
import ReviewsSection from "@/components/ReviewsSection";
import ValueProposition from "@/components/ValueProposition";
import NewsletterSignup from "@/components/NewsletterSignup";
import SkeletonCategory from "@/layouts/components/loadings/skeleton/SkeletonCategory";
import config from "@/config/config.json";
import { getListPage } from "@/lib/contentParser";
import { getCollections } from "@/lib/shopify";
import CallToAction from "@/partials/CallToAction";
import { getMetadataAlternates } from "@/lib/i18n/metadata";
import SeoMeta from "@/partials/SeoMeta";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { shopifyContext } from "@/lib/i18n/config";

export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getTranslations("common");

  return {
    title: config.site.title,
    description: t("featuredProductsDescription"),
    alternates: getMetadataAlternates("/"),
  };
};

const ShowCollections = async ({
  context,
}: {
  context?: { country: string; language: string };
}) => {
  const allCollections = await getCollections(context);
  return <CollectionsSlider collections={allCollections} />;
};

const Home = async () => {
  const t = await getTranslations("common");
  const context = shopifyContext;

  const callToAction = getListPage("sections/call-to-action.md");

  return (
    <>
      <SeoMeta />
      <section className="relative min-h-[650px] md:min-h-[750px] lg:min-h-[80vh] flex items-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=2400&auto=format&fit=crop')",
            }}
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-white/50 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 w-full">
          <HeroSection />
        </div>
      </section>

      {/* Trust Bar */}
      <TrustBar />

      {/* category section  */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-6 md:mb-14">
            <h2 className="mb-3">{t("exploreByCategory")}</h2>
            <p className="text-lg text-text  max-w-2xl mx-auto">
              {t("exploreByCategoryDescription")}
            </p>
          </div>
          <Suspense fallback={<SkeletonCategory />}>
            <ShowCollections context={context} />
          </Suspense>
        </div>
      </section>

      {/* Reviews Section */}
      <ReviewsSection />

      {/* Value Proposition / Chi Siamo */}
      <ValueProposition />

      {/* Newsletter Signup */}
      <NewsletterSignup />

      <CallToAction data={callToAction} />
    </>
  );
};

export default Home;
