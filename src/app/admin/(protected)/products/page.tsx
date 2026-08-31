"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { useAuth } from "@/lib/auth-context";
import { apiFetch, ApiError } from "@/lib/api";
import { formatBDT } from "@/lib/format";

import type { Product } from "@/lib/types";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type ProductCategory = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;

  parent: {
    id: string;
    name: string;
    slug: string;
  } | null;
};

type AdminProduct = Product & {
  images?: string[];
  isActive?: boolean;
  category?: ProductCategory | null;
};

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function AdminProductsPage() {
  const { token } = useAuth();

  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  /* ------------------------------------------------------------------------ */
  /* Load                                                                     */
  /* ------------------------------------------------------------------------ */

  async function load() {
    if (!token) return;

    try {
      setLoading(true);
      setError("");

      const params = q.trim()
        ? `?q=${encodeURIComponent(q.trim())}`
        : "";

      const data = await apiFetch<{
        products: AdminProduct[];
      }>(`/admin/products${params}`, {
        token,
      });

      setProducts(data.products ?? []);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "প্রোডাক্ট লোড করতে সমস্যা হয়েছে"
      );
    } finally {
      setLoading(false);
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Initial Load                                                             */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!token) return;

    load();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  /* ------------------------------------------------------------------------ */
  /* Deactivate                                                               */
  /* ------------------------------------------------------------------------ */

  async function handleDeactivate(product: AdminProduct) {
    if (!token || !product.isActive) return;

    const confirmed = window.confirm(
      `"${product.name}" প্রোডাক্টটি নিষ্ক্রিয় করতে চান?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(product.id);
      setError("");

      await apiFetch(`/admin/products/${product.id}`, {
        method: "DELETE",
        token,
      });

      setProducts((current) =>
        current.map((item) =>
          item.id === product.id
            ? {
                ...item,
                isActive: false,
              }
            : item
        )
      );
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "প্রোডাক্ট নিষ্ক্রিয় করতে সমস্যা হয়েছে"
      );
    } finally {
      setDeletingId(null);
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Helpers                                                                  */
  /* ------------------------------------------------------------------------ */

  function getStockStatus(stock: number) {
    return stock > 0
      ? {
          label: "স্টকে আছে",
          className:
            "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
        }
      : {
          label: "স্টক নেই",
          className: "bg-red-50 text-red-700 ring-1 ring-red-100",
        };
  }

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="min-w-0 space-y-5 sm:space-y-6">
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                             */}
      {/* ------------------------------------------------------------------ */}

      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-5 w-5"
                >
                  <path d="M20 7.5 12 3 4 7.5v9L12 21l8-4.5v-9Z" />
                  <path d="m4.5 7.5 7.5 4.25 7.5-4.25M12 12v9" />
                </svg>
              </div>

              <h1 className="text-lg font-semibold tracking-tight text-gray-900 sm:text-xl">
                প্রোডাক্ট
              </h1>
            </div>

            <p className="mt-1.5 text-sm text-gray-500">
              সকল প্রোডাক্ট পরিচালনা করুন
            </p>
          </div>

          <Link
            href="/admin/products/new"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 active:scale-[0.98] sm:w-auto"
          >
            <span className="text-base leading-none">+</span>
            নতুন প্রোডাক্ট
          </Link>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Search                                                             */}
      {/* ------------------------------------------------------------------ */}

      <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm sm:p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            load();
          }}
          className="flex flex-col gap-2 sm:flex-row"
        >
          <div className="relative min-w-0 flex-1">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>

            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="প্রোডাক্ট খুঁজুন..."
              className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/10"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="h-10 rounded-lg bg-gray-900 px-5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "খুঁজছে..." : "খুঁজুন"}
          </button>

          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="h-10 rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Refresh
          </button>
        </form>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Error                                                              */}
      {/* ------------------------------------------------------------------ */}

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="mt-0.5 h-5 w-5 shrink-0"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v4M12 16h.01" />
          </svg>

          <span>{error}</span>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Products                                                           */}
      {/* ------------------------------------------------------------------ */}

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        {/* Loading */}
        {loading ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center px-5 py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-brand-500" />

            <p className="mt-3 text-sm text-gray-500">
              প্রোডাক্ট লোড হচ্ছে...
            </p>
          </div>
        ) : products.length === 0 ? (
          /* Empty */
          <div className="flex min-h-[280px] flex-col items-center justify-center px-5 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                className="h-7 w-7 text-gray-400"
              >
                <path d="M20 7.5 12 3 4 7.5v9L12 21l8-4.5v-9Z" />
                <path d="m4.5 7.5 7.5 4.25 7.5-4.25" />
              </svg>
            </div>

            <p className="mt-4 text-sm font-semibold text-gray-700">
              কোনো প্রোডাক্ট পাওয়া যায়নি
            </p>

            <p className="mt-1 max-w-sm text-xs leading-5 text-gray-500">
              অন্য নামে search করুন অথবা নতুন প্রোডাক্ট যোগ করুন।
            </p>

            <Link
              href="/admin/products/new"
              className="mt-4 text-sm font-medium text-brand-600 hover:underline"
            >
              + নতুন প্রোডাক্ট যোগ করুন
            </Link>
          </div>
        ) : (
          <>
            {/* ============================================================ */}
            {/* Desktop Table                                                 */}
            {/* ============================================================ */}

            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-100 bg-gray-50/80">
                  <tr>
                    <th className="px-5 py-3.5 text-left font-semibold text-gray-600">
                      প্রোডাক্ট
                    </th>

                    <th className="px-5 py-3.5 text-left font-semibold text-gray-600">
                      ক্যাটাগরি
                    </th>

                    <th className="px-5 py-3.5 text-left font-semibold text-gray-600">
                      দাম
                    </th>

                    <th className="px-5 py-3.5 text-left font-semibold text-gray-600">
                      স্টক
                    </th>

                    <th className="px-5 py-3.5 text-left font-semibold text-gray-600">
                      Status
                    </th>

                    <th className="px-5 py-3.5 text-right font-semibold text-gray-600">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((product) => {
                    const stockStatus = getStockStatus(product.stock);

                    return (
                      <tr
                        key={product.id}
                        className="border-b border-gray-100 last:border-0 hover:bg-gray-50/60"
                      >
                        {/* Product */}
                        <td className="px-5 py-4">
                          <div className="flex min-w-[260px] items-center gap-3">
                            {product.images?.[0] ? (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="h-12 w-12 shrink-0 rounded-lg border border-gray-100 object-cover"
                              />
                            ) : (
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-[10px] font-medium text-gray-400">
                                No Image
                              </div>
                            )}

                            <div className="min-w-0">
                              <p className="max-w-[280px] truncate font-semibold text-gray-900">
                                {product.name}
                              </p>

                              <p className="mt-0.5 max-w-[280px] truncate text-xs text-gray-400">
                                /{product.slug}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-5 py-4">
                          {product.category ? (
                            product.category.parent ? (
                              <div className="flex flex-col">
                                <span className="text-xs text-gray-400">
                                  {product.category.parent.name}
                                </span>

                                <span className="mt-0.5 font-medium text-gray-800">
                                  ↳ {product.category.name}
                                </span>
                              </div>
                            ) : (
                              <span className="font-medium text-gray-800">
                                {product.category.name}
                              </span>
                            )
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>

                        {/* Price */}
                        <td className="whitespace-nowrap px-5 py-4">
                          <p className="font-semibold text-gray-900">
                            {formatBDT(
                              product.discountPrice ?? product.price
                            )}
                          </p>

                          {product.discountPrice != null &&
                            product.discountPrice < product.price && (
                              <p className="mt-0.5 text-xs text-gray-400 line-through">
                                {formatBDT(product.price)}
                              </p>
                            )}
                        </td>

                        {/* Stock */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${stockStatus.className}`}
                          >
                            {stockStatus.label}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          {product.isActive ? (
                            <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-500">
                              Inactive
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-3">
                            <Link
                              href={`/admin/products/${product.id}`}
                              className="rounded-md px-2 py-1 text-sm font-semibold text-brand-600 transition hover:bg-brand-50"
                            >
                              এডিট
                            </Link>

                            {product.isActive ? (
                              <button
                                type="button"
                                disabled={deletingId === product.id}
                                onClick={() =>
                                  handleDeactivate(product)
                                }
                                className="rounded-md px-2 py-1 text-sm font-semibold text-sale transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {deletingId === product.id
                                  ? "নিষ্ক্রিয় হচ্ছে..."
                                  : "নিষ্ক্রিয়"}
                              </button>
                            ) : (
                              <span className="px-2 py-1 text-xs text-gray-400">
                                নিষ্ক্রিয়
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ============================================================ */}
            {/* Mobile / Tablet Cards                                          */}
            {/* ============================================================ */}

            <div className="divide-y divide-gray-100 lg:hidden">
              {products.map((product) => {
                const stockStatus = getStockStatus(product.stock);

                return (
                  <div
                    key={product.id}
                    className="p-4 transition hover:bg-gray-50/60 sm:p-5"
                  >
                    {/* Product Header */}
                    <div className="flex items-start gap-3">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="h-14 w-14 shrink-0 rounded-lg border border-gray-100 object-cover sm:h-16 sm:w-16"
                        />
                      ) : (
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-[10px] font-medium text-gray-400 sm:h-16 sm:w-16">
                          No Image
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-semibold text-gray-900 sm:text-base">
                              {product.name}
                            </h3>

                            <p className="mt-0.5 truncate text-xs text-gray-400">
                              /{product.slug}
                            </p>
                          </div>

                          {product.isActive ? (
                            <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-100 sm:text-xs">
                              Active
                            </span>
                          ) : (
                            <span className="shrink-0 rounded-full bg-gray-100 px-2 py-1 text-[10px] font-semibold text-gray-500 sm:text-xs">
                              Inactive
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {/* Category */}
                      <div className="rounded-lg bg-gray-50 p-2.5 sm:p-3">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400 sm:text-xs">
                          ক্যাটাগরি
                        </p>

                        <p className="mt-1 truncate text-xs font-medium text-gray-700 sm:text-sm">
                          {product.category?.parent
                            ? `${product.category.parent.name} › ${product.category.name}`
                            : product.category?.name ?? "—"}
                        </p>
                      </div>

                      {/* Price */}
                      <div className="rounded-lg bg-gray-50 p-2.5 sm:p-3">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400 sm:text-xs">
                          দাম
                        </p>

                        <p className="mt-1 text-xs font-semibold text-gray-900 sm:text-sm">
                          {formatBDT(
                            product.discountPrice ?? product.price
                          )}
                        </p>

                        {product.discountPrice != null &&
                          product.discountPrice < product.price && (
                            <p className="text-[10px] text-gray-400 line-through sm:text-xs">
                              {formatBDT(product.price)}
                            </p>
                          )}
                      </div>

                      {/* Stock */}
                      <div className="rounded-lg bg-gray-50 p-2.5 sm:p-3">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400 sm:text-xs">
                          স্টক
                        </p>

                        <span
                          className={`mt-1 inline-flex rounded-full px-2 py-1 text-[10px] font-semibold sm:text-xs ${stockStatus.className}`}
                        >
                          {stockStatus.label}
                        </span>
                      </div>

                      {/* Status */}
                      <div className="rounded-lg bg-gray-50 p-2.5 sm:p-3">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400 sm:text-xs">
                          Status
                        </p>

                        <span
                          className={`mt-1 inline-flex rounded-full px-2 py-1 text-[10px] font-semibold sm:text-xs ${
                            product.isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {product.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-3">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="inline-flex flex-1 items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-brand-600 transition hover:bg-brand-50 sm:flex-none sm:px-4 sm:text-sm"
                      >
                        এডিট
                      </Link>

                      {product.isActive ? (
                        <button
                          type="button"
                          disabled={deletingId === product.id}
                          onClick={() => handleDeactivate(product)}
                          className="inline-flex flex-1 items-center justify-center rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-semibold text-sale transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none sm:px-4 sm:text-sm"
                        >
                          {deletingId === product.id
                            ? "নিষ্ক্রিয় হচ্ছে..."
                            : "নিষ্ক্রিয়"}
                        </button>
                      ) : (
                        <span className="flex-1 text-center text-xs text-gray-400 sm:flex-none sm:px-4">
                          নিষ্ক্রিয়
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Result Count                                                       */}
      {/* ------------------------------------------------------------------ */}

      {!loading && products.length > 0 && (
        <div className="px-1 text-xs text-gray-400">
          মোট{" "}
          <span className="font-semibold text-gray-600">
            {products.length}
          </span>{" "}
          টি প্রোডাক্ট দেখানো হচ্ছে
        </div>
      )}
    </div>
  );
}