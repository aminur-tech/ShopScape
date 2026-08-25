import { CategorySidebar } from "@/components/site/CategorySidebar";
import { ProductCard } from "@/components/site/ProductCard";
import { apiFetch } from "@/lib/api";
import type { Product } from "@/lib/types";

async function getProducts(q?: string, featured?: string) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (featured) params.set("featured", featured);
  params.set("limit", "24");
  try {
    const data = await apiFetch<{ products: Product[] }>(`/products?${params.toString()}`);
    return data.products;
  } catch {
    return [];
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; featured?: string }>;
}) {
  const params = await searchParams;
  const products = await getProducts(params.q, params.featured);

  return (
    <div className="flex gap-6">
      <CategorySidebar />
      <div className="flex-1 min-w-0">
        <h1 className="text-xl font-semibold mb-4">
          {params.q ? `"${params.q}" এর জন্য ফলাফল` : "সকল প্রোডাক্ট"}
        </h1>
        {products.length === 0 ? (
          <p className="text-gray-500">কোনো প্রোডাক্ট পাওয়া যায়নি।</p>
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
