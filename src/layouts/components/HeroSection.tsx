"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

const HeroSection = () => {
  const t = useTranslations("hero");

  return (
    <div className="container">
      <div className="row items-center min-h-[500px] md:min-h-[600px]">
        {/* Content */}
        <div className="col-12 lg:col-7 text-center lg:text-left py-12 lg:py-0">
          {/* Badge trust */}
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-success/15 text-success text-sm font-bold backdrop-blur-sm border border-success/30">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            {t("badge")}
          </div>

          {/* Headline UVP */}
          <h1 className="mb-4 text-5xl md:text-6xl lg:text-7xl font-bold text-text-dark  leading-[1.1]">
            {t("title")}
          </h1>

          {/* Subheadline breve */}
          <p className="mb-6 text-xl md:text-2xl text-text  max-w-xl mx-auto lg:mx-0 font-medium">
            {t("subtitle")}
          </p>

          {/* Social proof inline minimale */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-8">
            <div className="flex items-center gap-1.5">
              <span className="text-rating-gold text-lg">★★★★★</span>
              <span className="text-text-dark  font-semibold text-sm">
                4.9/5
              </span>
            </div>
            <span className="text-text/60  text-sm">• {t("reviewsCount")}</span>
          </div>

          {/* CTA Unica */}
          <Link
            className="btn btn-lg btn-primary inline-flex items-center gap-2 px-8 py-4 text-lg font-bold shadow-xl transition-all hover:shadow-2xl"
            href="/products"
          >
            {t("cta")}
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
        </div>

        {/* Visual space placeholder */}
        <div className="col-12 lg:col-5 hidden lg:block" />
      </div>
    </div>
  );
};

export default HeroSection;
