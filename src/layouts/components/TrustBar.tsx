"use client";

import React, { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

interface TrustItem {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const TrustBar = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("trustBar");

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    // Auto-scroll solo su mobile (< 768px)
    const isMobile = window.innerWidth < 768;
    if (!isMobile) return;

    let scrollAmount = 0;
    const scrollSpeed = 0.2; // Ridotto da 0.5 a 0.2 per movimento più lento
    let animationFrameId: number;

    const autoScroll = () => {
      if (!scrollContainer) return;

      scrollAmount += scrollSpeed;
      scrollContainer.scrollLeft = scrollAmount;

      // Reset quando arriva alla fine
      if (scrollAmount >= scrollContainer.scrollWidth / 2) {
        scrollAmount = 0;
      }

      animationFrameId = requestAnimationFrame(autoScroll);
    };

    animationFrameId = requestAnimationFrame(autoScroll);

    // Pausa scroll su touch/hover
    const handleMouseEnter = () => cancelAnimationFrame(animationFrameId);
    const handleMouseLeave = () => {
      animationFrameId = requestAnimationFrame(autoScroll);
    };

    scrollContainer.addEventListener("mouseenter", handleMouseEnter);
    scrollContainer.addEventListener("mouseleave", handleMouseLeave);
    scrollContainer.addEventListener("touchstart", handleMouseEnter);
    scrollContainer.addEventListener("touchend", handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationFrameId);
      scrollContainer.removeEventListener("mouseenter", handleMouseEnter);
      scrollContainer.removeEventListener("mouseleave", handleMouseLeave);
      scrollContainer.removeEventListener("touchstart", handleMouseEnter);
      scrollContainer.removeEventListener("touchend", handleMouseLeave);
    };
  }, []);

  const trustItems: TrustItem[] = [
    {
      icon: (
        <svg
          className="w-8 h-8 md:w-10 md:h-10"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
          />
        </svg>
      ),
      title: t("freeShippingTitle"),
      description: t("freeShippingDescription"),
    },
    {
      icon: (
        <svg
          className="w-8 h-8 md:w-10 md:h-10"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      ),
      title: t("easyReturnsTitle"),
      description: t("easyReturnsDescription"),
    },
    {
      icon: (
        <svg
          className="w-8 h-8 md:w-10 md:h-10"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
      title: t("securePaymentsTitle"),
      description: t("securePaymentsDescription"),
    },
    {
      icon: (
        <svg
          className="w-8 h-8 md:w-10 md:h-10"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
          />
        </svg>
      ),
      title: t("selectedProductsTitle"),
      description: t("selectedProductsDescription"),
    },
  ];

  return (
    <section className="py-8 md:py-12 bg-light/30  border-y border-border/50  overflow-hidden">
      <div className="container">
        {/* Mobile: scroll orizzontale con auto-scroll | Desktop: grid statico */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide md:grid md:grid-cols-4 md:gap-8 md:overflow-visible"
        >
          {/* Primi 4 items originali - sempre visibili */}
          {trustItems.map((item, index) => (
            <div
              key={`original-${index}`}
              className="flex flex-col items-center text-center gap-2 group min-w-[220px] flex-shrink-0 md:min-w-0 md:gap-3"
            >
              <div className="text-primary">{item.icon}</div>
              <div>
                <h3 className="text-base md:text-lg font-bold text-text-dark  mb-1 whitespace-nowrap">
                  {item.title}
                </h3>
                <p className="text-sm text-text  whitespace-nowrap">
                  {item.description}
                </p>
              </div>
            </div>
          ))}

          {/* Duplicati per scroll infinito - solo mobile */}
          {trustItems.map((item, index) => (
            <div
              key={`duplicate-${index}`}
              className="flex md:hidden flex-col items-center text-center gap-2 group min-w-[220px] flex-shrink-0"
            >
              <div className="text-primary">{item.icon}</div>
              <div>
                <h3 className="text-base md:text-lg font-bold text-text-dark  mb-1 whitespace-nowrap">
                  {item.title}
                </h3>
                <p className="text-sm text-text  whitespace-nowrap">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBar;
