const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:4000/api";

import type { Product } from "@/lib/types";

/* =========================================================
   API ERROR
========================================================= */

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

/* =========================================================
   FETCH OPTIONS
========================================================= */

type FetchOptions = {
  method?:
    | "GET"
    | "POST"
    | "PUT"
    | "PATCH"
    | "DELETE";

  body?: unknown;

  token?: string | null;

  cache?: RequestCache;

  headers?: Record<string, string>;

  signal?: AbortSignal;
};

/* =========================================================
   API FETCH
========================================================= */

export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers ?? {}),
  };

  if (options.token) {
    headers.Authorization =
      `Bearer ${options.token}`;
  }

  const res = await fetch(
    `${API_URL}${path}`,
    {
      method:
        options.method ?? "GET",

      headers,

      body:
        options.body !== undefined
          ? JSON.stringify(
              options.body,
            )
          : undefined,

      cache:
        options.cache ?? "no-store",

      signal: options.signal,
    },
  );

  const data =
    await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(
      data.error ??
        data.message ??
        "কিছু একটা সমস্যা হয়েছে",
      res.status,
    );
  }

  return data as T;
}

export async function uploadFiles(
  path: string,
  files: File[],
  token?: string | null,
): Promise<{ success?: boolean; urls: string[] }> {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error ?? data.message ?? "ফাইল আপলোড করা যায়নি", res.status);
  return data;
}

export async function uploadFile(
  path: string,
  file: File,
  token?: string | null,
): Promise<{ success?: boolean; urls: string[] }> {
  return uploadFiles(path, [file], token);
}

export async function downloadMyInvoice(orderId: string, token: string, filename: string) {
  const res = await fetch(`${API_URL}/orders/${encodeURIComponent(orderId)}/invoice`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new ApiError("ইনভয়েস ডাউনলোড করা যায়নি", res.status);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function publicInvoiceUrl(orderNumber: string, phone: string) {
  return `${API_URL}/orders/invoice?orderNumber=${encodeURIComponent(orderNumber)}&phone=${encodeURIComponent(phone)}`;
}

/* =========================================================
   AI IMAGE SEARCH
========================================================= */

export type SearchIntent = {
  keywords: string[];

  category: string | null;

  minPrice: number | null;

  maxPrice: number | null;

  sort:
    | "relevance"
    | "price_asc"
    | "price_desc"
    | "newest";
};

export type AiSearchResponse = {
  success: boolean;
  type: "text" | "image" | "combined" | string;
  query: string;
  intent: SearchIntent;
  count: number;
  total?: number;
  page: number;
  totalPages?: number;
  products: Product[];
};

export async function aiImageSearch(
  file: File,
  signal?: AbortSignal,
): Promise<SearchIntent> {
  const formData =
    new FormData();

  formData.append(
    "image",
    file,
  );

  const res = await fetch(
    `${API_URL}/search/ai-image`,
    {
      method: "POST",
      body: formData,
      signal,
    },
  );

  const data =
    await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(
      data.error ??
        data.message ??
        "ছবি বিশ্লেষণ করা যায়নি",
      res.status,
    );
  }

  /*
   * Backend যদি সরাসরি intent return করে
   */
  if (
    data.keywords &&
    Array.isArray(data.keywords)
  ) {
    return data as SearchIntent;
  }

  /*
   * Backend যদি { success, intent } return করে
   */
  if (data.intent) {
    return data.intent as SearchIntent;
  }

  throw new ApiError(
    "AI search result পাওয়া যায়নি",
    500,
  );
}

/* =========================================================
   AI TEXT SEARCH
========================================================= */

export async function aiTextSearch(
  query: string,
  signal?: AbortSignal,
): Promise<SearchIntent> {
  const res = await fetch(
    `${API_URL}/search/ai`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        query,
        page: 1,
      }),

      signal,
    },
  );

  const data =
    await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(
      data.error ??
        data.message ??
        "AI search ব্যর্থ হয়েছে",
      res.status,
    );
  }

  if (data.intent && Array.isArray(data.products)) {
    return data.intent as SearchIntent;
  }

  if (
    data.keywords &&
    Array.isArray(data.keywords)
  ) {
    return data as SearchIntent;
  }

  if (data.intent) {
    return data.intent as SearchIntent;
  }

  throw new ApiError(
    "AI search result পাওয়া যায়নি",
    500,
  );
}

