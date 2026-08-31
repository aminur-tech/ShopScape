"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { apiFetch } from "@/lib/api";
import type { Category } from "@/lib/types";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type CategoryWithChildren = Category & {
  children?: CategoryWithChildren[];

  _count?: {
    products?: number;
  };
};

type CategorySidebarProps = {
  currentSlug?: string;
};

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export function CategorySidebar({
  currentSlug,
}: CategorySidebarProps) {
  const [categories, setCategories] =
    useState<CategoryWithChildren[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [openCategories, setOpenCategories] =
    useState<Record<string, boolean>>({});

  /* ------------------------------------------------------------------------ */
  /* Load Categories                                                          */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    let mounted = true;

    async function loadCategories() {
      try {
        setLoading(true);
        setError("");

        const data =
          await apiFetch<{
            categories: CategoryWithChildren[];
          }>("/categories");

        if (!mounted) return;

        const nextCategories =
          data.categories ?? [];

        setCategories(nextCategories);

        /* -------------------------------------------------------------- */
        /* Automatically open active parent                              */
        /* -------------------------------------------------------------- */

        const initialOpen: Record<
          string,
          boolean
        > = {};

        function findActiveParent(
          items: CategoryWithChildren[]
        ) {
          for (const category of items) {
            const childIsActive =
              category.children?.some(
                (child) =>
                  child.slug === currentSlug
              );

            if (childIsActive) {
              initialOpen[category.id] =
                true;
            }

            if (
              category.children?.length
            ) {
              findActiveParent(
                category.children
              );
            }
          }
        }

        findActiveParent(
          nextCategories
        );

        /* -------------------------------------------------------------- */
        /* Active main category                                           */
        /* -------------------------------------------------------------- */

        const activeParent =
          nextCategories.find(
            (category) =>
              category.slug ===
              currentSlug
          );

        if (
          activeParent?.children?.length
        ) {
          initialOpen[
            activeParent.id
          ] = true;
        }

        setOpenCategories(
          initialOpen
        );
      } catch (err) {
        if (!mounted) return;

        setError(
          err instanceof Error
            ? err.message
            : "ক্যাটাগরি লোড করা যায়নি"
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadCategories();

    return () => {
      mounted = false;
    };
  }, [currentSlug]);

  /* ------------------------------------------------------------------------ */
  /* Toggle                                                                   */
  /* ------------------------------------------------------------------------ */

  function toggleCategory(
    categoryId: string
  ) {
    setOpenCategories((previous) => ({
      ...previous,

      [categoryId]:
        !previous[categoryId],
    }));
  }

  /* ------------------------------------------------------------------------ */
  /* Loading                                                                  */
  /* ------------------------------------------------------------------------ */

  if (loading) {
    return (
      <aside
        className="
          hidden
          w-64
          shrink-0
          md:block
          lg:sticky
          lg:top-24
          lg:self-start
        "
      >
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-4 py-4">
            <div className="h-5 w-24 animate-pulse rounded bg-gray-100" />

            <div className="mt-2 h-3 w-40 animate-pulse rounded bg-gray-100" />
          </div>

          <div className="space-y-2 p-3">
            {Array.from({
              length: 7,
            }).map((_, index) => (
              <div
                key={index}
                className="h-10 animate-pulse rounded-lg bg-gray-100"
              />
            ))}
          </div>
        </div>
      </aside>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Error                                                                    */
  /* ------------------------------------------------------------------------ */

  if (error) {
    return (
      <aside
        className="
          hidden
          w-64
          shrink-0
          md:block
          lg:sticky
          lg:top-24
          lg:self-start
        "
      >
        <div className="rounded-xl border border-red-100 bg-red-50 p-4">
          <p className="text-sm leading-6 text-red-600">
            {error}
          </p>
        </div>
      </aside>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Empty                                                                    */
  /* ------------------------------------------------------------------------ */

  if (categories.length === 0) {
    return (
      <aside
        className="
          hidden
          w-64
          shrink-0
          md:block
        "
      >
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
              <svg
                className="h-4 w-4 text-gray-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </div>

            <h2 className="text-sm font-bold text-gray-900">
              ক্যাটাগরি
            </h2>
          </div>

          <p className="mt-4 text-sm text-gray-500">
            কোনো ক্যাটাগরি পাওয়া যায়নি।
          </p>
        </div>
      </aside>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <aside
      className="
        hidden
        w-64
        shrink-0
        md:block
        lg:sticky
        lg:top-24
        lg:self-start
      "
    >
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        {/* ================================================================== */}
        {/* Header                                                             */}
        {/* ================================================================== */}

        <div className="border-b border-gray-100 px-4 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </div>

            <div className="min-w-0">
              <h2 className="text-sm font-bold text-gray-900">
                প্রোডাক্ট ক্যাটাগরি
              </h2>

              <p className="mt-0.5 truncate text-[11px] text-gray-400">
                পছন্দের ক্যাটাগরি নির্বাচন করুন
              </p>
            </div>
          </div>
        </div>

        {/* ================================================================== */}
        {/* Category List                                                      */}
        {/* ================================================================== */}

        <nav
          className="p-2"
          aria-label="Product categories"
        >
          <ul className="space-y-1">
            {categories.map(
              (category) => {
                const hasChildren =
                  Boolean(
                    category.children
                      ?.length
                  );

                const isOpen =
                  Boolean(
                    openCategories[
                      category.id
                    ]
                  );

                const isActive =
                  currentSlug ===
                  category.slug;

                /*
                 * Backend already calculates:
                 *
                 * own products
                 * +
                 * all subcategory products
                 */
                const totalCount =
                  category._count
                    ?.products ?? 0;

                return (
                  <li
                    key={category.id}
                    className="overflow-hidden"
                  >
                    {/* ==================================================== */}
                    {/* Main Category                                         */}
                    {/* ==================================================== */}

                    <div
                      className={`
                        flex
                        items-center
                        rounded-lg
                        transition
                        ${
                          isActive
                            ? "bg-brand-50"
                            : "hover:bg-gray-50"
                        }
                      `}
                    >
                      {/* Main category link */}
                      <Link
                        href={`/category/${category.slug}`}
                        className={`
                          flex
                          min-w-0
                          flex-1
                          items-center
                          gap-2.5
                          px-3
                          py-2.5
                          text-sm
                          font-semibold
                          transition
                          ${
                            isActive
                              ? "text-brand-600"
                              : "text-gray-700 hover:text-brand-600"
                          }
                        `}
                      >
                        <span
                          className={`
                            h-1.5
                            w-1.5
                            shrink-0
                            rounded-full
                            ${
                              isActive
                                ? "bg-brand-500"
                                : "bg-gray-300"
                            }
                          `}
                        />

                        <span className="min-w-0 flex-1 truncate">
                          {category.name}
                        </span>

                        {/* TOTAL */}
                        <span
                          className={`
                            shrink-0
                            rounded-full
                            px-2
                            py-0.5
                            text-[10px]
                            font-semibold
                            tabular-nums
                            ${
                              isActive
                                ? "bg-brand-100 text-brand-600"
                                : "bg-gray-100 text-gray-500"
                            }
                          `}
                        >
                          {totalCount}
                        </span>
                      </Link>

                      {/* Expand button */}
                      {hasChildren && (
                        <button
                          type="button"
                          onClick={() =>
                            toggleCategory(
                              category.id
                            )
                          }
                          aria-expanded={
                            isOpen
                          }
                          aria-label={
                            isOpen
                              ? "Subcategory বন্ধ করুন"
                              : "Subcategory দেখুন"
                          }
                          className="
                            mr-1
                            flex
                            h-8
                            w-8
                            shrink-0
                            items-center
                            justify-center
                            rounded-md
                            text-gray-400
                            transition
                            hover:bg-white
                            hover:text-brand-500
                          "
                        >
                          <svg
                            className={`
                              h-4
                              w-4
                              transition-transform
                              duration-200
                              ${
                                isOpen
                                  ? "rotate-180 text-brand-500"
                                  : ""
                              }
                            `}
                            viewBox="0 0 20 20"
                            fill="currentColor"
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
                    </div>

                    {/* ==================================================== */}
                    {/* Subcategories                                         */}
                    {/* ==================================================== */}

                    {hasChildren && (
                      <div
                        className={`
                          grid
                          transition-all
                          duration-300
                          ease-in-out
                          ${
                            isOpen
                              ? "grid-rows-[1fr] opacity-100"
                              : "grid-rows-[0fr] opacity-0"
                          }
                        `}
                      >
                        <div className="min-h-0 overflow-hidden">
                          <div className="ml-4 border-l border-gray-100 py-1 pl-3">
                            {/* ------------------------------------------------ */}
                            {/* All Products                                    */}
                            {/* ------------------------------------------------ */}

                            <Link
                              href={`/category/${category.slug}`}
                              className={`
                                mb-1
                                flex
                                items-center
                                justify-between
                                gap-2
                                rounded-md
                                px-2.5
                                py-2
                                text-xs
                                font-semibold
                                transition
                                ${
                                  isActive
                                    ? "bg-brand-50 text-brand-600"
                                    : "text-brand-600 hover:bg-brand-50"
                                }
                              `}
                            >
                              <span>
                                সব প্রোডাক্ট
                              </span>

                              <span className="text-sm">
                                →
                              </span>
                            </Link>

                            {/* ------------------------------------------------ */}
                            {/* Children                                        */}
                            {/* ------------------------------------------------ */}

                            <ul className="space-y-0.5">
                              {category.children?.map(
                                (child) => {
                                  const childActive =
                                    currentSlug ===
                                    child.slug;

                                  const childCount =
                                    child._count
                                      ?.products ??
                                    0;

                                  return (
                                    <li
                                      key={
                                        child.id
                                      }
                                    >
                                      <Link
                                        href={`/category/${child.slug}`}
                                        className={`
                                          flex
                                          items-center
                                          justify-between
                                          gap-2
                                          rounded-md
                                          px-2.5
                                          py-2
                                          text-xs
                                          transition
                                          ${
                                            childActive
                                              ? "bg-brand-50 font-semibold text-brand-600"
                                              : "text-gray-500 hover:bg-gray-50 hover:text-brand-600"
                                          }
                                        `}
                                      >
                                        <span className="min-w-0 truncate">
                                          {
                                            child.name
                                          }
                                        </span>

                                        <span
                                          className={`
                                            shrink-0
                                            tabular-nums
                                            ${
                                              childActive
                                                ? "text-brand-500"
                                                : "text-gray-400"
                                            }
                                          `}
                                        >
                                          {
                                            childCount
                                          }
                                        </span>
                                      </Link>
                                    </li>
                                  );
                                }
                              )}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </li>
                );
              }
            )}
          </ul>
        </nav>
      </div>
    </aside>
  );
}