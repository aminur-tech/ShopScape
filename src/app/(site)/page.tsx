import { BannerCarousel } from "@/components/site/BannerCarousel";
import { CategorySidebar } from "@/components/site/CategorySidebar";
import { ProductSection } from "@/components/site/ProductSection";

import { apiFetch } from "@/lib/api";

import type {
  Category,
  Product,
} from "@/lib/types";

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const PRODUCTS_PER_PAGE = 8;

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type CategoryWithChildren = Category & {
  children?: CategoryWithChildren[];
};

type ProductPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type CategoryProducts = {
  products: Product[];
  pagination: ProductPagination;
};

/* -------------------------------------------------------------------------- */
/* Get Categories                                                             */
/* -------------------------------------------------------------------------- */

async function getCategories(): Promise<
  CategoryWithChildren[]
> {
  try {
    const data =
      await apiFetch<{
        categories: CategoryWithChildren[];
      }>("/categories");

    return data.categories ?? [];
  } catch {
    return [];
  }
}

/* -------------------------------------------------------------------------- */
/* Get Products                                                               */
/* -------------------------------------------------------------------------- */

async function getProductsByCategory(
  slug: string,
): Promise<CategoryProducts> {
  try {
    const data =
      await apiFetch<{
        products: Product[];
        pagination?: ProductPagination;
      }>(
        `/products?category=${encodeURIComponent(
          slug,
        )}&page=1&limit=${PRODUCTS_PER_PAGE}`,
      );

    const products =
      data.products ?? [];

    return {
      products,

      pagination:
        data.pagination ?? {
          page: 1,
          limit: PRODUCTS_PER_PAGE,
          total: products.length,
          totalPages: products.length
            ? Math.ceil(
                products.length /
                  PRODUCTS_PER_PAGE,
              )
            : 0,
        },
    };
  } catch {
    return {
      products: [],

      pagination: {
        page: 1,
        limit: PRODUCTS_PER_PAGE,
        total: 0,
        totalPages: 0,
      },
    };
  }
}

/* -------------------------------------------------------------------------- */
/* Home Page                                                                  */
/* -------------------------------------------------------------------------- */

export default async function HomePage() {
  const categories =
    await getCategories();

  /* ------------------------------------------------------------------------ */
  /* Load Category Products                                                   */
  /* ------------------------------------------------------------------------ */

  const sections =
    await Promise.all(
      categories.map(
        async (category) => {
          const result =
            await getProductsByCategory(
              category.slug,
            );

          return {
            category,

            products:
              result.products,

            pagination:
              result.pagination,

            subcategories:
              category.children ?? [],
          };
        },
      ),
    );

  /* ------------------------------------------------------------------------ */
  /* Only Categories With Products                                            */
  /* ------------------------------------------------------------------------ */

  const availableSections =
    sections.filter(
      (section) =>
        section.products.length > 0,
    );

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

      <CategorySidebar />

      {/* ================================================================== */}
      {/* Main Content                                                        */}
      {/* ================================================================== */}

      <main className="min-w-0 flex-1">
        {/* ---------------------------------------------------------------- */}
        {/* Banner                                                            */}
        {/* ---------------------------------------------------------------- */}

        <BannerCarousel />

        {/* ---------------------------------------------------------------- */}
        {/* Category Sections                                                 */}
        {/* ---------------------------------------------------------------- */}

        {availableSections.map(
          ({
            category,
            products,
            pagination,
            subcategories,
          }) => (
            <ProductSection
              key={category.id}
              title={category.name}
              categorySlug={
                category.slug
              }
              products={products}
              pagination={
                pagination
              }
              subcategories={
                subcategories
              }
            />
          ),
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Empty State                                                       */}
        {/* ---------------------------------------------------------------- */}

        {availableSections.length ===
          0 && (
          <div
            className="
              mt-10
              rounded-xl
              border
              border-dashed
              border-gray-300
              bg-gray-50
              px-4
              py-10
              text-center
            "
          >
            <p
              className="
                text-sm
                text-gray-500
                sm:text-base
              "
            >
              এখনো কোনো প্রোডাক্ট
              যোগ করা হয়নি।
            </p>

            <p
              className="
                mt-1
                text-xs
                text-gray-400
                sm:text-sm
              "
            >
              অ্যাডমিন প্যানেল থেকে
              প্রোডাক্ট যোগ করুন।
            </p>
          </div>
        )}
      </main>
    </div>
  );
}