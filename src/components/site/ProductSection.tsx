"use client";

import Link from "next/link";
import {
  useCallback,
  useState,
} from "react";

import { apiFetch } from "@/lib/api";
import type {
  Category,
  Product,
} from "@/lib/types";

import { ProductCard } from "./ProductCard";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type CategoryWithChildren = Category & {
  children?: CategoryWithChildren[];
};

type ProductPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type ProductSectionProps = {
  title: string;
  categorySlug: string;
  products: Product[];
  pagination: ProductPagination;
  subcategories?: CategoryWithChildren[];
};

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const PRODUCTS_PER_PAGE = 8;

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export function ProductSection({
  title,
  categorySlug,
  products: initialProducts,
  pagination: initialPagination,
  subcategories = [],
}: ProductSectionProps) {
  const [products, setProducts] =
    useState<Product[]>(initialProducts);

  const [pagination, setPagination] =
    useState<ProductPagination>(
      initialPagination,
    );

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [showSubcategories, setShowSubcategories] =
    useState(true);

  /* ------------------------------------------------------------------------ */
  /* Derived                                                                  */
  /* ------------------------------------------------------------------------ */

  const hasSubcategories =
    subcategories.length > 0;

  const totalPages = Math.max(
    pagination.totalPages || 0,
    1,
  );

  /* ------------------------------------------------------------------------ */
  /* Fetch Products                                                           */
  /* ------------------------------------------------------------------------ */

  const fetchProducts = useCallback(
    async (page: number) => {
      if (
        loading ||
        page < 1 ||
        page > totalPages ||
        page === pagination.page
      ) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data =
          await apiFetch<{
            products: Product[];
            pagination?: ProductPagination;
          }>(
            `/products?category=${encodeURIComponent(
              categorySlug,
            )}&page=${page}&limit=${PRODUCTS_PER_PAGE}`,
          );

        const nextProducts =
          data.products ?? [];

        const nextPagination =
          data.pagination ?? {
            page,
            limit: PRODUCTS_PER_PAGE,
            total: nextProducts.length,
            totalPages: Math.max(
              Math.ceil(
                nextProducts.length /
                  PRODUCTS_PER_PAGE,
              ),
              1,
            ),
          };

        setProducts(nextProducts);
        setPagination(nextPagination);

        requestAnimationFrame(() => {
          const element =
            document.getElementById(
              `product-section-${categorySlug}`,
            );

          element?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        });
      } catch (err) {
        console.error(
          "Failed to load category products:",
          err,
        );

        setError(
          "প্রোডাক্ট লোড করা সম্ভব হয়নি। আবার চেষ্টা করুন।",
        );
      } finally {
        setLoading(false);
      }
    },
    [
      categorySlug,
      loading,
      pagination.page,
      totalPages,
    ],
  );

  /* ------------------------------------------------------------------------ */
  /* Page Change                                                              */
  /* ------------------------------------------------------------------------ */

  const handlePageChange = (
    page: number,
  ) => {
    if (
      loading ||
      page < 1 ||
      page > totalPages ||
      page === pagination.page
    ) {
      return;
    }

    fetchProducts(page);
  };

  /* ------------------------------------------------------------------------ */
  /* Pagination                                                               */
  /* ------------------------------------------------------------------------ */

  const getPageNumbers = (): (
    | number
    | "ellipsis"
  )[] => {
    const currentPage =
      pagination.page;

    if (totalPages <= 5) {
      return Array.from(
        { length: totalPages },
        (_, index) => index + 1,
      );
    }

    const pages: (
      | number
      | "ellipsis"
    )[] = [];

    pages.push(1);

    if (currentPage > 3) {
      pages.push("ellipsis");
    }

    const startPage = Math.max(
      2,
      currentPage - 1,
    );

    const endPage = Math.min(
      totalPages - 1,
      currentPage + 1,
    );

    for (
      let page = startPage;
      page <= endPage;
      page++
    ) {
      pages.push(page);
    }

    if (
      currentPage <
      totalPages - 2
    ) {
      pages.push("ellipsis");
    }

    pages.push(totalPages);

    return pages;
  };

  /* ------------------------------------------------------------------------ */
  /* Empty                                                                    */
  /* ------------------------------------------------------------------------ */

  if (
    !initialProducts ||
    initialProducts.length === 0
  ) {
    return null;
  }

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <section
      aria-labelledby={`product-section-${categorySlug}`}
      className="
        mt-8
        w-full
        scroll-mt-24
      "
    >
      {/* ================================================================== */}
      {/* Header                                                             */}
      {/* ================================================================== */}

      <div
        className="
          border-b
          border-gray-200
          pb-3
        "
      >
        <div
          className="
            flex
            items-end
            justify-between
            gap-3
          "
        >
          {/* Title */}
          <div className="min-w-0">
            <h2
              id={`product-section-${categorySlug}`}
              className="
                truncate
                text-lg
                font-bold
                text-gray-900
                sm:text-xl
              "
            >
              {title}
            </h2>

            <p
              className="
                mt-0.5
                text-xs
                text-gray-500
                sm:text-sm
              "
            >
              মোট {pagination.total}টি
              প্রোডাক্ট
            </p>
          </div>

          {/* Actions */}
          <div
            className="
              flex
              shrink-0
              items-center
              gap-2
            "
          >
            {hasSubcategories && (
              <button
                type="button"
                onClick={() =>
                  setShowSubcategories(
                    (previous) =>
                      !previous,
                  )
                }
                aria-expanded={
                  showSubcategories
                }
                aria-controls={`subcategory-${categorySlug}`}
                className="
                  inline-flex
                  min-h-9
                  items-center
                  gap-1.5
                  rounded-lg
                  border
                  border-gray-200
                  bg-white
                  px-3
                  py-2
                  text-xs
                  font-semibold
                  text-gray-700
                  shadow-sm
                  transition
                  hover:border-brand-300
                  hover:bg-brand-50
                  hover:text-brand-600
                  focus:outline-none
                  focus:ring-2
                  focus:ring-brand-500/20
                  sm:px-3.5
                  sm:text-sm
                "
              >
                <span className="hidden sm:inline">
                  {showSubcategories
                    ? "লুকান"
                    : "দেখুন"}
                </span>

                <span className="sm:hidden">
                  {showSubcategories
                    ? "−"
                    : "+"}
                </span>

                <svg
                  className={`
                    h-4
                    w-4
                    transition-transform
                    duration-200
                    ${
                      showSubcategories
                        ? "rotate-180"
                        : ""
                    }
                  `}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="
                      M5.23 7.21
                      a.75.75 0 011.06.02
                      L10 11.168
                      l3.71-3.938
                      a.75.75 0 111.08 1.04
                      l-4.25 4.5
                      a.75.75 0 01-1.08 0
                      l-4.25-4.5
                      a.75.75 0 01.02-1.06z
                    "
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}

            <Link
              href={`/category/${categorySlug}`}
              className="
                hidden
                shrink-0
                text-xs
                font-semibold
                text-brand-600
                transition
                hover:text-brand-700
                hover:underline
                sm:block
                sm:text-sm
              "
            >
              সব দেখুন →
            </Link>
          </div>
        </div>

        {/* ================================================================== */}
        {/* Subcategories                                                       */}
        {/* ================================================================== */}

        {hasSubcategories && (
          <div
            id={`subcategory-${categorySlug}`}
            className={`
              grid
              transition-all
              duration-300
              ease-in-out
              ${
                showSubcategories
                  ? "mt-3 grid-rows-[1fr] opacity-100"
                  : "mt-0 grid-rows-[0fr] opacity-0"
              }
            `}
          >
            <div className="min-h-0 overflow-hidden">
              <nav
                aria-label={`${title} subcategories`}
                className="
                  flex
                  w-full
                  min-w-0
                  gap-2
                  overflow-x-auto
                  overscroll-x-contain
                  pb-1
                  [scrollbar-width:none]
                  [&::-webkit-scrollbar]:hidden
                "
              >
                <Link
                  href={`/category/${categorySlug}`}
                  className="
                    inline-flex
                    min-h-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-brand-500
                    bg-brand-500
                    px-4
                    py-2
                    text-xs
                    font-semibold
                    whitespace-nowrap
                    text-white
                    shadow-sm
                    transition
                    hover:border-brand-600
                    hover:bg-brand-600
                    focus:outline-none
                    focus:ring-2
                    focus:ring-brand-500/30
                    sm:px-5
                    sm:text-sm
                  "
                >
                  সব
                </Link>

                {subcategories.map(
                  (subcategory) => (
                    <Link
                      key={subcategory.id}
                      href={`/category/${subcategory.slug}`}
                      className="
                        inline-flex
                        min-h-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-gray-200
                        bg-white
                        px-4
                        py-2
                        text-xs
                        font-medium
                        whitespace-nowrap
                        text-gray-600
                        shadow-sm
                        transition
                        hover:border-brand-400
                        hover:bg-brand-50
                        hover:text-brand-600
                        focus:outline-none
                        focus:ring-2
                        focus:ring-brand-500/20
                        sm:px-5
                        sm:text-sm
                      "
                    >
                      {subcategory.name}
                    </Link>
                  ),
                )}
              </nav>
            </div>
          </div>
        )}
      </div>

      {/* ================================================================== */}
      {/* Error                                                               */}
      {/* ================================================================== */}

      {error && (
        <div
          role="alert"
          className="
            mt-4
            flex
            items-center
            justify-between
            gap-3
            rounded-lg
            border
            border-red-200
            bg-red-50
            px-3
            py-2.5
            text-sm
            text-red-600
          "
        >
          <span>{error}</span>

          <button
            type="button"
            onClick={() =>
              fetchProducts(
                pagination.page,
              )
            }
            disabled={loading}
            className="
              shrink-0
              font-semibold
              underline
              disabled:opacity-50
            "
          >
            আবার চেষ্টা
          </button>
        </div>
      )}

      {/* ================================================================== */}
      {/* Products                                                            */}
      {/* ================================================================== */}

      <div className="relative">
        {loading && (
          <div
            className="
              absolute
              inset-0
              z-10
              flex
              items-start
              justify-center
              bg-white/70
              pt-10
              backdrop-blur-[1px]
            "
            aria-live="polite"
            aria-label="প্রোডাক্ট লোড হচ্ছে"
          >
            <div
              className="
                h-8
                w-8
                animate-spin
                rounded-full
                border-2
                border-gray-200
                border-t-brand-500
              "
            />
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Product Grid                                                     */}
        {/* ---------------------------------------------------------------- */}

        <div
          className="
            mt-5
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
          {products.map(
            (product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ),
          )}
        </div>
      </div>

      {/* ================================================================== */}
      {/* Pagination                                                         */}
      {/* ================================================================== */}

      {totalPages > 1 && (
        <div
          className="
            mt-7
            flex
            flex-col
            items-center
            gap-3
          "
        >
          <p
            className="
              text-xs
              text-gray-500
              sm:text-sm
            "
          >
            পেজ {pagination.page} /{" "}
            {totalPages}
          </p>

          <nav
            aria-label={`${title} product pagination`}
            className="
              flex
              max-w-full
              items-center
              gap-1
              overflow-x-auto
              px-1
              py-1
              [scrollbar-width:none]
              [&::-webkit-scrollbar]:hidden
            "
          >
            <button
              type="button"
              onClick={() =>
                handlePageChange(
                  pagination.page - 1,
                )
              }
              disabled={
                loading ||
                pagination.page <= 1
              }
              aria-label="আগের পেজ"
              className="
                inline-flex
                h-9
                min-w-9
                shrink-0
                items-center
                justify-center
                rounded-lg
                border
                border-gray-200
                bg-white
                px-2
                text-sm
                font-medium
                text-gray-600
                shadow-sm
                transition
                hover:border-brand-400
                hover:bg-brand-50
                hover:text-brand-600
                disabled:pointer-events-none
                disabled:opacity-40
                sm:h-10
                sm:min-w-10
              "
            >
              ←
            </button>

            {getPageNumbers().map(
              (page, index) =>
                page ===
                "ellipsis" ? (
                  <span
                    key={`ellipsis-${index}`}
                    className="
                      inline-flex
                      h-9
                      min-w-7
                      shrink-0
                      items-center
                      justify-center
                      text-sm
                      text-gray-400
                    "
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={page}
                    type="button"
                    onClick={() =>
                      handlePageChange(
                        page,
                      )
                    }
                    disabled={loading}
                    aria-current={
                      page ===
                      pagination.page
                        ? "page"
                        : undefined
                    }
                    className={`
                      inline-flex
                      h-9
                      min-w-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-lg
                      border
                      px-2
                      text-sm
                      font-semibold
                      shadow-sm
                      transition
                      sm:h-10
                      sm:min-w-10
                      ${
                        page ===
                        pagination.page
                          ? "border-brand-500 bg-brand-500 text-white"
                          : "border-gray-200 bg-white text-gray-600 hover:border-brand-400 hover:bg-brand-50 hover:text-brand-600"
                      }
                      disabled:pointer-events-none
                      disabled:opacity-50
                    `}
                  >
                    {page}
                  </button>
                ),
            )}

            <button
              type="button"
              onClick={() =>
                handlePageChange(
                  pagination.page + 1,
                )
              }
              disabled={
                loading ||
                pagination.page >=
                  totalPages
              }
              aria-label="পরের পেজ"
              className="
                inline-flex
                h-9
                min-w-9
                shrink-0
                items-center
                justify-center
                rounded-lg
                border
                border-gray-200
                bg-white
                px-2
                text-sm
                font-medium
                text-gray-600
                shadow-sm
                transition
                hover:border-brand-400
                hover:bg-brand-50
                hover:text-brand-600
                disabled:pointer-events-none
                disabled:opacity-40
                sm:h-10
                sm:min-w-10
              "
            >
              →
            </button>
          </nav>
        </div>
      )}

      {/* ================================================================== */}
      {/* Mobile View All                                                    */}
      {/* ================================================================== */}

      <div
        className="
          mt-5
          flex
          justify-center
          sm:hidden
        "
      >
        <Link
          href={`/category/${categorySlug}`}
          className="
            inline-flex
            min-h-10
            items-center
            justify-center
            rounded-lg
            border
            border-gray-200
            bg-white
            px-5
            py-2
            text-sm
            font-semibold
            text-gray-700
            shadow-sm
            transition
            hover:border-brand-400
            hover:bg-brand-50
            hover:text-brand-600
          "
        >
          সব প্রোডাক্ট দেখুন →
        </Link>
      </div>
    </section>
  );
}