"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";

export function Header() {
  const router = useRouter();
  const { count } = useCart();
  const { user } = useAuth();

  const [query, setQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();

    const trimmedQuery = query.trim();

    router.push(
      trimmedQuery
        ? `/products?q=${encodeURIComponent(trimmedQuery)}`
        : "/products"
    );
  }

  return (
    <header className="bg-white">
      <div className="container-page flex items-center gap-6 py-4">
        {/* LOGO */}
        <Link
          href="/"
          className="shrink-0 text-2xl font-bold text-brand-600"
        >
          ShopScape
        </Link>

        {/* SEARCH */}
        <form
          onSubmit={handleSearch}
          className="hidden max-w-xl flex-1 sm:flex"
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="text"
            placeholder="সার্চ করুন"
            className="w-full rounded-l-md border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />

          <button
            type="submit"
            aria-label="সার্চ করুন"
            className="rounded-r-md bg-brand-500 px-4 text-white transition hover:bg-brand-600"
          >
            🔍
          </button>
        </form>

        {/* ACTIONS */}
        <div className="ml-auto flex items-center gap-4 text-brand-600">
          <Link
            href="/products?featured=true"
            aria-label="অফার"
            className="text-xl transition hover:scale-110"
          >
            🎁
          </Link>

          <Link
            href="/account?tab=wishlist"
            aria-label="পছন্দের তালিকা"
            className="text-xl transition hover:scale-110"
          >
            ❤️
          </Link>

          <Link
            href={user ? "/account" : "/login"}
            aria-label="অ্যাকাউন্ট"
            className="text-xl transition hover:scale-110"
          >
            👤
          </Link>

          <Link
            href="/cart"
            aria-label="কার্ট"
            className="relative text-xl"
          >
            🛍️

            <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-sale text-[10px] font-bold text-white">
              {count}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}