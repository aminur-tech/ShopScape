import { notFound } from "next/navigation";
import { CategorySidebar } from "@/components/site/CategorySidebar";
import { apiFetch } from "@/lib/api";
import type { Product } from "@/lib/types";
import { ProductDetailClient } from "@/components/site/ProductDetailClient";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await apiFetch<{ product: Product }>(
    `/products/${slug}`
  )
    .then((d) => d.product)
    .catch(() => null);

  if (!product) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <CategorySidebar />

      <main className="min-w-0 flex-1">
        <ProductDetailClient product={product} />
      </main>
    </div>
  );
}