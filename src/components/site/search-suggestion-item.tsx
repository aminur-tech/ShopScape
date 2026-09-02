import Link from "next/link";
import { Package } from "lucide-react";
import type { AutocompleteSuggestion } from "@/lib/api";
import { formatBDT } from "@/lib/format";

export function SearchSuggestionItem({ product, query, selected, onSelect }: { product: AutocompleteSuggestion; query: string; selected?: boolean; onSelect: () => void }) {
  const price = product.discountPrice ?? product.price;
  const discounted = product.discountPrice != null && product.discountPrice < product.price;
  return <Link href={`/products/${product.slug}`} onClick={onSelect} className={`flex items-center gap-3 rounded-xl p-2 transition ${selected ? "bg-brand-50" : "hover:bg-gray-50"}`}>
    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
      {product.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={product.image} alt="" loading="lazy" className="h-full w-full object-cover" />
      ) : <div className="flex h-full items-center justify-center text-gray-400"><Package className="h-5 w-5" /></div>}
    </div>
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-semibold text-gray-800">{highlight(product.name, query)}</p>
      <p className="truncate text-[11px] text-gray-500">{product.category ?? "পণ্য"}</p>
      <div className="flex items-center gap-2 text-xs"><span className="font-bold text-brand-600">{formatBDT(price)}</span>{discounted && <span className="text-gray-400 line-through">{formatBDT(product.price)}</span>}{discounted && product.discountPercent != null && <span className="font-semibold text-red-500">-{product.discountPercent}%</span>}</div>
    </div>
  </Link>;
}

function highlight(value: string, query: string) {
  const trimmed = query.trim();
  if (!trimmed) return value;
  return value.split(new RegExp(`(${escapeRegExp(trimmed)})`, "ig")).map((part, index) => part.toLowerCase() === trimmed.toLowerCase() ? <mark key={index} className="bg-transparent font-bold text-brand-600">{part}</mark> : part);
}
function escapeRegExp(value: string) { return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
