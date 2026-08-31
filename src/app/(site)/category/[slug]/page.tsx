import Link from "next/link";

import { CategorySidebar } from "@/components/site/CategorySidebar";
import { ProductCard } from "@/components/site/ProductCard";

import { apiFetch } from "@/lib/api";

import type {
  Category,
  Product,
} from "@/lib/types";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type ProductPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type ProductsResponse = {
  products: Product[];
  pagination?: ProductPagination;
};

/* -------------------------------------------------------------------------- */
/* Find Category By Slug                                                      */
/* -------------------------------------------------------------------------- */

function findCategoryBySlug(
  categories: Category[],
  slug: string,
): Category | undefined {
  for (const category of categories) {
    if (category.slug === slug) {
      return category;
    }

    if (
      category.children &&
      category.children.length > 0
    ) {
      const found =
        findCategoryBySlug(
          category.children,
          slug,
        );

      if (found) {
        return found;
      }
    }
  }

  return undefined;
}

/* -------------------------------------------------------------------------- */
/* Category Page                                                              */
/* -------------------------------------------------------------------------- */

export default async function CategoryPage({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}) {
  const { slug } = await params;

  /* ------------------------------------------------------------------------ */
  /* Categories                                                               */
  /* ------------------------------------------------------------------------ */

  const categoriesResponse =
    await apiFetch<{
      categories: Category[];
    }>("/categories").catch(() => ({
      categories: [],
    }));

  const categories =
    categoriesResponse.categories ?? [];

  /* ------------------------------------------------------------------------ */
  /* Current Category                                                         */
  /* ------------------------------------------------------------------------ */

  const category =
    findCategoryBySlug(
      categories,
      slug,
    );

  /* ------------------------------------------------------------------------ */
  /* Products                                                                 */
  /* ------------------------------------------------------------------------ */

  const productsResponse =
    await apiFetch<ProductsResponse>(
      `/products?category=${encodeURIComponent(
        slug,
      )}&page=1&limit=48`,
    ).catch(() => ({
      products: [],
      pagination: {
        page: 1,
        limit: 48,
        total: 0,
        totalPages: 0,
      },
    }));

  const products =
    productsResponse.products ?? [];

  const pagination =
    productsResponse.pagination;

  const totalProducts =
    pagination?.total ??
    products.length;

  /* ------------------------------------------------------------------------ */
  /* Category Name                                                            */
  /* ------------------------------------------------------------------------ */

  const categoryName =
    category?.name ?? "ক্যাটাগরি";

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <div
      className="
        flex
        w-full
        items-start
        gap-4
        lg:gap-6
      "
    >
      {/* ================================================================== */}
      {/* Sidebar                                                             */}
      {/* ================================================================== */}

      <CategorySidebar
        currentSlug={slug}
      />

      {/* ================================================================== */}
      {/* Main Content                                                        */}
      {/* ================================================================== */}

      <main className="min-w-0 flex-1">
        {/* ---------------------------------------------------------------- */}
        {/* Back Home                                                         */}
        {/* ---------------------------------------------------------------- */}

        <div className="mb-4">
          <Link
            href="/"
            className="
              inline-flex
              min-h-9
              items-center
              gap-1.5
              rounded-lg
              border
              border-gray-200
              bg-white
              px-3
              py-2
              text-xs
              font-semibold
              text-gray-700
              shadow-sm
              transition
              hover:border-brand-400
              hover:bg-brand-50
              hover:text-brand-600
              focus:outline-none
              focus:ring-2
              focus:ring-brand-500/20
              sm:text-sm
            "
          >
            ← হোমে ফিরে যান
          </Link>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Header                                                            */}
        {/* ---------------------------------------------------------------- */}

        <div
          className="
            mb-5
            border-b
            border-gray-200
            pb-4
          "
        >
          <div
            className="
              flex
              items-end
              justify-between
              gap-3
            "
          >
            <div className="min-w-0">
              <h1
                className="
                  truncate
                  text-xl
                  font-bold
                  text-gray-900
                  sm:text-2xl
                "
              >
                {categoryName}
              </h1>

              <p
                className="
                  mt-1
                  text-xs
                  text-gray-500
                  sm:text-sm
                "
              >
                মোট {totalProducts}টি
                প্রোডাক্ট
              </p>
            </div>

            {/* Back Home - Desktop */}
            <Link
              href="/"
              className="
                hidden
                shrink-0
                text-sm
                font-semibold
                text-brand-600
                hover:text-brand-700
                hover:underline
                sm:block
              "
            >
              হোম →
            </Link>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Products                                                          */}
        {/* ---------------------------------------------------------------- */}

        {products.length === 0 ? (
          <div
            className="
              rounded-xl
              border
              border-dashed
              border-gray-300
              bg-gray-50
              px-6
              py-12
              text-center
            "
          >
            <p className="text-sm text-gray-500 sm:text-base">
              এই ক্যাটাগরিতে এখনো কোনো
              প্রোডাক্ট নেই।
            </p>

            <Link
              href="/"
              className="
                mt-4
                inline-flex
                items-center
                rounded-lg
                bg-brand-500
                px-4
                py-2
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-brand-600
              "
            >
              ← হোমে ফিরে যান
            </Link>
          </div>
        ) : (
          <div
            className="
              grid
              grid-cols-2
              gap-3

              sm:grid-cols-3
              sm:gap-4

              lg:grid-cols-4
              lg:gap-5

              xl:grid-cols-5
              xl:gap-5
            "
          >
            {products.map(
              (product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ),
            )}
          </div>
        )}
      </main>
    </div>
  );
}