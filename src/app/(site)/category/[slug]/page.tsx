import { CategorySidebar } from "@/components/site/CategorySidebar";
import { ProductCard } from "@/components/site/ProductCard";
import { apiFetch } from "@/lib/api";
import type { Category, Product } from "@/lib/types";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const [products, categories] = await Promise.all([
    apiFetch<{ products: Product[] }>(`/products?category=${slug}&limit=48`)
      .then((d) => d.products)
      .catch(() => []),
    apiFetch<{ categories: Category[] }>("/categories")
      .then((d) => d.categories)
      .catch(() => []),
  ]);

  const category = categories.find((c) => c.slug === slug);

  return (
    <div className="flex gap-6">
      <CategorySidebar />
      <div className="flex-1 min-w-0">
        <h1 className="text-xl font-semibold mb-4">{category?.name ?? "ক্যাটাগরি"}</h1>
        {products.length === 0 ? (
          <p className="text-gray-500">এই ক্যাটাগরিতে এখনো কোনো প্রোডাক্ট নেই।</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
