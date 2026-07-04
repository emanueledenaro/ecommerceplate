"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { JSX, useEffect, useRef, useState } from "react";
import {
  HiOutlineArrowNarrowLeft,
  HiOutlineArrowNarrowRight,
} from "react-icons/hi";
import type { Swiper as TSwiper } from "swiper";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import { FreeMode, Navigation, Thumbs } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import LoadingProductThumb from "../loadings/skeleton/SkeletonProductThumb";
import ImageLightbox from "./ImageLightbox";

export interface ImageItem {
  url: string;
  altText: string;
  width: number;
  height: number;
}

interface ProductGalleryProps {
  images: ImageItem[];
}

const ProductGallery = ({ images }: ProductGalleryProps): JSX.Element => {
  const [thumbsSwiper, setThumbsSwiper] = useState<TSwiper | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [loadingThumb, setLoadingThumb] = useState<boolean>(true);
  const [picUrl, setPicUrl] = useState<string>("");
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);

  // Detect touch device on component mount
  useEffect(() => {
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  const searchParams = useSearchParams().get("color");

  const prevRef = useRef<HTMLDivElement | null>(null);
  const nextRef = useRef<HTMLDivElement | null>(null);

  const altTextArray: string[] = images.map((item: ImageItem) => item.altText);

  const filteredImages: ImageItem[] = images.filter(
    (item: ImageItem) => item.altText === altTextArray[activeIndex],
  );

  useEffect(() => {
    if (searchParams) {
      const foundIndex: number = altTextArray.indexOf(searchParams);
      setActiveIndex(foundIndex !== -1 ? foundIndex : 0);
    }
    setLoadingThumb(false);
  }, [searchParams, altTextArray]);

  const handleSlideChange = (swiper: TSwiper): void => {
    setActiveIndex(swiper.activeIndex);
    setPicUrl(filteredImages[swiper.activeIndex]?.url || "");
  };

  const handleThumbSlideClick = (clickedUrl: string): void => {
    const foundIndex: number = filteredImages.findIndex(
      (item: ImageItem) => item.url === clickedUrl,
    );
    if (foundIndex !== -1) {
      setActiveIndex(foundIndex);
    }
  };

  const handleImageClick = (index: number): void => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const handleCloseLightbox = (): void => {
    setLightboxOpen(false);
  };

  if (loadingThumb) {
    return <LoadingProductThumb />;
  }

  return (
    <>
      <div
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Swiper
          spaceBetween={10}
          thumbs={{ swiper: thumbsSwiper }}
          modules={[FreeMode, Navigation, Thumbs]}
          navigation={{
            prevEl: prevRef.current,
            nextEl: nextRef.current,
          }}
          onSlideChange={handleSlideChange}
        >
          {filteredImages.map((item: ImageItem, index: number) => (
            <SwiperSlide key={item.url}>
              <div className="mb-6 border border-border  rounded-2xl max-h-[623px] overflow-hidden cursor-zoom-in group">
                <div
                  onClick={() => handleImageClick(index)}
                  className="relative w-full h-full"
                >
                  <Image
                    src={item.url}
                    alt={item.altText || `Immagine prodotto ${index + 1}`}
                    width={722}
                    height={623}
                    className="w-full h-full object-contain"
                    draggable={false}
                  />
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="bg-white/90  px-4 py-2 rounded-full text-sm font-medium text-text-dark ">
                      Clicca per ingrandire
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
          <div
            className={`hidden lg:block w-full absolute top-1/2 -translate-y-1/2 z-10 px-6 text-text-dark ${
              isHovered
                ? "opacity-100 transition-opacity duration-300 ease-in-out"
                : "opacity-0 transition-opacity duration-300 ease-in-out"
            }`}
          >
            <div
              ref={prevRef}
              className="p-2 lg:p-4 rounded-2xl bg-body cursor-pointer shadow-sm absolute left-4 hover:bg-primary/10  transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50  min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Immagine precedente"
            >
              <HiOutlineArrowNarrowLeft size={24} />
            </div>
            <div
              ref={nextRef}
              className="p-2 lg:p-4 rounded-2xl bg-body cursor-pointer shadow-sm absolute right-4 hover:bg-primary/10  transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50  min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Immagine successiva"
            >
              <HiOutlineArrowNarrowRight size={24} />
            </div>
          </div>
        </Swiper>
      </div>
      <Swiper
        onSwiper={setThumbsSwiper}
        spaceBetween={10}
        slidesPerView={isTouchDevice ? 3.5 : 4}
        freeMode={true}
        watchSlidesProgress={true}
        modules={[FreeMode, Navigation, Thumbs]}
      >
        {filteredImages.map((item: ImageItem, thumbIndex: number) => (
          <SwiperSlide key={item.url}>
            <div
              onClick={() => handleThumbSlideClick(item.url)}
              className={`rounded-2xl cursor-pointer overflow-hidden transition-all ${
                picUrl === item.url
                  ? "border-2 border-primary "
                  : "border border-border  hover:border-primary/50 "
              }`}
            >
              <Image
                src={item.url}
                alt={item.altText || `Miniatura prodotto ${thumbIndex + 1}`}
                width={168}
                height={146}
                loading="lazy"
                className="max-h-[146px]"
                draggable={false}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Lightbox */}
      <ImageLightbox
        images={filteredImages}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={handleCloseLightbox}
      />
    </>
  );
};

export default ProductGallery;
