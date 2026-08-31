"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCategoryUI } from "@/lib/category-ui-context";

/* -------------------------------------------------------------------------- */
/* Desktop Navigation                                                         */
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
/* Mobile Navigation                                                         */
/* -------------------------------------------------------------------------- */

const MOBILE_NAV = [
  {
    href: "/",
    label: "হোম",
    type: "link",
  },
  {
    href: "/products",
    label: "সকল প্রোডাক্ট",
    type: "link",
  },
  {
    href: "/track-order",
    label: "অর্ডার ট্র্যাকিং",
    type: "link",
  },
] as const;

/* -------------------------------------------------------------------------- */
/* Icons                                                                      */
/* -------------------------------------------------------------------------- */

function HomeIcon({ active }: { active?: boolean }) {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? "2.2" : "1.8"}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 10.5 12 3l9 7.5"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 9.5V21h14V9.5"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 21v-6h6v6"
      />
    </svg>
  );
}

function ProductIcon({ active }: { active?: boolean }) {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? "2.2" : "1.8"}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 7h12l1 14H5L6 7Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 7a3 3 0 0 1 6 0"
      />
    </svg>
  );
}

function TrackIcon({ active }: { active?: boolean }) {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? "2.2" : "1.8"}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 6h11v11H3z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14 10h4l3 3v4h-7z"
      />
      <circle cx="7.5" cy="19" r="2" />
      <circle cx="17.5" cy="19" r="2" />
    </svg>
  );
}

