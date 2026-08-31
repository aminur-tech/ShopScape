"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
} from "react";

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
/* Navigation Links                                                           */
/* -------------------------------------------------------------------------- */

const NAV_LINKS = [
  {
    href: "/",
    label: "হোম",
  },
  {
    href: "/about",
    label: "আমাদের সম্পর্কে",
  },
  {
    href: "/products",
    label: "সকল প্রোডাক্ট",
  },
  {
    href: "/return-policy",
    label: "অর্ডার ও রিটার্ন পলিসি",
  },
  {
    href: "/track-order",
    label: "অর্ডার ট্র্যাকিং",
  },
  {
    href: "/contact",
    label: "যোগাযোগ",
  },
];

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export function CategoryNav() {
  const pathname = usePathname();

  const [open, setOpen] =
    useState(false);

  const [categories, setCategories] =
    useState<CategoryWithChildren[]>([]);

  const [loading, setLoading] =
    useState(true);

  const navRef =
    useRef<HTMLElement | null>(null);

  /* ------------------------------------------------------------------------ */
  /* Load Categories                                                          */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    let mounted = true;

    async function loadCategories() {
      try {
        setLoading(true);

        const data =
          await apiFetch<{
            categories: CategoryWithChildren[];
          }>("/categories");

        if (!mounted) return;

        setCategories(
          data.categories ?? []
        );
      } catch {
        if (!mounted) return;

        setCategories([]);
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
  /* Outside Click                                                            */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    function handleOutsideClick(
      event: MouseEvent
    ) {
      if (
        navRef.current &&
        !navRef.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener(
        "mousedown",
        handleOutsideClick
      );
    }

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, [open]);

  /* ------------------------------------------------------------------------ */
  /* Escape                                                                   */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener(
        "keydown",
        handleKeyDown
      );
    }

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [open]);

  /* ------------------------------------------------------------------------ */
  /* Route Change                                                             */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  /* ------------------------------------------------------------------------ */
  /* Active Helper                                                            */
  /* ------------------------------------------------------------------------ */

  function isActive(href: string) {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(href);
  }

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <nav
      ref={navRef}
      className="
        relative
        z-50
        w-full
        bg-brand-500
        text-white
        shadow-sm
      "
    >
      {/* ================================================================== */}
      {/* Main Navigation                                                    */}
      {/* ================================================================== */}

      <div className="container-page flex min-w-0 items-center">
        {/* ================================================================ */}
        {/* Category Button                                                   */}
        {/* ================================================================ */}

        <button
          type="button"
          onClick={() =>
            setOpen(
              (previous) => !previous
            )
          }
          aria-expanded={open}
          aria-haspopup="true"
          className="
            inline-flex
            min-h-11
            shrink-0
            items-center
            gap-1.5
            bg-brand-600
            px-3
            text-xs
            font-semibold
            transition
            hover:bg-brand-700
            focus:outline-none
            focus:ring-2
            focus:ring-white/40
            sm:gap-2
            sm:px-4
            sm:text-sm
            lg:px-5
          "
        >
          <svg
            className="h-4 w-4 shrink-0 sm:h-5 sm:w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>

          <span className="whitespace-nowrap">
            <span className="hidden sm:inline">
              প্রোডাক্ট ক্যাটাগরি
            </span>

            <span className="sm:hidden">
              ক্যাটাগরি
            </span>
          </span>

          <svg
            className={`
              h-4
              w-4
              shrink-0
              transition-transform
              duration-200
              ${open ? "rotate-180" : ""}
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

        {/* ================================================================ */}
        {/* Navigation                                                        */}
        {/* ================================================================ */}

        <div
          className="
            min-w-0
            flex-1
            overflow-x-auto
            [scrollbar-width:none]
            [&::-webkit-scrollbar]:hidden
          "
        >
          <div
            className="
              flex
              min-w-max
              items-center
              gap-1
              px-2
              sm:gap-2
              sm:px-3
              lg:gap-4
              lg:px-5
            "
          >
            {NAV_LINKS.map(
              (link) => {
                const active =
                  isActive(
                    link.href
                  );

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`
                      relative
                      inline-flex
                      min-h-11
                      shrink-0
                      items-center
                      px-2
                      text-xs
                      font-medium
                      whitespace-nowrap
                      transition
                      sm:px-2.5
                      sm:text-sm
                      ${
                        active
                          ? "text-white"
                          : "text-white/90 hover:text-white"
                      }
                    `}
                  >
                    {link.label}

                    {active && (
                      <span
                        className="
                          absolute
                          inset-x-2
                          bottom-0
                          h-0.5
                          rounded-full
                          bg-white
                        "
                      />
                    )}
                  </Link>
                );
              }
            )}
          </div>
        </div>

        {/* ================================================================ */}
        {/* Campaign                                                          */}
        {/* ================================================================ */}

        <Link
          href="/products?featured=true"
          className="
            hidden
            min-h-11
            shrink-0
            items-center
            gap-1.5
            bg-brand-700
            px-3
            text-xs
            font-semibold
            whitespace-nowrap
            transition
            hover:bg-brand-800
            sm:inline-flex
            sm:px-4
            sm:text-sm
            lg:px-5
          "
        >
          <span aria-hidden="true">
            📣
          </span>

          <span>
            সেলস ক্যাম্পেইন
          </span>
        </Link>
      </div>

      {/* ================================================================== */}
      {/* Category Dropdown                                                   */}
      {/* ================================================================== */}

      {open && (
        <div
          className="
            absolute
            left-0
            top-full
            z-[70]
            w-full
            border-t
            border-brand-400
            bg-white
            text-gray-800
            shadow-xl
            sm:w-96
            sm:rounded-b-xl
            sm:border
            sm:border-gray-100
          "
        >
          <div className="max-h-[75vh] overflow-y-auto">
            {/* ============================================================ */}
            {/* Header                                                       */}
            {/* ============================================================ */}

            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
              <div>
                <p className="text-sm font-bold text-gray-900">
                  প্রোডাক্ট ক্যাটাগরি
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  ক্যাটাগরি নির্বাচন করুন
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setOpen(false)
                }
                aria-label="ক্যাটাগরি মেনু বন্ধ করুন"
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-full
                  text-gray-400
                  transition
                  hover:bg-gray-100
                  hover:text-gray-700
                "
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    d="M6 6l12 12M18 6L6 18"
                  />
                </svg>
              </button>
            </div>

            {/* ============================================================ */}
            {/* Loading                                                       */}
            {/* ============================================================ */}

            {loading && (
              <div className="space-y-2 p-3">
                {Array.from({
                  length: 6,
                }).map((_, index) => (
                  <div
                    key={index}
                    className="h-11 animate-pulse rounded-lg bg-gray-100"
                  />
                ))}
              </div>
            )}

            {/* ============================================================ */}
            {/* Categories                                                    */}
            {/* ============================================================ */}

            {!loading &&
              categories.length > 0 && (
                <div className="p-2">
                  {categories.map(
                    (category) => {
                      const active =
                        isActive(
                          `/category/${category.slug}`
                        );

                      /*
                       * Backend calculated:
                       *
                       * own + subcategory products
                       */
                      const totalCount =
                        category._count
                          ?.products ?? 0;

                      return (
                        <Link
                          key={category.id}
                          href={`/category/${category.slug}`}
                          onClick={() =>
                            setOpen(false)
                          }
                          className={`
                            group
                            flex
                            min-h-11
                            items-center
                            justify-between
                            gap-3
                            rounded-lg
                            px-3
                            py-2.5
                            text-sm
                            transition
                            ${
                              active
                                ? "bg-brand-50 text-brand-600"
                                : "text-gray-700 hover:bg-gray-50 hover:text-brand-600"
                            }
                          `}
                        >
                          {/* Name */}
                          <span className="flex min-w-0 items-center gap-2.5">
                            <span
                              className={`
                                h-1.5
                                w-1.5
                                shrink-0
                                rounded-full
                                ${
                                  active
                                    ? "bg-brand-500"
                                    : "bg-gray-300 group-hover:bg-brand-400"
                                }
                              `}
                            />

                            <span className="min-w-0 truncate font-medium">
                              {
                                category.name
                              }
                            </span>
                          </span>

                          {/* Count + Arrow */}
                          <span className="flex shrink-0 items-center gap-2">
                            <span
                              className={`
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

                            <svg
                              className="
                                h-4
                                w-4
                                text-gray-300
                                transition-transform
                                group-hover:translate-x-0.5
                                group-hover:text-brand-500
                              "
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="
                                  M7.21 14.77
                                  a.75.75 0 01.02-1.06
                                  L10.17 10
                                  7.23 7.29
                                  a.75.75 0 111.04-1.08
                                  l3.5 3.25
                                  a.75.75 0 010 1.08
                                  l-3.5 3.25
                                  a.75.75 0 01-1.06-.02z
                                "
                                clipRule="evenodd"
                              />
                            </svg>
                          </span>
                        </Link>
                      );
                    }
                  )}
                </div>
              )}

            {/* ============================================================ */}
            {/* Empty                                                        */}
            {/* ============================================================ */}

            {!loading &&
              categories.length === 0 && (
                <div className="px-4 py-10 text-center">
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-gray-100">
                    <svg
                      className="h-5 w-5 text-gray-400"
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

                  <p className="mt-3 text-sm font-medium text-gray-700">
                    কোনো ক্যাটাগরি পাওয়া যায়নি
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    পরে আবার চেষ্টা করুন।
                  </p>
                </div>
              )}
          </div>
        </div>
      )}
    </nav>
  );
}