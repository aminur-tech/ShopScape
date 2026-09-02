"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { aiImageSearch, aiTextSearch, type SearchIntent } from "@/lib/api";
import { ImageSearchButton } from "./image-search-button";
import { SearchDropdown } from "./search-dropdown";
import { useAutocomplete } from "@/hooks/use-autocomplete";

export function SmartSearch({ mobile = false }: { mobile?: boolean }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const aiAbortRef = useRef<AbortController | null>(null);
  const [query, setQuery] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const { data, loading, error } = useAutocomplete(query);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("shopscape-recent-searches");
      if (stored) setRecent(JSON.parse(stored) as string[]);
    } catch { /* Ignore malformed local storage. */ }
  }, []);

  useEffect(() => {
    if (!imageFile) { setPreviewUrl(null); return; }
    const url = URL.createObjectURL(imageFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  function combineIntents(imageIntent: SearchIntent | null, textIntent: SearchIntent | null): SearchIntent {
    return { keywords: Array.from(new Set([...(imageIntent?.keywords ?? []), ...(textIntent?.keywords ?? [])].map((item) => item.trim()).filter(Boolean))), category: textIntent?.category ?? imageIntent?.category ?? null, minPrice: textIntent?.minPrice ?? imageIntent?.minPrice ?? null, maxPrice: textIntent?.maxPrice ?? imageIntent?.maxPrice ?? null, sort: textIntent?.sort && textIntent.sort !== "relevance" ? textIntent.sort : imageIntent?.sort ?? "relevance" };
  }

  async function submit(event?: FormEvent, selectedImage?: File) {
    event?.preventDefault();
    const text = query.trim(); const image = selectedImage ?? imageFile;
    if (!text && !image) { router.push("/products"); return; }
    aiAbortRef.current?.abort();
    const controller = new AbortController();
    aiAbortRef.current = controller;
    setAiLoading(true); setOpen(false);
    try {
      const [imageIntent, textIntent] = await Promise.all([image ? aiImageSearch(image, controller.signal) : Promise.resolve(null), text ? aiTextSearch(text, controller.signal) : Promise.resolve(null)]);
      const intent = combineIntents(imageIntent, textIntent); const params = new URLSearchParams();
      if (text) params.set("q", text); if (intent.keywords.length) params.set("keywords", intent.keywords.join(","));
      if (intent.category) params.set("category", intent.category); if (intent.minPrice != null) params.set("minPrice", String(intent.minPrice));
      if (intent.maxPrice != null) params.set("maxPrice", String(intent.maxPrice)); if (intent.sort) params.set("sort", intent.sort);
      router.push(`/products?${params.toString()}`); setQuery(""); setImageFile(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch (cause) {
      console.error("AI product search error:", cause);
      if ((cause as Error).name !== "AbortError") router.push(text ? `/products?q=${encodeURIComponent(text)}` : "/products");
    } finally { if (!controller.signal.aborted) setAiLoading(false); }
  }

  function selectSuggestion(value: string) { setQuery(value); inputRef.current?.focus(); }
  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    const total = data.keywords.length + data.categories.length + data.suggestions.length;
    if (event.key === "Escape") { setOpen(false); return; }
    if (event.key === "ArrowDown" && total) { event.preventDefault(); setSelectedIndex((index) => (index + 1) % total); return; }
    if (event.key === "ArrowUp" && total) { event.preventDefault(); setSelectedIndex((index) => (index <= 0 ? total - 1 : index - 1)); return; }
    if (event.key === "Enter" && selectedIndex >= 0 && selectedIndex < total) {
      event.preventDefault();
      if (selectedIndex < data.keywords.length) selectSuggestion(data.keywords[selectedIndex]);
      else if (selectedIndex < data.keywords.length + data.categories.length) router.push(`/products?category=${encodeURIComponent(data.categories[selectedIndex - data.keywords.length].slug)}`);
      else router.push(`/products/${data.suggestions[selectedIndex - data.keywords.length - data.categories.length].slug}`);
    }
  }
  function handleImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; if (!file) return;
    if (!file.type.startsWith("image/")) { setImageError("শুধু JPG, PNG, WEBP, GIF বা AVIF ছবি ব্যবহার করুন।"); return; }
    if (file.size > 5 * 1024 * 1024) { setImageError("ছবির সাইজ ৫MB-এর বেশি হতে পারবে না"); return; }
    setImageError(null);
    setImageFile(file); void submit(undefined, file);
  }

  function rememberSearch(value: string) {
    if (!value) return;
    const next = [value, ...recent.filter((item) => item !== value)].slice(0, 6);
    setRecent(next);
    window.localStorage.setItem("shopscape-recent-searches", JSON.stringify(next));
  }

  return <form onSubmit={(event) => { rememberSearch(query.trim()); void submit(event); }} className={mobile ? "pb-3 md:hidden" : "w-full"} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false); }}>
    <div className="relative flex w-full">
      <Search className="absolute left-3 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-gray-400" />
      <input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} onFocus={() => setOpen(true)} onKeyDown={handleKeyDown} type="search" placeholder={imageFile ? "ছবি দিয়ে AI search..." : "যেমন: কালো থ্রি পিস ১৫০০ টাকার মধ্যে"} aria-label="পণ্য সার্চ" aria-expanded={open} aria-controls="search-autocomplete" disabled={aiLoading} className={`h-11 w-full border border-gray-200 bg-gray-50 pl-10 pr-24 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/10 disabled:cursor-wait disabled:opacity-60 ${mobile ? "rounded-xl" : "rounded-xl"}`} />
      <ImageSearchButton inputRef={inputRef} disabled={aiLoading} onChange={handleImage} />
      {query && <button type="button" aria-label="সার্চ মুছে ফেলুন" onClick={() => setQuery("")} className="absolute right-11 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700"><X className="h-4 w-4" /></button>}
      {open && <div id="search-autocomplete"><SearchDropdown data={data} query={query} recent={recent} loading={loading} error={error} selectedIndex={selectedIndex} onKeyword={selectSuggestion} onSelect={() => setOpen(false)} /></div>}
    </div>
    {imageFile && previewUrl && <div className="mt-2 flex items-center gap-2 rounded-lg border border-brand-100 bg-brand-50 px-2 py-1.5 text-xs text-brand-600"><img src={previewUrl} alt="" className="h-8 w-8 rounded object-cover" /><span className="truncate">{imageFile.name}</span><button type="button" className="ml-auto p-1 text-gray-500" onClick={() => { aiAbortRef.current?.abort(); setImageFile(null); if (inputRef.current) inputRef.current.value = ""; }}>×</button></div>}
    {imageError && <p className="mt-1 px-2 text-xs font-medium text-red-600">{imageError}</p>}
    {aiLoading && <p className="mt-1 px-2 text-xs font-medium text-brand-600">{imageFile ? "ছবি বিশ্লেষণ করা হচ্ছে..." : "AI দিয়ে খোঁজা হচ্ছে..."}</p>}
  </form>;
}
