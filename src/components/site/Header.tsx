
"use client";

import Link from "next/link";
import {
  Suspense,
  useState,
} from "react";
import {
  usePathname,
  useSearchParams,
} from "next/navigation";

import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { SmartSearch } from "@/components/site/smart-search";

/* ==========================================================================
   HEADER
========================================================================== */

export function Header() {
  return (
    <Suspense fallback={<HeaderFallback />}>
      <HeaderContent />
    </Suspense>
  );
}

/* ==========================================================================
   FALLBACK
========================================================================== */

function HeaderFallback() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur">
      <div className="container-page">
        <div className="flex h-16 items-center sm:h-[72px]">
          <Link
            href="/"
            className="text-xl font-extrabold tracking-tight text-brand-600 sm:text-2xl"
          >
            Shop<span className="text-gray-900">Scape</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ==========================================================================
   HEADER CONTENT
========================================================================== */

function HeaderContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { count } = useCart();
  const { user } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);

  /* ==========================================================================
     ACTIVE ROUTE
  ========================================================================== */

  function isActive(href: string) {
    if (href === "/") {
      return pathname === "/";
    }

    if (href === "/products") {
      return (
        pathname === "/products" &&
        searchParams.get("featured") !== "true"
      );
    }

    if (href === "/products?featured=true") {
      return (
        pathname === "/products" &&
        searchParams.get("featured") === "true"
      );
    }

    if (href === "/account?tab=wishlist") {
      return (
        pathname === "/account" &&
        searchParams.get("tab") === "wishlist"
      );
    }

    if (href === "/account") {
      return (
        pathname === "/account" &&
        searchParams.get("tab") !== "wishlist"
      );
    }

    return pathname.startsWith(href);
  }

  /* ==========================================================================
     MOBILE ITEM CLASS
  ========================================================================== */

  function mobileItemClass(active: boolean) {
    return `
      flex
      items-center
      justify-between
      rounded-xl
      px-3
      py-3
      text-sm
      transition
      ${
        active
          ? "bg-brand-50 font-bold text-brand-600"
          : "font-medium text-gray-700 hover:bg-gray-50 hover:text-brand-600"
      }
    `;
  }

  /* ==========================================================================
     RENDER
  ========================================================================== */

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur">
      <div className="container-page">

        {/* ====================================================================
            TOP HEADER
        ==================================================================== */}

        <div className="flex h-16 items-center gap-3 sm:h-[72px] sm:gap-5">

          {/* MOBILE MENU */}

          <button
            type="button"
            onClick={() =>
              setMenuOpen((prev) => !prev)
            }
            aria-label={
              menuOpen
                ? "মেনু বন্ধ করুন"
                : "মেনু খুলুন"
            }
            aria-expanded={menuOpen}
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              text-gray-700
              transition
              hover:bg-gray-100
              hover:text-brand-600
              active:scale-95
              sm:hidden
            "
          >
            {menuOpen ? (
              <CloseIcon />
            ) : (
              <MenuIcon />
            )}
          </button>

          {/* LOGO */}

          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="
              shrink-0
              text-xl
              font-extrabold
              tracking-tight
              text-brand-600
              sm:text-2xl
            "
          >
            Shop
            <span className="text-gray-900">
              Scape
            </span>
          </Link>

          {/* DESKTOP SEARCH */}

          <div className="hidden flex-1 md:block">
            <SmartSearch />
          </div>

          {/* ACTIONS */}

          <nav
            aria-label="প্রধান অ্যাকশন"
            className="ml-auto flex items-center gap-1 sm:gap-2"
          >
            <Link
              href="/products?featured=true"
              aria-label="অফার"
              className={`group flex h-10 w-10 items-center justify-center rounded-xl transition ${isActive("/products?featured=true") ? "bg-brand-50 text-brand-600" : "text-gray-600 hover:bg-brand-50 hover:text-brand-600"}`}
            >
              <GiftIcon />
            </Link>

            {/* WISHLIST */}

            <Link
              href="/account?tab=wishlist"
              aria-label="পছন্দের তালিকা"
              className={`
                group
                hidden
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                transition
                sm:flex
                ${
                  isActive(
                    "/account?tab=wishlist",
                  )
                    ? "bg-red-50 text-red-500"
                    : "text-gray-600 hover:bg-red-50 hover:text-red-500"
                }
              `}
            >
              <HeartIcon />
            </Link>

            {/* ACCOUNT */}

            <Link
              href={
                user
                  ? "/account"
                  : "/login"
              }
              aria-label={
                user
                  ? "আমার অ্যাকাউন্ট"
                  : "লগইন"
              }
              className={`
                group
                hidden
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                transition
                sm:flex
                ${
                  isActive(
                    user
                      ? "/account"
                      : "/login",
                  )
                    ? "bg-brand-50 text-brand-600"
                    : "text-gray-600 hover:bg-brand-50 hover:text-brand-600"
                }
              `}
            >
              <UserIcon />
            </Link>

            {/* CART */}

            <Link
              href="/cart"
              aria-label={`কার্ট, ${count} টি পণ্য`}
              className={`
                group
                relative
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                transition
                ${
                  isActive("/cart")
                    ? "bg-brand-50 text-brand-600"
                    : "text-gray-600 hover:bg-brand-50 hover:text-brand-600"
                }
              `}
            >
              <CartIcon />

              {count > 0 && (
                <span
                  className="
                    absolute
                    -right-0.5
                    -top-0.5
                    flex
                    min-h-5
                    min-w-5
                    items-center
                    justify-center
                    rounded-full
                    bg-sale
                    px-1
                    text-[10px]
                    font-bold
                    leading-none
                    text-white
                    ring-2
                    ring-white
                  "
                >
                  {count > 99
                    ? "99+"
                    : count}
                </span>
              )}
            </Link>
          </nav>
        </div>

        {/* ====================================================================
            MOBILE SEARCH
        ==================================================================== */}

        <SmartSearch mobile />

        {/* ====================================================================
            MOBILE MENU
        ==================================================================== */}

        {menuOpen && (
          <div className="border-t border-gray-100 py-3 sm:hidden">
            <nav
              aria-label="মোবাইল মেনু"
              className="grid gap-1"
            >
              <MobileLink
                href="/"
                label="হোম"
                active={isActive("/")}
                onClick={() =>
                  setMenuOpen(false)
                }
              />

              <MobileLink
                href="/products"
                label="সকল প্রোডাক্ট"
                active={isActive(
                  "/products",
                )}
                onClick={() =>
                  setMenuOpen(false)
                }
              />

              <MobileLink
                href="/products?featured=true"
                label="অফার"
                active={isActive(
                  "/products?featured=true",
                )}
                onClick={() =>
                  setMenuOpen(false)
                }
              />

              <MobileLink
                href="/account?tab=wishlist"
                label="পছন্দের তালিকা"
                active={isActive(
                  "/account?tab=wishlist",
                )}
                onClick={() =>
                  setMenuOpen(false)
                }
              />

              <MobileLink
                href={
                  user
                    ? "/account"
                    : "/login"
                }
                label={
                  user
                    ? "আমার অ্যাকাউন্ট"
                    : "লগইন"
                }
                active={isActive(
                  user
                    ? "/account"
                    : "/login",
                )}
                onClick={() =>
                  setMenuOpen(false)
                }
              />

              <MobileLink
                href="/track-order"
                label="অর্ডার ট্র্যাকিং"
                active={isActive(
                  "/track-order",
                )}
                onClick={() =>
                  setMenuOpen(false)
                }
              />
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

/* ==========================================================================
   MOBILE LINK
========================================================================== */

function MobileLink({
  href,
  label,
  active,
  onClick,
}: {
  href: string;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`
        flex
        items-center
        justify-between
        rounded-xl
        px-3
        py-3
        text-sm
        transition
        ${
          active
            ? "bg-brand-50 font-bold text-brand-600"
            : "font-medium text-gray-700 hover:bg-gray-50 hover:text-brand-600"
        }
      `}
    >
      <span>{label}</span>

      {active && (
        <span
          className="
            h-2
            w-2
            rounded-full
            bg-brand-500
            shadow-[0_0_0_3px_rgba(34,197,94,0.10)]
          "
        />
      )}
    </Link>
  );
}

/* ==========================================================================
   ICONS
========================================================================== */

function MenuIcon() {
  return (
    <svg
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      className="h-6 w-6"
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
  );
}

function SearchIcon({
  white = false,
}: {
  white?: boolean;
}) {
  return (
    <svg
      className={`h-5 w-5 ${
        white
          ? "text-white"
          : "text-gray-400"
      }`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle
        cx="11"
        cy="11"
        r="7"
      />

      <path d="m20 20-4-4" />
    </svg>
  );
}

function ImageSearchIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="3"
      />

      <circle
        cx="8.5"
        cy="8.5"
        r="1.5"
      />

      <path d="m3 16 5-5 4 4 2-2 7 7" />

      <circle
        cx="18"
        cy="18"
        r="3"
        fill="white"
      />

      <path d="m20.2 20.2 1.5 1.5" />
    </svg>
  );
}

