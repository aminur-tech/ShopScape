import Link from "next/link";

import type { Category, Product } from "@/lib/types";

import { ProductCard } from "./ProductCard";

type CategoryWithChildren = Category & {
  children?: CategoryWithChildren[];
};

export function ProductSection({
  title,
  categorySlug,
  products,
  subcategories = [],
}: {
  title: string;
  categorySlug: string;
  products: Product[];
  subcategories?: CategoryWithChildren[];
}) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="mt-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 border-b border-gray-200 pb-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
            {title}
          </h2>

          <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
            {products.length}টি প্রোডাক্ট
          </p>
        </div>

        <Link
          href={`/category/${categorySlug}`}
          className="shrink-0 text-sm font-semibold text-brand-600 transition hover:text-brand-700 hover:underline"
        >
          সব দেখুন →
        </Link>
      </div>

      {/* Subcategory Filter */}
      {subcategories.length > 0 && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {/* All */}
          <Link
            href={`/category/${categorySlug}`}
            className="shrink-0 rounded-full border border-brand-500 bg-brand-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-600"
          >
            সব
          </Link>

          {subcategories.map((subcategory) => (
            <Link
              key={subcategory.id}
              href={`/category/${subcategory.slug}`}
              className="shrink-0 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-600 transition hover:border-brand-400 hover:bg-brand-50 hover:text-brand-600"
            >
              {subcategory.name}
            </Link>
          ))}
        </div>
      )}

      {/* Products */}
      <div className="mt-4 flex gap-4 overflow-x-auto pb-3">
        {products.map((product) => (
          <div
            key={product.id}
            className="w-[180px] shrink-0 sm:w-[200px]"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}