export async function aiTextSearchResults(
  query: string,
  page = 1,
): Promise<AiSearchResponse> {
  const data = await apiFetch<AiSearchResponse>("/search/ai", {
    method: "POST",
    body: { query, page },
  });

  if (!data || !Array.isArray(data.products)) {
    throw new ApiError("AI search result পাওয়া যায়নি", 500);
  }

  return data;
}

/* =========================================================
   AUTOCOMPLETE SEARCH
========================================================= */

export type AutocompleteCategory = {
  id: string;
  name: string;
  slug: string;
  type: "category" | string;
};

export type AutocompleteSuggestion = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  price: number;
  discountPrice: number | null;
  discountPercent: number | null;
  category: string | null;
  type: "product" | string;
};

export type AutocompleteResponse = {
  suggestions: AutocompleteSuggestion[];
  categories: AutocompleteCategory[];
  keywords: string[];
};

export async function autocompleteSearch(
  query: string,
  signal?: AbortSignal,
): Promise<AutocompleteResponse> {
  const data = await apiFetch<{
    suggestions?: unknown;
    categories?: unknown;
    keywords?: unknown;
    data?: {
      suggestions?: unknown;
      categories?: unknown;
      keywords?: unknown;
    };
  }>(
    `/search/autocomplete?q=${encodeURIComponent(query.trim())}`,
    { signal },
  );

  const payload = data.data ?? data;
  const suggestions = Array.isArray(payload.suggestions)
    ? payload.suggestions.filter(
        (item): item is AutocompleteSuggestion =>
          Boolean(item) && typeof item === "object" &&
          typeof (item as AutocompleteSuggestion).id === "string" &&
          typeof (item as AutocompleteSuggestion).name === "string" &&
          typeof (item as AutocompleteSuggestion).slug === "string",
      )
    : [];
  const categories = Array.isArray(payload.categories)
    ? payload.categories.filter(
        (item): item is AutocompleteCategory =>
          Boolean(item) &&
          typeof item === "object" &&
          typeof (item as AutocompleteCategory).name === "string" &&
          typeof (item as AutocompleteCategory).slug === "string",
      )
    : [];
  const keywords = Array.isArray(payload.keywords)
    ? payload.keywords.filter(
        (item): item is string => typeof item === "string",
      )
    : [];

  return { suggestions, categories, keywords };
}

/* =========================================================
   PRODUCT SEARCH
========================================================= */

export type ProductSearchResponse = {
  success?: boolean;

  products: Product[];

  total?: number;

  page?: number;

  totalPages?: number;
};

export async function searchProducts(
  params: {
    keywords?: string[];

    category?: string | null;

    minPrice?: number | null;

    maxPrice?: number | null;

    sort?:
      | "relevance"
      | "price_asc"
      | "price_desc"
      | "newest";

    page?: number;

    limit?: number;
  },
): Promise<ProductSearchResponse> {
  const searchParams =
    new URLSearchParams();

  if (
    params.keywords?.length
  ) {
    searchParams.set(
      "keywords",
      params.keywords.join(","),
    );
  }

  if (params.category) {
    searchParams.set(
      "category",
      params.category,
    );
  }

  if (
    typeof params.minPrice ===
      "number"
  ) {
    searchParams.set(
      "minPrice",
      String(params.minPrice),
    );
  }

  if (
    typeof params.maxPrice ===
      "number"
  ) {
    searchParams.set(
      "maxPrice",
      String(params.maxPrice),
    );
  }

  if (params.sort) {
    searchParams.set(
      "sort",
      params.sort,
    );
  }

  searchParams.set(
    "page",
    String(params.page ?? 1),
  );

  searchParams.set(
    "limit",
    String(params.limit ?? 24),
  );

  return apiFetch<ProductSearchResponse>(
    `/products?${searchParams.toString()}`,
  );
}