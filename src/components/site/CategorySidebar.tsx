"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
} from "react";

import { usePathname } from "next/navigation";

import { apiFetch } from "@/lib/api";
import type { Category } from "@/lib/types";

import { useCategoryUI } from "@/lib/category-ui-context";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type CategoryWithChildren = Category & {
  children?: CategoryWithChildren[];

  _count?: {
    products?: number;
  };
};

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export function CategorySidebar() {
  const pathname = usePathname();

  const {
    isCategoryOpen,
    closeCategory,
  } = useCategoryUI();

  const [categories, setCategories] =
    useState<CategoryWithChildren[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [openCategories, setOpenCategories] =
    useState<Record<string, boolean>>({});

  /* ------------------------------------------------------------------------ */
  /* Current Category                                                         */
  /* ------------------------------------------------------------------------ */

  const currentSlug =
    pathname.startsWith("/category/")
      ? pathname.slice("/category/".length)
      : undefined;

  /* ------------------------------------------------------------------------ */
  /* Close Mobile Drawer                                                      */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    /*
     * Context default is true for desktop.
     *
     * On mobile we don't want the drawer open by default.
     */
    const mobileQuery = window.matchMedia(
      "(max-width: 767px)",
    );

    if (mobileQuery.matches) {
      closeCategory();
    }
  }, [closeCategory]);

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
        /* Automatically open active category                            */
        /* -------------------------------------------------------------- */

        const initialOpen: Record<
          string,
          boolean
        > = {};

        function findActiveParent(
          items: CategoryWithChildren[],
        ) {
          for (const category of items) {
            const childActive =
              category.children?.some(
                (child) =>
                  child.slug === currentSlug,
              );

            if (childActive) {
              initialOpen[category.id] =
                true;
            }

            if (
              category.children?.length
            ) {
              findActiveParent(
                category.children,
              );
            }
          }
        }

        findActiveParent(nextCategories);

        const activeParent =
          nextCategories.find(
            (category) =>
              category.slug ===
              currentSlug,
          );

        if (
          activeParent?.children?.length
        ) {
          initialOpen[activeParent.id] =
            true;
        }

        setOpenCategories(initialOpen);
      } catch (err) {
        if (!mounted) return;

        setError(
          err instanceof Error
            ? err.message
            : "ক্যাটাগরি লোড করা যায়নি",
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
  /* Escape Key                                                               */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!isCategoryOpen) {
      return;
    }

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (event.key === "Escape") {
        closeCategory();
      }
    }

    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [
    isCategoryOpen,
    closeCategory,
  ]);

  /* ------------------------------------------------------------------------ */
  /* Mobile Body Scroll                                                       */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!isCategoryOpen) {
      return;
    }

    const isMobile =
      window.matchMedia(
        "(max-width: 767px)",
      ).matches;

    if (!isMobile) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [isCategoryOpen]);

  /* ------------------------------------------------------------------------ */
  /* Toggle Category                                                          */
  /* ------------------------------------------------------------------------ */

  function toggleCategory(
    categoryId: string,
  ) {
    setOpenCategories((previous) => ({
      ...previous,

      [categoryId]:
        !previous[categoryId],
    }));
  }

  /* ------------------------------------------------------------------------ */
  /* Active                                                                    */
  /* ------------------------------------------------------------------------ */

  function isActive(slug: string) {
    return currentSlug === slug;
  }

  /* ------------------------------------------------------------------------ */
  /* Close Drawer Only On Mobile                                              */
  /* ------------------------------------------------------------------------ */

  function handleCategoryClick() {
    if (
      window.matchMedia(
        "(max-width: 767px)",
      ).matches
    ) {
      closeCategory();
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Render                                                                    */
  /* ------------------------------------------------------------------------ */

  return (
    <>
      {/* ================================================================== */}
      {/* MOBILE OVERLAY                                                      */}
      {/* ================================================================== */}

      <div
        aria-hidden="true"
        onClick={closeCategory}
        className={`
          fixed
          inset-0
          z-[80]
          bg-black/40
          backdrop-blur-[2px]
          transition-opacity
          duration-300
          md:hidden
          ${
            isCategoryOpen
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          }
        `}
      />

      {/* ================================================================== */}
      {/* SIDEBAR                                                             */}
      {/* ================================================================== */}

      <aside
        id="category-sidebar"
        aria-label="Product categories"
        aria-hidden={!isCategoryOpen}
        className={`
          /* ================================================================ */
          /* MOBILE DRAWER                                                    */
          /* ================================================================ */

          fixed
          left-0
          top-0
          z-[90]
          flex
          h-dvh
          w-[min(88vw,360px)]
          flex-col
          bg-white
          shadow-2xl
          transition-transform
          duration-300
          ease-out

          ${
            isCategoryOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }

          /* ================================================================ */
          /* DESKTOP SIDEBAR                                                  */
          /* ================================================================ */

          md:sticky
          md:top-6
          md:z-30
          md:h-[calc(100vh-7rem)]
          md:w-[250px]
          md:shrink-0
          md:rounded-2xl
          md:border
          md:border-gray-100
          md:shadow-sm
          md:transition-all
          md:duration-300
          md:ease-out

          ${
            isCategoryOpen
              ? "md:translate-x-0 md:opacity-100"
              : "md:-ml-[250px] md:translate-x-0 md:opacity-0"
          }
        `}
      >
        {/* ================================================================= */}
        {/* SIDEBAR HEADER                                                    */}
        {/* ================================================================= */}

        <div
          className="
            flex
            shrink-0
            items-center
            justify-between
            border-b
            border-gray-100
            px-4
            py-4
            md:px-4
            md:py-3.5
          "
        >
          <div className="flex min-w-0 items-center gap-3">
            

            {/* Text */}
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-gray-900">
                প্রোডাক্ট ক্যাটাগরি
              </h2>

              <p className="mt-0.5 truncate text-[11px] text-gray-400">
                আপনার পছন্দের ক্যাটাগরি নির্বাচন করুন
              </p>
            </div>
          </div>

          {/* Mobile Close */}
          <button
            type="button"
            onClick={closeCategory}
            aria-label="ক্যাটাগরি বন্ধ করুন"
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-full
              text-gray-400
              transition
              hover:bg-gray-100
              hover:text-gray-700
              focus:outline-none
              focus:ring-2
              focus:ring-brand-500/30
              md:hidden
            "
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                d="M6 6l12 12M18 6L6 18"
              />
            </svg>
          </button>
        </div>

        {/* ================================================================= */}
        {/* CONTENT                                                            */}
        {/* ================================================================= */}

        <div className="min-h-0 flex-1 overflow-y-auto">
          {/* =============================================================== */}
          {/* LOADING                                                          */}
          {/* =============================================================== */}

          {loading && (
            <div className="space-y-2 p-3">
              {Array.from({
                length: 7,
              }).map((_, index) => (
                <div
                  key={index}
                  className="
                    h-11
                    animate-pulse
                    rounded-lg
                    bg-gray-100
                  "
                />
              ))}
            </div>
          )}

          {/* =============================================================== */}
          {/* ERROR                                                            */}
          {/* =============================================================== */}

          {!loading && error && (
            <div className="m-4 rounded-xl border border-red-100 bg-red-50 p-4">
              <p className="text-sm leading-6 text-red-600">
                {error}
              </p>
            </div>
          )}

          {/* =============================================================== */}
          {/* CATEGORIES                                                       */}
          {/* =============================================================== */}

          {!loading &&
            !error &&
            categories.length > 0 && (
              <nav
                className="
                  p-3
                  md:p-2.5
                "
              >
                <ul className="space-y-1">
                  {categories.map(
                    (category) => {
                      const hasChildren =
                        Boolean(
                          category.children
                            ?.length,
                        );

                      const isOpen =
                        Boolean(
                          openCategories[
                            category.id
                          ],
                        );

                      const active =
                        isActive(
                          category.slug,
                        );

                      const totalCount =
                        category._count
                          ?.products ?? 0;

                      return (
                        <li
                          key={category.id}
                        >
                          {/* ================================================= */}
                          {/* MAIN CATEGORY                                      */}
                          {/* ================================================= */}

                          <div
                            className={`
                              flex
                              items-center
                              rounded-xl
                              transition-colors
                              ${
                                active
                                  ? "bg-brand-50"
                                  : "hover:bg-gray-50"
                              }
                            `}
                          >
                            {/* Category Link */}
                            <Link
                              href={`/category/${category.slug}`}
                              onClick={
                                handleCategoryClick
                              }
                              className={`
                                flex
                                min-w-0
                                flex-1
                                items-center
                                gap-3
                                px-3
                                py-3
                                text-sm
                                font-semibold
                                ${
                                  active
                                    ? "text-brand-600"
                                    : "text-gray-700 hover:text-brand-600"
                                }
                              `}
                            >
                              {/* Dot */}
                              <span
                                className={`
                                  h-2
                                  w-2
                                  shrink-0
                                  rounded-full
                                  ${
                                    active
                                      ? "bg-brand-500"
                                      : "bg-gray-300"
                                  }
                                `}
                              />

                              {/* Name */}
                              <span className="min-w-0 flex-1 truncate">
                                {
                                  category.name
                                }
                              </span>

                              {/* Count */}
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
                                    active
                                      ? "bg-brand-100 text-brand-600"
                                      : "bg-gray-100 text-gray-500"
                                  }
                                `}
                              >
                                {
                                  totalCount
                                }
                              </span>
                            </Link>

                            {/* Expand Button */}
                            {hasChildren && (
                              <button
                                type="button"
                                onClick={() =>
                                  toggleCategory(
                                    category.id,
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
                                  h-9
                                  w-9
                                  shrink-0
                                  items-center
                                  justify-center
                                  rounded-lg
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
                          </div>

                          {/* ================================================= */}
                          {/* SUBCATEGORIES                                     */}
                          {/* ================================================= */}

                          {hasChildren && (
                            <div
                              className={`
                                grid
                                transition-all
                                duration-300
                                ${
                                  isOpen
                                    ? "grid-rows-[1fr] opacity-100"
                                    : "grid-rows-[0fr] opacity-0"
                                }
                              `}
                            >
                              <div className="min-h-0 overflow-hidden">
                                <div
                                  className="
                                    ml-4
                                    border-l
                                    border-gray-100
                                    py-1
                                    pl-3
                                  "
                                >
                                  {/* All Products */}
                                  <Link
                                    href={`/category/${category.slug}`}
                                    onClick={
                                      handleCategoryClick
                                    }
                                    className={`
                                      mb-1
                                      flex
                                      items-center
                                      justify-between
                                      rounded-lg
                                      px-3
                                      py-2.5
                                      text-xs
                                      font-semibold
                                      ${
                                        active
                                          ? "bg-brand-50 text-brand-600"
                                          : "text-brand-600 hover:bg-brand-50"
                                      }
                                    `}
                                  >
                                    <span>
                                      সব প্রোডাক্ট
                                    </span>

                                    <span>
                                      →
                                    </span>
                                  </Link>

                                  {/* Children */}
                                  <ul className="space-y-0.5">
                                    {category.children?.map(
                                      (child) => {
                                        const childActive =
                                          isActive(
                                            child.slug,
                                          );

                                        const childCount =
                                          child
                                            ._count
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
                                              onClick={
                                                handleCategoryClick
                                              }
                                              className={`
                                                flex
                                                items-center
                                                justify-between
                                                gap-2
                                                rounded-lg
                                                px-3
                                                py-2.5
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
                                      },
                                    )}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          )}
                        </li>
                      );
                    },
                  )}
                </ul>
              </nav>
            )}

          {/* =============================================================== */}
          {/* EMPTY                                                            */}
          {/* =============================================================== */}

          {!loading &&
            !error &&
            categories.length === 0 && (
              <div className="px-5 py-12 text-center">
                <div
                  className="
                    mx-auto
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-full
                    bg-gray-100
                  "
                >
                  <svg
                    className="h-5 w-5 text-gray-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </div>

                <p className="mt-3 text-sm font-medium text-gray-700">
                  কোনো ক্যাটাগরি পাওয়া যায়নি
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  পরে আবার চেষ্টা করুন।
                </p>
              </div>
            )}
        </div>
      </aside>
    </>
  );
}