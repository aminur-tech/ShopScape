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
    router.push(query ? `/products?q=${encodeURIComponent(query)}` : "/products");
  }

  return (
    <div className="bg-white">
      <div className="container-page flex items-center gap-6 py-4">
        <Link href="/" className="shrink-0 text-2xl font-bold text-brand-600">
          ShopScape
        </Link>

        <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-xl">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="text"
            placeholder="সার্চ করুন"
            className="w-full rounded-l-md border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button
            type="submit"
            aria-label="সার্চ করুন"
            className="rounded-r-md bg-brand-500 px-4 text-white hover:bg-brand-600 transition"
          >
            🔍
          </button>
        </form>

        <div className="ml-auto flex items-center gap-4 text-brand-600">
          <Link href="/products?featured=true" aria-label="অফার" className="text-xl">🎁</Link>
          <Link href="/account?tab=wishlist" aria-label="পছন্দের তালিকা" className="text-xl">❤️</Link>
          <Link href={user ? "/account" : "/login"} aria-label="অ্যাকাউন্ট" className="text-xl">👤</Link>
          <Link href="/cart" aria-label="কার্ট" className="relative text-xl">
            🛍️
            <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-sale text-[10px] font-bold text-white">
              {count}
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
