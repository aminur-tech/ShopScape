import Link from "next/link";
import { ArrowRight, Search, Tag } from "lucide-react";
import type { AutocompleteResponse } from "@/lib/api";
import { SearchSuggestionItem } from "./search-suggestion-item";

export function SearchDropdown({ data, query, recent, loading, error, selectedIndex, onKeyword, onSelect }: { data: AutocompleteResponse; query: string; recent: string[]; loading: boolean; error: string | null; selectedIndex: number; onKeyword: (value: string) => void; onSelect: () => void }) {
  const products = data.suggestions.slice(0, 8);
  let index = 0;
  return <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-[60] max-h-[min(75vh,34rem)] overflow-y-auto rounded-2xl border border-gray-100 bg-white p-3 shadow-[0_18px_50px_rgba(15,23,42,0.16)] animate-[search-dropdown-in_150ms_ease-out]">
    {loading && <div className="space-y-2 p-2"><Skeleton /><Skeleton /><Skeleton /></div>}
    {error && <p className="px-3 py-4 text-sm text-red-600">সার্চ সাজেশন সাময়িকভাবে unavailable। Enter চাপলে আবার চেষ্টা করুন।</p>}
    {!loading && !error && !query.trim() && recent.length > 0 && <Section title="Recent searches">{recent.map((item) => <button key={item} type="button" onClick={() => onKeyword(item)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"><Search className="h-4 w-4 text-gray-400" />{item}</button>)}</Section>}
    {!loading && !error && query.trim() && <>
      {data.keywords.length > 0 && <Section title="Search suggestions">{data.keywords.map((keyword) => { const current = index++; return <button key={keyword} type="button" onClick={() => onKeyword(keyword)} className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${selectedIndex === current ? "bg-brand-50 text-brand-600" : "text-gray-700 hover:bg-gray-50"}`}><Search className="h-4 w-4 text-gray-400" />{keyword}</button>; })}</Section>}
      {data.categories.length > 0 && <Section title="Categories">{data.categories.map((category) => { const current = index++; return <Link key={category.id || category.slug} href={`/products?category=${encodeURIComponent(category.slug)}`} onClick={onSelect} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${selectedIndex === current ? "bg-brand-50 text-brand-600" : "text-gray-700 hover:bg-gray-50"}`}><Tag className="h-4 w-4 text-brand-500" />{category.name}</Link>; })}</Section>}
      {products.length > 0 && <Section title="Products">{products.map((product) => { const current = index++; return <SearchSuggestionItem key={product.id} product={product} query={query} onSelect={onSelect} selected={selectedIndex === current} />; })}</Section>}
      {index === 0 && <p className="px-3 py-5 text-center text-sm text-gray-500">কোনো পণ্য পাওয়া যায়নি</p>}
      <Link href={`/products?q=${encodeURIComponent(query.trim())}`} onClick={onSelect} className="mt-2 block border-t border-gray-100 px-3 pt-3 text-xs font-semibold text-brand-600 hover:text-brand-700">View all results <ArrowRight className="ml-1 inline h-3.5 w-3.5" /></Link>
    </>}
  </div>;
}
function Section({ title, children }: { title: string; children: React.ReactNode }) { return <section className="mb-3 last:mb-0"><h3 className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wide text-gray-400">{title}</h3>{children}</section>; }
function Skeleton() { return <div className="h-14 animate-pulse rounded-xl bg-gray-100" />; }
