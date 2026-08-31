"use client";

import { useEffect, useState } from "react";

import { ProductGallery } from "@/components/site/ProductGallery";
import { AddToCartBox } from "@/components/site/AddToCartBox";
import { ProductCard } from "@/components/site/ProductCard";

import { apiFetch } from "@/lib/api";
import { formatBDT } from "@/lib/format";

import type { Product } from "@/lib/types";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type RelatedProductsResponse = {
  products: Product[];
};

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const RELATED_PRODUCTS_LIMIT = 8;

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export function ProductDetailClient({
  product,
}: {
  product: Product;
}) {
  /* ------------------------------------------------------------------------ */
  /* Product Images                                                           */
  /* ------------------------------------------------------------------------ */

  const images = (product.images ?? []).filter(Boolean);

  const [selectedImage, setSelectedImage] =
    useState<string | null>(
      images[0] ?? null,
    );

  /* ------------------------------------------------------------------------ */
  /* Related Products                                                         */
  /* ------------------------------------------------------------------------ */

  const [relatedProducts, setRelatedProducts] =
    useState<Product[]>([]);

  const [relatedLoading, setRelatedLoading] =
    useState(true);

  /* ------------------------------------------------------------------------ */
  /* Fetch Same Subcategory Products                                          */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    let mounted = true;

    async function loadRelatedProducts() {
      const categorySlug =
        product.category?.slug;

      /*
       * Category না থাকলে related products
       * fetch করার দরকার নেই।
       */

      if (!categorySlug) {
        if (mounted) {
          setRelatedProducts([]);
          setRelatedLoading(false);
        }

        return;
      }

      try {
        setRelatedLoading(true);

        const data =
          await apiFetch<RelatedProductsResponse>(
            `/products?category=${encodeURIComponent(
              categorySlug,
            )}&limit=${RELATED_PRODUCTS_LIMIT + 1}`,
          );

        if (!mounted) return;

        /*
         * Current product বাদ দেওয়া হচ্ছে।
         */

        const filteredProducts =
          (data.products ?? [])
            .filter(
              (item) =>
                item.id !== product.id,
            )
            .slice(
              0,
              RELATED_PRODUCTS_LIMIT,
            );

        setRelatedProducts(
          filteredProducts,
        );
      } catch (error) {
        console.error(
          "Failed to load related products:",
          error,
        );

        if (mounted) {
          setRelatedProducts([]);
        }
      } finally {
        if (mounted) {
          setRelatedLoading(false);
        }
      }
    }

    loadRelatedProducts();

    return () => {
      mounted = false;
    };
  }, [
    product.id,
    product.category?.slug,
  ]);

  /* ------------------------------------------------------------------------ */
  /* Discount                                                                 */
  /* ------------------------------------------------------------------------ */

  const hasDiscount =
    product.discountPrice != null &&
    product.discountPrice < product.price;

  const displayPrice =
    product.discountPrice ??
    product.price;

  /* ------------------------------------------------------------------------ */
  /* Sizes                                                                    */
  /* ------------------------------------------------------------------------ */

  const sizes = (product.sizes ?? []).filter(
    Boolean,
  );

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="w-full">
      {/* ================================================================== */}
      {/* Product Details                                                     */}
      {/* ================================================================== */}

      <div
        className="
          grid
          gap-8
          md:grid-cols-2
          lg:gap-10
        "
      >
        {/* ---------------------------------------------------------------- */}
        {/* Gallery                                                          */}
        {/* ---------------------------------------------------------------- */}

        <ProductGallery
          images={images}
          productName={product.name}
          selectedImage={selectedImage}
          onImageSelect={setSelectedImage}
        />

        {/* ---------------------------------------------------------------- */}
        {/* Product Information                                               */}
        {/* ---------------------------------------------------------------- */}

        <div className="min-w-0">
          {/* Category */}

          {product.category && (
            <p className="text-sm font-medium text-brand-600">
              {product.category.name}
            </p>
          )}

          {/* Name */}

          <h1
            className="
              mt-1
              text-2xl
              font-bold
              tracking-tight
              text-gray-900
              sm:text-3xl
            "
          >
            {product.name}
          </h1>

          {/* Price */}

          <div
            className="
              mt-4
              flex
              flex-wrap
              items-center
              gap-3
            "
          >
            <span
              className="
                text-2xl
                font-bold
                text-brand-600
              "
            >
              {formatBDT(displayPrice)}
            </span>

            {hasDiscount && (
              <>
                <span
                  className="
                    text-base
                    text-gray-400
                    line-through
                  "
                >
                  {formatBDT(
                    product.price,
                  )}
                </span>

                {product.discountPercent !=
                  null && (
                  <span
                    className="
                      rounded-full
                      bg-red-50
                      px-2.5
                      py-1
                      text-xs
                      font-semibold
                      text-red-600
                    "
                  >
                    {product.discountPercent}%
                    {" "}
                    OFF
                  </span>
                )}
              </>
            )}
          </div>

          {/* Stock */}

          <div className="mt-4">
            {product.stock > 0 ? (
              <span
                className="
                  inline-flex
                  items-center
                  gap-2
                  text-sm
                  font-medium
                  text-green-600
                "
              >
                <span
                  className="
                    h-2
                    w-2
                    rounded-full
                    bg-green-500
                  "
                />

                স্টকে আছে
              </span>
            ) : (
              <span
                className="
                  inline-flex
                  items-center
                  gap-2
                  text-sm
                  font-medium
                  text-red-600
                "
              >
                <span
                  className="
                    h-2
                    w-2
                    rounded-full
                    bg-red-500
                  "
                />

                স্টকে নেই
              </span>
            )}
          </div>

          {/* Divider */}

          <div className="my-5 border-t border-gray-100" />

          {/* Description */}

          {product.description && (
            <div>
              <h2
                className="
                  text-sm
                  font-semibold
                  text-gray-900
                "
              >
                প্রোডাক্ট সম্পর্কে
              </h2>

              <p
                className="
                  mt-2
                  whitespace-pre-line
                  text-sm
                  leading-7
                  text-gray-600
                "
              >
                {product.description}
              </p>
            </div>
          )}

          {/* Size Chart */}

          {sizes.length > 0 &&
            product.sizeChart && (
              <div
                id="size-chart"
                className="
                  mt-5
                  rounded-xl
                  border
                  border-gray-200
                  bg-gray-50
                  p-4
                "
              >
                <h2
                  className="
                    text-sm
                    font-semibold
                    text-gray-900
                  "
                >
                  সাইজ চার্ট
                </h2>

                <p
                  className="
                    mt-2
                    whitespace-pre-line
                    text-sm
                    leading-6
                    text-gray-600
                  "
                >
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

      {/* ================================================================== */}
      {/* Related Products                                                    */}
      {/* ================================================================== */}

      {!relatedLoading &&
        relatedProducts.length > 0 && (
          <section
            className="
              mt-12
              border-t
              border-gray-100
              pt-8
              sm:mt-14
              sm:pt-10
            "
          >
            {/* ------------------------------------------------------------ */}
            {/* Section Header                                               */}
            {/* ------------------------------------------------------------ */}

            <div
              className="
                mb-5
                flex
                items-end
                justify-between
                gap-3
              "
            >
              <div className="min-w-0">
                <h2
                  className="
                    text-xl
                    font-bold
                    text-gray-900
                    sm:text-2xl
                  "
                >
                  💕 আপনার জন্য আরও কিছু
                </h2>

                {product.category?.name && (
                  <p
                    className="
                      mt-1
                      text-xs
                      text-gray-500
                      sm:text-sm
                    "
                  >
                    {product.category.name}
                    {" "}
                     ক্যাটাগরির আরও সুন্দর কালেকশন দেখে নিন—আপনার মনের মতো শাড়িটি হয়তো এখানেই আছে। ✨
                  </p>
                )}
              </div>

              {/* View All */}

              {product.category?.slug && (
                <a
                  href={`/category/${product.category.slug}`}
                  className="
                    shrink-0
                    text-xs
                    font-semibold
                    text-brand-600
                    transition
                    hover:text-brand-700
                    hover:underline
                    sm:text-sm
                  "
                >
                  সব দেখুন →
                </a>
              )}
            </div>

            {/* ------------------------------------------------------------ */}
            {/* Related Product Grid                                         */}
            {/* ------------------------------------------------------------ */}

            <div
              className="
                grid
                grid-cols-2
                gap-3

                sm:grid-cols-3
                sm:gap-4

                lg:grid-cols-4
                lg:gap-5

                xl:grid-cols-5
                xl:gap-5
              "
            >
              {relatedProducts.map(
                (relatedProduct) => (
                  <ProductCard
                    key={relatedProduct.id}
                    product={relatedProduct}
                  />
                ),
              )}
            </div>
          </section>
        )}

      {/* ================================================================== */}
      {/* Related Products Loading                                           */}
      {/* ================================================================== */}

      {relatedLoading && (
        <section
          className="
            mt-12
            border-t
            border-gray-100
            pt-8
            sm:mt-14
            sm:pt-10
          "
          aria-label="সম্পর্কিত প্রোডাক্ট লোড হচ্ছে"
        >
          {/* Header Skeleton */}

          <div className="mb-5">
            <div
              className="
                h-6
                w-52
                animate-pulse
                rounded
                bg-gray-100
              "
            />

            <div
              className="
                mt-2
                h-4
                w-64
                animate-pulse
                rounded
                bg-gray-100
              "
            />
          </div>

          {/* Product Skeletons */}

          <div
            className="
              grid
              grid-cols-2
              gap-3
              sm:grid-cols-3
              sm:gap-4
              lg:grid-cols-4
              lg:gap-5
              xl:grid-cols-5
              xl:gap-5
            "
          >
            {Array.from({
              length: 4,
            }).map((_, index) => (
              <div
                key={index}
                className="
                  overflow-hidden
                  rounded-lg
                  border
                  border-gray-100
                  bg-white
                "
              >
                <div
                  className="
                    aspect-square
                    animate-pulse
                    bg-gray-100
                  "
                />

                <div className="space-y-2 p-3">
                  <div
                    className="
                      h-4
                      w-4/5
                      animate-pulse
                      rounded
                      bg-gray-100
                    "
                  />

                  <div
                    className="
                      h-4
                      w-2/5
                      animate-pulse
                      rounded
                      bg-gray-100
                    "
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}