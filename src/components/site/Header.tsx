"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { count } = useCart();
  const { user } = useAuth();

  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  /* ------------------------------------------------------------------------ */
  /* Search                                                                   */
  /* ------------------------------------------------------------------------ */

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();

    const trimmedQuery = query.trim();

    router.push(
      trimmedQuery
        ? `/products?q=${encodeURIComponent(trimmedQuery)}`
        : "/products",
    );

    setMenuOpen(false);
  }

  /* ------------------------------------------------------------------------ */
  /* Active Route                                                             */
  /* ------------------------------------------------------------------------ */

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

  /* ------------------------------------------------------------------------ */
  /* Mobile Menu Item                                                         */
  /* ------------------------------------------------------------------------ */

  function mobileItemClass(active: boolean) {
    return `
      flex
      items-center
      justify-between
      rounded-xl
      px-3
      py-3
      text-sm
      transition-all
      duration-200
      ${
        active
          ? "bg-brand-50 font-bold text-brand-600"
          : "font-medium text-gray-700 hover:bg-gray-50 hover:text-brand-600"
      }
    `;
  }

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur">
      <div className="container-page">
        {/* ================================================================== */}
        {/* TOP HEADER                                                         */}
        {/* ================================================================== */}

        <div className="flex h-16 items-center gap-3 sm:h-[72px] sm:gap-6">
          {/* ---------------------------------------------------------------- */}
          {/* Mobile Menu Button                                               */}
          {/* ---------------------------------------------------------------- */}

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
            ) : (
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
            )}
          </button>

          {/* ---------------------------------------------------------------- */}
          {/* Logo                                                             */}
          {/* ---------------------------------------------------------------- */}

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

          {/* ---------------------------------------------------------------- */}
          {/* Desktop Search                                                   */}
          {/* ---------------------------------------------------------------- */}

          <form
            onSubmit={handleSearch}
            className="
              hidden
              min-w-0
              max-w-2xl
              flex-1
              md:flex
            "
          >
            <div className="relative w-full">
              <svg
                className="
                  pointer-events-none
                  absolute
                  left-3
                  top-1/2
                  h-5
                  w-5
                  -translate-y-1/2
                  text-gray-400
                "
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
              </svg>

              <input
                value={query}
                onChange={(e) =>
                  setQuery(e.target.value)
                }
                type="search"
                placeholder="পণ্য খুঁজুন..."
                aria-label="পণ্য খুঁজুন"
                className="
                  h-11
                  w-full
                  rounded-l-xl
                  border
                  border-gray-200
                  bg-gray-50
                  pl-10
                  pr-4
                  text-sm
                  text-gray-800
                  outline-none
                  transition
                  placeholder:text-gray-400
                  focus:border-brand-500
                  focus:bg-white
                  focus:ring-2
                  focus:ring-brand-500/10
                "
              />
            </div>

            <button
              type="submit"
              className="
                h-11
                shrink-0
                rounded-r-xl
                bg-brand-500
                px-5
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-brand-600
                active:scale-[0.98]
              "
            >
              সার্চ
            </button>
          </form>

          {/* ---------------------------------------------------------------- */}
          {/* Header Actions                                                   */}
          {/* ---------------------------------------------------------------- */}

          <nav
            aria-label="প্রধান অ্যাকশন"
            className="
              ml-auto
              flex
              items-center
              gap-1
              sm:gap-2
            "
          >
            {/* OFFERS */}

            <Link
              href="/products?featured=true"
              aria-label="অফার"
              className={`
                group
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                transition
                ${
                  isActive(
                    "/products?featured=true",
                  )
                    ? "bg-brand-50 text-brand-600"
                    : "text-gray-600 hover:bg-brand-50 hover:text-brand-600"
                }
              `}
            >
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
              <svg
                className="h-5 w-5 transition group-hover:scale-110"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M20.8 8.7c0 5.5-8.8 10.3-8.8 10.3S3.2 14.2 3.2 8.7A4.7 4.7 0 0 1 12 6.3a4.7 4.7 0 0 1 8.8 2.4Z" />
              </svg>
            </Link>

            {/* ACCOUNT */}

            <Link
              href={user ? "/account" : "/login"}
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
              <svg
                className="h-5 w-5 transition group-hover:scale-110"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M3 4h2l2.2 11h10.6L21 7H6" />
                <circle cx="9" cy="20" r="1" />
                <circle cx="18" cy="20" r="1" />
              </svg>

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
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </Link>
          </nav>
        </div>

        {/* ================================================================== */}
        {/* MOBILE SEARCH                                                       */}
        {/* ================================================================== */}

        <form
          onSubmit={handleSearch}
          className="pb-3 md:hidden"
        >
          <div className="relative">
            <svg
              className="
                pointer-events-none
                absolute
                left-3
                top-1/2
                h-5
                w-5
                -translate-y-1/2
                text-gray-400
              "
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" />
            </svg>

            <input
              value={query}
              onChange={(e) =>
                setQuery(e.target.value)
              }
              type="search"
              placeholder="পণ্য খুঁজুন..."
              aria-label="পণ্য খুঁজুন"
              className="
                h-11
                w-full
                rounded-xl
                border
                border-gray-200
                bg-gray-50
                pl-10
                pr-20
                text-sm
                outline-none
                transition
                focus:border-brand-500
                focus:bg-white
                focus:ring-2
                focus:ring-brand-500/10
              "
            />

            <button
              type="submit"
              className="
                absolute
                right-1
                top-1
                flex
                h-9
                items-center
                justify-center
                rounded-lg
                bg-brand-500
                px-4
                text-xs
                font-semibold
                text-white
                transition
                hover:bg-brand-600
                active:scale-95
              "
            >
              সার্চ
            </button>
          </div>
        </form>

        {/* ================================================================== */}
        {/* MOBILE MENU                                                         */}
        {/* ================================================================== */}

        {menuOpen && (
          <div
            className="
              border-t
              border-gray-100
              py-3
              sm:hidden
            "
          >
            <nav
              aria-label="মোবাইল মেনু"
              className="grid gap-1"
            >
              {/* ------------------------------------------------------------ */}
              {/* Home                                                         */}
              {/* ------------------------------------------------------------ */}

              <Link
                href="/"
                onClick={() =>
                  setMenuOpen(false)
                }
                aria-current={
                  isActive("/")
                    ? "page"
                    : undefined
                }
                className={mobileItemClass(
                  isActive("/"),
                )}
              >
                <span>হোম</span>

                {isActive("/") && (
                  <ActiveIndicator />
                )}
              </Link>

              {/* ------------------------------------------------------------ */}
              {/* All Products                                                 */}
              {/* ------------------------------------------------------------ */}

              <Link
                href="/products"
                onClick={() =>
                  setMenuOpen(false)
                }
                aria-current={
                  isActive("/products")
                    ? "page"
                    : undefined
                }
                className={mobileItemClass(
                  isActive("/products"),
                )}
              >
                <span>সকল প্রোডাক্ট</span>

                {isActive("/products") && (
                  <ActiveIndicator />
                )}
              </Link>

              {/* ------------------------------------------------------------ */}
              {/* Offers                                                       */}
              {/* ------------------------------------------------------------ */}

              <Link
                href="/products?featured=true"
                onClick={() =>
                  setMenuOpen(false)
                }
                aria-current={
                  isActive(
                    "/products?featured=true",
                  )
                    ? "page"
                    : undefined
                }
                className={mobileItemClass(
                  isActive(
                    "/products?featured=true",
                  ),
                )}
              >
                <span>অফার</span>

                {isActive(
                  "/products?featured=true",
                ) && (
                  <ActiveIndicator />
                )}
              </Link>

              {/* ------------------------------------------------------------ */}
              {/* Wishlist                                                     */}
              {/* ------------------------------------------------------------ */}

              <Link
                href="/account?tab=wishlist"
                onClick={() =>
                  setMenuOpen(false)
                }
                aria-current={
                  isActive(
                    "/account?tab=wishlist",
                  )
                    ? "page"
                    : undefined
                }
                className={mobileItemClass(
                  isActive(
                    "/account?tab=wishlist",
                  ),
                )}
              >
                <span>
                  পছন্দের তালিকা
                </span>

                {isActive(
                  "/account?tab=wishlist",
                ) && (
                  <ActiveIndicator />
                )}
              </Link>

              {/* ------------------------------------------------------------ */}
              {/* Account / Login                                              */}
              {/* ------------------------------------------------------------ */}

              <Link
                href={
                  user
                    ? "/account"
                    : "/login"
                }
                onClick={() =>
                  setMenuOpen(false)
                }
                aria-current={
                  isActive(
                    user
                      ? "/account"
                      : "/login",
                  )
                    ? "page"
                    : undefined
                }
                className={mobileItemClass(
                  isActive(
                    user
                      ? "/account"
                      : "/login",
                  ),
                )}
              >
                <span>
                  {user
                    ? "আমার অ্যাকাউন্ট"
                    : "লগইন"}
                </span>

                {isActive(
                  user
                    ? "/account"
                    : "/login",
                ) && (
                  <ActiveIndicator />
                )}
              </Link>

              {/* ------------------------------------------------------------ */}
              {/* Track Order                                                  */}
              {/* ------------------------------------------------------------ */}

              <Link
                href="/track-order"
                onClick={() =>
                  setMenuOpen(false)
                }
                aria-current={
                  isActive("/track-order")
                    ? "page"
                    : undefined
                }
                className={mobileItemClass(
                  isActive(
                    "/track-order",
                  ),
                )}
              >
                <span>
                  অর্ডার ট্র্যাকিং
                </span>

                {isActive(
                  "/track-order",
                ) && (
                  <ActiveIndicator />
                )}
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/* Active Indicator                                                           */
/* -------------------------------------------------------------------------- */

function ActiveIndicator() {
  return (
    <span
      className="
        h-2
        w-2
        shrink-0
        rounded-full
        bg-brand-500
        shadow-[0_0_0_3px_rgba(34,197,94,0.10)]
      "
      aria-hidden="true"
    />
  );
}