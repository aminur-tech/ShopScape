import { CategorySidebar } from "@/components/site/CategorySidebar";
import { ProductCard } from "@/components/site/ProductCard";
import { aiTextSearchResults, apiFetch } from "@/lib/api";
import type { Product } from "@/lib/types";
import { SearchFilters } from "@/components/site/search-filters";

async function getProducts(params: {
  q?: string;
  keywords?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  featured?: string;
  page?: string;
}) {
  const numericQuery = params.q?.trim();
  const isPriceOnlyQuery = Boolean(numericQuery && /^\d+(?:\.\d+)?$/.test(numericQuery));

  if (params.q && !isPriceOnlyQuery) {
    try {
      return await aiTextSearchResults(params.q, Number(params.page ?? 1));
    } catch {
      return { products: [], total: 0, page: 1, totalPages: 0 };
    }
  }

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value && !(isPriceOnlyQuery && key === "q")) searchParams.set(key, value);
  });
  if (isPriceOnlyQuery && !params.maxPrice) searchParams.set("maxPrice", numericQuery ?? "");
  searchParams.set("limit", "24");
  try {
    return await apiFetch<{ products: Product[]; total?: number; count?: number; page?: number; totalPages?: number }>(`/products?${searchParams.toString()}`);
  } catch {
    return { products: [], total: 0, page: 1, totalPages: 0 };
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; keywords?: string; category?: string; minPrice?: string; maxPrice?: string; sort?: string; featured?: string; page?: string }>;
}) {
  const params = await searchParams;
  const result = await getProducts(params);
  const currentPage = Number(params.page ?? result.page ?? 1);
  const totalPages = result.totalPages ?? Math.ceil((result.total ?? result.products.length) / 24);

  return (
    <div className="flex gap-6">
      <CategorySidebar />
      <div className="flex-1 min-w-0">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
          <h1 className="text-xl font-semibold">
          {params.q ? `"${params.q}" এর জন্য ফলাফল` : "সকল প্রোডাক্ট"}
          </h1>
          <p className="mt-1 text-sm text-gray-500">{result.total ?? result.count ?? result.products.length} টি ফলাফল</p>
          </div>
          <SearchFilters sort={params.sort} />
        </div>
        {result.products.length === 0 ? (
          <p className="text-gray-500">কোনো প্রোডাক্ট পাওয়া যায়নি।</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {result.products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
        {totalPages > 1 && <nav aria-label="পৃষ্ঠা পরিবর্তন" className="mt-8 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => {
            const href = new URLSearchParams(Object.entries(params).filter(([, value]) => Boolean(value)) as [string, string][]);
            href.set("page", String(page));
            return <a key={page} href={`/products?${href.toString()}`} className={`rounded-lg px-3 py-2 text-sm ${page === currentPage ? "bg-brand-500 text-white" : "border border-gray-200 text-gray-700 hover:border-brand-500"}`}>{page}</a>;
          })}
        </nav>}
      </div>
    </div>
  );
}
