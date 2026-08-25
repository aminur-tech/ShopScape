"use client";

import { useState } from "react";

import { ProductGallery } from "@/components/site/ProductGallery";
import { AddToCartBox } from "@/components/site/AddToCartBox";
import { formatBDT } from "@/lib/format";

import type { Product } from "@/lib/types";

export function ProductDetailClient({
  product,
}: {
  product: Product;
}) {
  const images = (product.images ?? []).filter(Boolean);

  const [selectedImage, setSelectedImage] =
    useState<string | null>(
      images[0] ?? null
    );

  const hasDiscount =
    product.discountPrice != null &&
    product.discountPrice < product.price;

  const displayPrice =
    product.discountPrice ?? product.price;

  const sizes = (product.sizes ?? []).filter(Boolean);

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:gap-10">

      {/* Gallery */}

      <ProductGallery
        images={images}
        productName={product.name}
        selectedImage={selectedImage}
        onImageSelect={setSelectedImage}
      />

      {/* Product Information */}

      <div className="min-w-0">

        {/* Category */}

        {product.category && (
          <p className="text-sm font-medium text-brand-600">
            {product.category.name}
          </p>
        )}

        {/* Name */}

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          {product.name}
        </h1>

        {/* Price */}

        <div className="mt-4 flex flex-wrap items-center gap-3">

          <span className="text-2xl font-bold text-brand-600">
            {formatBDT(displayPrice)}
          </span>

          {hasDiscount && (
            <>
              <span className="text-base text-gray-400 line-through">
                {formatBDT(product.price)}
              </span>

              {product.discountPercent != null && (
                <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
                  {product.discountPercent}% OFF
                </span>
              )}
            </>
          )}
        </div>

        {/* Stock */}

        <div className="mt-4">

          {product.stock > 0 ? (
            <span className="inline-flex items-center gap-2 text-sm font-medium text-green-600">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              স্টকে আছে
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 text-sm font-medium text-red-600">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              স্টকে নেই
            </span>
          )}

        </div>

        <div className="my-5 border-t border-gray-100" />

        {/* Description */}

        {product.description && (
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              প্রোডাক্ট সম্পর্কে
            </h2>

            <p className="mt-2 whitespace-pre-line text-sm leading-7 text-gray-600">
              {product.description}
            </p>
          </div>
        )}

        {/* Size Chart */}

        {sizes.length > 0 &&
          product.sizeChart && (
            <div
              id="size-chart"
              className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4"
            >
              <h2 className="text-sm font-semibold text-gray-900">
                সাইজ চার্ট
              </h2>

              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-600">
                {product.sizeChart}
              </p>
            </div>
          )}

        {/* Add To Cart */}

        <AddToCartBox
          product={product}
          selectedImage={selectedImage}
        />

      </div>
    </div>
  );
}