function CategoryIcon({
  active,
}: {
  active?: boolean;
}) {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? "2.2" : "1.8"}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 6h16"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 12h16"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 18h16"
      />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export function CategoryNav() {
  const pathname = usePathname();

  const {
    isCategoryOpen,
    toggleCategory,
  } = useCategoryUI();

  /* ------------------------------------------------------------------------ */
  /* Active Helper                                                            */
  /* ------------------------------------------------------------------------ */

  function isActive(href: string) {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(href);
  }

  const categoryActive =
    pathname.startsWith("/category");

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <>
      {/* ================================================================== */}
      {/* DESKTOP NAVIGATION                                                 */}
      {/* ================================================================== */}

      <nav
        className="
          relative
          z-40
          hidden
          w-full
          bg-brand-500
          text-white
          shadow-sm
          sm:block
        "
      >
        <div
          className="
            container-page
            flex
            min-w-0
            items-center
          "
        >
          {/* -------------------------------------------------------------- */}
          {/* Category Button                                                */}
          {/* -------------------------------------------------------------- */}

          <button
            type="button"
            onClick={toggleCategory}
            aria-expanded={isCategoryOpen}
            aria-controls="category-sidebar"
            aria-label="প্রোডাক্ট ক্যাটাগরি দেখান বা লুকান"
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
              transition-colors
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
            <CategoryIcon
              active={isCategoryOpen}
            />

            <span className="whitespace-nowrap">
              প্রোডাক্ট ক্যাটাগরি
            </span>

            <svg
              className={`
                h-4
                w-4
                shrink-0
                transition-transform
                duration-200
                ${
                  isCategoryOpen
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

          {/* -------------------------------------------------------------- */}
          {/* Links                                                          */}
          {/* -------------------------------------------------------------- */}

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
              {NAV_LINKS.map((link) => {
                const active =
                  isActive(link.href);

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
                      whitespace-nowrap
                      px-2
                      text-xs
                      font-medium
                      transition
                      focus:outline-none
                      focus:ring-2
                      focus:ring-white/30
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
              })}
            </div>
          </div>

          {/* -------------------------------------------------------------- */}
          {/* Campaign                                                       */}
          {/* -------------------------------------------------------------- */}

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
              transition-colors
              hover:bg-brand-800
              focus:outline-none
              focus:ring-2
              focus:ring-white/30
              sm:inline-flex
              sm:px-4
              sm:text-sm
              lg:px-5
            "
          >
            <span aria-hidden="true">
              📣
            </span>

            <span>সেলস ক্যাম্পেইন</span>
          </Link>
        </div>
      </nav>

      {/* ================================================================== */}
      {/* MOBILE BOTTOM NAVIGATION                                           */}
      {/* ================================================================== */}

      <nav
        aria-label="মোবাইল নেভিগেশন"
        className="
          fixed
          inset-x-0
          bottom-0
          z-[70]
          border-t
          border-gray-200
          bg-white
          shadow-[0_-4px_20px_rgba(0,0,0,0.08)]
          sm:hidden
        "
      >
        <div
          className="
            grid
            h-[68px]
            grid-cols-4
            px-1
            pb-[env(safe-area-inset-bottom)]
          "
        >
          {/* -------------------------------------------------------------- */}
          {/* Home                                                           */}
          {/* -------------------------------------------------------------- */}

          <Link
            href="/"
            aria-current={
              isActive("/")
                ? "page"
                : undefined
            }
            className={`
              relative
              flex
              min-w-0
              flex-col
              items-center
              justify-center
              gap-1
              transition
              ${
                isActive("/")
                  ? "text-brand-600"
                  : "text-gray-500"
              }
            `}
          >
            {isActive("/") && (
              <span
                className="
                  absolute
                  top-0
                  h-0.5
                  w-8
                  rounded-full
                  bg-brand-500
                "
              />
            )}

            <HomeIcon
              active={isActive("/")}
            />

            <span
              className={`
                max-w-full
                truncate
                px-1
                text-[10px]
                ${
                  isActive("/")
                    ? "font-bold"
                    : "font-medium"
                }
              `}
            >
              হোম
            </span>
          </Link>

          {/* -------------------------------------------------------------- */}
          {/* All Products                                                   */}
          {/* -------------------------------------------------------------- */}

          <Link
            href="/products"
            aria-current={
              isActive("/products")
                ? "page"
                : undefined
            }
            className={`
              relative
              flex
              min-w-0
              flex-col
              items-center
              justify-center
              gap-1
              transition
              ${
                isActive("/products")
                  ? "text-brand-600"
                  : "text-gray-500"
              }
            `}
          >
            {isActive("/products") && (
              <span
                className="
                  absolute
                  top-0
                  h-0.5
                  w-8
                  rounded-full
                  bg-brand-500
                "
              />
            )}

            <ProductIcon
              active={isActive(
                "/products",
              )}
            />

            <span
              className={`
                max-w-full
                truncate
                px-1
                text-[10px]
                ${
                  isActive("/products")
                    ? "font-bold"
                    : "font-medium"
                }
              `}
            >
              সকল প্রোডাক্ট
            </span>
          </Link>

          {/* -------------------------------------------------------------- */}
          {/* Track Order                                                    */}
          {/* -------------------------------------------------------------- */}

          <Link
            href="/track-order"
            aria-current={
              isActive("/track-order")
                ? "page"
                : undefined
            }
            className={`
              relative
              flex
              min-w-0
              flex-col
              items-center
              justify-center
              gap-1
              transition
              ${
                isActive(
                  "/track-order",
                )
                  ? "text-brand-600"
                  : "text-gray-500"
              }
            `}
          >
            {isActive(
              "/track-order",
            ) && (
              <span
                className="
                  absolute
                  top-0
                  h-0.5
                  w-8
                  rounded-full
                  bg-brand-500
                "
              />
            )}

            <TrackIcon
              active={isActive(
                "/track-order",
              )}
            />

            <span
              className={`
                max-w-full
                truncate
                px-1
                text-[10px]
                ${
                  isActive(
                    "/track-order",
                  )
                    ? "font-bold"
                    : "font-medium"
                }
              `}
            >
              অর্ডার ট্র্যাকিং
            </span>
          </Link>

          {/* -------------------------------------------------------------- */}
          {/* Category                                                       */}
          {/* -------------------------------------------------------------- */}

          <button
            type="button"
            onClick={toggleCategory}
            aria-expanded={isCategoryOpen}
            aria-controls="category-sidebar"
            aria-label="ক্যাটাগরি খুলুন"
            className={`
              relative
              flex
              min-w-0
              flex-col
              items-center
              justify-center
              gap-1
              transition
              ${
                isCategoryOpen ||
                categoryActive
                  ? "text-brand-600"
                  : "text-gray-500"
              }
            `}
          >
            {(isCategoryOpen ||
              categoryActive) && (
              <span
                className="
                  absolute
                  top-0
                  h-0.5
                  w-8
                  rounded-full
                  bg-brand-500
                "
              />
            )}

            <span
              className={`
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-full
                transition
                ${
                  isCategoryOpen
                    ? "bg-brand-50"
                    : ""
                }
              `}
            >
              <CategoryIcon
                active={
                  isCategoryOpen ||
                  categoryActive
                }
              />
            </span>

            <span
              className={`
                max-w-full
                truncate
                px-1
                text-[10px]
                ${
                  isCategoryOpen ||
                  categoryActive
                    ? "font-bold"
                    : "font-medium"
                }
              `}
            >
              ক্যাটাগরি
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}