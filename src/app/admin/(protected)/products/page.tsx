"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import { useAuth } from "@/lib/auth-context";
import {
  apiFetch,
  ApiError,
} from "@/lib/api";

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

  const [
    products,
    setProducts,
  ] = useState<AdminProduct[]>([]);

  const [q, setQ] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [
    deletingId,
    setDeletingId,
  ] = useState<string | null>(null);

  /* ------------------------------------------------------------------------ */
  /* Load                                                                     */
  /* ------------------------------------------------------------------------ */

  async function load() {
    if (!token) return;

    try {
      setLoading(true);
      setError("");

      const params = q.trim()
        ? `?q=${encodeURIComponent(
            q.trim()
          )}`
        : "";

      const data =
        await apiFetch<{
          products: AdminProduct[];
        }>(
          `/admin/products${params}`,
          {
            token,
          }
        );

      setProducts(
        data.products ?? []
      );
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

  async function handleDeactivate(
    product: AdminProduct
  ) {
    if (!token) return;

    if (!product.isActive) {
      return;
    }

    const confirmed =
      window.confirm(
        `"${product.name}" প্রোডাক্টটি নিষ্ক্রিয় করতে চান?`
      );

    if (!confirmed) return;

    try {
      setDeletingId(product.id);
      setError("");

      await apiFetch(
        `/admin/products/${product.id}`,
        {
          method: "DELETE",
          token,
        }
      );

      /*
       * Update UI immediately
       */

      setProducts(
        (current) =>
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
  /* Stock Label                                                              */
  /* ------------------------------------------------------------------------ */

  function getStockLabel(
    stock: number
  ) {
    return stock === 1
      ? "স্টকে আছে"
      : "স্টক নেই";
  }

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                             */}
      {/* ------------------------------------------------------------------ */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            প্রোডাক্ট
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            সকল প্রোডাক্ট পরিচালনা করুন
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex w-fit items-center rounded-md bg-brand-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-600"
        >
          + নতুন প্রোডাক্ট
        </Link>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Search                                                             */}
      {/* ------------------------------------------------------------------ */}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          load();
        }}
        className="flex flex-col gap-2 sm:flex-row"
      >
        <input
          value={q}
          onChange={(e) =>
            setQ(e.target.value)
          }
          placeholder="প্রোডাক্ট খুঁজুন..."
          className="w-full max-w-md rounded-md border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        />

        <button
          type="submit"
          disabled={loading}
          className="rounded-md border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
        >
          {loading
            ? "খুঁজছে..."
            : "খুঁজুন"}
        </button>

        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="rounded-md border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
        >
          Refresh
        </button>
      </form>

      {/* ------------------------------------------------------------------ */}
      {/* Error                                                              */}
      {/* ------------------------------------------------------------------ */}

      {error && (
        <div className="rounded-md border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Table                                                              */}
      {/* ------------------------------------------------------------------ */}

      <div className="overflow-hidden rounded-lg border border-gray-100 bg-white">
        {loading ? (
          <div className="px-5 py-12 text-center text-sm text-gray-500">
            প্রোডাক্ট লোড হচ্ছে...
          </div>
        ) : products.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm font-medium text-gray-700">
              কোনো প্রোডাক্ট পাওয়া যায়নি
            </p>

            <p className="mt-1 text-xs text-gray-500">
              অন্য নামে search করুন অথবা নতুন
              প্রোডাক্ট যোগ করুন।
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-5 py-3 text-left font-medium">
                    প্রোডাক্ট
                  </th>

                  <th className="px-5 py-3 text-left font-medium">
                    ক্যাটাগরি
                  </th>

                  <th className="px-5 py-3 text-left font-medium">
                    দাম
                  </th>

                  <th className="px-5 py-3 text-left font-medium">
                    স্টক
                  </th>

                  <th className="px-5 py-3 text-left font-medium">
                    Status
                  </th>

                  <th className="px-5 py-3 text-left font-medium">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {products.map(
                  (product) => (
                    <tr
                      key={product.id}
                      className="border-t border-gray-100 transition hover:bg-gray-50/50"
                    >
                      {/* ------------------------------------------------ */}
                      {/* Product + First Image                           */}
                      {/* ------------------------------------------------ */}

                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {product.images?.[0] ? (
                            <img
                              src={
                                product.images[0]
                              }
                              alt={
                                product.name
                              }
                              className="h-12 w-12 shrink-0 rounded-md border border-gray-100 object-cover"
                            />
                          ) : (
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-gray-100 text-xs text-gray-400">
                              No Image
                            </div>
                          )}

                          <div className="min-w-0">
                            <p className="max-w-[280px] truncate font-medium text-gray-900">
                              {
                                product.name
                              }
                            </p>

                            <p className="mt-0.5 text-xs text-gray-400">
                              /
                              {
                                product.slug
                              }
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* ------------------------------------------------ */}
                      {/* Category                                        */}
                      {/* ------------------------------------------------ */}

                      <td className="px-5 py-3">
                        {product.category ? (
                          <div>
                            {product.category
                              .parent ? (
                              <div className="flex flex-col">
                                <span className="text-xs text-gray-400">
                                  {
                                    product
                                      .category
                                      .parent
                                      .name
                                  }
                                </span>

                                <span className="font-medium text-gray-800">
                                  ↳{" "}
                                  {
                                    product
                                      .category
                                      .name
                                  }
                                </span>
                              </div>
                            ) : (
                              <span className="font-medium text-gray-800">
                                {
                                  product
                                    .category
                                    .name
                                }
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">
                            —
                          </span>
                        )}
                      </td>

                      {/* ------------------------------------------------ */}
                      {/* Price                                            */}
                      {/* ------------------------------------------------ */}

                      <td className="px-5 py-3">
                        <div>
                          <p className="font-medium text-gray-900">
                            {formatBDT(
                              product.discountPrice ??
                                product.price
                            )}
                          </p>

                          {product.discountPrice !=
                            null &&
                            product.discountPrice <
                              product.price && (
                              <p className="text-xs text-gray-400 line-through">
                                {formatBDT(
                                  product.price
                                )}
                              </p>
                            )}
                        </div>
                      </td>

                      {/* ------------------------------------------------ */}
                      {/* Stock                                            */}
                      {/* ------------------------------------------------ */}

                      <td className="px-5 py-3">
                        {product.stock ===
                        1 ? (
                          <span className="inline-flex rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-600">
                            স্টকে আছে
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600">
                            স্টক নেই
                          </span>
                        )}
                      </td>

                      {/* ------------------------------------------------ */}
                      {/* Active Status                                    */}
                      {/* ------------------------------------------------ */}

                      <td className="px-5 py-3">
                        {product.isActive ? (
                          <span className="inline-flex rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-600">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* ------------------------------------------------ */}
                      {/* Actions                                          */}
                      {/* ------------------------------------------------ */}

                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="font-medium text-brand-600 hover:underline"
                          >
                            এডিট
                          </Link>

                          {product.isActive ? (
                            <button
                              type="button"
                              disabled={
                                deletingId ===
                                product.id
                              }
                              onClick={() =>
                                handleDeactivate(
                                  product
                                )
                              }
                              className="font-medium text-sale hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {deletingId ===
                              product.id
                                ? "নিষ্ক্রিয় হচ্ছে..."
                                : "নিষ্ক্রিয়"}
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400">
                              নিষ্ক্রিয়
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}