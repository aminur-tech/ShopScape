"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "@/lib/auth-context";

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

  ownProductCount?: number;
  subcategoryProductCount?: number;
  totalProductCount?: number;
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function getCategoryTotalProducts(
  category: AdminCategory
) {
  if (
    typeof category.totalProductCount ===
    "number"
  ) {
    return category.totalProductCount;
  }

  const ownProducts =
    category._count?.products ?? 0;

  const subcategoryProducts =
    category.children?.reduce(
      (total, child) =>
        total +
        (child._count?.products ?? 0),
      0
    ) ?? 0;

  return (
    ownProducts +
    subcategoryProducts
  );
}

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

  /*
   * Stores expanded category IDs.
   *
   * Empty Set = all collapsed.
   */
  const [
    expandedCategories,
    setExpandedCategories,
  ] = useState<Set<string>>(
    new Set()
  );

  /* ------------------------------------------------------------------------ */
  /* Toggle Category                                                          */
  /* ------------------------------------------------------------------------ */

  function toggleCategory(
    categoryId: string
  ) {
    setExpandedCategories(
      (previous) => {
        const next = new Set(
          previous
        );

        if (next.has(categoryId)) {
          next.delete(categoryId);
        } else {
          next.add(categoryId);
        }

        return next;
      }
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Expand / Collapse All                                                    */
  /* ------------------------------------------------------------------------ */

  const hasExpandedCategory =
    expandedCategories.size > 0;

  function toggleAllCategories() {
    if (hasExpandedCategory) {
      setExpandedCategories(
        new Set()
      );
      return;
    }

    const ids = categories
      .filter(
        (category) =>
          category.children.length > 0
      )
      .map(
        (category) => category.id
      );

    setExpandedCategories(
      new Set(ids)
    );
  }

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
        }>(
          "/admin/categories",
          {
            token,
          }
        );

      setCategories(
        data.categories ?? []
      );

      /*
       * After refresh everything
       * becomes collapsed.
       */
      setExpandedCategories(
        new Set()
      );
    } catch (err) {
      console.error(
        "Categories error:",
        err
      );

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
  /* Add Category                                                             */
  /* ------------------------------------------------------------------------ */

  async function handleAdd(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!token) {
      setError(
        "Authentication required"
      );
      return;
    }

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
      setError("");
      setSuccess("");

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

      window.setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error(
        "Add category error:",
        err
      );

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
  /* Delete Category                                                          */
  /* ------------------------------------------------------------------------ */

  async function handleDelete(
    id: string,
    categoryName: string
  ) {
    if (!token) return;

    const confirmed =
      window.confirm(
        `"${categoryName}" ক্যাটাগরিটি মুছে ফেলতে চান?`
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

      window.setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error(
        "Delete category error:",
        err
      );

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
  /* Statistics                                                               */
  /* ------------------------------------------------------------------------ */

  const statistics = useMemo(() => {
    const subcategories =
      categories.reduce(
        (total, category) =>
          total +
          (category.children?.length ??
            0),
        0
      );

    /*
     * Main category total already contains
     * its own + child products.
     *
     * Do not add child products again.
     */

    const products =
      categories.reduce(
        (total, category) =>
          total +
          getCategoryTotalProducts(
            category
          ),
        0
      );

    return {
      categories:
        categories.length,
      subcategories,
      products,
    };
  }, [categories]);

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="w-full space-y-5 pb-24 sm:space-y-6 lg:pb-10">
      {/* ================================================================== */}
      {/* Header                                                             */}
      {/* ================================================================== */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
            ক্যাটাগরি
          </h1>

          <p className="mt-1 text-xs text-gray-500 sm:text-sm">
            Main category এবং subcategory
            পরিচালনা করুন
          </p>
        </div>

        <button
          type="button"
          onClick={loadCategories}
          disabled={loading}
          className="inline-flex w-full items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {loading
            ? "লোড হচ্ছে..."
            : "Refresh"}
        </button>
      </div>

      {/* ================================================================== */}
      {/* Statistics                                                         */}
      {/* ================================================================== */}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <StatCard
          label="Main Category"
          value={statistics.categories}
          description="মূল ক্যাটাগরি"
        />

        <StatCard
          label="Subcategory"
          value={
            statistics.subcategories
          }
          description="সকল সাবক্যাটাগরি"
        />

        <StatCard
          label="মোট Product"
          value={statistics.products}
          description="সব ক্যাটাগরির মোট product"
        />
      </div>

      {/* ================================================================== */}
      {/* Add Form                                                           */}
      {/* ================================================================== */}

      <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-4 py-4 sm:px-5">
          <h2 className="text-base font-semibold text-gray-900">
            নতুন ক্যাটাগরি যোগ করুন
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            Parent Category ফাঁকা রাখলে
            এটি একটি মূল ক্যাটাগরি হবে।
          </p>
        </div>

        <form
          onSubmit={handleAdd}
          className="grid grid-cols-1 gap-4 p-4 sm:p-5 md:grid-cols-[220px_minmax(0,1fr)_auto]"
        >
          {/* Parent */}

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
              className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
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
              className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>

          {/* Submit */}

          <div className="flex items-end">
            <button
              type="submit"
              disabled={submitting}
              className="h-11 w-full rounded-lg bg-brand-500 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
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
          <div className="mx-4 mb-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 sm:mx-5">
            {error}
          </div>
        )}

        {/* Success */}

        {success && (
          <div className="mx-4 mb-4 rounded-lg border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-600 sm:mx-5">
            {success}
          </div>
        )}
      </section>

      {/* ================================================================== */}
      {/* Category List                                                       */}
      {/* ================================================================== */}

      <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        {/* Header */}

        <div className="flex flex-col gap-3 border-b border-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              সকল ক্যাটাগরি
            </h2>

            <p className="mt-0.5 text-xs text-gray-500">
              Main category expand করলে
              subcategory দেখা যাবে
            </p>
          </div>

          {!loading &&
            categories.length > 0 && (
              <button
                type="button"
                onClick={
                  toggleAllCategories
                }
                className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                {hasExpandedCategory
                  ? "সব Collapse"
                  : "সব Expand"}
              </button>
            )}
        </div>

        {/* Loading */}

        {loading ? (
          <CategorySkeleton />
        ) : categories.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* ========================================================== */}
            {/* DESKTOP                                                     */}
            {/* ========================================================== */}

            <div className="hidden lg:block">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <th className="px-5 py-3">
                      ক্যাটাগরি
                    </th>

                    <th className="px-5 py-3">
                      ধরন
                    </th>

                    <th className="px-5 py-3">
                      Parent
                    </th>

                    <th className="px-5 py-3">
                      মোট Product
                    </th>

                    <th className="px-5 py-3">
                      Status
                    </th>

                    <th className="px-5 py-3 text-right">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {categories.map(
                    (category) => (
                      <DesktopCategoryGroup
                        key={category.id}
                        category={category}
                        expanded={expandedCategories.has(
                          category.id
                        )}
                        onToggle={
                          toggleCategory
                        }
                        deletingId={
                          deletingId
                        }
                        onDelete={
                          handleDelete
                        }
                      />
                    )
                  )}
                </tbody>
              </table>
            </div>

            {/* ========================================================== */}
            {/* MOBILE / TABLET                                            */}
            {/* ========================================================== */}

            <div className="divide-y divide-gray-100 lg:hidden">
              {categories.map(
                (category) => (
                  <MobileCategoryGroup
                    key={category.id}
                    category={category}
                    expanded={expandedCategories.has(
                      category.id
                    )}
                    onToggle={
                      toggleCategory
                    }
                    deletingId={
                      deletingId
                    }
                    onDelete={
                      handleDelete
                    }
                  />
                )
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

/* ========================================================================== */
/* Stat Card                                                                  */
/* ========================================================================== */

function StatCard({
  label,
  value,
  description,
}: {
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-gray-500 sm:text-sm">
          {label}
        </p>

        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-sm font-bold text-brand-600">
          #
        </span>
      </div>

      <p className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
        {value.toLocaleString("en-BD")}
      </p>

      <p className="mt-1 text-xs text-gray-400">
        {description}
      </p>
    </div>
  );
}

/* ========================================================================== */
/* Desktop Category Group                                                     */
/* ========================================================================== */

function DesktopCategoryGroup({
  category,
  expanded,
  onToggle,
  deletingId,
  onDelete,
}: {
  category: AdminCategory;
  expanded: boolean;
  onToggle: (
    id: string
  ) => void;
  deletingId: string | null;
  onDelete: (
    id: string,
    name: string
  ) => void;
}) {
  const totalProducts =
    getCategoryTotalProducts(
      category
    );

  const hasChildren =
    category.children.length > 0;

  return (
    <>
      {/* Main Category */}

      <tr
        className={[
          "border-t border-gray-100 transition",
          expanded
            ? "bg-brand-50/30"
            : "bg-white hover:bg-gray-50",
        ].join(" ")}
      >
        {/* Category */}

        <td className="px-5 py-4">
          <div className="flex items-center gap-3">
            {hasChildren ? (
              <button
                type="button"
                onClick={() =>
                  onToggle(
                    category.id
                  )
                }
                aria-label={
                  expanded
                    ? "Collapse subcategories"
                    : "Expand subcategories"
                }
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 shadow-sm transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-600"
              >
                <span
                  className={[
                    "text-sm transition-transform duration-200",
                    expanded
                      ? "rotate-90"
                      : "",
                  ].join(" ")}
                >
                  ▶
                </span>
              </button>
            ) : (
              <span className="h-8 w-8 shrink-0" />
            )}

            <CategoryIdentity
              category={category}
            />
          </div>
        </td>

        {/* Type */}

        <td className="px-5 py-4">
          <TypeBadge type="Parent" />
        </td>

        {/* Parent */}

        <td className="px-5 py-4 text-gray-400">
          —
        </td>

        {/* Product */}

        <td className="px-5 py-4">
          <ProductCount
            count={totalProducts}
            hasChildren={hasChildren}
          />
        </td>

        {/* Status */}

        <td className="px-5 py-4">
          <StatusBadge
            active={category.isActive}
          />
        </td>

        {/* Action */}

        <td className="px-5 py-4 text-right">
          <DeleteButton
            id={category.id}
            name={category.name}
            deletingId={deletingId}
            onDelete={onDelete}
          />
        </td>
      </tr>

      {/* Subcategories */}

      {expanded &&
        category.children.map(
          (child) => (
            <tr
              key={child.id}
              className="border-t border-gray-50 bg-gray-50/50"
            >
              <td className="px-5 py-3">
                <div className="flex items-center gap-3 pl-14">
                  <span className="text-gray-300">
                    └─
                  </span>

                  <CategoryImage
                    image={
                      child.image
                    }
                    name={
                      child.name
                    }
                    small
                  />

                  <div className="min-w-0">
                    <p className="truncate font-medium text-gray-800">
                      {child.name}
                    </p>

                    <p className="truncate text-xs text-gray-400">
                      /{child.slug}
                    </p>
                  </div>
                </div>
              </td>

              <td className="px-5 py-3">
                <TypeBadge type="Subcategory" />
              </td>

              <td className="px-5 py-3 font-medium text-gray-600">
                {category.name}
              </td>

              <td className="px-5 py-3 font-semibold text-gray-700">
                {child._count.products.toLocaleString(
                  "en-BD"
                )}
              </td>

              <td className="px-5 py-3">
                <StatusBadge
                  active={
                    child.isActive
                  }
                />
              </td>

              <td className="px-5 py-3 text-right">
                <DeleteButton
                  id={child.id}
                  name={
                    child.name
                  }
                  deletingId={
                    deletingId
                  }
                  onDelete={
                    onDelete
                  }
                />
              </td>
            </tr>
          )
        )}
    </>
  );
}

/* ========================================================================== */
/* Mobile Category Group                                                      */
/* ========================================================================== */

function MobileCategoryGroup({
  category,
  expanded,
  onToggle,
  deletingId,
  onDelete,
}: {
  category: AdminCategory;
  expanded: boolean;
  onToggle: (
    id: string
  ) => void;
  deletingId: string | null;
  onDelete: (
    id: string,
    name: string
  ) => void;
}) {
  const totalProducts =
    getCategoryTotalProducts(
      category
    );

  const hasChildren =
    category.children.length > 0;

  return (
    <div className="p-4 sm:p-5">
      {/* ================================================================ */}
      {/* Main Category                                                     */}
      {/* ================================================================ */}

      <div
        className={[
          "rounded-xl border p-3 transition-all",
          expanded
            ? "border-brand-100 bg-brand-50/30"
            : "border-gray-100 bg-white",
        ].join(" ")}
      >
        <div className="flex items-center gap-3">
          {/* Expand */}

          {hasChildren ? (
            <button
              type="button"
              onClick={() =>
                onToggle(
                  category.id
                )
              }
              aria-label={
                expanded
                  ? "Collapse subcategories"
                  : "Expand subcategories"
              }
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 shadow-sm transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-600"
            >
              <span
                className={[
                  "text-sm transition-transform duration-200",
                  expanded
                    ? "rotate-90"
                    : "",
                ].join(" ")}
              >
                ▶
              </span>
            </button>
          ) : (
            <span className="h-9 w-9 shrink-0" />
          )}

          {/* Image */}

          <CategoryImage
            image={category.image}
            name={category.name}
          />

          {/* Name */}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-sm font-semibold text-gray-900">
                {category.name}
              </h3>

              <TypeBadge type="Parent" />
            </div>

            <p className="mt-1 truncate text-xs text-gray-400">
              /{category.slug}
            </p>
          </div>

          <StatusBadge
            active={category.isActive}
          />
        </div>

        {/* Stats */}

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-gray-50 p-2.5">
            <p className="text-[10px] text-gray-400">
              মোট Product
            </p>

            <p className="mt-0.5 text-base font-bold text-gray-900">
              {totalProducts.toLocaleString(
                "en-BD"
              )}
            </p>
          </div>

          <div className="rounded-lg bg-gray-50 p-2.5">
            <p className="text-[10px] text-gray-400">
              Subcategory
            </p>

            <p className="mt-0.5 text-base font-bold text-gray-900">
              {category.children.length.toLocaleString(
                "en-BD"
              )}
            </p>
          </div>
        </div>

        {/* Bottom */}

        <div className="mt-3 flex items-center justify-between">
          {hasChildren ? (
            <button
              type="button"
              onClick={() =>
                onToggle(
                  category.id
                )
              }
              className="text-xs font-semibold text-brand-600"
            >
              {expanded
                ? "Subcategory লুকান"
                : `${category.children.length}টি Subcategory দেখুন`}
            </button>
          ) : (
            <span className="text-xs text-gray-400">
              কোনো Subcategory নেই
            </span>
          )}

          <DeleteButton
            id={category.id}
            name={category.name}
            deletingId={deletingId}
            onDelete={onDelete}
          />
        </div>
      </div>

      {/* ================================================================ */}
      {/* Subcategories                                                     */}
      {/* ================================================================ */}

      {expanded &&
        hasChildren && (
          <div className="mt-2 space-y-2 pl-4 sm:pl-8">
            {category.children.map(
              (child) => (
                <div
                  key={child.id}
                  className="rounded-xl border border-gray-100 bg-gray-50/70 p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-gray-300">
                      └─
                    </span>

                    <CategoryImage
                      image={
                        child.image
                      }
                      name={
                        child.name
                      }
                      small
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold text-gray-800">
                          {child.name}
                        </p>

                        <StatusBadge
                          active={
                            child.isActive
                          }
                        />
                      </div>

                      <p className="mt-0.5 truncate text-[11px] text-gray-400">
                        /{child.slug}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">
                        {child._count.products.toLocaleString(
                          "en-BD"
                        )}
                      </p>

                      <p className="text-[10px] text-gray-400">
                        Product
                      </p>
                    </div>
                  </div>

                  <div className="mt-2 flex justify-end">
                    <DeleteButton
                      id={child.id}
                      name={
                        child.name
                      }
                      deletingId={
                        deletingId
                      }
                      onDelete={
                        onDelete
                      }
                    />
                  </div>
                </div>
              )
            )}
          </div>
        )}
    </div>
  );
}

/* ========================================================================== */
/* Category Identity                                                          */
/* ========================================================================== */

function CategoryIdentity({
  category,
}: {
  category: AdminCategory;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <CategoryImage
        image={category.image}
        name={category.name}
      />

      <div className="min-w-0">
        <p className="truncate font-semibold text-gray-900">
          {category.name}
        </p>

        <p className="truncate text-xs text-gray-400">
          /{category.slug}
        </p>
      </div>
    </div>
  );
}

/* ========================================================================== */
/* Category Image                                                             */
/* ========================================================================== */

function CategoryImage({
  image,
  name,
  small = false,
}: {
  image: string | null;
  name: string;
  small?: boolean;
}) {
  const size = small
    ? "h-9 w-9"
    : "h-11 w-11";

  if (image) {
    return (
      <img
        src={image}
        alt={name}
        className={`${size} shrink-0 rounded-lg border border-gray-100 object-cover`}
      />
    );
  }

  return (
    <div
      className={`${size} flex shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xs font-bold text-gray-500`}
    >
      {name
        .charAt(0)
        .toUpperCase()}
    </div>
  );
}

/* ========================================================================== */
/* Product Count                                                              */
/* ========================================================================== */

function ProductCount({
  count,
  hasChildren,
}: {
  count: number;
  hasChildren: boolean;
}) {
  return (
    <div>
      <span className="font-semibold text-gray-900">
        {count.toLocaleString(
          "en-BD"
        )}
      </span>

      {hasChildren && (
        <p className="mt-0.5 text-[10px] text-gray-400">
          সব Subcategory included
        </p>
      )}
    </div>
  );
}

/* ========================================================================== */
/* Type Badge                                                                 */
/* ========================================================================== */

function TypeBadge({
  type,
}: {
  type:
    | "Parent"
    | "Subcategory";
}) {
  const isParent =
    type === "Parent";

  return (
    <span
      className={[
        "inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-semibold",
        isParent
          ? "bg-brand-50 text-brand-600"
          : "bg-gray-100 text-gray-600",
      ].join(" ")}
    >
      {type}
    </span>
  );
}

/* ========================================================================== */
/* Status Badge                                                               */
/* ========================================================================== */

function StatusBadge({
  active,
}: {
  active: boolean;
}) {
  return active ? (
    <span className="inline-flex whitespace-nowrap rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-semibold text-green-600">
      Active
    </span>
  ) : (
    <span className="inline-flex whitespace-nowrap rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-semibold text-gray-500">
      Inactive
    </span>
  );
}

/* ========================================================================== */
/* Delete Button                                                              */
/* ========================================================================== */

function DeleteButton({
  id,
  name,
  deletingId,
  onDelete,
}: {
  id: string;
  name: string;
  deletingId: string | null;
  onDelete: (
    id: string,
    name: string
  ) => void;
}) {
  const deleting =
    deletingId === id;

  return (
    <button
      type="button"
      disabled={deleting}
      onClick={() =>
        onDelete(id, name)
      }
      className="text-xs font-medium text-sale transition hover:underline disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
    >
      {deleting
        ? "মুছছে..."
        : "মুছুন"}
    </button>
  );
}

/* ========================================================================== */
/* Loading Skeleton                                                           */
/* ========================================================================== */

function CategorySkeleton() {
  return (
    <div className="divide-y divide-gray-100">
      {[1, 2, 3, 4].map(
        (item) => (
          <div
            key={item}
            className="p-4 sm:p-5"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 animate-pulse rounded-lg bg-gray-100" />

              <div className="h-11 w-11 animate-pulse rounded-lg bg-gray-100" />

              <div className="flex-1">
                <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />

                <div className="mt-2 h-3 w-20 animate-pulse rounded bg-gray-100" />
              </div>
            </div>

            <div className="mt-3 h-14 animate-pulse rounded-lg bg-gray-50" />
          </div>
        )
      )}
    </div>
  );
}

/* ========================================================================== */
/* Empty State                                                                */
/* ========================================================================== */

function EmptyState() {
  return (
    <div className="px-5 py-14 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
        🗂️
      </div>

      <h3 className="mt-4 text-sm font-semibold text-gray-800">
        কোনো ক্যাটাগরি নেই
      </h3>

      <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-gray-500">
        উপরের form থেকে প্রথম
        ক্যাটাগরি যোগ করুন।
      </p>
    </div>
  );
}