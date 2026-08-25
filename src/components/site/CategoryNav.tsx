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
    <nav className="bg-brand-500 text-white relative">
      <div className="container-page flex items-center">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 bg-brand-600 px-5 py-3 font-medium shrink-0"
        >
          প্রোডাক্ট ক্যাটাগরি
          <span className={`transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
        </button>

        <div className="hidden md:flex items-center gap-6 px-6 text-sm">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-brand-100 whitespace-nowrap">
              {link.label}
            </Link>
          ))}
        </div>

        <Link href="/products?featured=true" className="ml-auto bg-brand-700 px-5 py-3 text-sm font-medium whitespace-nowrap">
          📣 সেলস ক্যাম্পেইন
        </Link>
      </div>

      {open && (
        <div className="absolute left-0 top-full z-20 w-64 bg-white text-gray-800 shadow-lg border border-gray-100">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between px-4 py-3 text-sm border-b border-gray-100 hover:bg-brand-50"
            >
              {cat.name}
              <span>›</span>
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
