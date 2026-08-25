import { BannerCarousel } from "@/components/site/BannerCarousel";
import { CategorySidebar } from "@/components/site/CategorySidebar";
import { ProductSection } from "@/components/site/ProductSection";
import { apiFetch } from "@/lib/api";
import type { Category, Product } from "@/lib/types";

async function getCategories() {
  try {
    const data = await apiFetch<{ categories: Category[] }>("/categories");
    return data.categories;
  } catch {
    return [];
  }
}

async function getProductsByCategory(slug: string) {
  try {
    const data = await apiFetch<{ products: Product[] }>(`/products?category=${slug}&limit=8`);
    return data.products;
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const categories = await getCategories();
  const sections = await Promise.all(
    categories.slice(0, 3).map(async (cat) => ({
      category: cat,
      products: await getProductsByCategory(cat.slug),
    }))
  );

  return (
    <div className="flex gap-6">
      <CategorySidebar />
      <div className="flex-1 min-w-0">
        <BannerCarousel />
        
        {sections.map(({ category, products }) => (
          <ProductSection
            key={category.id}
            title={category.name}
            categorySlug={category.slug}
            products={products}
          />
        ))}
        {sections.every((s) => s.products.length === 0) && (
          <p className="mt-8 text-center text-gray-500">
            এখনো কোনো প্রোডাক্ট যোগ করা হয়নি। অ্যাডমিন প্যানেল থেকে প্রোডাক্ট যোগ করুন।
          </p>
        )}
      </div>
    </div>
  );
}
