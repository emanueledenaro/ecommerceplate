"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

interface Review {
  name: string;
  rating: number;
  comment: string;
  product: string;
  date: string;
}

const ReviewsSection = () => {
  const t = useTranslations("reviews");
  const reviews: Review[] = [
    {
      name: t("reviewOneName"),
      rating: 5,
      comment: t("reviewOneComment"),
      product: t("reviewOneProduct"),
      date: t("reviewOneDate"),
    },
    {
      name: t("reviewTwoName"),
      rating: 5,
      comment: t("reviewTwoComment"),
      product: t("reviewTwoProduct"),
      date: t("reviewTwoDate"),
    },
    {
      name: t("reviewThreeName"),
      rating: 5,
      comment: t("reviewThreeComment"),
      product: t("reviewThreeProduct"),
      date: t("reviewThreeDate"),
    },
    {
      name: t("reviewFourName"),
      rating: 5,
      comment: t("reviewFourComment"),
      product: t("reviewFourProduct"),
      date: t("reviewFourDate"),
    },
  ];

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5 text-sm" aria-label={`${rating}/5`} role="img">
      {[...Array(5)].map((_, index) => (
        <span
          key={index}
          className={index < rating ? "text-rating-gold" : "text-border"}
        >
          ★
        </span>
      ))}
    </div>
  );

  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-white to-light/30">
      <div className="container">
        <div className="text-center mb-10 md:mb-14">
          <h2 className="mb-3">{t("title")}</h2>
          <p className="text-lg text-text max-w-2xl mx-auto">{t("subtitle")}</p>
        </div>

        <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={24}
          slidesPerView={1}
          loop
          speed={36000}
          allowTouchMove={false}
          pagination={{
            clickable: true,
            bulletClass: "review-pagination-bullet",
            bulletActiveClass: "review-pagination-bullet-active",
          }}
          autoplay={{
            delay: 0,
            disableOnInteraction: false,
          }}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="px-2 pt-2 pb-10 [&_.swiper-wrapper]:items-stretch [&_.swiper-wrapper]:ease-linear [&_.swiper-slide]:h-auto [&_.swiper-slide]:self-stretch"
        >
          {reviews.map((review) => (
            <SwiperSlide
              key={review.name}
              style={{ height: "auto", display: "flex" }}
            >
              <article className="relative flex h-full w-full flex-col overflow-hidden rounded-3xl border border-border/40 bg-white p-6 shadow-none transition-colors duration-200 hover:border-primary/30 md:p-7">
                {/* Quote decorativa */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-3 right-4 font-primary text-[7rem] leading-none text-primary/10 select-none"
                >
                  &rdquo;
                </span>

                {/* Intestazione: nome + data */}
                <div className="min-w-0">
                  <h4 className="truncate text-base font-bold text-text-dark">
                    {review.name}
                  </h4>
                  <p className="text-xs text-text-light">{review.date}</p>
                </div>

                {/* Stelle */}
                <div className="mt-4">{renderStars(review.rating)}</div>

                {/* Commento */}
                <p className="mt-3 leading-relaxed text-text">
                  &ldquo;{review.comment}&rdquo;
                </p>

                {/* Footer ancorato: prodotto + verificata */}
                <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-border/30 pt-4">
                  <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-light px-3 py-1 text-xs font-medium text-text-dark">
                    <span aria-hidden="true">🐾</span>
                    <span className="truncate">{review.product}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                    <svg
                      aria-hidden="true"
                      className="h-3.5 w-3.5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {t("verifiedPurchase")}
                  </span>
                </div>
              </article>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Trust indicators */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-8 md:mt-10 md:gap-12">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary mb-1">
              10.000+
            </div>
            <p className="text-sm text-text">{t("productsSold")}</p>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary mb-1">
              4.9/5
            </div>
            <p className="text-sm text-text">{t("averageRating")}</p>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary mb-1">
              98%
            </div>
            <p className="text-sm text-text">{t("satisfiedCustomers")}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
