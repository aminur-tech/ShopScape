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

  _count?: {
    products?: number;
  };
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
/* Get Products By Category                                                   */
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
  /* ------------------------------------------------------------------------ */
  /* Categories                                                               */
  /* ------------------------------------------------------------------------ */

  const categories =
    await getCategories();

  /* ------------------------------------------------------------------------ */
  /* Category Products                                                        */
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
  /* Only Available Sections                                                  */
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
      {/* CATEGORY SIDEBAR                                                    */}
      {/* ================================================================== */}

      <CategorySidebar />

      {/* ================================================================== */}
      {/* MAIN CONTENT                                                        */}
      {/* ================================================================== */}

      <main
        className="
          min-w-0
          flex-1
          transition-all
          duration-300
        "
      >
        {/* ================================================================= */}
        {/* BANNER                                                            */}
        {/* ================================================================= */}

        <BannerCarousel />

        {/* ================================================================= */}
        {/* PRODUCT SECTIONS                                                  */}
        {/* ================================================================= */}

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
              categorySlug={category.slug}
              products={products}
              pagination={pagination}
              subcategories={
                subcategories
              }
            />
          ),
        )}

        {/* ================================================================= */}
        {/* EMPTY STATE                                                       */}
        {/* ================================================================= */}

        {availableSections.length ===
          0 && (
          <div
            className="
              mt-8
              rounded-2xl
              border
              border-dashed
              border-gray-300
              bg-gray-50
              px-4
              py-10
              text-center
              sm:mt-10
              sm:py-12
            "
          >
            <div
              className="
                mx-auto
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-full
                bg-white
                shadow-sm
              "
            >
              <svg
                className="h-6 w-6 text-gray-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </div>

            <p
              className="
                mt-4
                text-sm
                font-medium
                text-gray-600
                sm:text-base
              "
            >
              এখনো কোনো প্রোডাক্ট যোগ
              করা হয়নি।
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