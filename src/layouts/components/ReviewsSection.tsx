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

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, index) => (
          <span
            key={index}
            className={`text-lg ${
              index < rating ? "text-rating-gold" : "text-border "
            }`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-white to-light/30  ">
      <div className="container">
        <div className="text-center mb-10 md:mb-14">
          <h2 className="mb-3">{t("title")}</h2>
          <p className="text-lg text-text  max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={24}
          slidesPerView={1}
          pagination={{
            clickable: true,
            bulletClass: "review-pagination-bullet",
            bulletActiveClass: "review-pagination-bullet-active",
          }}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          breakpoints={{
            640: {
              slidesPerView: 2,
            },
            1024: {
              slidesPerView: 3,
            },
          }}
          className="pb-12 [&_.swiper-slide]:h-auto"
        >
          {reviews.map((review, index) => (
            <SwiperSlide key={index} className="flex">
              <div className="flex h-full w-full flex-col bg-white  p-6 md:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-border/20 ">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-bold text-text-dark  mb-1">
                      {review.name}
                    </h4>
                    <p className="text-sm text-text ">{review.date}</p>
                  </div>
                  {renderStars(review.rating)}
                </div>

                <p className="text-text  mb-4 leading-relaxed">
                  &ldquo;{review.comment}&rdquo;
                </p>

                <div className="mt-auto pt-4 border-t border-border/30 ">
                  <p className="text-sm font-medium text-primary ">
                    📦 {review.product}
                  </p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Trust indicators */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 md:gap-12">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary  mb-1">
              10.000+
            </div>
            <p className="text-sm text-text ">{t("productsSold")}</p>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary  mb-1">
              4.9/5
            </div>
            <p className="text-sm text-text ">{t("averageRating")}</p>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary  mb-1">
              98%
            </div>
            <p className="text-sm text-text ">{t("satisfiedCustomers")}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
