"use client";

import { useEffect, useState } from "react";

type ProductGalleryProps = {
  images: string[];
  productName: string;

  selectedImage: string | null;
  onImageSelect: (image: string) => void;
};

export function ProductGallery({
  images,
  productName,
  selectedImage,
  onImageSelect,
}: ProductGalleryProps) {
  const safeImages = images.filter(Boolean);

  const [selectedIndex, setSelectedIndex] = useState(() => {
    if (!selectedImage) return 0;

    const index = safeImages.indexOf(selectedImage);

    return index >= 0 ? index : 0;
  });

  useEffect(() => {
    if (!selectedImage) return;

    const index = safeImages.indexOf(selectedImage);

    if (index >= 0) {
      setSelectedIndex(index);
    }
  }, [selectedImage, safeImages]);

  function handleSelect(index: number) {
    const image = safeImages[index];

    if (!image) return;

    setSelectedIndex(index);
    onImageSelect(image);
  }

  if (safeImages.length === 0) {
    return (
      <div className="min-w-0">
        <div className="flex aspect-square items-center justify-center rounded-2xl bg-gray-50">
          <span className="text-6xl">🛍️</span>
        </div>
      </div>
    );
  }

  const currentImage =
    safeImages[selectedIndex] ?? safeImages[0];

  return (
    <div className="min-w-0">
      {/* Main Image */}
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-50">
        <img
          src={currentImage}
          alt={productName}
          className="h-full w-full object-cover transition-opacity duration-200"
        />
      </div>

      {/* Thumbnails */}
      {safeImages.length > 1 && (
        <>
          <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
            {safeImages.map((image, index) => {
              const active = index === selectedIndex;

              return (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => handleSelect(index)}
                  className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition ${
                    active
                      ? "border-brand-500 ring-2 ring-brand-100"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                  aria-label={`${productName} ছবি ${index + 1}`}
                  aria-pressed={active}
                >
                  <img
                    src={image}
                    alt={`${productName} ${index + 1}`}
                    className="h-full w-full object-cover"
                  />

                  {active && (
                    <span className="absolute inset-0 bg-brand-500/10" />
                  )}
                </button>
              );
            })}
          </div>

          <p className="text-center text-xs text-gray-400">
            {selectedIndex + 1} / {safeImages.length}
          </p>
        </>
      )}
    </div>
  );
}