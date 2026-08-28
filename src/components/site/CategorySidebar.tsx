
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

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

/* -------------------------------------------------------------------------- */
/* Icons                                                                      */
/* -------------------------------------------------------------------------- */

function ChevronIcon({
  className = "",
}: {
  className?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M7.5 4.5L13 10L7.5 15.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GridIcon({
  className = "",
}: {
  className?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M4 4H8V8H4V4ZM12 4H16V8H12V4ZM4 12H8V16H4V12ZM12 12H16V16H12V12Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* Loading Skeleton                                                           */
/* -------------------------------------------------------------------------- */

function CategorySidebarSkeleton() {
  return (
    <aside className="sticky top-24 hidden w-64 shrink-0 self-start overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:block">
      {/* Header */}

      <div className="border-b border-gray-100 px-4 py-4">
        <div className="h-5 w-24 animate-pulse rounded bg-gray-100" />

        <div className="mt-2 h-3 w-40 animate-pulse rounded bg-gray-100" />
      </div>

      {/* Items */}

      <div className="space-y-2 p-3">
        {Array.from({ length: 7 }).map((_, index) => (
          <div key={index}>
            <div className="h-10 animate-pulse rounded-lg bg-gray-100" />

            {index % 2 === 0 && (
              <div className="ml-5 mt-1.5 h-8 w-4/5 animate-pulse rounded-md bg-gray-50" />
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export function CategorySidebar() {
  const pathname = usePathname();

  const [categories, setCategories] = useState<CategoryWithChildren[]>([]);
  const [loading, setLoading] = useState(true);

  /*
   * Stores opened main category IDs.
   */
  const [openCategories, setOpenCategories] = useState<Set<string>>(
    () => new Set()
  );

  /* ------------------------------------------------------------------------ */
  /* Load Categories                                                          */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    let mounted = true;

    async function loadCategories() {
      try {
        const data = await apiFetch<{
          categories: CategoryWithChildren[];
        }>("/categories");

        if (!mounted) return;

        setCategories(data.categories ?? []);
      } catch (error) {
        console.error("[CategorySidebar]", error);

        if (mounted) {
          setCategories([]);
        }
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
  }, []);

  /* ------------------------------------------------------------------------ */
  /* Active Route                                                             */
  /* ------------------------------------------------------------------------ */

  function isActive(slug: string) {
    if (!pathname) return false;

    return (
      pathname === `/category/${slug}` ||
      pathname.startsWith(`/category/${slug}/`)
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Find Active Parent                                                       */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!categories.length) return;

    const activeParentIds = new Set<string>();

    categories.forEach((category) => {
      const children = category.children ?? [];

      /*
       * Main category itself is active.
       */
      if (isActive(category.slug) && children.length > 0) {
        activeParentIds.add(category.id);
      }

      /*
       * One of its children is active.
       */
      const hasActiveChild = children.some((child) =>
        isActive(child.slug)
      );

      if (hasActiveChild) {
        activeParentIds.add(category.id);
      }
    });

    if (activeParentIds.size === 0) return;

    setOpenCategories((current) => {
      const next = new Set(current);

      activeParentIds.forEach((id) => {
        next.add(id);
      });

      return next;
    });
  }, [pathname, categories]);

  /* ------------------------------------------------------------------------ */
  /* Toggle Category                                                          */
  /* ------------------------------------------------------------------------ */

  function toggleCategory(categoryId: string) {
    setOpenCategories((current) => {
      const next = new Set(current);

      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }

      return next;
    });
  }

  /* ------------------------------------------------------------------------ */
  /* Loading                                                                  */
  /* ------------------------------------------------------------------------ */

  if (loading) {
    return <CategorySidebarSkeleton />;
  }

  /* ------------------------------------------------------------------------ */
  /* Empty                                                                    */
  /* ------------------------------------------------------------------------ */

  if (categories.length === 0) {
    return null;
  }

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <aside
      aria-label="Product categories"
      className="sticky top-24 hidden w-64 shrink-0 self-start overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:block"
    >
      {/* ================================================================== */}
      {/* HEADER                                                             */}
      {/* ================================================================== */}

      <div className="border-b border-gray-100 px-4 py-4">
        <div className="flex items-center gap-2.5">
          {/* Icon */}

          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <GridIcon className="h-4 w-4" />
          </div>

          {/* Text */}

          <div className="min-w-0">
            <h2 className="text-sm font-bold text-gray-900">
              ক্যাটাগরি
            </h2>

            <p className="mt-0.5 text-[11px] text-gray-500">
              পছন্দের ক্যাটাগরি দেখুন
            </p>
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* CATEGORY LIST                                                      */}
      {/* ================================================================== */}

      <nav className="p-2">
        {categories.map((category) => {
          const children = category.children ?? [];

          const hasChildren = children.length > 0;

          const categoryActive = isActive(category.slug);

          const hasActiveChild = children.some((child) =>
            isActive(child.slug)
          );

          const isOpen = openCategories.has(category.id);

          const mainActive =
            categoryActive || hasActiveChild;

          return (
            <div
              key={category.id}
              className="mb-1 last:mb-0"
            >
              {/* ========================================================== */}
              {/* MAIN CATEGORY                                               */}
              {/* ========================================================== */}

              <div
                className={`group relative flex min-h-[52px] items-center rounded-xl transition-colors duration-200 ${
                  mainActive
                    ? "bg-brand-50 text-brand-700"
                    : "text-gray-800 hover:bg-gray-50"
                }`}
              >
                {/* Active indicator */}

                {mainActive && (
                  <span className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full bg-brand-500" />
                )}

                {/* -------------------------------------------------------- */}
                {/* Main Category Link                                        */}
                {/* -------------------------------------------------------- */}

                <Link
                  href={`/category/${category.slug}`}
                  aria-current={
                    categoryActive ? "page" : undefined
                  }
                  className="flex min-w-0 flex-1 items-center gap-3 px-3 py-3"
                >
                  {/* Category Image */}

                  {category.image ? (
                    <div className="h-8 w-8 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={category.image}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                        mainActive
                          ? "bg-brand-100 text-brand-600"
                          : "bg-gray-100 text-gray-500 group-hover:bg-brand-50 group-hover:text-brand-600"
                      }`}
                    >
                      {category.name
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  )}

                  {/* Category Name */}

                  <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                    {category.name}
                  </span>

                  {/* Product Count */}

                  {category._count?.products !== undefined && (
                    <span
                      className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                        mainActive
                          ? "bg-brand-100 text-brand-600"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {category._count.products}
                    </span>
                  )}
                </Link>

                {/* -------------------------------------------------------- */}
                {/* Toggle Button                                              */}
                {/* -------------------------------------------------------- */}

                {hasChildren && (
                  <button
                    type="button"
                    onClick={() =>
                      toggleCategory(category.id)
                    }
                    aria-label={
                      isOpen
                        ? `${category.name} বন্ধ করুন`
                        : `${category.name} খুলুন`
                    }
                    aria-expanded={isOpen}
                    className={`mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                      mainActive
                        ? "text-brand-500 hover:bg-brand-100"
                        : "text-gray-400 hover:bg-gray-100 hover:text-brand-600"
                    }`}
                  >
                    <ChevronIcon
                      className={`h-4 w-4 transition-transform duration-200 ${
                        isOpen ? "rotate-90" : "rotate-0"
                      }`}
                    />
                  </button>
                )}
              </div>

              {/* ========================================================== */}
              {/* SUBCATEGORIES                                               */}
              {/* ========================================================== */}

              {hasChildren && isOpen && (
                <div className="relative ml-5 mt-1 border-l border-gray-100 pl-2">
                  {children.map((subcategory) => {
                    const active = isActive(
                      subcategory.slug
                    );

                    return (
                      <Link
                        key={subcategory.id}
                        href={`/category/${subcategory.slug}`}
                        aria-current={
                          active ? "page" : undefined
                        }
                        className={`group relative flex min-h-9 items-center gap-2 rounded-lg px-3 py-2 transition-colors duration-200 ${
                          active
                            ? "bg-brand-50 font-semibold text-brand-600"
                            : "text-gray-500 hover:bg-gray-50 hover:text-brand-600"
                        }`}
                      >
                        {/* Active indicator */}

                        {active && (
                          <span className="absolute -left-[9px] top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-brand-500" />
                        )}

                        {/* Dot */}

                        <span
                          className={`h-1.5 w-1.5 shrink-0 rounded-full transition-colors ${
                            active
                              ? "bg-brand-500"
                              : "bg-gray-300 group-hover:bg-brand-400"
                          }`}
                        />

                        {/* Name */}

                        <span className="min-w-0 flex-1 truncate text-xs">
                          {subcategory.name}
                        </span>

                        {/* Product Count */}

                        {subcategory._count?.products !== undefined && (
                          <span
                            className={`shrink-0 text-[10px] ${
                              active
                                ? "text-brand-500"
                                : "text-gray-300"
                            }`}
                          >
                            {subcategory._count.products}
                          </span>
                        )}

                        {/* Arrow */}

                        <ChevronIcon
                          className={`h-3.5 w-3.5 shrink-0 transition-all duration-200 ${
                            active
                              ? "translate-x-0.5 text-brand-400"
                              : "text-gray-200 group-hover:translate-x-0.5 group-hover:text-brand-400"
                          }`}
                        />
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* ================================================================== */}
      {/* FOOTER                                                             */}
      {/* ================================================================== */}

      <div className="border-t border-gray-100 px-4 py-3">
        <p className="text-center text-[11px] text-gray-400">
          আপনার পছন্দের পণ্য খুঁজে নিন
        </p>
      </div>
    </aside>
  );
}
