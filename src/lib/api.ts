const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type FetchOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string | null;
  cache?: RequestCache;
};

export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: options.cache ?? "no-store",
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(data.error ?? "কিছু একটা সমস্যা হয়েছে", res.status);
  }

  return data as T;
}

// Multipart upload for images (product/banner images via /uploads/admin,
// payment-proof screenshots via /uploads/payment-proof). Deliberately
// separate from apiFetch since it must NOT set a JSON Content-Type header -
// the browser needs to set the multipart boundary itself.
export async function uploadFile(path: string, file: File, token?: string | null): Promise<{ url: string }> {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: form,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(data.error ?? "আপলোড ব্যর্থ হয়েছে", res.status);
  }

  return data as { url: string };
}

// The customer invoice endpoint requires an Authorization header, which a
// plain <a href> can't send - so we fetch it as a blob and trigger the
// browser's download UI manually.
export async function downloadMyInvoice(orderId: string, token: string, filename: string) {
  const res = await fetch(`${API_URL}/orders/${orderId}/invoice`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new ApiError("ইনভয়েস ডাউনলোড করতে সমস্যা হয়েছে", res.status);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

// The guest/public tracking invoice endpoint needs no auth (it's gated by
// orderNumber+phone instead), so a plain link works fine here.
export function publicInvoiceUrl(orderNumber: string, phone: string): string {
  const params = new URLSearchParams({ orderNumber, phone });
  return `${API_URL}/orders/track/invoice?${params.toString()}`;
}
