import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatBDT } from "@/lib/format";

export function ProductCard({ product }: { product: Product }) {
  const hasDiscount = product.discountPrice != null && product.discountPrice < product.price;
  const displayPrice = product.discountPrice ?? product.price;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block w-40 sm:w-48 shrink-0 rounded-md border border-gray-100 overflow-hidden hover:shadow-md transition"
    >
      <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden relative">
        {hasDiscount && product.discountPercent && (
          <span className="absolute top-2 left-2 z-10 rounded bg-sale px-1.5 py-0.5 text-[11px] font-bold text-white">
            -{product.discountPercent}%
          </span>
        )}
        {product.images[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover group-hover:scale-105 transition"
          />
        ) : (
          <span className="text-3xl">🛍️</span>
        )}
      </div>
      <div className="p-3">
        <p className="text-sm text-gray-800 line-clamp-1">{product.name}</p>
        <div className="mt-1 flex items-center gap-2">
          <span className="font-bold text-brand-600">{formatBDT(displayPrice)}</span>
          {hasDiscount && (
            <span className="text-xs text-gray-400 line-through">{formatBDT(product.price)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
