import Link from "next/link";
import type { Product } from "@/lib/types";
import { ProductCard } from "./ProductCard";

export function ProductSection({
  title,
  categorySlug,
  products,
}: {
  title: string;
  categorySlug: string;
  products: Product[];
}) {
  if (products.length === 0) return null;

  return (
    <section className="mt-6">
      <div className="bg-brand-500 text-white px-4 py-2.5 rounded-sm text-center font-medium">
        {title}
      </div>
      <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      <div className="text-right mt-2">
        <Link href={`/category/${categorySlug}`} className="text-sm text-brand-600 hover:underline">
          সব দেখুন »
        </Link>
      </div>
    </section>
  );
}