function GiftIcon() {
  return (
    <svg
      className="h-5 w-5 transition group-hover:scale-110"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M20 12v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8" />
      <path d="M2 7h20v5H2z" />
      <path d="M12 7v14" />
      <path d="M12 7H7.5a2.5 2.5 0 1 1 2.5-2.5C10 6 12 7 12 7Z" />
      <path d="M12 7h4.5A2.5 2.5 0 1 0 14 4.5C14 6 12 7 12 7Z" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg
      className="h-5 w-5 transition group-hover:scale-110"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M20.8 8.7c0 5.5-8.8 10.3-8.8 10.3S3.2 14.2 3.2 8.7A4.7 4.7 0 0 1 12 6.3a4.7 4.7 0 0 1 8.8 2.4Z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      className="h-5 w-5 transition group-hover:scale-110"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle
        cx="12"
        cy="8"
        r="3.5"
      />

      <path d="M5 20c.8-3.3 3.2-5 7-5s6.2 1.7 7 5" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg
      className="h-5 w-5 transition group-hover:scale-110"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M3 4h2l2.2 11h10.6L21 7H6" />

      <circle
        cx="9"
        cy="20"
        r="1"
      />

      <circle
        cx="18"
        cy="20"
        r="1"
      />
    </svg>
  );
}