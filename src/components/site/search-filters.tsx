"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function SearchFilters({ sort }: { sort?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function changeSort(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("sort", value); else params.delete("sort");
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return <label className="flex items-center gap-2 text-sm text-gray-600"><span className="sr-only">সাজানোর পদ্ধতি</span><select value={sort ?? "relevance"} onChange={(event) => changeSort(event.target.value)} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"><option value="relevance">Relevance</option><option value="price_asc">Price low to high</option><option value="price_desc">Price high to low</option><option value="newest">Newest</option></select></label>;
}
