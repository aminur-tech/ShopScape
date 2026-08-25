"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { Category } from "@/lib/types";

export function CategorySidebar() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    apiFetch<{ categories: Category[] }>("/categories")
      .then((data) => setCategories(data.categories))
      .catch(() => setCategories([]));
  }, []);

  if (categories.length === 0) return null;

  return (
    <aside className="hidden lg:block w-64 shrink-0 border border-gray-100 rounded-md overflow-hidden self-start">
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/category/${cat.slug}`}
          className="flex items-center justify-between px-4 py-3 text-sm border-b border-gray-100 last:border-0 hover:bg-brand-50 hover:text-brand-600"
        >
          {cat.name}
          <span>›</span>
        </Link>
      ))}
    </aside>
  );
}
