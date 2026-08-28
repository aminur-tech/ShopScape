
"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useAuth,
} from "@/lib/auth-context";

import {
  apiFetch,
  ApiError,
} from "@/lib/api";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type CategoryCount = {
  products: number;
};

type AdminSubcategory = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  isActive: boolean;
  parentId: string | null;

  _count: CategoryCount;
};

type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  isActive: boolean;
  parentId: string | null;

  _count: CategoryCount;

  children: AdminSubcategory[];
};

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function AdminCategoriesPage() {
  const { token } = useAuth();

  /* ------------------------------------------------------------------------ */
  /* State                                                                    */
  /* ------------------------------------------------------------------------ */

  const [categories, setCategories] =
    useState<AdminCategory[]>([]);

  const [name, setName] =
    useState("");

  const [parentId, setParentId] =
    useState("");

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  /* ------------------------------------------------------------------------ */
  /* Load Categories                                                          */
  /* ------------------------------------------------------------------------ */

  async function loadCategories() {
    if (!token) return;

    try {
      setLoading(true);
      setError("");

      const data =
        await apiFetch<{
          categories: AdminCategory[];
        }>("/admin/categories", {
          token,
        });

      setCategories(
        data.categories ?? []
      );
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "ক্যাটাগরি লোড করতে সমস্যা হয়েছে"
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

    loadCategories();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  /* ------------------------------------------------------------------------ */
  /* Add Category / Subcategory                                               */
  /* ------------------------------------------------------------------------ */

  async function handleAdd(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!token) {
      setError("Authentication required");
      return;
    }

    setError("");
    setSuccess("");

    const trimmedName =
      name.trim();

    if (trimmedName.length < 2) {
      setError(
        "ক্যাটাগরির নাম কমপক্ষে ২ অক্ষরের হতে হবে"
      );
      return;
    }

    try {
      setSubmitting(true);

      await apiFetch(
        "/admin/categories",
        {
          method: "POST",
          token,

          body: {
            name: trimmedName,

            parentId:
              parentId || null,
          },
        }
      );

      setName("");
      setParentId("");

      setSuccess(
        parentId
          ? "সাবক্যাটাগরি সফলভাবে যোগ হয়েছে"
          : "ক্যাটাগরি সফলভাবে যোগ হয়েছে"
      );

      await loadCategories();

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "ক্যাটাগরি যোগ করতে সমস্যা হয়েছে"
      );
    } finally {
      setSubmitting(false);
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Delete Category / Subcategory                                            */
  /* ------------------------------------------------------------------------ */

  async function handleDelete(
    id: string,
    name: string
  ) {
    if (!token) return;

    const confirmed = window.confirm(
      `"${name}" ক্যাটাগরিটি মুছে ফেলতে চান?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      setError("");
      setSuccess("");

      await apiFetch(
        `/admin/categories/${id}`,
        {
          method: "DELETE",
          token,
        }
      );

      setSuccess(
        "ক্যাটাগরি সফলভাবে মুছে ফেলা হয়েছে"
      );

      await loadCategories();

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "ক্যাটাগরি মুছতে সমস্যা হয়েছে"
      );
    } finally {
      setDeletingId(null);
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Helpers                                                                  */
  /* ------------------------------------------------------------------------ */

  const totalSubcategories =
    categories.reduce(
      (total, category) =>
        total + category.children.length,
      0
    );

  const totalProducts =
    categories.reduce(
      (total, category) => {
        const parentProducts =
          category._count.products;

        const childProducts =
          category.children.reduce(
            (childTotal, child) =>
              childTotal +
              child._count.products,
            0
          );

        return (
          total +
          parentProducts +
          childProducts
        );
      },
      0
    );

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="space-y-6">
      {/* ================================================================== */}
      {/* Header                                                             */}
      {/* ================================================================== */}

      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          ক্যাটাগরি
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Parent category এবং subcategory
          পরিচালনা করুন
        </p>
      </div>

      {/* ================================================================== */}
      {/* Statistics                                                         */}
      {/* ================================================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Parent */}

        <div className="rounded-lg border border-gray-100 bg-white p-4">
          <p className="text-sm text-gray-500">
            Parent Category
          </p>

          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {categories.length}
          </p>
        </div>

        {/* Subcategory */}

        <div className="rounded-lg border border-gray-100 bg-white p-4">
          <p className="text-sm text-gray-500">
            Subcategory
          </p>

          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {totalSubcategories}
          </p>
        </div>

        {/* Products */}

        <div className="rounded-lg border border-gray-100 bg-white p-4">
          <p className="text-sm text-gray-500">
            মোট Product
          </p>

          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {totalProducts}
          </p>
        </div>
      </div>

      {/* ================================================================== */}
      {/* Add Form                                                           */}
      {/* ================================================================== */}

      <div className="rounded-lg border border-gray-100 bg-white p-5">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-gray-900">
            নতুন ক্যাটাগরি যোগ করুন
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            Parent Category ফাঁকা রাখলে এটি
            একটি মূল ক্যাটাগরি হবে।
          </p>
        </div>

        <form
          onSubmit={handleAdd}
          className="grid gap-4 md:grid-cols-[240px_1fr_auto]"
        >
          {/* Parent Category */}

          <div>
            <label
              htmlFor="parentCategory"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Parent Category
            </label>

            <select
              id="parentCategory"
              value={parentId}
              onChange={(e) =>
                setParentId(
                  e.target.value
                )
              }
              className="w-full rounded-md border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            >
              <option value="">
                মূল ক্যাটাগরি
              </option>

              {categories.map(
                (category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                )
              )}
            </select>
          </div>

          {/* Name */}

          <div>
            <label
              htmlFor="categoryName"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              {parentId
                ? "Subcategory Name"
                : "Category Name"}
            </label>

            <input
              id="categoryName"
              type="text"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              placeholder={
                parentId
                  ? "যেমন: শাড়ি"
                  : "যেমন: মেয়েদের পোশাক"
              }
              required
              className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {/* Submit */}

          <div className="flex items-end">
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-md bg-brand-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
            >
              {submitting
                ? "যোগ হচ্ছে..."
                : parentId
                  ? "সাবক্যাটাগরি যোগ করুন"
                  : "ক্যাটাগরি যোগ করুন"}
            </button>
          </div>
        </form>

        {/* Error */}

        {error && (
          <div className="mt-4 rounded-md border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Success */}

        {success && (
          <div className="mt-4 rounded-md border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-600">
            {success}
          </div>
        )}
      </div>

      {/* ================================================================== */}
      {/* Category List                                                       */}
      {/* ================================================================== */}

      <div className="overflow-hidden rounded-lg border border-gray-100 bg-white">
        {/* Table Header */}

        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              সকল ক্যাটাগরি
            </h2>

            <p className="mt-0.5 text-xs text-gray-500">
              Parent এবং Subcategory
            </p>
          </div>

          <button
            type="button"
            onClick={loadCategories}
            disabled={loading}
            className="rounded-md border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
          >
            {loading
              ? "লোড হচ্ছে..."
              : "Refresh"}
          </button>
        </div>

        {/* Loading */}

        {loading ? (
          <div className="flex items-center justify-center px-5 py-12">
            <div className="text-sm text-gray-500">
              ক্যাটাগরি লোড হচ্ছে...
            </div>
          </div>
        ) : categories.length === 0 ? (
          /* Empty */

          <div className="px-5 py-12 text-center">
            <div className="text-sm font-medium text-gray-700">
              কোনো ক্যাটাগরি নেই
            </div>

            <p className="mt-1 text-xs text-gray-500">
              উপরের form থেকে প্রথম ক্যাটাগরি
              যোগ করুন।
            </p>
          </div>
        ) : (
          /* Table */

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-5 py-3 text-left font-medium">
                    ক্যাটাগরি
                  </th>

                  <th className="px-5 py-3 text-left font-medium">
                    ধরন
                  </th>

                  <th className="px-5 py-3 text-left font-medium">
                    Parent
                  </th>

                  <th className="px-5 py-3 text-left font-medium">
                    Product
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
                {categories.map(
                  (category) => (
                    <CategoryRows
                      key={category.id}
                      category={category}
                      deletingId={deletingId}
                      onDelete={handleDelete}
                    />
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

/* -------------------------------------------------------------------------- */
/* Category Rows                                                              */
/* -------------------------------------------------------------------------- */

function CategoryRows({
  category,
  deletingId,
  onDelete,
}: {
  category: AdminCategory;
  deletingId: string | null;

  onDelete: (
    id: string,
    name: string
  ) => void;
}) {
  return (
    <>
      {/* ================================================================== */}
      {/* Parent Category                                                    */}
      {/* ================================================================== */}

      <tr className="border-t border-gray-100 bg-white">
        {/* Name */}

        <td className="px-5 py-3">
          <div className="flex items-center gap-3">
            {/* Image */}

            {category.image ? (
              <img
                src={category.image}
                alt={category.name}
                className="h-10 w-10 rounded-md border border-gray-100 object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-100 text-xs font-semibold text-gray-500">
                {category.name
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}

            <div>
              <p className="font-semibold text-gray-900">
                {category.name}
              </p>

              <p className="text-xs text-gray-400">
                /{category.slug}
              </p>
            </div>
          </div>
        </td>

        {/* Type */}

        <td className="px-5 py-3">
          <span className="inline-flex rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-600">
            Parent
          </span>
        </td>

        {/* Parent */}

        <td className="px-5 py-3 text-gray-400">
          —
        </td>

        {/* Products */}

        <td className="px-5 py-3 text-gray-600">
          {category._count.products}
        </td>

        {/* Status */}

        <td className="px-5 py-3">
          {category.isActive ? (
            <span className="inline-flex rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-600">
              Active
            </span>
          ) : (
            <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">
              Inactive
            </span>
          )}
        </td>

        {/* Action */}

        <td className="px-5 py-3">
          <button
            type="button"
            disabled={
              deletingId ===
              category.id
            }
            onClick={() =>
              onDelete(
                category.id,
                category.name
              )
            }
            className="text-sm font-medium text-sale transition hover:underline disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deletingId ===
            category.id
              ? "মুছছে..."
              : "মুছুন"}
          </button>
        </td>
      </tr>

      {/* ================================================================== */}
      {/* Subcategories                                                      */}
      {/* ================================================================== */}

      {category.children.map(
        (child) => (
          <tr
            key={child.id}
            className="border-t border-gray-50 bg-gray-50/40"
          >
            {/* Name */}

            <td className="px-5 py-3">
              <div className="flex items-center gap-3 pl-7">
                <span className="text-lg text-gray-300">
                  └─
                </span>

                {child.image ? (
                  <img
                    src={child.image}
                    alt={child.name}
                    className="h-9 w-9 rounded-md border border-gray-100 object-cover"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gray-100 text-xs font-semibold text-gray-400">
                    {child.name
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}

                <div>
                  <p className="font-medium text-gray-800">
                    {child.name}
                  </p>

                  <p className="text-xs text-gray-400">
                    /{child.slug}
                  </p>
                </div>
              </div>
            </td>

            {/* Type */}

            <td className="px-5 py-3">
              <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                Subcategory
              </span>
            </td>

            {/* Parent */}

            <td className="px-5 py-3 font-medium text-gray-600">
              {category.name}
            </td>

            {/* Products */}

            <td className="px-5 py-3 text-gray-600">
              {child._count.products}
            </td>

            {/* Status */}

            <td className="px-5 py-3">
              {child.isActive ? (
                <span className="inline-flex rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-600">
                  Active
                </span>
              ) : (
                <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">
                  Inactive
                </span>
              )}
            </td>

            {/* Action */}

            <td className="px-5 py-3">
              <button
                type="button"
                disabled={
                  deletingId ===
                  child.id
                }
                onClick={() =>
                  onDelete(
                    child.id,
                    child.name
                  )
                }
                className="text-sm font-medium text-sale transition hover:underline disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deletingId ===
                child.id
                  ? "মুছছে..."
                  : "মুছুন"}
              </button>
            </td>
          </tr>
        )
      )}
    </>
  );
}

