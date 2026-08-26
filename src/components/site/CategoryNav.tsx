"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { apiFetch } from "@/lib/api";
import type { Category } from "@/lib/types";

const NAV_LINKS = [
  { href: "/", label: "হোম" },
  { href: "/about", label: "আমাদের সম্পর্কে" },
  { href: "/products", label: "সকল প্রোডাক্ট" },
  { href: "/return-policy", label: "অর্ডার ও রিটার্ন পলিসি" },
  { href: "/track-order", label: "অর্ডার ট্র্যাকিং" },
  { href: "/contact", label: "যোগাযোগ" },
];

export function CategoryNav() {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    apiFetch<{ categories: Category[] }>("/categories")
      .then((data) => setCategories(data.categories))
      .catch(() => setCategories([]));
  }, []);

  return (
    <nav className="relative bg-brand-500 text-white shadow-sm">
      <div className="container-page flex items-center">
        {/* CATEGORY */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex shrink-0 items-center gap-2 bg-brand-600 px-5 py-3 font-medium transition hover:bg-brand-700"
        >
          প্রোডাক্ট ক্যাটাগরি

          <span
            className={`transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          >
            ▾
          </span>
        </button>

        {/* NAVIGATION */}
        <div className="hidden items-center gap-6 px-6 text-sm md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap transition hover:text-brand-100"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CAMPAIGN */}
        <Link
          href="/products?featured=true"
          className="ml-auto whitespace-nowrap bg-brand-700 px-5 py-3 text-sm font-medium transition hover:bg-brand-800"
        >
          📣 সেলস ক্যাম্পেইন
        </Link>
      </div>

      {/* DROPDOWN */}
      {open && (
        <div className="absolute left-0 top-full z-[60] w-64 overflow-hidden rounded-b-lg border border-gray-100 bg-white text-gray-800 shadow-xl">
          {categories.length > 0 ? (
            categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between border-b border-gray-100 px-4 py-3 text-sm transition last:border-b-0 hover:bg-brand-50 hover:text-brand-600"
              >
                <span>{cat.name}</span>
                <span className="text-gray-400">›</span>
              </Link>
            ))
          ) : (
            <p className="px-4 py-3 text-sm text-gray-500">
              কোনো ক্যাটাগরি পাওয়া যায়নি
            </p>
          )}
        </div>
      )}
    </nav>
  );
}